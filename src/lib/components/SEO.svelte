<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";

  export let title;
  export let description;
  export let image;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
  />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {title} - Stocknear
  </title>

  <meta name="description" content={description} />

  <!-- Open Graph meta tags -->
  <meta property="og:title" content={`${title} - Stocknear`} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  {#if image}
    <meta property="og:image" content={image} />
    <meta property="og:image:alt" content={title} />
  {/if}

  <!-- Twitter meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${title} - Stocknear`} />
  <meta name="twitter:description" content={description} />
  {#if image}
    <meta name="twitter:image" content={image} />
  {/if}
</svelte:head>
