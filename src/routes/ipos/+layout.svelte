<script lang="ts">
  import { page } from "$app/stores";
  import { numberOfUnreadNotification } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { goto } from "$app/navigation";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let navigation = [];
  let displaySection = "2025";
  let ipoNews = data?.getNews?.slice(0, 10);

  for (let year = 2025; year >= 2019; year--) {
    navigation?.push({ title: year, link: `/ipos/${year}` });
  }

  $: {
    if ($page.url.pathname) {
      const parts = $page?.url?.pathname?.split("/");
      const sectionMap = {
        "2025": "2025",
        "2024": "2024",
        "2023": "2023",
        "2022": "2022",
        "2021": "2021",
        "2020": "2020",
        "2019": "2019",
      };
      displaySection =
        sectionMap[
          parts?.find((part) => Object?.keys(sectionMap)?.includes(part))
        ] || "overview";
    }
  }
</script>

<!-- HEADER FOR BETTER SEO -->
<SEO
  title="IPOs
    Calendar"
  description="A list of upcoming ipos on the US stock market."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pt-5 px-4 lg:px-3 mb-20"
>
  <div class="text-sm breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Recent IPOs</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-10">
          <div class="mb-5">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Recent IPOs
            </h1>
          </div>

          <div
            class="w-full {$page?.url?.pathname === '/ipos'
              ? 'hidden'
              : ''} mb-2"
          >
            <nav class="border-b-[2px] overflow-x-scroll whitespace-nowrap">
              <ul
                class="flex flex-row items-center w-full text-[1rem] sm:text-lg text-white"
              >
                <a
                  href={`/ipos`}
                  on:click={() => (displaySection = "recent")}
                  class="p-2 px-5 cursor-pointer {displaySection === 'recent'
                    ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
                >
                  Recent
                </a>
                <a
                  href={`/ipos/news`}
                  on:click={() => (displaySection = "news")}
                  class="p-2 px-5 cursor-pointer {displaySection === 'news'
                    ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
                >
                  News
                </a>
              </ul>
            </nav>

            <nav class=" overflow-x-scroll whitespace-nowrap">
              <ul
                class="flex flex-row items-center w-full text-[1rem] text-white"
              >
                {#each ["2025", "2024", "2023", "2022", "2021", "2020", "2019"] as item}
                  <a
                    href={`/ipos/${item}`}
                    on:click={() => (displaySection = item)}
                    class="p-2 px-5 cursor-pointer {displaySection === item
                      ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                      : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
                  >
                    {item}
                  </a>
                {/each}
              </ul>
            </nav>
          </div>

          <slot />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4">
          {#if ipoNews?.length !== 0}
            <div
              class="w-full sm:hover:text-white text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit"
            >
              <div class="p-4 text-sm">
                <h3 class="text-xl text-white font-bold mb-3">IPO News</h3>
                <ul class="text-white">
                  {#each ipoNews?.slice(0, 10) as item}
                    <li class="mb-3 last:mb-1">
                      {item?.timestamp}
                      <br />
                      <a
                        class="sm:hover:text-white text-blue-400"
                        href={item?.link}
                        target="_blank"
                        rel="noopener noreferrer nofollow">{item?.title}</a
                      >
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

  .navmenu {
    display: flex;
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    white-space: nowrap;
  }
</style>
