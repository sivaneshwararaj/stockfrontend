<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  export let data;

  let rawData = data?.getSectorCategory;

  let totalMarketCap = rawData?.reduce(
    (total, stock) => total + stock?.marketCap,
    0,
  );
  let totalRevenue = rawData?.reduce(
    (total, stock) => total + stock?.revenue,
    0,
  );
</script>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text={`The ${data?.getParams} sector has a total of ${rawData?.length} stocks, with a
    combined market cap of ${abbreviateNumber(totalMarketCap)} and a total revenue
    of ${abbreviateNumber(totalRevenue)}.`}
  />

  <div
    class="mt-6 mb-4 flex flex-col divide-y divide-gray-600 rounded-md border border-gray-600 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0"
  >
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-semibold text-white">Total Stocks</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white text-[1rem] sm:text-lg"
        >
          {new Intl.NumberFormat("en")?.format(rawData?.length)}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-semibold text-white">Total Market Cap</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white text-[1rem] sm:text-lg"
        >
          {abbreviateNumber(totalMarketCap)}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-semibold text-white">Total Revenue</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white text-[1rem] sm:text-lg"
        >
          {abbreviateNumber(totalRevenue)}
        </div>
      </div>
    </div>
  </div>

  <Table {data} rawData={data?.getSectorCategory} />
</section>
