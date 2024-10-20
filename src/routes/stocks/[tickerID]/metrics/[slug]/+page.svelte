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

    let rawData = data?.getHistoricalMarketCap || [];
    let tableList = [];

    let changePercentageYearAgo = 0;


function convertToTitleCase(str) {
    return str
        ?.split('-') // Split the string by hyphen
        ?.map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        ?.join(' ')
        ?.replace('Oem', 'OEM')
}


    onMount(async () => {
        optionsData= await plotData()
        tableList = rawData;
        tableList?.sort((a, b) => new Date(b?.date) - new Date(a?.date));
        isLoaded = true;
    })



async function plotData()
    {
    
    const filteredData = rawData
    
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
        data: filteredData?.dates,
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
            name: 'Mkt Cap',
            data: filteredData?.marketCapList,
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
                            <div class="text-white p-3 sm:p-5 mb-10 rounded-lg sm:flex sm:flex-row sm:items-center border border-slate-800 text-sm sm:text-[1rem]">
                                <svg class="w-6 h-6 flex-shrink-0 inline-block sm:mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#a474f6" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"/></svg>
                                {$displayCompanyName} has a market cap of {abbreviateNumber(data?.getStockQuote?.marketCap,true)} as of {(new Date())?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', daySuffix: '2-digit' })}. Its market cap has {changePercentageYearAgo > 0 ? 'increased' : changePercentageYearAgo < 0 ? 'decreased' : 'unchanged'} by {abbreviateNumber(changePercentageYearAgo?.toFixed(2))}% in one year.
                            </div>
    
                            
    
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
                                            {item?.date}
                                            </td>

                                            <td class="text-white text-sm sm:text-[1rem] text-right whitespace-nowrap border-b-[#09090B]">
                                            {abbreviateNumber(item?.marketCap)}
                                            </td>

                                            <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end border-b-[#09090B]">
                                                {#if index+1-tableList?.length === 0}
                                                -
                                                {:else}
                                                {#if (item?.marketCap- tableList[index+1]?.marketCap) > 0}
                                                <span class="text-[#37C97D]">
                                                  +{(((item?.marketCap-tableList[index+1]?.marketCap) / item?.marketCap) * 100 )?.toFixed(2)}%
                                                </span>
                                                {:else if (item?.marketCap - tableList[index+1]?.marketCap ) < 0}
                                                <span class="text-[#FF2F1F]">
                                                  -{(Math?.abs((tableList[index+1]?.marketCap - item?.marketCap) / item?.marketCap) * 100 )?.toFixed(2)}%
                                                </span>
                                                {:else}
                                                -
                                                {/if}
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