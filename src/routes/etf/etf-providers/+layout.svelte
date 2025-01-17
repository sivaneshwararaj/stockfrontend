<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import { page } from "$app/stores";
  import logo from "$lib/images/provider_logo.png";
  import { formatETFName } from "$lib/utils";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  export let data;
  let currentPath = "";

  $: {
    if ($page?.url?.pathname?.startsWith("/etf/etf-providers")) {
      const parts = $page?.url?.pathname.split("/");
      if (parts?.[3]?.length !== 0) {
        currentPath = formatETFName(parts[3]) ?? "";
        console.log(currentPath);
      } else {
        currentPath = "";
      }
    }
  }
</script>

<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Largest
    ETF Providers by Assets Under Management · Stocknear</title
  >
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta
    name="description"
    content="A complete list of all the companies that provide exchange-traded funds (ETFs) that are actively traded on the U.S. stock market."
  />
  <!-- Other meta tags -->
  <meta
    property="og:title"
    content="Largest ETF Providers by Assets Under Management · Stocknear"
  />
  <meta
    property="og:description"
    content="A complete list of all the companies that provide exchange-traded funds (ETFs) that are actively traded on the U.S. stock market."
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content="Largest ETF Providers by Assets Under Management · Stocknear"
  />
  <meta
    name="twitter:description"
    content="A complete list of all the companies that provide exchange-traded funds (ETFs) that are actively traded on the U.S. stock market."
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-screen-2xl overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li>
        <a href="/etf/etf-providers" class="text-gray-300">ETF Providers</a>
      </li>
      {#if currentPath?.length !== 0 && typeof currentPath !== undefined}
        <li class="text-gray-300">{currentPath}</li>
      {/if}
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <h1 class="mb-6 text-white text-2xl sm:text-3xl font-bold">
            ETF Providers
          </h1>

          <div class="w-full m-auto mb-10 bg-default overflow-hidden">
            <div class="w-full flex flex-col justify-center items-center">
              <slot />
            </div>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
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
                Get the latest top Wall Street analyst ratings
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
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
