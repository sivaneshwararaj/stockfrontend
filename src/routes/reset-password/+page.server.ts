import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  const { pb } = locals;
  if (pb.authStore.isValid) {
    redirect(303, "/");
  }
}