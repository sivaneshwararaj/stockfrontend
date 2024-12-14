<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";

  import toast from "svelte-french-toast";

  import { enhance } from "$app/forms";

  export let data;
  export let form;

  let subscriptionData = data?.getSubscriptionData;
  let isClicked = false;

  const submitCancellation = () => {
    return async ({ result, update }) => {
      switch (result.type) {
        case "success":
          toast.success("Subscription Cancelled successfully!", {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          await update();
          break;
        case "redirect":
          toast.success("Subscription Cancelled successfully!", {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          await update();
          break;
        case "failure":
          toast.error("Something went wrong.", {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          await update();
          break;
        case "error":
          toast.error(result.error.message, {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          break;
        default:
          await update();
      }

      setTimeout(() => {
        if (result.type === "redirect") {
          const anchor = document.createElement("a");
          anchor.href = "/profile";
          anchor.dataset.sveltekitReload = true;
          document.body.appendChild(anchor);
          anchor.dispatchEvent(new MouseEvent("click"));
        }
      }, 1500);
    };
  };

  const submitReactivate = () => {
    return async ({ result, update }) => {
      switch (result.type) {
        case "success":
          toast.success("Subscription Reactivate successfully!", {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          await update();
          break;
        case "redirect":
          toast.success("Subscription Reactivate successfully!", {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          await update();
          break;
        case "failure":
          toast.error("Something went wrong.", {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          await update();
          break;
        case "error":
          toast.error(result.error.message, {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          break;
        default:
          await update();
      }

      setTimeout(() => {
        if (result.type === "redirect") {
          const anchor = document.createElement("a");
          anchor.href = "/profile";
          anchor.dataset.sveltekitReload = true;
          document.body.appendChild(anchor);
          anchor.dispatchEvent(new MouseEvent("click"));
        }
      }, 1500);
    };
  };

  const submitChangePlan = () => {
    return async ({ result, update }) => {
      switch (result.type) {
        case "success":
          toast.success("Changing to Annual Plan successfully!", {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          await update();
          break;
        case "redirect":
          toast.success("Changing to Annual Plan successfully!", {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          await update();
          break;
        case "failure":
          toast.error("Something went wrong.", {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          await update();
          break;
        case "error":
          toast.error(result.error.message, {
            style: "border-radius: 200px; background: #2A2E39; color: #fff;",
          });
          break;
        default:
          await update();
      }

      setTimeout(() => {
        if (result.type === "redirect") {
          const anchor = document.createElement("a");
          anchor.href = "/profile";
          anchor.dataset.sveltekitReload = true;
          document.body.appendChild(anchor);
          anchor.dispatchEvent(new MouseEvent("click"));
        }
      }, 5000);
    };
  };
</script>

<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    My Account · Stocknear</title
  >
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <!-- Other meta tags -->
  <meta property="og:title" content="My Account · Stocknear" />

  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="My Account · Stocknear" />

  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">My Account</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:mr-auto">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              My Account
            </h1>
          </div>

          <div
            class="rounded-md border border-gray-600 p-4 text-base xs:p-4 xs:text-lg text-white"
          >
            <h2 class="text-white text-2xl font-semibold mb-3">
              User Information
            </h2>
            <div class="mt-1">
              <strong>Email:</strong>
              {data?.user?.email}
            </div>
            <div class="mt-1 mb-1">
              <strong>Registered Date:</strong>
              {new Date(data?.user?.created ?? null)?.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <a href="/update-password" class="sm:hover:text-white text-blue-400"
              >Update Password</a
            >
          </div>

          <div
            class="mt-6 rounded-md border border-gray-600 p-4 text-base xs:p-4 xs:text-lg text-white"
          >
            <h2 class="text-white text-2xl font-semibold mb-3">
              Manage Subscription
            </h2>
            <div class="flex flex-row items-center">
              <span class="text-white text-[1rem] sm:text-lg"> Status: </span>
              <div class="ml-2 flex flex-row items-center">
                <span class="relative flex h-2 w-2">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full {subscriptionData?.status_formatted ===
                      'Active' ||
                    subscriptionData?.status_formatted === 'Paid' ||
                    subscriptionData?.status_formatted === 'On Trial'
                      ? 'bg-[#00FC50]'
                      : 'bg-[#FF3131]'} opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-2 w-2 {subscriptionData?.status_formatted ===
                      'Active' ||
                    subscriptionData?.status_formatted === 'Paid' ||
                    subscriptionData?.status_formatted === 'On Trial' ||
                    data?.user?.freeTrial === true
                      ? 'bg-[#00FC50]'
                      : 'bg-[#FF3131]'}"
                  ></span>
                </span>

                <span class="ml-2 text-[1rem] text-slate-200 font-medium">
                  {#if data?.user?.freeTrial === true}
                    Active
                  {:else}
                    {subscriptionData?.status_formatted ?? "Inactive"}
                  {/if}
                </span>
              </div>
            </div>
            {#if subscriptionData?.status_formatted === "Active"}
              <span class="text-white text-sm font-medium pr-5">
                Your subscription will automatically renew on {new Date(
                  subscriptionData?.renews_at,
                )?.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            {:else if subscriptionData?.status_formatted === "Cancelled"}
              <span class="text-white text-sm font-medium">
                Your subscription will remain active until {new Date(
                  subscriptionData?.ends_at,
                )?.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            {/if}
            <div class="flex flex-col justify-start items-start mt-4 mb-4">
              <span class="text-white font-medium mr-2 text-lg">
                Current Plan:
              </span>
              <span class="text-[1rem]">
                {#if subscriptionData?.first_order_item?.product_name === "Pro Subscription (Life Time Access)"}
                  Lifetime Access
                {:else if data?.user?.freeTrial === true}
                  Pro Subscription (Free Trial)
                {:else}
                  {["Active", "Paid", "Cancelled"]?.includes(
                    subscriptionData?.status_formatted,
                  )
                    ? subscriptionData?.product_name
                    : "Free Subscription"}
                {/if}
              </span>
            </div>

            {#if subscriptionData?.status_formatted === "Active"}
              <div
                class="flex flex-col items-start sm:flex-row sm:items-center"
              >
                <label
                  for="cancelSubscriptionModal"
                  class="cursor-pointer text-white border border-gray-600 sm:hover:bg-primary bg-opacity-[0.5] text-sm sm:text-[1rem] px-4 py-2 rounded-md mt-5"
                >
                  Cancel Subscription
                </label>
                {#if subscriptionData?.product_name?.includes("Monthly")}
                  <label
                    for={subscriptionData?.card_brand !== null &&
                    subscriptionData?.card_brand?.length !== 0
                      ? "changeSubscriptionModal"
                      : "errorSubscriptionModal"}
                    class="sm:ml-3 {subscriptionData?.card_brand !== null &&
                    subscriptionData?.card_brand?.length !== 0
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed'} {subscriptionData?.card_brand !==
                      null && subscriptionData?.card_brand?.length !== 0
                      ? 'bg-white sm:hover:bg-white/80 text-black font-semibold'
                      : 'bg-gray-600 opacity-[0.8] text-white'} text-sm sm:text-[1rem] px-4 py-2 rounded-md mt-5"
                  >
                    Change to Annual Plan
                  </label>
                {/if}
              </div>
            {:else if subscriptionData?.status_formatted === "Cancelled"}
              <label
                for="reactivateSubscriptionModal"
                class="cursor-pointer text-black bg-[#fff] sm:hover:bg-gray-300 text-sm sm:text-[1rem] px-4 py-2 rounded-md"
              >
                Reactivate Subscription
              </label>
            {:else if subscriptionData?.status_formatted === "Paid" && !subscriptionData?.first_order_item?.product_name === "Pro Subscription (Life Time Access)"}
              <span class="text-white mt-5">
                Please wait a moment; you will be updated to Pro in a second.
              </span>
            {:else if subscriptionData?.first_order_item?.product_name === "Pro Subscription (Lifetime Access)"}{:else}
              <a href="/pricing" class="sm:hover:text-white text-blue-400">
                Get Full Access with Pro Subscription.
              </a>
            {/if}
          </div>

          <div
            class="mt-6 rounded-md border border-gray-600 p-4 text-base xs:p-4 xs:text-lg text-white"
          >
            <h2 class="text-white text-2xl font-semibold mb-3">Need help?</h2>
            <div class="mt-1">
              <strong>Here's how to get support:</strong>
            </div>
            <div class="mt-2 mb-1">
              <ul class="list-disc pl-5">
                <li>Send an email to support@stocknear.com.</li>
                <li>
                  Join our official Subreddit
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://www.reddit.com/r/stocknear/"
                    class="text-blue-400"
                  >
                    r/stocknear</a
                  >.
                </li>
                <li>
                  Join our official <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://discord.com/invite/hCwZMMZ2MT"
                    class="text-blue-400">Discord Channel</a
                  >.
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</section>

<!-- Start Cancel Subscription Modal -->
<input type="checkbox" id="cancelSubscriptionModal" class="modal-toggle" />

<dialog id="cancelSubscriptionModal" class="modal modal-bottom sm:modal-middle">
  <label
    for="cancelSubscriptionModal"
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.5]"
  ></label>

  <!-- Desktop modal content -->
  <form
    method="POST"
    action="?/cancelSubscription"
    use:enhance={submitCancellation}
    class="modal-box w-full bg-[#272727A] flex flex-col items-center"
  >
    <div
      class="mx-auto mb-8 h-1.5 w-20 flex-shrink-0 rounded-full bg-[#404040]"
    />
    <div class="text-white mb-5 text-center">
      <h3 class="font-bold text-2xl mb-5">Are you sure?</h3>
      <span class="text-white text-[1rem] font-normal">
        You will no longer be charged for this subscription, and at the end of
        the billing period, your account will transfer to the Free Plan.
      </span>
    </div>

    <button
      on:click={() => (isClicked = !isClicked)}
      class="{!isClicked
        ? ''
        : 'hidden'} cursor-pointer px-7 py-2 mb-5 rounded-md bg-red-600 text-center text-white text-[1rem] font-normal"
    >
      Cancel Subscription
      <input
        class="hidden"
        name="subscriptionId"
        value={subscriptionData?.first_subscription_item?.subscription_id}
      />
    </button>
    {#if isClicked === true}
      <label
        class="cursor-pointer px-7 py-2 mb-5 rounded-full bg-red-600 text-center text-white text-[1rem] font-normal"
      >
        <div class="flex flex-row m-auto">
          <span class="loading loading-infinity"></span>
          <span class="text-white ml-2">Proceeding</span>
        </div>
      </label>
    {/if}
  </form>
</dialog>
<!-- End Cancel Subscription Modal -->

<!-- Start Reactivate Subscription Modal -->
<input type="checkbox" id="reactivateSubscriptionModal" class="modal-toggle" />

<dialog
  id="reactivateSubscriptionModal"
  class="modal modal-bottom sm:modal-middle"
>
  <label
    for="reactivateSubscriptionModal"
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.5]"
  ></label>

  <!-- Desktop modal content -->
  <form
    method="POST"
    action="?/reactivateSubscription"
    use:enhance={submitReactivate}
    class="modal-box w-full bg-[#272727A] flex flex-col items-center"
  >
    <div
      class="mx-auto mb-8 h-1.5 w-20 flex-shrink-0 rounded-full bg-[#404040]"
    />
    <div class="text-white mb-5 text-center">
      <h3 class="font-bold text-2xl mb-5">Reactivate Subscription</h3>
      <span class="text-white text-[1rem] font-normal">
        Reactivate your Pro Subscription now to unlock unlimited features and
        gain the edge over the competition.
      </span>
    </div>

    <button
      on:click={() => (isClicked = !isClicked)}
      class="{!isClicked
        ? ''
        : 'hidden'} cursor-pointer px-7 py-2 mb-5 rounded-md bg-[#fff] sm:hover:bg-gray-300 text-center text-black text-[1rem] font-medium"
    >
      Proceed
      <input
        class="hidden"
        name="subscriptionId"
        value={subscriptionData?.first_subscription_item?.subscription_id}
      />
    </button>
    {#if isClicked === true}
      <label
        class="cursor-pointer px-7 py-2 mb-5 rounded-full bg-[#417143] text-center text-white text-[1rem] font-normal"
      >
        <div class="flex flex-row m-auto">
          <span class="loading loading-infinity"></span>
          <span class="text-white ml-2">Proceeding</span>
        </div>
      </label>
    {/if}
  </form>
</dialog>
<!-- End Reactivate Subscription Modal -->

<!-- Start Cancel Subscription Modal -->
<input type="checkbox" id="changeSubscriptionModal" class="modal-toggle" />

<dialog id="changeSubscriptionModal" class="modal modal-bottom sm:modal-middle">
  <label
    for="changeSubscriptionModal"
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.5]"
  ></label>

  <!-- Desktop modal content -->
  <form
    method="POST"
    action="?/changeSubscription"
    use:enhance={submitChangePlan}
    class="modal-box w-full bg-[#272727A] flex flex-col items-center"
  >
    <div
      class="mx-auto mb-8 h-1.5 w-20 flex-shrink-0 rounded-full bg-[#404040]"
    />
    <div class="text-white mb-5 text-center">
      <h3 class="font-bold text-2xl mb-5">Are you sure?</h3>
      <span class="text-white text-[1rem] font-normal">
        You're account will transfer from from monthly plan to annual plan.
      </span>
    </div>

    <button
      on:click={() => (isClicked = !isClicked)}
      class="{!isClicked
        ? ''
        : 'hidden'} cursor-pointer px-7 py-2 mb-5 rounded-full text-center bg-[#fff] text-black font-semibold text-[1rem] font-semibold"
    >
      Proceed
      <input
        class="hidden"
        name="subscriptionId"
        value={subscriptionData?.first_subscription_item?.subscription_id}
      />
    </button>
    {#if isClicked === true}
      <label
        class="cursor-pointer px-7 py-2 mb-5 rounded-full bg-[#fff] text-center text-black text-[1rem] font-normal"
      >
        <div class="flex flex-row m-auto">
          <span class="loading loading-infinity"></span>
          <span class="text-black ml-2">Proceeding</span>
        </div>
      </label>
    {/if}
  </form>
</dialog>
<!-- End Cancel Subscription Modal -->

<!-- Start Cancel Subscription Modal -->
<input type="checkbox" id="errorSubscriptionModal" class="modal-toggle" />

<dialog id="errorSubscriptionModal" class="modal modal-bottom sm:modal-middle">
  <label
    for="errorSubscriptionModal"
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.5]"
  ></label>

  <!-- Desktop modal content -->
  <div class="modal-box w-full bg-[#09090B] flex flex-col items-center">
    <div
      class="mx-auto mb-8 h-1.5 w-20 flex-shrink-0 rounded-full bg-[#404040]"
    />
    <div class="text-white mb-5 text-center">
      <h3 class="font-bold text-2xl mb-5">Paypal not supported</h3>
      <span class="text-white text-[1rem] font-normal">
        Apologies, our payment provider currently only supports credit cards for
        changing plans from monthly to annual. We are working to expand this to
        other payment methods.
      </span>
    </div>

    <label
      for="errorSubscriptionModal"
      class="cursor-pointer px-7 py-2 mb-5 rounded-full bg-[#0DDE00] text-center text-black text-[1rem] font-normal"
    >
      OK
    </label>
  </div>
</dialog>
<!-- End Cancel Subscription Modal -->
