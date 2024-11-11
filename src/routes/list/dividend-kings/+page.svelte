<script lang="ts">
  import { screenWidth } from "$lib/store";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import DownloadData from "$lib/components/DownloadData.svelte";

  import { onMount } from "svelte";

  export let data;
  let rawData = data?.getDividendKings;
  let displayList = rawData?.slice(0, 50);

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && displayList?.length !== rawData?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      displayList = [...displayList, ...filteredNewResults];
    }
  }

  onMount(async () => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  let columns = [
    { key: "rank", label: "Rank", align: "center" },
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "dividendYield", label: "Div. Yield", align: "right" },
    { key: "years", label: "Years", align: "right" },
  ];

  let sortOrders = {
    rank: { order: "none", type: "number" },
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    price: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    dividendYield: { order: "none", type: "number" },
    years: { order: "none", type: "number" },
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

  $: charNumber = $screenWidth < 640 ? 15 : 40;
</script>

<section class="w-full overflow-hidden m-auto">
  <div
    class="w-full sm:flex sm:flex-row sm:items-center m-auto text-gray-100 border border-gray-800 sm:rounded-lg h-auto p-5 mb-4"
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

    Dividend Kings are companies that have been raising their dividend payments
    every year for 50 or more years. This is a list of all the dividend kings on
    the US stock market.
  </div>

  <div class="flex flex-row items-end justify-end w-fit ml-auto mt-5 mb-2">
    <DownloadData
      {data}
      rawData={data?.getDividendKings}
      title="dividend_aristocrats"
    />
  </div>

  <!-- Page wrapper -->
  <div class="flex justify-center w-full m-auto h-full overflow-hidden">
    <!-- Content area -->
    <div class="relative flex flex-col flex-1 overflow-x-scroll">
      <table
        class="table table-sm sm:table-md table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4"
      >
        <thead>
          <TableHeader {columns} {sortOrders} {sortData} />
        </thead>
        <tbody>
          {#each displayList as item}
            <!-- row -->
            <tr
              class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B] shake-ticker cursor-pointer"
            >
              <td
                class="text-white font-semibold sm:font-normal text-center text-sm sm:text-[1rem] border-b-[#09090B]"
              >
                {item?.rank}
              </td>

              <td class="text-[1rem] border-b-[#09090B]">
                <HoverStockChart symbol={item?.symbol} />
              </td>

              <td class="text-white border-b-[#09090B] whitespace-nowrap">
                {item?.name?.length > charNumber
                  ? item?.name?.slice(0, charNumber) + "..."
                  : item?.name}
              </td>

              <td
                class="text-white text-end text-sm sm:text-[1rem] border-b-[#09090B]"
              >
                {item?.price}
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
                class="text-white text-end text-sm sm:text-[1rem] border-b-[#09090B]"
              >
                {item?.dividendYield}%
              </td>

              <td
                class="text-white text-end text-sm sm:text-[1rem] border-b-[#09090B]"
              >
                {item?.years}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>
