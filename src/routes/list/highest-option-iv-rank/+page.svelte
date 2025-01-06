<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;

  const defaultList = [
    { name: "IV Rank", rule: "ivRank" },
    { name: "Total OI", rule: "totalOI" },
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
    "ivRank",
    "totalOI",
  ]);
</script>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="A list of stocks with the highest Implied Volatility (IV) Rank and a minimum of 1 million open interest (OI). IV Rank measures a stock's current implied volatility compared to its range over a specific period, helping identify potential opportunities in the options market."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getStocks} {excludedRules} {defaultList} />
</section>
