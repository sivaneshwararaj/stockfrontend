<script lang="ts">
  import { abbreviateNumberWithColor } from "$lib/utils";
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
  export let title;

  let rawData = data?.getData || [];

  rawData = rawData?.map((item) => ({
    ...item,
    net_gex: (item?.call_gex || 0) + (item?.put_gex || 0),
    put_call_ratio:
      item?.call_gex > 0
        ? Math.abs((item?.put_gex || 0) / item?.call_gex)
        : null,
  }));

  let displayList = rawData?.slice(0, 150);
  let options = null;

  function plotData() {
    // Process and sort data by strike in descending order
    const processedData = rawData
      ?.map((d) => ({
        strike: d?.strike,
        callGamma: d?.call_gex,
        putGamma: d?.put_gex,
        netGamma: d?.net_gex,
      }))
      .sort((a, b) => a.strike - b.strike);

    const strikes = processedData.map((d) => d.strike);
    const callGamma = processedData.map((d) => d.callGamma?.toFixed(2));
    const putGamma = processedData.map((d) => d.putGamma?.toFixed(2));
    const netGamma = processedData.map((d) => d.netGamma?.toFixed(2));

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
          const put = params[0].data;
          const call = params[1].data;
          const net = params[2].data;

          return `
          <div style="text-align:left;">
            <b>Strike:</b> ${strike}<br/>
            <span style="color:#9B5DC4;">● Put Gamma:</span> ${abbreviateNumberWithColor(put, false, true)}<br/>
            <span style="color:#C4E916;">● Call Gamma:</span> ${abbreviateNumberWithColor(call, false, true)}<br/>
            <span style="color:#FF2F1F;">● Net Gamma:</span> ${abbreviateNumberWithColor(net, false, true)}<br/>
          </div>`;
        },
      },
      grid: {
        left: $screenWidth < 640 ? "5%" : "0%",
        right: $screenWidth < 640 ? "5%" : "0%",
        bottom: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: "Gamma",
        nameTextStyle: { color: "#fff" },
        splitLine: { show: false },
        axisLabel: {
          show: false, // Hide y-axis labels
        },
      },
      yAxis: {
        type: "category",
        data: strikes,
        axisLine: { lineStyle: { color: "#fff" } },
        axisLabel: { color: "#fff" },
        splitLine: { show: false },
      },
      series: [
        {
          name: "Put Gamma",
          type: "bar",
          data: putGamma,
          stack: "gamma",
          itemStyle: { color: "#9B5DC4" },
        },
        {
          name: "Net Gamma",
          type: "bar",
          data: netGamma,
          stack: "gamma",
          itemStyle: { color: "#FF2F1F" },
        },
        {
          name: "Call Gamma",
          type: "bar",
          data: callGamma,
          stack: "gamma",
          itemStyle: { color: "#C4E916" },
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
    { key: "strike", label: "Strike Price", align: "left" },
    { key: "call_gex", label: "Call GEX", align: "right" },
    { key: "put_gex", label: "Put GEX", align: "right" },
    { key: "net_gex", label: "Net GEX", align: "right" },
    { key: "put_call_ratio", label: "P/C GEX", align: "right" },
  ];

  $: sortOrders = {
    strike: { order: "none", type: "number" },
    call_gex: { order: "none", type: "number" },
    put_gex: { order: "none", type: "number" },
    net_gex: { order: "none", type: "number" },
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
    {title} Exposure By Strike
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
              {item?.strike?.toFixed(2)}
            </td>
            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {@html abbreviateNumberWithColor(
                item?.call_gex?.toFixed(2),
                false,
                true,
              )}
            </td>
            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {@html abbreviateNumberWithColor(
                item?.put_gex?.toFixed(2),
                false,
                true,
              )}
            </td>

            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {@html abbreviateNumberWithColor(
                item?.net_gex?.toFixed(2),
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
    height: 1000px;
    width: 100%;
  }

  @media (max-width: 560px) {
    .app {
      width: 100%;
      height: 500px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
