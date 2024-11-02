<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import { onMount } from "svelte";

  export let data;

  let rawData = data?.getGeneralNews;
  let news = rawData.slice(0, 15) ?? [];

  const formatDate = (dateString) => {
    // Create a date object for the input dateString
    const inputDate = new Date(dateString);

    // Create a date object for the current time in New York City
    const nycTime = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const currentNYCDate = new Date(nycTime);

    // Calculate the difference in milliseconds
    const difference = inputDate.getTime() - currentNYCDate.getTime();

    // Convert the difference to minutes
    const minutes = Math.abs(Math.round(difference / (1000 * 60)));

    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes < 1440) {
      const hours = Math.round(minutes / 60);
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      const days = Math.round(minutes / 1440);
      return `${days} day${days !== 1 ? "s" : ""}`;
    }
  };

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && news?.length !== rawData?.length) {
      const nextIndex = news?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      news = [...news, ...filteredNewResults];
    }
  }

  onMount(async () => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  let videoId = null;

  function checkIfYoutubeVideo(link) {
    const url = new URL(link);
    if (url.hostname === "www.youtube.com") {
      const searchParams = url.searchParams;
      searchParams?.delete("t"); // Remove the "t" parameter
      const videoIdMatch = url?.search?.match(/v=([^&]+)/);

      if (videoIdMatch) {
        return videoIdMatch[1];
      }
    } else {
      return null;
    }
  }
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Today's
    General News and Breaking Stories · stocknear
  </title>
  <meta
    name="description"
    content={`Get the latest general news and breaking stories from the world's best finance and investing websites.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`Today's General News and Breaking Stories · stocknear`}
  />
  <meta
    property="og:description"
    content={`Get the latest general news and breaking stories from the world's best finance and investing websites.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`Today's General News and Breaking Stories · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get the latest general news and breaking stories from the world's best finance and investing websites.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full overflow-hidden m-auto mt-10">
  <div class="flex justify-center w-full m-auto overflow-hidden">
    <div class="relative flex justify-center items-center overflow-hidden">
      <main>
        <div class="w-full m-auto">
          <div class="grid grid-cols-1 gap-y-3">
            {#if news?.length !== 0}
              {#each news as item}
                <div class="w-full flex flex-col bg-[#09090B] m-auto">
                  {#if (videoId = checkIfYoutubeVideo(item?.url))}
                    <div class="w-full mb-4">
                      <h3 class="text-sm text-white/80 mb-2">
                        {formatDate(item?.datetime * 1000)} ago · {item?.source}
                      </h3>
                      <a
                        href={item?.url}
                        rel="noopener noreferrer"
                        target="_blank"
                        class="text-lg sm:text-xl font-bold text-white"
                      >
                        {item?.headline}
                        <p class="text-white text-sm font-normal">
                          {item?.summary}
                        </p>
                      </a>
                    </div>
                    <div class="w-full aspect-video">
                      <iframe
                        class="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        frameborder="0"
                        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      ></iframe>
                    </div>
                  {:else}
                    <div class="w-full flex flex-col sm:flex-row">
                      <a
                        href={item?.url}
                        rel="noopener noreferrer"
                        target="_blank"
                        class="w-full sm:max-w-56 h-fit max-h-96 sm:mr-3"
                      >
                        <div class="flex-shrink-0 m-auto">
                          <img
                            src={item?.image}
                            class="h-auto w-full"
                            alt="news image"
                            loading="lazy"
                          />
                        </div>
                      </a>
                      <div class="w-full">
                        <h3 class="text-sm text-white/80 truncate mb-2 mt-3">
                          {formatDate(item?.datetime * 1000)} ago · {item?.source}
                        </h3>
                        <a
                          href={item?.url}
                          rel="noopener noreferrer"
                          target="_blank"
                          class="text-lg sm:text-xl font-bold text-white"
                        >
                          {item?.headline}
                          <p class="text-white text-sm mt-2 font-normal">
                            {item?.summary?.length > 200
                              ? item?.summary?.slice(0, 200) + "..."
                              : item?.summary}
                          </p>
                        </a>
                      </div>
                    </div>
                  {/if}
                </div>

                <hr class="border-gray-800 w-full m-auto mt-5 mb-5" />
              {/each}
            {/if}
          </div>
        </div>
      </main>
    </div>
  </div>
</section>
