<script lang="ts">
  import Lazy from "$lib/components/Lazy.svelte";
  import ReturnCard from "$lib/components/ReturnCard.svelte";
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    screenWidth,
    stockTicker,
    revenueSegmentationComponent,
  } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";

  export let data;

  let quantStats = {};

  // Function to check if a date is today or yesterday, adjusting for weekends
  function ongoingDD(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Adjust today to Friday if it's Saturday or Sunday
    if (today.getDay() === 6) {
      // Saturday
      today.setDate(today.getDate() - 1); // Set to Friday
    } else if (today.getDay() === 0) {
      // Sunday
      today.setDate(today.getDate() - 2); // Set to Friday
    }

    return (
      (date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()) ||
      (date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear())
    );
  }

  /*
let progressDayPriceValue = 0;
let progressYearPriceValue = 0;
let totalDuration = 500;
           
async function updateDayRange() {

const interval = 10; // interval between each update in ms
const increment = (currentPrice / (totalDuration / interval));

if (progressDayPriceValue < currentPrice) {
    progressDayPriceValue = progressDayPriceValue + increment;
    setTimeout(updateDayRange, interval);
}
};


async function updateYearRange() {

const interval = 10; // interval between each update in ms
const increment = (currentPrice / (totalDuration / interval));

if (progressYearPriceValue < currentPrice) {
    progressYearPriceValue = progressYearPriceValue + increment;
    setTimeout(updateYearRange, interval);
}
};
        
*/

  quantStats = data?.getQuantStats ?? {};

  /*
updateDayRange()
updateYearRange()
*/
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Statistics & Valuation Metrics ·
    stocknear
  </title>
  <meta
    name="description"
    content={`Detailed statistics for ${$displayCompanyName} (${$stockTicker}) stock, including valuation, metrics, financial numbers, share information and more.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Statistics & Valuation Metrics · stocknear`}
  />
  <meta
    property="og:description"
    content={`Detailed statistics for ${$displayCompanyName} (${$stockTicker}) stock, including valuation, metrics, financial numbers, share information and more.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Statistics & Valuation Metrics · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Detailed statistics for ${$displayCompanyName} (${$stockTicker}) stock, including valuation, metrics, financial numbers, share information and more.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="text-white w-full">
  <div class="sm:pb-7 sm:pt-7 sm:pl-7 m-auto mt-7 sm:mt-0">
    <div class="mb-6">
      {#if Object?.keys(quantStats)?.length !== 0}
        <div
          class="space-y-5 xs:space-y-6 lg:grid 2xl:grid-cols-2 lg:space-x-6 2xl:space-x-10 lg:space-y-0"
        >
          <div class="flex flex-col space-y-5 xs:space-y-6 lg:space-y-8">
            <div
              class="-mb-2 flex items-start justify-between border-b border-gray-500 md:-mb-4"
            >
              <h1 class="mb-3 text-2xl font-bold">Tesla Statistics</h1>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Total Valuation
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white xs:text-[1.05rem] lg:leading-normal"
              >
                Tesla has a market cap or net worth of $832.14 billion. The
                enterprise value is $812.05 billion.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><a
                        class="dothref text-default"
                        href="/stocks/tsla/market-cap/">Market Cap</a
                      ></td
                    >
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="832,139,935,299">832.14B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Enterprise Value</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="812,053,935,299">812.05B</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Important Dates
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                The last earnings date was Wednesday, October 23, 2024, after
                market close.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Earnings Date</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="Oct 23, 2024">Oct 23, 2024</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Ex-Dividend Date</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="n/a">n/a</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Share Statistics
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                Tesla has 3.19 billion shares outstanding. The number of shares
                has increased by 0.31% in one year.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Shares Outstanding</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="3,194,640,415">3.19B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Shares Change (YoY)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="0.309%">+0.31%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Shares Change (QoQ)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="0.460%">+0.46%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Owned by Insiders (%)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="12.963%">12.96%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Owned by Institutions (%)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="45.989%">45.99%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Float</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="2,777,647,654">2.78B</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Valuation Ratios
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                The trailing PE ratio is 71.41 and the forward PE ratio is
                86.99. Tesla's PEG ratio is 5.94.
              </p>

              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PE Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="71.411">71.41</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Forward PE</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="86.986">86.99</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PS Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="8.552">8.55</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Forward PS</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="7.500">7.50</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PB Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="11.945">11.95</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>P/FCF Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="230.510">230.51</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PEG Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="5.941">5.94</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials/ratios`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-lg text-center font-semibold text-white m-auto hover:bg-purple-700 bg-purple-600 transition duration-100"
              >
                Financial Ratio History
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Enterprise Valuation
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                The stock's EV/EBITDA ratio is 61.31, with an EV/FCF ratio of
                224.95.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / Earnings</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="63.73">63.73</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / Sales</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="8.36">8.36</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / EBITDA</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="61.31">61.31</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / EBIT</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="99.76">99.76</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / FCF</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="224.95">224.95</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Financial Position
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                The company has a current ratio of 1.84, with a Debt / Equity
                ratio of 0.18.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Current Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="1.844">1.84</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Quick Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="1.214">1.21</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Debt / Equity</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="0.18">0.18</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Debt / EBITDA</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="0.87">0.87</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Debt / FCF</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="3.54">3.54</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Interest Coverage</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="25.841">25.84</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Financial Efficiency
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                Return on equity (ROE) is 20.39% and return on invested capital
                (ROIC) is 6.96%.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Return on Equity (ROE)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="20.389%">20.39%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Return on Assets (ROA)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="4.759%">4.76%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Return on Capital (ROIC)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="6.961%">6.96%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Revenue Per Employee</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="691,592">$691,592</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Profits Per Employee</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="90,715">$90,715</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><a
                        class="dothref text-default"
                        href="/stocks/tsla/employees/">Employee Count</a
                      ></td
                    >
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="140,473">140,473</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Asset Turnover</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="0.909">0.91</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Inventory Turnover</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="5.624">5.62</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">Taxes</h2>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Income Tax</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="-4.35B">-4.35B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Effective Tax Rate</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="n/a">n/a</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
          </div>
          <div class="flex flex-col space-y-5 xs:space-y-6 lg:space-y-8">
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Stock Price Statistics
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                The stock price has increased by +22.82% in the last 52 weeks.
                The beta is 2.30, so Tesla's price volatility has been higher
                than the market average.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Beta (5Y)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="2.297">2.30</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>52-Week Price Change</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="22.82%">+22.82%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>50-Day Moving Average</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="229.468">229.47</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>200-Day Moving Average</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="201.395">201.40</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Relative Strength Index (RSI)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="64.905">64.91</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Average Volume (20 Days)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="79,477,783">79,477,783</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Short Selling Information
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                The latest short interest is 74.33 million, so 2.33% of the
                outstanding shares have been sold short.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short Interest</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="74,332,630">74.33M</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short Previous Month</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="77,219,507">77.22M</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short % of Shares Out</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="2.327%">2.33%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short % of Float</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="2.676%">2.68%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short Ratio (days to cover)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="0.930">0.93</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Income Statement
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                In the last 12 months, Tesla had revenue of $97.15 billion and
                earned $12.74 billion in profits. Earnings per share was $3.65.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><a
                        class="dothref text-default"
                        href="/stocks/tsla/revenue/">Revenue</a
                      ></td
                    >
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="97,150,000,000">97.15B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Gross Profit</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="17,709,000,000">17.71B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Operating Income</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="8,140,000,000">8.14B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Pretax Income</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="7,605,000,000">7.61B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Net Income</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="12,743,000,000">12.74B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBITDA</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="13,244,000,000">13.24B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBIT</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="8,140,000,000">8.14B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Earnings Per Share (EPS)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="3.648">$3.65</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-lg text-center font-semibold text-white m-auto hover:bg-purple-700 bg-purple-600 transition duration-100"
              >
                Full Income Statement
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Balance Sheet
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                The company has $33.65 billion in cash and $12.78 billion in
                debt, giving a net cash position of $20.87 billion or $6.53 per
                share.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Cash &amp; Cash Equivalents</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="33,648,000,000">33.65B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Total Debt</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="12,783,000,000">12.78B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Net Cash</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="20,865,000,000">20.87B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Net Cash Per Share</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="6.531">$6.53</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Equity (Book Value)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="70,710,000,000">70.71B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Book Value Per Share</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="21.806">21.81</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Working Capital</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="25,802,000,000">25.80B</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials/balance-sheet`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-lg text-center font-semibold text-white m-auto hover:bg-purple-700 bg-purple-600 transition duration-100"
              >
                Full Balance Sheet
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Cash Flow
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                In the last 12 months, operating cash flow was $14.48 billion
                and capital expenditures -$10.87 billion, giving a free cash
                flow of $3.61 billion.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Operating Cash Flow</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="14,479,000,000">14.48B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Capital Expenditures</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="-10,869,000,000">-10.87B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Free Cash Flow</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="3,610,000,000">3.61B</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>FCF Per Share</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="1.130">$1.13</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials/cash-flow`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-lg text-center font-semibold text-white m-auto hover:bg-purple-700 bg-purple-600 transition duration-100"
              >
                Full Cash Flow Statement
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">Margins</h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white dark:text-dark-200 xs:text-[1.05rem] lg:leading-normal"
              >
                Gross margin is 18.23%, with operating and profit margins of
                8.38% and 13.07%.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Gross Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="18.229%">18.23%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Operating Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="8.379%">8.38%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Pretax Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="8.662%">8.66%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Profit Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="13.075%">13.07%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBITDA Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="13.633%">13.63%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBIT Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="8.379%">8.38%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-[#27272A]"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>FCF Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="1.801%">1.80%</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
          </div>
        </div>
      {:else}
        <h2
          class=" mt-16 flex justify-center items-center text-3xl font-medium text-slate-700 mb-5 m-auto"
        >
          No data available
        </h2>
      {/if}
    </div>
  </div>
</section>
