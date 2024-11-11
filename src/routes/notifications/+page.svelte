<script lang="ts">
  import { getImageURL, formatDate } from "$lib/utils";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { numberOfUnreadNotification } from "$lib/store";
  import defaultAvatar from "$lib/images/default_avatar.png";

  export let data;
  export let form;

  let rawData = data?.getNotifications;
  let notificationList = rawData?.slice(0, 20);

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && notificationList?.length !== rawData?.length) {
      const nextIndex = notificationList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      notificationList = [...notificationList, ...filteredNewResults];
    }
  }

  async function updateNotifications() {
    let notificationIdList = [];

    for (let i = 0; i < notificationList?.length; i++) {
      if (notificationList[i]?.readed == false) {
        notificationIdList?.push(notificationList[i]?.id);
      }
    }

    if (notificationIdList.length !== 0) {
      const postData = {
        unreadList: notificationIdList,
      };

      await fetch("/api/update-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      $numberOfUnreadNotification = 0;
    }
  }

  onMount(async () => {
    await updateNotifications();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Notifications
    · stocknear</title
  >
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta name="description" content="Free Stock Analysis" />
  <!-- Other meta tags -->
  <meta property="og:title" content="Notifications · stocknear" />
  <meta property="og:description" content="Free Stock Analysis" />
  <meta
    property="og:image"
    content="https://stocknear-pocketbase.s3.amazonaws.com/logo/meta_logo.jpg"
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Notifications · stocknear" />
  <meta name="twitter:description" content="Free Stock Analysis" />
  <meta
    name="twitter:image"
    content="https://stocknear-pocketbase.s3.amazonaws.com/logo/meta_logo.jpg"
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Notifications</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Notification
            </h1>
          </div>

          {#if notificationList?.length !== 0}
            <div class="flex flex-col items-start w-full text-white">
              {#each notificationList as item}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                  class="sm:hover:bg-[#2B2B2B] pb-3 sm:p-3 mb-6 sm:mb-3 text-gray-200 w-full {!item?.readed
                    ? 'bg-[#F9AB00] bg-opacity-[0.1]'
                    : ''} "
                >
                  <div class="flex flex-row items-center w-full">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <a
                      class="avatar w-11 h-11 flex-shrink-0 cursor-pointer mr-4"
                    >
                      <img
                        style="clip-path: circle(50%);"
                        class="flex-shrink-0 w-11 h-11 rounded-full inline-block"
                        src={item?.expand?.user?.avatar
                          ? getImageURL(
                              item?.expand?.user?.collectionId,
                              item?.expand?.user?.id,
                              item?.expand?.user?.avatar,
                            )
                          : defaultAvatar}
                        alt="User avatar"
                      />
                    </a>

                    <div class="text-white text-sm sm:text-[1rem]">
                      {#if item?.notifyType === "priceAlert"}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <div class="flex flex-col items-start">
                          <div>
                            <a
                              href={`/${item?.liveResults?.assetType === "stock" ? "stocks" : "etf"}/${item?.liveResults?.symbol}`}
                              class="flex flex-col items-start cursor-pointer"
                            >
                              <div class="text-md mt-0.5">
                                Price Alert triggered for <span
                                  class="sm:hover:text-white text-blue-400"
                                  >${item?.liveResults?.symbol}</span
                                >
                              </div>
                              <div class="text-md mt-0.5">
                                The price of <span class="font-bold"
                                  >${item?.liveResults?.currentPrice}</span
                                >
                                is {item?.liveResults?.condition} your target of
                                <span class="font-bold"
                                  >${item?.liveResults?.targetPrice}</span
                                >
                              </div>
                            </a>
                          </div>
                          <span class="text-sm sm:text-[1rem] text-[#A6ADBB0"
                            >{formatDate(item?.created)} ago</span
                          >
                        </div>
                      {/if}
                    </div>
                    <!--
             {#if item?.expand?.post?.thumbnail}
             <img 
             src="{getImageURL(item?.expand?.post?.collectionId, item?.expand?.post?.id, item?.expand?.post?.thumbnail)}" 
             class="w-24 sm:w-20 max-h-[50px] rounded-md inline-block"
             alt="post thumbnail"
             />
             {/if}
             -->
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div
              class="mt-5 text-white font-semibold text-[1rem] justify-center items-center m-auto"
            >
              Empty just like our souls...
              <svg
                class="inline-block w-4 h-4 m-auto mb-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 1200"
                ><path
                  fill="white"
                  d="M567.663 0v190.423h64.679V0h-64.685h.006zm-264.11 57.225l-52.992 37.103l109.203 155.946l52.963-37.104L303.553 57.225zm592.886 0L787.268 213.171l52.971 37.104L949.44 94.328l-52.992-37.103h-.009zm-296.45 185.299c-158.227 0-286.493 96.083-286.493 214.625l162.772 492.948h247.47l162.758-492.948c0-118.54-128.258-214.625-286.492-214.625h-.015zM85.465 299.673l-22.099 60.814l178.849 65.114l22.181-60.785l-178.935-65.143h.004zm1029.062 0l-178.936 65.148l22.106 60.792l178.936-65.125l-22.106-60.815zM255.756 577.681l-183.9 49.326l16.686 62.431l183.9-49.255l-16.683-62.502h-.003zm688.48 0l-16.674 62.501l183.9 49.247l16.674-62.432l-183.9-49.318v.002zM472.66 986.032v85.686h254.687v-85.673H472.661l-.001-.013zm0 128.282V1200h254.687v-85.672H472.661l-.001-.014z"
                /></svg
              >
            </div>
          {/if}
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href="/pricing"
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Pro Subscription
                  </h2>
                  <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Upgrade now for unlimited access to all data and tools.
                </span>
              </a>
            </div>
          {/if}

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href="cramer-tracker"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Cramer Tracker
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Follow Jim Cramer latest stock picks
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href="/reddit-tracker"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Reddit Tracker
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest trends of r/Wallstreetbets
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
