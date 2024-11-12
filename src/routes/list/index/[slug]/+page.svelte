<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import DownloadData from "$lib/components/DownloadData.svelte";

  export let data;

  let rawData = data?.getIndexCategory;
  let stockList = rawData?.slice(0, 50);

  let totalMarketCap = rawData?.reduce(
    (total, stock) => total + stock?.marketCap,
    0,
  );
  let totalRevenue = rawData?.reduce(
    (total, stock) => total + stock?.revenue,
    0,
  );

  const indexNavigation = {
    nasdaq100:
      "A list of all stocks in the NASDAQ 100, an index of the top 100 non-financial companies on the Nasdaq exchange. Although there are 100 companies, there are 101 stock tickers, as Alphabet has two symbols.",
    dowjones:
      "A list of the 30 stocks in the Dow Jones Industrial Average stock index, which is an index of 30 major companies listed on stock exchanges in the U.S.",
    sp500:
      "A list of all stocks in the S&P 500, an index of the 500 largest U.S.-listed companies. There are over 500 tickers, as some companies have multiple symbols.",
  };

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

  let columns = [
    { key: "rank", label: "Rank", align: "left" },
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "marketCap", label: "Market Cap", align: "right" },

    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },

    { key: "revenue", label: "Revenue", align: "right" },
  ];

  let sortOrders = {
    rank: { order: "none", type: "number" },
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    price: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },

    marketCap: { order: "none", type: "number" },
    revenue: { order: "none", type: "number" },
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

    let originalData = data?.getIndexCategory;

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

  $: charNumber = $screenWidth < 640 ? 15 : 20;
</script>

<section class="w-full overflow-hidden m-auto">
  <div
    class="w-full m-auto text-white border border-gray-600 rounded-md h-auto p-5 mb-4"
  >
    {indexNavigation[data?.getParams?.toLowerCase()]}
  </div>

  <div
    class="mb-4 flex flex-col divide-y divide-gray-600 rounded-md border border-gray-600 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0"
  >
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-normal text-white">Total Stocks</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white tiny:text-lg xs:text-xl sm:text-2xl"
        >
          {new Intl.NumberFormat("en")?.format(rawData?.length)}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-normal text-white">Total Market Cap</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white tiny:text-lg xs:text-xl sm:text-2xl"
        >
          {abbreviateNumber(totalMarketCap)}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-normal text-white">Total Revenue</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white tiny:text-lg xs:text-xl sm:text-2xl"
        >
          {abbreviateNumber(totalRevenue)}
        </div>
      </div>
    </div>
  </div>

  <div class="flex flex-row items-end justify-end w-fit ml-auto mt-5 mb-2">
    <DownloadData
      {data}
      rawData={data?.getIndexCategory}
      title={data?.getParams}
    />
  </div>

  <!-- Page wrapper -->
  <div class="flex justify-center w-full m-auto h-full overflow-hidden">
    <!-- Content area -->
    <div class="w-full overflow-x-scroll">
      <div class="w-full overflow-x-scroll">
        <table
          class="table table-sm table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4"
        >
          <thead>
            <TableHeader {columns} {sortOrders} {sortData} />
          </thead>
          <tbody>
            {#each stockList as item, index}
              <!-- row -->
              <tr
                class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B]"
              >
                <td
                  class="text-white text-center font-medium text-sm sm:text-[1rem] border-b-[#09090B]"
                >
                  {item?.rank}
                </td>

                <td
                  class="text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
                >
                  <HoverStockChart symbol={item?.symbol} />
                </td>

                <td
                  class="text-gray-200 border-b-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap"
                >
                  {item?.name?.length > charNumber
                    ? item?.name?.slice(0, charNumber) + "..."
                    : item?.name}
                </td>

                <td
                  class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
                >
                  {abbreviateNumber(item?.marketCap)}
                </td>

                <td
                  class="text-white text-end border-b-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap"
                >
                  {item.price?.toFixed(2)}
                </td>

                <td
                  class="text-white text-end border-b-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap"
                >
                  {#if item?.changesPercentage >= 0}
                    <span class="text-[#00FC50]"
                      >+{item?.changesPercentage?.toFixed(2)}%</span
                    >
                  {:else}
                    <span class="text-[#FF2F1F]"
                      >{item?.changesPercentage?.toFixed(2)}%</span
                    >
                  {/if}
                </td>

                <td
                  class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
                >
                  {item?.revenue !== null
                    ? abbreviateNumber(item?.revenue)
                    : "-"}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>
