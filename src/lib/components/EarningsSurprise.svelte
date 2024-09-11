<script lang='ts'>
import { stockTicker, displayCompanyName } from "$lib/store";
import InfoModal from '$lib/components/InfoModal.svelte';
import { abbreviateNumber } from "$lib/utils";
export let data;

let rawData = {};

function latestInfoDate(inputDate) {
    // Convert the input date string to milliseconds since epoch
    const inputDateMs = Date?.parse(inputDate);

    // Get today's date in milliseconds since epoch
    const todayMs = Date?.now();

    // Calculate the difference in milliseconds
    const differenceInMs = todayMs - inputDateMs;

    // Convert milliseconds to days
    const differenceInDays = Math?.floor(differenceInMs / (1000 * 60 * 60 * 24));

    // Return the difference in days
    return differenceInDays <=3;
}


$: {
    if($stockTicker && typeof window !== 'undefined') {
        rawData = data?.getEarningsSurprise;
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
                <label for="earningsSurprise" class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold">
                    Earnings Surprise  
                </label>
                <InfoModal
                title={"Earnings Surprise"}
                content={`The earnings surprise is when a company's actual EPS differs from analysts' forecasts. Positive surprises boost stock prices; negative ones can lower them.`}
                id={"earningsSurprise"}
                />
                </div>

            </div>
        </div>

    {#if data?.user?.tier === 'Pro'}
        <div class="text-white text-[1rem] {latestInfoDate(rawData?.date) ? 'bg-[#F9AB00] bg-opacity-[0.1] p-3 rounded-lg' : 'bg-[#27272A]'} ">
            <div class="mt-1">{$displayCompanyName} has released their quartely earnings on {new Date(rawData?.date)?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', daySuffix: '2-digit' })}:</div>
  
                    <li class="ml-[20px] sm:ml-[30px]" style="color: #fff; line-height: 22px; margin-top:20px; margin-bottom: 15px; list-style-type: disc;">
                      Revenue of <strong>{abbreviateNumber(rawData?.revenue,true)}</strong> {rawData?.revenueSurprise > 0 ? 'exceeds' : 'misses'} estimates by {abbreviateNumber(Math.abs(rawData?.revenueSurprise),true)}, with <strong>{((rawData?.revenue/rawData?.revenuePrior-1)*100)?.toFixed(2)}%</strong> YoY {(rawData?.revenue/rawData?.revenuePrior-1) < 0 ? 'decline' : 'growth'}.
                  </li>
                  <li class="ml-[20px] sm:ml-[30px]" style="color: #fff; line-height: 22px; margin-top:0px; margin-bottom: 15px; list-style-type: disc;">
                    EPS of <strong>${rawData?.eps}</strong> {rawData?.epsSurprise > 0 ? 'exceeds' : 'misses'} estimates by ${rawData?.epsSurprise?.toFixed(2)}, with <strong>{(((rawData?.eps - rawData?.epsPrior) / Math.abs(rawData?.epsPrior)) * 100)?.toFixed(2)}%</strong> YoY {((rawData?.eps - rawData?.epsPrior) / Math.abs(rawData?.epsPrior)) < 0 ? 'decline' : 'growth'}.
                </li>
        </div>
    {:else}
    <div class="shadow-lg shadow-bg-[#000] bg-[#111112] sm:bg-opacity-[0.5] text-sm sm:text-[1rem] rounded-md w-full p-4 min-h-24 mt-4 text-white m-auto flex justify-center rawDatas-center text-center font-semibold">
        <svg class="mr-1.5 w-5 h-5 inline-block"xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#A3A3A3" d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"/></svg>
        Unlock content with <a class="inline-block ml-2 text-blue-400 hover:sm:text-white" href="/pricing">Pro Subscription</a>
    </div>
    {/if}

    </div>


    </div>
{/if}