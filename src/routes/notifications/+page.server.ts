import { redirect, error } from "@sveltejs/kit";

export const load = async ({ locals, fetch }) => {
  const { pb } = locals;

  if (!pb.authStore.isValid) {
    redirect(303, "/login");
  }

  async function getNotifications() {
    const response = await fetch("/api/get-notifications", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const output = await response.json();

    return output;
  }

  return {
    getNotifications: await getNotifications(),
  };
};
