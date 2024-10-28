<script lang="ts">
  import { stockTicker, screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  export let data;

  let info;

  let sector = "-";
  let industry = "-";
  let exchange = "-";
  let employees = "-";
  let description = "";
  let website = "-";
  let snippet;

  let buyCount = 0;
  let holdCount = 0;
  let sellCount = 0;
  let priceTarget = "n/a";
  let numOfAnalyst = 0;
  let consensusRating = "n/a";
  let changesPercentage = 0;

  let showFullText = false;

  const sectorNavigation = [
    {
      title: "Financial Services",
      link: "/list/financial-sector",
    },
    {
      title: "Finance",
      link: "/list/financial-sector",
    },
    {
      title: "Healthcare",
      link: "/list/healthcare-sector",
    },
    {
      title: "Technology",
      link: "/list/technology-sector",
    },
    {
      title: "Industrials",
      link: "/list/industrials-sector",
    },
    {
      title: "Energy",
      link: "/list/energy-sector",
    },
    {
      title: "Utilities",
      link: "/list/utilities-sector",
    },
    {
      title: "Consumer Cyclical",
      link: "/list/consumer-cyclical-sector",
    },
    {
      title: "Real Estate",
      link: "/list/real-estate-sector",
    },
    {
      title: "Basic Materials",
      link: "/list/basic-materials-sector",
    },
    {
      title: "Communication Services",
      link: "/list/communication-services-sector",
    },
    {
      title: "Consumer Defensive",
      link: "/list/consumer-defensive-sector",
    },
  ];

  function getIndustryHref(industryName) {
    // Replace spaces with hyphens
    let formattedName = industryName?.replace(/ /g, "-");
    // Replace "&" with "and"
    formattedName = formattedName?.replace(/&/g, "and");
    // Remove any extra hyphens (e.g., from consecutive spaces)
    formattedName = formattedName?.replace(/-{2,}/g, "-");
    // Convert to lowercase for consistency
    return "/list/industry/" + formattedName?.toLowerCase();
  }

  $: {
    if ($stockTicker && typeof window !== "undefined") {
      info = data?.getStockDeck?.at(0);

      //ceoName = info?.ceoName?.length !== 0 ? getAbbreviatedName(info?.ceoName) : "-";
      sector = info?.sector ?? "-";
      industry = info?.industry ?? "-";
      exchange = info?.exchange;
      employees = info?.fullTimeEmployees ?? "-";
      //country = info?.country ?? "-";
      description =
        info?.description ??
        "A detailed description of the company is not yet available.";
      website = info?.website;
      snippet = description?.slice(0, 450) + "...";

      numOfAnalyst = data?.getAnalystRating?.numOfAnalyst;
      buyCount = ((data?.getAnalystRating?.Buy / numOfAnalyst) * 100)?.toFixed(
        2,
      );
      holdCount = (
        (data?.getAnalystRating?.Hold / numOfAnalyst) *
        100
      )?.toFixed(2);
      sellCount = (
        (data?.getAnalystRating?.Sell / numOfAnalyst) *
        100
      )?.toFixed(2);
      priceTarget =
        data?.getAnalystRating?.priceTarget !== ("n/a" && 0)
          ? data?.getAnalystRating?.priceTarget
          : "-";
      consensusRating = data?.getAnalystRating?.consensusRating;

      try {
        changesPercentage =
          ((priceTarget / data?.getStockQuote?.price - 1) * 100)?.toFixed(2) ??
          0;
      } catch (e) {
        changesPercentage = 0;
      }
    }
  }
</script>

<div class="px-0.5 lg:px-0">
  <h2 class="mb-2 text-2xl text-white font-semibold">
    About {$stockTicker}
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

  <div class="mt-3 grid grid-cols-2 gap-3 w-full">
    <div class="col-span-1 text-gray-200">
      <span class="block font-semibold">Industry</span>
      <a
        href={getIndustryHref(industry)}
        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
        >{industry}</a
      >
    </div>
    <div class="col-span-1 text-gray-200">
      <span class="block font-semibold">Sector</span>
      <a
        href={sectorNavigation?.find((item) => item?.title === sector)?.link}
        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
        >{sector}</a
      >
    </div>
    <div class="col-span-1 text-gray-200">
      <span class="block font-semibold">IPO Date</span>
      <span>Jan 22, 1999</span>
    </div>
    <div class="col-span-1 text-gray-200">
      <span class="block font-semibold">Employees</span>
      <a
        href={`/stocks/${$stockTicker}/statistics/employees`}
        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
        >{new Intl.NumberFormat("en")?.format(employees)}</a
      >
    </div>
    <div class="col-span-1 text-gray-200">
      <span class="block font-semibold">Stock Exchange</span>
      <span>{exchange}</span>
    </div>
    <div class="col-span-1 text-gray-200">
      <span class="block font-semibold">Ticker Symbol</span>
      <span>{$stockTicker}</span>
    </div>
    <div class="col-span-1 whitespace-nowrap text-gray-200">
      <span class="block font-semibold">Website</span>
      <a
        href={website}
        class="hover:sm:text-white truncate text-blue-400"
        target="_blank">{website}</a
      >
    </div>
  </div>
</div>

{#if Object?.keys(data?.getAnalystRating ?? {})?.length !== 0}
  <div
    class="space-y-3 sm:pt-5 hidden sm:block sm:{Object?.keys(
      data?.getAnalystRating ?? {},
    )?.length !== 0
      ? ''
      : 'hidden'}"
  >
    <div class="h-auto w-full">
      <!--Start Content-->
      <div class="w-auto lg:w-full flex flex-col m-auto pb-14 sm:pb-10">
        <h2 class="mb-2 text-2xl text-white font-semibold">Analyst Forecast</h2>
        <p class="text-gray-200">
          According to {numOfAnalyst} analysts, the average rating for NVDA stock
          is "{consensusRating}." The 12-month stock price forecast is ${priceTarget},
          which is {changesPercentage > 0 ? "an increase" : "a decrease"} of {changesPercentage}%
          from the latest price.
        </p>

        <div class="mt-5 w-full m-auto flex justify-center items-center mb-5">
          <div class="flex flex-col items-center w-full">
            <!--Start Progress-->

            <div class="flex flex-col items-center w-full">
              <div class="flex flex-row items-center w-full mt-5 mb-2">
                <span class="text-white font-medium text-start mr-auto">
                  Buy
                </span>
                <span class="text-white text-md font-medium ml-auto">
                  {buyCount}%
                </span>
              </div>
              <progress
                class="progress bg-[#3B3D3F] w-full [&::-webkit-progress-value]:bg-[#37C97D] [&::-moz-progress-bar]:bg-[#37C97D]"
                value={buyCount}
                max="100"
              ></progress>
            </div>

            <div class="flex flex-col items-center w-full">
              <div class="flex flex-row items-center w-full mt-5 mb-2">
                <span class="text-white font-medium text-start mr-auto">
                  Hold
                </span>
                <span class="text-white text-md font-medium ml-auto">
                  {holdCount}%
                </span>
              </div>
              <progress
                class="progress bg-[#3B3D3F] w-full [&::-webkit-progress-value]:bg-[#fff] [&::-moz-progress-bar]:bg-[#fff]"
                value={holdCount}
                max="100"
              ></progress>
            </div>

            <div class="flex flex-col items-center w-full">
              <div class="flex flex-row items-center w-full mt-5 mb-2">
                <span class="text-white font-medium text-start mr-auto">
                  Sell
                </span>
                <span class="text-white text-md font-medium ml-auto">
                  {sellCount}%
                </span>
              </div>
              <progress
                class="progress bg-[#3B3D3F] w-full [&::-webkit-progress-value]:bg-[#FF2F1F] [&::-moz-progress-bar]:bg-[#FF2F1F]"
                value={sellCount}
                max="100"
              ></progress>
            </div>

            <!--End Progress-->
          </div>
        </div>

        <a
          href={`/stocks/${$stockTicker}/forecast/analyst`}
          class="rounded cursor-pointer w-full m-auto py-2 h-full mt-6 text-lg text-center font-bold text-white hover:bg-purple-700 bg-purple-600 transition duration-100"
        >
          Stock Forecasts
        </a>
      </div>
    </div>
  </div>
{/if}
