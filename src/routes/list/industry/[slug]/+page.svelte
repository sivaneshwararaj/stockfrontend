<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";

  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import { Chart } from "svelte-echarts";

  import { init, use } from "echarts/core";
  import { LineChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  export let data;
  let isLoaded = false;
  use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

  let rawData = data?.getIndustryStocks?.stocks;

  let stockList = rawData?.slice(0, 50);
  let optionsData;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && stockList?.length !== rawData?.length) {
      const nextIndex = stockList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      stockList = [...stockList, ...filteredNewResults];
    }
  }

  function getPlotOptions() {
    let dates = [];
    let valueList = [];
    // Iterate over the data and extract required information
    data?.getIndustryStocks?.history?.forEach((item) => {
      dates?.push(item?.date);
      valueList?.push(item?.pe);
    });

    const option = {
      silent: true,
      tooltip: {
        trigger: "axis",
        hideDelay: 100, // Set the delay in milliseconds
      },
      animation: false,
      grid: {
        left: "0%",
        right: "2%",
        bottom: "2%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            // Assuming dates are in the format 'yyyy-mm-dd'
            // Extract the month and day from the date string and convert the month to its abbreviated name
            const dateParts = value.split("-");
            const year = dateParts[0].substring(2); // Extracting the last two digits of the year
            const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
            return `${monthNames[monthIndex]} '${year}`;
          },
        },
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            color: "#fff",
            formatter: function (value, index) {
              if (index % 2 === 0) {
                return value?.toFixed(0); // Format the sentiment value
              } else {
                return ""; // Hide this tick
              }
            },
          },
        },
      ],
      series: [
        {
          name: "PE Ratio",
          data: valueList,
          type: "line",
          areaStyle: { opacity: 0.2 },
          smooth: true,
          symbol: "none",
          itemStyle: {
            color: "#fff",
          },
        },
      ],
    };

    return option;
  }

  let totalMarketCap =
    rawData?.reduce((total, stock) => total + stock?.marketCap, 0) ?? 0;
  let totalRevenue =
    rawData?.reduce((total, stock) => total + stock?.revenue, 0) ?? 0;
  let peHistory = data?.getIndustryStocks?.history || [];
  let totalPERatio = peHistory.reduce(
    (total, stock) => total + (stock?.pe || 0),
    0,
  );
  let avgPERatio =
    peHistory.length > 0 ? (totalPERatio / peHistory?.length)?.toFixed(2) : 0;

  onMount(async () => {
    optionsData = await getPlotOptions();
    isLoaded = true;
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: charNumber = $screenWidth < 640 ? 15 : 20;

  let columns = [
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "marketCap", label: "Market Cap", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "volume", label: "Volume", align: "right" },
    { key: "revenue", label: "Revenue", align: "right" },
  ];

  let sortOrders = {
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    marketCap: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    volume: { order: "none", type: "number" },
    revenue: { order: "none", type: "number" },
  };

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    const originalData = rawData;
    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];
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

<section class="w-full overflow-hidden m-auto">
  <div
    class="border border-gray-800 w-full sm:flex sm:flex-row sm:items-center m-auto text-gray-100 bg-[#09090B] sm:rounded-lg h-auto p-5 mb-4"
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
    The {data?.getIndustryStocks?.name} Industry has a total of {data
      ?.getIndustryStocks?.stocks?.length} stocks, with a combined market cap of
    {abbreviateNumber(totalMarketCap, true)}, total revenue of {abbreviateNumber(
      totalRevenue,
      true,
    )} and an average PE Ratio of {avgPERatio}.
  </div>

  <h2 class="text-white text-xl sm:text-2xl mt-8 font-semibold">
    Historical PE Ratio
  </h2>
  <div class="app w-full h-[300px] mt-5 mb-8">
    {#if isLoaded}
      <Chart {init} options={optionsData} class="chart" />
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
  </div>

  <!-- Page wrapper -->
  <div class="flex justify-center w-full m-auto h-full overflow-hidden">
    <!-- Content area -->
    <div class="w-full overflow-x-scroll">
      <table
        class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto"
      >
        <thead>
          <TableHeader {columns} {sortOrders} {sortData} />
        </thead>
        <tbody>
          {#each stockList as item}
            <tr
              class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A]"
            >
              <td class="text-sm sm:text-[1rem] whitespace-nowrap text-start">
                <HoverStockChart symbol={item?.symbol} />
              </td>

              <td
                class="hidden sm:table-cell text-white text-sm sm:text-[1rem] whitespace-nowrap text-white text-start"
              >
                {item?.name?.length > charNumber
                  ? item?.name?.slice(0, charNumber) + "..."
                  : item?.name}
              </td>

              <td
                class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
              >
                {abbreviateNumber(item?.marketCap)}
              </td>

              <td
                class="text-sm sm:text-[1rem] whitespace-nowrap {item?.changesPercentage !==
                  null && item?.changesPercentage >= 0
                  ? "before:content-['+'] text-[#00FC50]"
                  : item?.changesPercentage < 0
                    ? 'text-[#FF2F1F]'
                    : 'text-white'} text-end"
              >
                {item?.changesPercentage !== null
                  ? item?.changesPercentage
                  : "-"}
              </td>

              <td class="text-sm sm:text-[1rem] text-white text-end">
                {item?.volume !== null ? abbreviateNumber(item?.volume) : "-"}
              </td>

              <td
                class="text-end text-sm sm:text-[1rem] whitespace-nowrap font-medium text-white"
              >
                {item?.revenue === 0 ? "-" : abbreviateNumber(item?.revenue)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>

<style>
  .app {
    height: 300px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 210px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
