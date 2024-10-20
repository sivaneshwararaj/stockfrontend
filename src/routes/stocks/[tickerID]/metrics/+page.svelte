<script lang="ts">
  import { numberOfUnreadNotification, displayCompanyName, stockTicker } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";

  export let data;
  const dataset = [{'date': '2024-06-30', 'value': [26272000000, 2880000000, 454000000, 346000000, 88000000], 'valueGrowth': [16.44, 8.8, 6.32, 5.17, 12.82]}, {'date': '2024-03-31', 'value': [22563000000, 2647000000, 427000000, 329000000, 78000000], 'valueGrowth': [55.46, -7.32, 2.64, 26.05, 6.85]}, {'date': '2023-09-30', 'value': [14514000000, 2856000000, 416000000, 261000000, 73000000], 'valueGrowth': [40.6, 14.88, 9.76, 3.16, 10.61]}, {'date': '2023-06-30', 'value': [10323000000, 2486000000, 379000000, 253000000, 66000000], 'valueGrowth': [324.81, -41.97, -83.08, -14.24, -77.7]}, {'date': '2022-09-30', 'value': [3833000000, 1574000000, 200000000, 251000000, 73000000], 'valueGrowth': [0.71, -22.92, -59.68, 14.09, -47.86]}, {'date': '2022-06-30', 'value': [3806000000, 2042000000, 496000000, 220000000, 140000000], 'valueGrowth': [1.49, -43.59, -20.26, 59.42, -11.39]}, {'date': '2022-03-31', 'value': [3750000000, 3620000000, 622000000, 138000000, 158000000], 'valueGrowth': [27.72, 12.39, 7.8, 2.22, -32.48]}, {'date': '2021-09-30', 'value': [2936000000, 3221000000, 577000000, 135000000, 234000000], 'valueGrowth': [24.09, 5.23, 11.18, -11.18, -42.79]}, {'date': '2021-06-30', 'value': [2366000000, 3061000000, 519000000, 152000000, 409000000], 'valueGrowth': [15.53, 10.91, 39.52, -1.3, 25.08]}, {'date': '2021-03-31', 'value': [2048000000, 2760000000, 372000000, 154000000, 327000000], 'valueGrowth': [7.79, 21.53, 57.63, 23.2, 68.56]}, {'date': '2020-09-30', 'value': [1900000000, 2271000000, 236000000, 125000000, 194000000], 'valueGrowth': [8.45, 37.3, 16.26, 12.61, 32.88]}, {'date': '2020-06-30', 'value': [1752000000, 1654000000, 203000000, 111000000, 146000000], 'valueGrowth': [53.55, 23.53, -33.88, -28.39, 5.8]}, {'date': '2020-03-31', 'value': [1141000000, 1339000000, 307000000, 155000000, 138000000], 'valueGrowth': [57.16, -19.29, -5.25, -4.32, -3.5]}, {'date': '2019-09-30', 'value': [726000000, 1659000000, 324000000, 162000000, 143000000], 'valueGrowth': [10.84, 26.35, 11.34, -22.49, 28.83]}, {'date': '2019-06-30', 'value': [655000000, 1313000000, 291000000, 209000000, 111000000], 'valueGrowth': [-6.56, -23.8, 15.94, 44.14, -71.32]}, {'date': '2018-03-31', 'value': [701000000, 1723000000, 251000000, 145000000, 387000000], 'valueGrowth': [null, null, null, null, null]}]
  const geographicDataset = [{'date': '2024-06-30', 'value': [13022000000, 3667000000, 13351000000], 'valueGrowth': [-3.51, 47.21, 32.75]}, {'date': '2024-03-31', 'value': [13496000000, 2491000000, 10057000000], 'valueGrowth': [114.15, -38.19, 29.13]}, {'date': '2023-09-30', 'value': [6302000000, 4030000000, 7788000000], 'valueGrowth': [4.29, 47.08, 64.86]}, {'date': '2023-06-30', 'value': [6043000000, 2740000000, 4724000000], 'valueGrowth': [153.38, 72.33, 46.84]}, {'date': '2023-03-31', 'value': [2385000000, 1590000000, 3217000000], 'valueGrowth': [11.03, 38.5, 22.09]}, {'date': '2022-09-30', 'value': [2148000000, 1148000000, 2635000000], 'valueGrowth': [8.05, -28.34, -15.38]}, {'date': '2022-06-30', 'value': [1988000000, 1602000000, 3114000000], 'valueGrowth': [2.9, -23.02, -27.16]}, {'date': '2022-03-31', 'value': [1932000000, 2081000000, 4275000000], 'valueGrowth': [71.58, 3.17, -22.99]}, {'date': '2021-09-30', 'value': [1126000000, 2017000000, 5551000000], 'valueGrowth': [13.05, 17.27, 6.89]}, {'date': '2021-06-30', 'value': [996000000, 1720000000, 5193000000], 'valueGrowth': [29.69, 23.65, 66.39]}, {'date': '2021-03-31', 'value': [768000000, 1391000000, 3121000000], 'valueGrowth': [-13.71, 24.98, 26.05]}, {'date': '2020-09-30', 'value': [890000000, 1113000000, 2476000000], 'valueGrowth': [-5.72, 30.18, 35.52]}, {'date': '2020-06-30', 'value': [944000000, 855000000, 1827000000], 'valueGrowth': [89.94, 12.8, 16.3]}, {'date': '2020-03-31', 'value': [497000000, 758000000, 1571000000], 'valueGrowth': [110.59, 0.0, -12.92]}, {'date': '2019-09-30', 'value': [236000000, 758000000, 1804000000], 'valueGrowth': [25.53, 30.02, 18.68]}, {'date': '2019-06-30', 'value': [188000000, 583000000, 1520000000], 'valueGrowth': [-56.68, -22.68, -14.8]}, {'date': '2018-03-31', 'value': [434000000, 754000000, 1784000000], 'valueGrowth': [null, null, null]}];
  
  const categories = ['Data Center', 'Gaming', 'Visualization', 'Automotive', 'OEM and Other'];
  const geographicCategories = ['United States', 'China', 'Other Countries'];

  const xData = dataset?.map(item => item?.date);
  const geographicXData = geographicDataset?.map(item => item?.date);

  const categoryValues = categories.map((_, index) => dataset.map(item => item.value[index]));
  const geographiCategoryValues = geographicCategories.map((_, index) => geographicDataset.map(item => item.value[index]));


  const growthValues = categories?.map((_, index) => dataset.map(item => item.valueGrowth[index]));
  const geographicGrowthValues = geographicCategories?.map((_, index) => geographicDataset?.map(item => item.valueGrowth[index]));

