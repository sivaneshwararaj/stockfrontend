<script lang='ts'>
  import { stockTicker, displayCompanyName } from "$lib/store";
  import InfoModal from '$lib/components/InfoModal.svelte';
  
  export let data;
  
  let rawData = {};

  
  function handleMode(i) {
    activeIdx = i;
  }
  
  const tabs = [
      {
        title: "Bull Case",
      },
      {
        title: "Bear Case",
      },
    ];
  
    let activeIdx = 0;
  
  $: {
      if($stockTicker && typeof window !== 'undefined') {
          rawData = data?.getBullBearSay;
          activeIdx = 0;
      }
  }
      
  </script>
  
  
  {#if Object?.keys(rawData)?.length !== 0}
  
  <div class="space-y-3 overflow-hidden">  
      <!--Start Content-->
      <div class="w-auto lg:w-full p-1 flex flex-col m-auto">
  
        <div class="flex flex-col items-center w-full mb-6">
            <div class="flex flex-row justify-start mr-auto items-center">
              <!--<img class="h-10 inline-block mr-2" src={copilotIcon} />-->
              <div class="flex flex-row items-center">
                <label for="bullBearCase" class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold">
                  Bull Case vs Bear Case
                </label>
                <InfoModal
                  title={"Bull Case vs Bear Case"}
                  content={`Before investing, examine both perspectives. We offer brief analyst report summaries, highlighting both positive ("Bulls Say") and negative ("Bears Say") viewpoints on ${$displayCompanyName}`}
                  id={"bullBearCase"}
                />
                </div>
  
            </div>
        </div>
  
     <!--Start Header-->
     <div class="bg-[#313131] w-fit relative flex flex-wrap items-center justify-center rounded-lg p-1 -mt-2">
        {#each tabs as item, i}
          <button
            on:click={() => handleMode(i)}
            class="group relative z-[1] rounded-full px-6 py-1 {activeIdx === i
              ? 'z-0'
              : ''} "
          >
            {#if activeIdx === i}
                <div
                  class="absolute inset-0 rounded-lg bg-purple-600"
                ></div>
            {/if}
            <span
              class="relative text-sm block font-medium duration-200 text-white">
              {item.title}
            </span>
          </button>
        {/each}
    </div>
    
  
    <!--End Header-->
      <span class="text-gray-200 text-xs sm:text-[0.915rem] italic mt-6 sm:ml-auto">
        Updated {rawData?.date}
      </span>
      <div class="flex mt-5 h-auto">
      
        <div class="{activeIdx === 0 ? 'bg-[#10DB06]' : 'bg-[#FF2F1F]'} w-full max-w-[3px] rounded-l-xl" />
        <span class="text-gray-100 ml-3 text-[1rem] ">
          {#if activeIdx === 0}
          <p class="pr-1">{rawData?.bullSays}</p>
          {:else}
          <p class="pr-1">{rawData?.bearSays}</p>
          {/if}
        </span>
      </div>

  
      </div>

  
    </div>
  {/if}