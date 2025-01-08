<script lang="ts">
  import { abbreviateNumberWithColor } from "$lib/utils";
  import {
    etfTicker,
    screenWidth,
    numberOfUnreadNotification,
    displayCompanyName,
  } from "$lib/store";
  import { onMount } from "svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
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

  rawData = rawData?.map((item) => ({
    ...item,
    net_delta: (item?.call_delta || 0) + (item?.put_delta || 0),
    put_call_ratio:
      item?.call_delta > 0
        ? Math.abs((item?.put_delta || 0) / item?.call_delta)
        : null,
  }));

  let displayList = rawData?.slice(0, 150);
  let options = null;

  function formatDate(dateString) {
    if (!dateString) return null; // Handle null or undefined input
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
    return formatter.format(date);
  }

  function plotData() {
    // Process and sort data by strike in descending order
    const processedData = rawData
      ?.map((d) => ({
        expiry: formatDate(d?.expiry),
        callDelta: d?.call_delta,
        putDelta: d?.put_delta,
        netDelta: d?.net_delta,
      }))
      .sort((a, b) => a.strike - b.strike);

    const expiries = processedData.map((d) => d.expiry);
    const callDelta = processedData.map((d) => d.callDelta?.toFixed(2));
    const putDelta = processedData.map((d) => d.putDelta?.toFixed(2));
    const netDelta = processedData.map((d) => d.netDelta?.toFixed(2));

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
          const expiry = params[0].axisValue;
          const put = params[0].data;
          const call = params[1].data;
          const net = params[2].data;

          return `
          <div style="text-align:left;">
            <b>Expiry:</b> ${expiry}<br/>
            <span style="color:#9B5DC4;">● Put Delta:</span> ${abbreviateNumberWithColor(put, false, true)}<br/>
            <span style="color:#C4E916;">● Call Delta:</span> ${abbreviateNumberWithColor(call, false, true)}<br/>
            <span style="color:#FF2F1F;">● Net Delta:</span> ${abbreviateNumberWithColor(net, false, true)}<br/>
          </div>`;
        },
      },
      grid: {
        left: $screenWidth < 640 ? "5%" : "1%",
        right: $screenWidth < 640 ? "5%" : "0%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: "Delta",
        nameTextStyle: { color: "#fff" },
        splitLine: { show: false },
        axisLabel: {
          show: false, // Hide y-axis labels
        },
      },
      yAxis: {
        type: "category",
        data: expiries,
        axisLine: { lineStyle: { color: "#fff" } },
        axisLabel: { color: "#fff" },
        splitLine: { show: false },
      },
      series: [
        {
          name: "Put Delta",
          type: "bar",
          data: putDelta,
          stack: "Delta",
          itemStyle: { color: "#9B5DC4" },
          barWidth: "40%",
        },
        {
          name: "Net Delta",
          type: "bar",
          data: netDelta,
          stack: "Delta",
          itemStyle: { color: "#FF2F1F" },
        },
        {
          name: "Call Delta",
          type: "bar",
          data: callDelta,
          stack: "Delta",
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
    { key: "expiry", label: "Expiry Date", align: "left" },
    { key: "call_delta", label: "Call Delta", align: "right" },
    { key: "put_delta", label: "Put Delta", align: "right" },
    { key: "net_delta", label: "Net Delta", align: "right" },
    { key: "put_call_ratio", label: "P/C Delta", align: "right" },
  ];

  $: sortOrders = {
    expiry: { order: "none", type: "date" },
    call_delta: { order: "none", type: "number" },
    put_delta: { order: "none", type: "number" },
    net_delta: { order: "none", type: "number" },
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

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$etfTicker}) Delta Exposure by Expiry · Stocknear
  </title>
  <meta
    name="description"
    content={`Analyze Delta Exposure by expiry for ${$displayCompanyName} (${$etfTicker}). Access historical volume, open interest trends, and save options contracts for detailed analysis and insights.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$etfTicker}) Delta Exposure by Expiry · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Analyze Delta Exposure by expiry for ${$displayCompanyName} (${$etfTicker}). Access historical volume, open interest trends, and save options contracts for detailed analysis and insights.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$etfTicker}) Delta Exposure by Expiry · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Analyze Delta Exposure by expiry for ${$displayCompanyName} (${$etfTicker}). Access historical volume, open interest trends, and save options contracts for detailed analysis and insights.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full bg-default overflow-hidden text-white min-h-screen pb-40"
>
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if rawData?.length > 0}
        <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
          <h2
            class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
          >
            Delta Exposure By Expiry
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
                      displayList?.slice(0, 3)?.length &&
                    data?.user?.tier !== 'Pro'
                      ? 'opacity-[0.1]'
                      : ''}"
                  >
                    <td
                      class="text-white text-sm sm:text-[1rem] text-start whitespace-nowrap"
                    >
                      {formatDate(item?.expiry)}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {@html abbreviateNumberWithColor(
                        item?.call_delta?.toFixed(2),
                        false,
                        true,
                      )}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {@html abbreviateNumberWithColor(
                        item?.put_delta?.toFixed(2),
                        false,
                        true,
                      )}
                    </td>

                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {@html abbreviateNumberWithColor(
                        item?.net_delta?.toFixed(2),
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
      {:else}
        <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
          <h2
            class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
          >
            Hottest Contracts
          </h2>
          <div class="mt-2">
            <Infobox text="No data is available" />
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .app {
    height: 600px;
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
