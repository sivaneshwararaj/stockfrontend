<script lang="ts">
  import { numberOfUnreadNotification, screenWidth } from "$lib/store";
  import { onMount } from "svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import RatingsChart from "$lib/components/RatingsChart.svelte";

  export let data;

  let rawData = processTickerData(data?.getCramerTracker);
  let originalData = [...rawData]; // Unaltered copy of raw data

  let stockList = rawData?.slice(0, 50) ?? [];
  let winRate;

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;

    if (isBottom && stockList?.length !== originalData?.length) {
      const nextIndex = stockList?.length;
      const filteredNewResults = originalData?.slice(nextIndex, nextIndex + 50);
      stockList = [...stockList, ...filteredNewResults];
    }
  }

  function processTickerData(data) {
    const tickerMap = new Map();

    data.forEach((item) => {
      const { ticker } = item;

      if (!ticker) return; // Skip if ticker is not defined

      if (!tickerMap.has(ticker)) {
        // Add the item and initialize count
        tickerMap.set(ticker, { ...item, ratings: 1 });
      } else {
        const existing = tickerMap.get(ticker);

        // Increment the ratings count
        existing.ratings += 1;

        // Keep the item with the latest date
        if (new Date(item?.date) > new Date(existing?.date)) {
          tickerMap.set(ticker, {
            ...item,
            ratings: existing?.ratings,
          });
        }
      }
    });

    // Convert the Map back to an array
    return Array?.from(tickerMap?.values());
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: charNumber = 20;

  $: columns = [
    ...($screenWidth > 1024
      ? [{ key: "chart", label: "", align: "right" }]
      : []),
    { key: "ticker", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "sentiment", label: "Sentiment", align: "right" },
    { key: "returnSince", label: "Return Since", align: "right" },
    { key: "ratings", label: "Ratings", align: "right" },
    { key: "date", label: "Date", align: "right" },
  ];

  $: sortOrders = {
    chart: { order: "none", type: "string" },
    date: { order: "none", type: "date" },
    ticker: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    sentiment: { order: "none", type: "string" },
    returnSince: { order: "none", type: "number" },
    ratings: { order: "none", type: "number" },
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

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...rawData]; // Reset originalData to rawData
      stockList = originalData?.slice(0, 50); // Reset displayed data
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
    stockList = [...originalData].sort(compareValues)?.slice(0, 50);
  };
  $: checkedSymbol = "";
  function openGraph(symbol) {
    // Clear all existing symbols
    if (checkedSymbol === symbol) {
      checkedSymbol = "";
    } else {
      checkedSymbol = symbol;
    }
  }
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
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
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

          <div
            class=" w-full text-start sm:flex sm:flex-row sm:items-center m-auto text-gray-100 border border-gray-800 sm:rounded-md h-auto p-5"
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
            We update our data in realtime to provide you with the latest stock picks
            of Jim Cramer.
          </div>

          <div class="w-full m-auto mt-10">
            <div
              class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-scroll"
            >
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto"
              >
                <thead>
                  <TableHeader {columns} {sortOrders} {sortData} />
                </thead>
                <tbody>
                  {#each stockList as item}
                    <tr
                      class="sm:hover:bg-[#245073] border-b border-[#27272A] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A]"
                    >
                      <td class="hidden lg:table-cell"
                        ><button
                          on:click={() => openGraph(item?.ticker)}
                          class="h-full pl-2 pr-2 align-middle lg:pl-3"
                          ><svg
                            class="w-5 h-5 text-icon {checkedSymbol ===
                            item?.ticker
                              ? 'rotate-180'
                              : ''}"
                            viewBox="0 0 20 20"
                            fill="white"
                            style="max-width:40px"
                            ><path
                              fill-rule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clip-rule="evenodd"
                            ></path></svg
                          ></button
                        ></td
                      >
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
                        class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {item?.ratings !== null ? item?.ratings : "n/a"}
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
                    {#if checkedSymbol === item?.ticker}
                      <tr
                        ><td colspan="8" class="px-0" style=""
                          ><div class="-mt-0.5 px-0 pb-2">
                            <div class="relative h-[400px]">
                              <div class="absolute top-0 w-full">
                                <div
                                  class="h-[250px] w-full xs:h-[300px] sm:h-[400px]"
                                  style="overflow: hidden;"
                                >
                                  <div
                                    style="position: relative; height: 0px; z-index: 1;"
                                  >
                                    <RatingsChart
                                      ratingsList={data?.getCramerTracker?.map(
                                        (item) => ({
                                          ...item,
                                          type: item?.sentiment,
                                        }),
                                      )}
                                      symbol={item?.ticker}
                                      numOfRatings={item?.ratings}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div></td
                        >
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
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
