<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    stockTicker,
  } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";

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

  const revenueNames = data?.getBusinessMetrics?.revenue?.names || [];

  const geographicNames = data?.getBusinessMetrics?.geographic?.names || [];

  const xData = dataset?.map((item) => item?.date);
  const geographicXData = geographicDataset?.map((item) => item?.date);

  const categoryValues = revenueNames?.map((_, index) =>
    dataset?.map((item) => item.value[index]),
  );
  const geographiCategoryValues = geographicNames?.map((_, index) =>
    geographicDataset?.map((item) => item.value[index]),
  );

  const growthValues = revenueNames?.map((_, index) =>
    dataset?.map((item) => item.valueGrowth[index]),
  );
  const geographicGrowthValues = geographicNames?.map((_, index) =>
    geographicDataset?.map((item) => item.valueGrowth[index]),
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

<section class="bg-[#09090B] overflow-hidden text-white min-h-screen w-full">
  <div class="flex justify-center m-auto h-full overflow-hidden w-full">
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
    >
      <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
        {#if revenueNames?.length !== 0 || geographicNames?.length !== 0}
          <h2 class="mt-5 text-xl sm:text-2xl text-gray-200 font-bold mb-4">
            {$displayCompanyName} Revenue Breakdown
          </h2>

          <div
            class="no-scrollbar flex justify-start items-center w-screen sm:w-full mt-6 m-auto overflow-x-scroll pr-5 sm:pr-0"
          >
            <table
              class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-[#09090B]"
            >
              <thead class="">
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
                  <tr class="bg-[#09090B] border-b-[#09090B] odd:bg-odd">
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
                  <tr class="bg-[#09090B] border-b-[#09090B]">
                    <td
                      class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-[#09090B] border-b border-gray-800"
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
                class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B]"
              >
                <thead>
                  <tr>
                    <th
                      class="bg-[#09090B] border-b border-gray-800 text-white font-semibold text-sm sm:text-[1rem] text-start"
                      >Quarter</th
                    >
                    {#each geographicXData as item}
                      <th
                        class="z-20 bg-[#09090B] border-b border-gray-800 text-white font-semibold text-sm text-center bg-[#09090B]"
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
                    <tr class="bg-[#09090B] border-b-[#09090B] odd:bg-odd">
                      <th
                        class="text-white whitespace-nowrap odd:bg-odd text-sm sm:text-[1rem] text-start font-medium border-b border-gray-800"
                        >{name} Revenue</th
                      >
                      {#each geographiCategoryValues[index] as value}
                        <th
                          class="text-white text-sm sm:text-[1rem] text-end font-medium border-b border-gray-800"
                        >
                          {@html value !== null &&
                          value !== 0 &&
                          value !== undefined
                            ? abbreviateNumber(value, false, true)
                            : "n/a"}
                        </th>
                      {/each}
                    </tr>
                    <tr class="bg-[#09090B] border-b-[#09090B]">
                      <td
                        class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-[#09090B] border-b border-gray-800"
                      >
                        <span class="ml-2">{name} Revenue Growth</span>
                      </td>
                      {#each geographicGrowthValues[index] as growthValue}
                        <td
                          class="text-sm sm:text-[1rem] text-end {growthValue >
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
          <div
            class="mt-5 sm:mt-0 border-l-4 border-white p-0 sm:p-4 text-white flex flex-row items-center"
          >
            <svg
              class="h-6 w-6 hidden sm:block"
              viewBox="0 0 20 20"
              fill="currentColor"
              style="max-width:40px"
              aria-hidden="true"
              ><path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              ></path></svg
            >
            <div class="ml-3 w-full">
              <div class="flex w-full flex-row justify-between">
                <div>
                  Currently, there are no business metrics available for {$stockTicker}.
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
