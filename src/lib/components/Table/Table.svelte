<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import DownloadData from "$lib/components/DownloadData.svelte";

  export let data;
  export let rawData;

  let stockList = rawData?.slice(0, 50);

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

  // Function to generate columns based on keys in rawData
  function generateColumns(data) {
    const alignments = {
      rank: "left",
      symbol: "left",
      name: "left",
      marketCap: "right",
      price: "right",
      changesPercentage: "right",
      revenue: "right",
    };

    // Define preferred order for columns
    const preferredOrder = ["rank", "symbol", "name"];

    // Separate preferred keys and other keys
    const keys = Object.keys(data[0]);
    const orderedKeys = [
      ...preferredOrder.filter((key) => keys.includes(key)),
      ...keys.filter((key) => !preferredOrder.includes(key)),
    ];

    return orderedKeys.map((key) => ({
      key: key,
      label:
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      align: alignments[key] || "left",
    }));
  }

  // Function to generate sortOrders based on keys in rawData
  function generateSortOrders(data) {
    const types = {
      rank: "number",
      symbol: "string",
      name: "string",
      marketCap: "number",
      price: "number",
      changesPercentage: "number",
      revenue: "number",
    };

    return Object.keys(data[0]).reduce((orders, key) => {
      orders[key] = { order: "none", type: types[key] || "string" };
      return orders;
    }, {});
  }

  // Generate columns and sortOrders
  const columns = generateColumns(rawData);
  const sortOrders = generateSortOrders(rawData);

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

  $: charNumber = $screenWidth < 640 ? 15 : 20;
</script>

<!-- Content area -->

<div class="flex flex-row items-end justify-end w-fit ml-auto mt-5 mb-2">
  <DownloadData
    {data}
    rawData={data?.getIndexCategory}
    title={data?.getParams}
  />
</div>

<div class="w-full overflow-x-scroll text-white">
  <table
    class="table table-sm table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4"
  >
    <thead>
      <TableHeader {columns} {sortOrders} {sortData} />
    </thead>
    <tbody>
      {#each stockList as item}
        <tr
          class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B]"
        >
          {#each columns as column}
            <td
              class="text-sm sm:text-[1rem] border-b-[#09090B]"
              class:text-left={column.align === "left"}
              class:text-right={column.align === "right"}
            >
              {#if column.key === "symbol"}
                <HoverStockChart symbol={item[column.key]} />
              {:else if column.key === "name"}
                {#if item[column.key]?.length > charNumber}
                  {item[column.key]?.slice(0, charNumber) + "..."}
                {:else}
                  {item[column.key]}
                {/if}
              {:else if column.key === "marketCap" || column.key === "revenue"}
                {item[column.key] !== null
                  ? abbreviateNumber(item[column.key])
                  : "-"}
              {:else if column.key === "price"}
                {item[column.key]?.toFixed(2)}
              {:else if column.key === "changesPercentage"}
                {#if item[column.key] >= 0}
                  <span class="text-[#00FC50]"
                    >+{item[column.key]?.toFixed(2)}%</span
                  >
                {:else}
                  <span class="text-[#FF2F1F]"
                    >{item[column.key]?.toFixed(2)}%</span
                  >
                {/if}
              {:else}
                {item[column.key]}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
