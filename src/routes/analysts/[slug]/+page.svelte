<script lang="ts">
  import { screenWidth, numberOfUnreadNotification } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { onMount } from "svelte";

  export let data;

  let analystStats = data?.getAnalystStats;

  let rawData = data?.getAnalystStats?.ratingsList;
  let stockList = rawData?.slice(0, 20) ?? [];

  let analystScore = analystStats?.analystScore;
  let rank = analystStats?.rank;
  let analystName = analystStats?.analystName;
  let companyName = analystStats?.companyName;
  let totalRatings = analystStats?.totalRatings;
  let successRate = analystStats?.successRate;
  let avgReturn = analystStats?.avgReturn;
  let numOfAnalysts = new Intl.NumberFormat("en", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(analystStats?.numOfAnalysts);
  let numOfStocks = analystStats?.numOfStocks;

  function sectorSelector(sector) {
    let path;
    switch (sector) {
      case "Financials":
        path = "financial";
        break;
      case "Healthcare":
        path = "healthcare";
        break;
      case "Information Technology":
        path = "technology";
        break;
      case "Technology":
        path = "technology";
        break;
      case "Financial Services":
        path = "financial";
        break;
      case "Industrials":
        path = "industrials";
        break;
      case "Energy":
        path = "energy";
        break;
      case "Utilities":
        path = "utilities";
        break;
      case "Consumer Cyclical":
        path = "consumer-cyclical";
        break;
      case "Real Estate":
        path = "real-estate";
        break;
      case "Basic Materials":
        path = "basic-materials";
        break;
      case "Communication Services":
        path = "communication-services";
        break;
      case "Consumer Defensive":
        path = "consumer-defensive";
        break;
      default:
        // Handle default case if needed
        break;
    }
    return path;
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && stockList?.length !== rawData?.length) {
      const nextIndex = stockList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      stockList = [...stockList, ...filteredNewResults];
    }
  }

  onMount(async () => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: charNumber = $screenWidth < 640 ? 20 : 40;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Top
    Wall Street Stock Analysts · stocknear
  </title>
  <meta
    name="description"
    content={`A list of the top Wall Street stock analysts, ranked by their success rate and average return per rating.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`Top Wall Street Stock Analysts · stocknear`}
  />
  <meta
    property="og:description"
    content={`A list of the top Wall Street stock analysts, ranked by their success rate and average return per rating.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`Top Wall Street Stock Analysts · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`A list of the top Wall Street stock analysts, ranked by their success rate and average return per rating.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 px-4 lg:px-3 mb-20"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li><a href="/analysts" class="text-gray-300">Analyst</a></li>

      <li class="text-gray-300">{analystName}</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="w-full m-auto mt-12">
            <div class="items-center justify-between lg:flex">
              <div
                class="flex space-x-3 border-b-[2px] border-below-title pb-3 lg:border-none lg:pb-0"
              >
                <div class="flex-shrink-0">
                  <svg
                    class="h-16 w-16 sm:h-20 sm:w-20 text-gray-200"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style="max-width:100px"
                    ><path
                      fill-rule="evenodd"
                      d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                      clip-rule="evenodd"
                    ></path></svg
                  >
                </div>
                <div class="mt-0 pt-0.5 text-left">
                  <h1 class="mb-0 text-2xl font-bold text-white">
                    {analystName}
                  </h1>
                  <p class="mb-0.5 text-sm font-semibold text-gray-300">
                    Stock Analyst at {companyName}
                  </p>
                  <div class="inline-flex items-center">
                    <div class="flex flex-row items-center mt-1">
                      {#each Array.from({ length: 5 }) as _, i}
                        {#if i < Math.floor(analystScore)}
                          <svg
                            class="w-5 h-5 text-[#FBCE3C]"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 22 20"
                          >
                            <path
                              d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
                            />
                          </svg>
                        {:else}
                          <svg
                            class="w-5 h-5 text-gray-300 dark:text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 22 20"
                          >
                            <path
                              d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
                            />
                          </svg>
                        {/if}
                      {/each}
                    </div>
                    <span class="ml-1 text-sm text-white">({analystScore})</span
                    >
                  </div>
                </div>
              </div>
              <div
                class="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border border-gray-600 py-2 text-center md:grid-cols-4 md:p-0 lg:mt-0 lg:border-none"
              >
                <div class="flex flex-col px-4 py-2 bp:px-6 md:py-6">
                  <div class="text-2xl font-semibold tracking-tight text-white">
                    # {rank}
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Out of {numOfAnalysts} analysts
                  </div>
                </div>
                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div class="text-2xl font-bold tracking-tight text-white">
                    {totalRatings}
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Total ratings
                  </div>
                </div>
                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div class="text-2xl font-bold tracking-tight">
                    <span
                      class={successRate >= 0
                        ? "before:content-['+'] text-[#36D984]"
                        : "text-[#EF4444]"}>{successRate?.toFixed(2)}%</span
                    >
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Success rate
                  </div>
                </div>
                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div class="text-2xl font-bold tracking-tight text-white">
                    <span
                      class={avgReturn >= 0
                        ? "before:content-['+'] text-[#36D984]"
                        : "text-[#EF4444]"}>{avgReturn?.toFixed(2)}%</span
                    >
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Average return
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-10 mt-10">
              <div
                class="text-white p-5 rounded-lg sm:flex sm:flex-row sm:items-center border border-gray-600 text-sm sm:text-[1rem]"
              >
                <div class="flex flex-col items-start">
                  <span class="text-white font-semibold text-lg sm:text-xl">
                    Main Sectors:
                  </span>

                  <div
                    class="mt-5 mb-3 flex flex-wrap gap-3 flex-row items-center"
                  >
                    {#each data?.getAnalystStats?.mainSectors as sector}
                      <a
                        href={"/list/sector/" + sectorSelector(sector)}
                        class="cursor-pointer w-fit border border-gray-600 px-3 sm:px-4 py-2 text-sm sm:text-[1rem] font-medium rounded-md sm:hover:text-blue-400 text-white underline underline-offset-4"
                      >
                        {sector}
                      </a>
                    {/each}
                  </div>
                </div>
              </div>
            </div>

            <span class="text-[#F5F5F5] font-bold text-2xl">
              {numOfStocks} Stocks
            </span>

            <div class="w-full m-auto mt-10">
              <div
                class="w-full m-auto rounded-none sm:rounded-lg mb-4 overflow-x-scroll"
              >
                <table
                  class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto"
                >
                  <thead>
                    <tr class="bg-[#09090B]">
                      <th
                        class="text-start bg-[#09090B] text-white text-sm font-semibold"
                      >
                        Stock
                      </th>
                      <th
                        class="text-start bg-[#09090B] text-white text-sm font-semibold"
                      >
                        Action
                      </th>

                      <th
                        class="text-end bg-[#09090B] text-white text-sm font-semibold"
                      >
                        Price Target
                      </th>
                      <th class="text-white font-semibold text-end text-sm">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each stockList as item, index}
                      <tr
                        class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A]"
                      >
                        <td
                          class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                        >
                          {#if index >= 5 && data?.user?.tier !== "Pro"}
                            <a class="block relative" href="/pricing">
                              <span
                                class="text-base font-semibold text-blue-link blur group-hover:blur-[6px]"
                              >
                                XXXX
                              </span>

                              <div
                                class="ml-px max-w-[130px] truncate text-sm text-white blur group-hover:blur-[6px] lg:max-w-[150px]"
                              >
                                XXXXXXXXXXXXXXXX
                              </div>

                              <div class="absolute top-3 flex items-center">
                                <svg
                                  class="size-5 text-[#FBCE3C]"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  style="max-width: 40px;"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clip-rule="evenodd"
                                  >
                                  </path>
                                </svg>

                                <span
                                  class="ml-1 font-semibold text-gray-300 group-hover:text-white"
                                >
                                  Upgrade
                                </span>
                              </div>
                            </a>
                          {:else}
                            <div class="flex flex-col items-start">
                              <a
                                href={`/stocks/${item?.ticker}`}
                                class="sm:hover:text-white text-blue-400 text-sm sm:text-[1rem]"
                              >
                                {item?.ticker}
                              </a>
                              <span class="text-white">
                                {item?.name?.length > charNumber
                                  ? item?.name?.slice(0, charNumber) + "..."
                                  : item?.name}
                              </span>
                            </div>
                          {/if}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                        >
                          <div class="flex flex-col sm:flex-row items-start">
                            <span class="font-medium text-white mr-1"
                              >{item?.action_company}:</span
                            >
                            <span
                              class="font-medium {[
                                'Strong Buy',
                                'Buy',
                                'Outperform',
                              ]?.includes(item?.rating_current)
                                ? 'text-[#00FC50]'
                                : item?.rating_current === 'Hold'
                                  ? 'text-[#FF7070]'
                                  : [
                                        'Strong Sell',
                                        'Sell',
                                        'Underperform',
                                      ]?.includes(item?.rating_current)
                                    ? 'text-[#FF2F1F]'
                                    : 'text-gray-300'}"
                            >
                              {item?.rating_current}
                            </span>
                          </div>
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          <div class="flex flex-row items-center justify-end">
                            {#if Math?.ceil(item?.adjusted_pt_prior) !== 0}
                              <span class="text-gray-100 font-normal"
                                >{Math?.ceil(item?.adjusted_pt_prior)}</span
                              >
                              <svg
                                class="w-3 h-3 ml-1 mr-1 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="none"
                                  stroke="white"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                  d="M4 12h16m0 0l-6-6m6 6l-6 6"
                                /></svg
                              >
                              <span class="text-white font-semibold"
                                >{Math?.ceil(item?.adjusted_pt_current)}</span
                              >
                            {:else if Math?.ceil(item?.adjusted_pt_current) !== 0}
                              <span class="text-white font-semibold"
                                >{Math?.ceil(item?.adjusted_pt_current)}</span
                              >
                            {:else}
                              n/a
                            {/if}
                          </div>
                        </td>

                        <td
                          class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {new Date(item?.date).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            daySuffix: "2-digit",
                          })}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full bg-[#27272A] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href={"/pricing"}
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Pro Subscriptio
                  </h2>
                  <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Upgrade now for unlimited access to all data and tools
                </span>
              </a>
            </div>
          {/if}

          <div
            class="w-full bg-[#27272A] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-md h-fit pb-4 mt-4 cursor-pointer"
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
            class="w-full bg-[#27272A] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/analysts/top-stocks"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Stocks Picks
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Wall Street analyst ratings.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
