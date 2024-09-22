<script lang='ts'>
    import { goto } from '$app/navigation';
    import { numberOfUnreadNotification, screenWidth } from '$lib/store';
    import { onMount } from 'svelte';
    import ArrowLogo from "lucide-svelte/icons/move-up-right";
    import * as Card from "$lib/components/shadcn/card/index.ts";

    import { Chart } from 'svelte-echarts'
import Lazy from '$lib/components/Lazy.svelte';

import { init, use } from 'echarts/core'
import { GaugeChart, LineChart,} from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
use([GaugeChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer])

  
    
  export let data;
  let optionGraphWinrate;
  let optionGraphReturn;

  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;

  let isLoaded = false;
  let rawData = data?.getCramerTracker ?? [];
  let displayList = rawData?.slice(0,50) ?? []
  let cumulativeList = []
  let winRate;

async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && displayList?.length !== rawData?.length) {
        const nextIndex = displayList?.length;
        const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
        displayList = [...displayList, ...filteredNewResults];
    }
  }

function computeWinRate(data) {
  // Filter sentiments that should be considered bullish/buy or bearish/sell
  const bullishSentiments = ['bullish', 'buy'];
  const bearishSentiments = ['bearish', 'sell'];

  // Reduce through the array to calculate the total trades and wins
  const { wins, totalTrades } = data.reduce((acc, item) => {
    const sentiment = item.sentiment.toLowerCase(); // Normalize to lower case for easier comparison
    const isBullish = bullishSentiments.some(keyword => sentiment.includes(keyword));
    const isBearish = bearishSentiments.some(keyword => sentiment.includes(keyword));
    
    // Count the total trades
    acc.totalTrades++;

    // Evaluate the wins based on sentiment and returnSince
    if ((isBullish && item.returnSince > 0) || (isBearish && item.returnSince < 0)) {
      acc.wins++;
    }

    return acc;
  }, { wins: 0, totalTrades: 0 });

  // Calculate and return the win rate percentage
  return (wins / totalTrades) ;
}


