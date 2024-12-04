<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";

  export let data;

  const defaultList = [
    { name: "Short % Float", rule: "shortFloatPercent" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Market Cap", rule: "marketCap" },
  ];

  const excludedRules = new Set([
    "volume",
    "price",
    "changesPercentage",
    "revenue",
    "eps",
    "marketCap",
    "shortFloatPercent",
  ]);
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

    A list of the stocks with the highest number of shares shorted relative to
    the stock's float. Float is the amount of shares that are considered
    available for trading.
  </div>

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getStocks} {excludedRules} {defaultList} />
</section>
