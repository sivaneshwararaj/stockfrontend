<script lang="ts">
  import {
    taRatingComponent,
    stockTicker,
    etfTicker,
    cryptoTicker,
    assetType,
    getCache,
    setCache,
  } from "$lib/store";
  import SignalBar from "$lib/components/SignalBar.svelte";
  import InfoModal from "$lib/components/InfoModal.svelte";

  export let data;

  let rawData = [];
  let isLoaded = false;
  let signalList = [];
  let showFullStats = false;
  let overallSignal = "n/a";
  let buyCount = 0;
  let sellCount = 0;
  let neutralCount = 0;

  const modalContent = `
    Momentum indicators gauge the speed at which a financial instrument's price is changing, indicating the strength of its recent price movements.<br><br>
    On the other hand, trend indicators help identify the direction in which the price of an asset is moving over time, highlighting whether it's in an upward, downward, or sideways trend.<br><br>
    Together, these indicators assist in evaluating the overall market sentiment and potential future price movements.
  `;

  async function getTaRating(ticker) {
    const cachedData = getCache(ticker, "getTaRating");
    if (cachedData) {
      rawData = cachedData;
    } else {
      try {
        const response = await fetch("/api/ticker-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticker: ticker, path: "stock-rating" }),
        });
        rawData = await response?.json();

        setCache(ticker, rawData, "getTaRating");
      } catch (error) {
        console.error("Failed to fetch swap data:", error);
        rawData = {};
      }
    }
    if (Object?.keys(rawData)?.length !== 0) {
      $taRatingComponent = true;
    } else {
      $taRatingComponent = false;
    }
  }

  async function updateData() {
    if (
      ($assetType === "stock"
        ? $stockTicker
        : $assetType === "etf"
          ? $etfTicker
          : $cryptoTicker) &&
      typeof window !== "undefined"
    ) {
      isLoaded = false;
      const ticker =
        $assetType === "stock"
          ? $stockTicker
          : $assetType === "etf"
            ? $etfTicker
            : $cryptoTicker;

      try {
        await getTaRating(ticker);
        showFullStats = false;
        overallSignal = rawData?.overallSignal;
        signalList = rawData?.signalList || [];
        buyCount = 0;
        sellCount = 0;
        neutralCount = 0;

        signalList?.forEach((item) => {
          switch (item?.signal) {
            case "Strong Buy":
            case "Buy":
              buyCount++;
              break;
            case "Sell":
            case "Strong Sell":
              sellCount++;
              break;
            default:
              neutralCount++;
          }
        });

        isLoaded = true;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }

  $: if ($assetType || $stockTicker || $etfTicker || $cryptoTicker) {
    updateData();
  }
</script>

<section class="overflow-hidden w-full">
  <main>
    <div class="flex flex-row items-center">
      <label
        for="technicalIndicatorInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold"
      >
        TA Indicators
      </label>
      <InfoModal
        title={"TA Indicators"}
        content={modalContent}
        id={"technicalIndicatorInfo"}
      />
    </div>

    {#if isLoaded}
      {#if signalList?.length !== 0}
        {#if overallSignal !== "n/a"}
          <div class="text-white text-[1rem] sm:text-lg mt-3 mb-8 text-start">
            Out of 11 indicators, <span class="font-semibold text-[#00FC50]"
              >{buyCount}</span
            >
            indicates a Buy,
            <span class="font-semibold text-[#F8901E]">{neutralCount}</span> are
            Neutral and
            <span class="font-semibold text-[#FF2F1F]">{sellCount}</span>
            indicate a Sell. On average, the signal is to
            {#if overallSignal === "Buy" || overallSignal === "Strong Buy"}
              <span class="text-[#00FC50] sm:font-medium">
                <svg
                  class="w-7 h-7 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  ><g
                    fill="none"
                    stroke="#00FC50"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    ><path d="m3 17l6-6l4 4l8-8" /><path d="M17 7h4v4" /></g
                  ></svg
                >
                Buy.
              </span>
            {:else if overallSignal === "Neutral"}
              <span class="text-[#E57C34] sm:font-medium">
                <svg
                  class="w-7 h-7 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  ><path fill="#e57c34" d="m22 12l-4-4v3H3v2h15v3l4-4Z" /></svg
                >
                Hold.
              </span>
            {:else if overallSignal === "Sell" || overallSignal === "Strong Sell"}
              <span class="text-[#FF2F1F] sm:font-medium">
                <svg
                  class="w-7 h-7 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  ><path
                    fill="#ff2f1f"
                    d="M244 136v64a12 12 0 0 1-12 12h-64a12 12 0 0 1 0-24h35l-67-67l-31.51 31.52a12 12 0 0 1-17 0l-72-72a12 12 0 0 1 17-17L96 127l31.51-31.52a12 12 0 0 1 17 0L220 171v-35a12 12 0 0 1 24 0Z"
                  /></svg
                >
                Sell.
              </span>
            {:else}
              <span class="text-[#FF2F1F] sm:font-medium"> n/a. </span>
            {/if}
          </div>
        {/if}

        <!--Start Momentum Indicators-->
        <div class="w-full overflow-x-scroll">
          <table class="table table-sm table-compact w-full mb-5 mt-5">
            <!-- head -->
            <thead>
              <tr>
                <th
                  class="text-white text-sm font-medium bg-default font-semibold"
                  >Name</th
                >
                <th
                  class="text-white text-sm font-medium bg-default font-semibold text-end"
                  >Value</th
                >
                <th
                  class="text-white text-sm font-medium bg-default font-semibold text-end"
                  >Signal</th
                >
              </tr>
            </thead>
            <tbody>
              {#each showFullStats ? signalList : signalList?.slice(0, 3) as item, index}
                <tr
                  class="border-y border-gray-800 odd:bg-odd sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] bg-default border-b-[#09090B] {index ===
                    2 &&
                  !showFullStats &&
                  signalList?.length > 2
                    ? 'opacity-[0.3]'
                    : ''}"
                >
                  <td class="text-white text-sm sm:text-[1rem]">
                    {item?.name}
                  </td>

                  <td class="text-white text-end">
                    <span class="text-white text-sm sm:text-[1rem] font-medium">
                      {item?.value}
                    </span>
                  </td>

                  <td class="text-white">
                    <SignalBar signal={item?.signal} />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <label
          on:click={() => (showFullStats = !showFullStats)}
          class="{signalList?.length < 4
            ? 'hidden'
            : ''} cursor-pointer m-auto flex justify-center items-center mt-5"
        >
          <svg
            class="w-10 h-10 transform {showFullStats ? 'rotate-180' : ''} "
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            ><path
              fill="#2A323C"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 13.5L7.5 11l1.42-1.41L12 12.67l3.08-3.08L16.5 11L12 15.5z"
            /></svg
          >
        </label>
        <!--End Momentum Indicators-->
      {/if}
    {:else}
      <div class="flex justify-center items-center h-80">
        <div class="relative">
          <label
            class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <span class="loading loading-spinner loading-md text-gray-400"
            ></span>
          </label>
        </div>
      </div>
    {/if}
  </main>
</section>
