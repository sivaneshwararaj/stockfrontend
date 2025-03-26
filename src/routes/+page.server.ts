import { error, fail, redirect } from "@sveltejs/kit";
import { validateData } from "$lib/utils";
import { loginUserSchema, registerUserSchema } from "$lib/schemas";
import fs from 'fs';
import path from 'path';
import { env } from '$env/dynamic/private';

// Helper function to get subreddits -  moved OUTSIDE of load
function getSubreddits() {
  const subreddits = [];
  try {
    const filePath = path.join(process.cwd(), 'src/data', 'subreddit.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rows = fileContent.split('\n');

    for (let i = 1; i < rows.length; i++) { // Assuming the first row is a header
      const row = rows[i].trim();
      if (row) {
        subreddits.push(row);
      }
    }
  } catch (err) {
    console.error("Error reading or parsing subreddit.csv:", err);
    // Consider re-throwing or handling more gracefully
  }
  console.log("getSubreddits:", subreddits); // Debugging
  return subreddits;
}

export const load = async ({ locals }) => {
  const { apiKey, apiURL, CHARTBASEKEY } = locals;

  const getDashboard = async () => {
    // Dashboard fetch logic (currently returns an empty array)
    return [];
  };

  return {
    getDashboard: await getDashboard(),
    subreddits: getSubreddits(), // Call getSubreddits here for the load function
  };
};

async function checkDisposableEmail(email) {
  const url = `https://disposable.debounce.io/?email=${encodeURIComponent(email)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const output = (await response.json())?.disposable ?? false;
  return output;
}

function convertTimesToUnix(timeString) {
  const now = Math.floor(Date.now() / 1000);
  let givenTimeTimestamp = null;

  const match = timeString.match(/^(\d+)\s*(Hours?|Days?|Week)$/i);

  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    let seconds = 0;

    if (unit.startsWith("hour")) {
      seconds = value * 3600;
    } else if (unit.startsWith("day")) {
      seconds = value * 86400;
    } else if (unit === "week") {
      seconds = value * 604800;
    }

    let givenTimeTimestamp = now - seconds; // Calculate past timestamp

    return {
      currentTime: now,
      givenTime: givenTimeTimestamp,
      givenTimeString: timeString, // Include the original string
    };
  } else {
    return {
      currentTime: now,
      givenTime: null, // Indicate invalid input
      givenTimeString: timeString,
    }
  }
}

export const actions = {
  login: async ({ request, locals }) => {
    // ... (login logic - unchanged)
    const { formData, errors } = await validateData(
      await request.formData(),
      loginUserSchema,
    );

    if (errors) {
      return fail(400, {
        data: formData,
        errors: errors.fieldErrors,
      });
    }

    try {
      await locals.pb
        .collection("users")
        .authWithPassword(formData.email, formData.password);

    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    redirect(301, "/pricing");
  },

  register: async ({ locals, request }) => {
    // ... (register logic - unchanged)
    const { formData, errors } = await validateData(
      await request.formData(),
      registerUserSchema,
    );
    if (errors) {
      return fail(400, {
        data: formData,
        errors: errors.fieldErrors,
      });
    }
    const isEmailDisposable = await checkDisposableEmail(formData?.email);

    if (isEmailDisposable === "true") {
      error(400, "Disposable Email Addresses not allowed!");
    }

    //let username = generateUsername(formData.name.split(' ').join('')).toLowerCase();

    try {
      await locals.pb.collection("users").create(formData);
      /*
    await locals.pb?.collection('users').update(
            newUser?.id, {
              'freeTrial' : true,
              'tier': 'Pro', //Give new users a free trial for the Pro Subscription
        });
    */

      await locals.pb.collection("users").requestVerification(formData.email);
    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    try {
      await locals.pb
        .collection("users")
        .authWithPassword(formData.email, formData.password);

      /*
      if (!locals.pb?.authStore?.model?.verified) {
        locals.pb.authStore.clear();
        return {
          notVerified: true,
        };
      }
      */
    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    redirect(301, "/pricing");
  },

  oauth2: async ({ url, locals, request, cookies }) => {
    // ... (oauth2 logic - unchanged)
    const authMethods = (await locals?.pb
      ?.collection("users")
      ?.listAuthMethods())?.oauth2;


    const data = await request?.formData();
    const providerSelected = data?.get("provider");

    if (!authMethods) {
      return {
        authProviderRedirect: "",
        authProviderState: "",
      };
    }
    const redirectURL = `${url.origin}/oauth`;

    const targetItem = authMethods?.providers?.findIndex(
      (item) => item?.name === providerSelected,
    );
    //console.log("==================")
    //console.log(authMethods.authProviders)
    //console.log('target item is: ', targetItem)

    const provider = authMethods.providers[targetItem];
    const authProviderRedirect = `${provider.authUrl}${redirectURL}`;
    const state = provider.state;
    const verifier = provider.codeVerifier;



    cookies.set("state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60,
    });

    cookies.set("verifier", verifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60,
    });

    cookies.set("provider", providerSelected, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60,
    });

    cookies.set("path", "/", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60,
    });

    redirect(302, authProviderRedirect);
  },

  updateMentions: async ({ request, locals }) => {
    try {
      const body = await request.formData();
      const timeframe = body.get('timeframe');
      let subredditsString = body.getAll('subreddits');

      if (!timeframe) {
        return fail(400, { error: 'Missing required timeframe field' });
      }

      if (typeof timeframe !== 'string') {
        return fail(400, { error: 'Invalid timeframe provided' });
      }

      const timeValidation = convertTimesToUnix(timeframe);
      if (timeValidation.givenTime === null) {
        return fail(400, { error: 'Invalid timeframe format' });
      }

      const times = convertTimesToUnix(timeframe);
      const startTime = times.givenTime;
      const endTime = times.currentTime;
      console.log("current time", times.currentTime);
      console.log("given time", times.givenTime);

    //    let apiUrl = "https://chartexchange.com/api/v1/data/reddit/mentions/top/?";
    //   apiUrl += `start=${startTime}&end=${endTime}&limit=100&filter_noise=true&format=json&api_key=${locals.CHARTBASEKEY}`;
     // let apiUrl = "http://15.204.218.175:8000/aggregateranker?";
      let apiUrl = env.VITE_USEAST_API_URL
      apiUrl = apiUrl+"/aggregateranker?";
      apiUrl += `start_time=${startTime}&end_time=${endTime}&subreddits=all`;


    let apiResponse = [];

      if (subredditsString.length === 0 || (subredditsString.length === 1 && subredditsString[0].trim() === '')) {
        // No subreddits provided, use all from file
        const allSubreddits = getSubreddits(); // NOW DEFINED!
        const subredditParam = allSubreddits.map(sub => encodeURIComponent(sub.trim())).join(',');
          apiUrl += `&subreddits=${subredditParam}`;
        console.log("No subreddits provided, using all from file");
      } else {
        //Subreddits from Form
        const validSubreddits = subredditsString.filter(sub => sub.trim() !== "");
        if (validSubreddits.length > 0) {
          // Subreddits provided, add to URL
          const subredditParam = validSubreddits.map(sub => encodeURIComponent(sub.trim())).join(',');
          apiUrl += `&subreddits=${subredditParam}`;
        } else {
          return fail(400, { error: 'Invalid subreddits provided' }); // all were empty
        }
      }

      console.log("the url is", apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Request Failed:", response.status, errorText);
        return fail(response.status, { error: `API Error: ${response.status} - ${errorText}` });
      }

      apiResponse = await response.json();

      return {
        data: apiResponse,
        success: true
      };
    } catch (err) {
      console.error('Error processing updateMentions request:', err);
      return fail(500, { error: 'Internal server error' });
    }
  },
  updateMentionsPenny: async ({ request, locals }) => {
    try {
      const body = await request.formData();
      const timeframe = body.get('timeframe');
      let subredditsString = body.getAll('subreddits');

      if (!timeframe) {
        return fail(400, { error: 'Missing required timeframe field' });
      }

      if (typeof timeframe !== 'string') {
        return fail(400, { error: 'Invalid timeframe provided' });
      }

      const timeValidation = convertTimesToUnix(timeframe);
      if (timeValidation.givenTime === null) {
        return fail(400, { error: 'Invalid timeframe format' });
      }

      const times = convertTimesToUnix(timeframe);
      const startTime = times.givenTime;
      const endTime = times.currentTime;
      console.log("current time", times.currentTime);
      console.log("given time", times.givenTime);

      //    let apiUrl = "https://chartexchange.com/api/v1/data/reddit/mentions/top/?";
      //   apiUrl += `start=${startTime}&end=${endTime}&limit=100&filter_noise=true&format=json&api_key=${locals.CHARTBASEKEY}`;
      //let apiUrl = "http://15.204.218.175:8000/pennyaggregateranker?";
      let apiUrl = env.VITE_USEAST_API_URL
      apiUrl = apiUrl+"/pennyaggregateranker?";
      apiUrl += `start_time=${startTime}&end_time=${endTime}&subreddits=all`;


      let apiResponse = [];

      if (subredditsString.length === 0 || (subredditsString.length === 1 && subredditsString[0].trim() === '')) {
        // No subreddits provided, use all from file
        const allSubreddits = getSubreddits(); // NOW DEFINED!
        const subredditParam = allSubreddits.map(sub => encodeURIComponent(sub.trim())).join(',');
        apiUrl += `&subreddits=${subredditParam}`;
        console.log("No subreddits provided, using all from file");
      } else {
        //Subreddits from Form
        const validSubreddits = subredditsString.filter(sub => sub.trim() !== "");
        if (validSubreddits.length > 0) {
          // Subreddits provided, add to URL
          const subredditParam = validSubreddits.map(sub => encodeURIComponent(sub.trim())).join(',');
          apiUrl += `&subreddits=${subredditParam}`;
        } else {
          return fail(400, { error: 'Invalid subreddits provided' }); // all were empty
        }
      }

      console.log("the url is", apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Request Failed:", response.status, errorText);
        return fail(response.status, { error: `API Error: ${response.status} - ${errorText}` });
      }

      apiResponse = await response.json();

      return {
        data: apiResponse,
        success: true
      };
    } catch (err) {
      console.error('Error processing updateMentions request:', err);
      return fail(500, { error: 'Internal server error' });
    }
  },
};