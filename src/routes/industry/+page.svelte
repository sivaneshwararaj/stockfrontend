<script lang='ts'>
import { screenWidth } from '$lib/store';
import IndustryTable from '$lib/components/IndustryTable.svelte';
import { sectorList } from '$lib/utils';

export let data;
let rawData = data?.getIndustryOverview;


  

$: charNumber = $screenWidth < 640 ? 20 : 30;

</script>
    
    <section class="w-full overflow-hidden m-auto px-2 sm:px-0">
            
          
        <div class="border border-gray-800 w-full sm:flex sm:flex-row sm:items-center m-auto text-gray-100 bg-[#09090B] sm:rounded-lg h-auto p-5 mb-4">
            <svg class="w-5 h-5 inline-block sm:mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#a474f6" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"/></svg>
            
            These are all the actively traded REITs (Real Estate Investment Trusts) on the US stock market.
            
          </div>
    
      
        
          <!-- Page wrapper -->
          <div class="flex justify-center w-full m-auto h-full overflow-hidden">
      
              
        
              <!-- Content area -->
              <div class="w-full">
                {#each sectorList as sector}
                    <h2 class="cursor-pointer text-white sm:hover:underline font-semibold text-lg sm:text-xl mt-5">
                        Sector: {sector} <svg class="inline-block h-6 w-6 -mt-1" viewBox="0 0 20 20" fill="white" style="max-width:40px"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                    </h2>
                    
                    <div class="border-t border-gray-600 mt-5"/>

                    <IndustryTable charNumber = {charNumber} industryList = {rawData[sector]} />
                    <div class="border-t border-gray-600 mt-5"/>
                {/each}
    
                  
          </div>

          
      
      </section>
      
      
    