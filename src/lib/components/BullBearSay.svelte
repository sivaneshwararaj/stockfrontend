<script lang="ts">
  import { stockTicker, displayCompanyName } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";

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
    const differenceInDays = Math?.floor(
      differenceInMs / (1000 * 60 * 60 * 24),
    );

    // Return the difference in days
    return differenceInDays <= 1;
  }

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
    if ($stockTicker && typeof window !== "undefined") {
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
            <label
              for="bullBearCase"
              class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold"
            >
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
      <div
        class="bg-[#313131] w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 -mt-2"
      >
        {#each tabs as item, i}
          <button
            on:click={() => handleMode(i)}
            class="group relative z-[1] rounded-full px-6 py-1 {activeIdx === i
              ? 'z-0'
              : ''} "
          >
            {#if activeIdx === i}
              <div class="absolute inset-0 rounded-md bg-[#fff]"></div>
            {/if}
            <span
              class="relative text-sm block font-semibold {activeIdx === i
                ? 'text-black'
                : 'text-white'}"
            >
              {item.title}
              <svg
                class="{data?.user?.tier !== 'Pro' && i === 1
                  ? ''
                  : 'hidden'} inline-block ml-1 -mt-0.5 w-3.5 h-3.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                ><path
                  fill="#A3A3A3"
                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                /></svg
              >
            </span>
          </button>
        {/each}
      </div>

      <!--End Header-->
      <span class="text-white text-xs sm:text-sm italic mt-6 sm:ml-auto">
        <label
          class="{latestInfoDate(rawData?.date)
            ? ''
            : 'hidden'} text-black bg-[#fff] mr-2 font-semibold not-italic text-xs rounded px-2 py-0.5"
          >New</label
        >
        Updated {rawData?.date}
      </span>
      <div class="flex mt-5 h-auto">
        <div
          class="{activeIdx === 0
            ? 'bg-[#00FC50]'
            : 'bg-[#FF2F1F]'} w-full max-w-[3px] rounded-l-xl"
        />
        <span class="text-gray-100 ml-3 text-[1rem] w-full">
          {#if activeIdx === 0}
            <p class="pr-1">{rawData?.bullSays}</p>
          {:else if data?.user?.tier === "Pro"}
            <p class="pr-1">{rawData?.bearSays}</p>
          {:else}
            <div
              class="bg-[#111112] sm:bg-opacity-[0.5] text-sm sm:text-[1rem] rounded-md w-full p-4 min-h-24 mt-4 text-white m-auto flex justify-center items-center text-center font-semibold"
            >
              <svg
                class="mr-1.5 w-5 h-5 inline-block"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                ><path
                  fill="#A3A3A3"
                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                /></svg
              >
              Unlock content with
              <a
                class="inline-block ml-2 text-blue-400 hover:sm:text-white"
                href="/pricing">Pro Subscription</a
              >
            </div>
          {/if}
        </span>
      </div>
    </div>
  </div>
{/if}
