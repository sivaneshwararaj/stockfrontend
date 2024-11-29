<script lang="ts">
  import { analystEstimateComponent, stockTicker } from "$lib/store";

  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { LineChart, CustomChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { abbreviateNumber } from "$lib/utils";

  export let data;
  use([
    LineChart,
    CustomChart,
    GridComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  let analystEstimateList = [];
  let isLoaded = false;

  let xData = [];
  let optionsRevenue = null;
  let optionsEPS = null;
  let optionsRevenueGrowth = null;
  let optionsEPSGrowth = null;
  let revenueDateList = [];
  let avgRevenueList = [];
  let lowRevenueList = [];
  let highRevenueList = [];
  let epsDateList = [];
  let avgEPSList = [];
  let lowEPSList = [];
  let highEPSList = [];

  let revenueAvgGrowthList = [];
  let epsAvgGrowthList = [];

  let displayData = "Revenue";

  function fillMissingDates(dates, highGrowthList) {
    // Get the current year
    const currentYear = new Date().getFullYear();
    const currentFiscalYear = `FY${currentYear % 100}`; // Get the current fiscal year (e.g., 2024 => FY24)

    // Create a map from the highGrowthList for quick lookup
    const highGrowthMap = new Map(
      highGrowthList?.map((item) => [`FY${item.FY}`, item]),
    );

    // Generate the complete list based on the dates array
    return dates?.map((date) => {
      // Check if the date is the current fiscal year or it exists in the map
      const data = highGrowthMap?.get(date) || {
        FY: date?.slice(2),
        val: null,
        growth: null,
      };

      // If the fiscal year is the current one, set val and growth to null
      if (date === currentFiscalYear) {
        data.val = null;
        data.growth = null;
      }

      return data;
    });
  }
  function computeGrowthSingleList(data, actualList) {
    // Initialize the result list
    let resultList = [];

    for (let i = 0; i < data?.length; i++) {
      const currentData = data[i];

      // Find the corresponding actual data from one FY back
      const correspondingActual = actualList?.find(
        (entry) => Number(entry.FY) === Number(currentData.FY) - 1,
      );

      // Calculate growth if a matching entry exists in actualList
      let growth = null;
      if (
        correspondingActual &&
        correspondingActual?.val !== null &&
        currentData.val !== null
      ) {
        growth = (
          ((currentData?.val - correspondingActual?.val) /
            Math.abs(correspondingActual?.val)) *
          100
        )?.toFixed(2);
      }

      // Push the result for this FY
      resultList.push({
        FY: currentData.FY,
        val: currentData.val,
        growth: growth !== null ? Number(growth) : null, // Convert growth to number or leave as null
      });
    }

    return resultList;
  }

  function computeGrowthList(tableActualRevenue, tableForecastRevenue) {
    return tableActualRevenue?.map((item, index) => {
      const currentFY = item?.FY;

      // If it's the first item or the list is empty, return null growth
      if (index === 0 || tableActualRevenue.length === 0) {
        return { FY: currentFY, growth: null };
      }

      // If actual value is null, compute growth based on forecast values
      if (item?.val === null) {
        const prevForecastVal = tableForecastRevenue[index - 1]?.val ?? 0;
        const currentForecastVal = tableForecastRevenue[index]?.val ?? 0;

        if (prevForecastVal === 0 || currentForecastVal === 0) {
          return { FY: currentFY, growth: null };
        }

        const forecastGrowth =
          ((currentForecastVal - prevForecastVal) / Math.abs(prevForecastVal)) *
          100;

        return {
          FY: currentFY,
          growth:
            forecastGrowth !== 0 ? Number(forecastGrowth?.toFixed(2)) : null,
        };
      }

      // Compute actual growth for non-null actual values
      const prevActualVal = tableActualRevenue[index - 1]?.val ?? 0;
      const currentActualVal = item?.val ?? 0;

      if (prevActualVal === 0 || currentActualVal === 0) {
        return { FY: currentFY, growth: null };
      }

      const actualGrowth =
        ((currentActualVal - prevActualVal) / Math.abs(prevActualVal)) * 100;

      return {
        FY: currentFY,
        growth: actualGrowth !== 0 ? Number(actualGrowth.toFixed(2)) : null,
      };
    });
  }

  function findIndex(data) {
    const currentYear = new Date().getFullYear();

    // Find the index where the item's date is greater than or equal to the current year and revenue is null
    const index = data.findIndex(
      (item) => item.date > currentYear && item.revenue === null,
    );

    // Check if there is any item for the current year with non-null revenue
    const hasNonNullRevenue = data.some(
      (item) => item.date === currentYear && item.revenue !== null,
    );

    // Add +1 to the index if the condition is met
    return index !== -1 && hasNonNullRevenue ? index + 1 : index;
  }

  let tableActualRevenue = [];
  let tableActualEPS = [];

  let tableForecastRevenue = [];
  let tableForecastEPS = [];
  let tableCombinedRevenue = [];
  let tableCombinedEPS = [];

  function getPlotOptions(dataType: string) {
    let dates = [];
    let valueList = [];
    let avgList = [];
    let lowList = [];
    let highList = [];
    let filteredData =
      analystEstimateList?.filter((item) => item.date >= 2019) ?? [];
    const stopIndex = findIndex(filteredData);

    if (filteredData) {
      filteredData.forEach((item, index) => {
        const date = item.date?.toString().slice(-2);
        const isAfterStartIndex = stopIndex <= index + 1;
        dates.push(`FY${date}`);
        switch (dataType) {
          case "Revenue":
            valueList.push(item.revenue);
            avgList.push(isAfterStartIndex ? item.estimatedRevenueAvg : null);
            lowList.push(isAfterStartIndex ? item.estimatedRevenueLow : null);
            highList.push(isAfterStartIndex ? item.estimatedRevenueHigh : null);
            break;
          case "EPS":
            valueList.push(item.eps);
            avgList.push(isAfterStartIndex ? item.estimatedEpsAvg : null);
            lowList.push(isAfterStartIndex ? item.estimatedEpsLow : null);
            highList.push(isAfterStartIndex ? item.estimatedEpsHigh : null);
            break;
          default:
            break;
        }
      });
    }

    try {
      const lastValue = valueList[stopIndex - 2];
      avgList[stopIndex - 2] = lastValue;
      lowList[stopIndex - 2] = lastValue;
      highList[stopIndex - 2] = lastValue;
    } catch (e) {
      console.log(e);
    }

    // Normalize the data if needed (not required in this case, but leaving it here for reference)

    let currentYearSuffix = new Date().getFullYear().toString().slice(-2);
    let searchString = `FY${currentYearSuffix}`;
    let currentYearIndex = dates?.findIndex((date) => date === searchString);

    // Assign to global variables based on dataType
    if (dataType === "Revenue") {
      revenueDateList = dates?.slice(currentYearIndex) || [];
      avgRevenueList =
        avgList?.slice(currentYearIndex)?.map((val, index) => ({
          FY: revenueDateList[index]?.slice(2),
          val: val,
        })) || [];
      lowRevenueList =
        lowList?.slice(currentYearIndex)?.map((val, index) => ({
          FY: revenueDateList[index]?.slice(2),
          val: val,
        })) || [];
      highRevenueList =
        highList?.slice(currentYearIndex)?.map((val, index) => ({
          FY: revenueDateList[index]?.slice(2),
          val: val,
        })) || [];
    } else if (dataType === "EPS") {
      epsDateList = dates?.slice(currentYearIndex) || [];
      avgEPSList =
        avgList?.slice(currentYearIndex)?.map((val, index) => ({
          FY: epsDateList[index]?.slice(2),
          val: val,
        })) || [];
      lowEPSList =
        lowList?.slice(currentYearIndex)?.map((val, index) => ({
          FY: epsDateList[index]?.slice(2),
          val: val,
        })) || [];
      highEPSList =
        highList?.slice(currentYearIndex)?.map((val, index) => ({
          FY: epsDateList[index]?.slice(2),
          val: val,
        })) || [];
    }

    const growthList = dates?.map((date) => {
      const fy = parseInt(date.replace("FY", ""), 10); // Extract numeric FY value
      const listToUse =
        dataType === "Revenue" ? revenueAvgGrowthList : epsAvgGrowthList; // Select the correct growth list
      const growth = listToUse?.find((r) => r.FY === fy); // Find matching FY
      return growth ? growth?.growth : null; // Return growth or null if not found
    });

    const option = {
      silent: true,
      tooltip: {
        trigger: "axis",
        hideDelay: 100, // Set the delay in milliseconds
      },
      animation: false,
      grid: {
        left: "5%",
        right: "5%",
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
        },
      },
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
      ],
      series: [
        {
          name: "Actual",
          data: valueList,
          type: "line",
          itemStyle: {
            color: "#fff", // Change line plot color to white
          },
          showSymbol: false, // Show symbols for line plot points
        },
        {
          name: "Avg",
          data: avgList,
          type: "line",
          itemStyle: {
            color: "#fff", // Change line plot color to green
          },
          lineStyle: {
            type: "dashed", // Set the line type to dashed
          },
          showSymbol: false, // Show symbols for line plot points
        },
        {
          name: "Low",
          data: lowList,
          type: "line",
          itemStyle: {
            color: "#3CB2EF", // Change line plot color to green
          },
          lineStyle: {
            type: "dashed", // Set the line type to dashed
            color: "#c2c7cf",
          },

          showSymbol: false, // Show symbols for line plot points
        },
        {
          name: "High",
          data: highList,
          type: "line",
          itemStyle: {
            color: "#3CB2EF", // Change line plot color to green
          },
          lineStyle: {
            type: "dashed", // Set the line type to dashed
            color: "#c2c7cf",
          },
          showSymbol: false, // Show symbols for line plot points
        },
      ],
    };

    let highGrowthList = [];
    let lowGrowthList = [];
    if (dataType === "Revenue") {
      highGrowthList = computeGrowthSingleList(highRevenueList, avgRevenueList);
      lowGrowthList = computeGrowthSingleList(lowRevenueList, avgRevenueList);
    } else {
      highGrowthList = computeGrowthSingleList(highEPSList, avgEPSList);
      lowGrowthList = computeGrowthSingleList(lowEPSList, avgEPSList);
    }
    highGrowthList = fillMissingDates(dates, highGrowthList)?.map(
      (item) => item?.growth,
    );

    lowGrowthList = fillMissingDates(dates, lowGrowthList)?.map(
      (item) => item?.growth,
    );

    const optionsGrowth = {
      animation: false,
      grid: {
        left: "5%",
        right: "5%",
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
        },
      },
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
      ],
      series: [
        {
          name: dataType === "Revenue" ? "Revenue Growth" : "EPS Growth",
          data: growthList?.map((value) => ({
            value,
            itemStyle: {
              color: value >= 0 ? "#00FC50" : "#D9220E", // Green for >= 0, Red for < 0
            },
          })),
          type: "bar",
          smooth: true,
          z: 5, // Ensure the bar chart has a lower z-index than the error bars
        },
        {
          name: "Error Bars",
          type: "custom",
          renderItem: (params, api) => {
            const xValue = api.value(0);
            const yValue = api.value(1);

            // Select high and low lists based on dataType
            const highList = highGrowthList;
            const lowList = lowGrowthList;

            // Retrieve the corresponding high and low values
            const high = highList[params.dataIndex];
            const low = lowList[params.dataIndex];

            // Skip rendering error bars if high or low values are null or undefined
            if (high == null || low == null) return; // Null or undefined values are skipped

            const x = api.coord([xValue, yValue])[0];
            const highCoord = api.coord([xValue, high])[1];
            const lowCoord = api.coord([xValue, low])[1];

            return {
              type: "group",
              children: [
                {
                  type: "line",
                  shape: {
                    x1: x,
                    y1: highCoord,
                    x2: x,
                    y2: lowCoord,
                  },
                  style: {
                    stroke: "#fff",
                    lineWidth: 2, // Set thicker line width
                  },
                },
                {
                  type: "line",
                  shape: {
                    x1: x - 5,
                    y1: highCoord,
                    x2: x + 5,
                    y2: highCoord,
                  },
                  style: {
                    stroke: "#fff",
                    lineWidth: 2, // Set thicker line width
                  },
                },
                {
                  type: "line",
                  shape: {
                    x1: x - 5,
                    y1: lowCoord,
                    x2: x + 5,
                    y2: lowCoord,
                  },
                  style: {
                    stroke: "#fff",
                    lineWidth: 2, // Set thicker line width
                  },
                },
              ],
            };
          },
          encode: {
            x: 0, // Map x-axis values
            y: 1, // Map y-axis values
          },
          data: growthList?.map((value, index) => [index, value]), // Prepare data for error bars
          z: 10, // Bring the error bars to the front
        },
      ],
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const dataIndex = params[0].dataIndex;
          const mainValue = params[0].value;

          // Select high and low lists based on dataType
          const highList = highGrowthList;
          const lowList = lowGrowthList;

          // Retrieve the corresponding high and low values
          const high = highList[dataIndex];
          const low = lowList[dataIndex];

          // Only show High and Low if they are not "N/A"
          let tooltipContent = `<b>${dates[dataIndex]}</b><br>`;

          if (high && high !== "N/A") {
            tooltipContent += `High: ${high.toFixed(2)}<br>`;
          }

          if (mainValue && mainValue !== "N/A") {
            tooltipContent += `Avg: ${mainValue.toFixed(2)}<br>`;
          }

          if (low && low !== "N/A") {
            tooltipContent += `Low: ${low.toFixed(2)}<br>`;
          }

          return tooltipContent;
        },
      },
    };

    if (dataType === "Revenue") {
      optionsRevenue = option;
      optionsRevenueGrowth = optionsGrowth;
    } else if (dataType === "EPS") {
      optionsEPS = option;
      optionsEPSGrowth = optionsGrowth;
    }
  }

  //To-do: Optimize this piece of shit
  function prepareData() {
    tableActualRevenue = [];
    tableForecastRevenue = [];
    tableCombinedRevenue = [];
    tableCombinedEPS = [];

    tableActualEPS = [];
    tableForecastEPS = [];

    revenueAvgGrowthList = [];
    epsAvgGrowthList = [];

    let filteredData =
      analystEstimateList?.filter((item) => item.date >= 2015) ?? [];

    xData = filteredData?.map(({ date }) => Number(String(date)?.slice(-2)));
    //Revenue Data
    filteredData?.forEach((item) => {
      tableActualRevenue?.push({
        FY: Number(String(item?.date)?.slice(-2)),
        val: item?.revenue,
      });
      tableForecastRevenue?.push({
        FY: Number(String(item?.date)?.slice(-2)),
        val: item?.estimatedRevenueAvg,
        numOfAnalysts: item?.numOfAnalysts,
      });
    });

    tableCombinedRevenue = tableActualRevenue?.map((item1) => {
      // Find the corresponding item in data2 based on "FY"
      const item2 = tableForecastRevenue?.find(
        (item2) => item2?.FY === item1?.FY,
      );

      // If the value in data1 is null, replace it with the value from data2
      return {
        FY: item1.FY,
        val: item1.val === null ? item2.val : item1.val,
        numOfAnalysts: item2.numOfAnalysts,
      };
    });

    //EPS Data
    filteredData?.forEach((item) => {
      tableActualEPS?.push({
        FY: Number(String(item?.date)?.slice(-2)),
        val: item?.eps,
      });
      tableForecastEPS?.push({
        FY: Number(String(item?.date)?.slice(-2)),
        val: item?.estimatedEpsAvg,
      });
    });
    //Values coincide with table values for crosscheck
    revenueAvgGrowthList = computeGrowthList(
      tableActualRevenue,
      tableCombinedRevenue,
    );

    tableCombinedEPS = tableActualEPS?.map((item1) => {
      // Find the corresponding item in data2 based on "FY"
      const item2 = tableForecastEPS?.find((item2) => item2?.FY === item1?.FY);

      // If the value in data1 is null, replace it with the value from data2
      return {
        FY: item1.FY,
        val: item1.val === null ? item2.val : item1.val,
      };
    });

    epsAvgGrowthList = computeGrowthList(tableActualEPS, tableCombinedEPS);
  }

  $: {
    if ($stockTicker && displayData && typeof window !== "undefined") {
      isLoaded = false;
      analystEstimateList = [];
      analystEstimateList = data?.getAnalystEstimate || [];
      if (analystEstimateList?.length !== 0) {
        prepareData();
        $analystEstimateComponent = true;
        getPlotOptions("Revenue");
        getPlotOptions("EPS");
      } else {
        $analystEstimateComponent = false;
      }
      isLoaded = true;
    }
  }
