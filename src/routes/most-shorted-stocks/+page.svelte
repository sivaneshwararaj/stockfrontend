<script lang="ts">
  import { numberOfUnreadNotification, screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  export let data;

  let isLoaded = false;
  let rawData = [];
  let stockList = [];

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && stockList?.length !== rawData?.length) {
      const nextIndex = stockList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      stockList = [...stockList, ...filteredNewResults];
    }
  }

  onMount(() => {
    rawData = data?.getMostShortedStocks ?? [];
    stockList = rawData?.slice(0, 50) ?? [];
    isLoaded = true;

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  let columns = [
    { key: "rank", label: "Rank", align: "right" },
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "shortRatio", label: "Short Ratio", align: "right" },
    { key: "sharesShort", label: "Short Interest", align: "right" },
    { key: "shortFloatPercent", label: "Short % Float", align: "right" },
    {
      key: "shortOutStandingPercent",
      label: "Short % of Shares Out",
      align: "right",
    },
  ];

  let sortOrders = {
    rank: { order: "none", type: "number" },
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    shortRatio: { order: "none", type: "number" },
    sharesShort: { order: "none", type: "number" },
    shortFloatPercent: { order: "none", type: "number" },
    shortOutStandingPercent: { order: "none", type: "number" },
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
      stockList = [...originalData]; // Reset to original data (spread to avoid mutation)
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
    stockList = [...originalData].sort(compareValues);
  };

  $: charNumber = $screenWidth < 640 ? 15 : 20;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} High
    Short Interest Stocks · stocknear
  </title>
  <meta
    name="description"
    content={`Short interest, stock short squeeze, short interest ratio & short selling data positions for NASDAQ, NYSE & AMEX stocks to find shorts in the stock market.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`High Short Interest Stocks · stocknear`}
  />
  <meta
    property="og:description"
    content={`Short interest, stock short squeeze, short interest ratio & short selling data positions for NASDAQ, NYSE & AMEX stocks to find shorts in the stock market.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`High Short Interest Stocks · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Short interest, stock short squeeze, short interest ratio & short selling data positions for NASDAQ, NYSE & AMEX stocks to find shorts in the stock market.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-screen-2xl overflow-hidden min-h-screen pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Top Shorted Stocks</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[3px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Top Shorted Stocks
            </h1>
            <p class="mb-3 px-1 text-base font-semibold text-muted sm:px-0">
              High short-interest stocks are volatile and prone to short
              squeezes.
            </p>
          </div>

          {#if isLoaded}
            <div class="w-full m-auto mt-20 sm:mt-10">
              <div
                class="w-full m-auto rounded-none sm:rounded-lg mb-4 overflow-x-scroll sm:overflow-hidden"
              >
                <table
                  class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto"
                >
                  <thead>
                    <TableHeader {columns} {sortOrders} {sortData} />
                  </thead>
                  <tbody>
                    {#each stockList as item, index}
                      <tr
                        class="border-b border-[#27272A] sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] {index +
                          1 ===
                          stockList?.length && data?.user?.tier !== 'Pro'
                          ? 'opacity-[0.1]'
                          : ''}"
                      >
                        <td
                          class="text-white text-sm sm:text-[1rem] font-medium text-white text-center"
                        >
                          {item?.rank}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] whitespace-nowrap text-start"
                        >
                          <HoverStockChart symbol={item?.symbol} />
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap text-white text-start"
                        >
                          {item?.name?.length > charNumber
                            ? item?.name?.slice(0, charNumber) + "..."
                            : item?.name}
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap font-medium text-white"
                        >
                          {item?.shortRatio}
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap font-medium text-white"
                        >
                          {abbreviateNumber(item?.sharesShort)}
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap font-medium text-white"
                        >
                          {item?.shortFloatPercent}%
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap font-medium text-white"
                        >
                          {item?.shortOutStandingPercent}%
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
          {#if isLoaded}
            <UpgradeToPro
              {data}
              title="Get stock forecasts from Wall Street's highest rated professionals"
            />
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
                  Upgrade now for unlimited access to all data and tools
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
                Get the latest top Wall Street analyst ratings
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
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
