
<script lang ="ts">
    
    let aiScoreDict = {'score': 9};
    let score = aiScoreDict?.score;

</script>
    
    
    
    <section class="overflow-hidden text-white h-full pb-10 sm:pb-0">
        <main class="overflow-hidden ">
                        

            {#if Object?.keys(aiScoreDict)?.length !== 0}
            


            <div class="pb-4 w-full mt-5">
                <div class="w-auto p-4 sm:p-6 bg-[#09090B] sm:bg-[#09090B] rounded-lg relative">
                  <div class="flex flex-row items-center justify-between ">
                            <div class="relative size-[60px] sm:size-[90px] ml-auto">
                            <svg class="size-full w-[60px] h-[60px] sm:w-[90px] sm:h-[90px]" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                <!-- Background Circle -->
                                <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-[#303030]" stroke-width="4"></circle>
                                <!-- Progress Circle inside a group with rotation -->
                                <g class="origin-center -rotate-90 transform">
                                <circle cx="18" cy="18" r="16" fill="none" class="stroke-current {score > 5 ? 'text-[#37C97D]' : score < 5 ? 'text-[#FF2F1F]' : 'text-white'} " stroke-width="4" stroke-dasharray="100" stroke-dashoffset={10-score}></circle>
                                </g>
                            </svg>
                            <!-- Percentage Text -->
                            <div class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                                <span class="text-center text-white text-xl sm:text-2xl font-semibold">
                                    {score}
                                </span>
                            </div>
                            </div>
                
                    </div>
                </div>
              </div>
            {/if}

        </main>
    </section>