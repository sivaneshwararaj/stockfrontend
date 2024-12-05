<script lang="ts">
  import { numberOfUnreadNotification, openPriceAlert } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";

  //import { enhance } from '$app/forms';
  import toast from "svelte-french-toast";
  import { goto } from "$app/navigation";
  import { screenWidth, newPriceAlertData } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import { Combobox } from "bits-ui";
  import PriceAlert from "$lib/components/PriceAlert.svelte";

  export let data;
  let timeoutId;
  let searchBarData = [];

  let addTicker = "";
  let addAssetType = "";

  let editMode = false;
  let numberOfChecked = 0;
  let deletePriceAlertList = [];

  let priceAlertList = data?.getPriceAlert;

  async function handleFilter(priceAlertId) {
    const filterSet = new Set(deletePriceAlertList);

    // Check if the new filter already exists in the list
    if (filterSet?.has(priceAlertId)) {
      // If it exists, remove it from the list
      filterSet?.delete(priceAlertId);
    } else {
      // If it doesn't exist, add it to the list
      filterSet?.add(priceAlertId);
    }
    deletePriceAlertList = Array?.from(filterSet);
    numberOfChecked = deletePriceAlertList?.length;
  }

  async function handleDeleteTickers() {
    if (numberOfChecked === 0) {
      toast.error(`You need to select symbols before you can delete them`, {
        style:
          "border-radius: 10px; background: #333; color: #fff;  padding: 12px; margin-top: 10px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);",
      });
    } else {
      priceAlertList = priceAlertList?.filter(
        (item) => !deletePriceAlertList?.includes(item?.id),
      );

      priceAlertList = [...priceAlertList];

      const postData = {
        priceAlertIdList: deletePriceAlertList,
      };

      const response = await fetch("/api/delete-price-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      deletePriceAlertList = [];
      numberOfChecked = 0;
      editMode = !editMode;
    }
  }

  async function handleAddAlert(event, ticker, assetType) {
    addTicker = ticker;
    addAssetType = assetType?.toLowerCase();
    const postData = {
      path: "get-quote",
      ticker: ticker,
    };

    const response = await fetch("/api/ticker-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    const output = await response?.json();

    data.getStockQuote = output;

    const clicked = document.getElementById("priceAlertModal");
    clicked?.dispatchEvent(new MouseEvent("click"));

    editMode = false;
    $openPriceAlert = true;

    inputValue = "";
    event?.preventDefault();
  }

  async function getPriceAlertList() {
    const response = await fetch("/api/get-price-alert", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let output = await response.json();
    output = output?.sort((a, b) => a?.symbol?.localeCompare(b?.symbol));
    priceAlertList = [...output];
  }

  $: charNumber = $screenWidth < 640 ? 15 : 40;

  $: {
    if (Object?.keys($newPriceAlertData)?.length > 0) {
      getPriceAlertList();
    }
  }

  function handleEditMode() {
    if (editMode === true) {
      deletePriceAlertList = [];
      numberOfChecked = 0;
    }
    editMode = !editMode;
  }

  let inputValue = "";
  let touchedInput = false;

  async function search() {
    clearTimeout(timeoutId); // Clear any existing timeout

    if (!inputValue.trim()) {
      // Skip if query is empty or just whitespace
      searchBarData = []; // Clear previous results
      return;
    }

    timeoutId = setTimeout(async () => {
      const response = await fetch(
        `/api/searchbar?query=${encodeURIComponent(inputValue)}&limit=10`,
      );
      searchBarData = await response?.json();
    }, 50); // delay
  }
</script>

<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Price
    Alert · stocknear</title
  >
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta
    name="description"
    content="Set a price alert and get instant notification."
  />
  <!-- Other meta tags -->
  <meta property="og:title" content="Price Alert · stocknear" />
  <meta
    property="og:description"
    content="Set a price alert and get instant notification."
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Price Alert · stocknear" />
  <meta
    name="twitter:description"
    content="Set a price alert and get instant notification."
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Price Alert</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Price Alerts
            </h1>
          </div>

          {#if priceAlertList?.length === 0}
            <div class="flex flex-col justify-center items-center m-auto pt-8">
              <span class="text-white font-bold text-white text-xl sm:text-3xl">
                No Alerts set
              </span>

              <span
                class="text-white text-sm sm:text-[1rem] m-auto p-4 text-center"
              >
                Create price alerts for your stocks that have the most potential
                in your opinion.
              </span>
              {#if !data?.user}
                <a
                  class="w-64 flex mt-10 justify-center items-center m-auto btn text-white bg-[#fff] sm:hover:bg-gray-300 transition duration-150 ease-in-out group"
                  href="/register"
                >
                  Get Started
                  <span
                    class="tracking-normal group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out"
                  >
                    <svg
                      class="w-4 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      ><g transform="rotate(90 12 12)"
                        ><g fill="none"
                          ><path
                            d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
                          /><path
                            fill="white"
                            d="M13.06 3.283a1.5 1.5 0 0 0-2.12 0L5.281 8.939a1.5 1.5 0 0 0 2.122 2.122L10.5 7.965V19.5a1.5 1.5 0 0 0 3 0V7.965l3.096 3.096a1.5 1.5 0 1 0 2.122-2.122L13.06 3.283Z"
                          /></g
                        ></g
                      ></svg
                    >
                  </span>
                </a>
              {/if}
            </div>
          {:else}
            <div
              class="w-full {$screenWidth < 640
                ? 'grid grid-cols-2'
                : ''} gap-x-3 gap-y-3 sm:gap-x-0 sm:gap-y-0 relative inline-block text-left w-full flex flex-col sm:flex-row items-center"
            >
              <div class="order-4 w-fit flex justify-end sm:ml-3">
                <div class="flex flex-row items-center justify-end">
                  {#if editMode}
                    <label
                      on:click={handleDeleteTickers}
                      class="border text-sm border-gray-600 mr-2 sm:ml-3 sm:mr-0 cursor-pointer inline-flex items-center justify-center space-x-1 whitespace-nowrap rounded-md py-2.5 pl-3 pr-4 font-semibold text-white bg-[#09090B] sm:hover:bg-[#09090B]/60 ease-out sm:hover:text-red-500"
                    >
                      <svg
                        class="inline-block w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        ><path
                          fill="white"
                          d="M10 5h4a2 2 0 1 0-4 0M8.5 5a3.5 3.5 0 1 1 7 0h5.75a.75.75 0 0 1 0 1.5h-1.32l-1.17 12.111A3.75 3.75 0 0 1 15.026 22H8.974a3.75 3.75 0 0 1-3.733-3.389L4.07 6.5H2.75a.75.75 0 0 1 0-1.5zm2 4.75a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0zM14.25 9a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75m-7.516 9.467a2.25 2.25 0 0 0 2.24 2.033h6.052a2.25 2.25 0 0 0 2.24-2.033L18.424 6.5H5.576z"
                        /></svg
                      >
                      <span class="ml-1 text-white text-sm">
                        {numberOfChecked}
                      </span>
                    </label>
                  {/if}
                  <label
                    on:click={handleEditMode}
                    class="border text-sm border-gray-600 sm:ml-3 cursor-pointer inline-flex items-center justify-center space-x-1 whitespace-nowrap rounded-md py-2.5 px-3 text-white bg-[#09090B] sm:hover:bg-[#27272A] ease-out sm:hover:text-red-500"
                  >
                    <svg
                      class="inline-block w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 1024 1024"
                      ><path
                        fill="white"
                        d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"
                      /><path
                        fill="white"
                        d="m469.952 554.24l52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"
                      /></svg
                    >
                    {#if !editMode}
                      <span class="ml-1 text-white text-sm sm:text-[1rem]">
                        Edit Watchlist
                      </span>
                    {:else}
                      <span class="ml-1 text-white text-sm sm:text-[1rem]">
                        Cancel
                      </span>
                    {/if}
                  </label>
                </div>
              </div>

              <div class="order-2 sm:order-1 w-full sm:w-fit">
                <Combobox.Root
                  items={searchBarData}
                  bind:inputValue
                  bind:touchedInput
                >
                  <div class="relative sm:ml-3 w-full">
                    <div
                      class="absolute inset-y-0 left-0 flex items-center pl-2.5"
                    >
                      <svg
                        class="h-4 w-4 text-icon xs:h-5 xs:w-5"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="3"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style="max-width: 40px"
                        aria-hidden="true"
                      >
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                    <Combobox.Input
                      on:input={search}
                      class="text-sm sm:text-[1rem] controls-input text-white bg-[#09090B] focus:outline-none border border-gray-600 rounded-md placeholder:text-white/80 px-3 py-2 pl-8 xs:pl-10 flex-grow w-full sm:min-w-56 max-w-xs"
                      placeholder="Add new stock"
                      aria-label="Add new stock"
                    />
                  </div>
                  {#if inputValue?.length !== 0}
                    <Combobox.Content
                      class="w-auto z-10 rounded-md border border-gray-700 bg-[#09090B] px-1 py-3 shadow-popover outline-none"
                      sideOffset={8}
                    >
                      {#each searchBarData as item}
                        <Combobox.Item
                          class="cursor-pointer text-white border-b border-gray-600 last:border-none flex h-fit w-auto select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm capitalize outline-none transition-all duration-75 data-[highlighted]:bg-[#27272A]"
                          value={item.symbol}
                          label={item.name}
                          on:click={(e) =>
                            handleAddAlert(e, item?.symbol, item?.type)}
                        >
                          <div class="flex flex-col items-start">
                            <span class="text-sm text-blue-400"
                              >{item?.symbol}</span
                            >
                            <span class="text-xs sm:text-sm text-white"
                              >{item?.name}</span
                            >
                          </div>
                        </Combobox.Item>
                      {:else}
                        <span class="block px-5 py-2 text-sm text-white">
                          No results found
                        </span>
                      {/each}
                    </Combobox.Content>
                  {/if}
                </Combobox.Root>
              </div>
            </div>
            <!--Start Table-->
            <div
              class="w-full rounded-md overflow-hidden overflow-x-scroll no-scrollbar"
            >
              <table
                class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto mt-4"
              >
                <!-- head -->
                <thead>
                  <tr class="">
                    <th class="text-white font-semibold text-sm">Symbol</th>
                    <th class="text-white font-semibold text-sm">Company</th>

                    <th class="text-white font-semibold text-end text-sm"
                      >Price Target</th
                    >
                    <th class="text-white font-semibold text-end text-sm">
                      Price</th
                    >
                    <th class="text-white font-semibold text-end text-sm"
                      >% Change</th
                    >
                    <th class="text-white font-semibold text-end text-sm"
                      >Volume</th
                    >
                  </tr>
                </thead>
                <tbody class="p-3">
                  {#each priceAlertList as item}
                    <!-- row -->
                    <tr
                      class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B]"
                    >
                      <td
                        on:click={() => handleFilter(item?.id)}
                        class="text-blue-400 font-medium text-sm sm:text-[1rem] whitespace-nowrap text-start border-b-[#09090B] flex flex-row items-center"
                      >
                        <input
                          type="checkbox"
                          checked={deletePriceAlertList?.includes(item?.id) ??
                            false}
                          class="{!editMode
                            ? 'hidden'
                            : ''} bg-[#2E3238] h-[18px] w-[18px] rounded-sm ring-offset-0 mr-3 cursor-pointer"
                        />
                        {#if !editMode}
                          <HoverStockChart
                            symbol={item?.symbol}
                            assetType={item?.assetType}
                          />
                        {:else}
                          {item?.symbol}
                        {/if}
                      </td>

                      <td
                        class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
                      >
                        {item?.name?.length > charNumber
                          ? item?.name?.slice(0, charNumber) + "..."
                          : item?.name}
                      </td>

                      <td
                        class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
                      >
                        {item?.targetPrice}
                      </td>

                      <td
                        class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
                      >
                        {item.price?.toFixed(2)}
                      </td>

                      <td
                        class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
                      >
                        {#if item?.changesPercentage >= 0}
                          <span class="text-[#00FC50]"
                            >+{item?.changesPercentage?.toFixed(2)}%</span
                          >
                        {:else}
                          <span class="text-[#FF2F1F]"
                            >{item?.changesPercentage?.toFixed(2)}%
                          </span>
                        {/if}
                      </td>
                      <td
                        class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
                      >
                        {abbreviateNumber(item?.volume)}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <!--End Table-->
          {/if}
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              on:click={() => goto("/pricing")}
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <div
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
              </div>
            </div>
          {/if}

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/watchlist/stocks"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Watchlist
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Build your watchlist to keep track of their performance.
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/stock-screener"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Stock Screener
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Build your Stock Screener to find profitable stocks.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>

<PriceAlert {data} ticker={addTicker} assetType={addAssetType} />
