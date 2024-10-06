<script lang ='ts'>
  import { borrowedShareComponent, displayCompanyName, stockTicker, assetType, etfTicker, screenWidth, getCache, setCache} from '$lib/store';
  import InfoModal from '$lib/components/InfoModal.svelte';
  import { Chart } from 'svelte-echarts'
  import { abbreviateNumber, formatDateRange, monthNames } from "$lib/utils";

  import { init, use } from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { GridComponent, TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  
  export let data;
  
  use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])


    let isLoaded = false;

    let rawData = [];
    let optionsData;
    let avgFee;
    let lowestFee;
    let highestFee;
    let monthlyAvailableShares;
    let totalAvailableShares;
  

function findLowestAndHighestFee(data, lastDateStr) {
    // Convert lastDateStr to Date object
    const lastDate = new Date(lastDateStr);
  
    // Set the first date to the beginning of the month of lastDate
    const firstDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
  
    // Filter data to include only prices within the specified month period
    const filteredData = data.filter(item => {
        const currentDate = new Date(item?.date);
        return currentDate >= firstDate && currentDate <= lastDate;
    });
    	
    // Extract prices from filtered data
    let fees = filteredData?.map(item => parseFloat(item?.fee));
    monthlyAvailableShares = filteredData?.reduce((accumulator, currentItem) => {
        return accumulator + currentItem?.available;
    }, 0);

    // Find the lowest and highest prices
    lowestFee = Math.min(...fees)?.toFixed(1);
    highestFee = Math.max(...fees)?.toFixed(1);
}

  
  
  function getPlotOptions() {
    let dates = [];
    let availableList = [];
    let feeList = [];
    // Iterate over the data and extract required information
    rawData?.forEach(item => {
  
    dates?.push(item?.date);
    availableList?.push(item?.available);
    feeList?.push(item?.fee)
    });
    
    // Find the lowest and highest prices
    findLowestAndHighestFee(rawData, rawData?.slice(-1)?.at(0)?.date)

    // Compute the average of item?.traded
    const totalNumber = feeList?.reduce((acc, item) => acc + item, 0);
    avgFee = (totalNumber / feeList?.length)?.toFixed(1);
    totalAvailableShares = availableList?.reduce((accumulator, sum) => {
        return accumulator + sum;
    }, 0);

  
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
        bottom: '2%',
        top: '5%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: {
        color: '#fff',
        formatter: function (value) {
            // Assuming dates are in the format 'yyyy-mm-dd'
            // Extract the month and day from the date string and convert the month to its abbreviated name
            const dateParts = value.split('-');
            const day = dateParts[2].substring(0); // Extracting the last two digits of the year
            const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
            return `${day} ${monthNames[monthIndex]}`;
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
       },
    },
   { 
        type: 'value',
        splitLine: {
            show: false, // Disable x-axis grid lines
        },
        position: 'right',
        axisLabel: {
          show: false // Hide y-axis labels
       },
    },
    ],
    series: [
        {   
            name: 'Available Shares',
            data: availableList,
            type: 'line',
            itemStyle: {
                color: '#fff' // Change bar color to white
            },
            showSymbol: false
        },
        {
            name: 'Fee [%]',
            data: feeList,
            type: 'line',
            areaStyle: {opacity: 1},
            yAxisIndex: 1,
            itemStyle: {
                color: '#22C55E' // Change bar color to white
            },
            showSymbol: false
        },
    ]
    };
  
  
  return option;
  }
  
  const getBorrowedShare = async (ticker) => {
    // Get cached data for the specific tickerID
    const cachedData = getCache(ticker, 'getBorrowedShare');
    if (cachedData) {
      rawData = cachedData;
    } else {
  
      const postData = {'ticker': ticker, path: 'borrowed-share'};
      // make the POST request to the endpoint
      const response = await fetch('/api/ticker-data', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData)
      });
  
      rawData = (await response.json())?.slice(-100);
      // Cache the data for this specific tickerID with a specific name 'getBorrowedShare'
      setCache(ticker, rawData, 'getBorrowedShare');
    }
    
    if(rawData?.length !== 0) {
      $borrowedShareComponent = true;
    } else {
      $borrowedShareComponent = false;
    }
  };
  
  
  $: {
  if($assetType === 'stock' ? $stockTicker :$etfTicker && typeof window !== 'undefined') {
    isLoaded=false;
    const ticker = $assetType === 'stock' ? $stockTicker :$etfTicker
    const asyncFunctions = [
      getBorrowedShare(ticker)
      ];
      Promise.all(asyncFunctions)
          .then((results) => {
            optionsData = getPlotOptions()
          })
          .catch((error) => {
            console.error('An error occurred:', error);
          });
    isLoaded = true;
  
  }
  }
  
  $: charNumber = $screenWidth < 640 ? 20 : 40;
    
  
  
  </script>
    
    
  <section class="overflow-hidden text-white h-full pb-8">
    <main class="overflow-hidden ">
                    
        <div class="flex flex-row items-center">
            <label for="borrowedShareInfo" class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold">
                Borrowed Share
            </label>
            <InfoModal
              title={"Borrowed Share Statistics"}
              content={"At Interactive Brokers, borrowed shares refer to shares lent by other investors for short selling. Borrowers pay a fee to lenders, aiming to profit from declining stock prices. Lenders earn interest on their lent shares, enhancing returns while still owning the stock."}
              id={"borrowedShareInfo"}
            />
        </div>
  
        {#if isLoaded}
  
        {#if rawData?.length !== 0}
  
        <div class="w-full flex flex-col items-start">
            <div class="text-white text-[1rem] mt-2 mb-2 w-full">
                Over the past six months, Interactive Brokers had {abbreviateNumber(totalAvailableShares)} shares available for borrowing, with an average fee of {avgFee}%.
            </div>
        </div>
  
        <div class="pb-2 rounded-lg bg-[#09090B]">
                
          
          <div class="app w-full h-[300px] mt-5">
              <Chart {init} options={optionsData} class="chart" />
          </div>
        
        </div>
  
        <div class="flex flex-row items-center justify-between mx-auto mt-5 w-full sm:w-11/12">
            <div class="mt-3.5 sm:mt-0 flex flex-col sm:flex-row items-center ml-3 sm:ml-0 w-1/2 justify-center">
            <div class="h-full transform -translate-x-1/2 " aria-hidden="true"></div>
            <div class="w-3 h-3 bg-[#fff] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2" aria-hidden="true"></div>
            <span class="mt-2 sm:mt-0 text-white text-center sm:text-start text-xs sm:text-md inline-block">
                Available Shares
            </span>
        </div>
            <div class="flex flex-col sm:flex-row items-center ml-3 sm:ml-0 w-1/2 justify-center">
                <div class="h-full transform -translate-x-1/2 " aria-hidden="true"></div>
                <div class="w-3 h-3 bg-[#22C55E] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2" aria-hidden="true"></div>
                <span class="mt-2 sm:mt-0 text-white text-xs sm:text-md sm:font-medium inline-block">
                    Fee
                </span>
            </div>
  
        </div>
  
  
        <h2 class="mt-10 mr-1 flex flex-row items-center text-white text-xl sm:text-2xl font-bold mb-3">
            Latest Information
        </h2>
  
  
          <div class="flex justify-start items-center w-full m-auto ">
            <table class="w-full" data-test="statistics-table">
              <tbody>
                  <tr class="border-y border-gray-800 odd:bg-[#27272A]">
                      <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                          <span>Date</span>
                      </td>
                      <td class="px-[5px] py-1.5 text-right whitespace-nowrap font-medium xs:px-2.5 xs:py-2">
                        {formatDateRange(rawData?.slice(-1)?.at(0)?.date)}
                      </td>
                  </tr>
                  <tr class="border-y border-gray-800 odd:bg-[#27272A]">
                      <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                          <span>Fee Range</span>
                      </td>
                      <td class="px-[5px] py-1.5 text-right font-medium xs:px-2.5 xs:py-2">
                        {lowestFee+'%'+'-'+highestFee+'%'}
                      </td>
                  </tr>
                  <tr class="border-y border-gray-800 odd:bg-[#27272A]">
                      <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                          <span>Total Available Shares</span>
                      </td>
                      <td class="px-[5px] py-1.5 text-right font-medium xs:px-2.5 xs:py-2">
                        {abbreviateNumber(monthlyAvailableShares)}
                      </td>
                  </tr>
              </tbody>
          </table>
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