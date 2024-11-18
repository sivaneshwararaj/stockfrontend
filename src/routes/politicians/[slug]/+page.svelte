<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import { formatString, sectorNavigation, abbreviateNumber } from "$lib/utils";
  import republicanBackground from "$lib/images/bg-republican.png";
  import democraticBackground from "$lib/images/bg-democratic.png";
  import otherBackground from "$lib/images/bg-other.png";
  import Table from "$lib/components/Table/Table.svelte";

  export let data;
  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;

  let hedgeFundStats = data?.getHedgeFundsData;
  let rawData = data?.getPolitician?.output;
  let name = rawData?.history?.at(0)?.representative ?? "n/a";
  let numOfTrades = rawData?.history?.length;

  const typeCounts = rawData?.history?.reduce((counts, item) => {
    counts[item?.type] = (counts[item?.type] || 0) + 1;
    return counts;
  }, {});

  let buySellRatio =
    typeCounts["Bought"] > 0 && typeCounts["Sold"] === undefined
      ? 1
      : typeCounts["Bought"] === undefined
        ? 0
        : typeCounts["Bought"] / typeCounts["Sold"];

  let totalAmountTraded = rawData?.history?.reduce((sum, item) => {
    const amount = item?.amount;
    const parsedAmount = extractNumberFromAmount(amount);
    return sum + parsedAmount;
  }, 0);
  let politicianDistrict = data?.getPolitician?.politicianDistrict;
  let politicianCongress = data?.getPolitician?.politicianCongress;
  let lastTradedDate = rawData?.history?.at(0)?.transactionDate;

  let politicianParty = data?.getPolitician?.politicianParty;

  // Function to extract the number from the amount string
  function extractNumberFromAmount(amount) {
    const dashIndex = amount?.indexOf("-");
    if (dashIndex !== -1) {
      const numberAfterDash = amount?.slice(dashIndex + 1);
      const suffix = numberAfterDash?.slice(-1);
      let multiplier = 1;
      if (suffix === "K") {
        multiplier = 1e3;
      } else if (suffix === "M") {
        multiplier = 1e6;
      }
      const parsedNumber =
        parseFloat(numberAfterDash?.replace(/[^\d.]/g, "")) * multiplier;
      return isNaN(parsedNumber) ? 0 : parsedNumber;
    }
    return 0;
  }

  const excludedRules = new Set([
    "sharesNumber",
    "changeInSharesNumberPercentage",
    "marketValue",
    "avgPricePaid",
    "weight",
  ]);

  const defaultList = [
    { name: "Shares", rule: "sharesNumber" },
    { name: "% Change Shares", rule: "changeInSharesNumberPercentage" },
    { name: "Market Value", rule: "marketValue" },
    { name: "Avg Price", rule: "avgPricePaid" },
    { name: "% Weight", rule: "weight" },
  ];

  const specificRows = [
    { name: "Shares", rule: "sharesNumber", type: "int" },
    {
      name: "% Change Shares",
      rule: "changeInSharesNumberPercentage",
      type: "percentSign",
    },
    { name: "% Weight", rule: "weight", type: "percent" },
    { name: "Avg Price", rule: "avgPricePaid", type: "float" },
    { name: "Market Value", rule: "marketValue", type: "int" },
  ];
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Top
    Wall Street Hedge Funds · stocknear
  </title>
  <meta
    name="description"
    content={`A list of the top Wall Street hedge funds, ranked by their success rate and average return per rating.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`Top Wall Street hedge funds · stocknear`}
  />
  <meta
    property="og:description"
    content={`A list of the top Wall Street hedge funds, ranked by their success rate and average return per rating.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`Top Wall Street hedge funds · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`A list of the top Wall Street hedge funds, ranked by their success rate and average return per rating.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 px-4 lg:px-3 mb-20"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li>
        <a href="/politicians/flow-data" class="text-gray-300">Congress</a>
      </li>

      <li class="text-gray-300">{name}</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="w-full m-auto mt-12">
            <div class="items-center justify-between lg:flex">
              <div
                class="flex space-x-3 border-b-[2px] border-below-title pb-3 lg:border-none lg:pb-0"
              >
                <div class="flex-shrink-0">
                  <div
                    class="h-16 w-16 sm:h-20 sm:w-20 relative rounded-full {politicianParty ===
                    'Republican'
                      ? 'republican-striped bg-[#98272B]'
                      : politicianParty === 'Democratic'
                        ? 'democratic-striped bg-[#295AC7]'
                        : 'other-striped bg-[#20202E]'} flex items-center justify-center"
                  >
                    <img
                      style="clip-path: circle(50%);"
                      class="rounded-full w-12 sm:w-16"
                      src={`${cloudFrontUrl}/assets/senator/${name?.replace(/\s+/g, "_")}.png`}
                      loading="lazy"
                    />
                  </div>
                </div>
                <div class="mt-0 pt-0.5 text-left">
                  <h1 class="mb-0 text-xl sm:text-2xl font-bold text-white">
                    {formatString(name)}
                  </h1>
                  <p class="mb-0.5 text-sm font-semibold text-gray-300">
                    {politicianParty ?? "n/a"} / {politicianCongress}
                    {#if politicianDistrict !== undefined && politicianDistrict?.length !== 0}
                      / {politicianDistrict}
                    {/if}
                  </p>
                </div>
              </div>
              <div
                class="mt-4 grid grid-cols-2 overflow-hidden rounded border border-gray-600 py-2 text-center md:grid-cols-4 md:p-0 lg:mt-0 lg:border-none"
              >
                <div class="flex flex-col px-4 py-2 bp:px-6 md:py-6">
                  <div
                    class="text-xl sm:text-2xl font-bold tracking-tight text-white"
                  >
                    ${new Intl.NumberFormat("en", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(totalAmountTraded)}
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Total Amount Traded
                  </div>
                </div>

                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div
                    class="text-xl sm:text-2xl font-semibold tracking-tight text-white"
                  >
                    {numOfTrades?.toLocaleString("en-US")}
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Total Trades
                  </div>
                </div>

                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div
                    class="text-xl sm:text-2xl font-semibold tracking-tight text-white"
                  >
                    {lastTradedDate?.length !== undefined
                      ? new Date(lastTradedDate)?.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          daySuffix: "2-digit",
                        })
                      : "n/a"}
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Last Traded
                  </div>
                </div>
                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div
                    class="text-xl sm:text-2xl font-bold tracking-tight text-white"
                  >
                    {buySellRatio}
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Buy/Sell
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</section>

<style>
  .scroller {
    scrollbar-width: thin;
  }
  .app {
    height: 300px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 230px;
    }
  }

  .chart {
    width: 100%;
  }
  .republican-striped {
    background-image: repeating-linear-gradient(
      -45deg,
      #98272b,
      #98272b 10px,
      #840412 10px,
      #840412 20px
    );
  }

  .democratic-striped {
    background-image: repeating-linear-gradient(
      -45deg,
      #295ac7,
      #295ac7 10px,
      #164d9d 10px,
      #164d9d 20px
    );
  }

  .other-striped {
    background-image: repeating-linear-gradient(
      -45deg,
      #a4a6a8,
      #a4a6a8 10px,
      #c0c3c5 10px,
      #c0c3c5 20px
    );
  }
</style>
