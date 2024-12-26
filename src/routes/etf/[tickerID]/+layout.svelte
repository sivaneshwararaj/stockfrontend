<script lang="ts">
  import {
    wsBidPrice,
    wsAskPrice,
    globalForm,
    screenWidth,
    openPriceAlert,
    currentPortfolioPrice,
    realtimePrice,
    isCrosshairMoveActive,
    currentPrice,
    priceIncrease,
    etfTicker,
    assetType,
    displayCompanyName,
    isOpen,
    shouldUpdatePriceChart,
    priceChartData,
  } from "$lib/store";

  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { page } from "$app/stores";
  import toast from "svelte-french-toast";
  import Markethour from "$lib/components/Markethour.svelte";
  import PriceAlert from "$lib/components/PriceAlert.svelte";

  export let data;
  $: $realtimePrice = data?.getStockQuote?.price?.toFixed(2);

  let previousRealtimePrice = null;
  let previousTicker;
  let socket;

  let isScrolled = false;
  let y;

  let userWatchList = data?.getUserWatchlist ?? [];
  let isTickerIncluded = false;
  //let userPortfolio = data?.getUserPortfolio ?? [];
  //let holdingShares = 0;
  //let availableCash = 0;

  let displaySection = "";

  function shareContent(url) {
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          url,
        })
        .then(() => console.log("Content shared successfully."))
        .catch((error) => console.log("Error sharing content:", error));
    } else {
      toast.error("Sharing is not supported by your device", {
        style: "background: #2A2E39; color: #fff;",
      });
    }
  }

  function changeSection(state) {
    const sectionMap = {
      insider: "/insider",
      options: "/options",
      dividends: "/dividends",
      statistics: "/statistics",
      metrics: "metrics",
      forecast: "/forecast",
      financials: "/financials",
      news: "/news",
    };

    if (state !== "overview" && sectionMap[state]) {
      displaySection = state;
      //goto(`/etf/${$etfTicker}${sectionMap[state]}`);
    } else {
      displaySection = "overview";
      //goto(`/etf/${$etfTicker}/`);
    }
  }

  async function toggleUserWatchlist(watchListId: string) {
    try {
      isTickerIncluded = !isTickerIncluded;

      const watchlistIndex = userWatchList?.findIndex(
        (item) => item?.id === watchListId,
      );

      if (watchlistIndex !== -1) {
        const existingTickerIndex =
          userWatchList[watchlistIndex]?.ticker?.indexOf($etfTicker);

        if (existingTickerIndex !== -1) {
          // If the $etfTicker exists, remove it from the array
          userWatchList[watchlistIndex]?.ticker?.splice(existingTickerIndex, 1);
        } else {
          // If the $etfTicker doesn't exist, add it to the array
          userWatchList[watchlistIndex]?.ticker?.push($etfTicker);
        }

        // Update the userWatchList
        userWatchList = [...userWatchList];
      }

      const postData = {
        watchListId: watchListId,
        ticker: $etfTicker,
      };

      const response = await fetch("/api/update-watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const output = await response.json();

      // Update the userWatchList with the response from the server
      if (watchlistIndex !== -1) {
        userWatchList[watchlistIndex] = output;
        userWatchList = [...userWatchList];
      } else {
        userWatchList = [...userWatchList, output];
      }
    } catch (error) {
      console.error("An error occurred:", error);
      // Handle the error appropriately (e.g., show an error message to the user)
    }
  }

  function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON?.stringify(message));
    } else {
      console.error("WebSocket is not open. Unable to send message.");
    }
  }

  async function websocketRealtimeData() {
    try {
      socket = new WebSocket(data?.wsURL + "/price-data");

      socket.addEventListener("open", () => {
        console.log("WebSocket connection opened");
        // Send only current watchlist symbols
        const tickerList = [$etfTicker?.toUpperCase()] || [];
        sendMessage(tickerList);
      });

      socket.addEventListener("message", (event) => {
        const data = event.data;
        //console.log("Received message:", data);
        try {
          const parsedData = JSON.parse(data);
          const { type, lp, time, bp, ap, avgPrice } = parsedData?.at(0) || {};

          if (type === "T") {
            $realtimePrice = typeof lp !== "undefined" ? lp : null;
            $priceChartData = {
              time: typeof time !== "undefined" ? time : null,
              price: typeof lp !== "undefined" ? Number(lp) : null,
            };
            shouldUpdatePriceChart.set(true);
          } else if (type === "Q") {
            $wsBidPrice = typeof bp !== "undefined" ? bp : null;
            $wsAskPrice = typeof ap !== "undefined" ? ap : null;
            $realtimePrice =
              typeof avgPrice !== "undefined" ? avgPrice?.toFixed(2) : null;
          }

          // Update price increase state
          if ($realtimePrice !== previousRealtimePrice) {
            $priceIncrease = $realtimePrice > previousRealtimePrice;
            previousRealtimePrice = $realtimePrice;
          }

          $isCrosshairMoveActive = false;
        } catch (e) {
          console.log(e);
        }
      });

      socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:", event.reason);
      });
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }

  let LoginPopup;

  $: if ($isOpen) {
    websocketRealtimeData();
  }

  onMount(async () => {
    if (!data?.user) {
      LoginPopup = (await import("$lib/components/LoginPopup.svelte")).default;
    }
  });

  afterUpdate(async () => {
    if (previousTicker !== $etfTicker && typeof socket !== "undefined") {
      previousTicker = $etfTicker;
      //socket.send('close')
      socket?.close();
      await new Promise((resolve, reject) => {
        socket?.addEventListener("close", resolve);
      });

      if (socket?.readyState === WebSocket?.CLOSED) {
        await websocketRealtimeData();
        console.log("connecting again");
      }
      $wsAskPrice = null;
      $wsBidPrice = null;
    }
  });

  onDestroy(() => {
    try {
      //socket?.send('close')
      socket?.close();
    } catch (e) {
      console.log(e);
    }

    //$displayCompanyName = '';
    $currentPortfolioPrice = null;
    $currentPrice = null;
    $priceIncrease = null;
    $wsAskPrice = null;
    $wsBidPrice = null;
    //$traded = false
  });

  $: {
    if (
      $etfTicker &&
      $etfTicker?.length !== 0 &&
      typeof window !== "undefined"
    ) {
      // add a check to see if running on client-side

      $currentPortfolioPrice = data?.getStockQuote?.price;
    }
  }

  $: isTickerIncluded = userWatchList?.some(
    (item) => item.user === data?.user?.id && item.ticker?.includes($etfTicker),
  );

  $: charNumber = $screenWidth < 640 ? 15 : 25;

  $: {
    if (
      $etfTicker &&
      typeof window !== "undefined" &&
      $page.url.pathname === `/etf/${$etfTicker}`
    ) {
      displaySection = "overview";
    }
  }

  $: {
    if ($page?.url?.pathname && typeof window !== "undefined") {
      const parts = $page?.url?.pathname?.split("/");
      const sectionMap = {
        holdings: "holdings",
        options: "options",
        insider: "insider",
        dividends: "dividends",
      };
      displaySection =
        sectionMap[
          parts?.find((part) => Object?.keys(sectionMap)?.includes(part))
        ] || "overview";
    }
  }

  $: isScrolled = y > 0;
