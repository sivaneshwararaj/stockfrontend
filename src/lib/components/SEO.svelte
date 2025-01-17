<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";

  export let title;
  export let description;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {title} - Stocknear
  </title>

  <meta name="description" content={description} />
  <!-- Other meta tags -->
  <meta property="og:title" content={`${title} - Stocknear`} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${title} - Stocknear`} />
  <meta name="twitter:description" content={description} />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>
