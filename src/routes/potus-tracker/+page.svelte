<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";
  import Map from "$lib/components/Map.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import { monthNames } from "$lib/utils";
  import { screenWidth } from "$lib/store";

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

  let rawData = data?.getData?.history || [];
  let executiveOrders = data?.getData?.executiveOrders || [];

  const groupedByDate = rawData?.reduce((acc, item) => {
    const dateKey = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(item.date));

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  let modalTitle = "n/a";
  let modalDescription = "n/a";
  let modalLink = "#";

  const tabs = [
    {
      title: "Location Tracker",
    },
    {
      title: "Egg Price Tracker",
    },
  ];

  let activeIdx = 0;

  function plotData() {
    const history = data?.getEggPrice?.history || [];
    const dateList = history.map((item) => item?.date ?? null);
    const priceList = history.map((item) => item?.price ?? null);
    const yoyChangeList = history.map((item) => item?.yoyChange ?? null);

    const options = {
      animation: false,
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
        borderColor: "#969696", // Black border color
        borderWidth: 1, // Border width of 1px
        backgroundColor: "#313131", // Optional: Set background color for contrast
        textStyle: {
          color: "#fff", // Optional: Text color for better visibility
        },
        formatter: function (params) {
          const timestamp = params[0].axisValue;
          let result = timestamp + "<br/>";

          params?.forEach((param) => {
            const marker =
              '<span style="display:inline-block;margin-right:4px;' +
              "border-radius:10px;width:10px;height:10px;background-color:" +
              param.color +
              '"></span>';

            // Check if it's "YoY Change" and append "%"
            const value =
              param.seriesName === "YoY Change"
                ? param.value + "%"
                : param.value;

            result += marker + param.seriesName + ": " + value + "<br/>";
          });

          return result;
        },
        axisPointer: {
          lineStyle: {
            color: "#fff",
          },
        },
      },
      silent: true,
      grid: {
        left: $screenWidth < 640 ? "5%" : "4%",
        right: $screenWidth < 640 ? "5%" : "0%",
        bottom: "4%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: dateList,
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
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          position: "right",
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
      ],
      series: [
        {
          name: "Price per Dozens",
          type: "line",
          data: priceList,
          yAxisIndex: 1,
          lineStyle: { width: 2 },
          itemStyle: {
            color: "#fff",
          },
          smooth: true,
          showSymbol: false,
        },
        {
          name: "YoY Change",
          type: "bar",
          lineStyle: { width: 2 },
          data: yoyChangeList,
          itemStyle: {
            color: "#9B5DC4",
          },
          smooth: true,
          showSymbol: false,
        },
      ],
    };
    return options;
  }

  let options = plotData();
</script>

