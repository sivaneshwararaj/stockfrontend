<script lang="ts">
  import { Chart } from "svelte-echarts";
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    stockTicker,
    coolMode,
  } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  //import * as XLSX from 'xlsx';
  import { goto } from "$app/navigation";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;

  let ratios = [];
  let fullStatement = [];
  let tableList = [];

  let filterRule = "annual";
  let optionsData;

  let displayStatement = "priceEarningsRatio";

  $coolMode = false;
  let timeFrame = "10Y";

  const statementConfig = [
    {
      propertyName: "priceEarningsRatio",
      label: "PE Ratio",
      text: "The price-to-earnings (P/E) ratio is a valuation metric that shows how expensive a stock is relative to earnings.",
    },
    {
      propertyName: "priceToSalesRatio",
      label: "PS Ratio",
      text: "The price-to-sales (P/S) ratio is a commonly used valuation metric. It shows how expensive a stock is compared to revenue.",
    },
    {
      propertyName: "priceToBookRatio",
      label: "PB Ratio",
      text: "The price-to-book (P/B) ratio measures a stock's price relative to book value. Book value is also called Shareholders' equity.",
    },
    {
      propertyName: "priceToFreeCashFlowsRatio",
      label: "P/FCF Ratio",
      text: "The price to free cash flow (P/FCF) ratio is similar to the P/E ratio, except it uses free cash flow instead of accounting earnings.",
    },
    {
      propertyName: "priceToOperatingCashFlowsRatio",
      label: "P/OCF Ratio",
      text: "The price to operating cash flow (P/OCF) ratio measures the price of a stock relative to operating cash flow.",
    },
    {
      propertyName: "operatingCashFlowSalesRatio",
      label: "OCF/S Ratio",
      text: "The operating cash flow to sales (OCF/S) Ratio assesses how well sales convert to cash. It's the operating cash flow divided by net sales, indicating cash efficiency.",
    },
    {
      propertyName: "debtEquityRatio",
      label: "Debt / Equity Ratio",
      text: "The debt-to-equity ratio measures a company's debt levels relative to its shareholders' equity or book value. A high ratio implies that a company has a lot of debt.",
    },
    {
      propertyName: "quickRatio",
      label: "Quick Ratio",
      text: "The quick ratio measure a company's short-term liquidity. A low number indicates that the company may have trouble paying its upcoming financial obligations.",
    },
    {
      propertyName: "currentRatio",
      label: "Current Ratio",
      text: "The current ratio is used to measure a company's short-term liquidity. A low number can indicate that a company will have trouble paying its upcoming liabilities.",
    },
    {
      propertyName: "assetTurnover",
      label: "Asset Turnover",
      text: "The asset turnover ratio measures the amount of sales relative to a company's assets. It indicates how efficiently the company uses its assets to generate revenue.",
    },
    {
      propertyName: "interestCoverage",
      label: "Interest Coverage",
      text: "The interest coverage ratio is a measure of the ability of a company to pay its interest expenses. It is calculated by dividing the company's Earnings Before Interest and Taxes (EBIT) by its interest expenses.",
    },
    {
      propertyName: "returnOnEquity",
      label: "Return on Equity (ROE)",
      text: `Return on equity (ROE) is a profitability metric that shows how efficient a company is at using its equity (or "net" assets) to generate profits. It is calculated by dividing the company's net income by the average shareholders' equity during the past 12 months.`,
    },
    {
      propertyName: "returnOnAssets",
      label: "Return on Assets (ROA)",
      text: `Return on assets (ROA) is a metric that measures how much profit a company is able to generate using its assets. It is calculated by dividing net income by the average total assets for the past 12 months.`,
    },
    {
      propertyName: "returnOnCapitalEmployed",
      label: "Return on Capital (ROIC)",
      text: `Return on invested capital (ROIC) measures how effective a company is at investing its capital in order to increase profits. It is calculated by dividing the NOPAT (Net Operating Profit After Tax) by the invested capital.`,
    },
    {
      propertyName: "dividendYield",
      label: "Dividend Yield",
      text: "The dividend yield is how much a stock pays in dividends each year, as a percentage of the stock price.",
    },
    {
      propertyName: "payoutRatio",
      label: "Payout Ratio",
      text: "The dividend payout ratio is the percentage of a company's profits that are paid out as dividends. A high ratio implies that the dividend payments may not be sustainable.",
    },
    {
      propertyName: "grossProfitMargin",
      label: "Gross Profit Margin",
      text: "Gross Profit Margin is the percentage of revenue left as gross profits, after subtracting cost of goods sold from the revenue.",
    },
    {
      propertyName: "netProfitMargin",
      label: "Net Profit Margin",
      text: "Net Profit Margin is the percentage of revenue left as net income, or profits, after subtracting all costs and expenses from the revenue.",
    },
  ];

  function toggleMode() {
    $coolMode = !$coolMode;
  }

  function changeStatement(event) {
    displayStatement = event.target.value;
  }

  function plotData() {
    let labelName = "-";
    let xList = [];
    let valueList = [];
    tableList = [];

    const index = statementConfig?.findIndex(
      (item) => item?.propertyName === displayStatement,
    );

    for (let i = ratios?.length - 1; i >= 0; i--) {
      const statement = ratios[i];
      const year = statement?.calendarYear?.slice(-2);
      const quarter = statement?.period;

      // Determine the label based on filterRule
      if (filterRule === "annual") {
        xList.push("FY" + year);
      } else {
        xList.push("FY" + year + " " + quarter);
      }

      // Calculate the value and growth
      const value = Number(
        statement[statementConfig[index]?.propertyName],
      )?.toFixed(2);

      valueList.push(value);

      // Add the entry to tableList
      tableList.push({
        date: statement?.date,
        value: value,
      });
    }

    //sort tableList by date
    tableList?.sort((a, b) => new Date(b?.date) - new Date(a?.date));

    labelName = statementConfig[index]?.label;

    const options = {
      animation: false,
      grid: {
        left: "0%",
        right: "0%",
        bottom: "2%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        axisLabel: {
          color: "#fff",
        },
        data: xList,
        type: "category",
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
          name: labelName,
          data: valueList,
          type: "bar",
          smooth: true,
          itemStyle: {
            color: "#fff",
          },
        },
      ],
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
      },
    };

    return options;
  }

  const exportFundamentalData = (format = "csv") => {
    if (data?.user?.tier === "Pro") {
      const data = fullStatement;
      if (!data || data.length === 0) {
        return;
      }

      let properties = [
        {
          key: filterRule === "annual" ? "calendarYear" : "date",
          label: filterRule === "annual" ? "Year" : "Quarter",
        },
      ];

      for (let i = 0; i < statementConfig?.length; i++) {
        properties.push({
          key: statementConfig[i]?.propertyName,
          label: statementConfig[i]?.label,
        });
      }

      // Helper function to handle special cases

      // Create rows for CSV/Excel
      let rows = data.map((item) =>
        properties?.map((property) => item[property?.key] || 0),
      );

      // Include headers
      const headers = properties.map((prop) => prop.label);
      rows.unshift(headers);

      // Check the format to export
      if (format.toLowerCase() === "csv") {
        const csvContent = rows.map((row) => row.join(",")).join("\n");
        const blob = new Blob([csvContent], {
          type: "data:text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          $stockTicker.toLowerCase() +
          `${filterRule === "annual" ? "_annual" : "_quarter"}_balance_sheet_statement.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } /*else if (format.toLowerCase() === "excel") {
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ratios Statement");
      XLSX.writeFile(
        workbook,
        `${$stockTicker.toLowerCase()}-ratios-statement.xlsx`,
      );
      
    }
      */
    } else {
      goto("/pricing");
    }
  };

  fullStatement = data?.getRatiosStatement;
  timeFrame = "10Y";
  displayStatement = "priceEarningsRatio";

  const getCurrentYear = () => new Date()?.getFullYear();

  const filterStatement = (fullStatement, timeFrame) => {
    const currentYear = getCurrentYear();

    switch (timeFrame) {
      case "5Y":
        return fullStatement?.filter(
          (item) => currentYear - parseInt(item?.calendarYear) < 5,
        );
      case "10Y":
        return fullStatement?.filter(
          (item) => currentYear - parseInt(item?.calendarYear) < 10,
        );
      default:
        return fullStatement;
    }
  };

  $: {
    if (timeFrame || displayStatement || filterRule) {
      if (filterRule === "annual") {
        fullStatement = data?.getRatiosStatement?.annual;
      } else {
        fullStatement = data?.getRatiosStatement?.quarter;
      }

      ratios = filterStatement(fullStatement, timeFrame);

      if ($coolMode === true) {
        optionsData = plotData();
      }
    }
  }
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Financial Ratios and Metrics ·
    stocknear
  </title>
  <meta
    name="description"
    content={`Financial ratios and metrics for ${$displayCompanyName} (${$stockTicker}). Includes annual, quarterly and trailing numbers with full history and charts.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Financial Ratios and Metrics · stocknear`}
  />
  <meta
    property="og:description"
    content={`Financial ratios and metrics for ${$displayCompanyName} (${$stockTicker}). Includes annual, quarterly and trailing numbers with full history and charts.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Financial Ratios and Metrics · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Financial ratios and metrics for ${$displayCompanyName} (${$stockTicker}). Includes annual, quarterly and trailing numbers with full history and charts.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="bg-[#09090B] overflow-hidden text-white h-full">
  <div class="flex justify-center w-full m-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:p-7 m-auto mt-2 sm:mt-0 w-full">
          <div class="mb-3">
            <h1 class="text-xl sm:text-2xl text-white font-bold">
              {#if $coolMode}
                {statementConfig?.find(
                  (item) => item?.propertyName === displayStatement,
                )?.label}
              {:else}
                Ratios {filterRule === "annual" ? "(Annual)" : "(Quarter)"}
              {/if}
            </h1>
          </div>

          <div class="grid grid-cols-1 gap-2">
            <div
              class="text-white p-3 sm:p-5 mb-10 rounded-lg sm:flex sm:flex-row sm:items-center border border-slate-800 text-sm sm:text-[1rem]"
            >
              <svg
                class="w-6 h-6 flex-shrink-0 inline-block sm:mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                ><path
                  fill="#fff"
                  d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
                /></svg
              >

              {#if $coolMode}
                {statementConfig?.find(
                  (item) => item?.propertyName === displayStatement,
                )?.text}
                <!--<Katex formula={true} math={"\\textrm{Revenue}=\\textrm{Revenue} - \\textrm{All Expenses}"}/>-->
              {:else}
                Get detailed income statement breakdowns, uncovering revenue,
                expenses, and much more.
              {/if}
            </div>

            <ul
              class="text-[0.8rem] font-medium text-center w-56 w-56 pb-6 flex justify-center sm:justify-end items-center m-auto sm:m-0 sm:ml-auto"
            >
              <li class="w-full">
                <label
                  on:click={() => (filterRule = "annual")}
                  class="cursor-pointer rounded-l-md inline-block w-full text-sm py-1.5 {filterRule ===
                  'annual'
                    ? 'bg-[#fff] text-black'
                    : 'bg-[#2A303C] text-white'} font-semibold"
                  aria-current="page"
                >
                  Annual
                </label>
              </li>
              <li class="w-full">
                {#if data?.user?.tier === "Pro"}
                  <label
                    on:click={() => (filterRule = "quartely")}
                    class="cursor-pointer inline-block w-full py-1.5 text-sm {filterRule ===
                    'quartely'
                      ? 'bg-[#fff] text-black'
                      : 'bg-[#2A303C] text-white'} font-semibold rounded-r-md"
                  >
                    Quartely
                  </label>
                {:else}
                  <a
                    href="/pricing"
                    class="flex flex-row items-center m-auto justify-center cursor-pointer inline-block w-full py-1.5 bg-[#2A303C] font-semibold text-white rounded-r-md"
                  >
                    <span class="">Quarterly</span>
                    <svg
                      class="ml-1 -mt-0.5 w-3.5 h-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      ><path
                        fill="#A3A3A3"
                        d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                      /></svg
                    >
                  </a>
                {/if}
              </li>
            </ul>

            <div
              class="mb-2 flex flex-row items-center w-full justify-end sm:justify-center"
            >
              <label
                class="inline-flex mt-2 sm:mt-0 cursor-pointer relative mr-auto"
              >
                <input
                  on:click={toggleMode}
                  type="checkbox"
                  checked={$coolMode}
                  value={$coolMode}
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-400 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1563F9]"
                ></div>
                {#if $coolMode}
                  <span class="ml-2 text-sm font-medium text-white">
                    Cool Mode
                  </span>
                {:else}
                  <span class="ml-2 text-sm font-medium text-white">
                    Boring Mode
                  </span>
                {/if}
              </label>

              <div
                class="flex flex-row items-center w-fit sm:w-[50%] md:w-auto sm:ml-auto"
              >
                <div class="relative inline-block text-left grow">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                      <Button
                        builders={[builder]}
                        class="w-full border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-lg truncate"
                      >
                        <span class="truncate text-white">{timeFrame}</span>
                        <svg
                          class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          style="max-width:40px"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                      class="w-56 h-fit max-h-72 overflow-y-auto scroller"
                    >
                      <DropdownMenu.Label class="text-gray-400">
                        Select time frame
                      </DropdownMenu.Label>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Group>
                        <DropdownMenu.Item
                          on:click={() => (timeFrame = "5Y")}
                          class="cursor-pointer hover:bg-[#27272A]"
                        >
                          5 years
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          on:click={() => (timeFrame = "10Y")}
                          class="cursor-pointer hover:bg-[#27272A]"
                        >
                          10 years
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          on:click={() => (timeFrame = "MAX")}
                          class="cursor-pointer hover:bg-[#27272A]"
                        >
                          Max
                        </DropdownMenu.Item>
                      </DropdownMenu.Group>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
                <Button
                  on:click={() => exportFundamentalData("csv")}
                  class="ml-2 w-full border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-lg truncate"
                >
                  <span class="truncate text-white">Download</span>
                  <svg
                    class="{data?.user?.tier === 'Pro'
                      ? 'hidden'
                      : ''} ml-1 -mt-0.5 w-3.5 h-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    ><path
                      fill="#A3A3A3"
                      d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                    /></svg
                  >
                </Button>
              </div>
            </div>

            {#if $coolMode}
              <div class="sm:w-full">
                <div class="relative">
                  <select
                    class="w-36 select select-bordered select-sm p-0 pl-5 overflow-y-auto bg-[#2A303C]"
                    on:change={changeStatement}
                  >
                    <option disabled>Choose an Income Variable</option>
                    <option value="priceEarningsRatio" selected>PE Ratio</option
                    >
                    <option value="priceToSalesRatio">PS Ratio</option>
                    <option value="priceToBookRatio">PB Ratio</option>
                    <option value="priceToFreeCashFlowsRatio"
                      >P/FCF Ratio</option
                    >
                    <option value="priceToOperatingCashFlowsRatio"
                      >P/OCF Ratio</option
                    >
                    <option value="operatingCashFlowSalesRatio"
                      >OCF/S Ratio</option
                    >
                    <option value="debtEquityRatio">Debt / Equity Ratio</option>
                    <option value="quickRatio">Quick Ratio</option>
                    <option value="currentRatio">Current Ratio</option>
                    <option value="assetTurnover">Asset Turnover</option>
                    <option value="interestCoverage">Interest Coverage</option>
                    <option value="returnOnEquity"
                      >Return on Equity (ROE)</option
                    >
                    <option value="returnOnAssets"
                      >Return on Assets (ROA)</option
                    >
                    <option value="returnOnCapitalEmployed"
                      >Return on Capital (ROIC)</option
                    >
                    <option value="dividendYield">Dividend Yield</option>
                    <option value="payoutRatio">Payout Ratio</option>
                    <option value="grossProfitMargin"
                      >Gross Profit Margin</option
                    >
                    <option value="netProfitMargin">Net Profit Margin</option>
                  </select>
                </div>
              </div>

              <div class="app w-full">
                <Chart {init} options={optionsData} class="chart" />
              </div>

              <div class="w-full overflow-x-scroll">
                <table
                  class="table table-sm table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4"
                >
                  <thead>
                    <tr class="border border-slate-800">
                      <th
                        class="text-white font-semibold text-start text-sm sm:text-[1rem]"
                        >{filterRule === "annual"
                          ? "Fiscal Year End"
                          : "Quarter Ends"}</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >{statementConfig?.find(
                          (item) => item?.propertyName === displayStatement,
                        )?.label}</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >Change</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >Growth</th
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each tableList as item, index}
                      <!-- row -->
                      <tr
                        class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B] shake-ticker cursor-pointer"
                      >
                        <td
                          class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
                        >
                          {item?.date}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] text-right whitespace-nowrap border-b-[#09090B]"
                        >
                          {abbreviateNumber(item?.value)}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end border-b-[#09090B]"
                        >
                          {item?.value - tableList[index + 1]?.value !== 0
                            ? abbreviateNumber(
                                (
                                  item?.value - tableList[index + 1]?.value
                                )?.toFixed(2),
                              )
                            : "-"}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end border-b-[#09090B]"
                        >
                          {#if index + 1 - tableList?.length === 0}
                            -
                          {:else if item?.value === 0 && tableList[index + 1]?.value < 0}
                            <span class="text-[#FF2F1F]">-100.00%</span>
                          {:else if item?.value === 0 && tableList[index + 1]?.value > 0}
                            <span class="text-[#00FC50]">100.00%</span>
                          {:else if item?.value - tableList[index + 1]?.value > 0}
                            <span class="text-[#00FC50]">
                              {(
                                ((item?.value - tableList[index + 1]?.value) /
                                  Math.abs(item?.value)) *
                                100
                              )?.toFixed(2)}%
                            </span>
                          {:else if item?.value - tableList[index + 1]?.value < 0}
                            <span class="text-[#FF2F1F]">
                              -{(
                                Math?.abs(
                                  (tableList[index + 1]?.value - item?.value) /
                                    Math.abs(item?.value),
                                ) * 100
                              )?.toFixed(2)}%
                            </span>
                          {:else}
                            -
                          {/if}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <div
                class="w-full rounded-none sm:rounded-lg m-auto overflow-x-auto"
              >
                <table class="table table-sm table-compact w-full">
                  <thead>
                    <tr class="text-white">
                      <td class="text-start text-sm font-semibold">Year</td>
                      {#each ratios as item}
                        {#if filterRule === "annual"}
                          <td
                            class="bg-[#09090B] font-semibold text-end text-sm"
                          >
                            {"FY" + item?.calendarYear?.slice(-2)}
                          </td>
                        {:else}
                          <td
                            class="bg-[#09090B] font-semibold text-end text-sm"
                          >
                            {"FY" +
                              item?.calendarYear?.slice(-2) +
                              " " +
                              item?.period}
                          </td>
                        {/if}
                      {/each}
                    </tr>
                  </thead>
                  <tbody>
                    <!-- row -->
                    <tr class="text-white odd:bg-[#27272A] whitespace-nowrap">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >PE Ratio</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? (item?.priceEarningsRatio / 4)?.toFixed(2)
                            : item?.priceEarningsRatio?.toFixed(2)}
                        </td>
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >PS Ratio</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? (item?.priceToSalesRatio / 4)?.toFixed(2)
                            : item?.priceToSalesRatio?.toFixed(2)}
                        </td>
                      {/each}
                    </tr>
                    <!-- row -->
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >PB Ratio</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? (item?.priceToBookRatio / 4)?.toFixed(2)
                            : item?.priceToBookRatio?.toFixed(2)}
                        </td>
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A] whitespace-nowrap">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >P/FCF Ratio</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? (item?.priceToFreeCashFlowsRatio / 4)?.toFixed(2)
                            : item?.priceToFreeCashFlowsRatio?.toFixed(2)}
                        </td>
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >P/OCF Ratio</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? (
                                item?.priceToOperatingCashFlowsRatio / 4
                              )?.toFixed(2)
                            : item?.priceToOperatingCashFlowsRatio?.toFixed(2)}
                        </td>
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >OCF/S Ratio</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? (item?.operatingCashFlowSalesRatio / 4)?.toFixed(
                                2,
                              )
                            : item?.operatingCashFlowSalesRatio?.toFixed(2)}
                        </td>
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start whitespace-nowrap border-r border-gray-700 text-sm sm:text-[1rem]"
                        >Debt / Equity Ratio</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? (item?.debtEquityRatio / 4)?.toFixed(2)
                            : item?.debtEquityRatio?.toFixed(2)}
                        </td>
                      {/each}
                    </tr>
                    <!-- row -->
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >Quick Ratio</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? (item?.quickRatio / 4)?.toFixed(2)
                            : item?.quickRatio?.toFixed(2)}
                        </td>
                      {/each}
                    </tr>
                    <!-- row -->
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >Current Ratio</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? (item?.currentRatio / 4)?.toFixed(2)
                            : item?.currentRatio?.toFixed(2)}
                        </td>
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem] whitespace-nowrap"
                        >Asset Turnover</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {item?.assetTurnover?.toFixed(2)}
                        </td>
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >Interest Coverage</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? (item?.interestCoverage / 4)?.toFixed(2)
                            : item?.interestCoverage?.toFixed(2)}
                        </td>
                      {/each}
                    </tr>
                    <!-- row -->
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >Return on Equity (ROE)</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {(item?.returnOnEquity * 100)?.toFixed(2)}%
                        </td>
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start whitespace-nowrap border-r border-gray-700 text-sm sm:text-[1rem]"
                        >Return on Assets (ROA)</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end"
                          >{(item?.returnOnAssets * 100)?.toFixed(2)}%</td
                        >
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >Return on Capital (ROIC)</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {(item?.returnOnCapitalEmployed * 100)?.toFixed(
                            2,
                          )}%</td
                        >
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >Dividend Yield</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {(item?.dividendYield * 100)?.toFixed(2)}%</td
                        >
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >Payout Ratio</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? ((item?.payoutRatio / 4) * 100)?.toFixed(2)
                            : (item?.payoutRatio * 100)?.toFixed(2)}%
                        </td>
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >Gross Profit Margin</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? ((item?.grossProfitMargin / 4) * 100)?.toFixed(2)
                            : (item?.grossProfitMargin * 100)?.toFixed(2)}%
                        </td>
                      {/each}
                    </tr>
                    <tr class="text-white odd:bg-[#27272A]">
                      <td
                        class="text-start border-r border-gray-700 text-sm sm:text-[1rem]"
                        >Net Profit Margin</td
                      >
                      {#each ratios as item}
                        <td class="text-sm sm:text-[1rem] text-end">
                          {filterRule === "annual"
                            ? ((item?.netProfitMargin / 4) * 100)?.toFixed(2)
                            : (item?.netProfitMargin * 100)?.toFixed(2)}%
                        </td>
                      {/each}
                    </tr>
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        </div>
      </main>
    </div>
  </div>
</section>

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
