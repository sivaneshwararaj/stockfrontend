<script lang="ts">
  import { etfTicker, numberOfUnreadNotification, displayCompanyName} from '$lib/store';

  import { screenWidth } from '$lib/store';
  import { abbreviateNumber, formatString } from '$lib/utils';
  import { onMount } from 'svelte';

  export let data;
  let rawData = data?.getETFHoldings;
  let holdings = rawData?.slice(0,50);

  let category = 'weights';
  let order = 'highToLow';
  function changeOrder(newCategory: string) {
    if (newCategory === category) {
      order = order === 'highToLow' ? 'lowToHigh' : 'highToLow';
    } else {
      category = newCategory;
      order = 'highToLow';
    }
    holdings = sortElements(category, rawData)?.slice(0,50);
  }

  const sortElements = (category, tickerList) => {
    return tickerList?.sort((a, b) => {
      const aValue = category === 'weights' ? a?.weightPercentage : a?.sharesNumber;
      const bValue = category === 'weights' ? b?.weightPercentage : b?.sharesNumber;
      return order === 'highToLow' ? bValue - aValue : aValue - bValue;
    });
  }



async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && holdings?.length !== rawData?.length) {
        const nextIndex = holdings?.length;
        const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
        holdings = [...holdings, ...filteredNewResults];
    }
  }

  onMount(() => {

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };

  })

$: charNumber = $screenWidth < 640 ? 20 : 30


</script>


<svelte:head>

  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ''} {$displayCompanyName} ({$etfTicker}) Holdings List · stocknear
  </title>
  <meta name="description" content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`} />
  
  <!-- Other meta tags -->
  <meta property="og:title" content={`${$displayCompanyName} (${$etfTicker}) Holdings List · stocknear`}/>
  <meta property="og:description" content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`} />
  <meta property="og:type" content="website"/>
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content={`${$displayCompanyName} (${$etfTicker}) Holdings List · stocknear`}/>
  <meta name="twitter:description" content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`} />
  <!-- Add more Twitter meta tags as needed -->

</svelte:head>
  
     
                  

          
<section class="bg-[#09090B] overflow-hidden text-white h-full mb-40 sm:mb-0 w-full">
  <div class="flex justify-center m-auto h-full overflow-hidden w-full">
      <div class="relative flex justify-center items-center overflow-hidden w-full">
            <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
                  <div class="mb-6">
                      <h2 class="text-2xl sm:text-3xl text-gray-200 font-bold mb-4">
                          ETF Holdings
                      </h2>


                        <div class="text-white p-3 sm:p-5 mb-10 rounded-lg sm:flex sm:flex-row sm:items-center border border-slate-800 text-sm sm:text-[1rem]">
                          <svg class="w-6 h-6 flex-shrink-0 inline-block sm:mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#a474f6" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"/></svg>
                          
                          {#if rawData?.length !== 0}
                          The {$displayCompanyName} holds {rawData?.length} different assets
                          and the largest one in the portfolio is {formatString(rawData?.at(0)?.name)}, making up {rawData?.at(0)?.weightPercentage?.toFixed(2)}% of the total.
                          {:else}                          
                            No information available for {$displayCompanyName}.
                          {/if}

                        </div>
  

            
                    </div>
      
                    {#if holdings?.length !== 0}

                    <div class="w-full overflow-x-auto">
                                  
                                  
                      <table class="table table-pin-cols table-sm table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4 overflow-x-auto">
                          <thead>
                            <tr class="">
                              <td class="text-white border-b border-[#09090B] bg-[#09090B] font-semibold text-sm sm:text-[1rem] whitespace-nowrap">Symbol</td>
                              <td class="text-white border-b border-[#09090B] bg-[#09090B] font-semibold text-sm sm:text-[1rem] whitespace-nowrap ">Name</td>
                              <td on:click={() => changeOrder('shares')} class="text-white border-b border-[#09090B] bg-[#09090B] font-semibold text-end text-sm sm:text-[1rem] whitespace-nowrap cursor-pointer">
                                Shares
                                <svg class="w-5 h-5 inline-block {order === 'highToLow' && category === 'shares' ? 'rotate-180' : ''}" viewBox="0 0 20 20" fill="currentColor" style="max-width:40px"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                              </td>
                              <td on:click={() => changeOrder('weights')} class="text-white border-b border-[#09090B] bg-[#09090B] font-semibold text-end text-sm sm:text-[1rem] whitespace-nowrap cursor-pointer">
                                % Weight
                                <svg class="w-5 h-5 inline-block {order === 'highToLow' && category === 'weights' ? '' : 'rotate-180'}" viewBox="0 0 20 20" fill="currentColor" style="max-width:40px"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                              </td>
                            </tr>
                          </thead>
                          <tbody>
                            {#each holdings as item}
                        <!-- row -->
                        {#if item?.asset !== null}
                        <tr class="w-full sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A]">
                          
                          <td class="text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B]">
                            <a href={item?.asset?.length !== 0 && !['BTC', 'USD'].includes(item?.asset) ? `/stocks/${item?.asset}` : item?.asset === 'BTC' ? '/crypto/BTCUSD' : '' } class="sm:hover:text-white text-blue-400">{item?.asset?.length !== 0 ? item?.asset : '-'}</a>
                          </td>
                          
                          <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B]">
                            {item?.name?.length > charNumber ? formatString(item?.name?.slice(0,charNumber)) + "..." : formatString(item?.name)}
                          </td>
            
    
              
                        <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B] text-end">
                          {abbreviateNumber(item?.sharesNumber)}
                        </td>
          
            
                        <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B] text-end">
                             {item?.weightPercentage >= 0.01 ? item?.weightPercentage?.toFixed(2) : '< 0.01'}%
                        </td>
            
                    
            
                      </tr>
                        
                     
            
                        {/if}
                        {/each}

                          </tbody>
                      </table>
                      

                  </div>

                
        
        
                {:else} 
                <h2 class="pl-4 pr-4 flex justify-center items-center text-md sm:text-lg text-center text-slate-200">
                  No holdings are available for {$displayCompanyName}.
                </h2>
              
                {/if}
      
                    
    
                </div>
            </div>
         </div>
    </section>