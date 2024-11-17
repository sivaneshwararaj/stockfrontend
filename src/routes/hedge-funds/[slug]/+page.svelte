<script lang="ts">
  import { screenWidth, numberOfUnreadNotification } from "$lib/store";
  import { formatString, sectorNavigation, abbreviateNumber } from "$lib/utils";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import { onMount } from "svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  export let data;

  let hedgeFundStats = data?.getHedgeFundsData;
  let rawData = data?.getHedgeFundsData?.holdings;
  let stockList = rawData?.slice(0, 50) ?? [];
  let companyName = data?.getHedgeFundsData?.name ?? "Company Data";

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

  let columns = [
    { key: "rank", label: "Rank", align: "left" },
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "sharesNumber", label: "Shares", align: "right" },
    {
      key: "changeInSharesNumberPercentage",
      label: "% Change Shares",
      align: "right",
    },
    { key: "marketValue", label: "Market Value", align: "right" },
    { key: "avgPricePaid", label: "Avg Price", align: "right" },
    { key: "weight", label: "% Weight", align: "right" },
  ];

  let sortOrders = {
    rank: { order: "none", type: "number" },
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    sharesNumber: { order: "none", type: "number" },
    changeInSharesNumberPercentage: { order: "none", type: "number" },
    marketValue: { order: "none", type: "number" },
    avgPricePaid: { order: "none", type: "number" },
    weight: { order: "none", type: "date" },
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
      stockList = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
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
      <li><a href="/hedge-funds" class="text-gray-300">Hedge Fund</a></li>

      <li class="text-gray-300">{formatString(companyName)}</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
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
                    {formatString(companyName)}
                  </h1>
                  <p class="mb-0.5 text-sm font-semibold text-gray-300">
                    CIK Number: {data?.getHedgeFundsData?.cik}
                  </p>
                </div>
              </div>
              <div
                class="mt-4 grid grid-cols-2 overflow-hidden rounded border border-gray-600 py-2 text-center md:grid-cols-5 md:p-0 lg:mt-0 lg:border-none"
              >
                <div class="flex flex-col px-4 py-2 bp:px-6 md:py-6">
                  <div class="text-2xl font-bold tracking-tight text-white">
                    {abbreviateNumber(hedgeFundStats?.marketValue)}
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Market Value
                  </div>
                </div>

                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div class="text-2xl font-semibold tracking-tight text-white">
                    {hedgeFundStats?.numberOfStocks?.toLocaleString("en-US")}
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    # of Holdings
                  </div>
                </div>
                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div class="text-2xl font-bold tracking-tight text-white">
                    {hedgeFundStats?.averageHoldingPeriod} months
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Avg. Holding Period
                  </div>
                </div>

                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div class="text-2xl font-bold tracking-tight">
                    <span
                      class={hedgeFundStats?.winRate >= 0
                        ? "before:content-['+'] text-[#36D984]"
                        : "text-[#EF4444]"}
                      >{hedgeFundStats?.winRate?.toFixed(2)}%</span
                    >
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Win Rate
                  </div>
                </div>
                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div class="text-2xl font-bold tracking-tight text-white">
                    <span
                      class={hedgeFundStats?.performancePercentage3Year >= 0
                        ? "before:content-['+'] text-[#36D984]"
                        : "text-[#EF4444]"}
                      >{hedgeFundStats?.performancePercentage3Year?.toFixed(
                        2,
                      )}%</span
                    >
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Peformance 3-Years
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-10 mt-10 text-white">
              <div
                class="relative my-3 space-y-2 rounded border border-gray-600 sm:my-6 p-4"
              >
                <div class="flex flex-col sm:flex-row">
                  <div class="mb-2 font-semibold sm:mb-0">Main Sectors:</div>
                  <div class="flex flex-wrap gap-x-2 gap-y-px sm:ml-2">
                    {#each data?.getHedgeFundsData?.mainSectors as item}
                      <a
                        href={sectorNavigation?.find(
                          (listItem) => listItem?.title === item,
                        )?.link}
                        class="px-3 text-sm py-1 sm:text-[1rem] rounded-lg bg-white bg-opacity-[0.1] sm:hover:bg-opacity-[0.2] ml-0"
                      >
                        {item}
                      </a>
                    {/each}
                  </div>
                </div>
                <div class="flex flex-col sm:flex-row">
                  <div class="mb-2 whitespace-nowrap font-semibold sm:mb-0">
                    Top Industries:
                  </div>
                  <div class="flex flex-wrap gap-x-2 gap-y-3 sm:ml-2">
                    {#each data?.getHedgeFundsData?.mainIndustries as item}
                      <a
                        href={`/list/industry/${item?.replace(/ /g, "-")?.replace(/&/g, "and")?.replace(/-{2,}/g, "-")?.toLowerCase()}`}
                        class="px-3 text-sm py-1 sm:text-[1rem] rounded-lg bg-white bg-opacity-[0.1] sm:hover:bg-opacity-[0.2] ml-0"
                      >
                        {item}
                      </a>
                    {/each}
                  </div>
                </div>
              </div>
            </div>

            <span class="text-white font-semibold text-xl sm:text-2xl">
              {data?.getHedgeFundsData?.holdings?.length?.toLocaleString(
                "en-US",
              )} Stocks
            </span>

            <div class="w-full m-auto mt-10">
              <div
                class="w-full m-auto rounded-none sm:rounded-lg mb-4 overflow-x-scroll"
              >
                <table
                  class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto"
                >
                  <thead>
                    <TableHeader {columns} {sortOrders} {sortData} />
                  </thead>
                  <tbody>
                    {#each stockList as item}
                      <tr
                        class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] text-white"
                      >
                        <td
                          class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                        >
                          {item?.rank}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                        >
                          <HoverStockChart
                            symbol={item?.symbol}
                            assetType={item?.type}
                          />
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] text-start whitespace-nowrap text-white"
                        >
                          {item?.name?.length > charNumber
                            ? item?.name?.slice(0, charNumber) + "..."
                            : item?.name}
                        </td>

                        <td
                          class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.sharesNumber !== null
                            ? abbreviateNumber(item?.sharesNumber)
                            : "n/a"}
                        </td>

                        <td
                          class="{item?.changeInSharesNumberPercentage > 0
                            ? "before:content-['+'] text-[#00FC50]"
                            : item?.changeInSharesNumberPercentage < 0
                              ? 'text-[#FF2F1F]'
                              : 'text-white'} text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.changeInSharesNumberPercentage !== 0
                            ? abbreviateNumber(
                                item?.changeInSharesNumberPercentage?.toFixed(
                                  2,
                                ),
                              ) + "%"
                            : "-"}
                        </td>

                        <td
                          class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.marketValue !== null
                            ? abbreviateNumber(item?.marketValue)
                            : "n/a"}
                        </td>

                        <td
                          class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.avgPricePaid}
                        </td>
                        <td
                          class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.weight >= 0.01
                            ? item?.weight?.toFixed(2)
                            : "< 0.01"}%
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
