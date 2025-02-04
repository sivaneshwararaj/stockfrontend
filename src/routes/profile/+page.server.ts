import { redirect, error } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  const { pb, user } = locals;
  if (!pb.authStore.isValid) {
    redirect(303, "/login");
  }

const getNotificationChannels = async () => {
  const userId = user?.id;
  let output = {};

  try {
    // Check if the user already exists in the collection
    output = await pb.collection("notificationChannels").getFirstListItem(`user="${userId}"`);
  } catch (error) {
    if (error.status === 404) {
      try {
        // Fetch the collection schema to dynamically get all boolean fields
        const collectionSchema = await pb.collection("notificationChannels").getFullList();

        // Find all boolean fields and set them to `true`
        const defaultValues = collectionSchema[0]
          ? Object.keys(collectionSchema[0]).reduce((acc, key) => {
              if (typeof collectionSchema[0][key] === "boolean") {
                acc[key] = true;
              }
              return acc;
            }, {})
          : {};

        // Ensure the user field is included
        defaultValues.user = userId;

        // Create the new record
        output = await pb.collection("notificationChannels").create(defaultValues);
      } catch (creationError) {
        console.error("Error creating new user notification channel:", creationError);
      }
    } else {
      console.error("Error checking for existing user:", error);
    }
  }
  return output; // Return only the latest item
};


const getPushSubscriptionData = async () => {
  let output = {};
  try {
    output = await pb.collection("pushSubscription").getFullList({
      filter: `user="${user?.id}"`,
      sort: "-created", // Sorts newest first
    });

    if (output?.length > 1) {
      const [, ...toDelete] = output; // Keep the first item, delete the rest
      await Promise.all(
        toDelete.map((item) => pb.collection("pushSubscription").delete(item?.id))
      );
    }
  } catch (err) {
    console.log(err);
  }

  return output?.at(0) || null; // Return only the latest item
};


  const getSubscriptionData = async () => {
    const output =
      (
        await pb.collection("payments").getFullList({
          filter: `user="${user.id}" `,
          sort: "-created",
        })
      )?.at(0)?.data?.data?.attributes ?? {};

    //console.log(output)

    return output;
  };




  return {
    getSubscriptionData: await getSubscriptionData(),
    getPushSubscriptionData: await getPushSubscriptionData(),
    getNotificationChannels: await getNotificationChannels(),
  };

};

export const actions = {
  cancelSubscription: async ({ request, locals }) => {
    const formData = await request?.formData();

    const apiKey = import.meta.env.VITE_LEMON_SQUEEZY_API_KEY;
    const subscriptionId = formData?.get("subscriptionId");

    try {
      const url = `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`;
      const headers = {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      };

      const response = await fetch(url, {
        method: "DELETE",
        headers: headers,
      });
    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    redirect(302, "/profile");
  },

  reactivateSubscription: async ({ request, locals }) => {
    const formData = await request?.formData();

    const apiKey = import.meta.env.VITE_LEMON_SQUEEZY_API_KEY;
    const subscriptionId = formData?.get("subscriptionId");

    try {
      const url = `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`;
      const headers = {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      };

      const payload = {
        data: {
          type: "subscriptions",
          id: `${subscriptionId}`,
          attributes: {
            cancelled: false,
          },
        },
      };

      const response = await fetch(url, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    redirect(302, "/profile");
  },

  changeSubscription: async ({ request, locals }) => {
    const formData = await request?.formData();

    const apiKey = import.meta.env.VITE_LEMON_SQUEEZY_API_KEY;
    const subscriptionId = formData?.get("subscriptionId");

    try {
      const url = `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`;
      const headers = {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      };

      // Create the data payload
      const payload = {
        data: {
          type: "subscriptions",
          id: subscriptionId,
          attributes: {
            variant_id: import.meta.env.VITE_LEMON_SQUEEZY_ANNUAL_VARIANT_ID, // Change from monthly to annually plan
          },
        },
      };

      const response = await fetch(url, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(payload),
      });

      console.log(await response.json());
    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    redirect(302, "/profile");
  },
};
