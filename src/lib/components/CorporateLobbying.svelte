
<script lang ='ts'>
import { corporateLobbyingComponent, displayCompanyName, stockTicker, screenWidth, getCache, setCache} from '$lib/store';
import InfoModal from '$lib/components/InfoModal.svelte';
import { Chart } from 'svelte-echarts'
import { abbreviateNumber } from "$lib/utils";
import { init, use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])


    export let data;

    let isLoaded = false;
    let rawData = [];

    let optionsData;
    let avgAmount = 0;
    let displayMaxLobbying = 0;
    let displayYear = 'n/a';



function getPlotOptions() {
    let dates = [];
    let valueList = [];
    // Iterate over the data and extract required information
    rawData?.forEach(item => {
    // Extract year and convert it to fiscal year format
    const fiscalYear = "FY" + String(item?.year)?.slice(2);
    dates?.push(fiscalYear);

    // Extract amount
    valueList?.push(item?.amount);
    });


    const option = {
    silent: true,
    animation: false,
    tooltip: {
        trigger: 'axis',
        hideDelay: 100, // Set the delay in milliseconds
    },
    grid: {
        left: $screenWidth < 640 ? '0%' : '2%',
        right: $screenWidth < 640 ? '5%' : '2%',
        bottom: $screenWidth < 640 ? '0%' : '2%',
        containLabel: true
    },
    xAxis: {
        data: dates,
        type: 'category',
        axisLabel: {
            color: '#fff',
        }
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
          name: 'Spending [$]',
          data: valueList,
          type: 'bar',
          itemStyle: {
            color: '#F8901E' // Change bar color to white
          }
        }
    ]
    };


return option;
}

const getCorporateLobbing = async (ticker) => {
    // Get cached data for the specific tickerID
    const cachedData = getCache(ticker, 'getCorporateLobbing');
    if (cachedData) {
      rawData = cachedData;
    } else {
  
      const postData = {'ticker': ticker, path: 'corporate-lobbying'};
      // make the POST request to the endpoint
      const response = await fetch('/api/ticker-data', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });
  
      rawData = (await response.json())?.slice(-100);
      // Cache the data for this specific tickerID with a specific name 'getCorporateLobbing'
      setCache(ticker, rawData, 'getCorporateLobbing');
    }
    
    if(rawData?.length !== 0) {
      $corporateLobbyingComponent = true;
    } else {
      $corporateLobbyingComponent = false;
    }
  };
  
   


$: {
    if($stockTicker && typeof window !== 'undefined') {
    isLoaded=false;
    const asyncFunctions = [
      getCorporateLobbing($stockTicker)
      ];
      Promise.all(asyncFunctions)
          .then((results) => {
            if (rawData?.length !== 0) {
                optionsData = getPlotOptions();        
            // Calculate total number of contracts
            avgAmount = Math.floor((rawData?.reduce((sum, item) => sum + item?.amount, 0))/rawData?.length);
            const { year:yearWithMaxLobbying, amount: maxLobbying } = rawData?.reduce((max, item) => item?.amount > max?.amount ? item : max, rawData?.at(0));
            displayYear = yearWithMaxLobbying;
            displayMaxLobbying = maxLobbying;
            console.log('yes')
            }
            
          })
          .catch((error) => {
            console.error('An error occurred:', error);
          });
    isLoaded = true;
  
  }
  }
  
    

</script>
    
    
    
    <section class="overflow-hidden text-white h-full ">
        <main class="overflow-hidden ">
                        
            <div class="flex flex-row items-center">
                <label for="lobbyingInfo" class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold">
                 Corporate Lobbying
                </label>
                <InfoModal
                  title={"Corporate Lobbying"}
                  content={"Lobbying the Senate involves special interest groups hiring professional advocates to influence lawmakers and government policies. It is a constitutionally protected activity, but critics argue it can undermine democratic representation by giving disproportionate influence to wealthy and well-organized groups."}
                  id={"lobbyingInfo"}
                />
            </div>
            
            {#if isLoaded}
            {#if rawData?.length !== 0}
            <div class="mt-2 pb-8 sm:pb-2 rounded-lg bg-[#09090B] sm:bg-[#09090B]">
                    
                <div class="w-full flex flex-col items-start">
                    <div class="text-white text-[1rem] mt-1 sm:mt-3 mb-1 w-full">
                        Explore {$displayCompanyName}'s lobbying strategy by analyzing their annual spending to influence lawmakers towards favorable regulation and legislation alignment.
                    </div>
                </div>
            
                

                <div class="app w-full h-[300px] ">
                    <Chart {init} options={optionsData} class="chart" />
                </div>

                <div class="w-full text-white text-[1rem] mt-6">
                    The company allocated an average of {abbreviateNumber(avgAmount,true)} annually towards lobbying efforts, reaching its peak at {abbreviateNumber(displayMaxLobbying,true)} in {displayYear}.
                </div>
            </div>
              
            {:else}
            <h2 class="mt-10 mb-5 flex justify-center items-center text-3xl font-bold text-slate-700 m-auto">
                No data available
                <svg class="w-10 sm:w-12 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#334155" d="M18.68 12.32a4.49 4.49 0 0 0-6.36.01a4.49 4.49 0 0 0 0 6.36a4.508 4.508 0 0 0 5.57.63L21 22.39L22.39 21l-3.09-3.11c1.13-1.77.87-4.09-.62-5.57m-1.41 4.95c-.98.98-2.56.97-3.54 0c-.97-.98-.97-2.56.01-3.54c.97-.97 2.55-.97 3.53 0c.97.98.97 2.56 0 3.54M10.9 20.1a6.527 6.527 0 0 1-1.48-2.32C6.27 17.25 4 15.76 4 14v3c0 2.21 3.58 4 8 4c-.4-.26-.77-.56-1.1-.9M4 9v3c0 1.68 2.07 3.12 5 3.7v-.2c0-.93.2-1.85.58-2.69C6.34 12.3 4 10.79 4 9m8-6C7.58 3 4 4.79 4 7c0 2 3 3.68 6.85 4h.05c1.2-1.26 2.86-2 4.6-2c.91 0 1.81.19 2.64.56A3.215 3.215 0 0 0 20 7c0-2.21-3.58-4-8-4Z"/></svg>
            </h2>
            
            {/if}

            {:else}
            <div class="flex justify-center items-center h-80">
                <div class="relative">
                <label class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span class="loading loading-spinner loading-md text-gray-400"></span>
                </label>
                </div>
            </div>
            {/if}
      

        
        </main>
    </section>
    
    
    

<style>

.app {
    height: 300px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */

    }

    @media (max-width: 640px) {
    .app {
        height: 230px;
    }
    }

    .chart {
    width: 100%;
    }
    
</style>