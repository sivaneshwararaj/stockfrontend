<script lang='ts'>
import { screenWidth } from '$lib/store';
import IndustryTable from '$lib/components/IndustryTable.svelte';
import { industryList, sectorList } from '$lib/utils';
import { goto } from '$app/navigation';

export let data;
let rawData = data?.getIndustryOverview;

const sectorNavigation = [
    {
        title: 'Financial Services',
        link: '/list/financial-sector'
    },
    {
        title: 'Finance',
        link: '/list/financial-sector'
    },
    {
        title: 'Healthcare',
        link: '/list/healthcare-sector'
    },
    {
        title: 'Technology',
        link: '/list/technology-sector'
    },
    {
        title: 'Industrials',
        link: '/list/industrials-sector'
    },
    {
        title: 'Energy',
        link: '/list/energy-sector'
    },
    {
        title: 'Utilities',
        link: '/list/utilities-sector'
    },
    {
        title: 'Consumer Cyclical',
        link: '/list/consumer-cyclical-sector'
    },
    {
        title: 'Real Estate',
        link: '/list/real-estate-sector'
    },
    {
        title: 'Basic Materials',
        link: '/list/basic-materials-sector'
    },
    {
        title: 'Communication Services',
        link: '/list/communication-services-sector'
    },
    {
        title: 'Consumer Defensive',
        link: '/list/consumer-defensive-sector'
    },
]

function sectorSelector(sector) {
    const selectedSector = sectorNavigation?.find(item => item?.title === sector);

    if (selectedSector) {
      goto(selectedSector?.link);
    } else {
      // Handle the case when the sector is not found
      console.error(`Sector not found: ${sector}`);
    }
  }

$: charNumber = $screenWidth < 640 ? 20 : 30;

</script>
    
    <section class="w-full overflow-hidden m-auto px-2 sm:px-0">
            
          
        <div class="border border-gray-800 w-full sm:flex sm:flex-row sm:items-center m-auto text-gray-100 bg-[#09090B] sm:rounded-lg h-auto p-5 mb-4">
            <svg class="w-5 h-5 inline-block sm:mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#a474f6" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"/></svg>
            We categorize stocks into {sectorList?.length} sectors and {industryList?.length} industries, based on the company's primary business activity.
        </div>
    
      
        
          <!-- Page wrapper -->
          <div class="flex justify-center w-full m-auto h-full overflow-hidden">
      
              
        
              <!-- Content area -->
              <div class="w-full">
                {#each sectorList as sector}
                    <h2 on:click={() => sectorSelector(sector)} class="cursor-pointer text-white sm:hover:underline font-semibold text-lg sm:text-xl mt-5">
                        Sector: {sector} <svg class="inline-block h-6 w-6 -mt-1" viewBox="0 0 20 20" fill="white" style="max-width:40px"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                    </h2>
                    
                    <div class="border-t border-gray-600 mt-5"/>

                    <IndustryTable charNumber = {charNumber} industryList = {rawData[sector]} />
                    <div class="border-t border-gray-600 mt-5"/>
                {/each}
    
                  
          </div>

          
      
      </section>
      
      
    