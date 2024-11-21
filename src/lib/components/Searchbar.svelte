<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { onMount } from "svelte";
  import Search from "lucide-svelte/icons/search";
  import { goto } from "$app/navigation";
  let searchHistory = [];
  let updatedSearchHistory = [];
  let searchBarData = [];

  let timeoutId;
  let assetType = "";
  let focusedSuggestion = "";
  let arrowMovement = false;
  let showSuggestions = false;
  let searchQuery = "";

  let searchOpen = false;
  let searchBarModalChecked = false; // Initialize it to false
  let inputElement;

  const popularList = [
    {
      symbol: "KO",
      name: "Coca Cola Company",
      type: "Stock",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc",
      type: "Stock",
    },
    {
      symbol: "AMD",
      name: "Advanced Micro Devices",
      type: "Stock",
    },
    {
      symbol: "SPY",
      name: "SPDR S&P 500 ETF Trust",
      type: "ETF",
    },
    {
      symbol: "NVDA",
      name: "Nvidia",
      type: "Stock",
    },
  ];

  async function popularTicker(state) {
    searchOpen = false;
    if (!state) return;

    // Convert state to uppercase once
    const upperState = state.toUpperCase();

    // Find the matching ticker data
    const newSearchItem = searchBarData?.find(
      ({ symbol }) => symbol === upperState,
    );

    if (newSearchItem) {
      // Ensure `upperState` matches the case of `item.symbol`
      updatedSearchHistory = [
        newSearchItem,
        ...(searchHistory?.filter(
          (item) => item?.symbol?.toUpperCase() !== upperState,
        ) || []),
      ].slice(0, 5);
    }

    // Close search modal
    const closePopup = document.getElementById("searchBarModal");
    closePopup?.dispatchEvent(new MouseEvent("click"));
  }

  function searchBarTicker(state) {
    showSuggestions = false;
    // Early return if state is empty or ticker not found
    if (
      !state ||
      !searchBarData?.find((item) => item?.symbol === state?.toUpperCase())
    ) {
      searchQuery = "";
      const closePopup = document.getElementById("searchBarModal");
      closePopup?.dispatchEvent(new MouseEvent("click"));
      return;
    }

    // Convert state to uppercase once
    const upperState = state.toUpperCase();

    // Find the matching ticker data
    const newSearchItem = searchBarData?.find(
      ({ symbol }) => symbol === upperState,
    );

    if (newSearchItem) {
      // Ensure `upperState` matches the case of `item.symbol`
      updatedSearchHistory = [
        newSearchItem,
        ...(searchHistory?.filter(
          (item) => item?.symbol?.toUpperCase() !== upperState,
        ) || []),
      ].slice(0, 5);
    }

    // Close search modal
    searchOpen = false;
    const closePopup = document.getElementById("searchBarModal");
    closePopup?.dispatchEvent(new MouseEvent("click"));

    searchQuery = "";
  }

  async function search() {
    clearTimeout(timeoutId); // Clear any existing timeout

    if (!searchQuery.trim()) {
      // Skip if query is empty or just whitespace
      searchBarData = []; // Clear previous results
      return;
    }

    timeoutId = setTimeout(async () => {
      const response = await fetch(
        `/api/searchbar?query=${encodeURIComponent(searchQuery)}&limit=10`,
      );
      searchBarData = await response?.json();
    }, 50); // delay
  }

  const onKeyPress = (e) => {
    if (e?.charCode === 13 && searchBarData?.length > 0) {
      const assetActions = {
        ETF: () => goto(`/etf/${searchQuery}`),
        Stock: () => goto(`/stocks/${searchQuery}`),
        Crypto: () => goto(`/crypto/${searchQuery}`),
      };
      if (!arrowMovement && searchBarData?.length > 0) {
        searchQuery = searchBarData.at(0).symbol;
        assetType = searchBarData.at(0).type;
      }

      // Call the function for the selected asset type
      assetActions[assetType]?.();

      // Trigger search bar action
      searchBarTicker(searchQuery);
    }
  };

  function handleKeyDown(event) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault(); // Prevent scrolling

    const list = showSuggestions
      ? searchBarData
      : searchHistory?.length > 0
        ? searchHistory
        : popularList;
    if (!list?.length) return;

    const currentIndex = list.findIndex((item) => item?.symbol === searchQuery);
    const isMovingDown = event.key === "ArrowDown";

    // Check if movement is within bounds
    const isValidMove = isMovingDown
      ? currentIndex < list.length - 1
      : currentIndex > 0;

    if (isValidMove) {
      arrowMovement = true;
      const newIndex = currentIndex + (isMovingDown ? 1 : -1);
      const selectedItem = list[newIndex];

      // Update all related states at once
      searchQuery = selectedItem?.symbol;
      assetType = selectedItem?.type;
      focusedSuggestion = selectedItem?.symbol;
    }
  }
  const handleControlD = async (event) => {
    if (event.ctrlKey && event.key === "k") {
      // Ctrl+F is pressed, open the modal
      const keyboardSearch = document.getElementById("searchBarModal");
      keyboardSearch?.dispatchEvent(new MouseEvent("click"));
      event.preventDefault();
    }
  };

  const handleEscape = (event) => {
    if (event.key === "Escape") {
      // Escape key is pressed, close the modal
      searchBarModalChecked = false;
    }
  };

  function saveRecentTicker() {
    try {
      // Save the version along with the rules
      localStorage?.setItem("search-history", JSON?.stringify(searchHistory));
    } catch (e) {
      console.log("Failed saving indicator rules: ", e);
    }
  }

  onMount(() => {
    try {
      const savedRules = localStorage?.getItem("search-history");

      if (savedRules) {
        searchHistory = JSON.parse(savedRules);
      }
    } catch (e) {
      console.log(e);
    }

    window.addEventListener("keydown", handleControlD);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleControlD);
      window.removeEventListener("keydown", handleEscape);
    };
  });

  let charNumber = 20;

  $: {
    if (searchBarModalChecked === true && typeof window !== "undefined") {
      if ($screenWidth > 640) {
        inputElement.focus();
      }
      //Page is not scrollable now
      document.body.classList.add("overflow-hidden");
    }
  }

  $: {
    if (searchBarModalChecked === false && typeof window !== "undefined") {
      showSuggestions = searchQuery = "";
      document.body.classList?.remove("overflow-hidden");
    }
  }

  $: {
    if (updatedSearchHistory?.length > 0 && searchBarModalChecked === false) {
      (async () => {
        // Add 500 ms delay is important otherwise bug since #each has searchHistory and updates too quickly and redirects to wrong symbol
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update search history after delay
        searchHistory = updatedSearchHistory;
        updatedSearchHistory = [];
        saveRecentTicker();
      })();
    }
  }

  $: {
    if (searchBarData) {
      if (searchBarData?.length > 0) {
        showSuggestions = true;
      } else {
        showSuggestions = false;
      }
    }
  }
