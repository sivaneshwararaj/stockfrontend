<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  const defaultList = [
    { name: "RSI", rule: "rsi" },
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
    "rsi",
  ]);
</script>

<SEO
  title="Oversold Stocks List – RSI Indicator Analysis"
  description="Explore a list of oversold stocks based on the Relative Strength Index (RSI), a key technical indicator used to identify potential buying opportunities in the market."
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text=" A list of stocks that are oversold according to the Relative Strength
    Index (RSI), which is an indicator often used in technical analysis. An RSI
    of under 30 on a daily chart is generally used to determine that an asset is
    oversold and indicates that the stock may soon bounce back from the oversold
    conditions."
  />

  <!-- Page wrapper -->
  <Table
    {data}
    rawData={data?.getOverSoldStocks}
    {excludedRules}
    {defaultList}
  />
</section>
