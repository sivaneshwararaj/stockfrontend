<script lang ='ts'>
    import { optionsNetFlowComponent, stockTicker, assetType, etfTicker, getCache, setCache} from '$lib/store';
    import InfoModal from '$lib/components/InfoModal.svelte';
    import { Chart } from 'svelte-echarts'
    import { init, use } from 'echarts/core'
    import { BarChart } from 'echarts/charts'
    import { GridComponent, TooltipComponent } from 'echarts/components'
    import { CanvasRenderer } from 'echarts/renderers'
    import { monthNames} from '$lib/utils';

    export let data;
    
    use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])


    let isLoaded = false;
   
  
    let rawData = [];
    let optionsData;
    let sentiment;

  
  function getPlotOptions() {
    let dates = [];
    let priceList = [];
    let netCallList = [];
    let netPutList = [];

    // Iterate over the data and extract required information
    rawData?.forEach(item => {
  
    dates?.push(item?.date);
    priceList?.push(item?.price);
    netCallList?.push(item?.netCall)
    netPutList?.push(item?.netPut)
   
    });
    
    sentiment = netCallList?.slice(-1)?.at(0) > netPutList?.slice(-1)?.at(0) ? 'bullish' : 'bearish';


    const option = {
    silent: true,
    tooltip: {
        trigger: 'axis',
        hideDelay: 100, // Set the delay in milliseconds
    },
    animation: false,
    grid: {
        left: '3%',
        right: '3%',
        bottom: '0%',
        top: '10%',
        containLabel: true
    },
    xAxis: {
    type: 'category',
    boundaryGap: false,
    data: dates,  // Use the full dates here
    axisLabel: {
        color: '#fff',
        formatter: function (value, index) {
            if (index % 2 === 0) {
            
            const dateParts = value.split(' ')[0].split('-');
            const day = dateParts[2]; // Extracting the day
            const monthIndex = parseInt(dateParts[1], 10) - 1; // Zero-indexed months
            return `${day} ${monthNames[monthIndex]}`; // Return formatted day and month
            } else {
              return '';
            }
        }
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
            name: 'Net Call',
            data: netCallList,
            type: 'bar',
            stack: 'NetFlow',
            itemStyle: {
                color: '#2256FF'
            },
            showSymbol: false,

        },
        {   
            name: 'Net Put',
            data: netPutList,
            type: 'bar',
            stack: 'NetFlow',
            itemStyle: {
                color: '#FF2256'
            },
            showSymbol: false,
           
        },
    ]
    };
  
  
  return option;
  }
  
  const getOptionsNetFlow = async (ticker) => {
    // Get cached data for the specific tickerID
    const cachedData = getCache(ticker, 'getOptionsNetFlow');
    if (cachedData) {
      rawData = cachedData;
    } else {
  
      const postData = {'ticker': ticker, path: 'options-net-flow-ticker'};
      // make the POST request to the endpoint
      const response = await fetch('/api/ticker-data', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });
  
      rawData = (await response.json());
      // Cache the data for this specific tickerID with a specific name 'getOptionsNetFlow'
      setCache(ticker, rawData, 'getOptionsNetFlow');
    }
    
    if(rawData?.length !== 0) {
      $optionsNetFlowComponent = true;
    } else {
      $optionsNetFlowComponent = false;
    }
  };
  
  

  $: {
  if($assetType === 'stock' ? $stockTicker :$etfTicker && typeof window !== 'undefined') {
    isLoaded=false;
    const ticker = $assetType === 'stock' ? $stockTicker :$etfTicker
    const asyncFunctions = [
      getOptionsNetFlow(ticker)
      ];
      Promise.all(asyncFunctions)
          .then((results) => {
            optionsData = getPlotOptions();
          })
          .catch((error) => {
            console.error('An error occurred:', error);
          });
    isLoaded = true;
  
  }
  }
      
  
  
  </script>
    
    
  <section class="overflow-hidden text-white h-full pb-8">
    <main class="overflow-hidden ">
                    
        <div class="flex flex-row items-center">
            <label for="optionsNetFlowInfo" class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold">
                Options Net Flow
            </label>
            <InfoModal
              title={"Options Net Flow"}
              content={"An Options Net Flow of XY% means the market expects significant price fluctuations for the stock, with an annualized potential range of ±XY% from its current price. This indicates high uncertainty and risk, leading to more expensive options but doesn't predict price direction."}
              id={"optionsNetFlowInfo"}
            />
        </div>
  
        {#if isLoaded}
  
        {#if rawData?.length !== 0}
  
        <div class="w-full flex flex-col items-start">
            <div class="text-white text-[1rem] mt-2 mb-2 w-full">
                The options net flow demonstrates a {sentiment} trend in the last 2 trading hours, characterized by the {sentiment === 'bullish' ? 'Net Call Flow exceeding the Net Put Flow' : 'Net Put Flow exceeding the Net Call Flow'}.
            </div>
        </div>
  
        <div class="pb-2 rounded-lg bg-[#09090B]">
                
          
                <div class="app w-full h-[300px] mt-5">
                    <Chart {init} options={optionsData} class="chart" />
                </div>
        
        </div>
  
        <div class="flex flex-row items-center justify-between mx-auto mt-5 w-full sm:w-11/12">
            
            <div class="flex flex-col sm:flex-row items-center ml-3 sm:ml-0 w-1/2 justify-center">
                <div class="h-full transform -translate-x-1/2 " aria-hidden="true"></div>
                <div class="w-3 h-3 bg-[#2256FF] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2" aria-hidden="true"></div>
                <span class="mt-2 sm:mt-0 text-white text-xs sm:text-md sm:font-medium inline-block">
                    Net Call 
                </span>
            </div>

            <div class="flex flex-col sm:flex-row items-center ml-3 sm:ml-0 w-1/2 justify-center">
                <div class="h-full transform -translate-x-1/2 " aria-hidden="true"></div>
                <div class="w-3 h-3 bg-[#FF2F1F] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2" aria-hidden="true"></div>
                <span class="mt-2 sm:mt-0 text-white text-xs sm:text-md sm:font-medium inline-block">
                    Net Put
                </span>
            </div>
  
        </div>
  
      
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
    height: 210px;
  }
  }
  
  .chart {
  width: 100%;
  }
  
  </style>