<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";

  export let data;

  const defaultList = [
    { name: "RSI", rule: "rsi" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Market Cap", rule: "marketCap" },
  ];
</script>

<section class="w-full overflow-hidden m-auto">
  <div
    class="w-full sm:flex sm:flex-row sm:items-center m-auto text-gray-100 border border-gray-800 sm:rounded-md h-auto p-5 mb-4"
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

    A list of stocks that are "oversold" according to the Relative Strength
    Index (RSI), which is an indicator often used in technical analysis. An RSI
    of under 30 on a daily chart is generally used to determine that an asset is
    oversold and indicates that the stock may soon bounce back from the oversold
    conditions. See also the list of overbought stocks.
  </div>

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getOverSoldStocks} {defaultList} />
</section>
