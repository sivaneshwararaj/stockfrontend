<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

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

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="A list of stocks that are overbought according to the Relative Strength
    Index (RSI), which is an indicator often used in technical analysis. An RSI
    of over 70 on a daily chart is generally used to determine that an asset is
    overbought and indicates that the stock may soon reverse to the downside."
  />

  <!-- Page wrapper -->
  <Table
    {data}
    rawData={data?.getOverBoughtStocks}
    {excludedRules}
    {defaultList}
  />
</section>
