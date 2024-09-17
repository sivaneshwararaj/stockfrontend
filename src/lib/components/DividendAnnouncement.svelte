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
    return differenceInDays <=1;
}


$: {
    if($stockTicker && typeof window !== 'undefined') {
        rawData = data?.getDividendAnnouncement;
    }
}

</script>


{#if Object?.keys(rawData)?.length !== 0}

<div class="overflow-hidden">  
    <!--Start Content-->
    <div class="w-auto lg:w-full p-1 flex flex-col m-auto">

        <div class="flex flex-col items-center w-full mb-3">
            <div class="flex flex-row justify-start mr-auto items-center">
            <!--<img class="h-10 inline-block mr-2" src={copilotIcon} />-->
            <div class="flex flex-row items-center">
                <label for="dividendAnnouncement" class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold">
                    Dividend Announcement  
                </label>
                <InfoModal
                title={"Dividend Announcement"}
                content={`Dividend announcements are company declarations of cash or stock distributions to shareholders, usually reflecting profit and providing investment returns.`}
                id={"dividendAnnouncement"}
                />
                </div>

            </div>
        </div>

        <div class="text-white text-[1rem] {latestInfoDate(rawData?.date) ? 'bg-[#F9AB00] bg-opacity-[0.1] p-3 rounded-lg' : 'bg-[#09090B] pl-1'} ">
            <div class="mt-1">{$displayCompanyName} has announced its upcoming dividend details on {new Date(rawData?.date)?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', daySuffix: '2-digit' })}:</div>
  
                <li class="ml-[20px] sm:ml-[30px]" style="color: #fff; line-height: 22px; margin-top:20px; margin-bottom: 15px; list-style-type: disc;">
                      <span class="font-bold">Dividend:</span> ${rawData?.dividend} per share ({(rawData?.dividend/rawData?.dividendPrior-1) > 0 ? '+' :''}{((rawData?.dividend/rawData?.dividendPrior-1)*100)?.toFixed(2)}% YoY)
                </li>
                <li class="ml-[20px] sm:ml-[30px]" style="color: #fff; line-height: 22px; margin-top:0px; margin-bottom: 15px; list-style-type: disc;">
                    <span class="font-bold">Dividend Yield:</span> {rawData?.dividendYield?.toFixed(2)}%
                </li>
                <li class="ml-[20px] sm:ml-[30px]" style="color: #fff; line-height: 22px; margin-top:0px; margin-bottom: 15px; list-style-type: disc;">
                    <span class="font-bold">Ex-Dividend Date:</span> {new Date(rawData?.exDividendDate)?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', daySuffix: '2-digit' })}
                </li>

                <li class="ml-[20px] sm:ml-[30px]" style="color: #fff; line-height: 22px; margin-top:0px; margin-bottom: 15px; list-style-type: disc;">
                   <span class="font-bold">Payable Date:</span> {new Date(rawData?.payableDate)?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', daySuffix: '2-digit' })}
                </li>
                
                <li class="ml-[20px] sm:ml-[30px]" style="color: #fff; line-height: 22px; margin-top:0px; margin-bottom: 15px; list-style-type: disc;">
                  <span class="font-bold">Record Date:</span> {new Date(rawData?.recordDate)?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', daySuffix: '2-digit' })}
                </li>
        </div>

    </div>


    </div>
{/if}