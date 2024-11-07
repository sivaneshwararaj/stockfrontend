<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import { onMount } from "svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";

  export let data;

  let isLoaded = false;
  let rawData = data?.getCramerTracker ?? [];
  let displayList = rawData?.slice(0, 50) ?? [];
  let winRate;

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

  let columns = [
    { key: "date", label: "Date", align: "left" },
    { key: "ticker", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "sentiment", label: "Sentiment", align: "right" },
    { key: "returnSince", label: "Return Since", align: "right" },
    { key: "sector", label: "Sector", align: "right" },
  ];

  let sortOrders = {
    date: { order: "none", type: "date" },
    ticker: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    sentiment: { order: "none", type: "string" },
    returnSince: { order: "none", type: "number" },
    sector: { order: "none", type: "string" },
  };

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];

    let originalData = rawData;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      displayList = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
      return;
    }

    // Define a generic comparison function
    const compareValues = (a, b) => {
      const { type } = sortOrders[key];
      let valueA, valueB;

      switch (type) {
        case "date":
          valueA = new Date(a[key]);
          valueB = new Date(b[key]);
          break;
        case "string":
          valueA = a[key].toUpperCase();
          valueB = b[key].toUpperCase();
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    };

    // Sort using the generic comparison function
    displayList = [...originalData].sort(compareValues)?.slice(0, 50);
  };
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
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
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
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Jim Cramer Tracker
            </h1>
            <p class="mb-3 px-1 text-base font-semibold text-muted sm:px-0">
              Track the stock recommendations and performance of CNBC's Jim
              Cramer
            </p>
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
                  fill="#fff"
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

            <div class="w-full m-auto mt-20 sm:mt-10">
              <div
                class="w-full m-auto rounded-none sm:rounded-lg mb-4 overflow-x-scroll"
              >
                <table
                  class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto"
                >
                  <thead>
                    <TableHeader {columns} {sortOrders} {sortData} />
                  </thead>
                  <tbody>
                    {#each displayList as item}
                      <tr
                        class="sm:hover:bg-[#245073] border-b border-[#27272A] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A]"
                      >
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
                          class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                        >
                          <HoverStockChart symbol={item?.ticker} />
                        </td>

                        <td
                          class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.name?.length > charNumber
                            ? item?.name?.slice(0, charNumber) + "..."
                            : item?.name}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] whitespace-nowrap {[
                            'Bullish',
                            'Buy',
                          ].includes(item?.sentiment) ||
                          item?.sentiment?.includes('Buy')
                            ? 'text-[#00FC50]'
                            : ['Bearish', 'Sell', 'Trim'].includes(
                                  item?.sentiment,
                                ) ||
                                item?.sentiment?.includes('Sell') === 'Bearish'
                              ? 'text-[#FF2F1F]'
                              : 'text-[#C6A755]'} text-end"
                        >
                          {item?.sentiment}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] {item?.returnSince >= 0
                            ? 'text-[#00FC50]'
                            : 'text-[#FF2F1F]'} text-end"
                        >
                          {item?.returnSince > 0 ? "+" : ""}{item?.returnSince}%
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap font-medium"
                        >
                          <a
                            href={"/list/sector/" +
                              sectorSelector(item?.sector)}
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
              href={"/reddit-tracker"}
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

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/sentiment-tracker"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Sentiment Tracker
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Follow the daily trends of retail investors
              </span>
            </a>
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
