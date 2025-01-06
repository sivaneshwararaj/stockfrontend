<script lang="ts">
  import Table from "$lib/components/Table/Table.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;

  const defaultList = [
    { name: "Total Prem", rule: "totalPrem" },

    { name: "IV Rank", rule: "ivRank" },
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
    "totalPrem",
  ]);
</script>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text="A list of stocks with the highest total options premium. This premium is the sum of all options contract premiums for each stock, reflecting the overall market sentiment and expectations for volatility."
  />

  <!-- Page wrapper -->
  <Table {data} rawData={data?.getStocks} {excludedRules} {defaultList} />
</section>
