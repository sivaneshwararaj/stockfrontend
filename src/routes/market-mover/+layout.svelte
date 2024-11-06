<script lang="ts">
  import ScrollToTop from "$lib/components/ScrollToTop.svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { page } from "$app/stores";

  export let data;

  const tabs = [
    {
      title: "Gainers",
      path: "/market-mover/gainers",
    },
    {
      title: "Losers",
      path: "/market-mover/losers",
    },
    {
      title: "Active",
      path: "/market-mover/active",
    },
    {
      title: "Pre-Market",
      path: "/market-mover/premarket",
    },
    {
      title: "After-Hours",
      path: "/market-mover/afterhours",
    },
  ];

  let activeIdx = 0;

  // Subscribe to the $page store to reactively update the activeIdx based on the URL
  $: if ($page.url.pathname === "/market-mover/gainers") {
    activeIdx = 0;
  } else if ($page.url.pathname.startsWith("/market-mover/losers")) {
    activeIdx = 1;
  } else if ($page.url.pathname.startsWith("/market-mover/active")) {
    activeIdx = 2;
  } else if ($page.url.pathname.startsWith("/market-mover/premarket")) {
    activeIdx = 3;
  } else if ($page.url.pathname.startsWith("/market-mover/afterhours")) {
    activeIdx = 4;
  }
</script>

<!-- HEADER FOR BETTER SEO -->
<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Market Mover</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <h1 class="mb-6 text-white text-2xl sm:text-3xl font-bold">
            Market Mover
          </h1>

          <nav class="border-b-[2px] overflow-x-scroll whitespace-nowrap">
            <ul
              class="flex flex-row items-center w-full text-[1rem] sm:text-lg text-white"
            >
              {#each tabs as item, index}
                <a
                  href={item?.path}
                  class="p-2 px-5 cursor-pointer {activeIdx === index
                    ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
                >
                  {item.title}
                </a>
              {/each}
            </ul>
          </nav>

          <slot />

          <ScrollToTop />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href={"/pricing"}
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
              href={"/analysts"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Analyst
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Wall Street analyst ratings.
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/politicians"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Congress Trading
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Congress trading insights.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
