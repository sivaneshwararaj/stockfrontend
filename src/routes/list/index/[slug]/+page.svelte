<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import Table from "$lib/components/Table/Table.svelte";
  import DownloadData from "$lib/components/DownloadData.svelte";

  export let data;

  let rawData = data?.getIndexCategory;

  let totalMarketCap = rawData?.reduce(
    (total, stock) => total + stock?.marketCap,
    0,
  );
  let totalRevenue = rawData?.reduce(
    (total, stock) => total + stock?.revenue,
    0,
  );

  const indexNavigation = {
    nasdaq100:
      "A list of all stocks in the NASDAQ 100, an index of the top 100 non-financial companies on the Nasdaq exchange. Although there are 100 companies, there are 101 stock tickers, as Alphabet has two symbols.",
    dowjones:
      "A list of the 30 stocks in the Dow Jones Industrial Average stock index, which is an index of 30 major companies listed on stock exchanges in the U.S.",
    sp500:
      "A list of all stocks in the S&P 500, an index of the 500 largest U.S.-listed companies. There are over 500 tickers, as some companies have multiple symbols.",
  };

  $: charNumber = $screenWidth < 640 ? 15 : 20;
</script>

<section class="w-full overflow-hidden m-auto">
  <div
    class="w-full m-auto text-white border border-gray-600 rounded-md h-auto p-5 mb-4"
  >
    {indexNavigation[data?.getParams?.toLowerCase()]}
  </div>

  <div
    class="mb-4 flex flex-col divide-y divide-gray-600 rounded-md border border-gray-600 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0"
  >
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-normal text-white">Total Stocks</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white tiny:text-lg xs:text-xl sm:text-2xl"
        >
          {new Intl.NumberFormat("en")?.format(rawData?.length)}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-normal text-white">Total Market Cap</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white tiny:text-lg xs:text-xl sm:text-2xl"
        >
          {abbreviateNumber(totalMarketCap)}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-normal text-white">Total Revenue</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white tiny:text-lg xs:text-xl sm:text-2xl"
        >
          {abbreviateNumber(totalRevenue)}
        </div>
      </div>
    </div>
  </div>

  <!-- Content area -->
  <Table {data} rawData={data?.getIndexCategory} />
</section>
