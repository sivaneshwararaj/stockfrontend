<script lang="ts">

  import {numberOfUnreadNotification, displayCompanyName, stockTicker} from '$lib/store';
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
import { Button } from "$lib/components/shadcn/button/index.js";
  import { Chart } from 'svelte-echarts'
  import { init, use } from 'echarts/core'
  import { BarChart } from 'echarts/charts'
  import { GridComponent, TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

  import { abbreviateNumber } from '$lib/utils';

  export let data;

  let employeeHistory = data?.getHistoryEmployee ?? [];
  let historyList = sortByDate(employeeHistory);

  let employees = 'n/a';
  let changeRate = 'n/a';
  let growthRate = 'n/a';
  
  let optionsTotal;
  let optionsChange;
  let optionsGrowth;
  let dateDistance = false;
  
  let sortBy = 'Total';


function sortByDate(liste) {
  //Slice copies the list otherwise employeesHistory will reverse too
  return liste?.slice()?.sort(function(a, b) {
	  return new Date(b?.filingDate) - new Date(a?.filingDate);
	});
}


function selectSortingMethod(state:string) {
  sortBy = state;
}

  
  function plotTotal() {
      
    let dateList = [];
    let employeeList = [];
    let growthList = [];

  
    for (let i = 0; i < employeeHistory?.length; i++) {
        const current = employeeHistory[i]?.employeeCount;
        //const previousDividend = i === 0 ? 0 : employeeHistory[i - 1]?.dividend;
  
        dateList?.push(employeeHistory[i]?.filingDate);
        employeeList?.push(current);
  
        //const growthRate = ( (currentDividend - previousDividend) / previousDividend ) ;
  
        //growthList.push(growthRate?.toFixed(2))
        
    }
  
      
    const options = {
      animation: false,
      grid: {
          left: '0%',
          right: '0%',
          top: '10%',
          bottom: '20%',
          containLabel: true,
          },
    xAxis: {
      data: dateList,
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
        name: 'Total Employees',
        data: employeeList,
        type: 'bar',
        barWidth: '80%',
        smooth: true,

      },
      
    ],
    tooltip: {
      trigger: 'axis',
    },
  };
  
  
      return options;
  }
  

  function plotChange() {
      
      let dateList = [];
      let changeList = [];
    
      for (let i = 0; i < employeeHistory?.length; i++) {
          const current = employeeHistory[i]?.employeeCount;
          const previous = i === 0 ? 0 : employeeHistory[i - 1]?.employeeCount;
          
          const change =  (current - previous)  ;
          dateList?.push(employeeHistory[i]?.filingDate);
          changeList?.push(change);
   
      }
    
        
      const options = {
        animation: false,
        grid: {
          left: '0%',
          right: '0%',
          top: '10%',
          bottom: '20%',
          containLabel: true,
          },
      xAxis: {
        data: dateList,
        type: 'category',
        axisLabel: {
          color: '#fff'
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
          name: 'Change of Numbers',
          data: changeList,
          type: 'bar',
          barWidth: '80%',
          smooth: true,
          itemStyle: {
                  // Define colors based on positive/negative values
                  color: function(params) {
                      return params.data >= 0 ? '#22C55E' : '#F71F4F';
                  }
              },
        },
        
      ],
      tooltip: {
        trigger: 'axis',
      },
    };
    
    
        return options;
    }




function plotGrowth() {
      
      let dateList = [];
      let growthList = [];

    
      for (let i = 0; i < employeeHistory?.length; i++) {
          const current = employeeHistory[i]?.employeeCount;
          const previous = i === 0 ? 0 : employeeHistory[i - 1]?.employeeCount;

          if (current !== null && previous !== null && previous !== 0) {
              const growth = (((current - previous) / previous) * 100 )?.toFixed(2);
              growthList?.push(growth);
          } else {
              growthList?.push(0); // Pushing null if the growth calculation is not possible
          }

          dateList?.push(employeeHistory[i]?.filingDate);
      }

      const options = {
        animation: false,
        grid: {
          left: '0%',
          right: '0%',
          top: '10%',
          bottom: '20%',
          containLabel: true,
          },
      xAxis: {
        data: dateList,
        type: 'category',
        axisLabel: {
          color: '#fff'
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
              name: 'Growth [%]',
              data: growthList,
              type: 'bar',
              barWidth: '80%',
              smooth: true,
              itemStyle: {
                  // Define colors based on positive/negative values
                  color: function(params) {
                      return params.data >= 0 ? '#22C55E' : '#F71F4F';
                  }
              },
          },
      ],
      tooltip: {
          trigger: 'axis',
        
      },
    };
    
    
        return options;
    }
  
    

