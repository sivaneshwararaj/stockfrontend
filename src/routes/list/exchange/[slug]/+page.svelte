<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  import Table from "$lib/components/Table/Table.svelte";

  export let data;

  let rawData = data?.getExchangeCategory;

  let totalMarketCap = rawData?.reduce(
    (total, stock) => total + stock?.marketCap,
    0,
  );
  let totalRevenue = rawData?.reduce(
    (total, stock) => total + stock?.revenue,
    0,
  );

  const exchangeNavigation = {
    amex: "AMEX (American Stock Exchange)",
    nyse: "NYSE (New York Stock Exchange)",
    nasdaq: "NASDAQ",
  };
</script>

<section class="w-full overflow-hidden m-auto">
  <div
    class="w-full m-auto text-white border border-gray-600 rounded-md h-auto p-5 mb-4"
  >
    A complete list of the {exchangeNavigation[data?.getParams?.toLowerCase()]} companies
    that are listed on the US stock market.
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

  <Table {data} rawData={data?.getExchangeCategory} />
</section>
