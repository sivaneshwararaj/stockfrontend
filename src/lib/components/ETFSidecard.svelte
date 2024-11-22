<script lang="ts">
  import { etfTicker, stockTicker, cryptoTicker } from "$lib/store";
  import { formatETFName, formatString, abbreviateNumber } from "$lib/utils";
  import defaultLogo from "$lib/images/stocks/logo/default_logo.png";

  import { goto } from "$app/navigation";

  export let data;

  let info;
  let topHoldingList = [];
  let description = "";
  let website = "-";
  let snippet;

  let ipoDate = "n/a";
  let assetClass = "-";
  let provider = "-";
  let showFullText = false;
  let totalAssetPercentage = 0;

  let dividendHistoryList = [];
  let dividendYield;

  async function stockSelector(ticker: string) {
    if (ticker?.length !== 0 && !["BTC", "USD"]?.includes(ticker)) {
      window?.scroll({ top: 0, left: 0, behavior: "smooth" });
      stockTicker.update((value) => ticker);
      goto("/stocks/" + ticker + "/");
    } else if (ticker === "BTC") {
      window?.scroll({ top: 0, left: 0, behavior: "smooth" });
      cryptoTicker.update((value) => "BTCUSD");
      goto("/crypto/BTCUSD");
    }
  }

  $: {
    if ($etfTicker && typeof window !== "undefined") {
      info = data?.getETFProfile?.at(0);
      topHoldingList = data?.getETFHoldings?.holdings;
      dividendHistoryList = data?.getStockDividend?.history;
      dividendYield = data?.getStockDividend?.dividendYield;
      provider = info?.etfProvider;
      assetClass = info?.assetClass;
      ipoDate =
        info?.inceptionDate !== null
          ? new Date(info?.inceptionDate)?.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              daySuffix: "2-digit",
            })
          : "n/a";

      description =
        info?.description ??
        "A detailed description of the company is not yet available.";
      website = info?.website;
      snippet = description?.slice(0, 450) + "...";

      totalAssetPercentage = topHoldingList
        ?.slice(0, 5)
        ?.reduce((acc, current) => acc + current?.weightPercentage, 0)
        ?.toFixed(2);
    }
  }
</script>