</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Business Metric Overview · stocknear
  </title>
  <meta name="description" content={`View unique business metrics for ${displayCompanyName} (${$stockTicker}) stock, including revenue breakdown, operating income, revenue by geography.`} />
  <meta property="og:title" content={`${$displayCompanyName} (${$stockTicker}) Business Metric Overview · stocknear`} />
  <meta property="og:description" content={`View unique business metrics for ${displayCompanyName} (${$stockTicker}) stock, including revenue breakdown, operating income, revenue by geography.`} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${$displayCompanyName} (${$stockTicker}) Business Metric Overview · stocknear`} />
  <meta name="twitter:description" content={`View unique business metrics for ${displayCompanyName} (${$stockTicker}) stock, including revenue breakdown, operating income, revenue by geography.`} />
</svelte:head>

<section class="bg-[#09090B] overflow-hidden text-white h-full mb-40 sm:mb-0 w-full">
  <div class="flex justify-center m-auto h-full overflow-hidden w-full">
    <div class="relative flex justify-center items-center overflow-hidden w-full">
      <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
        {#if data?.getAnalystEstimate?.length !== 0}

        <h2 class="mt-5 text-xl sm:text-2xl text-gray-200 font-bold mb-4">{$displayCompanyName} Revenue Breakdown</h2>

          <div class="no-scrollbar flex justify-start items-center w-screen sm:w-full mt-6 m-auto overflow-x-scroll pr-5 sm:pr-0">
            <table class="table table-sm shaodow table-pin-cols table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B]">
              <thead>
                <tr>
                  <th class="bg-[#09090B] border-b border-[#09090B] text-white font-semibold text-sm sm:text-[1rem] text-start">Quarter</th>
                  {#each xData as item}
                    <td class="z-20 bg-[#09090B] border-b border-[#09090B] text-white font-semibold text-sm text-center bg-[#09090B]">{new Date(item ?? null)?.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}</td>
                  {/each}
                </tr>
              </thead>
              <tbody class="shadow-md">
                {#each categories as category, index}
                  <tr class="bg-[#09090B] border-b-[#09090B] odd:bg-[#27272A]">
                    <th class="text-white whitespace-nowrap odd:bg-[#27272A] text-sm sm:text-[1rem] text-start font-medium border-b border-[#09090B] sm:hover:text-blue-400 cursor-pointer underline underline-offset-4">{category} Revenue</th>
                    {#each categoryValues[index] as value}
                      <td class="text-white text-sm sm:text-[1rem] text-end font-medium border-b border-[#09090B]">
                        {abbreviateNumber(value)}
                      </td>
                    {/each}
                  </tr>
                  <tr class="bg-[#09090B] border-b-[#09090B]">
                    <th class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-[#09090B] border-b  border-[#09090B]">
                      <span class="ml-2">{category} Revenue Growth</span>
                    </th>
                    {#each growthValues[index] as growthValue}
                      <td class="text-sm sm:text-[1rem] text-end {growthValue > 0 ? "text-[#37C97D]" : growthValue < 0 ? "text-[#FF2F1F]" : 'text-white'} font-medium border-b border-[#09090B]">
                        {growthValue > 0 ? '+' : ''}{growthValue !== null ? growthValue?.toFixed(2) + '%' : '-'}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>




         <h2 class="mt-10 text-xl sm:text-2xl text-gray-200 font-bold mb-4">Revenue by Geography</h2>

          <div class="no-scrollbar flex justify-start items-center w-screen sm:w-full mt-6 m-auto overflow-x-scroll pr-5 sm:pr-0">
            <table class="table table-sm shaodow table-pin-cols table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B]">
              <thead>
                <tr>
                  <th class="bg-[#09090B] border-b border-[#09090B] text-white font-semibold text-sm sm:text-[1rem] text-start">Quarter</th>
                  {#each geographicXData as item}
                    <td class="z-20 bg-[#09090B] border-b border-[#09090B] text-white font-semibold text-sm text-center bg-[#09090B]">{new Date(item ?? null)?.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}</td>
                  {/each}
                </tr>
              </thead>
              <tbody class="shadow-md">
                {#each geographicCategories as category, index}
                  <tr class="bg-[#09090B] border-b-[#09090B] odd:bg-[#27272A]">
                    <th class="text-white whitespace-nowrap odd:bg-[#27272A] text-sm sm:text-[1rem] text-start font-medium border-b border-[#09090B]">{category} Revenue</th>
                    {#each geographiCategoryValues[index] as value}
                      <td class="text-white text-sm sm:text-[1rem] text-end font-medium border-b border-[#09090B]">
                        {abbreviateNumber(value)}
                      </td>
                    {/each}
                  </tr>
                  <tr class="bg-[#09090B] border-b-[#09090B]">
                    <th class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-[#09090B] border-b  border-[#09090B]">
                      <span class="ml-2">{category} Revenue Growth</span>
                    </th>
                    {#each geographicGrowthValues[index] as growthValue}
                      <td class="text-sm sm:text-[1rem] text-end {growthValue > 0 ? "text-[#37C97D]" : growthValue < 0 ? "text-[#FF2F1F]" : 'text-white'} font-medium border-b border-[#09090B]">
                        {growthValue > 0 ? '+' : ''}{growthValue !== null ? growthValue?.toFixed(2) + '%' : '-'}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <div class="text-white p-3 sm:p-5 mb-10 rounded-lg sm:flex sm:flex-row sm:items-center border border-slate-800 text-sm sm:text-[1rem]">
            <svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12l-2 2m0-2l2-2m2 2h6m-6 0H6" />
            </svg>
            <p class="font-medium">No estimates available.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