</script>

<section class="overflow-hidden text-white h-full pb-8 sm:pb-2">
  <main class="overflow-hidden">
    <div class="w-full m-auto">
      <div class="flex flex-row items-center"></div>

      {#if isLoaded}
        {#if analystEstimateList?.length !== 0}
          <div
            class="no-scrollbar flex justify-start items-center w-screen sm:w-full mt-6 m-auto overflow-x-scroll pr-5 sm:pr-0"
          >
            <table
              class="table table-sm shaodow table-pin-cols table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B]"
            >
              <thead class="">
                <tr class="">
                  <th
                    class="bg-[#27272A] border-b border-[#000] text-white font-semibold text-sm text-start"
                    >Fiscal Year</th
                  >
                  {#each xData as item}
                    <td
                      class="z-20 bg-[#27272A] border-b border-[#000] text-white font-semibold text-sm text-end bg-[#09090B]"
                      >{"FY" + item}</td
                    >
                  {/each}
                </tr>
              </thead>
              <tbody class="shadow-md">
                <tr class="bg-[#27272A] border-b-[#27272A]">
                  <th
                    class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-[#27272A] border-b border-[#27272A]"
                  >
                    Revenue
                  </th>
                  {#each tableCombinedRevenue as item}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium border-b border-[#27272A] bg-[#09090B]"
                    >
                      {item?.val === "0.00" ||
                      item?.val === null ||
                      item?.val === 0
                        ? "n/a"
                        : abbreviateNumber(item?.val.toFixed(2))}
                    </td>
                  {/each}
                </tr>

                <tr class="bg-[#27272A] border-b-[#27272A]">
                  <th
                    class="bg-[#27272A] whitespace-nowrap text-sm sm:text-[1rem] text-white text-start font-medium border-b border-[#27272A]"
                  >
                    Revenue Growth
                  </th>
                  {#each computeGrowthList(tableActualRevenue, tableCombinedRevenue) as item, index}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium bg-[#09090B]"
                    >
                      {#if index === 0 || item?.growth === null}
                        n/a
                      {:else if tableActualRevenue[index]?.val === null}
                        <span
                          class="text-orange-400 {item?.growth > 0
                            ? "before:content-['+']"
                            : ''}"
                        >
                          {item?.growth}%&#42;
                        </span>
                      {:else}
                        <span
                          class={item?.growth > 0
                            ? "text-[#00FC50] before:content-['+']"
                            : item?.growth < 0
                              ? "text-[#FF2F1F]"
                              : ""}
                        >
                          {item?.growth}%
                        </span>
                      {/if}
                    </td>
                  {/each}
                </tr>

                <tr class="bg-[#27272A] border-b-[#09090B]">
                  <th
                    class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-[#27272A] border-b border-[#27272A]"
                  >
                    EPS
                  </th>
                  {#each tableCombinedEPS as item}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium border-b border-[#27272A] bg-[#09090B]"
                    >
                      {item?.val === "0.00" ||
                      item?.val === null ||
                      item?.val === 0
                        ? "-"
                        : abbreviateNumber(item?.val.toFixed(2))}
                    </td>
                  {/each}
                </tr>

                <tr class="bg-[#27272A] border-b-[#27272A]">
                  <th
                    class="bg-[#27272A] whitespace-nowrap text-sm sm:text-[1rem] text-white text-start font-medium border-b border-[#27272A]"
                  >
                    EPS Growth
                  </th>
                  {#each computeGrowthList(tableActualEPS, tableCombinedEPS) as item, index}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium bg-[#09090B]"
                    >
                      {#if index === 0 || item?.growth === null}
                        n/a
                      {:else if tableActualRevenue[index]?.val === null}
                        <span
                          class="text-orange-400 {item?.growth > 0
                            ? "before:content-['+']"
                            : ''}"
                        >
                          {item?.growth}%&#42;
                        </span>
                      {:else}
                        <span
                          class={item?.growth > 0
                            ? "text-[#00FC50] before:content-['+']"
                            : item?.growth < 0
                              ? "text-[#FF2F1F]"
                              : ""}
                        >
                          {item?.growth}%
                        </span>
                      {/if}
                    </td>
                  {/each}
                </tr>
                <!--
                <tr class="bg-[#09090B] border-b-[#09090B]">
                  <th
                    class="bg-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap text-white text-start font-medium border-b border-[#09090B]"
                    >Forward PE</th
                  >
                  {#each tableForecastEPS as item}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium bg-[#09090B]"
                    >
                      {item?.forwardPe === "0.00" ||
                      item?.forwardPe === null ||
                      item?.forwardPe === 0
                        ? "-"
                        : abbreviateNumber(item.forwardPe)}
                    </td>
                  {/each}
                </tr>
                -->

                <tr class="bg-[#27272A] border-b-[#27272A]">
                  <th
                    class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-[#27272A] border-b border-[#27272A]"
                    >No. Analysts</th
                  >
                  {#each tableCombinedRevenue as item}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium border-b border-[#27272A] bg-[#09090B]"
                    >
                      {#if item?.FY > 24}
                        {item?.numOfAnalysts === (null || 0)
                          ? "n/a"
                          : item?.numOfAnalysts}
                      {:else}
                        -
                      {/if}
                    </td>
                  {/each}
                </tr>
              </tbody>
            </table>
          </div>

          <div class="text-orange-400 text-xs sm:text-sm mt-2">
            &#42; This value depends on the forecast
          </div>
          <!--
            <div class="mt-5 text-gray-100 text-sm sm:text-[1rem] sm:rounded-md h-auto border border-gray-600 p-4">
              <svg class="w-5 h-5 inline-block mr-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
                ><path fill="#fff" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16" /></svg
              >
              For the current Fiscal Year we use available quarterly data. Complete annual data, used to compare against analyst estimates, is only finalized after the year ends.
            </div>
            -->
        {/if}
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

      <div class="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 mt-10">
        <div>
          <h2 class="mb-2 text-xl font-bold">Revenue Forecast</h2>
          <div class="rounded-sm border p-2 border-gray-600">
            <div class="app h-[275px] w-full">
              {#if optionsRevenue !== null}
                <Chart {init} options={optionsRevenue} class="chart" />
              {/if}
            </div>
            <div
              class="mt-3 overflow-x-auto p-0 text-center sm:p-0.5 lg:mt-3.5"
            >
              <table class="w-full text-right">
                <thead
                  ><tr
                    class="border-b border-gray-600 align-bottom text-white font-normal"
                    ><th
                      class="p-1 text-left font-semibold text-sm sm:text-[1rem]"
                      >Revenue</th
                    >
                    {#each revenueDateList as date, index}
                      <th class="p-1 font-semibold text-sm sm:text-[1rem]">
                        {#if index !== 0}{date}{/if}</th
                      >
                    {/each}
                  </tr></thead
                >
                <tbody
                  ><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >High</td
                    >
                    {#each highRevenueList as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= highRevenueList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            {abbreviateNumber(item?.val)}
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Avg</td
                    >
                    {#each avgRevenueList as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= avgRevenueList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            {abbreviateNumber(item?.val)}
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Low</td
                    >
                    {#each lowRevenueList as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= lowRevenueList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            {abbreviateNumber(item?.val)}
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr></tbody
                >
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 class="mb-2 text-xl font-bold">Revenue Growth</h2>
          <div class="rounded-sm border p-2 border-gray-600">
            <div class="app h-[275px] w-full">
              {#if optionsRevenueGrowth !== null}
                <Chart {init} options={optionsRevenueGrowth} class="chart" />
              {/if}
            </div>
            <div
              class="mt-3 overflow-x-auto p-0 text-center sm:p-0.5 lg:mt-3.5"
            >
              <table class="w-full text-right">
                <thead
                  ><tr
                    class="border-b border-gray-600 align-bottom text-white font-normal whitespace-nowrap"
                    ><th
                      class="p-1 text-left font-semibold text-sm sm:text-[1rem]"
                      >Revenue Growth</th
                    >
                    {#each revenueDateList as date, index}
                      <th class="p-1 font-semibold text-sm sm:text-[1rem]"
                        >{#if index !== 0}{date}{/if}</th
                      >
                    {/each}
                  </tr></thead
                >
                <tbody
                  ><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >High</td
                    >
                    {#each computeGrowthSingleList(highRevenueList, avgRevenueList) as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= highRevenueList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            <span
                              class={item?.growth !== null && item?.growth > 0
                                ? "text-[#00FC50] before:content-['+']"
                                : item?.growth < 0
                                  ? "text-[#FF2F1F]"
                                  : "text-white"}
                            >
                              {item?.growth !== null &&
                              Math.abs(item?.growth - 0) > 0
                                ? abbreviateNumber(item?.growth) + "%"
                                : "-"}
                            </span>
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Avg</td
                    >
                    {#each revenueAvgGrowthList?.filter((item) => item.FY >= 24) as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= avgRevenueList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            <span
                              class={item?.growth !== null && item?.growth > 0
                                ? "text-[#00FC50] before:content-['+']"
                                : item?.growth < 0
                                  ? "text-[#FF2F1F]"
                                  : "text-white"}
                            >
                              {item?.growth !== null &&
                              Math.abs(item?.growth - 0) > 0
                                ? abbreviateNumber(item?.growth) + "%"
                                : "-"}
                            </span>
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Low</td
                    >
                    {#each computeGrowthSingleList(lowRevenueList, avgRevenueList) as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= lowRevenueList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            <span
                              class={item?.growth !== null && item?.growth > 0
                                ? "text-[#00FC50] before:content-['+']"
                                : item?.growth < 0
                                  ? "text-[#FF2F1F]"
                                  : "text-white"}
                            >
                              {item?.growth !== null &&
                              Math.abs(item?.growth - 0) > 0
                                ? abbreviateNumber(item?.growth) + "%"
                                : "-"}
                            </span>
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr></tbody
                >
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 class="mb-2 text-xl font-bold">EPS Forecast</h2>
          <div class="rounded-sm border p-2 border-gray-600">
            <div class="app h-[275px] w-full">
              {#if optionsEPS !== null}
                <Chart {init} options={optionsEPS} class="chart" />
              {/if}
            </div>
            <div
              class="mt-3 overflow-x-auto p-0 text-center sm:p-0.5 lg:mt-3.5"
              data-test="forecast-estimate-table"
            >
              <table class="w-full text-right">
                <thead
                  ><tr class="border-b border-gray-600 align-bottom font-normal"
                    ><th
                      class="p-1 text-left font-semibold text-sm sm:text-[1rem]"
                      >EPS</th
                    >
                    {#each epsDateList as date, index}
                      <th class="p-1 font-semibold text-sm sm:text-[1rem]">
                        {#if index !== 0}{date}{/if}</th
                      >
                    {/each}
                  </tr></thead
                >
                <tbody
                  ><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >High</td
                    >
                    {#each highEPSList as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= highEPSList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            {abbreviateNumber(item?.val)}
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Avg</td
                    >
                    {#each avgEPSList as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= avgEPSList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            {abbreviateNumber(item?.val)}
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Low</td
                    >
                    {#each lowEPSList as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= lowEPSList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            {abbreviateNumber(item?.val)}
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr></tbody
                >
              </table>
            </div>
          </div>
        </div>
        <div>
          <h2 class="mb-2 text-xl font-bold">EPS Growth</h2>
          <div class="rounded-sm border p-2 border-gray-600">
            <div class="app h-[275px] w-full">
              {#if optionsEPSGrowth !== null}
                <Chart {init} options={optionsEPSGrowth} class="chart" />
              {/if}
            </div>
            <div
              class="mt-3 overflow-x-auto p-0 text-center sm:p-0.5 lg:mt-3.5"
            >
              <table class="w-full text-right">
                <thead
                  ><tr class="border-b border-gray-600 align-bottom font-normal"
                    ><th
                      class="p-1 text-left font-semibold text-sm sm:text-[1rem]"
                      >EPS Growth</th
                    >
                    {#each epsDateList as date, index}
                      <th class="p-1 font-semibold text-sm sm:text-[1rem]"
                        >{#if index !== 0}{date}{/if}</th
                      >
                    {/each}
                  </tr></thead
                >
                <tbody
                  ><tr
                    class="border-b border-gray-600 last:border-0 whitespace-nowrap"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >High</td
                    >
                    {#each computeGrowthSingleList(highEPSList, avgEPSList) as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= highEPSList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            <span
                              class={item?.growth !== null && item?.growth > 0
                                ? "text-[#00FC50] before:content-['+']"
                                : item?.growth < 0
                                  ? "text-[#FF2F1F]"
                                  : "text-white"}
                            >
                              {item?.growth !== null &&
                              Math.abs(item?.growth - 0) > 0
                                ? abbreviateNumber(item?.growth) + "%"
                                : "-"}
                            </span>
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Avg</td
                    >
                    {#each epsAvgGrowthList?.filter((item) => item.FY >= 24) as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= avgEPSList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            <span
                              class={item?.growth !== null && item?.growth > 0
                                ? "text-[#00FC50] before:content-['+']"
                                : item?.growth < 0
                                  ? "text-[#FF2F1F]"
                                  : "text-white"}
                            >
                              {item?.growth !== null &&
                              Math.abs(item?.growth - 0) > 0
                                ? abbreviateNumber(item?.growth) + "%"
                                : "-"}
                            </span>
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Low</td
                    >
                    {#each computeGrowthSingleList(lowEPSList, avgEPSList) as item, index}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]">
                        {#if index !== 0}
                          {#if data?.user?.tier !== "Pro" && index >= lowEPSList?.length - 2}
                            <a
                              class="inline-block ml-0.5 text-white"
                              href="/pricing"
                              >Pro<svg
                                class="w-4 h-4 ml-0.5 mb-1 inline-block text-[#A3A3A3]"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="currentColor"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              ></a
                            >
                          {:else}
                            <span
                              class={item?.growth !== null && item?.growth > 0
                                ? "text-[#00FC50] before:content-['+']"
                                : item?.growth < 0
                                  ? "text-[#FF2F1F]"
                                  : "text-white"}
                            >
                              {item?.growth !== null &&
                              Math.abs(item?.growth - 0) > 0
                                ? abbreviateNumber(item?.growth) + "%"
                                : "-"}
                            </span>
                          {/if}
                        {/if}
                      </td>
                    {/each}
                  </tr></tbody
                >
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
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
