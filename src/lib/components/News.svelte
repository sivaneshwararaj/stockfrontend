<script lang="ts">
  import { stockTicker } from "$lib/store";

  export let data;

  let rawData = [];
  let newsList = [];

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
  /*
  let videoId = null;

  function checkIfYoutubeVideo(link) {
    const url = new URL(link);
    if (url?.hostname === "www.youtube.com") {
      const searchParams = url.searchParams;
      searchParams.delete("t"); // Remove the "t" parameter
      const videoIdMatch = url?.search?.match(/v=([^&]+)/);

      if (videoIdMatch) {
        return videoIdMatch[1];
      }
    } else {
      return null;
    }
  }
*/
  function loadMoreData() {
    const nextIndex = newsList?.length;
    const newArticles = rawData?.slice(nextIndex, nextIndex + 20);
    newsList = [...newsList, ...newArticles];
  }

  $: {
    if ($stockTicker && typeof window !== "undefined") {
      rawData = data?.getNews;
      newsList = rawData?.slice(0, 20) ?? [];
    }
  }
</script>

<div class="space-y-3 overflow-hidden">
  <!--Start Content-->
  <div class="w-auto lg:w-full p-1 flex flex-col m-auto">
    <div class="flex flex-col items-center w-full mb-3">
      <div class="flex flex-row justify-start mr-auto items-center">
        <!--<img class="h-10 inline-block mr-2" src={copilotIcon} />-->
        <div class="flex flex-row items-center">
          <label
            class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold"
          >
            News
          </label>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-2 pb-5">
      {#each newsList as item}
        <div class="w-full flex flex-col bg-[#09090B] rounded-md m-auto">
          <!--
          {#if !checkIfYoutubeVideo(item.url)}
            <div class="w-full aspect-video mb-4">
              <iframe
                class="w-full h-full rounded-md border border-gray-800"
                src={`https://www.youtube.com/embed/${videoId}`}
                frameborder="0"
                allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
            <div class="w-full px-4 pb-4">
              <h3 class="text-sm text-white/80 mb-2">
                {formatDate(item?.publishedDate)} ago · {item?.site}
              </h3>
              <a
                href={item?.url}
                rel="noopener noreferrer"
                target="_blank"
                class="text-lg sm:text-xl font-bold text-white"
              >
                {item?.title}
                <p class="text-white text-sm mt-2 font-normal">
                  {item?.text}
                </p>
              </a>
            </div>
            -->
          <div class="w-full flex flex-col sm:flex-row">
            <a
              href={item?.url}
              rel="noopener noreferrer"
              target="_blank"
              class="w-full sm:max-w-56 h-fit max-h-96 sm:mr-3 border border-gray-800 rounded-md"
            >
              <div class="flex-shrink-0 m-auto">
                <img
                  src={item?.image}
                  class="h-auto w-full rounded-md"
                  alt="news image"
                  loading="lazy"
                />
              </div>
            </a>
            <div class="-mt-3 w-full">
              <h3 class="text-sm text-white/80 truncate mb-2 mt-3">
                {formatDate(item?.publishedDate)} ago · {item?.site}
              </h3>
              <a
                href={item?.url}
                rel="noopener noreferrer"
                target="_blank"
                class="text-lg sm:text-xl font-bold text-white"
              >
                {item?.title}
                <p class="text-white text-sm mt-2 font-normal">
                  {item?.text?.length > 200
                    ? item?.text?.slice(0, 200) + "..."
                    : item?.text}
                </p>
              </a>
            </div>
          </div>
        </div>
        <hr class="border-gray-600 w-full m-auto mt-5 mb-5" />
      {/each}
    </div>
    {#if newsList?.length !== rawData?.length}
      <label
        on:click={loadMoreData}
        class="shadow-lg rounded-md cursor-pointer w-5/6 sm:w-full sm:max-w-3xl flex justify-center items-center py-3 h-full text-sm sm:text-[1rem] text-center font-semibold text-white m-auto sm:hover:bg-purple-700 bg-purple-600"
      >
        Load More News
      </label>
    {/if}
  </div>
</div>
