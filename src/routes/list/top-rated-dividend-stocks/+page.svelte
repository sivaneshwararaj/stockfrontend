<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  export let data;

  const defaultList = [
    { name: "Dividend Yield", rule: "dividendYield" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Market Cap", rule: "marketCap" },
  ];
</script>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="This list highlights top-rated dividend stocks, each with an average 'buy'
    or 'strong buy' rating from at least 10 analysts. Every stock offers a
    dividend yield of at least 2% and a payout ratio below 60%, indicating
    sustainable dividends."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getDividendStocks} {defaultList} />
</section>
