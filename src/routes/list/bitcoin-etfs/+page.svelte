<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import DownloadData from "$lib/components/DownloadData.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = data?.getETFBitcoinList;
  let displayList = rawData;

  const totalAssets = rawData?.reduce(
    (total, etf) => total + etf?.totalAssets,
    0,
  );
  const avgExpenseRatio =
    rawData?.reduce((total, item) => total + item?.expenseRatio || 0, 0) /
    rawData?.length;

  let columns = [
    { key: "rank", label: "Rank", align: "center" },
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "expenseRatio", label: "Expense Ratio", align: "right" },
    { key: "totalAssets", label: "Assets", align: "right" },
  ];

  let sortOrders = {
    rank: { order: "none", type: "number" },
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    price: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    expenseRatio: { order: "none", type: "number" },
    totalAssets: { order: "none", type: "number" },
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

    let originalData = data?.getETFBitcoinList;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      displayList = [...originalData]; // Reset to original data (spread to avoid mutation)
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
    displayList = [...originalData].sort(compareValues);
  };

  $: charNumber = $screenWidth < 640 ? 15 : 20;
</script>

<SEO
  title="Bitcoin ETFs - A Complete List"
  description="A list of all the bitcoin ETFs trading on the US stock market. These funds provide exposure to the price of bitcoin."
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text=" A list of all Bitcoin ETFs available for trading on the US stock market,
    offering investors exposure to the cryptocurrency's price."
  />

  <div
    class="mt-6 mb-4 flex flex-col divide-y divide-gray-600 rounded-md border border-gray-600 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0"
  >
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-[1rem] font-semibold text-white">Total ETFs</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white text-xl sm:text-2xl"
        >
          {new Intl.NumberFormat("en")?.format(rawData?.length)}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-[1rem] font-semibold text-white">Total Assets</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white text-xl sm:text-2xl"
        >
          {abbreviateNumber(totalAssets)}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-[1rem] font-semibold text-white">Avg. Cost</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white text-xl sm:text-2xl"
        >
          {avgExpenseRatio?.toFixed(2)}%
        </div>
      </div>
    </div>
  </div>

  <div class="flex flex-row items-end justify-end w-fit ml-auto mt-5 mb-2">
    <DownloadData
      {data}
      rawData={data?.getETFBitcoinList}
      title="etf_bitcoin_list"
    />
  </div>

  <!-- Page wrapper -->
  <div class="flex justify-center w-full m-auto h-full overflow-hidden">
    <!-- Content area -->
    <div class="w-full overflow-x-scroll">
      <table
        class="table rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto mt-4"
      >
        <thead>
          <TableHeader {columns} {sortOrders} {sortData} />
        </thead>
        <tbody>
          {#each displayList as item}
            <!-- row -->
            <tr
              class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800"
            >
              <td
                class="text-white font-semibold sm:font-normal text-center text-sm sm:text-[1rem]"
              >
                {item?.rank}
              </td>

              <td class="text-[1rem]">
                <HoverStockChart symbol={item?.symbol} assetType="etf" />
              </td>

              <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap">
                {item?.name?.length > charNumber
                  ? item?.name?.slice(0, charNumber) + "..."
                  : item?.name}
              </td>

              <td class="text-white text-end text-sm sm:text-[1rem]">
                {item?.price}
              </td>

              <td class="text-white text-end text-sm sm:text-[1rem]">
                {#if item?.changesPercentage >= 0}
                  <span class="text-[#00FC50]"
                    >+{item.changesPercentage?.toFixed(2)}%</span
                  >
                {:else}
                  <span class="text-[#FF2F1F]"
                    >{item.changesPercentage?.toFixed(2)}%
                  </span>
                {/if}
              </td>

              <td class="text-white text-end text-sm sm:text-[1rem]">
                {item?.expenseRatio}%
              </td>

              <td
                class="text-white font-medium text-end text-sm sm:text-[1rem] whitespace-nowrap"
              >
                {abbreviateNumber(item?.totalAssets)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>
