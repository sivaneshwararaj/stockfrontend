<script lang="ts">
  import { Chart } from "svelte-echarts";
  import { setCache, getCache } from "$lib/store";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import {
    GridComponent,
    TooltipComponent,
    MarkPointComponent,
    MarkLineComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  use([
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    MarkPointComponent,
    MarkLineComponent,
    CanvasRenderer,
  ]);

  export let symbol;
  export let ratingsList;
  export let numOfRatings = 0;

  let isLoaded = false;
  let optionsData = null;
  let historicalData = [];
  let timePeriod = "1Y";

  function filterDataByPeriod(historicalData, period = "1Y") {
    const currentDate = new Date();
    let startDate;

    // Calculate the start date based on the period input
    switch (period) {
      case "1Y":
        startDate = new Date();
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case "3Y":
        startDate = new Date();
        startDate.setFullYear(currentDate.getFullYear() - 3);
        break;
      case "5Y":
        startDate = new Date();
        startDate.setFullYear(currentDate.getFullYear() - 5);
        break;
      case "Max":
        // For 'Max', assume we want to start from the earliest possible date
        startDate = new Date(0); // This will set the date to January 1, 1970
        break;
      default:
        throw new Error(`Unsupported period: ${period}`);
    }

    // Filter the data based on the calculated start date
    const filteredData = historicalData.filter((item) => {
      const itemDate = new Date(item.time);
      return itemDate >= startDate && itemDate <= currentDate;
    });

    // Extract the dates and close values from the filtered data
    const dates = filteredData.map((item) => item.time);
    const closeValues = filteredData.map((item) => item.close);

    return { dates, closeValues };
  }

  async function historicalPrice(symbol) {
    const cachedData = getCache(symbol, "ratingsChart");
    if (cachedData) {
      historicalData = cachedData;
    } else {
      const postData = {
        ticker: symbol,
        timePeriod: "max",
      };

      const response = await fetch("/api/historical-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      historicalData = (await response?.json()) ?? [];

      setCache(symbol, historicalData, "ratingsChart");
    }
    optionsData = plotData();
  }

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

  // Function to plot data based on a specified time period
  function plotData() {
    // Extract the time (x-axis) and close values (y-axis)
    const { dates, closeValues } = filterDataByPeriod(
      historicalData,
      timePeriod,
    );

    // Prepare markPoints for ratings
    const markPoints = ratingsList
      .filter((rating) => {
        // Ensure date format is correct and matches
        return dates.includes(rating.date);
      })
      .map((rating) => ({
        // Marker at the rating's date
        type: "1Y", // Marking the rating date
        name: rating.rating_current,
        coord: [
          rating.date,
          closeValues[dates.indexOf(rating.date)], // Find the close value corresponding to the rating date
        ],
        label: {
          formatter: rating.rating_current, // Display the rating_current text
          position: "top", // Position the label above the point
          color: "yellow", // Set label color (can be customized)
          fontSize: 14, // Set font size (increase for better visibility)
        },
        symbol: "circle", // Symbol type (can be customized)
        symbolSize: 12, // Increase symbol size for better visibility
        itemStyle: {
          color: "red", // Set symbol color to red for better visibility
        },
      }));

    const series = [
      {
        name: "Price", // Name of the series
        data: closeValues, // Use close values
        type: "line", // Line chart
        smooth: true, // Smooth lines
        showSymbol: false, // Hide symbols on data points
        areaStyle: {
          color: "rgba(255, 255, 255, 0.08)", // Set the area color to a white color with opacity
        },
        lineStyle: {
          color: "#fff", // Set the line color to white
        },
      },
    ];

    // Define chart options
    const options = {
      animation: false,
      silent: true,
      grid: {
        left: "2%",
        right: "2%",
        bottom: "10%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dates, // Use the extracted dates
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            // Assuming dates are in the format 'yyyy-mm-dd'
            const dateParts = value.split("-");
            const year = dateParts[0].substring(2); // Extract last two digits of the year
            const monthIndex = parseInt(dateParts[1]) - 1; // Zero-indexed months
            return `${monthNames[monthIndex]} '${year}`;
          },
        },
      },
      yAxis: {
        type: "value",
        splitLine: {
          show: false, // Disable grid lines
        },
        axisLabel: {
          color: "#fff",
        },
      },
      series: series, // Use the dynamically created series array

      tooltip: {
        trigger: "axis",
        hideDelay: 100,
        formatter: function (params) {
          const date = params[0].name; // Get the date from the x-axis value
          const dateParts = date.split("-");
          const year = dateParts[0];
          const monthIndex = parseInt(dateParts[1]) - 1;
          const day = dateParts[2];
          const formattedDate = `${monthNames[monthIndex]} ${day}, ${year}`;

          // Return the tooltip content
          return `${formattedDate}<br/> ${params[0].value}`;
        },
      },
    };

    return options;
  }

  $: {
    if (symbol && typeof window !== "undefined") {
      isLoaded = false;
      optionsData = null;
      historicalData = [];

      historicalPrice(symbol);
      isLoaded = true;
    }
  }
</script>

<div class="w-full overflow-hidden m-auto mt-5">
  {#if isLoaded && optionsData !== null}
    <div class="app w-full relative">
      <h2
        class="text-white text-xl font-semibold text-center absolute left-1/2 transform -translate-x-1/2 top-5 -translate-y-1/2"
      >
        {symbol} - {numOfRatings} Ratings
      </h2>
      <Chart {init} options={optionsData} class="chart" />
    </div>
  {:else}
    <div class="flex justify-center items-center h-80">
      <div class="relative">
        <label
          class="bg-[#27272A] rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <span
            class="loading loading-spinner loading-md sm:loading-[1rem] text-gray-400"
          ></span>
        </label>
      </div>
    </div>
  {/if}
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
