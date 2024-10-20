<script lang="ts">
import {numberOfUnreadNotification,displayCompanyName, stockTicker} from '$lib/store';
import { abbreviateNumber } from '$lib/utils';

import { Chart } from 'svelte-echarts'

import { init, use } from 'echarts/core'
  import { LineChart, BarChart } from 'echarts/charts'
  import { GridComponent, TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { onMount } from 'svelte';
  use([LineChart, BarChart, GridComponent,TooltipComponent, CanvasRenderer])




    export let data;
    
    let isLoaded = false;
    let optionsData;

    let rawData = [{'date': '2024-06-30', 'value': [26272000000, 2880000000, 454000000, 346000000, 88000000], 'valueGrowth': [16.44, 8.8, 6.32, 5.17, 12.82]}, {'date': '2024-03-31', 'value': [22563000000, 2647000000, 427000000, 329000000, 78000000], 'valueGrowth': [22.6, -7.61, -7.78, 17.08, -13.33]}, {'date': '2023-12-31', 'value': [18404000000, 2865000000, 463000000, 281000000, 90000000], 'valueGrowth': [26.8, 0.32, 11.3, 7.66, 23.29]}, {'date': '2023-09-30', 'value': [14514000000, 2856000000, 416000000, 261000000, 73000000], 'valueGrowth': [40.6, 14.88, 9.76, 3.16, 10.61]}, {'date': '2023-06-30', 'value': [10323000000, 2486000000, 379000000, 253000000, 66000000], 'valueGrowth': [324.81, -41.97, -83.08, -14.24, -77.7]}, {'date': '2022-12-31', 'value': [3616000000, 1831000000, 226000000, 294000000, 84000000], 'valueGrowth': [-5.66, 16.33, 13.0, 17.13, 15.07]}, {'date': '2022-09-30', 'value': [3833000000, 1574000000, 200000000, 251000000, 73000000], 'valueGrowth': [0.71, -22.92, -59.68, 14.09, -47.86]}, {'date': '2022-06-30', 'value': [3806000000, 2042000000, 496000000, 220000000, 140000000], 'valueGrowth': [1.49, -43.59, -20.26, 59.42, -11.39]}, {'date': '2022-03-31', 'value': [3750000000, 3620000000, 622000000, 138000000, 158000000], 'valueGrowth': [14.92, 5.85, -3.27, 10.4, -17.71]}, {'date': '2021-12-31', 'value': [3263000000, 3420000000, 643000000, 125000000, 192000000], 'valueGrowth': [11.14, 6.18, 11.44, -7.41, -17.95]}, {'date': '2021-09-30', 'value': [2936000000, 3221000000, 577000000, 135000000, 234000000], 'valueGrowth': [24.09, 5.23, 11.18, -11.18, -42.79]}, {'date': '2021-06-30', 'value': [2366000000, 3061000000, 519000000, 152000000, 409000000], 'valueGrowth': [15.53, 10.91, 39.52, -1.3, 25.08]}, {'date': '2021-03-31', 'value': [2048000000, 2760000000, 372000000, 154000000, 327000000], 'valueGrowth': [-32.72, -28.01, -39.41, -48.67, 12.37]}, {'date': '2020-12-31', 'value': [3044000000, 3834000000, 614000000, 300000000, 291000000], 'valueGrowth': [60.21, 68.82, 160.17, 140.0, 50.0]}, {'date': '2020-09-30', 'value': [1900000000, 2271000000, 236000000, 125000000, 194000000], 'valueGrowth': [8.45, 37.3, 16.26, 12.61, 32.88]}, {'date': '2020-06-30', 'value': [1752000000, 1654000000, 203000000, 111000000, 146000000], 'valueGrowth': [null, null, null, null, null]}]
    
    
    let dataset = []
    let tableList = [];



function convertToTitleCase(str) {
    return str
        ?.split('-') // Split the string by hyphen
        ?.map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        ?.join(' ')
        ?.replace('Oem', 'OEM')
}




function plotData()
    {
        const plotDataset = [...dataset]?.sort((a, b) => new Date(a?.date) - new Date(b?.date));
        const xData = plotDataset?.map(item => item?.date);
        let valueList = [];
        for (let i = 0; i < plotDataset?.length; i++) {
        valueList.push(plotDataset[i]?.value);
        }

    const options = {
        animation: false,
        grid: {
        left: '0%',
        right: '2%',
        bottom: '2%',
        top: '10%',
        containLabel: true
        },
        xAxis: {
        axisLabel: {
            color: '#fff',
        },
        data: xData,
        type: 'category',
        },
        yAxis: [
            {
            type: 'value',
            splitLine: {
                    show: false, // Disable x-axis grid lines
            },
            
            axisLabel: {
                show: false // Hide y-axis labels
            }
            },
        ],
        series: [
        {
            name: 'Revenue',
            data: valueList,
            type: 'line',
            areaStyle: {opacity: 0.2},
            smooth: true,
            symbol: 'none',
        },
        ],
        tooltip: {
            trigger: 'axis',
            hideDelay: 100,
        },
    };
    
    return options;
    }
    


$: {
    if($stockTicker && data?.getParams && typeof window !== 'undefined') {
        console.log('yes')
        isLoaded = false;
        dataset = [];
        tableList= [];

        dataset = rawData?.map(entry => ({
            date: entry.date,
            value: data?.getParams === 'data-center' ? entry?.value[0]
                : data?.getParams === 'gaming' ? entry?.value[1]
                : data?.getParams === 'visualization' ? entry?.value[2]
                : data?.getParams === 'automotive' ? entry?.value[3]
                : data?.getParams === 'oem-other' ? entry?.value[4]
                : null,
            
            valueGrowth: data?.getParams === 'data-center' ? entry?.valueGrowth[0]
                : data?.getParams === 'gaming' ? entry?.valueGrowth[1]
                : data?.getParams === 'visualization' ?  entry?.valueGrowth[2]
                : data?.getParams === 'automotive' ? entry?.valueGrowth[3]
                : data?.getParams === 'oem-other' ? entry?.valueGrowth[4]
                : null
        }));



        tableList = [...dataset];

        tableList = tableList?.sort((a, b) => new Date(b?.date) - new Date(a?.date));
        optionsData= plotData()
        isLoaded = true;
    }
}
</script>
                    
    
<svelte:head>

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ''} {$displayCompanyName} ({$stockTicker}) Revenue Breakdown · stocknear
</title>
<meta name="description" content={`Revenue & Geographic Breakdown`} />
<meta property="og:title" content={`${$displayCompanyName} (${$stockTicker}) Revenue Breakdown · stocknear`}/>
<meta property="og:description" content={`Revenue & Geographic Breakdown`} />
<meta property="og:type" content="website"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content={`${$displayCompanyName} (${$stockTicker}) Revenue Breakdown · stocknear`}/>
<meta name="twitter:description" content={`Revenue & Geographic Breakdown`} />
</svelte:head>

    
    <section class="bg-[#09090B] w-full  overflow-hidden text-white h-full pb-40 sm:mb-0">
        <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
            <div class="w-full relative flex justify-center items-center overflow-hidden">

                {#if isLoaded}
                <main class="w-full">
                    <div class="sm:p-7 m-auto mt-2 sm:mt-0">
                        <div class="mb-3">
                            <h1 class="text-2xl text-gray-200 font-bold">
                               {convertToTitleCase(data?.getParams)} Revenue
                            </h1>
                        </div>
    
                        {#if rawData?.length !== 0}
                        <div class="grid grid-cols-1 gap-2">
                          
                            
    
                            <div class="app w-full ">
                                <Chart {init} options={optionsData} class="chart" />
                            </div>


                            <h2 class="mt-10 text-xl text-gray-200 font-bold">
                                History
                            </h2>




                            <div class="w-full overflow-x-scroll">         
                                <table class="table table-sm table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4 ">
                                  <thead>
                                    <tr class="border border-slate-800">
                                      <th class="text-white font-semibold text-start text-sm sm:text-[1rem]">Quarter</th>
                                      <th class="text-white font-semibold text-end text-sm sm:text-[1rem]">Value</th>
                                      <th class="text-white font-semibold text-end text-sm sm:text-[1rem]">% Change</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {#each tableList as item, index}
                                        <!-- row -->
                                        <tr class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B] shake-ticker cursor-pointer">
                                        
                                            <td class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]">
                                            {new Date(item?.date ?? null)?.toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            })}
                                            </td>

                                            <td class="text-white text-sm sm:text-[1rem] text-right whitespace-nowrap border-b-[#09090B]">
                                            {abbreviateNumber(item?.value)}
                                            </td>

                                            <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end border-b-[#09090B]">
                                                {#if item?.valueGrowth > 0}
                                                <span class="text-[#37C97D]">
                                                  +{(item?.valueGrowth)?.toFixed(2)}%
                                                </span>
                                                {:else if item?.valueGrowth < 0}
                                                <span class="text-[#FF2F1F]">
                                                  {(item?.valueGrowth)?.toFixed(2)}%
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

    
                    
    
                        </div>

                        {:else}
                        <h2 class="mt-16 flex justify-center items-center text-2xl font-medium text-white mb-5 m-auto">
                            No data available
                        </h2>
                        {/if}
    
                        </div>
                        
                </main>
                {:else}
                <div class="w-full flex justify-center items-center h-80">
                    <div class="relative">
                    <label class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span class="loading loading-spinner loading-md text-gray-400"></span>
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