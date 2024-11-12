<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import DownloadData from "$lib/components/DownloadData.svelte";

  export let data;
  let rawData = data?.getMagnificentSeven;
  let stockList = rawData;

  let totalMarketCap =
    rawData?.reduce((total, stock) => total + stock?.marketCap, 0) ?? 0;
  let totalRevenue =
    rawData?.reduce((total, stock) => total + stock?.revenue, 0) ?? 0;
  let totalProfits =
    rawData?.reduce((total, stock) => total + stock?.netIncome, 0) ?? 0;
  let avgPERatio = (
    (rawData?.reduce((total, stock) => total + stock?.pe, 0) ?? 0) /
    rawData?.length
  )?.toFixed(2);

  let columns = [
    { key: "rank", label: "Rank", align: "center" },
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },

    { key: "marketCap", label: "Market Cap", align: "right" },
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

<section class="w-full overflow-hidden m-auto">
  <div
    class="w-full border border-gray-600 sm:flex sm:flex-row sm:items-center m-auto text-white bg-[#09090B] sm:rounded-lg h-auto p-5 mb-4"
  >
    <svg
      class="w-5 h-5 inline-block sm:mr-2 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      ><path
        fill="#fff"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
      /></svg
    >

    The "magnificent seven" stocks are 7 technology stocks that drove a large
    portion of the market's returns in 2023 and 2024. The list includes Apple,
    Microsoft, Amazon, Alphabet (Google), Tesla, Nvidia and Meta Platforms.
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
    <DownloadData {data} {rawData} title="magnificent-seven" />
  </div>

  <!-- Page wrapper -->
  <div class="flex justify-center w-full m-auto h-full overflow-hidden">
    <!-- Content area -->
    <div class="w-full overflow-x-scroll">
      <table
        class="table table-sm sm:table-md table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4"
      >
        <thead>
          <TableHeader {columns} {sortOrders} {sortData} />
        </thead>
        <tbody>
          {#each stockList as item}
            <!-- row -->
            <tr
              class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B] text-white"
            >
              <td
                class="text-center text-sm sm:text-[1rem] whitespace-nowrap font-medium border-b-[#09090B]"
              >
                {item?.rank}
              </td>

              <td
                class="text-blue-400 text-sm sm:text-[1rem] whitespace-nowrap font-medium border-b-[#09090B]"
              >
                <HoverStockChart symbol={item?.symbol} />
              </td>

              <td
                class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
              >
                {item?.name?.length > charNumber
                  ? item?.name?.slice(0, charNumber) + "..."
                  : item?.name}
              </td>

              <td
                class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end border-b-[#09090B]"
              >
                {item.price?.toFixed(2)}
              </td>

              <td
                class="text-white text-end text-sm sm:text-[1rem] border-b-[#09090B]"
              >
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

              <td
                class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end border-b-[#09090B]"
              >
                {item?.marketCap !== null
                  ? abbreviateNumber(item?.marketCap)
                  : "-"}
              </td>
              <td
                class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end border-b-[#09090B]"
              >
                {item?.revenue !== null ? abbreviateNumber(item?.revenue) : "-"}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>
