<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

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

<SEO
  title="Most Shorted Stocks – High Short Interest Shares"
  description="Discover the most shorted stocks with the highest short interest relative to float. Learn how short sellers target these stocks and what it means for investors."
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="A list of the stocks with the highest number of shares shorted relative to
    the stock's float. Float is the amount of shares that are considered
    available for trading."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getStocks} {excludedRules} {defaultList} />
</section>
