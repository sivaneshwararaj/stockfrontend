<script lang="ts">
  import { onMount } from "svelte";

  export let data; // Expect `data` to include necessary Plotly configuration.

  let plotContainer;
</script>

{@html data?.getData}

<style>
  .plot-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
  }
</style>
