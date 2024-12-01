<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    coolMode,
    timeFrame,
    stockTicker,
  } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  //import * as XLSX from 'xlsx';
  import { Chart } from "svelte-echarts";
  import { goto } from "$app/navigation";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import FinancialTable from "$lib/components/FinancialTable.svelte";

  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;

  let optionsData;

  let cashFlow = [];
  let fullStatement = [];
  let filterRule = "annual";
  let displayStatement = "netIncome";

  let tableList = [];

  let activeIdx = 0;

  const tabs = [
    {
      title: "Annual",
    },
    {
      title: "Quarterly",
    },
  ];
  const statementConfig = [
    {
      propertyName: "netIncome",
      growthPropertyName: "growthNetIncome",
      label: "Net Income",
      text: "Net income is a company's accounting profits after subtracting all costs and expenses from the revenue. It is also called earnings, profits.",
    },
    {
      propertyName: "depreciationAndAmortization",
      growthPropertyName: "growthDepreciationAndAmortization",
      label: "Depreciation & Amortization",
      text: "Depreciation and amortization are accounting methods for calculating how the value of a business's assets change over time. Depreciation refers to physical assets, while amortization refers to intangible assets.",
    },
    {
      propertyName: "stockBasedCompensation",
      growthPropertyName: "growthStockBasedCompensation",
      label: "Stock-Based Compensation",
      text: "Stock-based compensation is the value of stocks issued for the purpose of compensating the executives and employees of a company.",
    },
    {
      propertyName: "otherWorkingCapital",
      growthPropertyName: "growthOtherWorkingCapital",
      label: "Other Working Capital",
      text: "Other working capital represents miscellaneous changes in short-term assets and liabilities that don't have specific categories, affecting the company's available cash.",
    },
    {
      propertyName: "otherNonCashItems",
      growthPropertyName: "growthOtherNonCashItems",
      label: "Other Non-Cash Items",
      text: "Other Non-Cash Items refers to non-cash transactions or adjustments that impact the company's financial performance but don't involve actual cash flows. These can include items like depreciation, amortization, or changes in the fair value of investments.",
    },
    {
      propertyName: "deferredIncomeTax",
      growthPropertyName: "growthDeferredIncomeTax",
      label: "Deferred Income Tax",
      text: "Deferred income tax refers to future tax liabilities or assets resulting from differences in how a company reports income for tax purposes versus financial reporting. It represents the amount of income tax that will be paid or saved in the future due to these differences.",
    },
    {
      propertyName: "changeInWorkingCapital",
      growthPropertyName: "growthChangeInWorkingCapital",
      label: "Change in Working Capital",
      text: "Change in working capital is the difference between a company's short-term assets and liabilities over a specific period, reflecting how much cash flow is impacted by these changes.",
    },
    {
      propertyName: "netCashProvidedByOperatingActivities",
      growthPropertyName: "growthNetCashProvidedByOperatingActivites",
      label: "Operating Cash Flow",
      text: "Operating cash flow, also called cash flow from operating activities, measures the amount of cash that a company generates from normal business activities. It is the amount of cash left after all cash income has been received, and all cash expenses have been paid.",
    },
    {
      propertyName: "capitalExpenditure",
      growthPropertyName: "growthCapitalExpenditure",
      label: "Capital Expenditures",
      text: "Capital expenditures are also called payments for property, plants and equipment. It measures cash spent on long-term assets that will be used to run the business, such as manufacturing equipment, real estate and others.",
    },
    {
      propertyName: "acquisitionsNet",
      growthPropertyName: "growthAcquisitionsNet",
      label: "Acquisitions",
      text: "The amount of cash spent on acquiring other businesses.",
    },
    {
      propertyName: "purchasesOfInvestments",
      growthPropertyName: "growthPurchasesOfInvestments",
      label: "Purchase of Investments",
      text: "Purchase of Investments refers to the acquisition of financial assets like stocks or bonds by a company, typically for investment purposes. It represents an outflow of cash used to buy these investments.",
    },
    {
      propertyName: "salesMaturitiesOfInvestments",
      growthPropertyName: "growthSalesMaturitiesOfInvestments",
      label: "Sales Maturities Of Investments",
      text: "Sales Maturities of Investments signifies the selling or maturity of financial assets like stocks or bonds by a company. It represents an inflow of cash resulting from these investment activities.",
    },
    {
      propertyName: "otherInvestingActivites",
      growthPropertyName: "growthOtherInvestingActivites",
      label: "Other Investing Acitivies",
      text: "Other investing activities are investing activities that do not belong to any of the categories we mentioned so far.",
    },
    {
      propertyName: "netCashUsedForInvestingActivites",
      growthPropertyName: "growthNetCashUsedForInvestingActivites",
      label: "Investing Cash Flow",
      text: "Investing cash flow is the total change in cash from buying and selling investments and long-term assets.",
    },
    {
      propertyName: "debtRepayment",
      growthPropertyName: "growthDebtRepayment",
      label: "Debt Repayment",
      text: "Debt Repayment is the process of paying off loans or debt obligations. It represents an outflow of cash as the company reduces its outstanding debt.",
    },
    {
      propertyName: "commonStockRepurchased",
      growthPropertyName: "growthCommonStockRepurchased",
      label: "Common Stock Repurchased",
      text: "The cash gained from issuing shares, or cash spent on repurchasing shares via share buybacks. A positive number implies that the company issued more shares than it repurchased. A negative number implies that the company bought back shares.",
    },
    {
      propertyName: "dividendsPaid",
      growthPropertyName: "growthDividendsPaid",
      label: "Dividend Paid",
      text: "The total amount paid out as cash dividends to shareholders.",
    },
    {
      propertyName: "otherFinancingActivites",
      growthPropertyName: "growthOtherFinancingActivites",
      label: "Other Financial Acitivies",
      text: "Other financial activities includes miscellaneous financial transactions beyond regular operations that impact a company's cash flow.",
    },
    {
      propertyName: "netCashUsedProvidedByFinancingActivities",
      growthPropertyName: "growthNetCashUsedProvidedByFinancingActivities",
      label: "Financial Cash Flow",
      text: "Financing cash flow is the total change in cash through financing activities. This includes dividend payments, share issuance and repurchases, changes in debt levels and others.",
    },
    {
      propertyName: "netChangeInCash",
      growthPropertyName: "growthNetChangeInCash",
      label: "Net Cash Flow",
      text: "Net cash flow is the sum of the operating, investing and financing cash flow numbers. It is the change in cash and equivalents on the company's balance sheet during the accounting period. It is often shown as increase/decrease in cash and equivalents on the cash flow statement.",
    },
    {
      propertyName: "freeCashFlow",
      growthPropertyName: "growthFreeCashFlow",
      label: "Free Cash Flow",
      text: "Free cash flow is the cash remaining after the company spends on everything required to maintain and grow the business. It is calculated by subtracting capital expenditures from operating cash flow.",
    },
  ];

  const fields = statementConfig.map((item) => ({
    label: item.label,
    key: item.propertyName,
  }));

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

    for (let i = cashFlow?.length - 1; i >= 0; i--) {
      const statement = cashFlow[i];
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

  fullStatement = data?.getCashFlowStatement;

  displayStatement = "netIncome";

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
          `${filterRule === "annual" ? "_annual" : "_quarter"}_cashflow_statement.csv`;
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

  $: {
    if ($timeFrame || displayStatement || activeIdx) {
      if (activeIdx === 0) {
        filterRule = "annual";
        fullStatement = data?.getCashFlowStatement?.annual;
      } else {
        filterRule = "quarterly";
        fullStatement = data?.getCashFlowStatement?.quarter;
      }
      cashFlow = filterStatement(fullStatement, $timeFrame);

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
    {$displayCompanyName} ({$stockTicker}) Cash Flow Statement · stocknear
  </title>
  <meta
    name="description"
    content={`Detailed cash flow statements for ${$displayCompanyName} (${$stockTicker}), including operating cash flow, capex and free cash flow.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Cash Flow Statement · stocknear`}
  />
  <meta
    property="og:description"
    content={`Detailed cash flow statements for ${$displayCompanyName} (${$stockTicker}), including operating cash flow, capex and free cash flow.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Cash Flow Statement · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Detailed cash flow statements for ${$displayCompanyName} (${$stockTicker}), including operating cash flow, capex and free cash flow.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full bg-[#09090B] overflow-hidden text-white h-full">
  <div
    class="flex justify-center w-full m-auto h-full overflow-hidden mt-4 sm:mt-0"
  >
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
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
                Cashflow {filterRule === "annual" ? "(Annual)" : "(Quarter)"}
              {/if}
            </h1>
          </div>

          <div class="grid grid-cols-1 gap-2 w-full">
            <div
              class="w-full text-white p-3 sm:p-5 rounded-md sm:flex sm:flex-row sm:items-center border border-gray-600 text-sm sm:text-[1rem]"
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
              {:else if cashFlow?.length > 0}
                Get detailed ratio statement breakdowns, uncovering price to
                free cash flow ratio, price per earnings, and much more.
              {:else}
                No financial data available for {$displayCompanyName}
              {/if}
            </div>
            {#if cashFlow?.length > 0}
              <div
                class="inline-flex justify-center w-full rounded-md sm:w-auto sm:ml-auto mt-3 mb-6"
              >
                <div
                  class="bg-[#313131] w-full min-w-24 sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 mt-4"
                >
                  {#each tabs as item, i}
                    {#if data?.user?.tier !== "Pro" && i > 0}
                      <button
                        on:click={() => goto("/pricing")}
                        class="group relative z-[1] rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1"
                      >
                        <span class="relative text-sm block font-semibold">
                          {item.title}
                          <svg
                            class="inline-block ml-0.5 -mt-1 w-3.5 h-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            ><path
                              fill="#A3A3A3"
                              d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                            /></svg
                          >
                        </span>
                      </button>
                    {:else}
                      <button
                        on:click={() => (activeIdx = i)}
                        class="group relative z-[1] rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {activeIdx ===
                        i
                          ? 'z-0'
                          : ''} "
                      >
                        {#if activeIdx === i}
                          <div
                            class="absolute inset-0 rounded-md bg-[#fff]"
                          ></div>
                        {/if}
                        <span
                          class="relative text-sm block font-semibold {activeIdx ===
                          i
                            ? 'text-black'
                            : 'text-white'}"
                        >
                          {item.title}
                        </span>
                      </button>
                    {/if}
                  {/each}
                </div>
              </div>

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
                          class="w-full border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                        >
                          <span class="truncate text-white">{$timeFrame}</span>
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
                            on:click={() => ($timeFrame = "5Y")}
                            class="cursor-pointer hover:bg-[#27272A]"
                          >
                            5 years
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => ($timeFrame = "10Y")}
                            class="cursor-pointer hover:bg-[#27272A]"
                          >
                            10 years
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => ($timeFrame = "MAX")}
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
                    class="ml-2 w-full border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
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
                      class="w-36 select select-bordered select-sm p-0 pl-5 overflow-y-auto bg-[#313131]"
                      on:change={changeStatement}
                    >
                      <option disabled>Choose an Cash Flow Variable</option>
                      <option value="netIncome" selected>Net Income</option>
                      <option value="depreciationAndAmortization"
                        >Depreciation & Amortization</option
                      >
                      <option value="stockBasedCompensation"
                        >Stock-Based Compensation</option
                      >
                      <option value="otherWorkingCapital"
                        >Other Working Capital</option
                      >
                      <option value="otherNonCashItems"
                        >Other Non-Cash Items</option
                      >
                      <option value="deferredIncomeTax"
                        >Deferred Income Tax</option
                      >
                      <option value="changeInWorkingCapital"
                        >Change in Working Capital</option
                      >
                      <option value="netCashProvidedByOperatingActivities"
                        >Operating Cash Flow</option
                      >
                      <option value="capitalExpenditure"
                        >Capital Expenditures</option
                      >
                      <option value="acquisitionsNet">Acquisitions</option>
                      <option value="purchasesOfInvestments"
                        >Purchase of Investments</option
                      >
                      <option value="salesMaturitiesOfInvestments"
                        >Sales Maturities Of Investments</option
                      >
                      <option value="otherInvestingActivites"
                        >Other Investing Acitivies</option
                      >
                      <option value="netCashUsedForInvestingActivites"
                        >Investing Cash Flow</option
                      >
                      <option value="debtRepayment">Debt Repayment</option>
                      <option value="commonStockRepurchased"
                        >Common Stock Repurchased</option
                      >
                      <option value="dividendsPaid">Dividend Paid</option>
                      <option value="otherFinancingActivites"
                        >Other Financial Acitivies</option
                      >
                      <option value="netCashUsedProvidedByFinancingActivities"
                        >Financial Cash Flow</option
                      >
                      <option value="netChangeInCash">Net Cash Flow</option>
                      <option value="freeCashFlow">Free Cash Flow</option>
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
                      <tr class="border border-gray-600">
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
                                    (tableList[index + 1]?.value -
                                      item?.value) /
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
                  class="w-full rounded-none sm:rounded-md m-auto overflow-x-auto"
                >
                  <table class="table table-sm table-compact w-full">
                    <thead>
                      <tr class="text-white">
                        <td class="text-start text-white text-sm font-semibold"
                          >Year</td
                        >
                        {#each cashFlow as cash}
                          {#if filterRule === "annual"}
                            <td
                              class="bg-[#09090B] font-semibold text-end text-sm"
                            >
                              {"FY" + cash?.calendarYear?.slice(-2)}
                            </td>
                          {:else}
                            <td
                              class="bg-[#09090B] font-semibold text-end text-sm"
                            >
                              {"FY" +
                                cash?.calendarYear?.slice(-2) +
                                " " +
                                cash?.period}
                            </td>
                          {/if}
                        {/each}
                      </tr>
                    </thead>
                    <tbody>
                      <!-- row -->
                      <FinancialTable data={cashFlow} {fields} />
                    </tbody>
                  </table>
                </div>
              {/if}
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