</script>

<svelte:window bind:scrollY={y} />

<body
  class="bg-default w-full max-w-screen sm:max-w-7xl min-h-screen xl:max-w-screen-2xl overflow-hidden"
>
  <!-- Page wrapper -->
  <div class="flex flex-col w-full mt-5 relative w-full">
    <main class="grow w-full">
      <section class="w-full">
        <div class="w-full">
          <div class="sm:flex sm:justify-start w-full">
            <!--Start Mobile Navbar-->
            <div class="fixed top-0 left-0 right-0 z-20 bg-default sm:hidden">
              <div class="navbar w-full px-4 py-2">
                <div
                  class="{isScrolled
                    ? 'border-b border-gray-600 ease-in'
                    : 'ease-out'} m-auto w-full"
                >
                  <div
                    class="flex-1 flex-shrink-0 flex flex-row items-center justify-between -mt-2"
                  >
                    <a href="/" class="ml-2 cursor-pointer">
                      <svg
                        class="w-5 h-5 inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1024 1024"
                        ><g transform="rotate(-90 512 512)"
                          ><path
                            fill="white"
                            d="M104.704 685.248a64 64 0 0 0 90.496 0l316.8-316.8l316.8 316.8a64 64 0 0 0 90.496-90.496L557.248 232.704a64 64 0 0 0-90.496 0L104.704 594.752a64 64 0 0 0 0 90.496z"
                          /></g
                        ></svg
                      >
                    </a>

                    <div
                      class={!isScrolled
                        ? "hidden"
                        : "flex flex-col items-center ml-6 transition-transform ease-in"}
                    >
                      <span
                        class="text-white text-[0.70rem] font-medium text-opacity-[0.6]"
                      >
                        {$etfTicker}
                      </span>
                      <span class="text-white font-medium text-sm">
                        {#if $currentPortfolioPrice !== null && $currentPortfolioPrice !== 0}
                          {$currentPortfolioPrice}
                        {:else}
                          {data?.getStockQuote?.price}
                        {/if}
                      </span>
                    </div>

                    <!--Start Search Button-->
                    <label class="ml-auto mr-4" for="searchBarModal">
                      <svg
                        class="w-6 h-6 inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        ><path
                          fill="none"
                          stroke="white"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314"
                        /></svg
                      >
                    </label>
                    <!--End Search Button-->

                    <!--Start Share Button-->
                    <label
                      class="mr-4"
                      on:click={() =>
                        shareContent("https://stocknear.com/etf/" + $etfTicker)}
                    >
                      <svg
                        class="w-6 h-6 inline-block"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        stroke="#fff"
                        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g><g id="SVGRepo_iconCarrier">
                          <path
                            d="M20.3359 3.22136L3.87333 8.70889C3.56801 8.81066 3.55033 9.23586 3.84614 9.36263L9.89655 11.9557C9.96078 11.9832 10.0347 11.9752 10.0916 11.9346L16.0235 7.69749C16.2073 7.56618 16.4338 7.79266 16.3025 7.97648L12.0654 13.9084C12.0248 13.9653 12.0168 14.0392 12.0443 14.1034L14.6374 20.1539C14.7641 20.4497 15.1893 20.432 15.2911 20.1267L20.7786 3.66408C20.8698 3.39046 20.6095 3.13015 20.3359 3.22136Z"
                            fill="#fff"
                          ></path>
                        </g></svg
                      >
                    </label>
                    <!--End Share Button-->

                    <!--Start Watchlist-->

                    {#if data?.user}
                      <div class="flex flex-col mr-4">
                        {#if userWatchList?.length !== 0}
                          <label
                            for="addWatchListModal"
                            class="cursor-pointer flex-shrink-0"
                          >
                            {#if isTickerIncluded}
                              <svg
                                class="w-6 h-6 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                ><path
                                  fill="#fff"
                                  d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327l4.898.696c.441.062.612.636.282.95l-3.522 3.356l.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
                                /></svg
                              >
                            {:else}
                              <svg
                                class="w-6 h-6 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                ><path
                                  fill="white"
                                  d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                                /></svg
                              >
                            {/if}
                          </label>
                        {:else if userWatchList?.length === 0}
                          <label
                            on:click={() => toggleUserWatchlist("firstList")}
                            class="cursor-pointer flex-shrink-0"
                          >
                            {#if isTickerIncluded}
                              <svg
                                class="w-6 h-6 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                ><path
                                  fill="#fff"
                                  d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327l4.898.696c.441.062.612.636.282.95l-3.522 3.356l.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
                                /></svg
                              >
                            {:else}
                              <svg
                                class="w-6 h-6 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                ><path
                                  fill="white"
                                  d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                                /></svg
                              >
                            {/if}
                          </label>
                        {/if}
                      </div>
                    {:else}
                      <label
                        for="userLogin"
                        class="cursor-pointer flex-shrink-0 text-white mr-4"
                      >
                        <svg
                          class="w-6 h-6 inline-block"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          ><path
                            fill="white"
                            d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                          /></svg
                        >
                      </label>
                    {/if}
                    <!--End Watchlist-->

                    <!--Start Price Alert-->
                    <label
                      on:click={() => ($openPriceAlert = true)}
                      for={data?.user ? "priceAlertModal" : "userLogin"}
                      class="mr-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-7 h-7 inline-block mt-1"
                        viewBox="0 0 24 24"
                        ><g
                          fill="none"
                          stroke="white"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          ><path d="M3 5.231L6.15 3M21 5.231L17.85 3" /><circle
                            cx="12"
                            cy="13"
                            r="8"
                          /><path d="M9.5 13h5M12 10.5v5" /></g
                        ></svg
                      >
                    </label>
                    <!--End Price Alert -->
                  </div>
                </div>
              </div>
            </div>
            <!--End Mobile Navbar-->

            <div class="pt-14 sm:pt-0 w-full px-3 sm:px-0">
              <div
                class="md:flex md:justify-between md:divide-x md:divide-slate-800"
              >
                <!-- Main content -->
                <div class="pb-12 md:pb-20 w-full">
                  <div class="md:pr-6 lg:pr-10">
                    <!-----Start-Header-CandleChart-Indicators------>

                    <div
                      class="m-auto pl-0 sm:pl-4 overflow-hidden mb-3 md:mt-10 xl:pr-7"
                    >
                      <div
                        class="hidden sm:flex flex-row w-full justify-between items-center"
                      >
                        <Markethour />

                        <!--Start Watchlist-->

                        {#if data?.user}
                          <div class="flex flex-col ml-auto mr-2">
                            {#if userWatchList?.length !== 0}
                              <div
                                class="flex-shrink-0 rounded-full sm:hover:bg-white sm:hover:bg-opacity-[0.02] transition ease-out w-12 h-12 relative bg-default flex items-center justify-center"
                              >
                                <label
                                  for="addWatchListModal"
                                  class="cursor-pointer flex-shrink-0"
                                >
                                  {#if isTickerIncluded}
                                    <svg
                                      class="w-7 h-7 inline-block"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 16 16"
                                      ><path
                                        fill="#fff"
                                        d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327l4.898.696c.441.062.612.636.282.95l-3.522 3.356l.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
                                      /></svg
                                    >
                                  {:else}
                                    <svg
                                      class="w-7 h-7 inline-block"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 16 16"
                                      ><path
                                        fill="white"
                                        d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                                      /></svg
                                    >
                                  {/if}
                                </label>
                              </div>
                            {:else if userWatchList?.length === 0}
                              <div
                                class="flex-shrink-0 rounded-full hover:bg-white hover:bg-opacity-[0.02] transition ease-out w-12 h-12 relative bg-default flex items-center justify-center"
                              >
                                <label
                                  on:click={() =>
                                    toggleUserWatchlist("firstList")}
                                  class="cursor-pointer flex-shrink-0"
                                >
                                  {#if isTickerIncluded}
                                    <svg
                                      class="w-7 h-7 inline-block"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 16 16"
                                      ><path
                                        fill="#fff"
                                        d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327l4.898.696c.441.062.612.636.282.95l-3.522 3.356l.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
                                      /></svg
                                    >
                                  {:else}
                                    <svg
                                      class="w-7 h-7 inline-block"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 16 16"
                                      ><path
                                        fill="white"
                                        d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                                      /></svg
                                    >
                                  {/if}
                                </label>
                              </div>
                            {/if}
                          </div>
                        {:else}
                          <div
                            class="flex-shrink-0 ml-auto mr-2 rounded-full hover:bg-white hover:bg-opacity-[0.02] transition ease-out w-12 h-12 relative bg-default flex items-center justify-center"
                          >
                            <label
                              for="userLogin"
                              class="cursor-pointer flex-shrink-0 text-white"
                            >
                              <svg
                                class="w-7 h-7 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                ><path
                                  fill="white"
                                  d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                                /></svg
                              >
                            </label>
                          </div>
                        {/if}
                        <!--End Watchlist-->

                        <!--Start Price Alert -->

                        <div
                          class="flex-shrink-0 rounded-full hover:bg-white hover:bg-opacity-[0.02] transition ease-out w-12 h-12 relative bg-default flex items-center justify-center"
                        >
                          <label
                            on:click={() => ($openPriceAlert = true)}
                            for={data?.user ? "priceAlertModal" : "userLogin"}
                            class="cursor-pointer flex-shrink-0 text-white"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="w-8 h-8 inline-block"
                              viewBox="0 0 24 24"
                              ><g
                                fill="none"
                                stroke="white"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                                ><path
                                  d="M3 5.231L6.15 3M21 5.231L17.85 3"
                                /><circle cx="12" cy="13" r="8" /><path
                                  d="M9.5 13h5M12 10.5v5"
                                /></g
                              ></svg
                            >
                          </label>
                        </div>
                        <!--End Price Alert -->
                      </div>

                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-label-has-associated-control -->

                      <div class="flex items-center w-full mt-3">
                        <div
                          class="flex flex-row justify-start w-full items-center"
                        >
                          <div class="flex flex-col items-start ml-2 sm:ml-3">
                            <span class="text-md sm:text-lg text-blue-400">
                              {$etfTicker?.toUpperCase()}
                            </span>
                            <span
                              class="text-xl sm:text-2xl font-semibold sm:font-bold text-white"
                            >
                              {$displayCompanyName?.length > charNumber
                                ? $displayCompanyName?.slice(0, charNumber) +
                                  "..."
                                : $displayCompanyName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-----End-Header-CandleChart-Indicators------>

                    <!--Start Ticker Section-->

                    <!--<div class="w-full max-w-3xl sm:max-w-2xl m-auto pt-2 pb-5 sm:pl-3 sticky z-20 bg-default"  style="top: {$screenWidth < 520 && $isScrollingUp ? '4rem' : '0rem'};">-->
                    <nav
                      class="sm:ml-4 border-b-[2px] overflow-x-scroll md:overflow-hidden whitespace-nowrap"
                    >
                      <ul
                        class="flex flex-row items-center w-full text-[1rem] text-white"
                      >
                        <a
                          href={`/etf/${$etfTicker}`}
                          on:click={() => changeSection("overview")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'overview'
                            ? 'text-white bg-secondary sm:hover:bg-opacity-[0.95]'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary sm:hover:bg-opacity-[0.95]'}"
                        >
                          Overview
                        </a>
                        <a
                          href={`/etf/${$etfTicker}/holdings`}
                          on:click={() => changeSection("holdings")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'holdings'
                            ? 'text-white bg-secondary sm:hover:bg-opacity-[0.95]'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary sm:hover:bg-opacity-[0.95]'}"
                        >
                          Holdings
                        </a>

                        <a
                          href={`/etf/${$etfTicker}/options`}
                          on:click={() => changeSection("options")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'options'
                            ? 'text-white bg-secondary sm:hover:bg-opacity-[0.95]'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary sm:hover:bg-opacity-[0.95]'}"
                        >
                          Options
                        </a>
                        <a
                          href={`/etf/${$etfTicker}/insider`}
                          on:click={() => changeSection("insider")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'insider'
                            ? 'text-white bg-secondary sm:hover:bg-opacity-[0.95]'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary sm:hover:bg-opacity-[0.95]'}"
                        >
                          Insider
                        </a>
                        <a
                          href={`/etf/${$etfTicker}/dividends`}
                          on:click={() => changeSection("dividends")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'dividends'
                            ? 'text-white bg-secondary sm:hover:bg-opacity-[0.95]'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary sm:hover:bg-opacity-[0.95]'}"
                        >
                          Dividends
                        </a>
                      </ul>
                    </nav>

                    <!--Start-Main Content-->
                    <slot />
                    <!--End Main Content-->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</body>

<!--Start Login Modal-->
{#if LoginPopup}
  <LoginPopup form={$globalForm} />
{/if}
<!--End Login Modal-->

<!--Start SellTrade Modal-->
<PriceAlert {data} ticker={$etfTicker} assetType={$assetType} />
<!--Start Add Watchlist Modal-->
<input type="checkbox" id="addWatchListModal" class="modal-toggle" />

<dialog
  id="addWatchListModal"
  class="modal bg-[#000] bg-opacity-[0.8] p-3 sm:p-0"
>
  <label
    id="addWatchListModal"
    for="addWatchListModal"
    class="cursor-pointer modal-backdrop"
  ></label>

  <div class="modal-box rounded-md w-full bg-secondary border border-gray-600">
    <label
      for="addWatchListModal"
      class="cursor-pointer bg-secondary absolute right-5 top-2 text-[1rem] sm:text-[1.5rem] text-white"
    >
      ✕
    </label>

    <div class="text-white">
      <h3 class="font-semibold text-lg sm:text-xl mb-10">Add to Watchlist</h3>

      <div class="flex flex-col items-center w-full max-w-3xl bg-secondary">
        {#each userWatchList as item}
          <label
            on:click|stopPropagation={() => toggleUserWatchlist(item?.id)}
            class="cursor-pointer w-full flex flex-row justify-start items-center mb-5"
          >
            <div
              class="flex flex-row items-center w-full p-3 border rounded-md {item?.ticker?.includes(
                $etfTicker,
              )
                ? 'border border-gray-400'
                : 'border-gray-600'}"
            >
              <div class="flex flex-col items-center w-full">
                <span class="ml-1 text-white font-medium mr-auto">
                  {item?.title}
                </span>
                <span class="ml-1 text-white text-sm font-medium mr-auto">
                  {item?.ticker?.length}
                  {item?.ticker?.length !== 1 ? "Companies" : "Company"}
                </span>
              </div>

              <div class="rounded-full w-8 h-8 relative border border-gray-600">
                {#if item?.ticker?.includes($etfTicker)}
                  <svg
                    class="w-full h-full rounded-full"
                    viewBox="0 0 48 48"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    fill="#09090B000"
                    ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g><g id="SVGRepo_iconCarrier">
                      <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
                      <title>ic_fluent_checkmark_circle_48_filled</title>
                      <desc>Created with Sketch.</desc>
                      <g
                        stroke="none"
                        stroke-width="1"
                        fill="none"
                        fill-rule="evenodd"
                      >
                        <g
                          id="ic_fluent_checkmark_circle_48_filled"
                          fill="#fff"
                          fill-rule="nonzero"
                        >
                          <path
                            d="M24,4 C35.045695,4 44,12.954305 44,24 C44,35.045695 35.045695,44 24,44 C12.954305,44 4,35.045695 4,24 C4,12.954305 12.954305,4 24,4 Z M32.6338835,17.6161165 C32.1782718,17.1605048 31.4584514,17.1301307 30.9676119,17.5249942 L30.8661165,17.6161165 L20.75,27.732233 L17.1338835,24.1161165 C16.6457281,23.6279612 15.8542719,23.6279612 15.3661165,24.1161165 C14.9105048,24.5717282 14.8801307,25.2915486 15.2749942,25.7823881 L15.3661165,25.8838835 L19.8661165,30.3838835 C20.3217282,30.8394952 21.0415486,30.8698693 21.5323881,30.4750058 L21.6338835,30.3838835 L32.6338835,19.3838835 C33.1220388,18.8957281 33.1220388,18.1042719 32.6338835,17.6161165 Z"
                          >
                          </path>
                        </g>
                      </g>
                    </g></svg
                  >
                {/if}
              </div>
            </div>
          </label>
        {/each}
      </div>
    </div>
  </div>
</dialog>

<!--End Add Watchlist Modal-->

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
