<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    stockTicker,
  } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;

  const names = data?.getBusinessMetrics?.revenue?.names || [];

  const subsectionTitles = ["Overview", ...names];

  const sectionMap = Object.fromEntries(
    subsectionTitles?.map((title) => {
      const key = title
        ?.toLowerCase()
        ?.replace(/&/g, "") // Remove & symbol
        ?.replace(/\s+/g, "-") // Replace spaces with dash
        ?.replace(/-{2,}/g, "-") // Replace multiple dashes with single dash
        ?.replace(/^-|-$/g, "") // Remove leading/trailing dashes
        ?.trim();
      return [key, key === "overview" ? "" : key];
    }),
  );
  const dataset = data?.getBusinessMetrics?.revenue?.history || [];
  const geographicDataset = data?.getBusinessMetrics?.geographic?.history || [];
  const operatingExpensesDataset =
    data?.getBusinessMetrics?.operatingExpenses?.history || [];

  const revenueNames = data?.getBusinessMetrics?.revenue?.names || [];
  const geographicNames = data?.getBusinessMetrics?.geographic?.names || [];
  const operatingExpensesNames =
    data?.getBusinessMetrics?.operatingExpenses?.names || [];

  const xData = dataset?.map((item) => item?.date);
  const geographicXData = geographicDataset?.map((item) => item?.date);
  const operatingExpensesXData = operatingExpensesDataset?.map(
    (item) => item?.date,
  );

  const categoryValues = revenueNames?.map((_, index) =>
    dataset?.map((item) => item.value[index]),
  );
  const geographiCategoryValues = geographicNames?.map((_, index) =>
    geographicDataset?.map((item) => item.value[index]),
  );
  const operatingExpensesCategoryValues = operatingExpensesNames?.map(
    (_, index) => operatingExpensesDataset?.map((item) => item.value[index]),
  );

  const growthValues = revenueNames?.map((_, index) =>
    dataset?.map((item) => item.valueGrowth[index]),
  );
  const geographicGrowthValues = geographicNames?.map((_, index) =>
    geographicDataset?.map((item) => item.valueGrowth[index]),
  );
  const operatingExpensesGrowthValues = operatingExpensesNames?.map(
    (_, index) =>
      operatingExpensesDataset?.map((item) => item.valueGrowth[index]),
  );

  function getHref(title) {
    const key = title?.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
    const path =
      key === "overview" ? "/metrics" : `/metrics/${sectionMap[key]}`;
    return `/stocks/${$stockTicker}${path}`;
  }
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Business Metric Overview · Stocknear
  </title>
  <meta
    name="description"
    content={`View unique business metrics for ${displayCompanyName} (${$stockTicker}) stock, including revenue breakdown, operating income, revenue by geography.`}
  />
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Business Metric Overview · Stocknear`}
  />
  <meta
    property="og:description"
    content={`View unique business metrics for ${displayCompanyName} (${$stockTicker}) stock, including revenue breakdown, operating income, revenue by geography.`}
  />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Business Metric Overview · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`View unique business metrics for ${displayCompanyName} (${$stockTicker}) stock, including revenue breakdown, operating income, revenue by geography.`}
  />
</svelte:head>

<section class="bg-default overflow-hidden text-white min-h-screen w-full">
  <div class="flex justify-center m-auto h-full overflow-hidden w-full">
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        {#if revenueNames?.length !== 0 || geographicNames?.length !== 0}
          <h2 class="mt-5 text-xl sm:text-2xl text-gray-200 font-bold mb-4">
            {$displayCompanyName} Revenue Breakdown
          </h2>

          <div
            class="no-scrollbar flex justify-start items-center w-screen sm:w-full mt-6 m-auto overflow-x-scroll pr-5 sm:pr-0"
          >
            <table
              class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800"
            >
              <thead class="bg-default">
                <tr>
                  <th
                    class=" border-b border-gray-800 text-white font-semibold text-sm sm:text-[1rem] text-start"
                    >Quarter</th
                  >
                  {#each xData as item}
                    <th
                      class="z-20 border-b border-gray-800 text-white font-semibold text-sm text-center"
                      >{new Date(item ?? null)?.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}</th
                    >
                  {/each}
                </tr>
              </thead>
              <tbody class="shadow-md">
                {#each revenueNames as name, index}
                  <tr class="bg-table odd:bg-odd">
                    <th
                      class="whitespace-nowrap odd:bg-odd text-sm sm:text-[1rem] text-start font-medium border-b border-gray-800"
                    >
                      <a
                        href={getHref(name)}
                        class="sm:hover:text-blue-400 cursor-pointer underline underline-offset-4"
                      >
                        {name} Revenue
                      </a>
                    </th>
                    {#each categoryValues[index] as value}
                      <td
                        class="text-white text-sm sm:text-[1rem] text-end font-medium border-b border-gray-800"
                      >
                        {@html value !== null && value !== undefined
                          ? abbreviateNumber(value, false, true)
                          : "n/a"}
                      </td>
                    {/each}
                  </tr>
                  <tr class="bg-table border-b-[#09090B]">
                    <td
                      class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-table border-b border-gray-800"
                    >
                      <span class="ml-2">{name} Revenue Growth</span>
                    </td>
                    {#each growthValues[index] as growthValue}
                      <td
                        class="text-sm sm:text-[1rem] text-end {growthValue > 0
                          ? 'text-[#00FC50]'
                          : growthValue < 0
                            ? 'text-[#FF2F1F]'
                            : 'text-white'} font-medium border-b border-gray-800"
                      >
                        {growthValue > 0 ? "+" : ""}{growthValue !== null &&
                        growthValue !== undefined
                          ? growthValue?.toFixed(2) + "%"
                          : "n/a"}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          {#if geographicNames?.length !== 0}
            <h2 class="mt-10 text-xl sm:text-2xl text-gray-200 font-bold mb-4">
              Revenue by Geography
            </h2>

            <div
              class="no-scrollbar flex justify-start items-center w-screen sm:w-full mt-6 m-auto overflow-x-scroll pr-5 sm:pr-0"
            >
              <table
                class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800"
              >
                <thead>
                  <tr>
                    <th
                      class="bg-default border-b border-gray-800 text-white font-semibold text-sm sm:text-[1rem] text-start"
                      >Quarter</th
                    >
                    {#each geographicXData as item}
                      <th
                        class="z-20 bg-default border-b border-gray-800 text-white font-semibold text-sm text-center bg-default"
                        >{new Date(item ?? null)?.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}</th
                      >
                    {/each}
                  </tr>
                </thead>
                <tbody class="shadow-md">
                  {#each geographicNames as name, index}
                    <tr class="bg-table border-b-[#09090B] odd:bg-odd">
                      <th
                        class="text-white whitespace-nowrap odd:bg-odd text-sm sm:text-[1rem] text-start font-medium border-b border-gray-800"
                        >{name} Revenue</th
                      >
                      {#each geographiCategoryValues[index] as value}
                        <th
                          class="text-white text-sm sm:text-[1rem] text-center font-medium border-b border-gray-800"
                        >
                          {@html value !== null &&
                          value !== 0 &&
                          value !== undefined
                            ? abbreviateNumber(value, false, true)
                            : "n/a"}
                        </th>
                      {/each}
                    </tr>
                    <tr class="bg-table border-b-[#09090B]">
                      <td
                        class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-table border-b border-gray-800"
                      >
                        <span class="ml-2">{name} Revenue Growth</span>
                      </td>
                      {#each geographicGrowthValues[index] as growthValue}
                        <td
                          class="text-sm sm:text-[1rem] text-center {growthValue >
                          0
                            ? 'text-[#00FC50]'
                            : growthValue < 0
                              ? 'text-[#FF2F1F]'
                              : 'text-white'} font-medium border-b border-gray-800"
                        >
                          {growthValue > 0 ? "+" : ""}{growthValue !== null &&
                          growthValue !== 0 &&
                          growthValue !== undefined
                            ? growthValue?.toFixed(2) + "%"
                            : "n/a"}
                        </td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}

          {#if operatingExpensesNames?.length !== 0}
            <h2 class="mt-10 text-xl sm:text-2xl text-gray-200 font-bold mb-4">
              Operating Expense Breakdown
            </h2>

            <div
              class="no-scrollbar flex justify-start items-center w-screen sm:w-full mt-6 m-auto overflow-x-scroll pr-5 sm:pr-0"
            >
              <table
                class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800"
              >
                <thead>
                  <tr>
                    <th
                      class="bg-default border-b border-gray-800 text-white font-semibold text-sm sm:text-[1rem] text-start"
                      >Quarter</th
                    >
                    {#each operatingExpensesXData as item}
                      <th
                        class="z-20 bg-default border-b border-gray-800 text-white font-semibold text-sm text-center bg-default"
                        >{new Date(item ?? null)?.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}</th
                      >
                    {/each}
                  </tr>
                </thead>
                <tbody class="shadow-md">
                  {#each operatingExpensesNames as name, index}
                    <tr class="bg-table border-b-[#09090B] odd:bg-odd">
                      <th
                        class="text-white whitespace-nowrap odd:bg-odd text-sm sm:text-[1rem] text-start font-medium border-b border-gray-800"
                        >{name} Revenue</th
                      >
                      {#each operatingExpensesCategoryValues[index] as value}
                        <th
                          class="text-white text-sm sm:text-[1rem] text-center font-medium border-b border-gray-800"
                        >
                          {@html value !== null &&
                          value !== 0 &&
                          value !== undefined
                            ? abbreviateNumber(value, false, true)
                            : "n/a"}
                        </th>
                      {/each}
                    </tr>
                    <tr class="bg-table border-b-[#09090B]">
                      <td
                        class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-table border-b border-gray-800"
                      >
                        <span class="ml-2">{name} Revenue Growth</span>
                      </td>
                      {#each operatingExpensesGrowthValues[index] as growthValue}
                        <td
                          class="text-sm sm:text-[1rem] text-center {growthValue >
                          0
                            ? 'text-[#00FC50]'
                            : growthValue < 0
                              ? 'text-[#FF2F1F]'
                              : 'text-white'} font-medium border-b border-gray-800"
                        >
                          {growthValue > 0 ? "+" : ""}{growthValue !== null &&
                          growthValue !== 0 &&
                          growthValue !== undefined
                            ? growthValue?.toFixed(2) + "%"
                            : "n/a"}
                        </td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        {:else}
          <Infobox
            text={`Currently, there are no business metrics available for ${$stockTicker}.`}
          />
        {/if}
      </div>
    </div>
  </div>
</section>
