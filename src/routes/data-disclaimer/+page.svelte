<script>
  import { numberOfUnreadNotification, screenWidth } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  let discordURL = import.meta.env.VITE_DISCORD_URL;
  const emailAddress = "support@stocknear.com";
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Data
    Disclaimer · Stocknear
  </title>
  <meta
    name="description"
    content={`All data shown on this website is for informational purposes only and should not be relied upon to make trading or investing decisions.`}
  />

  <!-- Other meta tags -->
  <meta property="og:title" content={`Data Disclaimer · Stocknear`} />
  <meta
    property="og:description"
    content={`All data shown on this website is for informational purposes only and should not be relied upon to make trading or investing decisions.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`Data Disclaimer · Stocknear`} />
  <meta
    name="twitter:description"
    content={`All data shown on this website is for informational purposes only and should not be relied upon to make trading or investing decisions.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Data Disclaimer</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-10">
          <div class="mb-6 border-b-2">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Data Disclaimer
            </h1>
          </div>

          <div class="w-full bg-default m-auto">
            <div>
              <p class="text-white mb-5 text-[1rem] sm:text-lg">
                The data on this site is for informational purposes only and
                should not be used for trading or investment decisions.
                <br /><br />
                We strive for accuracy and quality. If you spot errors, please contact
                us via
                <a
                  href={discordURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-400 hover:underline"
                >
                  Discord
                </a>
                or email us at
                <a
                  href="mailto:{emailAddress}"
                  class="text-blue-400 hover:underline"
                >
                  {emailAddress}
                </a>.
              </p>

              <h2 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
                Stock Charts
              </h2>
              <p class="text-white mb-10 mt-5 text-[1rem] sm:text-lg">
                Intraday and historical stock chart data are provided by
                <a
                  href="https://site.financialmodelingprep.com/pricing-plans?couponCode=stocknear"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-400 hover:underline"
                >
                  FMP
                </a>.
              </p>

              <h2 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
                Stocks Covered
              </h2>
              <p class="text-white mb-10 mt-5 text-[1rem] sm:text-lg">
                Stocknear covers all stocks and ETFs listed on major US
                exchanges (NASDAQ, NYSE, NYSE American, NYSE Arca) and many OTC
                stocks. We also include international companies trading on US
                exchanges and aim to add global stock exchanges soon.
              </p>

              <h2 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
                Historical Financials
              </h2>
              <p class="text-white mb-10 mt-5 text-[1rem] sm:text-lg">
                Fundamental financial data is sourced from
                <a
                  href="https://site.financialmodelingprep.com/pricing-plans?couponCode=stocknear"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-400 hover:underline"
                >
                  FMP
                </a>, based on official SEC filings (10-K, 10-Q). Data is
                updated daily, but delays may occur if companies file late. All
                displayed data is official, audited, and SEC-submitted.
              </p>

              <h2 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
                Price Targets and Analyst Estimates
              </h2>
              <p class="text-white mb-10 mt-5 text-[1rem] sm:text-lg">
                Price targets and ratings are from Benzinga, sourced from Wall
                Street analysts. Revenue and EPS forecasts come from Benzinga
                and <a
                  href="https://site.financialmodelingprep.com/pricing-plans?couponCode=stocknear"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-400 hover:underline"
                >
                  FMP
                </a>. Analyst accuracy and performance metrics are also provided
                by Benzinga. Differences across sources may occur but are
                directionally consistent. Use this information cautiously as
                predictions are often inaccurate.
              </p>

              <h2 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
                ETF Holdings
              </h2>
              <p class="text-white mb-10 mt-5 text-[1rem] sm:text-lg">
                Most ETF holdings data is provided by <a
                  href="https://site.financialmodelingprep.com/pricing-plans?couponCode=stocknear"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-400 hover:underline"
                >
                  FMP
                </a>.
              </p>

              <h2 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
                Options Data
              </h2>
              <p class="text-white mb-10 mt-5 text-[1rem] sm:text-lg">
                Options flow data is sourced from Benzinga via OPRA. Individual
                ticker options data is from Unusual Whales, also sourced from
                OPRA.
              </p>
            </div>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 mt-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
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
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/about"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  About Us
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Learn more about why we're doing this here
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/contact"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Contact Us
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Let me know if you need something
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
