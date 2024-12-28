<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;

  const defaultList = [
    { name: "Employees", rule: "employees" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Market Cap", rule: "marketCap" },
  ];
</script>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="These are the biggest U.S. companies ranked by the total number of
    employees, updated daily. These are companies based in the United States of
    America and listed on the stock market."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getData} {defaultList} />
</section>
