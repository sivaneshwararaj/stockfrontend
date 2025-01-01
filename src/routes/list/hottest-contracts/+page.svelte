<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;

  const defaultList = [
    { name: "Total OI", rule: "totalOI" },
    { name: "Change OI", rule: "changeOI" },
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
    "changeOI",
    "totalOI",
  ]);
</script>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="A list of the stocks with the highest number of shares shorted relative to
    the stock's float. Float is the amount of shares that are considered
    available for trading."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getStocks} {excludedRules} {defaultList} />
</section>
