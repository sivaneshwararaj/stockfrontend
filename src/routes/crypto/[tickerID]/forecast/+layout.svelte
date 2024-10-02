<script lang="ts">
  import { stockTicker, screenWidth } from "$lib/store";
  import { onDestroy } from "svelte";
  import { page } from "$app/stores";

  let displaySubSection = "overview";

  if (displaySubSection) {
    const parts = $page?.url?.pathname.split("/");
    const sectionMap = {
      overview: "overview",
      ai: "ai",
      analyst: "analyst",
    };

    const foundSection = parts?.find((part) => Object?.values(sectionMap)?.includes(part));

    displaySubSection = Object?.keys(sectionMap)?.find((key) => sectionMap[key] === foundSection) || "overview";
  }

  function changeSubSection(state) {
    const subSectionMap = {
      overview: "/forecast",
      ai: "/forecast/ai",
      analyst: "/forecast/analyst",
    };


    if (state !== "overview" && subSectionMap[state]) {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}${subSectionMap[state]}`);
    } else {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}/stats`);
    }
  }

  const unsubscribe = page.subscribe(($page) => {
    const splitRoute = $page.url.pathname.split("/");
    const routeState = splitRoute[splitRoute.length - 1] !== "forecast" ? splitRoute[splitRoute.length - 1] : "overview";

    changeSubSection(routeState);
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<section class="w-auto max-w-5xl bg-[#09090B] overflow-hidden text-black h-full mb-40">
  <div class="m-auto h-full overflow-hidden">
  
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
</style>
