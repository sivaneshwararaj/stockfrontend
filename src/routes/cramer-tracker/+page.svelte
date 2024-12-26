<script lang="ts">
  import { numberOfUnreadNotification, screenWidth } from "$lib/store";
  import { onMount } from "svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import RatingsChart from "$lib/components/RatingsChart.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
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
      const { ticker, returnSince } = item;

      if (!ticker) return; // Skip if ticker is not defined

      if (!tickerMap.has(ticker)) {
        // Add the item, initialize count, and initialize sum of returnSince
        tickerMap.set(ticker, {
          ...item,
          ratings: 1,
          totalReturn: returnSince || 0,
        });
      } else {
        const existing = tickerMap.get(ticker);

        // Increment the ratings count and add to totalReturn
        existing.ratings += 1;
        existing.totalReturn += returnSince || 0;

        // Keep the item with the latest date
        if (new Date(item?.date) > new Date(existing?.date)) {
          tickerMap.set(ticker, {
            ...item,
            ratings: existing?.ratings,
            totalReturn: existing?.totalReturn, // Keep the accumulated return
          });
        }
      }
    });

    // Convert the Map back to an array with avgReturn computed
    return Array.from(tickerMap.values()).map((item) => ({
      ...item,
      avgReturn: (item.totalReturn / item.ratings)?.toFixed(2), // Compute average return
    }));
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
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "sentiment", label: "Sentiment", align: "right" },
    { key: "avgReturn", label: "Avg Return", align: "right" },
    { key: "ratings", label: "Ratings", align: "right" },
    { key: "date", label: "Date", align: "right" },
  ];

  $: sortOrders = {
    chart: { order: "none", type: "string" },
    date: { order: "none", type: "date" },
    ticker: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    price: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    sentiment: { order: "none", type: "string" },
    avgReturn: { order: "none", type: "number" },
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
    Carmer Tracker · Stocknear
  </title>
  <meta
    name="description"
    content={`Track the stock recommendations and performance of CNBC's Jim Cramer`}
  />

  <!-- Other meta tags -->
  <meta property="og:title" content={`Jim Carmer Tracker · Stocknear`} />
  <meta
    property="og:description"
    content={`Track the stock recommendations and performance of CNBC's Jim Cramer`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`Jim Carmer Tracker · Stocknear`} />
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
        <main class="w-full">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Jim Cramer Tracker
            </h1>
            <p class="mb-3 px-1 text-base font-semibold text-muted sm:px-0">
              Track the stock recommendations and performance of CNBC's Jim
              Cramer
            </p>
          </div>

          <Infobox
            text={"We update our data in realtime to provide you with the latest stock picks of Jim Cramer."}
          />

          <div class="w-full m-auto mt-10">
            <div
              class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-scroll"
            >
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto"
              >
                <thead>
                  <TableHeader {columns} {sortOrders} {sortData} />
                </thead>
                <tbody>
                  {#each stockList as item, index}
                    <tr
                      class="sm:hover:bg-[#245073] border-b border-gray-800 sm:hover:bg-opacity-[0.2] odd:bg-odd {index +
                        1 ===
                        rawData?.length && data?.user?.tier !== 'Pro'
                        ? 'opacity-[0.1]'
                        : ''}"
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
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                      >
                        {item?.price}
                      </td>

                      <td
                        class="text-sm sm:text-[1rem] {item?.changesPercentage >=
                        0
                          ? "text-[#00FC50] before:content-['+'] "
                          : 'text-[#FF2F1F]'} text-end"
                      >
                        {item?.changesPercentage}%
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
                        class="text-sm sm:text-[1rem] {item?.avgReturn >= 0
                          ? "text-[#00FC50] before:content-['+'] "
                          : 'text-[#FF2F1F]'} text-end"
                      >
                        {item?.avgReturn}%
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
                        ><td colspan="9" class="px-0" style=""
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
            <UpgradeToPro {data} />
          </div>
        </main>
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