if(employeeHistory?.length !== 0)
{
employees = employeeHistory?.at(-1)?.employeeCount;

changeRate = employees - employeeHistory?.at(-2)?.employeeCount;

dateDistance = new Date(employeeHistory[employeeHistory?.length -1]['filingDate']) < new Date(new Date().setFullYear(new Date().getFullYear() - 1)) ? true : false;


growthRate = ((employeeHistory[employeeHistory?.length -1]?.employeeCount/ employeeHistory[employeeHistory?.length -2]?.employeeCount -1 ) *100 )?.toFixed(2);
optionsTotal = plotTotal();
optionsChange = plotChange();
optionsGrowth = plotGrowth();
}

</script>



<svelte:head>

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<title>
{$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ''} {$displayCompanyName} ({$stockTicker}) Number of Employees · stocknear
</title>
<meta name="description" content={`Detailed historical employees number for ${$displayCompanyName} (${$stockTicker}). See many years of change, growth and the impact.`} />

<!-- Other meta tags -->
<meta property="og:title" content={`${$displayCompanyName} (${$stockTicker}) Number of Employees · stocknear`}/>
<meta property="og:description" content={`Detailed historical employees number for ${$displayCompanyName} (${$stockTicker}). See many years of change, growth and the impact.`} />
<meta property="og:type" content="website"/>
<!-- Add more Open Graph meta tags as needed -->

<!-- Twitter specific meta tags -->
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content={`${$displayCompanyName} (${$stockTicker}) Number of Employees · stocknear`}/>
<meta name="twitter:description" content={`Detailed historical employees number for ${$displayCompanyName} (${$stockTicker}). See many years of change, growth and the impact.`} />
<!-- Add more Twitter meta tags as needed -->

