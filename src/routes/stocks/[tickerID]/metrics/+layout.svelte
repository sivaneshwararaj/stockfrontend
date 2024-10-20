<script lang="ts">
  import { stockTicker, screenWidth } from "$lib/store";
  import { page } from "$app/stores";

  export let data;

  const names = data?.getBusinessMetrics?.revenue?.names;
  const subsectionTitles = ["Overview", ...names];

  const sectionMap = Object.fromEntries(
    subsectionTitles.map((title) => {
      const key = title.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
      return [key, key === "overview" ? "" : key];
    }),
  );

  let displaySubSection = "overview";

  function changeSubSection(state) {
    displaySubSection = state;
    const path =
      state === "overview" ? "/metrics" : `/metrics/${sectionMap[state]}`;
    // Navigate programmatically using SvelteKit's goto function
  }

  function getHref(section) {
    const path =
      section === "overview" ? "/metrics" : `/metrics/${sectionMap[section]}`;
    return `/stocks/${$stockTicker}${path}`;
  }

  $: {
    if ($page?.url?.pathname) {
      const parts = $page.url.pathname.split("/");

      // Filter out empty strings from URL parts and look for the section
      const foundSection = parts.find(
        (part) => part && Object.values(sectionMap).includes(part),
      );

      // If a valid section is found in the URL, update the displaySubSection
      displaySubSection =
        Object.keys(sectionMap).find(
          (key) => sectionMap[key] === foundSection,
        ) || "overview";
    }
  }
</script>

<!-- Rest of the component remains the same -->

<section
  class="w-auto max-w-5xl bg-[#09090B] overflow-hidden text-black h-full mb-40"
>
  <div class="m-auto h-full overflow-hidden">
    <main class="w-fit sm:w-full sm:max-w-2xl">
      <div class="m-auto">
        <div
          class="-ml-2 sm:ml-8 w-screen sm:w-full {$screenWidth < 640
            ? 'overflow-auto scrollbar'
            : ''} mb-2"
        >
          <ul
            class="pr-4 sm:pr-0 w-screen flex flex-row items-center bg-[#09090B] overflow-x-scroll sm:overflow-hidden space-x-4 rtl:space-x-reverse py-2"
          >
            {#each subsectionTitles as title}
              {@const sectionKey = title
                .toLowerCase()
                .replace(/ & /g, "-")
                .replace(/ /g, "-")}
              <li class="cursor-pointer flex flex-col items-center">
                <a
                  href={getHref(sectionKey)}
                  on:click={() => changeSubSection(sectionKey)}
                  class="px-2 text-sm sm:text-[1rem] whitespace-nowrap font-medium text-gray-400 sm:hover:text-white {displaySubSection ===
                  sectionKey
                    ? 'text-white'
                    : 'bg-[#09090B]'}"
                >
                  {title}
                </a>
                <div
                  class="{displaySubSection === sectionKey
                    ? 'bg-[#75D377]'
                    : 'bg-[#09090B]'} mt-1 h-[3px] rounded-full w-[3rem]"
                />
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </main>

    <slot />
  </div>
</section>

<style>
  .scrollbar {
    display: grid;
    grid-gap: 18px;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    grid-auto-flow: column;
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }

  .scrollbar::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: transparent;
  }
</style>
