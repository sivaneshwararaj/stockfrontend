<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import { page } from "$app/stores";

  export let data;

  function handleMode(i) {
    activeIdx = i;
  }

  const tabs = [
    {
      title: "Overview",
    },
    {
      title: "Sectors",
    },
    {
      title: "Industries",
    },
  ];

  let activeIdx = 0;

  // Subscribe to the $page store to reactively update the activeIdx based on the URL
  $: if ($page.url.pathname === "/industry") {
    activeIdx = 0;
  } else if ($page.url.pathname.startsWith("/industry/sectors")) {
    activeIdx = 1;
  } else if ($page.url.pathname.startsWith("/industry/all")) {
    activeIdx = 2;
  }
</script>

<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Industry
    · stocknear</title
  >
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta name="description" content="Lists of stocks industry and sectors." />
  <!-- Other meta tags -->
  <meta property="og:title" content="Industry · stocknear" />
  <meta
    property="og:description"
    content="Lists of stocks industry and sectors."
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Industry · stocknear" />
  <meta
    name="twitter:description"
    content="Lists of stocks industry and sectors."
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 px-4 lg:px-3 mb-20"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li><span class="text-gray-300">Industry</span></li>
    </ul>
  </div>

  <div class="mt-10 sm:mt-5 w-full m-auto mb-10 bg-[#09090B] overflow-hidden">
    <div class="mb-6">
      <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
        Stock Sectors & Industries
      </h1>
    </div>

    <nav class="border-b-[2px] overflow-x-scroll whitespace-nowrap mb-5">
      <ul
        class="flex flex-row items-center w-full text-[1rem] sm:text-lg text-white"
      >
        {#each tabs as item, i}
          <a
            href={i === 0
              ? "/industry"
              : i === 1
                ? "/industry/sectors"
                : "/industry/all"}
            on:click={() => handleMode(i)}
            class="p-2 px-5 cursor-pointer {activeIdx === i
              ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
              : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
          >
            {item.title}
          </a>
        {/each}
      </ul>
    </nav>

    <div class="w-full flex flex-col justify-center items-center">
      <div class="flex justify-center w-full m-auto overflow-hidden">
        <main class="w-full">
          <slot />
        </main>
      </div>
    </div>
  </div>
</section>
