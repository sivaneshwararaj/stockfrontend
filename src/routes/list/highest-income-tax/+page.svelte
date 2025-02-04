<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  const defaultList = [
    { name: "Income Tax", rule: "incomeTaxExpense" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Market Cap", rule: "marketCap" },
  ];
</script>

<SEO
  title={"The U.S. Companies That Pay The Most Taxes"}
  description={"A list of the biggest U.S. companies ranked by the total amount of income taxed payed"}
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text=" These are the biggest public companies in the US, sorted by how much they
    paid in corporate income taxes in the past 12 months."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getData} {defaultList} />
</section>
