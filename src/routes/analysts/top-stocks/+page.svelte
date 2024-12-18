<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import Table from "$lib/components/Table/Table.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  export let data;

  const excludedRules = new Set([
    "upside",
    "priceTarget",
    "marketCap",
    "analystCounter",
    "analystRating"
  ]);

  const defaultList = [
    { name: "Analyst Count", rule: "analystCounter" },
    { name: "Upside", rule: "upside" },
    { name: "Price Target", rule: "priceTarget" },
    { name: "Market Cap", rule: "marketCap" },
    {name: 'Analyst Rating', rule: 'analystRating'}
  ];
  const hideLastRow = true;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Top
    Top Analyst Strong Buy Stocks · Stocknear
  </title>
  <meta
    name="description"
    content={`The top 100 "Strong Buy" stocks according to the best performing Wall Street analysts, with a rating of 5 stars.`}
  />

  <!-- Other meta tags -->
  <meta property="og:title" content={`Top 100 Strong Buy Stocks · Stocknear`} />
  <meta
    property="og:description"
    content={`The top 100 "Strong Buy" stocks according to the best performing Wall Street analysts, with a rating of 5 stars.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`Top 100 Strong Buy Stocks · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`The top 100 "Strong Buy" stocks according to the best performing Wall Street analysts, with a rating of 5 stars.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Top Analyst Stocks</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Top Strong Buy Stocks
            </h1>
            <p class="mb-3 px-1 text-base font-semibold text-muted sm:px-0">
              The "Strong Buy" stocks according to the best performing Wall
              Street analysts.
            </p>
          </div>

          <div
            class="w-full sm:flex sm:flex-row sm:items-center m-auto text-gray-100 bg-[#09090B] border border-gray-800 sm:rounded-md h-auto p-5"
          >
            <svg
              class="w-5 h-5 inline-block sm:mr-2 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              ><path
                fill="#fff"
                d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
              /></svg
            >
            Strong Buy stocks by top-rated analysts with a star rating of 4 or above,
            known for their exceptional accuracy and returns. Stocks are ranked based
            on the volume of analyst ratings.
          </div>

          <div class="w-full m-auto mt-10">
            <Table
              {data}
              rawData={data?.getTopAnalystStocks}
              {defaultList}
              {excludedRules}
              {hideLastRow}
            />
          </div>
          <UpgradeToPro {data} />
          <div class="mt-4 py-6 xl:mt-10 border-t border-gray-200">
            <div class="mx-auto max-w-7xl px-3 xs:px-6 lg:px-8">
              <div class="mx-auto max-w-2xl md:text-center">
                <h3
                  class="mt-2 text-2xl font-bold tracking-tight text-white bp:text-3xl"
                >
                  Analyst Star Rankings
                </h3>
                <p
                  class="mt-3 text-base leading-8 text-muted dark:text-faded xl:text-lg"
                >
                  Our analyst star rankings are based on these four factors
                </p>
              </div>
              <div class="mx-auto mt-6 max-w-2xl lg:max-w-5xl">
                <dl
                  class="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:max-w-none lg:grid-cols-4 lg:gap-y-16"
                >
                  <div class="relative pl-14">
                    <dt
                      class="text-base font-semibold leading-4 text-white md:leading-7"
                    >
                      <div
                        class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#fff]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="h-6 w-6 text-black"
                          ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path></svg
                        >
                      </div>
                      Success Rate
                    </dt>
                    <dd
                      class="mt-2 text-base leading-7 text-muted dark:text-faded"
                    >
                      The percentage of ratings that are profitable.
                    </dd>
                  </div>
                  <div class="relative pl-14">
                    <dt
                      class="text-base font-semibold leading-4 text-white md:leading-7"
                    >
                      <div
                        class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#fff]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="h-6 w-6 text-black"
                          ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                          ></path></svg
                        >
                      </div>
                      Average Return
                    </dt>
                    <dd
                      class="mt-2 text-base leading-7 text-muted dark:text-faded"
                    >
                      The average percentage return within one year of the
                      rating.
                    </dd>
                  </div>
                  <div class="relative pl-14">
                    <dt
                      class="text-base font-semibold leading-4 text-white md:leading-7"
                    >
                      <div
                        class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#fff]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="h-6 w-6 text-black"
                          ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
                          ></path></svg
                        >
                      </div>
                      Rating Count
                    </dt>
                    <dd
                      class="mt-2 text-base leading-7 text-muted dark:text-faded"
                    >
                      The more ratings the analyst has provided, the higher the
                      score.
                    </dd>
                  </div>
                  <div class="relative pl-14">
                    <dt
                      class="text-base font-semibold leading-4 text-white md:leading-7"
                    >
                      <div
                        class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#fff]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="h-6 w-6 text-black"
                          ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path></svg
                        >
                      </div>
                      Recency
                    </dt>
                    <dd
                      class="mt-2 text-base leading-7 text-muted dark:text-faded"
                    >
                      Ratings provided within the past year contribute to a
                      higher score.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro"}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href={"/pricing"}
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Pro Subscription
                  </h2>
                  <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Upgrade now for unlimited access to all data and tools
                </span>
              </a>
            </div>
          {/if}

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/analysts"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Analyst
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Wall Street analyst ratings
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/most-shorted-stocks"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Shorted Stocks
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Never miss out another short squeeze
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