</script>

<label
  for="searchBarModal"
  class="cursor-pointer p-2 sm:hover:bg-[#27272A] text-gray-300 sm:hover:text-white flex-shrink-0 flex items-center justify-center border border-gray-600 rounded-md"
>
  <Search class="h-[20px] w-[20px]" />
</label>

<!--Start Desktop Searchbar-->
<!--Don't remove if since input.focus does not work anymore-->

{#if $screenWidth >= 640}
  <input
    type="checkbox"
    id="searchBarModal"
    class="modal-toggle"
    bind:checked={searchBarModalChecked}
  />

  <dialog id="searchBarModal" class="modal modal-top z-[999]">
    <label for="searchBarModal" class="cursor-pointer modal-backdrop"></label>

    <div
      class="z-[999] modal-box overflow-hidden rounded-xl bg-[#09090B] border border-gray-600 sm:my-8 sm:m-auto sm:h-auto w-full sm:w-1/2 md:w-3/4 lg:w-1/2 2xl:w-1/3"
    >
      <!-- Search layout -->
      <div class="mt-5 sm:mt-0">
        <div class="relative">
          <label for="modal-search" class="sr-only">Search</label>
          <input
            id="modal-search"
            class="rounded-md w-full text-white bg-[#09090B] border border-gray-600 focus:ring-transparent placeholder-gray-200 py-3 pl-10 pr-4"
            type="search"
            placeholder="Search Anything…"
            bind:value={searchQuery}
            bind:this={inputElement}
            on:input={search}
            on:keydown={handleKeyDown}
            on:keypress={onKeyPress}
            autocomplete="off"
          />
          <button
            on:click={() => searchBarTicker(searchQuery)}
            class="absolute inset-0 right-auto group"
            type="submit"
            aria-label="Search"
          >
            <svg
              class="w-4 h-4 shrink-0 fill-current text-white ml-4 mr-2 text-slate-400"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z"
              />
              <path
                d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="py-4">
        <!-- Popular searches -->
        <div class="mb-3 last:mb-0 mt-3">
          {#if !showSuggestions}
            <div class="text-start text-sm font-semibold text-white mb-2">
              {searchHistory?.length > 0 ? "Recent" : "Popular"}
            </div>
          {/if}

          <ul class="text-sm">
            {#if !showSuggestions}
              {#each searchHistory?.length > 0 ? searchHistory : popularList as item}
                <li class="border-b border-gray-600">
                  <a
                    href={`/${item?.type === "ETF" ? "etf" : item?.type === "Crypto" ? "crypto" : "stocks"}/${item?.symbol}`}
                    on:click={() => popularTicker(item?.symbol)}
                    class="mb-2 {item?.symbol === focusedSuggestion
                      ? 'shake-ticker cursor-pointer flex justify-start items-center p-2 text-white bg-[#27272A] rounded group'
                      : 'shake-ticker cursor-pointer bg-[#09090B] sm:hover:bg-[#27272A] rounded-md flex justify-start items-center p-2 text-white  group'} w-full"
                  >
                    <div class="flex flex-row items-center w-full">
                      <div
                        class="rounded-full w-10 h-10 relative bg-[#000] flex items-center justify-center"
                      >
                        <img
                          style="clip-path: circle(50%);"
                          class="w-6 h-6"
                          src={`https://financialmodelingprep.com/image-stock/${item?.symbol}.png`}
                          loading="lazy"
                        />
                      </div>
                      <div class="flex flex-col ml-2">
                        <span class="text-blue-400">{item?.symbol}</span>
                        <span class="text-white"
                          >{item?.name.length > 150
                            ? item?.name?.slice(0, 150) + "..."
                            : item?.name}</span
                        >
                      </div>

                      <div class="text-white font-medium ml-auto">
                        {item?.type}
                      </div>
                    </div>
                  </a>
                </li>
              {/each}
            {:else if showSuggestions && searchBarData?.length > 0}
              <div class="text-start text-sm font-semibold text-white mb-2">
                Suggestions
              </div>
              {#each searchBarData as item}
                <li class="border-b border-gray-600">
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <!-- svelte-ignore a11y-label-has-associated-control -->
                  <a
                    href={`/${item?.type === "ETF" ? "etf" : item?.type === "Crypto" ? "crypto" : "stocks"}/${item?.symbol}`}
                    on:click={() => searchBarTicker(item?.symbol)}
                    class="mb-2 {item?.symbol === focusedSuggestion
                      ? 'shake-ticker cursor-pointer flex justify-start items-center p-2 text-white bg-[#27272A] rounded group'
                      : 'cursor-pointer mb-2 bg-[#09090B] sm:hover:bg-[#27272A] rounded-md flex justify-start items-center p-2 text-white group'}"
                  >
                    <div class="flex flex-row items-center w-full">
                      <div class="flex flex-col">
                        <span class="text-blue-400">{item?.symbol}</span>
                        <span class="text-white"
                          >{item?.name?.length > 150
                            ? item?.name?.slice(0, 150) + "..."
                            : item?.name}</span
                        >
                      </div>

                      <div class="text-white font-medium ml-auto">
                        {item?.type}
                      </div>
                    </div>
                  </a>
                </li>
              {/each}
            {:else if showSuggestions && searchBarData?.length === 0}
              <li>
                <label
                  class="flex items-center p-2 text-white hover:text-white hover:bg-[#27272A] rounded group"
                >
                  <svg
                    class="w-3 h-3 fill-slate-400 shrink-0 mr-3 dark:fill-slate-500"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.953 4.29a.5.5 0 0 0-.454-.292H6.14L6.984.62A.5.5 0 0 0 6.12.173l-6 7a.5.5 0 0 0 .379.825h5.359l-.844 3.38a.5.5 0 0 0 .864.445l6-7a.5.5 0 0 0 .075-.534Z"
                    />
                  </svg>
                  <span>No results found</span>
                </label>
              </li>
            {/if}
          </ul>
        </div>
      </div>

      <label for="searchBarModal" class="absolute left-6 top-4 sm:hidden">
        <svg
          class="w-6 h-6 inline-block mb-0.5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          ><path
            fill="#fff"
            d="M9.125 21.1L.7 12.7q-.15-.15-.213-.325T.425 12q0-.2.063-.375T.7 11.3l8.425-8.425q.35-.35.875-.35t.9.375q.375.375.375.875t-.375.875L3.55 12l7.35 7.35q.35.35.35.863t-.375.887q-.375.375-.875.375t-.875-.375Z"
          /></svg
        >
        <span class="text-white text-md font-medium"> Return </span>
      </label>
    </div>
  </dialog>
{:else}
  <!--End Desktop Searchbar-->

  <!--Start Drawer Sidewise for mobile-->

  <div class="drawer drawer-end z-40 overflow-hidden">
    <input
      id="searchBarModal"
      type="checkbox"
      class="drawer-toggle"
      bind:checked={searchBarModalChecked}
    />

    <div class="drawer-side overflow-hidden">
      <div
        class="p-3 bg-[#09090B] min-h-screen w-screen pb-20 overflow-hidden pt-10"
      >
        <!-- Search layout -->
        <div class="mt-5 lg:mt-0">
          <div class="relative">
            <label for="modal-search" class="sr-only">Search</label>
            <input
              id="modal-search"
              class="rounded-md w-full text-white bg-[#09090B] border border-slate-800 focus:ring-transparent placeholder-gray-200 py-3 pl-10 pr-4"
              type="search"
              placeholder="Search Anything…"
              bind:value={searchQuery}
              bind:this={inputElement}
              on:input={search}
              on:keydown={handleKeyDown}
              on:keypress={onKeyPress}
              autocomplete="off"
            />
            <button
              on:click={() => searchBarTicker(searchQuery)}
              class="absolute inset-0 right-auto group"
              type="submit"
              aria-label="Search"
            >
              <svg
                class="w-4 h-4 shrink-0 fill-current text-white ml-4 mr-2 text-slate-400"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z"
                />
                <path
                  d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="py-4">
          <!-- Popular searches -->
          <div class="mb-3 last:mb-0 mt-3">
            {#if !showSuggestions}
              <div class="text-start text-sm font-semibold text-white mb-2">
                {searchHistory?.length > 0 ? "Recent" : "Popular"}
              </div>
            {/if}
            <ul class="text-sm">
              {#if !showSuggestions}
                {#each searchHistory?.length > 0 ? searchHistory : popularList as item}
                  <li class="border-b border-gray-600">
                    <a
                      href={`/${item?.type === "ETF" ? "etf" : item?.type === "Crypto" ? "crypto" : "stocks"}/${item?.symbol}`}
                      on:click={() => popularTicker(item?.symbol)}
                      class="mb-2 {item?.symbol === focusedSuggestion
                        ? 'shake-ticker cursor-pointer flex justify-start items-center p-2 text-white bg-[#27272A] rounded group'
                        : 'cursor-pointer bg-[#09090B] bg-opacity-[0.4] rounded-md flex justify-start items-center p-2 text-white group'} w-full"
                    >
                      <div class="flex flex-row items-center w-full">
                        <div
                          class="rounded-full w-10 h-10 relative bg-[#000] flex items-center justify-center"
                        >
                          <img
                            style="clip-path: circle(50%);"
                            class="w-6 h-6"
                            src={`https://financialmodelingprep.com/image-stock/${item?.symbol}.png`}
                            loading="lazy"
                          />
                        </div>
                        <div class="flex flex-col ml-2">
                          <span class="text-blue-400">{item?.symbol}</span>
                          <span class="text-white"
                            >{item?.name.length > charNumber
                              ? item?.name.slice(0, charNumber) + "..."
                              : item?.name}</span
                          >
                        </div>

                        <div class="text-white font-medium ml-auto mr-2">
                          {item?.type}
                        </div>
                      </div>
                    </a>
                  </li>
                {/each}
              {:else if showSuggestions && searchBarData?.length > 0}
                <div class="text-start text-sm font-semibold text-white mb-2">
                  Suggestions
                </div>
                {#each searchBarData as item}
                  <li class="border-b border-gray-600">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <a
                      href={`/${item?.type === "ETF" ? "etf" : item?.type === "Crypto" ? "crypto" : "stocks"}/${item?.symbol}`}
                      on:click={() => searchBarTicker(item?.symbol)}
                      class="mb-2 {item?.symbol === focusedSuggestion
                        ? 'shake-ticker cursor-pointer flex justify-start items-center p-2 text-white bg-[#27272A] rounded group'
                        : 'cursor-pointer mb-2 bg-[#09090B] bg-opacity-[0.4] rounded-md flex justify-start items-center p-2 text-white group'}"
                    >
                      <div class="flex flex-row items-center w-full">
                        <div class="flex flex-col ml-1">
                          <span class="text-blue-400">{item?.symbol}</span>
                          <span class="text-white"
                            >{item?.name.length > charNumber
                              ? item?.name.slice(0, charNumber) + "..."
                              : item?.name}</span
                          >
                        </div>

                        <div class="text-white font-medium ml-auto mr-2">
                          {item?.type}
                        </div>
                      </div>
                    </a>
                  </li>
                {/each}
              {:else if showSuggestions && searchBarData?.length === 0}
                <li>
                  <label
                    class="flex items-center p-2 text-white hover:text-white hover:bg-[#27272A] rounded group"
                  >
                    <svg
                      class="w-3 h-3 fill-slate-400 shrink-0 mr-3 dark:fill-slate-500"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.953 4.29a.5.5 0 0 0-.454-.292H6.14L6.984.62A.5.5 0 0 0 6.12.173l-6 7a.5.5 0 0 0 .379.825h5.359l-.844 3.38a.5.5 0 0 0 .864.445l6-7a.5.5 0 0 0 .075-.534Z"
                      />
                    </svg>
                    <span>No results found</span>
                  </label>
                </li>
              {/if}
            </ul>
          </div>
        </div>

        <label for="searchBarModal" class="absolute left-6 top-4 sm:hidden">
          <svg
            class="w-6 h-6 inline-block mb-0.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            ><path
              fill="#fff"
              d="M9.125 21.1L.7 12.7q-.15-.15-.213-.325T.425 12q0-.2.063-.375T.7 11.3l8.425-8.425q.35-.35.875-.35t.9.375q.375.375.375.875t-.375.875L3.55 12l7.35 7.35q.35.35.35.863t-.375.887q-.375.375-.875.375t-.875-.375Z"
            /></svg
          >
        </label>
      </div>
    </div>
  </div>
{/if}

<!--End Drawer Sidewise for mobile-->
