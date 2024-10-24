<script lang="ts">
  import { goto } from "$app/navigation";
  import { numberOfUnreadNotification, screenWidth } from "$lib/store";
  import { onMount } from "svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import * as Card from "$lib/components/shadcn/card/index.ts";

  export let data;

  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;

  let isLoaded = false;
  let rawData = data?.getCramerTracker ?? [];
  let displayList = rawData?.slice(0, 50) ?? [];
  let cumulativeList = [];
  let winRate;

  function sectorSelector(sector) {
    let path;
    switch (sector) {
      case "Financials":
        path = "financial-sector";
        break;
      case "Healthcare":
        path = "healthcare-sector";
        break;
      case "Information Technology":
        path = "technology-sector";
        break;
      case "Technology":
        path = "technology-sector";
        break;
      case "Financial Services":
        path = "financial-sector";
        break;
      case "Industrials":
        path = "industrials-sector";
        break;
      case "Energy":
        path = "energy-sector";
        break;
      case "Utilities":
        path = "utilities-sector";
        break;
      case "Consumer Cyclical":
        path = "consumer-cyclical-sector";
        break;
      case "Real Estate":
        path = "real-estate-sector";
        break;
      case "Basic Materials":
        path = "basic-materials-sector";
        break;
      case "Communication Services":
        path = "communication-services-sector";
        break;
      case "Consumer Defensive":
        path = "consumer-defensive-sector";
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
    if (isBottom && displayList?.length !== rawData?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      displayList = [...displayList, ...filteredNewResults];
    }
  }

  function computeWinRate(data) {
    // Filter sentiments that should be considered bullish/buy or bearish/sell
    const bullishSentiments = ["bullish", "buy"];
    const bearishSentiments = ["bearish", "sell"];

    // Reduce through the array to calculate the total trades and wins
    const { wins, totalTrades } = data.reduce(
      (acc, item) => {
        const sentiment = item.sentiment.toLowerCase(); // Normalize to lower case for easier comparison
        const isBullish = bullishSentiments.some((keyword) =>
          sentiment.includes(keyword),
        );
        const isBearish = bearishSentiments.some((keyword) =>
          sentiment.includes(keyword),
        );

        // Count the total trades
        acc.totalTrades++;

        // Evaluate the wins based on sentiment and returnSince
        if (
          (isBullish && item.returnSince > 0) ||
          (isBearish && item.returnSince < 0)
        ) {
          acc.wins++;
        }

        return acc;
      },
      { wins: 0, totalTrades: 0 },
    );

    // Calculate and return the win rate percentage
    return wins / totalTrades;
  }

  onMount(() => {
    winRate = computeWinRate(rawData);

    isLoaded = true;
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: charNumber = 20;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Jim
    Carmer Tracker · stocknear
  </title>
  <meta
    name="description"
    content={`Track the stock recommendations and performance of CNBC's Jim Cramer`}
  />

  <!-- Other meta tags -->
  <meta property="og:title" content={`Jim Carmer Tracker · stocknear`} />
  <meta
    property="og:description"
    content={`Track the stock recommendations and performance of CNBC's Jim Cramer`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`Jim Carmer Tracker · stocknear`} />
  <meta
    name="twitter:description"
    content={`Track the stock recommendations and performance of CNBC's Jim Cramer`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 pb-40 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs ml-4">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Jim Cramer Tracker</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div
            class="w-full m-auto sm:bg-[#27272A] sm:rounded-xl h-auto pl-10 pr-10 pt-5 sm:pb-10 sm:pt-10 mt-3 mb-8"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <!-- Start Column -->
              <div>
                <div class="flex flex-row justify-center items-center">
                  <h1
                    class="text-3xl sm:text-4xl text-white text-center font-bold mb-5"
                  >
                    Jim Cramer Tracker
                  </h1>
                </div>

                <span
                  class="text-white text-md font-medium text-center flex justify-center items-center"
                >
                  Track the stock recommendations and performance of CNBC's Jim
                  Cramer
                </span>
              </div>
              <!-- End Column -->

              <!-- Start Column -->
              <div
                class="hidden sm:block relative m-auto mb-5 mt-5 sm:mb-0 sm:mt-0"
              >
                <svg
                  class="w-40 -my-5"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="5" result="glow" />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    fill="#1E40AF"
                    d="M57.6,-58.7C72.7,-42.6,81.5,-21.3,82,0.5C82.5,22.3,74.7,44.6,59.7,60.1C44.6,75.6,22.3,84.3,0,84.3C-22.3,84.2,-44.6,75.5,-61.1,60.1C-77.6,44.6,-88.3,22.3,-87.6,0.7C-86.9,-20.8,-74.7,-41.6,-58.2,-57.7C-41.6,-73.8,-20.8,-85.2,0.2,-85.4C21.3,-85.6,42.6,-74.7,57.6,-58.7Z"
                    transform="translate(100 100)"
                    filter="url(#glow)"
                  />
                </svg>

                <div class="z-1 absolute top-4">
                  <img
                    class="w-24 ml-7"
                    src={cloudFrontUrl + "/assets/cramer_logo.png"}
                    alt="logo"
                    loading="lazy"
                  />
                </div>
              </div>
              <!-- End Column -->
            </div>
          </div>

          {#if isLoaded}
            <div
              class="mb-8 w-full text-center sm:text-start sm:flex sm:flex-row sm:items-center m-auto text-gray-100 border border-gray-800 sm:rounded-lg h-auto p-5"
            >
              <svg
                class="w-5 h-5 inline-block sm:mr-2 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
              >
                <path
                  fill="#a474f6"
                  d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
                />
              </svg>
              <span>
                Jim Cramer was accurate in <strong
                  >{(winRate * 100)?.toFixed(0)}%</strong
                >
                of his last {rawData?.length} forecasts. Is it time to consider the
                "Inverse Cramer" strategy?
              </span>
            </div>

            <div class="w-screen sm:w-full m-auto mt-20 sm:mt-10">
              <div
                class="w-screen sm:w-full m-auto rounded-none sm:rounded-lg mb-4 overflow-x-scroll"
              >
                <table
                  class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto"
                >
                  <thead>
                    <tr class="bg-[#09090B] border-b border-[#27272A]">
                      <th
                        class="text-start bg-[#09090B] text-white text-sm sm:text-[1rem] font-semibold"
                      >
                        Company Name
                      </th>
                      <th
                        class="text-start bg-[#09090B] text-white text-sm sm:text-[1rem] font-semibold"
                      >
                        Date
                      </th>
                      <th
                        class="text-center bg-[#09090B] text-white text-sm sm:text-[1rem] font-semibold"
                      >
                        Sentiment
                      </th>
                      <th
                        class="text-end bg-[#09090B] text-white text-sm sm:text-[1rem] font-semibold"
                      >
                        Return Since
                      </th>
                      <th
                        class=" text-end bg-[#09090B] text-white text-sm sm:text-[1rem] font-semibold"
                      >
                        Sector
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each displayList as item, index}
                      <tr
                        class="sm:hover:bg-[#245073] border-b border-[#27272A] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A]"
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
                                class="ml-px max-w-[130px] truncate text-sm text-default blur group-hover:blur-[6px] lg:max-w-[150px]"
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
                                  class="ml-1 font-semibold text-muted group-hover:text-default"
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
                          class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {new Date(item?.date)?.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            daySuffix: "2-digit",
                          })}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] whitespace-nowrap {[
                            'Bullish',
                            'Buy',
                          ].includes(item?.sentiment) ||
                          item?.sentiment?.includes('Buy')
                            ? 'text-[#37C97D]'
                            : ['Bearish', 'Sell', 'Trim'].includes(
                                  item?.sentiment,
                                ) ||
                                item?.sentiment?.includes('Sell') === 'Bearish'
                              ? 'text-[#FF2F1F]'
                              : 'text-[#C6A755]'} text-center"
                        >
                          {item?.sentiment}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] {item?.returnSince >= 0
                            ? 'text-[#37C97D]'
                            : 'text-[#FF2F1F]'} text-end"
                        >
                          {item?.returnSince > 0 ? "+" : ""}{item?.returnSince}%
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap font-medium"
                        >
                          <a
                            href={"/list/" + sectorSelector(item?.sector)}
                            class="sm:hover:text-white text-blue-400"
                          >
                            {item?.sector}
                          </a>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {:else}
            <div class="flex justify-center items-center h-80">
              <div class="relative">
                <label
                  class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <span class="loading loading-spinner loading-md text-gray-400"
                  ></span>
                </label>
              </div>
            </div>
          {/if}
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              on:click={() => goto("/pricing")}
              class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
            >
              <div
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Pro Subscription 🔥
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
            on:click={() => goto("/reddit-tracker")}
            class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
          >
            <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Reddit Tracker 🚀
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest trends of r/Wallstreetbets
              </span>
            </div>
          </div>

          <div
            on:click={() => goto("/sentiment-tracker")}
            class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
          >
            <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Sentiment Tracker <svg
                    class="w-6 h-6 inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    ><g fill="none"
                      ><rect
                        width="256"
                        height="256"
                        fill="#fff"
                        rx="60"
                      /><rect
                        width="256"
                        height="256"
                        fill="#1d9bf0"
                        rx="60"
                      /><path
                        fill="#fff"
                        d="M199.572 91.411c.11 1.587.11 3.174.11 4.776c0 48.797-37.148 105.075-105.075 105.075v-.03A104.54 104.54 0 0 1 38 184.677q4.379.525 8.79.533a74.15 74.15 0 0 0 45.865-15.839a36.98 36.98 0 0 1-34.501-25.645a36.8 36.8 0 0 0 16.672-.636c-17.228-3.481-29.623-18.618-29.623-36.198v-.468a36.7 36.7 0 0 0 16.76 4.622c-16.226-10.845-21.228-32.432-11.43-49.31a104.8 104.8 0 0 0 76.111 38.582a36.95 36.95 0 0 1 10.683-35.283c14.874-13.982 38.267-13.265 52.249 1.601a74.1 74.1 0 0 0 23.451-8.965a37.06 37.06 0 0 1-16.234 20.424A73.5 73.5 0 0 0 218 72.282a75 75 0 0 1-18.428 19.13"
                      /></g
                    ></svg
                  >
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Follow the daily trends of retail investors
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 150px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 120px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
