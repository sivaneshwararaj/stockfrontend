import { error, fail, redirect } from "@sveltejs/kit";
import { validateData } from "$lib/utils";
import { loginUserSchema, registerUserSchema } from "$lib/schemas";

function listToTree(comments, parentProp = "reply") {
  // Create id indexed comments dictionary
  const commentsDict = {};
  for (let comment of comments) {
    commentsDict[comment.id] = {
      ...comment,
      children: [],
    };
  }

  // Build the tree
  const tree = [];
  for (const comment of comments) {
    const parentId = comment[parentProp];
    if (parentId) {
      commentsDict[parentId].children.push(commentsDict[comment.id]);
    } else {
      tree.push(commentsDict[comment.id]);
    }
  }

  return tree;
}

export const load = async ({ locals, params, fetch }) => {
  const { pb } = locals;

  async function getOnePost() {
    // If the post is not found in the cache, fetch it from the endpoint
    const postData = { postId: params.postId };

    const response = await fetch("/api/get-one-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const result = await response.json();

    // Assuming the result contains an 'items' array
    return result?.items;
  }

  const getPostId = async () => {
    return params.postId;
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

  const getAllComments = async () => {
    let output;
    try {
      const result = await pb.collection("comments").getFullList({
        filter: `post="${params.postId}"`,
        expand: "user,alreadyVoted(comment)",
        fields:
          "*,expand.user,expand.alreadyVoted(comment).user,expand.alreadyVoted(comment).type",
        sort: "-created",
      });

      output = listToTree(result);
    } catch (e) {
      output = [];
    }
    return output;
  };
  return {
    getModerators: await getModerators(),
    getAllComments: await getAllComments(),
    getPostId: await getPostId(),
    getOnePost: await getOnePost(),
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

    redirect(303, "/community");
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

    redirect(303, "/community");
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
