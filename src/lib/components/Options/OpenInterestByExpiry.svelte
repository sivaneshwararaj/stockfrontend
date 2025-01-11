<script lang="ts">
  import { abbreviateNumberWithColor, monthNames } from "$lib/utils";
  import { screenWidth } from "$lib/store";
  import { onMount } from "svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import { Chart } from "svelte-echarts";

  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  use([
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
  ]);

  export let data;

  let rawData = data?.getData || [];

  rawData = rawData?.map((item) => {
    return {
      ...item,
      put_call_ratio:
        item?.call_oi > 0
          ? Math.abs((item?.put_oi || 0) / item?.call_oi)
          : null,
    };
  });

  let displayList = rawData?.slice(0, 150);
  let options = null;

  function plotData() {
    const processedData = rawData?.map((d) => ({
      expiry: d?.expiry,
      callValue: d?.call_oi,
      putValue: d?.put_oi,
    }));

    const dates = processedData?.map((d) => d.expiry);

    const callValues = processedData?.map((d) => d.callValue?.toFixed(2));
    const putValues = processedData?.map((d) => d.putValue?.toFixed(2));
    const barWidthPercentage = Math.max(100 / processedData.length, 20); // Adjust automatically, max 80%

    const options = {
      animation: false,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "#313131",
        textStyle: {
          color: "#fff",
        },
        formatter: function (params) {
          const strike = params[0].axisValue;
          const call = params[1].data;
          const put = params[0].data;

          return `
          <div style="text-align:left;">
            <b>Strike:</b> ${strike}<br/>
            <span style="color:#00FC50;">● Call OI:</span> ${abbreviateNumberWithColor(call, false, true)}<br/>
            <span style="color:#FF2F1F;">● Put OI:</span> ${abbreviateNumberWithColor(put, false, true)}<br/>
            </div>`;
        },
      },
      grid: {
        left: $screenWidth < 640 ? "5%" : "2%",
        right: $screenWidth < 640 ? "5%" : "2%",
        bottom: "10%",
        containLabel: true,
      },
      yAxis: {
        type: "value",
        nameTextStyle: { color: "#fff" },
        splitLine: { show: false },
        axisLabel: {
          show: false, // Hide x-axis labels
        },
      },
      xAxis: [
        {
          type: "category",
          data: dates,
          axisLabel: {
            color: "#fff",

            formatter: function (value) {
              // Assuming dates are in the format 'yyyy-mm-dd'
              const dateParts = value.split("-");
              const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
              const year = parseInt(dateParts[0]);
              const day = parseInt(dateParts[2]);
              return `${day} ${monthNames[monthIndex]} ${year}`;
            },
          },
        },
      ],
      series: [
        {
          name: `Put`,
          type: "bar",
          data: putValues,
          itemStyle: { color: "#FF2F1F" },
          barWidth: `${barWidthPercentage}%`,
        },
        {
          name: `Call `,
          type: "bar",
          data: callValues,
          itemStyle: { color: "#00FC50" },
          barWidth: `${barWidthPercentage}%`,
        },
      ],
    };

    return options;
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;

    if (isBottom && displayList?.length !== rawData?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      displayList = [...displayList, ...filteredNewResults];
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: columns = [
    { key: "expiry", label: "Expiry Date", align: "left" },
    {
      key: "call_oi",
      label: `Call OI`,
      align: "right",
    },
    {
      key: "put_oi",
      label: `Put OI`,
      align: "right",
    },
    {
      key: "put_call_ratio",
      label: `P/C OI`,
      align: "right",
    },
  ];

  $: sortOrders = {
    expiry: { order: "none", type: "date" },
    call_oi: { order: "none", type: "number" },
    put_oi: { order: "none", type: "number" },
    put_call_ratio: { order: "none", type: "number" },
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
      originalData = [...rawData]; // Reset originalData to rawDataVolume
      displayList = originalData;
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

  $: {
    if (typeof window !== "undefined") {
      options = plotData();
    }
  }
</script>

<div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
  <h2
    class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
  >
    Open Interest (OI) By Expiry
  </h2>

  <div class="w-full overflow-hidden m-auto">
    {#if options !== null}
      <div class="app w-full relative">
        <Chart {init} {options} class="chart" />
      </div>
    {:else}
      <div class="flex justify-center items-center h-80">
        <div class="relative">
          <label
            class="bg-primary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <span
              class="loading loading-spinner loading-md sm:loading-[1rem] text-gray-400"
            ></span>
          </label>
        </div>
      </div>
    {/if}
  </div>
  <div class="w-full overflow-x-scroll text-white">
    <table
      class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto overflow-x-auto"
    >
      <thead>
        <TableHeader {columns} {sortOrders} {sortData} />
      </thead>
      <tbody>
        {#each data?.user?.tier === "Pro" ? displayList : displayList?.slice(0, 3) as item, index}
          <tr
            class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800 {index +
              1 ===
              displayList?.slice(0, 3)?.length && data?.user?.tier !== 'Pro'
              ? 'opacity-[0.1]'
              : ''}"
          >
            <td
              class="text-white text-sm sm:text-[1rem] text-start whitespace-nowrap"
            >
              {new Date(item?.expiry).toLocaleDateString("en-US", {
                month: "short", // Abbreviated month (e.g., Jan)
                day: "numeric", // Numeric day (e.g., 10)
                year: "numeric", // Full year (e.g., 2025)
              })}
            </td>
            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {@html abbreviateNumberWithColor(
                item?.call_oi?.toFixed(2),
                false,
                true,
              )}
            </td>
            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {@html abbreviateNumberWithColor(
                item?.put_oi?.toFixed(2),
                false,
                true,
              )}
            </td>

            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {#if item?.put_call_ratio <= 1 && item?.put_call_ratio !== null}
                <span class="text-[#00FC50]"
                  >{item?.put_call_ratio?.toFixed(2)}</span
                >
              {:else if item?.put_call_ratio > 1 && item?.put_call_ratio !== null}
                <span class="text-[#FF2F1F]"
                  >{item?.put_call_ratio?.toFixed(2)}</span
                >
              {:else}
                n/a
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <UpgradeToPro {data} />
</div>

<style>
  .app {
    height: 400px;
    width: 100%;
  }

  @media (max-width: 560px) {
    .app {
      width: 100%;
      height: 300px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
