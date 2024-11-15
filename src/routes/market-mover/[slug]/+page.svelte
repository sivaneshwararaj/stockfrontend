<script lang="ts">
  import { screenWidth, numberOfUnreadNotification } from "$lib/store";
  import { abbreviateNumber, getLastTradingDay } from "$lib/utils";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import DownloadData from "$lib/components/DownloadData.svelte";

  import { afterUpdate } from "svelte";
  export let data;
  let timePeriod = "1D";
  const lastTradingDay = new Date(getLastTradingDay() ?? null)?.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
  const displayTitle = {
    "1D": "title Today",
    "1W": "Week title",
    "1M": "Month title",
    "1Y": "1 Year title",
    "3Y": "3 Year title",
    "5Y": "5 Year title",
  };
  let rawData = data?.getMarketMover[data?.getParams];
  let stockList = rawData[timePeriod];

  function selectTimeInterval(state) {
    timePeriod = state;
    stockList = rawData[timePeriod];
  }

  let columns = [
    { key: "rank", label: "Rank", align: "center" },
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "price", label: "Price", align: "right" },
    { key: "marketCap", label: "Market Cap", align: "right" },
    { key: "volume", label: "Volume", align: "right" },
  ];

  let sortOrders = {
    rank: { order: "none", type: "number" },
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    changesPercentage: { order: "none", type: "number" },
    price: { order: "none", type: "number" },
    marketCap: { order: "none", type: "number" },
    volume: { order: "none", type: "number" },
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
      stockList = [...rawData[timePeriod]]; // Reset to original data (spread to avoid mutation)
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
    stockList = [...rawData[timePeriod]].sort(compareValues);
  };

  let previousTimePeriod;
  let previousPage = data?.getParams;
  let title;

  afterUpdate(() => {
    if (timePeriod !== previousTimePeriod || previousPage !== data?.getParams) {
      previousTimePeriod = timePeriod;
      previousPage = data?.getParams;
      rawData = data?.getMarketMover[data?.getParams];
      stockList = rawData[timePeriod];
      title =
        data?.getParams?.charAt(0)?.toUpperCase() + data?.getParams?.slice(1);
    }
  });

  $: charNumber = $screenWidth < 640 ? 20 : 30;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Today's
    Top Stock {title} · stocknear
  </title>
  <meta
    name="description"
    content={`A list of the stocks with the highest percentage gain, highest percentage loss and most active today. See stock price, volume, market cap and more.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`Today's Top Stock ${title} · stocknear`}
  />
  <meta
    property="og:description"
    content={`A list of the stocks with the highest percentage gain, highest percentage loss and most active today. See stock price, volume, market cap and more.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`Today's Top Stock ${title} · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`A list of the stocks with the highest percentage gain, highest percentage loss and most active today. See stock price, volume, market cap and more.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full overflow-hidden m-auto min-h-screen">
  <div class="flex justify-center w-full m-auto overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <!--Start Top Winners/Losers-->

        <nav class=" pt-1 overflow-x-scroll whitespace-nowrap">
          <ul
            class="flex flex-row items-center w-full text-sm sm:text-[1rem] text-white"
          >
            <li
              on:click={() => selectTimeInterval("1D")}
              class="p-2 px-5 cursor-pointer {timePeriod === '1D'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              Today
            </li>
            <li
              on:click={() => selectTimeInterval("1W")}
              class="p-2 px-5 cursor-pointer {timePeriod === '1W'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              Week
            </li>
            <li
              on:click={() => selectTimeInterval("1M")}
              class="p-2 px-5 cursor-pointer {timePeriod === '1M'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              Month
            </li>
            <li
              on:click={() => selectTimeInterval("1Y")}
              class="p-2 px-5 cursor-pointer {timePeriod === '1Y'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              Year
            </li>
            <li
              on:click={() => selectTimeInterval("3Y")}
              class="p-2 px-5 cursor-pointer {timePeriod === '3Y'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              3 Years
            </li>
            <li
              on:click={() => selectTimeInterval("5Y")}
              class="p-2 px-5 cursor-pointer {timePeriod === '5Y'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              5 Years
            </li>
          </ul>
        </nav>

        <div
          class="flex flex-col justify-center items-center overflow-hidden mt-10"
        >
          <div class="controls groups w-full">
            <div
              class="title-group flex flex-row items-center justify-start mb-3"
            >
              <h1 class="text-white text-xl sm:text-2xl font-semibold">
                {displayTitle[timePeriod]?.replace("title", title)}
              </h1>
              {#if timePeriod === "1D" && ["Gainers", "Losers"]?.includes(title)}
                <InfoModal
                  title={`${title} Today`}
                  content={`The stocks with the highest percentage ${title === "Gainers" ? "gains" : "loss"} today, updated every two minutes during market open. Excludes stocks with a market cap under 10M and volume under 50K.`}
                  id={"marketmoverId"}
                />
              {/if}

              <div
                class="mb-0 ml-5 mt-1 whitespace-nowrap text-sm font-semiboldt text-white"
              >
                <span class="hidden lg:inline">Updated</span>
                {lastTradingDay}
              </div>

              <div
                class="flex flex-row items-center justify-end w-fit sm:w-[50%] md:w-auto ml-auto"
              >
                <DownloadData
                  {data}
                  rawData={rawData[timePeriod]}
                  title={data?.getParams + "_" + timePeriod ?? "data"}
                />
              </div>
            </div>
          </div>

          <div class="w-full overflow-x-scroll no-scrollbar">
            <table
              class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B]"
            >
              <thead>
                <TableHeader {columns} {sortOrders} {sortData} />
              </thead>
              <tbody>
                {#each stockList as item}
                  <tr
                    class="border-b border-[#27272A] sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A]"
                  >
                    <td
                      class="text-white text-sm sm:text-[1rem] text-center border-b-[#09090B]"
                    >
                      {item?.rank}
                    </td>

                    <td
                      class="border-b-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap"
                    >
                      <HoverStockChart symbol={item?.symbol} />
                    </td>
                    <td
                      class="border-b-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap text-white"
                    >
                      {item?.name?.length > charNumber
                        ? item?.name?.slice(0, charNumber) + "..."
                        : item?.name}
                    </td>

                    <td
                      class="text-white text-end text-sm sm:text-[1rem] font-medium border-b-[#09090B]"
                    >
                      {#if item?.changesPercentage >= 0}
                        <span class="text-[#00FC50]"
                          >+{item?.changesPercentage >= 1000
                            ? abbreviateNumber(item?.changesPercentage)
                            : item?.changesPercentage?.toFixed(2)}%</span
                        >
                      {:else}
                        <span class="text-[#FF2F1F]"
                          >{item?.changesPercentage <= -1000
                            ? abbreviateNumber(item?.changesPercentage)
                            : item?.changesPercentage?.toFixed(2)}%
                        </span>
                      {/if}
                    </td>

                    <td
                      class="text-white text-sm sm:text-[1rem] text-end border-b-[#09090B]"
                    >
                      {item?.price?.toFixed(2)}
                    </td>

                    <td
                      class="text-white text-sm sm:text-[1rem] border-b-[#09090B] text-end"
                    >
                      {item?.marketCap !== null
                        ? abbreviateNumber(item?.marketCap)
                        : "-"}
                    </td>

                    <td
                      class="text-white text-sm sm:text-[1rem] border-b-[#09090B] text-end"
                    >
                      {item?.volume !== null
                        ? abbreviateNumber(item?.volume)
                        : "-"}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
</section>
