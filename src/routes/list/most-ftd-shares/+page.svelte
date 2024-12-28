<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  export let data;

  const defaultList = [
    { name: "Relative FTD", rule: "relativeFTD" },
    { name: "FTD Shares", rule: "failToDeliver" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
  ];
</script>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="These are the biggest U.S. companies ranked by failed-to-deliver (FTD)
    shares, updated daily. 'Relative FTD' compares FTD shares to average trading
    volume, showing their significance in overall trading."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getData} {defaultList} />
</section>
