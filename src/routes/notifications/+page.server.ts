import { redirect, error } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  const { pb, user } = locals;

  if (!pb.authStore.isValid) {
    redirect(303, "/login");
  }

  async function getNotifications() {
    let output;

    try {
      output = await pb.collection("notifications")?.getFullList({
        filter: `opUser="${user?.id}" `,
        expand: "user,post,comment",
        sort: "-created",
      });
    } catch (e) {
      console.log(e);
      output = [];
    }

    return output;
  }

  return {
    getNotifications: await getNotifications(),
  };
};