<SEO
  title="POTUS Tracker - Executive Orders, Presidential Schedule, Signed Legislation"
  description="Where is the President? Find out what the President of the United States is doing with real-time location, schedule, legislation, and executive order updates."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3 text-white"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">POTUS Tracker</li>
    </ul>
  </div>

  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div
        class="relative flex flex-row justify-center items-start overflow-hidden w-full"
      >
        <div class="w-full mt-5">
          <div class="lg:float-left lg:w-[calc(100%-336px-20px)]">
            <h1 class="text-xl sm:text-2xl font-bold mb-4 w-full">
              POTUS Tracker
            </h1>
          </div>

          <div class=" lg:float-left lg:w-[calc(100%-336px-40px)]">
            <nav class=" border-b-[2px] overflow-x-scroll whitespace-nowrap">
              <ul
                class="flex flex-row items-center w-full text-[1rem] text-white"
              >
                {#each tabs as item, i}
                  <a
                    href={item?.path}
                    on:click={() => (activeIdx = i)}
                    class="p-2 px-5 cursor-pointer {activeIdx === i
                      ? 'text-white bg-primary sm:hover:bg-opacity-[0.95] font-semibold'
                      : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
                  >
                    {item.title}
                  </a>
                {/each}
              </ul>
            </nav>

            {#if activeIdx === 0}
              <h2 class="text-white text-lg font-semibold mb-2 mt-4">
                The US President is currently located in {data?.getData?.city ??
                  "n/a"}
              </h2>

              <div class="w-full m-auto border border-gray-800 rounded-[10px]">
                <Map LAT={data?.getData?.lat} LON={data?.getData?.lon} />
              </div>
              <span class="text-gray-300 text-xs">
                Map data © OpenStreetMap
              </span>
            {:else}
              <h2 class="text-white text-lg font-semibold mt-4">Egg Stats:</h2>

              <div
                class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-x-0 text-white mt-2 text-sm sm:text-[1rem] w-full"
              >
                <div class="whitespace-nowrap">
                  Current Price: {data?.getEggPrice?.currentPrice}
                </div>
                <div class="whitespace-nowrap">
                  <span class=" font-normal">Avg. Price:</span>
                  {data?.getEggPrice?.avgPrice}
                </div>
                <div class="whitespace-nowrap">
                  <span class=" font-normal">Min. Price:</span>
                  {data?.getEggPrice?.minPrice}
                </div>
                <div class="whitespace-nowrap">
                  <span class=" font-normal">Max. Price:</span>
                  {data?.getEggPrice?.maxPrice}
                </div>
              </div>

              <div class="app w-full relative">
                <Chart {init} {options} class="chart" />
              </div>

              <span class="text-sm">
                The Federal Reserve Economic Data is collected monthly and
                updates egg prices across the United States.
              </span>
            {/if}

            <h3 class="text-white text-xl font-semibold mb-2 mt-10">
              Official Presidential Schedule
            </h3>

            <div class="sm-mt-5 mb-5">
              <Infobox
                text={`Since the inauguration of Donald J. Trump on January 20, 2025, the 
  S&P500 has ${data?.getData?.returnSince >= 0 ? "grown" : "declined"} by <span class="${data?.getData?.returnSince >= 0 ? "text-[#00FC50] before:content-['+']" : "text-[#FF2F1F]"}">
  ${data?.getData?.returnSince ?? "n/a"}%</span>.`}
              />
            </div>

            <div class="space-y-4">
              {#each Object.entries(groupedByDate) as [date, items], indexA}
                <div class="my-4">
                  <div
                    class="border-b border-gray-800 pb-2 w-full flex flex-row items-center justify-between"
                  >
                    <span class="text-lg font-semibold text-white">
                      {date}</span
                    >
                    {#if items?.at(0)?.changesPercentage}
                      <div class="ml-auto text-sm">
                        <span class="inline-block">S&P500</span>
                        <span
                          class="{items?.at(0)?.changesPercentage > 0
                            ? "text-[#00FC50] before:content-['+']"
                            : 'text-[#FF2F1F]'} "
                          >{items.length > 0
                            ? items?.at(0)?.changesPercentage
                            : "n/a"}%</span
                        >
                      </div>
                    {/if}
                  </div>
                  <!-- Display date -->
                  <br />
                  {#each items as item, indexB}
                    <div class="flex flex-col items-start space-y-1 mb-6">
                      <div class="flex flex-row items-center space-x-2">
                        <div class="relative">
                          <svg
                            fill={indexA === 0 && indexB === 0
                              ? "#2E86DE"
                              : "#808080"}
                            class="w-5 h-5 relative z-10"
                            viewBox="-51.2 -51.2 614.40 614.40"
                            id="_78_Circle-Full"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke={indexA === 0 && indexB === 0
                              ? "#2E86DE"
                              : "#808080"}
                            stroke-width="0.00512"
                          >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke="#CCCCCC"
                              stroke-width="24.576"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              <path
                                id="Path_111"
                                data-name="Path 111"
                                d="M256,512C114.625,512,0,397.375,0,256S114.625,0,256,0,512,114.625,512,256,397.375,512,256,512Zm0-448C149.969,64,64,149.969,64,256s85.969,192,192,192,192-85.969,192-192S362.031,64,256,64Zm0,320A128,128,0,1,1,384,256,128.006,128.006,0,0,1,256,384Z"
                                fill-rule="evenodd"
                              ></path>
                            </g>
                          </svg>

                          {#if indexA === 0 && indexB === 0}
                            <span
                              class="absolute -inset-1 rounded-full animate-ping w-3 h-3 m-auto bg-blue-400/75"
                            ></span>
                          {/if}
                        </div>

                        <span class="text-sm text-gray-400">
                          {item.time_formatted} - {item.location}
                        </span>
                      </div>

                      <span class="text-sm ml-7">
                        {item.details}
                      </span>
                    </div>
                  {/each}
                </div>
              {/each}
            </div>
          </div>

          <div class="order-4 flex-shrink-0 lg:float-right lg:w-[336px]">
            <h3 class="text-xl text-white font-semibold mb-3">
              Latest Legislations
            </h3>
            <div class="overflow-y-auto max-h-[1000px]">
              {#each executiveOrders as item}
                <div class="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <!-- Badge and Time -->
                  <div class="flex justify-between items-center mb-4">
                    <span
                      class="{item?.sentiment === 'Bullish'
                        ? 'bg-emerald-500'
                        : item?.sentiment === 'Bearish'
                          ? 'bg-red-600'
                          : 'bg-yellow-600'} text-white px-4 py-1 rounded text-sm font-medium"
                    >
                      {item?.sentiment}
                    </span>
                    <span class="text-gray-400 text-sm"
                      >{#if item?.date !== null}
                        {new Date(item?.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      {:else}
                        ""
                      {/if}
                    </span>
                  </div>

                  <!-- Title -->
                  <h2 class="text-[#E5E7EB] text-lg font-semibold mb-3">
                    {item?.title}
                  </h2>

                  <!-- Description -->
                  <p class="text-gray-400 text-sm mb-4">
                    {item?.description?.length > 150
                      ? item?.description?.slice(0, 150) + "..."
                      : item?.description}
                  </p>

                  <!-- Read More Button -->
                  <div class="flex justify-end">
                    <label
                      on:click={() => {
                        modalTitle = item?.title;
                        modalDescription = item?.description;
                        modalLink = item?.link;
                      }}
                      for="readMore"
                      class="cursor-pointer bg-blue-500 sm:hover:bg-blue-600 ease-out transition duration-100 text-white px-3 py-1.5 rounded text-sm"
                    >
                      Read More
                    </label>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Desktop modal using dialog component -->
<input type="checkbox" id="readMore" class="modal-toggle" />

<dialog id="readMore" class="modal p-3 sm:p-0">
  <label
    for="readMore"
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.8]"
  ></label>

  <!-- Desktop modal content -->
  <div
    class="modal-box rounded-md border border-gray-600 w-full bg-secondary flex flex-col items-center"
  >
    <div class="mx-auto h-1.5 w-20 flex-shrink-0 rounded-full" />
    <div class="text-white mb-5 text-start">
      <h3 class="font-bold text-xl mb-5">{modalTitle}</h3>
      <span class="text-white text-[1rem] font-normal"
        >{@html modalDescription}</span
      >
    </div>

    <a
      href={modalLink}
      rel="noopener noreferrer"
      target="_blank"
      class="ml-auto mb-3 cursor-pointer bg-blue-500 sm:hover:bg-blue-600 ease-out transition duration-100 text-white px-3 py-1.5 rounded text-sm"
    >
      Read Source
    </a>

    <div class="sm:hidden border-t border-gray-600 mt-2 w-full">
      <label
        for="readMore"
        class="mt-4 font-semibold text-white text-xl m-auto flex justify-center cursor-pointer"
      >
        Close
      </label>
    </div>
  </div>
</dialog>

<style>
  .app {
    height: 500px;
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
