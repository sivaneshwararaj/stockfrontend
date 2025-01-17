<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  const defaultList = [
    { name: "Total OI", rule: "totalOI" },
    { name: "Change OI", rule: "changeOI" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "IV Rank", rule: "ivRank" },
    { name: "Total Prem", rule: "totalPrem" },
  ];

  const excludedRules = new Set([
    "volume",
    "price",
    "changesPercentage",
    "revenue",
    "eps",
    "changeOI",
    "totalOI",
    "totalPrem",
    "ivRank",
  ]);
</script>

<SEO
  title="Top US Companies with the Highest Open Interest Change"
  description="Explore the largest US companies ranked by their highest open interest change."
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="A list of stocks with the highest changes in open interest (OI). Open interest represents the total number of outstanding options contracts available for trading."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getStocks} {excludedRules} {defaultList} />
</section>
