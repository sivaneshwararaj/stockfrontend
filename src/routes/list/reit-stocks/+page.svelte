<script lang='ts'>
import { screenWidth } from '$lib/store';
import { onMount } from 'svelte';
import { abbreviateNumber } from '$lib/utils';

export let data;
let rawData = data?.getAllREITs;
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
      window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    })

$: charNumber = $screenWidth < 640 ? 20 : 30;

</script>
    
    <section class="w-full overflow-hidden m-auto">
            
          
        <div class="border border-gray-800 w-full sm:flex sm:flex-row sm:items-center m-auto text-gray-100 bg-[#09090B] sm:rounded-lg h-auto p-5 mb-4">
            <svg class="w-5 h-5 inline-block sm:mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#a474f6" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"/></svg>
            
            These are all the actively traded REITs (Real Estate Investment Trusts) on the US stock market.
            
          </div>
    
      
        
          <!-- Page wrapper -->
          <div class="flex justify-center w-full m-auto h-full overflow-hidden">
      
              
        
              <!-- Content area -->
              <div class="w-full overflow-x-scroll">
      
    
           
                <table class="table rounded-none sm:rounded-md w-full m-auto mt-4 ">
                    <thead>
                      <tr class="border border-slate-800">
                        <th class="text-white font-semibold text-[1rem]">Symbol</th>
                        <th class="text-white font-semibold text-[1rem]">Company</th>
                        <th class="text-white font-semibold text-end text-[1rem]">Stock Price</th>
                        <th class="text-white font-semibold text-center text-[1rem]">% Change</th>
                        <th class="text-white font-semibold text-[1rem] text-end">Div. Yield</th>
                        <th class="text-white font-semibold text-[1rem] text-end">Market Cap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each stockList as item}
                      <!-- row -->
                      <tr class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B]">
                        <td class="text-blue-400 font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]">
                          {item?.symbol}
                        </td>
      
      
                        <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]">
                          {item?.name?.length > charNumber ? item?.name?.slice(0,charNumber) + "..." : item?.name}
                        </td>
    
                        <td class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]">
                            {item?.price}
                        </td>
      
                        <td class="{item?.changesPercentage >= 0 ? 'text-[#10DB06]' : 'text-[#FF2F1F]'} text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]">
                            {item?.changesPercentage?.toFixed(2)}%
                        </td>

                        <td class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]">
                            {item?.dividendYield?.toFixed(2)}%
                        </td>
                
      
                        <td class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]">
                          {abbreviateNumber(item?.marketCap)}
                        </td>

                      </tr>
                      
                  
                      {/each}
                    </tbody>
                  </table>
    
                  
          </div>

          
      
      </section>
      
      
      
      