<script lang="ts">
  import {
    stockTicker,
    displayCompanyName,
    numberOfUnreadNotification,
  } from "$lib/store";

  export let data;

  const similarStocks = data?.getSimilarStocks?.sort(
    (a, b) => b?.dividendYield - a?.dividendYield,
  );
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker?.toUpperCase()}) Company Profile &
    Overview · Stocknear
  </title>

  <meta
    name="description"
    content={`Company profile for ${$displayCompanyName} (${$stockTicker?.toUpperCase()}) with a description, list of executives, contact details and other key facts.`}
  />
  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker?.toUpperCase()}) Company Profile & Overview · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Company profile for ${$displayCompanyName} (${$stockTicker?.toUpperCase()}) with a description, list of executives, contact details and other key facts.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker?.toUpperCase()}) Company Profile & Overview · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Company profile for ${$displayCompanyName} (${$stockTicker?.toUpperCase()}) with a description, list of executives, contact details and other key facts.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full bg-[#09090B] overflow-hidden text-white h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div
        class="relative flex flex-row justify-center items-start overflow-hidden w-full"
      >
        <div class="sm:p-7 w-full mt-2 sm:mt-0">
          <div class="lg:float-left lg:w-[calc(100%-336px-40px)]">
            <h1 class="text-xl sm:text-2xl font-bold mb-4 w-full">
              Company Description
            </h1>
            <div class="mb-5 text-base md:text-lg [&amp;>p]:mb-5">
              <p class="mb-5">
                The Coca-Cola Company, a beverage company, manufactures,
                markets, and sells various nonalcoholic beverages worldwide.
              </p>
              <p class="mb-5">
                The company provides sparkling soft drinks, sparkling flavors;
                water, sports, coffee, and tea; juice, value-added dairy, and
                plant-based beverages; and other beverages.
              </p>
              <p class="mb-5">
                It also offers beverage concentrates and syrups, as well as
                fountain syrups to fountain retailers, such as restaurants and
                convenience stores.
              </p>
              <p class="mb-5">
                The company sells its products under the Coca-Cola, Diet
                Coke/Coca-Cola Light, Coca-Cola Zero Sugar, caffeine free Diet
                Coke, Cherry Coke, Fanta Orange, Fanta Zero Orange, Fanta Zero
                Sugar, Fanta Apple, Sprite, Sprite Zero Sugar, Simply Orange,
                Simply Apple, Simply Grapefruit, Fresca, Schweppes, Thums Up,
                Aquarius, Ayataka, BODYARMOR, Ciel, Costa, Dasani, doğadan, FUZE
                TEA, Georgia, glacéau smartwater, glacéau vitaminwater, Gold
                Peak, Ice Dew, I LOHAS, Powerade, Topo Chico, AdeS, Del Valle,
                fairlife, innocent, Minute Maid, and Minute Maid Pulpy brands.
              </p>
              <p class="mb-5">
                It operates through a network of independent bottling partners,
                distributors, wholesalers, and retailers, as well as through
                bottling and distribution operators.
              </p>
              <p class="mb-5">
                The company was founded in 1886 and is headquartered in Atlanta,
                Georgia.
              </p>
            </div>
          </div>
          <div class="-mr-5 flex-shrink-0 lg:float-right lg:w-[336px]">
            <div
              class="mt-7 rounded border border-gray-600 bg-primary px-3 pb-2 pt-3 xs:px-4 xs:pt-4 lg:mt-1"
            >
              <div class="text-center text-2xl font-semibold">
                {$displayCompanyName}
              </div>
              <div class="mb-0">
                <img
                  src={`https://financialmodelingprep.com/image-stock/${$stockTicker?.toUpperCase()}.png`}
                  alt={`${$displayCompanyName} logo`}
                  class="mx-auto py-0.5 w-28 h-28 mt-5 mb-5"
                />
              </div>
              <table class="w-full">
                <tbody
                  ><tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-bpivlp">Country</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2">United States</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-99zpt0">Founded</td
                    > <td class="px-1 py-1.5 text-right lg:py-2">1886</td></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-pqn7mx">IPO Date</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2">Sep 5, 1919</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td class="px-1 py-1.5 font-semibold lg:py-2">Industry</td>
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      ><a
                        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
                        href="/stocks/industry/beverages-non-alcoholic/"
                        >Beverages - Non-Alcoholic</a
                      ></td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-5e1uzt">Sector</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      ><a
                        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
                        href="/stocks/sector/consumer-staples/"
                        >Consumer Staples</a
                      ></td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-8d46v8">Employees</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      ><a
                        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
                        href="/stocks/ko/employees/">79,100</a
                      ></td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-1qhfmvo">CEO</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >James Robert Quincey</td
                    ></tr
                  ></tbody
                >
              </table>
            </div>
            <h2 class="mt-6 xs:mt-8 font-bold text-2xl mb-2">
              Contact Details
            </h2>
            <div
              class="rounded border border-gray-600 bg-primary px-4 pb-2 pt-4"
            >
              <table class="w-full">
                <tbody
                  ><tr class="border-b border-gray-600 last:border-0"
                    ><td colspan="2" class="pb-3"
                      ><div
                        class="mb-2 text-lg font-bold"
                        data-svelte-h="svelte-4u53xl"
                      >
                        Address:
                      </div>
                      <div>
                        One Coca-Cola Plaza<br />Atlanta, Georgia 30313<br
                        />United States
                      </div></td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-0.5 py-2 font-semibold"
                      data-svelte-h="svelte-13hrol0">Phone</td
                    > <td class="px-0.5 py-2 text-right">404 676 2121</td></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td class="px-0.5 py-2 font-semibold">Website</td>
                    <td class="px-0.5 py-2 text-right"
                      ><a
                        href="https://www.coca-colacompany.com"
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        >coca-colacompany.com</a
                      ></td
                    ></tr
                  ></tbody
                >
              </table>
            </div>
            <h2 class="mt-6 xs:mt-8 font-bold text-2xl mb-2">Stock Details</h2>
            <div
              class="rounded border border-gray-600 bg-primary px-2 pb-2 pt-2 xs:px-4 xs:pt-2.5"
            >
              <table class="w-full">
                <tbody
                  ><tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-lmvnpx">Ticker Symbol</td
                    > <td class="px-1 py-1.5 text-right lg:py-2">KO</td></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-h7dsem">Exchange</td
                    > <td class="px-1 py-1.5 text-right lg:py-2">NYSE</td></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-q9yzrm">Fiscal Year</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >January - December</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-1tbczfa">Reporting Currency</td
                    > <td class="px-1 py-1.5 text-right lg:py-2">USD</td></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-ucpcs9">CIK Code</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2">0000021344</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-1fdyovu">CUSIP Number</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2">191216100</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-t5u2mr">ISIN Number</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2">US1912161007</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-x8apyl">Employer ID</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2">58-0628465</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-1o4kelt">SIC Code</td
                    > <td class="px-1 py-1.5 text-right lg:py-2">2080</td></tr
                  ></tbody
                >
              </table>
            </div>
          </div>

          <div class="mb-2 lg:float-left lg:w-[calc(100%-336px-40px)]">
            <h2 class="mt-6 xs:mt-8 lg:mt-4 text-xl sm:text-2xl font-bold mb-5">
              Key Executives
            </h2>
            <table class="mb-6 w-full text-base xs:mb-8">
              <thead class="bg-primary"
                ><tr class="border-y border-gray-600"
                  ><th
                    class="px-2 py-2.5 text-left font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >Name</th
                  >
                  <th
                    class="px-2 py-2.5 text-left font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >Position</th
                  ></tr
                ></thead
              >
              <tbody
                ><tr class="border-b border-gray-600"
                  ><td
                    class="px-2 py-2.5 align-top font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >James Robert B. Quincey</td
                  >
                  <td
                    class="px-2 py-2.5 align-top text-white xs:px-3 xs:py-3 sm:px-4"
                    >Chairman and Chief Executive Officer</td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="px-2 py-2.5 align-top font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >John Murphy</td
                  >
                  <td
                    class="px-2 py-2.5 align-top text-white xs:px-3 xs:py-3 sm:px-4"
                    >President and Chief Financial Officer</td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="px-2 py-2.5 align-top font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >Manuel Arroyo Prieto</td
                  >
                  <td
                    class="px-2 py-2.5 align-top text-white xs:px-3 xs:py-3 sm:px-4"
                    >Executive Vice President and Global chief Marketing Officer</td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="px-2 py-2.5 align-top font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >Henrique Braun</td
                  >
                  <td
                    class="px-2 py-2.5 align-top text-white xs:px-3 xs:py-3 sm:px-4"
                    >Executive Vice President and President of International
                    Development</td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="px-2 py-2.5 align-top font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >Jennifer Kay Mann</td
                  >
                  <td
                    class="px-2 py-2.5 align-top text-white xs:px-3 xs:py-3 sm:px-4"
                    >Executive Vice President and President of North America
                    Operating Unit</td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="px-2 py-2.5 align-top font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >Erin May</td
                  >
                  <td
                    class="px-2 py-2.5 align-top text-white xs:px-3 xs:py-3 sm:px-4"
                    >Senior Vice President, Chief Accounting Officer and
                    Controller</td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="px-2 py-2.5 align-top font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >Stacy Lynn Apter</td
                  >
                  <td
                    class="px-2 py-2.5 align-top text-white xs:px-3 xs:py-3 sm:px-4"
                    >Senior Vice President, Treasurer and Head of Corporate
                    Finance</td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="px-2 py-2.5 align-top font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >Nancy W. Quan</td
                  >
                  <td
                    class="px-2 py-2.5 align-top text-white xs:px-3 xs:py-3 sm:px-4"
                    >Executive Vice President and Global Chief Technical and
                    Innovation Officer</td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="px-2 py-2.5 align-top font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >Neeraj Tolmare</td
                  >
                  <td
                    class="px-2 py-2.5 align-top text-white xs:px-3 xs:py-3 sm:px-4"
                    >Senior Vice President and Chief Information Officer</td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="px-2 py-2.5 align-top font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                    >Robin Halpern</td
                  >
                  <td
                    class="px-2 py-2.5 align-top text-white xs:px-3 xs:py-3 sm:px-4"
                    >Vice President and Head of Investor Relations</td
                  >
                </tr></tbody
              >
            </table>

            <h2
              class="mt-6 xs:mt-8 lg:mt-12 text-xl sm:text-2xl font-bold mb-5"
            >
              Latest SEC Filings
            </h2>
            <table class="w-full">
              <thead
                ><tr class="border-b border-t border-gray-600 bg-primary"
                  ><th class="px-1 py-2 text-left text-white xs:px-2">Date</th>
                  <th class="px-1 py-2 text-left text-white xs:px-2">Type</th>
                  <th class="px-1 py-2 text-left text-white xs:px-2">Title</th
                  ></tr
                ></thead
              >
              <tbody
                ><tr class="border-b border-gray-600"
                  ><td
                    class="whitespace-nowrap py-3 pr-1 align-top text-white xs:px-2"
                    >Dec 11, 2024</td
                  >
                  <td class="px-1 py-3 align-top text-white xs:px-2">8-K</td>
                  <td class="py-3 pl-1 align-top xs:px-2"
                    ><a
                      href="https://www.sec.gov/Archives/edgar/data/21344/000155278124000626/e24365_ko-8k.htm"
                      target="_blank"
                      rel="noopener noreferrer">Current Report</a
                    ></td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="whitespace-nowrap py-3 pr-1 align-top text-white xs:px-2"
                    >Nov 27, 2024</td
                  >
                  <td class="px-1 py-3 align-top text-white xs:px-2">144</td>
                  <td class="py-3 pl-1 align-top xs:px-2"
                    ><a
                      href="https://www.sec.gov/Archives/edgar/data/21344/000196535324000360/xsl144X01/primary_doc.xml"
                      target="_blank"
                      rel="noopener noreferrer">Filing</a
                    ></td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="whitespace-nowrap py-3 pr-1 align-top text-white xs:px-2"
                    >Nov 7, 2024</td
                  >
                  <td class="px-1 py-3 align-top text-white xs:px-2">144</td>
                  <td class="py-3 pl-1 align-top xs:px-2"
                    ><a
                      href="https://www.sec.gov/Archives/edgar/data/21344/000194984624000652/xsl144X01/primary_doc.xml"
                      target="_blank"
                      rel="noopener noreferrer">Filing</a
                    ></td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="whitespace-nowrap py-3 pr-1 align-top text-white xs:px-2"
                    >Oct 24, 2024</td
                  >
                  <td class="px-1 py-3 align-top text-white xs:px-2">10-Q</td>
                  <td class="py-3 pl-1 align-top xs:px-2"
                    ><a
                      href="https://www.sec.gov/Archives/edgar/data/21344/000002134424000060/ko-20240927.htm"
                      target="_blank"
                      rel="noopener noreferrer">Quarterly Report</a
                    ></td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="whitespace-nowrap py-3 pr-1 align-top text-white xs:px-2"
                    >Oct 23, 2024</td
                  >
                  <td class="px-1 py-3 align-top text-white xs:px-2">8-K</td>
                  <td class="py-3 pl-1 align-top xs:px-2"
                    ><a
                      href="https://www.sec.gov/Archives/edgar/data/21344/000002134424000056/ko-20241023.htm"
                      target="_blank"
                      rel="noopener noreferrer">Current Report</a
                    ></td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="whitespace-nowrap py-3 pr-1 align-top text-white xs:px-2"
                    >Oct 17, 2024</td
                  >
                  <td class="px-1 py-3 align-top text-white xs:px-2">8-K</td>
                  <td class="py-3 pl-1 align-top xs:px-2"
                    ><a
                      href="https://www.sec.gov/Archives/edgar/data/21344/000002134424000051/ko-20241017.htm"
                      target="_blank"
                      rel="noopener noreferrer">Current Report</a
                    ></td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="whitespace-nowrap py-3 pr-1 align-top text-white xs:px-2"
                    >Aug 26, 2024</td
                  >
                  <td class="px-1 py-3 align-top text-white xs:px-2">144</td>
                  <td class="py-3 pl-1 align-top xs:px-2"
                    ><a
                      href="https://www.sec.gov/Archives/edgar/data/21344/000155278124000502/xsl144X01/primary_doc.xml"
                      target="_blank"
                      rel="noopener noreferrer">Filing</a
                    ></td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="whitespace-nowrap py-3 pr-1 align-top text-white xs:px-2"
                    >Aug 21, 2024</td
                  >
                  <td class="px-1 py-3 align-top text-white xs:px-2">8-K</td>
                  <td class="py-3 pl-1 align-top xs:px-2"
                    ><a
                      href="https://www.sec.gov/Archives/edgar/data/21344/000002134424000047/ko-20240821.htm"
                      target="_blank"
                      rel="noopener noreferrer">Current Report</a
                    ></td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="whitespace-nowrap py-3 pr-1 align-top text-white xs:px-2"
                    >Aug 21, 2024</td
                  >
                  <td class="px-1 py-3 align-top text-white xs:px-2">144</td>
                  <td class="py-3 pl-1 align-top xs:px-2"
                    ><a
                      href="https://www.sec.gov/Archives/edgar/data/21344/000195004724006367/xsl144X01/primary_doc.xml"
                      target="_blank"
                      rel="noopener noreferrer">Filing</a
                    ></td
                  >
                </tr><tr class="border-b border-gray-600"
                  ><td
                    class="whitespace-nowrap py-3 pr-1 align-top text-white xs:px-2"
                    >Aug 21, 2024</td
                  >
                  <td class="px-1 py-3 align-top text-white xs:px-2">144</td>
                  <td class="py-3 pl-1 align-top xs:px-2"
                    ><a
                      href="https://www.sec.gov/Archives/edgar/data/21344/000195004724006356/xsl144X01/primary_doc.xml"
                      target="_blank"
                      rel="noopener noreferrer">Filing</a
                    ></td
                  >
                </tr></tbody
              >
            </table>
            <div class="border-b border-gray-600 py-3 text-xl font-semibold">
              <a
                class="text-blue-400 sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                href="https://www.sec.gov/cgi-bin/browse-edgar?CIK=0000021344&amp;count=100"
                target="_blank"
                rel="noopener noreferrer">View All SEC Filings</a
              >
            </div>
          </div>
          <div class="clear-both min-h-5"></div>
        </div>
      </div>
    </div>
  </div>
</section>
