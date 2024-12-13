<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    stockTicker,
  } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import ScrollToTop from "$lib/components/ScrollToTop.svelte";

  export let data;
  let rawData = data?.getStatistics ?? {};

  let companyName = $displayCompanyName
    ?.replace("Inc.", "")
    ?.replace(".com", "");
  let quantStats = {};

  function checkValue(val, category) {
    if (val !== null && val !== undefined) {
      if (category === "percent") {
        return `${val}%`;
      } else if (category === "int") {
        return abbreviateNumber(val);
      } else {
        return val;
      }
    } else {
      return "n/a";
    }
  }
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
    content={`${$displayCompanyName} (${$stockTicker}) Statistics & Valuation Metrics · Stocknear`}
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
    content={`${$displayCompanyName} (${$stockTicker}) Statistics & Valuation Metrics · Stocknear`}
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
      {#if Object?.keys(rawData)?.length !== 0}
        <div
          class="space-y-5 xs:space-y-6 lg:grid lg:grid-cols-3 lg:space-x-10 lg:space-y-0"
        >
          <div class="flex flex-col space-y-5 xs:space-y-6 lg:space-y-8">
            <div
              class="-mb-2 flex items-start justify-between border-b border-gray-500 md:-mb-4"
            >
              <h1 class="mb-3 text-xl sm:text-2xl font-bold">
                {companyName} Statistics
              </h1>
            </div>

            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Share Statistics
              </h2>
              <p
                class="mb-4 px-0.5 text-white xs:text-[1.05rem] lg:leading-normal"
              >
                {companyName} has {abbreviateNumber(rawData?.sharesOutStanding)}
                shares outstanding. The number of shares has increased by {rawData?.sharesYoY}%
                in one year.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Shares Outstanding</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="3,194,640,415"
                      >{abbreviateNumber(rawData?.sharesOutStanding)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Shares Change (YoY)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{checkValue(
                        rawData?.sharesYoYrawData?.sharesYoY,
                        "percent",
                      )}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Shares Change (QoQ)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.sharesQoQ, "percent")}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Owned by Institutions (%)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{checkValue(
                        rawData?.rawData?.institutionalOwnership,
                        "percent",
                      )}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Shares Floating</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="2,777,647,654"
                      >{abbreviateNumber(rawData?.floatShares)}</td
                    >
                  </tr>
                  <tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Failed to Deliver (FTD) Shares</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="2,777,647,654"
                      >{abbreviateNumber(rawData?.failToDeliver)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>FTD / Avg. Volume</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{checkValue(
                        abbreviateNumber(rawData?.relativeFTD),
                        "percent",
                      )}</td
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
                class="mb-4 px-0.5 text-white xs:text-[1.05rem] lg:leading-normal"
              >
                The latest short interest is {abbreviateNumber(
                  rawData?.sharesShort,
                )}, so {rawData?.shortOutStandingPercent}% of the outstanding
                shares have been sold short.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short Interest</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="74,332,630"
                      >{abbreviateNumber(rawData?.sharesShort)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short % of Shares Out</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.shortOutStandingPercent}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short % of Float</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.shortFloatPercent}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Short Ratio (days to cover)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.shortRatio}</td
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
                class="mb-4 px-0.5 text-white xs:text-[1.05rem] lg:leading-normal"
              >
                The PE ratio is {rawData?.priceEarningsRatio} and the forward PE
                ratio is {rawData?.forwardPE}.
                {rawData?.peg !== null
                  ? `${companyName}'s PEG ratio is
                ${rawData?.peg}.`
                  : ""}
              </p>

              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PE Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.priceEarningsRatio}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Forward PE</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.forwardPE}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PS Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.priceToSalesRatio}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Forward PS</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.forwardPS}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PB Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.priceToBookRatio}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>P/FCF Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.priceToFreeCashFlowsRatio}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>PEG Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.peg !== null ? rawData?.peg : "n/a"}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials/ratios`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-lg text-center font-semibold text-black m-auto sm:hover:bg-gray-300 bg-[#fff] transition duration-100"
              >
                Financial Ratio History
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Enterprise Valuation
              </h2>
              <p
                class="mb-4 px-0.5 text-white xs:text-[1.05rem] lg:leading-normal"
              >
                {$displayCompanyName} has an Enterprise Value (EV) of {abbreviateNumber(
                  rawData?.enterpriseValue,
                )}.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / Earnings</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.evEarnings}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / Sales</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.evSales}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / EBITDA</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.evEBITDA}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / EBIT</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.evEBIT}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EV / FCF</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.evFCF}</td
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
                class="mb-4 px-0.5 text-white xs:text-[1.05rem] lg:leading-normal"
              >
                The company has a current ratio of {rawData?.currentRatio}, with
                a Debt / Equity ratio of {rawData?.debtEquityRatio}.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Current Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.currentRatio}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Quick Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.quickRatio}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Debt / Equity</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.debtEquityRatio}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Total Debt / Capitalization</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(
                        rawData?.totalDebtToCapitalization,
                      )}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Cash Flow / Debt</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.cashFlowToDebtRatio}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Interest Coverage</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.interestCoverage}</td
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
                class="mb-4 px-0.5 text-white xs:text-[1.05rem] lg:leading-normal"
              >
                Return on equity (ROE) is {rawData?.returnOnEquity}% and return
                on capital (ROIC) is {rawData?.returnOnInvestedCapital}%.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Return on Equity (ROE)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.returnOnEquity}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Return on Assets (ROA)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.returnOnAssets}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Return on Capital (ROIC)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.returnOnInvestedCapital}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Revenue Per Employee</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.revenuePerEmployee)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Profits Per Employee</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.profitPerEmployee)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Employee Count</span></td
                    >
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="140,473">{abbreviateNumber(rawData?.employees)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Asset Turnover</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.assetTurnover}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Inventory Turnover</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.inventoryTurnover)}</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">Taxes</h2>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Income Tax</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.incomeTaxExpense)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Effective Tax Rate</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.effectiveTaxRate}</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
          </div>
          <div class="flex flex-col space-y-5 xs:space-y-6 lg:space-y-8">
            <div class="mt-0 sm:mt-9 2xl:mt-0">
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Stock Price Statistics
              </h2>
              <p
                class="mb-4 px-0.5 text-white xs:text-[1.05rem] lg:leading-normal"
              >
                The stock price has increased by {rawData?.change1Y}% in the
                last 52 weeks. The beta is {rawData?.beta}, so {companyName}'s
                price volatility has been {rawData?.beta > 0
                  ? "higher"
                  : "lower"} than the market average.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Beta</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.beta}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>52-Week Price Change</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.change1Y}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>50-Day Moving Average</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.sma50}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>200-Day Moving Average</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.sma200}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Relative Strength Index (RSI)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.rsi}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Average Volume (20 Days)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.avgVolume)}</td
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
                class="mb-4 px-0.5 text-white xs:text-[1.05rem] lg:leading-normal"
              >
                In the last 12 months, {companyName} had revenue of {abbreviateNumber(
                  rawData?.revenue,
                  true,
                )}
                and earned {abbreviateNumber(rawData?.netIncome, true)} in profits.
                Earnings per share was ${rawData?.eps}.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Revenue</span></td
                    >
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.revenue)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Gross Profit</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.grossProfit)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Operating Income</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.operatingIncome)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Net Income</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.netIncome)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBITDA</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.ebitda)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBIT</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.ebit)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Earnings Per Share (EPS)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.eps}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-lg text-center font-semibold text-black m-auto sm:hover:bg-gray-300 bg-[#fff] transition duration-100"
              >
                Full Income Statement
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Balance Sheet
              </h2>
              <p
                class="mb-4 px-0.5 text-white xs:text-[1.05rem] lg:leading-normal"
              >
                The company has {abbreviateNumber(
                  rawData?.cashAndCashEquivalents,
                  true,
                )} in cash and {abbreviateNumber(rawData?.totalDebt, true)} in debt,
                giving a net cash position of {abbreviateNumber(
                  rawData?.cashAndCashEquivalents - rawData?.totalDebt,
                  true,
                )}.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Cash &amp; Cash Equivalents</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.cashAndCashEquivalents)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Total Debt</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.totalDebt)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Net Cash</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="20,865,000,000"
                      >{abbreviateNumber(
                        rawData?.cashAndCashEquivalents - rawData?.totalDebt,
                      )}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Retained Earnings</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.retainedEarnings)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Total Assets</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.totalAssets)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Working Capital</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.workingCapital)}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials/balance-sheet`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-lg text-center font-semibold text-black m-auto sm:hover:bg-gray-300 bg-[#fff] transition duration-100"
              >
                Full Balance Sheet
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Cash Flow
              </h2>
              <p
                class="mb-4 px-0.5 text-white xs:text-[1.05rem] lg:leading-normal"
              >
                In the last 12 months, operating cash flow was {abbreviateNumber(
                  rawData?.operatingCashFlow,
                  true,
                )}
                and capital expenditures {abbreviateNumber(
                  rawData?.capitalExpenditure,
                  true,
                )}, giving a free cash flow of {abbreviateNumber(
                  rawData?.freeCashFlow,
                  true,
                )}.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Operating Cash Flow</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.operatingCashFlow)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Capital Expenditures</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.capitalExpenditure)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Free Cash Flow</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{abbreviateNumber(rawData?.freeCashFlow)}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>FCF Per Share</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.freeCashFlowPerShare}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/financials/cash-flow`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-lg text-center font-semibold text-black m-auto sm:hover:bg-gray-300 bg-[#fff] transition duration-100"
              >
                Full Cash Flow Statement
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">Margins</h2>
              <p
                class="mb-4 px-0.5 text-white xs:text-[1.05rem] lg:leading-normal"
              >
                Gross margin is {checkValue(
                  rawData?.grossProfitMargin,
                  "int",
                )}%, with operating and profit margins of {checkValue(
                  rawData?.operatingProfitMargin,
                  "int",
                )}% and {checkValue(rawData?.netProfitMargin, "int")}%.
              </p>
              <table class="w-full">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Gross Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.grossProfitMargin, "int")}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Operating Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.operatingProfitMargin, "int")}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Pretax Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.pretaxProfitMargin, "int")}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Profit Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.netProfitMargin, "int")}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBITDA Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.ebitdaMargin, "int")}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>EBIT Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.ebitMargin, "int")}%</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>FCF Margin</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{checkValue(rawData?.freeCashFlowMargin, "int")}%</td
                    >
                  </tr></tbody
                >
              </table>
            </div>
          </div>

          <div class="flex flex-col space-y-5 xs:space-y-6 lg:space-y-8">
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Dividends &amp; Yields
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white xs:text-[1.05rem] lg:leading-normal"
              >
                {#if rawData?.annualDividend !== null && rawData?.dividendYield !== null}
                  {$stockTicker} pays an annual dividend of ${rawData?.annualDividend},
                  which amounts to a dividend yield of {rawData?.dividendYield}%.
                {:else}
                  {$stockTicker} does not appear to pay any dividends at this time.
                {/if}
              </p>
              <table class="w-full" data-test="statistics-table">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Dividend Per Share</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.annualDividend !== null
                        ? "$" + rawData?.annualDividend?.toFixed(2)
                        : "n/a"}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Dividend Yield</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.dividendYield !== null
                        ? rawData?.dividendYield + "%"
                        : "n/a"}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Dividend Growth (YoY)</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.dividendGrowth !== null
                        ? rawData?.dividendGrowth + "%"
                        : "n/a"}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Payout Ratio</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="n/a"
                      >{rawData?.payoutRatio !== null
                        ? rawData?.payoutRatio + "%"
                        : "n/a"}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Earnings Yield</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.earningsYield !== null
                        ? rawData?.earningsYield + "%"
                        : "n/a"}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>FCF Yield</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="0.578%"
                      >{rawData?.freeCashFlowYield !== null
                        ? rawData?.freeCashFlowYield + "%"
                        : "n/a"}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/dividends`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-lg text-center font-semibold text-black m-auto sm:hover:bg-gray-300 bg-[#fff] transition duration-100"
              >
                Dividend Details
              </a>
            </div>
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                Analyst Forecast
              </h2>
              <p
                class="mb-4 px-0.5 text-base leading-relaxed text-white xs:text-[1.05rem] lg:leading-normal"
                data-test="statistics-text"
              >
                {#if rawData?.priceTarget && rawData?.upside && rawData?.analystRating}
                  The average price target for {$stockTicker} is ${rawData?.priceTarget},
                  which is {rawData?.upside}% {rawData?.upside > 0
                    ? "higher"
                    : "lower"} than the current price. The consensus rating is "{rawData?.analystRating}".
                {:else}
                  Currently there are no analyst rating for {$stockTicker}.
                {/if}
              </p>
              <table class="w-full" data-test="statistics-table">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Price Target</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="$197.17"
                      >{rawData?.priceTarget !== null
                        ? "$" + rawData?.priceTarget
                        : "n/a"}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Price Target Difference</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="30.69%"
                      >{rawData?.upside !== null
                        ? rawData?.upside + "%"
                        : "n/a"}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Analyst Consensus</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="Strong Buy">{rawData?.analystRating ?? "n/a"}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Analyst Count</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="30">{rawData?.analystCounter ?? "n/a"}</td
                    >
                  </tr></tbody
                >
              </table>
              <a
                href={`/stocks/${$stockTicker}/forecast/analyst`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-lg text-center font-semibold text-black m-auto sm:hover:bg-gray-300 bg-[#fff] transition duration-100"
              >
                Stock Forecasts
              </a>
            </div>
            {#if rawData?.lastStockSplit && rawData?.splitType && rawData?.splitRatio}
              <div>
                <h2 class="mb-2 px-0.5 text-xl font-bold text-white">
                  Stock Splits
                </h2>
                <p
                  class="mb-4 px-0.5 text-base leading-relaxed text-white xs:text-[1.05rem] lg:leading-normal"
                  data-test="statistics-text"
                >
                  The last stock split was on {new Date(
                    rawData?.lastStockSplit,
                  ).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "Europe/Berlin",
                  })}. It was a
                  {rawData?.splitType}
                  split with a ratio of {rawData?.splitRatio}.
                </p>
                <table class="w-full" data-test="statistics-table">
                  <tbody
                    ><tr class="border-y border-gray-600 odd:bg-secondary"
                      ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                        ><span>Last Split Date</span>
                      </td>
                      <td
                        class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                        title="August 22, 2000"
                        >{new Date(rawData?.lastStockSplit).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "Europe/Berlin",
                          },
                        )}</td
                      >
                    </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                      ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                        ><span>Split Type</span>
                      </td>
                      <td
                        class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                        title="Forward">{rawData?.splitType}</td
                      >
                    </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                      ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                        ><span>Split Ratio</span>
                      </td>
                      <td
                        class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                        >{rawData?.splitRatio}</td
                      >
                    </tr></tbody
                  >
                </table>
              </div>
            {/if}
            <div>
              <h2 class="mb-2 px-0.5 text-xl font-bold text-white">Scores</h2>
              <table class="w-full" data-test="statistics-table">
                <tbody
                  ><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Altman Z-Score</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      title="n/a">{rawData?.altmanZScore}</td
                    >
                  </tr><tr class="border-y border-gray-600 odd:bg-secondary"
                    ><td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2"
                      ><span>Piotroski F-Score</span>
                    </td>
                    <td
                      class="px-[5px] py-1.5 text-right font-semibold xs:px-2.5 xs:py-2"
                      >{rawData?.piotroskiScore}</td
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

    <ScrollToTop />
  </div>
</section>
