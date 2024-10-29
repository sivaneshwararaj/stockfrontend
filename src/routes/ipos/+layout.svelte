<script lang="ts">
  import { page } from "$app/stores";
  import { numberOfUnreadNotification, screenWidth } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { goto } from "$app/navigation";

  export let data;

  let navigation = [];
  let displaySection = "2024";

  for (let year = 2024; year >= 2019; year--) {
    navigation.push({ title: year, link: `/ipos/${year}` });
  }

  function scrollToItem(itemId) {
    const item = document.getElementById(itemId);
    if (item) {
      item.scrollIntoView({ behavior: "smooth" });
      window.scrollTo(0, 0);
    }
  }

  function changeSection(state, item) {
    scrollToItem(item);
    displaySection = state;
  }

  $: {
    if ($page.url.pathname) {
      const parts = $page?.url?.pathname?.split("/");
      const sectionMap = {
        "2024": "2024",
        "2023": "2023",
        "2022": "2022",
        "2021": "2021",
        "2020": "2020",
        "2019": "2019",
      };
      displaySection =
        sectionMap[
          parts?.find((part) => Object?.keys(sectionMap)?.includes(part))
        ] || "overview";
    }
  }
</script>

<!-- HEADER FOR BETTER SEO -->
<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} IPOs
    Calendar · stocknear</title
  >
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta
    name="description"
    content="A list of upcoming ipos on the US stock market."
  />
  <!-- Other meta tags -->
  <meta property="og:title" content="IPOs Calendar · stocknear" />
  <meta
    property="og:description"
    content="A list of upcoming ipos on the US stock market."
  />
  <meta
    property="og:image"
    content="https://stocknear-pocketbase.s3.amazonaws.com/logo/meta_logo.jpg"
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="IPOs Calendar · stocknear" />
  <meta
    name="twitter:description"
    content="A list of upcoming ipos on the US stock market."
  />
  <meta
    name="twitter:image"
    content="https://stocknear-pocketbase.s3.amazonaws.com/logo/meta_logo.jpg"
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 px-4 lg:px-3 mb-20"
>
  <div class="text-sm breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">IPO Calendar</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-5">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              IPO Calendar
            </h1>
          </div>

          <div
            class="w-full {$page?.url?.pathname === '/ipos'
              ? 'hidden'
              : ''} mb-2"
          >
            <nav class="border-b-[2px] overflow-x-scroll whitespace-nowrap">
              <ul
                class="flex flex-row items-center w-full text-[1rem] sm:text-lg text-white"
              >
                {#each ["2024", "2023", "2022", "2021", "2020", "2019"] as item}
                  <a
                    href={`/ipos/${item}`}
                    on:click={() => (displaySection = item)}
                    class="p-2 px-5 cursor-pointer {displaySection === item
                      ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                      : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
                  >
                    {item}
                  </a>
                {/each}
              </ul>
            </nav>
          </div>

          <slot />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              on:click={() => goto("/pricing")}
              class="w-full bg-[#27272A] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <div
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
              </div>
            </div>
          {/if}

          <div
            on:click={() => goto("/analysts")}
            class="w-full bg-[#27272A] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Wallstreet Analyst
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Wall Street analyst ratings.
              </span>
            </div>
          </div>

          <div
            on:click={() => goto("/politicians")}
            class="w-full bg-[#27272A] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Congress Trading
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Congress trading insights.
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>

<style lang="scss">
  .scrollbar {
    display: grid;
    grid-gap: 17px;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    grid-auto-flow: column;
    overflow-x: auto;
    scrollbar-width: thin; /* Hide the default scrollbar in Firefox */
    scrollbar-color: transparent transparent; /* Hide the default scrollbar in Firefox */
  }

  /* Custom scrollbar for Webkit (Chrome, Safari) */
  .scrollbar::-webkit-scrollbar {
    width: 0; /* Hide the width of the scrollbar */
    height: 0; /* Hide the height of the scrollbar */
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: transparent; /* Make the thumb transparent */
  }

  .navmenu {
    display: flex;
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    white-space: nowrap;
  }
</style>
