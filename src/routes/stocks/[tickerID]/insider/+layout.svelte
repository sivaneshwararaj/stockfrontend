<script lang="ts">
  import { stockTicker, screenWidth } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  import { page } from "$app/stores";

  export let data;

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

  let displaySubSection = "";

  if (!displaySubSection || displaySubSection.length === 0) {
    const parts = $page?.url?.pathname.split("/");
    const sectionMap = {
      "congress-trading": "congress-trading",
      transcripts: "transcripts",
    };

    const foundSection = parts?.find((part) =>
      Object?.values(sectionMap)?.includes(part),
    );

    displaySubSection =
      Object?.keys(sectionMap)?.find(
        (key) => sectionMap[key] === foundSection,
      ) || "insider";
  }

  function changeSubSection(state) {
    const subSectionMap = {
      "congress-trading": "/insider/congress-trading",
      transcripts: "/insider/transcripts",
    };

    if (state !== "insider" && subSectionMap[state]) {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}${subSectionMap[state]}`);
    } else {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}/insider`);
    }
  }
</script>

<section class="w-auto overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4">
          <div
            class="sm:ml-8 w-screen sm:w-full {$screenWidth < 640
              ? 'overflow-auto scrollbar no-scrollbar'
              : ''} mb-2"
          >
            <ul
              class="pr-4 sm:pr-0 w-screen flex flex-row items-center bg-[#09090B] overflow-x-scroll space-x-6 rtl:space-x-reverse py-2"
            >
              <li class="cursor-pointer flex flex-col items-center">
                <a
                  href={`/stocks/${$stockTicker}/insider`}
                  on:click={() => changeSubSection("insider")}
                  class="text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySubSection ===
                  'insider'
                    ? 'text-white '
                    : 'bg-[#09090B]'}"
                >
                  Insider Trading
                </a>
                <div
                  class="{displaySubSection === 'insider'
                    ? 'bg-[#75D377]'
                    : 'bg-[#09090B]'} mt-1 h-[3px] rounded-full w-[5rem]"
                />
              </li>
              <li class="cursor-pointer flex flex-col items-center">
                <a
                  href={`/stocks/${$stockTicker}/insider/congress-trading`}
                  on:click={() => changeSubSection("congress-trading")}
                  class="text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySubSection ===
                  'congress-trading'
                    ? 'text-white '
                    : 'bg-[#09090B]'}"
                >
                  Congress Trading
                </a>
                <div
                  class="{displaySubSection === 'congress-trading'
                    ? 'bg-[#75D377]'
                    : 'bg-[#09090B]'} mt-1 h-[3px] rounded-full w-[5rem]"
                />
              </li>
              <li class="cursor-pointer flex flex-col items-center">
                <a
                  href={`/stocks/${$stockTicker}/insider/transcripts`}
                  on:click={() => changeSubSection("transcripts")}
                  class="text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySubSection ===
                  'transcripts'
                    ? 'text-white '
                    : 'bg-[#09090B]'}"
                >
                  Transcripts
                </a>
                <div
                  class="{displaySubSection === 'transcripts'
                    ? 'bg-[#75D377]'
                    : 'bg-[#09090B]'} mt-1 h-[3px] rounded-full w-[3.5rem]"
                />
              </li>
            </ul>
          </div>
          <slot />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href="/pricing"
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Pro Subscription
                  </h2>
                  <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Upgrade now for unlimited access to all data and tools.
                </span>
              </a>
            </div>
          {/if}

          {#if data?.getNews?.length !== 0}
            <div
              class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
            >
              <div class="p-4 text-sm">
                <h3 class="text-lg text-white font-semibold mb-3">
                  {$stockTicker} News
                </h3>
                <ul class="text-gray-200">
                  {#each data?.getNews?.slice(0, 10) as item}
                    <li class="mb-3 last:mb-1">
                      {formatDate(item?.publishedDate)} ago -
                      <a
                        class="sm:hover:text-white text-blue-400"
                        href={item?.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow">{item?.title}</a
                      >
                      - {item?.site}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
        </aside>
      </div>
    </div>
  </div>
</section>

<style lang="scss">
  .scrollbar {
    display: grid;
    grid-gap: 17px;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    grid-auto-flow: column;
    overflow-x: auto;
    scrollbar-width: thin; /* Hide the default scrollbar in Firefox */
    scrollbar-color: transparent transparent; /* Hide the default scrollbar in Firefox */
  }

  /* Custom scrollbar for Webkit (Chrome, Safari) */
  .scrollbar::-webkit-scrollbar {
    width: 0; /* Hide the width of the scrollbar */
    height: 0; /* Hide the height of the scrollbar */
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: transparent; /* Make the thumb transparent */
  }

  ::-webkit-scrollbar {
    height: 7px;
    width: 10px;
    background: #09090b;
  }

  ::-webkit-scrollbar-thumb {
    background: #6b6f79;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
  }

  ::-webkit-scrollbar-corner {
    background: #09090b;
  }
</style>