<div class="px-0.5 lg:px-0">
  <h2 class="mb-2 text-2xl text-white font-semibold">
    About {$etfTicker}
  </h2>
  <p class="text-gray-200">
    {#if showFullText}
      {description}
    {:else}
      {snippet}
    {/if}
  </p>
  {#if description.length !== 0}
    <div class="inline-block">
      <label
        on:click={() => (showFullText = !showFullText)}
        class="w-full text-md mt-1 cursor-pointer font-medium sm:hover:text-white text-blue-400 sm:hover:underline"
      >
        {#if showFullText}
          [Show less]
        {:else}
          [Show more]
        {/if}
      </label>
    </div>
  {/if}

  <div
    class="mt-3 grid grid-cols-2 gap-3 w-full border-b border-gray-600 lg:border-none pb-8 lg:pb-0"
  >
    <div class="col-span-1 text-gray-200">
      <span class="block font-semibold">Asset Class</span>
      <span class=" text-white">{assetClass}</span>
    </div>
    <div class="col-span-1 text-gray-200">
      <span class="block font-semibold">Ticker Symbol</span>
      {$etfTicker}
    </div>
    <div class="col-span-1 text-gray-200">
      <span class="block font-semibold">Inception Date</span>
      <span>{ipoDate}</span>
    </div>
    <div class="col-span-1 text-gray-200">
      <span class="block font-semibold">Provider</span>
      <a
        href={`/etf/etf-providers/${provider}`}
        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
        >{formatETFName(provider)}</a
      >
    </div>

    <div class="col-span-1 whitespace-nowrap text-gray-200">
      <span class="block font-semibold">Website</span>
      <a
        href={website}
        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
        target="_blank">Fund Home Page</a
      >
    </div>
  </div>
</div>

{#if topHoldingList?.length !== 0}
  <div
    class="space-y-3 sm:pt-5 hidden sm:block sm:{(topHoldingList?.length ?? [])
      ?.length !== 0
      ? ''
      : 'hidden'}"
  >
    <div class="h-auto w-full">
      <!--Start Content-->
      <div class="w-auto lg:w-full flex flex-col m-auto">
        <h2
          class="mb-2 text-2xl text-white font-semibold flex flex-row items-center"
        >
          <span>Top Holdings</span>
          <span class="text-white font-semibold ml-auto text-sm">
            {totalAssetPercentage}% of assets
          </span>
        </h2>

        <div class="mt-2 w-full">
          <table class="table table-sm table-compact w-full">
            <thead>
              <tr>
                <th
                  class="text-white font-semibold text-sm text-start bg-[#000] lg:bg-[#09090B]"
                  >Company</th
                >

                <th
                  class="text-white font-semibold text-sm text-end bg-[#000] lg:bg-[#09090B]"
                  >Portfolio</th
                >
              </tr>
            </thead>
            <tbody>
              {#each topHoldingList?.slice(0, 5) as item}
                {#if item?.symbol !== null}
                  <tr
                    on:click={() => stockSelector(item?.symbol)}
                    class="lg:shake-ticker sm:hover:text-white text-blue-400 cursor-pointer lg:hover:bg-[#245073] lg:hover:bg-opacity-[0.2] bg-[#000] lg:bg-[#09090B] border-b border-[#000] lg:border-[#27272A]"
                  >
                    <td class="">
                      <div class="flex flex-row items-center">
                        <div
                          class="rounded-full w-10 h-10 relative flex items-center justify-center"
                        >
                          <img
                            style="clip-path: circle(50%);"
                            class="w-6 h-6 rounded-full"
                            src={item?.symbol?.length !== 0
                              ? `https://financialmodelingprep.com/image-stock/${item?.symbol}.png`
                              : defaultLogo}
                            loading="lazy"
                          />
                        </div>
                        <div class="flex flex-col ml-3 w-full">
                          <span class="text-sm font-medium"
                            >{item?.symbol ?? "-"}</span
                          >
                          <span class="text-white text-sm">
                            {#if typeof item?.name !== "undefined"}
                              {item?.name?.length > 20
                                ? formatString(item?.name?.slice(0, 20)) + "..."
                                : formatString(item?.name)}
                            {:else}
                              n/a
                            {/if}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td class="text-white font-semibold text-end">
                      {abbreviateNumber(item?.weightPercentage?.toFixed(2))}%
                    </td>
                  </tr>
                {/if}
              {/each}
            </tbody>
          </table>
        </div>

        <a
          href={`/etf/${$etfTicker}/holdings`}
          class="rounded cursor-pointer w-full m-auto py-2 h-full mt-6 text-lg text-center font-semibold text-black sm:hover:hover:bg-gray-300 bg-[#ffff] transition duration-100"
        >
          All Holdings
        </a>
      </div>
    </div>
  </div>
{/if}

{#if dividendHistoryList?.length !== 0}
  <div
    class="space-y-3 sm:pt-5 hidden sm:block sm:{(
      dividendHistoryList?.length ?? []
    )?.length !== 0
      ? ''
      : 'hidden'}"
  >
    <div class="h-auto w-full">
      <!--Start Content-->
      <div class="w-auto lg:w-full flex flex-col m-auto">
        <h2
          class="mb-2 text-2xl text-white font-semibold flex flex-row items-center"
        >
          <span>Dividends</span>
          <span class="text-white font-semibold ml-auto text-sm">
            Dividend Yield {dividendYield ?? "0"}%
          </span>
        </h2>

        <div class="mt-2 w-full">
          <table class="table table-sm table-compact text-start flex w-full">
            <thead>
              <tr>
                <th
                  class="text-white font-semibold text-sm text-start bg-[#000] lg:bg-[#09090B]"
                  >Ex-Dividend</th
                >
                <th
                  class="text-white font-semibold text-sm text-end bg-[#000] lg:bg-[#09090B]"
                  >Payment Date</th
                >
                <th
                  class="text-white font-semibold text-sm text-end bg-[#000] lg:bg-[#09090B]"
                  >Amount</th
                >
              </tr>
            </thead>

            <tbody>
              {#each dividendHistoryList?.slice(0, 5) as item}
                <tr
                  class="text-white bg-[#000] lg:bg-[#09090B] border-b border-[#000] lg:border-[#27272A]"
                >
                  <td class="text-start text-sm text-white font-medium">
                    {new Date(item?.date)?.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      daySuffix: "2-digit",
                    })}
                  </td>

                  <td class="text-end text-sm text-white font-medium">
                    {item?.paymentDate?.length !== 0
                      ? new Date(item?.paymentDate)?.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          daySuffix: "2-digit",
                        })
                      : "n/a"}
                  </td>

                  <td class="text-end text-sm text-white font-medium">
                    ${item?.adjDividend?.toFixed(2)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <a
          href={`/etf/${$etfTicker}/dividends`}
          class="rounded cursor-pointer w-full m-auto py-2 h-full mt-6 text-lg text-center font-semibold text-black sm:hover:hover:bg-gray-300 bg-[#ffff] transition duration-100"
        >
          Full Dividend History
        </a>
      </div>
    </div>
  </div>
{/if}
