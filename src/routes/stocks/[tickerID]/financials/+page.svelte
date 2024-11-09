<script lang="ts">
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
  import { Chart } from "svelte-echarts";
  import { goto } from "$app/navigation";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;

  let isLoaded = true;
  let optionsData;
  let tableList = [];

  let income = [];
  let fullStatement = [];
  let filterRule = "annual";
  let displayStatement = "revenue";

  $coolMode = false;
  let timeFrame = "10Y";

  const statementConfig = [
    {
      propertyName: "revenue",
      growthPropertyName: "growthRevenue",
      label: "Revenue",
      text: "Revenue, also called sales, is the amount of money a company receives from its business activities, such as sales of products or services. Revenue does not take any expenses into account and is therefore different from profits.",
    },
    {
      propertyName: "costOfRevenue",
      growthPropertyName: "growthCostOfRevenue",
      label: "Cost of Revenue",
      text: "Cost of revenue is also called cost of goods sold (COGS). It is the variable cost related to the company's production of products and services.",
    },
    {
      propertyName: "grossProfit",
      growthPropertyName: "growthGrossProfit",
      label: "Gross Profit",
      text: "Gross profit is a company’s profit after subtracting the costs directly linked to making and delivering its products and services.",
    },
    {
      propertyName: "sellingGeneralAndAdministrativeExpenses",
      growthPropertyName: "growthSellingGeneralAndAdministrativeExpenses",
      label: "Selling & General & Admin",
      text: "Selling, general and administrative (SG&A) is an operating expense. It involves various company expenses that are not related to production.",
    },
    {
      propertyName: "researchAndDevelopmentExpenses",
      growthPropertyName: "growthResearchAndDevelopmentExpenses",
      label: "Research & Development",
      text: "Research and development (R&D) is an operating expense. It is the amount of money a company spends on researching and developing new products and services, or improving existing ones.",
    },
    {
      propertyName: "otherExpenses",
      growthPropertyName: "growthOtherExpenses",
      label: "Other Expenses",
      text: "Other expenses typically refer to costs that are not directly related to the primary operations of the business. These can include a wide variety of things, such as interest expense, taxes, depreciation and amortization, losses from investments, legal fees and restructuring costs.",
    },
    {
      propertyName: "operatingExpenses",
      growthPropertyName: "growthOperatingExpenses",
      label: "Operating Expenses",
      text: "Operating expenses are a company's fixed costs that a company incurs during its ongoing business operations. It can include SG&A, R&D and other expenses.",
    },
    {
      propertyName: "interestExpense",
      growthPropertyName: "growthInterestExpense",
      label: "Interest Expense",
      text: "Interest expense is the amount that the company paid or received in interest. A positive number indicates a net expense, while a negative number implies that the company had more interest income from its cash reserves than it paid for interest on debt.",
    },
    {
      propertyName: "incomeBeforeTax",
      growthPropertyName: "growthIncomeBeforeTax",
      label: "Pretax Income",
      text: "Pretax income is a company's profits before accounting for income taxes.",
    },
    {
      propertyName: "incomeTaxExpense",
      growthPropertyName: "growthIncomeTaxExpense",
      label: "Income Tax",
      text: "Income tax is the amount of corporate income tax that the company has incurred during the fiscal period.",
    },
    {
      propertyName: "netIncome",
      growthPropertyName: "growthNetIncome",
      label: "Net Income",
      text: `Net income is a company's accounting profits after subtracting all costs and expenses from the revenue. It is also called earnings, profits or "the bottom line."`,
    },
    {
      propertyName: "weightedAverageShsOut",
      growthPropertyName: "growthWeightedAverageShsOut",
      label: "Shares Outstanding (Basic)",
      text: "Basic shares outstanding is the total amount of common stock held by all of a company's shareholders.",
    },
    {
      propertyName: "weightedAverageShsOutDil",
      growthPropertyName: "growthWeightedAverageShsOutDil",
      label: "Shares Outstanding (Diluted)",
      text: "Diluted shares outstanding is the total amount of common stock that will be outstanding if all stock options, warrants and convertible securities are exercised.",
    },
    {
      propertyName: "eps",
      growthPropertyName: "growthEPS",
      label: "EPS (Basic)",
      text: "Earnings per share is the portion of a company's profit that is allocated to each individual stock. EPS is calculated by dividing net income by shares outstanding.",
    },
    {
      propertyName: "epsdiluted",
      growthPropertyName: "growthEPSDiluted",
      label: "EPS (Diluted)",
      text: `Earnings per share is the portion of a company's profit that is allocated to each individual stock. Diluted EPS is calculated by dividing net income by "diluted" shares outstanding.`,
    },
    {
      propertyName: "ebitda",
      growthPropertyName: "growthEBITDA",
      label: "EBITDA",
      text: `EBITDA stands for "Earnings Before Interest, Taxes, Depreciation and Amortization." It is a commonly used measure of profitability.`,
    },
    {
      propertyName: "depreciationAndAmortization",
      growthPropertyName: "growthDepreciationAndAmortization",
      label: "Depreciation & Amortization",
      text: "Depreciation and amortization are accounting methods for calculating how the value of a business's assets change over time. Depreciation refers to physical assets, while amortization refers to intangible assets.",
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

    for (let i = income?.length - 1; i >= 0; i--) {
      const statement = income[i];
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

  fullStatement = data?.getIncomeStatement;
  timeFrame = "10Y";
  displayStatement = "revenue";

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
          `${filterRule === "annual" ? "_annual" : "_quarter"}_income_statement.csv`;
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
    if (timeFrame || displayStatement || filterRule) {
      if (filterRule === "annual") {
        fullStatement = data?.getIncomeStatement?.annual;
      } else {
        fullStatement = data?.getIncomeStatement?.quarter;
      }
      income = filterStatement(fullStatement, timeFrame);

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
    {$displayCompanyName} ({$stockTicker}) Financials - Income Statement ·
    stocknear
  </title>
  <meta
    name="description"
    content={`Detailed annual and timeFramely income statement for ${$displayCompanyName} (${$stockTicker}). See many years of revenue, expenses and profits or losses.`}
  />
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Financials - Income Statement · stocknear`}
  />
  <meta
    property="og:description"
    content={`Detailed annual and timeFramely income statement for ${$displayCompanyName} (${$stockTicker}). See many years of revenue, expenses and profits or losses.`}
  />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Financials - Income Statement · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Detailed annual and timeFramely income statement for ${$displayCompanyName} (${$stockTicker}). See many years of revenue, expenses and profits or losses.`}
  />
</svelte:head>

<section class="bg-[#09090B] w-full overflow-hidden text-white h-full">
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if isLoaded}
        <main class="w-full">
          <div class="sm:p-7 m-auto mt-2 sm:mt-0">
            <div class="mb-3">
              <h1 class="text-xl sm:text-2xl text-white font-bold">
                {#if $coolMode}
                  {statementConfig?.find(
                    (item) => item?.propertyName === displayStatement,
                  )?.label}
                {:else}
                  Income Statement {filterRule === "annual"
                    ? "(Annual)"
                    : "(Quarter)"}
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
                      : 'bg-[#313131] text-white'} font-semibold"
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
                        : 'bg-[#313131] text-white'} font-semibold rounded-r-md"
                    >
                      Quartely
                    </label>
                  {:else}
                    <a
                      href="/pricing"
                      class="flex flex-row items-center m-auto justify-center cursor-pointer inline-block w-full py-1.5 bg-[#313131] font-semibold text-white rounded-r-md"
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
                      class="w-36 select select-bordered select-sm p-0 pl-5 overflow-y-auto bg-[#313131]"
                      on:change={changeStatement}
                    >
                      <option disabled>Choose an Cash Flow Variable</option>
                      <option value="revenue" selected>Revenue</option>
                      <option value="costOfRevenue">Cost of Revenue</option>
                      <option value="grossProfit">Gross Profit</option>
                      <option value="sellingGeneralAndAdministrativeExpenses"
                        >Selling, General & Admin</option
                      >
                      <option value="researchAndDevelopmentExpenses"
                        >Research & Development</option
                      >
                      <option value="otherExpenses">Other Expenses</option>
                      <option value="operatingExpenses"
                        >Operating Expenses</option
                      >
                      <option value="interestExpense">Interest Expense</option>
                      <option value="incomeBeforeTax">Pretax Income</option>
                      <option value="incomeTaxExpense">Income Tax</option>
                      <option value="netIncome">Net Income</option>
                      <option value="weightedAverageShsOut"
                        >Shares Outstanding (Basic)</option
                      >
                      <option value="weightedAverageShsOutDil"
                        >Shares Outstanding (Diluted)</option
                      >
                      <option value="eps">EPS (Basic)</option>
                      <option value="epsdiluted">EPS (Diluted)</option>
                      <option value="ebitda">EBITDA</option>
                      <option value="depreciationAndAmortization"
                        >Depreciation & Amortization</option
                      >
                    </select>
                  </div>
                </div>

                <div class="app w-full">
                  <Chart {init} options={optionsData} class="chart" />
                </div>

                <h2 class="mt-5 text-2xl text-gray-200 font-semibold">
                  {statementConfig?.find(
                    (item) => item?.propertyName === displayStatement,
                  )?.label} History
                </h2>

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
                  class="w-full rounded-none sm:rounded-lg m-auto overflow-x-auto"
                >
                  <table class="table table-sm table-compact w-full">
                    <thead>
                      <tr class="text-white">
                        <td
                          class="text-start bg-[#09090B] text-white text-sm font-semibold pr-10"
                          >Year</td
                        >
                        {#each income as cash}
                          {#if filterRule === "annual"}
                            <td
                              class="bg-[#09090B] font-semibold text-sm text-end"
                            >
                              {"FY" + cash?.calendarYear?.slice(-2)}
                            </td>
                          {:else}
                            <td
                              class="bg-[#09090B] font-semibold text-sm text-end"
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
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Revenue</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.revenue)}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Cost of Revenue</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.costOfRevenue)}</td
                          >
                        {/each}
                      </tr>
                      <!-- row -->
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Gross Profit</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.grossProfit)}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Selling, General & Admin</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(
                              cash?.sellingGeneralAndAdministrativeExpenses,
                            )}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Research & Development</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(
                              cash?.researchAndDevelopmentExpenses,
                            )}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Other Expenses</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.otherExpenses)}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Operating Expenses</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.o)}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Interest Expense</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.interestExpense)}</td
                          >
                        {/each}
                      </tr>
                      <!-- row -->
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Pretax Income</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.incomeBeforeTax)}</td
                          >
                        {/each}
                      </tr>
                      <!-- row -->
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Income Tax</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.incomeTaxExpense)}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Net Income</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.netIncome)}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Shares Outstanding (Basic)</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.weightedAverageShsOut)}</td
                          >
                        {/each}
                      </tr>
                      <!-- row -->
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >Shares Outstanding (Diluted)</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(
                              cash?.weightedAverageShsOutDil,
                            )}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >EPS (Basic)</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {cash?.eps?.toFixed(2)}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >EPS (Diluted)</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {cash?.epsdiluted?.toFixed(2)}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
                          >EBITDA</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.ebitda)}</td
                          >
                        {/each}
                      </tr>
                      <tr class="text-white odd:bg-[#27272A]">
                        <td
                          class="text-start border-r whitespace-nowrap border-[#191E24] text-white text-sm sm:text-[1rem]"
                          >Depreciation & Amortization</td
                        >
                        {#each income as cash}
                          <td class=" text-sm sm:text-[1rem] text-end">
                            {abbreviateNumber(cash?.depreciation)}</td
                          >
                        {/each}
                      </tr>
                    </tbody>
                  </table>
                </div>
              {/if}
            </div>
          </div>
        </main>
      {:else}
        <div class="w-full flex justify-center items-center h-80">
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
