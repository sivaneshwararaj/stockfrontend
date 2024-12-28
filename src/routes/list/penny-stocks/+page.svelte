<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  export let data;

  const defaultList = [
    { name: "Market Cap", rule: "marketCap" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Volume", rule: "volume" },
  ];
</script>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text=" A list of actively traded penny stocks, which are generally defined as
    stocks with a price below $5 per share. It is filtered to only show stocks
    with volume over 10K."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getPennyStocks} {defaultList} />
</section>
