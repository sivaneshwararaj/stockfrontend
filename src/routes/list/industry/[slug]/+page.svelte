<script lang='ts'>
  import { goto } from '$app/navigation';
  import { screenWidth } from '$lib/store';
  import { abbreviateNumber} from '$lib/utils';
  import { onMount } from 'svelte';

  
  export let data;
  let isLoaded = false;

  let rawData = data?.getIndustryStocks;

  let stockList = rawData?.slice(0,50);
  
  async function handleScroll() {
      const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
      const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
      if (isBottom && stockList?.length !== rawData?.length) {
          const nextIndex = stockList?.length;
          const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
          stockList = [...stockList, ...filteredNewResults];
      }
    }
  
      


  onMount(async () => {

    isLoaded = true;
    window.addEventListener('scroll', handleScroll);
      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  })
  

  
  $: charNumber = $screenWidth < 640 ? 15 : 20;

  </script>
      
      <section class="w-full overflow-hidden m-auto">
              
            
        
          
            <!-- Page wrapper -->
            <div class="flex justify-center w-full m-auto h-full overflow-hidden">
        
      
                <!-- Content area -->
                <div class="w-full overflow-x-scroll">
        
      
             
               <table class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto">
                          <thead>
                            <tr class="bg-[#09090B]">
                              <th class="text-start bg-[#09090B] text-white text-[1rem] font-semibold">
                                Symbol
                              </th>
                              <th class="text-start bg-[#09090B] text-white text-[1rem] font-semibold">
                                Name
                              </th>
                              <th class="text-end bg-[#09090B] text-white text-[1rem] font-semibold">
                                Market Cap
                              </th>
                              <th class="text-end bg-[#09090B] text-white text-[1rem] font-semibold">
                                % Change
                              </th>
                              <th class="text-end bg-[#09090B] text-white text-[1rem] font-semibold">
                                Volume
                              </th>
                              <th class="hidden xl:table-cell text-end bg-[#09090B] text-white text-[1rem] font-semibold">
                                Revenue
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {#each stockList as item}
    
                            <tr on:click={() => goto(`/stocks/${item?.symbol}`)} class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] cursor-pointer">
   

                            <td class="text-sm sm:text-[1rem] whitespace-nowrap text-start text-blue-400">
                                {item?.symbol}
                            </td>

                            <td class="hidden sm:table-cell text-white text-sm sm:text-[1rem] whitespace-nowrap text-white text-start">
                                {item?.name?.length > charNumber ? item?.name?.slice(0,charNumber) + "..." : item?.name}
                            </td>
  
                            <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white">
                                {abbreviateNumber(item?.marketCap)}
                            </td>

        
                            <td class="text-sm sm:text-[1rem] whitespace-nowrap {(item?.changesPercentage !== null && item?.changesPercentage >= 0) ? 'text-[#10DB06]' : item?.changesPercentage < 0 ? 'text-[#FF2F1F]' : 'text-white'} text-end">
                                {item?.changesPercentage !== null ? item?.changesPercentage : '-'}
                              </td>

                              <td class="text-sm sm:text-[1rem] text-white text-end">
                                {item?.volume !== null ? abbreviateNumber(item?.volume) : '-'}
                              </td>

                              <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap font-medium text-white">
                               {item?.revenue === 0 ? '-' : abbreviateNumber(item?.revenue)}
                              </td>
  
                            </tr>
                          {/each}
                          </tbody>
                        </table>
      
                      
            </div>
  
            </div>
        
        </section>
        
        


