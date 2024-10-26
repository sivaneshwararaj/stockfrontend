<script lang="ts">
  import TickerInfoCard from "$lib/components/TickerInfoCard.svelte";
  import AnalystCard from "$lib/components/AnalystCard.svelte";
  //import ESGCard from '$lib/components/ESGCard.svelte';
  import SimilarTickerCard from "$lib/components/SimilarTickerCard.svelte";
  import TopETFTickerHolder from "$lib/components/TopETFTickerHolder.svelte";

  export let data;
  export let stockDeck;
  export let lastPrice;
  export let similarstock;
  export let topETFHolder;
  export let analystRating;
</script>

<TickerInfoCard {data} {stockDeck} />

<AnalystCard {lastPrice} {analystRating} />

<!--<ESGCard stockDeck={stockDeck} />-->

<!--<SimilarTickerCard similarstock={similarstock}/>-->

<!--<TopETFTickerHolder topETFHolder={topETFHolder}/>-->