function getPlotOptions() {
let dates = [];
const returnMap = {};

// Iterate over the data and sum the returnSince values for each unique date
rawData?.forEach(item => {
  const { date, returnSince } = item;

  if (returnMap[date]) {
    returnMap[date] += returnSince; // Add to the existing return
  } else {
    returnMap[date] = returnSince; // Initialize the return for this date
    dates.push(date); // Save the unique date in the dates array
  }
});

// Sort dates in ascending order (earliest date first, latest date last)
  dates?.sort((a, b) => new Date(a) - new Date(b));

  // Convert the returnMap to an array of objects (cumulativeList) in the correct order
  cumulativeList = dates?.map(date => (returnMap[date]?.toFixed(1)));
  //console.log('Cumulative List:', cumulativeList);
  //console.log('Unique Dates:', dates);

  const optionCumulativeReturn = {
    silent: true,
    animation: false,
    tooltip: {
        trigger: 'axis',
        hideDelay: 100, // Set the delay in milliseconds
    },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '0%',
    top: $screenWidth < 640 ? '20%' : '10%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      splitLine: {
            show: false, // Disable x-axis grid lines
      },
      data: dates,
      axisLabel: {
        show: false // Hide x-axis labels
      }
    }
  ],
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
      name: 'Cumulative Returns [%]',
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 0
      },
      showSymbol: false,
      areaStyle: {
        opacity: 1,
        color: '#3B82F6'
      },
      data: cumulativeList
    },
  ]
};

  const optionWinrate = {
  silent: true,
  animation: false,
  series: [
    {
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      center: ['50%', '75%'],
      radius: '90%',
      min: 0,
      max: 1,
      splitNumber: 3,
      axisLine: {
        lineStyle: {
          width: 15,
          color: [
            [0.3, '#F71F4F'],
            [0.7, '#FFA838'],
            [1, '#20AE54']
          ]
        }
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '15%',
        width: 10,
        offsetCenter: [0, '-60%'],
        itemStyle: {
          color: 'auto'
        }
      },
      axisTick: {
        length: 0,
      },
      splitLine: {
        length: 0,
      },
      axisLabel: {
        formatter: function (value) {
          return '';
        }
      },
      title: {
        offsetCenter: [0, '5%'],
        fontSize: 14,
         color: '#fff',
      },
      detail: {
        fontSize: 22,
        offsetCenter: [0, '-20%'],
        valueAnimation: true,
        formatter: function (value) {
          return (value * 100)?.toFixed(0)+ '%';
        },
        color: 'inherit'
      },
      data: [
        {
          value: winRate,
          name: 'Winrate'
        }
      ]
    }
  ]
};


  return {optionCumulativeReturn, optionWinrate};
  }
  

  onMount(() => {
    winRate = computeWinRate(rawData);

      const {optionCumulativeReturn, optionWinrate} = getPlotOptions()
      optionGraphReturn = optionCumulativeReturn;
      optionGraphWinrate = optionWinrate;

      isLoaded = true;
      window.addEventListener('scroll', handleScroll);
      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
    })
    
    
    $: charNumber = 20;
    
          
    </script>
    
    <svelte:head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>
        {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ''} Jim Carmer Tracker · stocknear
    </title>
    <meta name="description" content={`Track the stock recommendations and performance of CNBC's Jim Cramer`} />
    
    <!-- Other meta tags -->
    <meta property="og:title" content={`Jim Carmer Tracker · stocknear`}/>
    <meta property="og:description" content={`Track the stock recommendations and performance of CNBC's Jim Cramer`} />
    <meta property="og:type" content="website"/>
    <!-- Add more Open Graph meta tags as needed -->
    
    <!-- Twitter specific meta tags -->
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content={`Jim Carmer Tracker · stocknear`}/>
    <meta name="twitter:description" content={`Track the stock recommendations and performance of CNBC's Jim Cramer`} />
    <!-- Add more Twitter meta tags as needed -->
    
    </svelte:head>
    
        
    
    <section class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 pb-40 lg:px-3">
          
      <div class="text-sm sm:text-[1rem] breadcrumbs ml-4">
        <ul>
          <li><a href="/" class="text-gray-300">Home</a></li>
          <li class="text-gray-300">Jim Cramer Tracker</li>
        </ul>
      </div>
              
      <div class="w-full overflow-hidden m-auto mt-5">
        
        <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden ">
            <div class="relative flex justify-center items-start overflow-hidden w-full">


                <main class="w-full lg:w-3/4 lg:pr-5">
                 
                  <div class="w-full  m-auto sm:bg-[#27272A] sm:rounded-xl h-auto pl-10 pr-10 pt-5 sm:pb-10 sm:pt-10 mt-3 mb-8">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  
                      <!-- Start Column -->
                      <div>
                        <div class="flex flex-row justify-center items-center">
                          <h1 class="text-3xl sm:text-4xl text-white text-center font-bold mb-5">
                            Jim Cramer Tracker
                          </h1>
                        </div>
              
                        <span class="text-white text-md font-medium text-center flex justify-center items-center ">
                            Track the stock recommendations and performance of CNBC's Jim Cramer
                        </span>
              
          
                      </div>
                      <!-- End Column -->
                  
                      <!-- Start Column -->
                      <div class="hidden sm:block relative m-auto mb-5 mt-5 sm:mb-0 sm:mt-0">
                        <svg class="w-40 -my-5" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="5" result="glow"/>
                              <feMerge>
                                <feMergeNode in="glow"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>
                          <path fill="#1E40AF" d="M57.6,-58.7C72.7,-42.6,81.5,-21.3,82,0.5C82.5,22.3,74.7,44.6,59.7,60.1C44.6,75.6,22.3,84.3,0,84.3C-22.3,84.2,-44.6,75.5,-61.1,60.1C-77.6,44.6,-88.3,22.3,-87.6,0.7C-86.9,-20.8,-74.7,-41.6,-58.2,-57.7C-41.6,-73.8,-20.8,-85.2,0.2,-85.4C21.3,-85.6,42.6,-74.7,57.6,-58.7Z" transform="translate(100 100)" filter="url(#glow)" />
                        </svg>
                        
                        
                        <div class="z-1 absolute top-4">
                            <img class="w-24 ml-7" src={cloudFrontUrl+'/assets/cramer_logo.png'} alt="logo" loading="lazy">
                          </div>
                      </div>
                      <!-- End Column -->
                    </div>
              
                   
              
              
                  </div>
  
                  {#if isLoaded}
  
                  
                    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:gap-8 px-3 sm:px-0">
                     <Card.Root class="bg-[#141417]">
                      <Card.Header class="flex flex-col items-start space-y-0 pb-2">
                        <Card.Title class="text-start text-xl sm:text-2xl font-semibold pb-2">Cumulative Return</Card.Title>
                        <Card.Description class="text-white text-sm pb-2">
                          Following Jim Cramer's stock picks since {rawData?.slice(0)?.at(0)?.date}, would have yielded a <strong class="{cumulativeList?.slice(-1) > 0 ? 'text-[#00FC50]' : 'text-[#FC2120]'}">{cumulativeList?.slice(-1) > 0 ? '+' : ''}{cumulativeList?.slice(-1)}%</strong> cumulative return.
                        </Card.Description>
                      </Card.Header>
                      <Card.Content class="w-full h-fit">
                        <Lazy>
                            <div class="w-full h-[150px] ">
                            <Chart {init} options={optionGraphReturn} class="chart" />
                          </div>
                        </Lazy>
                      </Card.Content>
                    </Card.Root>
                    <Card.Root class="bg-[#141417] ">
                      <Card.Header class="flex flex-col items-start space-y-0 pb-2">
                        <Card.Title class="text-start text-xl sm:text-2xl font-semibold pb-2">Winrate</Card.Title>
                        <Card.Description class="text-white text-sm pb-2">
                          Cramer was accurate in <strong>{(winRate*100)?.toFixed(0)}%</strong> of his last {rawData?.length} forecasts.
                          Time to consider the "Inverse Cramer" strategy?
                        </Card.Description>
                      </Card.Header>
                      <Card.Content class="w-full h-fit relative">
                        <Lazy>
                            <div class="w-full h-[250px] absolute right-0 -top-14">
                            <Chart {init} options={optionGraphWinrate} class="chart" />
                          </div>
                        </Lazy>
                      </Card.Content>
                    </Card.Root>

                
                  </div>

         
                  <div class="w-screen sm:w-full m-auto mt-20 sm:mt-10">
                      
                    
                      <div class="w-screen sm:w-full m-auto rounded-none sm:rounded-lg mb-4 overflow-x-scroll">
                        <table class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto">
                          <thead>
                            <tr class="bg-[#09090B]">
                              <th class="text-start bg-[#09090B] text-white text-[1rem] font-semibold">
                                Company Name
                              </th>
                              <th class="text-start bg-[#09090B] text-white text-[1rem] font-semibold">
                                Date
                              </th>
                              <th class="text-center bg-[#09090B] text-white text-[1rem] font-semibold">
                                Sentiment
                              </th>
                              <th class="text-end bg-[#09090B] text-white text-[1rem] font-semibold">
                                Return Since
                              </th>
                              <th class="hidden xl:table-cell text-end bg-[#09090B] text-white text-[1rem] font-semibold">
                                Sector
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {#each displayList as item, index}
    
                            <tr class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A]">
   
                              <td class="text-sm sm:text-[1rem] text-start whitespace-nowrap">
                                {#if index >= 5 && data?.user?.tier !== 'Pro'}
                                  <a class="block relative" href="/pricing">
                                    <span class="text-base font-semibold text-blue-link blur group-hover:blur-[6px]">
                                      XXXX
                                    </span>
                                    
                                    <div class="ml-px max-w-[130px] truncate text-sm text-default blur group-hover:blur-[6px] lg:max-w-[150px]">
                                      XXXXXXXXXXXXXXXX
                                    </div>
                                    
                                    <div class="absolute top-3 flex items-center">
                                      <svg class="size-5 text-[#FBCE3C]" 
                                          viewBox="0 0 20 20" 
                                          fill="currentColor" 
                                          style="max-width: 40px;">
                                        <path fill-rule="evenodd" 
                                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
                                              clip-rule="evenodd">
                                        </path>
                                      </svg>
                                      
                                      <span class="ml-1 font-semibold text-muted group-hover:text-default">
                                        Upgrade
                                      </span>
                                    </div>
                                  </a>
                                {:else}
                                  <div class="flex flex-col items-start">
                                    <a href={`/stocks/${item?.ticker}`} 
                                      class="sm:hover:text-white text-blue-400 text-sm sm:text-[1rem]">
                                      {item?.ticker}
                                    </a>
                                    <span class="text-white">
                                      {item?.name?.length > charNumber 
                                        ? item?.name?.slice(0, charNumber) + "..." 
                                        : item?.name}
                                    </span>
                                  </div>
                                {/if}
                              </td>

  
                                <td class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white">
                                    {new Date(item?.date)?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', daySuffix: '2-digit' })}
                                </td>
  
        
                                <td class="text-sm sm:text-[1rem] whitespace-nowrap {(['Bullish', 'Buy'].includes(item?.sentiment) || item?.sentiment?.includes('Buy')) ? 'text-[#30B170]' : (['Bearish', 'Sell','Trim'].includes(item?.sentiment) || item?.sentiment?.includes('Sell') === 'Bearish') ? 'text-[#FC2120]' : 'text-[#C6A755]'} text-center">
                                {item?.sentiment}
                              </td>

                              <td class="text-sm sm:text-[1rem] {item?.returnSince >= 0 ? 'text-[#30B170]' : 'text-[#FC2120]'} text-end">
                                {item?.returnSince > 0 ? '+' : ''}{item?.returnSince}%
                              </td>

                              <td class="hidden xl:table-cell text-end text-sm sm:text-[1rem] whitespace-nowrap font-medium text-white">
                                {item?.sector}
                              </td>
  
                            </tr>
                          {/each}
                          </tbody>
                        </table>
                    </div>
    
                  </div>
  
                  {:else}
                  <div class="flex justify-center items-center h-80">
                    <div class="relative">
                      <label class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span class="loading loading-spinner loading-md"></span>
                      </label>
                    </div>
                  </div>  
                  {/if}
  
                
                </main>

                <aside class="hidden lg:block relative fixed w-1/4 ml-4">        
              
                  {#if data?.user?.tier !== 'Pro' || data?.user?.freeTrial}
                  <div on:click={() => goto('/pricing')} class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer">
                      <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
                          <div class="w-full flex justify-between items-center p-3 mt-3">
                          <h2 class="text-start text-xl font-semibold text-white ml-3">
                          Pro Subscription 🔥
                          </h2>
                          <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0"/>
                          </div>
                          <span class="text-white p-3 ml-3 mr-3">
                              Upgrade now for unlimited access to all data and tools.
                          </span>
                      </div>
                  </div>
                  {/if}
  
                  <div on:click={() => goto('/reddit-tracker')} class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer">
                      <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
                          <div class="w-full flex justify-between items-center p-3 mt-3">
                          <h2 class="text-start text-xl font-semibold text-white ml-3">
                          Reddit Tracker 🚀
                          </h2>
                          <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0"/>
                          </div>
                          <span class="text-white p-3 ml-3 mr-3">
                              Get the latest trends of r/Wallstreetbets
                          </span>
                      </div>
                  </div>
  
                  <div on:click={() => goto('/most-retail-volume')} class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer">
                      <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
                          <div class="w-full flex justify-between items-center p-3 mt-3">
                          <h2 class="text-start text-xl font-semibold text-white ml-3">
                            Retail Trader Tracker 💳
                          </h2>
                          <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0"/>
                          </div>
                          <span class="text-white p-3 ml-3 mr-3">
                              Follow the daily trends of retail investors
                          </span>
                      </div>
                  </div>
  
                </aside>

            </div>
        </div>
    
      
      </div>
          
          
      
    </section>
    
<style>
.app {
height: 150px;
max-width: 100%; /* Ensure chart width doesn't exceed the container */

}

@media (max-width: 640px) {
.app {
  height: 120px;
}
}

.chart {
width: 100%;
}

</style>