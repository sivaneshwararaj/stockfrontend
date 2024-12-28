<script>
  import { numberOfUnreadNotification } from "$lib/store";

  import ArrowLogo from "lucide-svelte/icons/move-up-right";
</script>

<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Market
    Tide · Stocknear</title
  >
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <!-- Other meta tags -->
  <meta property="og:title" content="Market Tide · Stocknear" />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Market Tide · Stocknear" />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Learning Center</li>
      <li class="text-gray-300">Market Tide</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5 text-white">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Market Tide
            </h1>
          </div>

          <div class="w-full bg-default m-auto text-white">
            <h2 class="text-xl font-semibold mb-4">
              Daily Aggregated Premium and Volume Indicator
            </h2>
            <p class="mb-4">
              This indicator measures the daily aggregated premium and volume of
              option trades. It calculates the difference between the value of
              options transacted at or near the <span
                class="uppercase font-semibold">ask</span
              >
              price and those transacted at or near the
              <span class="uppercase font-semibold">bid</span> price.
            </p>

            <div class="bg-table p-5 rounded-md mb-5">
              <p>
                Example: If $15,000 in calls are transacted at the <span
                  class="uppercase font-semibold">ask</span
                >
                price and $10,000 at the
                <span class="uppercase font-semibold">bid</span>
                price, the aggregated call
                <span class="text-[#00FC50] font-semibold uppercase"
                  >premium</span
                > is:
              </p>
              <p class="font-mono mt-2">$15,000 - $10,000 = $5,000</p>
            </div>

            <div class="bg-table p-5 rounded-md mb-5">
              <p>
                Example: If $10,000 in puts are transacted at the <span
                  class="uppercase font-semibold">ask</span
                >
                price and $20,000 at the
                <span class="uppercase font-semibold">bid</span>
                price, the aggregated put
                <span class="text-[#FF2F1F] font-semibold uppercase"
                  >premium</span
                > is:
              </p>
              <p class="font-mono mt-2">$10,000 - $20,000 = -$10,000</p>
            </div>

            <p class="mb-4">
              More calls bought at the <span class="uppercase font-semibold"
                >ask</span
              >
              suggest bullish sentiment, while more puts bought at the
              <span class="uppercase font-semibold">ask</span> suggest bearish sentiment.
              If both lines are close, the sentiment is neutral. Diverging trends
              indicate increasing bullish or bearish sentiment.
            </p>

            <div class="bg-table p-5 rounded-md mb-5">
              <h3 class="font-semibold mb-3">
                Indicators of Bearish Sentiment
              </h3>
              <ul class="list-disc pl-5 space-y-2">
                <li>
                  Aggregated call <span
                    class="text-[#00FC50] font-semibold uppercase">premium</span
                  > decreases rapidly.
                </li>
                <li>
                  Aggregated put <span
                    class="text-[#FF2F1F] font-semibold uppercase">premium</span
                  > increases rapidly.
                </li>
              </ul>
            </div>

            <p class="mb-4">
              Volume is calculated as the difference between aggregated call and
              put volumes. This method uses the same principles as premium
              calculations.
            </p>

            <div class="bg-table p-5 rounded-md">
              <p>
                Example: If 10,000 more calls and 5,000 more puts are transacted
                at the <span class="uppercase font-semibold">ask</span> compared
                to the <span class="uppercase font-semibold">bid</span>, the
                aggregated volume is:
              </p>
              <p class="font-mono mt-2">10,000 - 5,000 = 5,000</p>
              <p class="mt-2">
                Since not all options are priced equally, premium must be
                considered alongside volume for a clearer picture.
              </p>
            </div>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-primary sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/pricing"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Pro Subscription
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Upgrade now for unlimited access to all data and tools.
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-primary sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/donation"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Market Flow
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                High level options overview of the market
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-primary sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/contact"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Options Flow
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get realtime options flow and customize your screener
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
