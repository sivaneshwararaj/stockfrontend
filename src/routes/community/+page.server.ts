import { error, fail, redirect } from "@sveltejs/kit";
import { validateData } from "$lib/utils";
import { loginUserSchema, registerUserSchema } from "$lib/schemas";

export const load = async ({ locals, setHeaders }) => {
  const { pb } = locals;

  const getDiscordWidget = async () => {
    // make the POST request to the endpoint
    const response = await fetch(
      "https://discord.com/api/guilds/1165618982133436436/widget.json",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const output = await response.json();

    return output;
  };

  const getCommunityStats = async () => {
    let output;
    let totalUsers = 0;
    let totalPosts = 0;
    let totalComments = 0;

    try {
      totalUsers = (await pb.collection("users").getList(1, 1))?.totalItems;
      totalPosts = (await pb.collection("posts").getList(1, 1))?.totalItems;
      totalComments = (await pb.collection("comments").getList(1, 1))
        ?.totalItems;

      output = { totalUsers, totalPosts, totalComments };
    } catch (e) {
      console.error(e);
      output = { totalUsers, totalPosts, totalComments };
    }

    return output;
  };

  const getModerators = async () => {
    let output;
    try {
      output = await pb.collection("moderators").getFullList({
        expand: "user",
      });
    } catch (e) {
      output = [];
    }
    return output;
  };

  setHeaders({ "cache-control": "public, max-age=3000" });
  // Make sure to return a promise
  return {
    getDiscordWidget: await getDiscordWidget(),
    getCommunityStats: await getCommunityStats(),
    getModerators: await getModerators(),
  };
};

export const actions = {
  login: async ({ request, locals }) => {
    const { formData, errors } = await validateData(
      await request.formData(),
      loginUserSchema
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

    redirect(303, "/");
  },

  register: async ({ locals, request }) => {
    const { formData, errors } = await validateData(
      await request.formData(),
      registerUserSchema
    );

    if (errors) {
      return fail(400, {
        data: formData,
        errors: errors.fieldErrors,
      });
    }

    try {
      let newUser = await locals.pb.collection("users").create(formData);
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
    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    redirect(303, "/");
  },

  oauth2: async ({ url, locals, request, cookies }) => {
    const authMethods = await locals?.pb
      ?.collection("users")
      ?.listAuthMethods();

    const data = await request?.formData();
    const providerSelected = data?.get("provider");

    if (!authMethods) {
      return {
        authProviderRedirect: "",
        authProviderState: "",
      };
    }
    const redirectURL = `${url.origin}/oauth`;

    const targetItem = authMethods.authProviders?.findIndex(
      (item) => item?.name === providerSelected
    );
    //console.log("==================")
    //console.log(authMethods.authProviders)
    //console.log('target item is: ', targetItem)

    const provider = authMethods.authProviders[targetItem];
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

    cookies.set("path", "/community", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60,
    });

    redirect(302, authProviderRedirect);
  },
};
