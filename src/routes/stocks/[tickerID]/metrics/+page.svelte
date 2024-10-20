<script lang="ts">
  import { numberOfUnreadNotification, displayCompanyName, stockTicker } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";

  export let data;
  const dataset = [{'date': '2024-06-30', 'value': [26272000000, 2880000000, 454000000, 346000000, 88000000], 'valueGrowth': [16.44, 8.8, 6.32, 5.17, 12.82]}, {'date': '2024-03-31', 'value': [22563000000, 2647000000, 427000000, 329000000, 78000000], 'valueGrowth': [22.6, -7.61, -7.78, 17.08, -13.33]}, {'date': '2023-12-31', 'value': [18404000000, 2865000000, 463000000, 281000000, 90000000], 'valueGrowth': [26.8, 0.32, 11.3, 7.66, 23.29]}, {'date': '2023-09-30', 'value': [14514000000, 2856000000, 416000000, 261000000, 73000000], 'valueGrowth': [40.6, 14.88, 9.76, 3.16, 10.61]}, {'date': '2023-06-30', 'value': [10323000000, 2486000000, 379000000, 253000000, 66000000], 'valueGrowth': [324.81, -41.97, -83.08, -14.24, -77.7]}, {'date': '2022-12-31', 'value': [3616000000, 1831000000, 226000000, 294000000, 84000000], 'valueGrowth': [-5.66, 16.33, 13.0, 17.13, 15.07]}, {'date': '2022-09-30', 'value': [3833000000, 1574000000, 200000000, 251000000, 73000000], 'valueGrowth': [0.71, -22.92, -59.68, 14.09, -47.86]}, {'date': '2022-06-30', 'value': [3806000000, 2042000000, 496000000, 220000000, 140000000], 'valueGrowth': [1.49, -43.59, -20.26, 59.42, -11.39]}, {'date': '2022-03-31', 'value': [3750000000, 3620000000, 622000000, 138000000, 158000000], 'valueGrowth': [14.92, 5.85, -3.27, 10.4, -17.71]}, {'date': '2021-12-31', 'value': [3263000000, 3420000000, 643000000, 125000000, 192000000], 'valueGrowth': [11.14, 6.18, 11.44, -7.41, -17.95]}, {'date': '2021-09-30', 'value': [2936000000, 3221000000, 577000000, 135000000, 234000000], 'valueGrowth': [24.09, 5.23, 11.18, -11.18, -42.79]}, {'date': '2021-06-30', 'value': [2366000000, 3061000000, 519000000, 152000000, 409000000], 'valueGrowth': [15.53, 10.91, 39.52, -1.3, 25.08]}, {'date': '2021-03-31', 'value': [2048000000, 2760000000, 372000000, 154000000, 327000000], 'valueGrowth': [-32.72, -28.01, -39.41, -48.67, 12.37]}, {'date': '2020-12-31', 'value': [3044000000, 3834000000, 614000000, 300000000, 291000000], 'valueGrowth': [60.21, 68.82, 160.17, 140.0, 50.0]}, {'date': '2020-09-30', 'value': [1900000000, 2271000000, 236000000, 125000000, 194000000], 'valueGrowth': [8.45, 37.3, 16.26, 12.61, 32.88]}, {'date': '2020-06-30', 'value': [1752000000, 1654000000, 203000000, 111000000, 146000000], 'valueGrowth': [null, null, null, null, null]}];
  const geographicDataset = [{'date': '2024-06-30', 'value': [13022000000, 3667000000, 13351000000], 'valueGrowth': [-3.51, 47.21, 32.75]}, {'date': '2024-03-31', 'value': [13496000000, 2491000000, 10057000000], 'valueGrowth': [10.3, 28.01, 4.8]}, {'date': '2023-12-31', 'value': [12236000000, 1946000000, 9596000000], 'valueGrowth': [94.16, -51.71, 23.22]}, {'date': '2023-09-30', 'value': [6302000000, 4030000000, 7788000000], 'valueGrowth': [4.29, 47.08, 64.86]}, {'date': '2023-06-30', 'value': [6043000000, 2740000000, 4724000000], 'valueGrowth': [153.38, 72.33, 46.84]}, {'date': '2023-03-31', 'value': [2385000000, 1590000000, 3217000000], 'valueGrowth': [7.24, 66.67, -27.72]}, {'date': '2022-12-31', 'value': [2224000000, 954000000, 4451000000], 'valueGrowth': [3.54, -16.9, 68.92]}, {'date': '2022-09-30', 'value': [2148000000, 1148000000, 2635000000], 'valueGrowth': [8.05, -28.34, -15.38]}, {'date': '2022-06-30', 'value': [1988000000, 1602000000, 3114000000], 'valueGrowth': [2.9, -23.02, -27.16]}, {'date': '2022-03-31', 'value': [1932000000, 2081000000, 4275000000], 'valueGrowth': [32.42, 4.94, 39.89]}, {'date': '2021-12-31', 'value': [1459000000, 1983000000, 3056000000], 'valueGrowth': [29.57, -1.69, -44.95]}, {'date': '2021-09-30', 'value': [1126000000, 2017000000, 5551000000], 'valueGrowth': [13.05, 17.27, 6.89]}, {'date': '2021-06-30', 'value': [996000000, 1720000000, 5193000000], 'valueGrowth': [29.69, 23.65, 66.39]}, {'date': '2021-03-31', 'value': [768000000, 1391000000, 3121000000], 'valueGrowth': [-44.35, -27.48, -28.5]}, {'date': '2020-12-31', 'value': [1380000000, 1918000000, 4365000000], 'valueGrowth': [55.06, 72.33, 76.29]}, {'date': '2020-09-30', 'value': [890000000, 1113000000, 2476000000], 'valueGrowth': [-5.72, 30.18, 35.52]}, {'date': '2020-06-30', 'value': [944000000, 855000000, 1827000000], 'valueGrowth': [null, null, null]}]
  
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
