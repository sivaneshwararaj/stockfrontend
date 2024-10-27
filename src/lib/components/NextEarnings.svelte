<script lang="ts">
  import { stockTicker, displayCompanyName } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { abbreviateNumber } from "$lib/utils";
  export let data;

  let rawData = {};
  let revenueRatio = 0;
  let epsRatio = 0;

  function compareTimes(time1, time2) {
    const [hours1, minutes1] = time1?.split(":").map(Number);
    const [hours2, minutes2] = time2?.split(":").map(Number);

    if (hours1 > hours2) return 1;
    if (hours1 < hours2) return -1;
    if (minutes1 > minutes2) return 1;
    if (minutes1 < minutes2) return -1;
    return 0;
  }

  $: {
    if ($stockTicker && typeof window !== "undefined") {
      rawData = data?.getNextEarnings;
      epsRatio = ((rawData?.epsEst / rawData?.epsPrior - 1) * 100)?.toFixed(2);
      revenueRatio = (
        (rawData?.revenueEst / rawData?.revenuePrior - 1) *
        100
      )?.toFixed(2);
    }
  }
</script>

{#if Object?.keys(rawData)?.length !== 0}
  <div class="space-y-3 overflow-hidden">
    <!--Start Content-->
    <div class="w-auto lg:w-full p-1 flex flex-col m-auto">
      <div class="flex flex-col items-center w-full mb-3">
        <div class="flex flex-row justify-start mr-auto items-center">
          <!--<img class="h-10 inline-block mr-2" src={copilotIcon} />-->
          <div class="flex flex-row items-center">
            <label
              for="nextEarningsInfo"
              class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold"
            >
              Next Earnings Release
            </label>
            <InfoModal
              title={"Next Earnings"}
              content={`Earnings represent a company's net profit after expenses, taxes, and costs. Reported quarterly, they show financial health, including revenue and EPS, influencing stock prices and investor decisions.`}
              id={"nextEarningsInfo"}
            />
          </div>
        </div>
      </div>

      <div class="text-white text-[1rem] pl-1">
        {$displayCompanyName} is scheduled to release its earnings on {new Date(
          rawData?.date ?? null,
        )?.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "Europe/Berlin",
        })},
        {#if compareTimes(rawData?.time, "16:00") > 0}
          after market closes.
        {:else if compareTimes(rawData?.time, "09:30") < 0}
          before market opens.
        {:else}
          during market hours.
        {/if}
        <br />Analysts project revenue of
        <strong>{abbreviateNumber(rawData?.revenueEst, true)}</strong>,
        reflecting a
        <strong>{revenueRatio}%</strong> YoY {revenueRatio > 0
          ? "growth"
          : revenueRatio < 0
            ? "shrinking"
            : ""} and earnings per share of
        <strong>{rawData?.epsEst}</strong>, making a
        <strong>{epsRatio}%</strong>
        {epsRatio > 0 ? "increase" : epsRatio < 0 ? "decrease" : ""} YoY.
      </div>
    </div>
  </div>
{/if}
