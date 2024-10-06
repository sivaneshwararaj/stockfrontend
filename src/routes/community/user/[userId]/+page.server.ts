import { error, fail, redirect } from "@sveltejs/kit";
import { validateData } from "$lib/utils";
import { loginUserSchema, registerUserSchema } from "$lib/schemas";

export const load = async ({ locals, params }) => {
  const { pb, user } = locals;

  if (params.userId === user?.id) {
    redirect(303, "/community/profile");
  }

  const userId = async () => {
    return params.userId;
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

  const getUserStats = async () => {
    let output;

    try {
      const getNumberOfPosts = await pb.collection("posts").getList(1, 1, {
        filter: `user="${params.userId}"`,
      });
      const numberOfPosts = getNumberOfPosts?.totalItems;

      const getNumberOfComments = await pb
        .collection("comments")
        .getList(1, 1, {
          filter: `user="${params.userId}"`,
        });
      const numberOfComments = getNumberOfComments?.totalItems;

      output = { numberOfPosts, numberOfComments };
    } catch (e) {
      output = { numberOfPosts: 0, numberOfComments: 0 };
    }

    return output;
  };

  const getUserData = async () => {
    let output;

    try {
      output = await pb.collection("users").getOne(params?.userId);
    } catch (e) {
      output = {
        karma: 0,
        username: "-",
      };
    }

    return output;
  };

  return {
    userId: await userId(),
    getModerators: await getModerators(),
    getUserStats: await getUserStats(),
    getUserData: await getUserData(),
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
    const authMethods = await pb?.collection("users")?.listAuthMethods();

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

    redirect(302, authProviderRedirect);
  },
};
