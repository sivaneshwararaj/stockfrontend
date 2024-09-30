
<script lang ="ts">

    export let score;

</script>
    
    
    
    <section class="overflow-hidden text-white">
        <main class="overflow-hidden ">
                        
            <div class="w-full">
                <div class="flex flex-col items-center w-auto p-4 sm:p-4 bg-[#09090B] sm:bg-[#09090B] rounded-lg relative">
                    <div class="relative">
                        <h3 class="text-center text-white text-sm sm:text-[1rem] mb-2">AI Score</h3>

                        <label for="scoreInfo" class="absolute -top-3 -right-4 cursor-pointer border border-gray-900 rounded-full bg-[#242424] sm:hover:bg-[#313131] duration-100 p-1 text-gray-300 hover:text-gray-600 dark:text-dark-400 dark:hover:text-dark-300">
                            <svg class="h-[8px] w-[8px]" viewBox="0 0 4 16" fill="white" style="max-width:20px">
                                <path d="M0 6h4v10h-4v-10zm2-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"></path>
                            </svg>
                        </label>
                    </div>

                    <div class="flex flex-row items-center justify-between">
                            <div class="relative size-[50px] sm:size-[60px] ml-auto">
                            <svg class="size-full w-[50px] h-[50px] sm:w-[60px] sm:h-[60px]" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                <!-- Background Circle -->
                                <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-[#303030]" stroke-width="2"></circle>
                                <!-- score Circle inside a group with rotation -->
                                <g class="origin-center -rotate-90 transform">
                                    <!-- score Circle -->
                                    <circle cx="18" cy="18" r="16" fill="none"
                                        class="stroke-current {score >= 7 ? 'text-[#37C97D]' : score >=4 ? 'text-[#FF9E21]' : 'text-[#FF2F1F]'}" 
                                        stroke-width="3" 
                                        stroke-dasharray="100.48" 
                                        stroke-dashoffset="{100.48 - (score / 10) * 100.48}">
                                    </circle>
                                </g>
                                <!-- Text in the middle -->
                                <text x="18" y="21" text-anchor="middle" font-size="10" fill="#000">{score}</text>
                            </svg>

                            <!-- Percentage Text -->
                            <div class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                                <span class="text-center text-white text-xl font-semibold">
                                    {score}
                                </span>
                            </div>
                            </div>
                
                    </div>
                    <h4 class="text-center text-white text-sm mt-2 font-semibold">
                        {#if score === 10}
                            Strong Buy
                        {:else if score >=7}
                            Buy
                        {:else if score >=4}
                            Hold
                        {:else if score >=2}
                            Sell
                        {:else}
                            Strong Sell
                        {/if}
                    </h4>
                </div>
              </div>
        </main>
    </section>




<!-- Put this part before </body> tag -->
<input type="checkbox" id="scoreInfo" class="modal-toggle" />



<label for="scoreInfo" class="modal modal-bottom sm:modal-middle cursor-pointer">

  <label for="scoreInfo"  class="cursor-pointer modal-backdrop"></label>



  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="modal-box w-full relative bg-[#09090B] border border-gray-800 h-auto">
    <label for="scoreInfo" class="cursor-pointer absolute right-5 top-2 bg-[#09090B] text-2xl text-white">
      ✕
    </label>

    <h3 class="text-2xl font-bold text-white">
      AI Score
    </h3>
    <p class="py-4 text-gray-200 bg-[#09090B] w-full">
        Our AI model analyzes fundamental, technical, and statistical indicators to predict the probability of a bullish trend over the next three months.
        <br>
        <br>
        We regularly update and refine our models to deliver the most reliable forecasts for you.
    </p>

    <table class="table table-sm table-compact bg-[#09090B] w-full mt-5 mb-10 text-white">
      <!-- head -->
      <thead>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <th class="bg-[#09090B] text-white text-sm font-semibold">
            Bullish Probability
          </th>
          <th class="bg-[#09090B] text-white text-sm font-semibold">
            Sentiment
          </th>
          <th class="bg-[#09090B] text-white text-sm text-end font-semibold">
            Score
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="text-sm sm:text-[1rem]">+80% </td>
          <td class="text-sm sm:text-[1rem]">Strong Buy</td>
          <td class="text-sm sm:text-[1rem] text-end">10</td>
        </tr>
        <!-- row 2 -->
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="text-sm sm:text-[1rem]">+75%</td>
          <td class="text-sm sm:text-[1rem]">Buy</td>
          <td class="text-sm sm:text-[1rem] text-end">9</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="text-sm sm:text-[1rem]">+70%</td>
          <td class="text-sm sm:text-[1rem]">Buy</td>
          <td class="text-sm sm:text-[1rem] text-end">8</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="text-sm sm:text-[1rem]">
           +60%
            </td>
            <td class="text-sm sm:text-[1rem]">Buy</td>
          <td class="text-sm sm:text-[1rem] text-end">7</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="text-sm sm:text-[1rem]">+50%</td>
          <td class="text-sm sm:text-[1rem]">Hold</td>
          <td class="text-sm sm:text-[1rem] text-end">6</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="text-sm sm:text-[1rem]">+45%</td>
          <td class="text-sm sm:text-[1rem]">Hold</td>
          <td class="text-sm sm:text-[1rem] text-end">5</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="text-sm sm:text-[1rem]">+40%</td>
          <td class="text-sm sm:text-[1rem]">Hold</td>
          <td class="text-sm sm:text-[1rem] text-end">4</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="text-sm sm:text-[1rem]">+35%</td>
          <td class="text-sm sm:text-[1rem]">Sell</td>
          <td class="text-sm sm:text-[1rem] text-end">3</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="text-sm sm:text-[1rem]">+30%</td>
          <td class="text-sm sm:text-[1rem]">Sell</td>
          <td class="text-sm sm:text-[1rem] text-end">2</td>
        </tr>
        <tr class="odd:bg-[#27272A]">
          <td class="text-sm sm:text-[1rem]">+20%</td>
          <td class="text-sm sm:text-[1rem]">Strong Sell</td>
          <td class="text-sm sm:text-[1rem] text-end">1</td>
        </tr>
      </tbody>
    </table>


  </label>
</label>