</svelte:head>


            
  <section class="bg-[#09090B] w-full overflow-hidden text-white h-full mb-40 sm:mb-0">
      <div class="w-full flex justify-center m-auto h-full overflow-hidden">
          <div class="w-full relative flex justify-center items-center overflow-hidden">
                <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
                      <div class="mb-6">
                          <h2 class="text-2xl sm:text-3xl text-gray-200 font-bold mb-4">
                              Employees
                          </h2>
                          
                          
                          <div class="text-white p-3 sm:p-5 mb-5 rounded-lg flex flex-row  items-center border border-gray-800 text-sm sm:text-[1rem]">
                            <svg class="w-6 h-6 flex-shrink-0 inline-block sm:mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#a474f6" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"/></svg>
                            
                            {#if employeeHistory?.length !== 0 && !dateDistance}
                            <div>
                            {$displayCompanyName}
                                had
                                    {abbreviateNumber(employees)}
                                employees on 
                                {new Date(employeeHistory[employeeHistory?.length -1]['filingDate'])?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', daySuffix: '2-digit' })}.
                                The number of employees {changeRate >=0 ? 'increased' : 'decreased'} by
                                    {abbreviateNumber(changeRate)}
                                or
                                <span class="{changeRate >=0 ? 'text-[#37C97D]' : 'text-[#FF2F1F]'}">
                                    {growthRate}%
                                </span>
                                compared to the previous year.
                            </div>
                          {:else if employeeHistory?.length !== 0 && dateDistance}
                            {$displayCompanyName} had {abbreviateNumber(employees)} employees on 
                                {new Date(employeeHistory[employeeHistory?.length -1]['filingDate'])?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', daySuffix: '2-digit' })}.
                                Since then, the company has not submitted any additional employee data for more than a year.
                          {:else}
                          No employee history for {$displayCompanyName}. Probably, no records of past employees.
                          {/if}
                        </div>
  
                      </div>

                      
                      <div class="mb-4 grid grid-cols-2 grid-rows-1 divide-gray-500 rounded-lg border border-gray-600 bg-[#272727] shadow md:grid-cols-3 md:grid-rows-1 md:divide-x">
                        <div class="p-4 bp:p-5 sm:p-6">
                          <label for="totalAnalystInfo" class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem]">
                            Total Employees
                          </label>   
                            <div class="mt-1 break-words font-semibold leading-8 text-light text-xl">
                              {abbreviateNumber(employees)}
                            </div> 
                        </div>
                        <div class="p-4 bp:p-5 sm:p-6 border-l border-b border-contrast md:border-0">
                          <label for="consensusRatingInfo" class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem]">
                            Change (1Y)
                          </label>  
            
                            <div class="mt-1 break-words font-semibold leading-8 text-light text-xl">
                              {#if dateDistance}
                              n/a
                              {:else}
                                {abbreviateNumber(changeRate)}
                              {/if}
                            </div> 
                        </div>
                        <div class="p-4 bp:p-5 sm:p-6 border-t border-r border-contrast md:border-0">
                          <label for="priceTargetInfo" class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem]">
                            Growth (1Y)
                          </label>    
                         
                            <div class="mt-1 break-words font-semibold leading-8 text-light text-xl">
                              {#if growthRate >= 0}
                              <span class="text-white text-md font-medium">
                                <svg class="w-5 h-5 inline-block -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g id="evaArrowUpFill0"><g id="evaArrowUpFill1"><path id="evaArrowUpFill2" fill="#37C97D" d="M16.21 16H7.79a1.76 1.76 0 0 1-1.59-1a2.1 2.1 0 0 1 .26-2.21l4.21-5.1a1.76 1.76 0 0 1 2.66 0l4.21 5.1A2.1 2.1 0 0 1 17.8 15a1.76 1.76 0 0 1-1.59 1Z"/></g></g></svg>
                                  <span class="text-[#37C97D] text-[1rem]">+{growthRate}%</span>
                              </span>
                              {:else if growthRate < 0}
                              <div class="text-white text-md font-medium">
                                  <svg class="w-5 h-5 rotate-180 inline-block -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g id="evaArrowUpFill0"><g id="evaArrowUpFill1"><path id="evaArrowUpFill2" fill="#FF2F1F" d="M16.21 16H7.79a1.76 1.76 0 0 1-1.59-1a2.1 2.1 0 0 1 .26-2.21l4.21-5.1a1.76 1.76 0 0 1 2.66 0l4.21 5.1A2.1 2.1 0 0 1 17.8 15a1.76 1.76 0 0 1-1.59 1Z"/></g></g></svg>    
                                  <span class="text-[#FF2F1F] text-[1rem]">{growthRate}%</span>
                              </div>
                              {:else}
                                <span class="text-white m-auto">
                                  n/a
                                </span>
                              {/if}
                            </div> 
                        </div>
                     
                    </div>

                    

           
      
            
                      <div class="flex flex-row items-center w-full mt-10 mb-8">
      
                          <h1 class="text-xl text-white font-semibold ">
                          Employees History
                          </h1>
      
      
                           <div class="flex w-fit sm:w-[50%] md:block md:w-auto ml-auto">
                            <div class="relative inline-block text-left grow">
                                <DropdownMenu.Root>
                                        <DropdownMenu.Trigger asChild let:builder>
                                        <Button builders={[builder]}  class="w-full border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-lg truncate">
                                            <span class="truncate text-white">{sortBy}</span>
                                            <svg class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block" viewBox="0 0 20 20" fill="currentColor" style="max-width:40px" aria-hidden="true">
                                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                            </svg>
                                        </Button>
                                        </DropdownMenu.Trigger>
                                        <DropdownMenu.Content class="w-56 h-fit max-h-72 overflow-y-auto scroller">
                                        <DropdownMenu.Label class="text-gray-400">
                                            Select Type
                                        </DropdownMenu.Label>
                                        <DropdownMenu.Separator />
                                        <DropdownMenu.Group>
                                            <DropdownMenu.Item on:click={() => sortBy = 'Total'} class="cursor-pointer hover:bg-[#27272A]">
                                                Total
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item on:click={() =>  sortBy = 'Change'} class="cursor-pointer hover:bg-[#27272A]">
                                                Change
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item on:click={() =>  sortBy = 'Growth'} class="cursor-pointer hover:bg-[#27272A]">
                                                Growth
                                            </DropdownMenu.Item>
                                        </DropdownMenu.Group>
                                        </DropdownMenu.Content>
                                    </DropdownMenu.Root>


                                    </div>
                            </div>
                      
                      </div>
                      
      
                      
                              
                          {#if historyList?.length !== 0}


                          {#if sortBy === 'Total'}
                          <div class="app w-full">
                              <Chart {init} options={optionsTotal} class="chart" />
                          </div>
                          {:else if sortBy === 'Change'}
                          <div class="app w-full">
                              <Chart {init} options={optionsChange} class="chart" />
                          </div>
                          {:else if sortBy === 'Growth'}
                          <div class="app w-full">
                              <Chart {init} options={optionsGrowth} class="chart" />
                          </div>
                          {/if}
                          
                          <div class="w-full overflow-x-scroll">  
                            <table class="table table-sm table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4 ">
                              <thead>
                                  <tr>
                                  <th class="text-start border-b border-[#09090B] bg-[#09090B] text-white text-[1rem] whitespace-nowrap font-semibiold">
                                      Date
                                  </th>
                                  <th class="text-end border-b border-[#09090B] bg-[#09090B] text-white text-[1rem] whitespace-nowrap font-semibiold">
                                      Employees
                                  </th>
                                  <th class="text-end border-b border-[#09090B] bg-[#09090B] text-white text-[1rem] whitespace-nowrap font-semibiold">
                                      Change
                                  </th>
                                  <th class="text-end border-b border-[#09090B] bg-[#09090B] text-white text-[1rem] whitespace-nowrap font-semibiold">
                                      Growth
                                  </th>
                                </tr>
                              </thead>
                              <tbody class="">
                                {#each historyList as item, index}
                                <tr class="text-gray-200 odd:bg-[#27272A]">
                                  <td class="text-start border-b border-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap text-white">
                                    {new Date(item?.filingDate)?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', daySuffix: '2-digit' })}
                                  </td>
                                  <td class="text-end border-b border-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap text-white">
                                    {new Intl.NumberFormat("en").format(item?.employeeCount)}
                                  </td>
                                  <td class="text-end border-b border-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap text-white">
                                    {abbreviateNumber(item?.employeeCount-historyList[index+1]?.employeeCount)}
                                  </td>
                                  <td class="text-end border-b border-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap text-white text-end">
                                    {#if index+1-historyList?.length === 0}
                                    0.00%
                                    {:else}
                                    {#if (item?.employeeCount- historyList[index+1]?.employeeCount) > 0}
                                    <span class="text-[#37C97D]">
                                      +{(((item?.employeeCount-historyList[index+1]?.employeeCount) / item?.employeeCount) * 100 )?.toFixed(2)}%
                                    </span>
                                    {:else if (item?.employeeCount - historyList[index+1]?.employeeCount ) < 0}
                                    <span class="text-[#FF2F1F]">
                                      -{(((historyList[index+1]?.employeeCount - item?.employeeCount) / item?.employeeCount) * 100 )?.toFixed(2)}%
                                    </span>
                                    {:else}
                                    0.00%
                                    {/if}
                                    {/if}
                                  </td>
                                </tr>
                                {/each}
                              </tbody>
                              
                              </table>
                          </div>
                          
      
                      {:else}
                      <h1 class="text-xl m-auto flex justify-center text-gray-200 font-medium mb-4 mt-10">
                          No history found
                      </h1>
                      {/if}
      
                


                </div>

                
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