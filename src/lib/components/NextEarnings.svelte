<script lang="ts">
  import { stockTicker, displayCompanyName } from "$lib/store";
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
      epsRatio =
        rawData?.epsPrior !== 0
          ? ((rawData?.epsEst / rawData?.epsPrior - 1) * 100)?.toFixed(2)
          : null;

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
            <h3
              class="mr-1 flex flex-row items-center text-white text-2xl font-bold"
            >
              Next Earnings Release
            </h3>
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
        <span class="font-semibold"
          >{abbreviateNumber(rawData?.revenueEst, true)}</span
        >, reflecting a
        <span
          class="{revenueRatio > 0
            ? "before:content-['+'] text-[#00FC50]"
            : 'text-[#FF2F1F]'} ">{abbreviateNumber(revenueRatio)}%</span
        >
        YoY {revenueRatio > 0 ? "growth" : revenueRatio < 0 ? "shrinking" : ""}
        {#if epsRatio !== null}
          and earnings per share of
          <span class="font-semibold">{rawData?.epsEst}</span>, making a
          <span
            class="{epsRatio > 0
              ? "before:content-['+'] text-[#00FC50]"
              : 'text-[#FF2F1F]'} ">{epsRatio}%</span
          >
          {epsRatio > 0 ? "increase" : epsRatio < 0 ? "decrease" : ""} YoY.
        {:else}
          and earnings per share of
          <span class="font-semibold">{rawData?.epsEst}</span>.
        {/if}
      </div>
    </div>
  </div>
{/if}
