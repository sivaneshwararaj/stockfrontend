<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import { page } from "$app/stores";

  export let data;

  const excludedRules = new Set([
    "volume",
    "price",
    "changesPercentage",
    "dividendYield",
    "eps",
    "marketCap",
  ]);

  const defaultList = [
    { name: "Market Cap", rule: "marketCap" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Dividend Yield", rule: "dividendYield" },
    { name: "Years", rule: "years" },
  ];

  $: text =
    $page?.url?.pathname === "/list/dividend/dividend-kings"
      ? "Dividend kings are companies that have been raising their dividend payments every year for 50 or more years. This is a list of all the dividend kings on the US stock market."
      : "Dividend aristocrats are companies in the S&P500 index that have been raising their dividends every year for 25 or more years. This is a list of all the dividend aristocrats.";
</script>

<section class="w-full overflow-hidden m-auto">
  <Infobox {text} />

  <!-- Page wrapper -->
  <Table
    {data}
    rawData={data?.getDividendCategory}
    {excludedRules}
    {defaultList}
  />
</section>
