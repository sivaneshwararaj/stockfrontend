<script lang='ts'>
  import { goto } from '$app/navigation';
  import { screenWidth } from '$lib/store';
  import { abbreviateNumber} from '$lib/utils';
  import InfoModal from '$lib/components/InfoModal.svelte';
  import { onMount } from 'svelte';
  import { Chart } from 'svelte-echarts'

  import { init, use } from 'echarts/core'
  import { BarChart } from 'echarts/charts'
  import { GridComponent, TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  
  export let data;
  let isLoaded = false;
  use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

  let rawData = data?.getConsumerDefensiveSector;
  let historicalPrice = data?.getHistoricalSector;

  let marketCapList = rawData?.slice(0,50);
  let optionsData;
  
  async function handleScroll() {
      const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
      const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
      if (isBottom && marketCapList?.length !== rawData?.length) {
          const nextIndex = marketCapList?.length;
          const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
          marketCapList = [...marketCapList, ...filteredNewResults];
      }
    }
  
      
function getPlotOptions() {
    let dates = [];
    let priceList = [];
    // Iterate over the data and extract required information
    historicalPrice?.forEach(item => {
      dates?.push(item?.date);
      priceList?.push(item?.changesPercentage);
    });

    const option = {
    silent: true,
    tooltip: {
        trigger: 'axis',
        hideDelay: 100, // Set the delay in milliseconds
    },
    animation: false,
    grid: {
        left: '0%',
        right: '2%',
        bottom: '2%',
        top: '5%',
        containLabel: true
    },
    xAxis:
    {
        type: 'category',
        boundaryGap: false,
        data: dates,
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
          color: '#fff',
            formatter: function (value, index) {
              if (index % 2 === 0) {
                return value?.toFixed(2)+'%'; // Format the sentiment value
              } else {
                    return ''; // Hide this tick
                }
            }
        }
      }
    ],
    series: [
        {
            name: 'Daily Change [%]',
            data: priceList,
            type: 'bar',
            itemStyle: {
            color: (params) => {
                // Set color based on positive or negative value
                return params.data >= 0 ? '#22C55E' : '#F71F4F';
            },
            },
            
        },
    ]
    };
  
  
  return option;
  }

  onMount(async () => {

    optionsData = await getPlotOptions();
    isLoaded = true;
    window.addEventListener('scroll', handleScroll);
      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  })
  
  
  let totalMarketCap = rawData?.reduce((total, stock) => total + stock?.marketCap, 0) ?? 0;
  let totalRevenue = rawData?.reduce((total, stock) => total + stock?.revenue, 0) ?? 0;
  let totalProfits = rawData?.reduce((total, stock) => total + stock?.netIncome, 0) ?? 0;

  
  $: charNumber = $screenWidth < 640 ? 15 : 20;

  </script>
      
      <section class="w-full overflow-hidden m-auto">
              
            
          <div class="border border-gray-800 w-full sm:flex sm:flex-row sm:items-center m-auto text-gray-100 bg-[#09090B] sm:rounded-lg h-auto p-5 mb-4">
              <svg class="w-5 h-5 inline-block sm:mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#a474f6" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"/></svg>
              A complete list of companies in the Consumer Defensive Sector that are publicly traded on the US stock exchange.
          </div>
      
           <div class="mb-4 grid grid-cols-2 divide-y divide-gray-600 rounded-lg border border-gray-600 bg-[#272727] shadow md:grid-cols-3 divide-x">
          <div class="p-4 bp:p-5 sm:p-6">
            <label for="stocksInfo" class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem] sm:text-xl font-semibold">
              Stocks
              <InfoModal
                title={"Stocks"}
                content={"The total number of companies who operate in this sector."}
                id={"stocksInfo"}
              />
            </label>
            <div class="mt-1 flex flex-col items-baseline justify-start space-y-2 bp:space-y-0">
              <div class="flex items-baseline text-lg sm:text-xl font-semibold text-white">
                {rawData?.length}
              </div>
            </div>
          </div>

          <div class="p-4 bp:p-5 sm:p-6">
            <label for="marketCapModal" class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem] sm:text-xl font-semibold">
              Market Cap
              <InfoModal
                title={"Market Cap"}
                content={"Combined market cap of all companies in this sector."}
                id={"marketCapModal"}
              />
            </label>
            <div class="mt-1 flex flex-col items-baseline justify-start space-y-2 bp:space-y-0">
              <div class="flex items-baseline text-lg sm:text-xl font-semibold text-white">
                {abbreviateNumber(totalMarketCap, true)}
              </div>
            </div>
          </div>

          <div class="p-4 bp:p-5 sm:p-6">
            <label for="revenueInfo" class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem] sm:text-xl font-semibold">
              Revenue
              <InfoModal
                title={"Revenue"}
                content={"The total revenue of all companies in this sector."}
                id={"revenueInfo"}
              />
            </label>
            <div class="mt-1 flex flex-col items-baseline justify-start space-y-2 bp:space-y-0">
              <div class="flex items-baseline text-lg sm:text-xl font-semibold text-white">
                {abbreviateNumber(totalRevenue, true)}
              </div>
            </div>
          </div>

          <div class="p-4 bp:p-5 sm:p-6">
            <label for="profitsInfo" class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem] sm:text-xl font-semibold">
              Profits
              <InfoModal
                title={"Profits"}
                content={"The total net income of all companies in this sector."}
                id={"profitsInfo"}
              />
            </label>
            <div class="mt-1 flex flex-col items-baseline justify-start space-y-2 bp:space-y-0">
              <div class="flex items-baseline text-lg sm:text-xl font-semibold text-white">
                {abbreviateNumber(totalProfits, true)}
              </div>
            </div>
          </div>

          <div class="p-4 bp:p-5 sm:p-6">
            <label for="profitMarginInfo" class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem] sm:text-xl font-semibold">
              Profit Margin
              <InfoModal
                title={"Profit Margin"}
                content={"The industry's profit margin, calculated by dividing the total net income by the total revenue."}
                id={"profitMarginInfo"}
              />
            </label>
            <div class="mt-1 flex flex-col items-baseline justify-start space-y-2 bp:space-y-0">
              <div class="flex items-baseline text-lg sm:text-xl font-semibold text-white">
                {(totalProfits / totalRevenue * 100)?.toFixed(2)}%
              </div>
            </div>
          </div>

          <div class="p-4 bp:p-5 sm:p-6">
            <label for="peRatioInfo" class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem] sm:text-xl font-semibold">
              PE Ratio
              <InfoModal
                title={"PE Ratio"}
                content={"The industry's PE Ratio, calculated by dividing the total market cap by the total net income."}
                id={"peRatioInfo"}
              />
            </label>
            <div class="mt-1 flex flex-col items-baseline justify-start space-y-2 bp:space-y-0">
              <div class="flex items-baseline text-lg sm:text-xl font-semibold text-white">
                {(totalMarketCap / totalProfits)?.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

      
          <h2 class="text-white text-xl sm:text-2xl mt-8 font-semibold">
            Historical Performance
          </h2>
          <div class="app w-full h-[300px] mt-5 mb-8">
            {#if isLoaded}
            <Chart {init} options={optionsData} class="chart" />
            {:else}
            <div class="flex justify-center items-center h-80">
              <div class="relative">
              <label class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span class="loading loading-spinner loading-md text-gray-400"></span>
              </label>
              </div>
            </div>
            {/if}
          </div>
          
            <!-- Page wrapper -->
            <div class="flex justify-center w-full m-auto h-full overflow-hidden">
        
      
                <!-- Content area -->
                <div class="w-full overflow-x-scroll">
        
      
             
                <table class="table table-sm sm:table-md table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4 ">
                    <thead>
                      <tr class="border border-slate-800">
                        <th class="text-white font-semibold text-[1rem]">Symbol</th>
                        <th class="text-white font-semibold text-[1rem]">Company</th>
                        <th class="text-white font-semibold text-end text-[1rem]">Market Cap</th>
                        <th class="text-white font-semibold text-center text-[1rem]">Revenue</th>
                        <th class="text-white font-semibold text-center text-[1rem]">Profits</th>
                        <th class="text-white font-semibold text-[1rem] text-end">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each marketCapList as item,index}
                      <!-- row -->
                      <tr on:click={() => goto("/stocks/"+item?.symbol)}  class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B] shake-ticker cursor-pointer">
                      
                      
                        <td class="text-blue-400 font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]">
                          {item?.symbol}
                        </td>


                        <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]">
                          {item?.name?.length > charNumber ? item?.name?.slice(0,charNumber) + "..." : item?.name}
                        </td>
    
                        <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end border-b-[#09090B]">
                            {abbreviateNumber(item?.marketCap,true)}
                        </td>
      
                        <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-center border-b-[#09090B]">
                            {item?.revenue !== null ? abbreviateNumber(item?.revenue,true) : '-'}
                        </td>

                        <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-center border-b-[#09090B]">
                          {item?.netIncome !== null ? abbreviateNumber(item?.netIncome,true) : '-'}
                        </td>
                
      
                        <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]">
                            <div class="flex flex-row justify-end items-center">
              
                              <div class="flex flex-col">
                                <span class="text-white ml-auto">${item.price?.toFixed(2)}</span>
                                <div class="flex flex-row mt-0.5 ml-auto">
                                  {#if item.changesPercentage >=0}
                                    <span class="text-[#37C97D]">+{item.changesPercentage?.toFixed(2)}%</span>
                                  {:else}
                                    <span class="text-[#FF2F1F]">{item.changesPercentage?.toFixed(2)}% </span> 
                                  {/if}
                                </div>
                              </div>
              
                              
                          </div>
                        </td>
      
                   
        
        
                      </tr>
                      
                  
                      {/each}
                    </tbody>
                </table>
      
                      
            </div>
  
            
        
        </section>
        
        


  
<style>

.app {
height: 300px;
max-width: 100%; /* Ensure chart width doesn't exceed the container */

}

@media (max-width: 640px) {
.app {
  height: 210px;
}
}

.chart {
width: 100%;
}

</style>