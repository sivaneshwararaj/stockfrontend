<script lang="ts">
  import {
    globalForm,
    screenWidth,
    openPriceAlert,
    currentPortfolioPrice,
    realtimePrice,
    isCrosshairMoveActive,
    currentPrice,
    priceIncrease,
    displayCompanyName,
    traded,
    cryptoTicker,
    assetType,
  } from "$lib/store";

  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import toast from "svelte-french-toast";
  import CryptoProfileCard from "$lib/components/CryptoProfileCard.svelte";
  import PriceAlert from "$lib/components/PriceAlert.svelte";

  export let data;

  //$assetType = 'stock';
  //$cryptoTicker = data?.getTicker;
  $realtimePrice = null;

  let previousRealtimePrice = null;
  let previousTicker;
  let socket;

  let isScrolled = false;
  let logoUrl;

  let userWatchList = data?.getUserWatchlist ?? [];
  let isTickerIncluded;
  let holdingShares = 0;
  let availableCash = 0;

  let displaySection = "";

  let cryptoProfile;

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

  function handleTypeOfTrade(state: string) {
    if (state === "buy") {
      const closePopup = document.getElementById("buyTradeModal");
      closePopup?.dispatchEvent(new MouseEvent("click"));
    } else if (state === "sell") {
      const closePopup = document.getElementById("sellTradeModal");
      closePopup?.dispatchEvent(new MouseEvent("click"));
    }
  }

  function scrollToItem(itemId) {
    const item = document.getElementById(itemId);
    if (item) {
      item.scrollIntoView({ behavior: "smooth" });
      window.scrollTo(0, 0);
    }
  }

  function changeSection(state, item) {
    scrollToItem(item);

    const sectionMap = {
      stats: "/stats",
      forecast: "/forecast",
      news: "/news",
    };

    if (state !== "overview" && sectionMap[state]) {
      displaySection = state;
      //goto(`/crypto/${$cryptoTicker}${sectionMap[state]}`);
    } else {
      displaySection = "overview";
      //goto(`/crypto/${$cryptoTicker}/`);
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
          userWatchList[watchlistIndex]?.ticker?.indexOf($cryptoTicker);

        if (existingTickerIndex !== -1) {
          // If the $cryptoTicker exists, remove it from the array
          userWatchList[watchlistIndex]?.ticker?.splice(existingTickerIndex, 1);
        } else {
          // If the $cryptoTicker doesn't exist, add it to the array
          userWatchList[watchlistIndex]?.ticker?.push($cryptoTicker);
        }

        // Update the userWatchList
        userWatchList = [...userWatchList];
      }

      const postData = {
        watchListId: watchListId,
        ticker: $cryptoTicker,
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

  function handleScroll() {
    // Check the scroll position
    isScrolled = window.scrollY > 0;
  }

  function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      console.error("WebSocket is not open. Unable to send message.");
    }
  }

  async function websocketRealtimeData() {
    previousTicker = $cryptoTicker;
    try {
      socket = new WebSocket(data?.wsURL + "/realtime-crypto-data");

      socket.addEventListener("open", () => {
        //console.log('WebSocket connection opened');

        // Send the initial value of cryptoTicker
        sendMessage($cryptoTicker?.toLowerCase());
      });

      socket.addEventListener("message", (event) => {
        const data = event.data;
        //console.log('Received message:', data);
        try {
          $realtimePrice =
            typeof JSON.parse(data)?.bp !== "undefined"
              ? JSON.parse(data)?.bp
              : null;
          //console.log('Received message:', $realtimePrice);

          if ($realtimePrice > previousRealtimePrice) {
            $priceIncrease = true;
            previousRealtimePrice = $realtimePrice;
          } else if ($realtimePrice < previousRealtimePrice) {
            $priceIncrease = false;
            previousRealtimePrice = $realtimePrice;
          }

          $isCrosshairMoveActive = false;
        } catch (e) {
          console.log(e);
        }
      });

      socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:", event.reason);
        // Handle disconnection, you might want to attempt to reconnect here
      });
    } catch (error) {
      console.error("WebSocket connection error:", error);
      // Handle connection errors here
    }
  }

  let LoginPopup;

  onMount(async () => {
    if (!data?.user) {
      LoginPopup = (await import("$lib/components/LoginPopup.svelte")).default;
    }

    //const startTime = currentDateTime.set({ hour: 15, minute: 30 });
    //const endTime = currentDateTime.set({ hour: 22, minute: 0 });
    // Check if it's not a weekend and the current time is within the specified range

    await websocketRealtimeData();

    // Add a scroll event listener
    window.addEventListener("scroll", handleScroll);

    return () => {
      // Remove the event listener when the component is unmounted
      window.removeEventListener("scroll", handleScroll);
    };
  });

  afterUpdate(async () => {
    if (previousTicker !== $cryptoTicker && typeof socket !== "undefined") {
      previousTicker = $cryptoTicker;
      //socket.send('close')
      socket?.close();
      await new Promise((resolve, reject) => {
        socket?.addEventListener("close", resolve);
      });

      if (socket?.readyState === WebSocket?.CLOSED) {
        await websocketRealtimeData();
        console.log("connecting again");
      }
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
    $traded = false;
  });

  $: {
    if (
      $cryptoTicker &&
      $cryptoTicker?.length !== 0 &&
      typeof window !== "undefined"
    ) {
      // add a check to see if running on client-side
      cryptoProfile = data?.getCryptoProfile;
      $currentPortfolioPrice = data?.getStockQuote?.price;

      const asyncFunctions = [];

      Promise.all(asyncFunctions)
        .then((results) => {})
        .catch((error) => {
          console.error("An error occurred:", error);
        });
    }
  }

  $: {
    if (userWatchList) {
      isTickerIncluded = userWatchList?.some(
        (item) =>
          item.user === data?.user?.id && item?.ticker?.includes($cryptoTicker),
      );
    }
  }

  $: {
    if (
      typeof window !== "undefined" &&
      $traded &&
      data?.user &&
      $cryptoTicker?.length !== 0
    ) {
      $traded = false;
    }
  }

  $: charNumber = $screenWidth < 640 ? 12 : 25;

  $: {
    if (
      $cryptoTicker &&
      typeof window !== "undefined" &&
      $page.url.pathname === `/crypto/${$cryptoTicker}`
    ) {
      displaySection = "overview";
    }
  }

  $: {
    if ($page.url.pathname) {
      cryptoTicker.update((value) => data?.getParams);
      assetType.update((value) => "crypto");

      displayCompanyName.update((value) => data?.companyName);

      const parts = $page?.url?.pathname?.split("/");
      const sectionMap = {
        stats: "stats",
        forecast: "forecast",
        "congress-trading": "congress-trading",
        news: "news",
      };
      displaySection =
        sectionMap[
          parts?.find((part) => Object?.keys(sectionMap)?.includes(part))
        ] || "overview";
    }
  }
</script>

<body
  class="bg-default pb-40 w-full max-w-screen min-h-screen sm:max-w-7xl xl:max-w-screen-2xl overflow-hidden"
>
  <!-- Page wrapper -->
  <div class="flex flex-col w-full">
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
                    <label
                      on:click={() => goto("/")}
                      class="ml-2 cursor-pointer"
                    >
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
                    </label>

                    <div
                      class={!isScrolled
                        ? "hidden"
                        : "flex flex-col items-center ml-6 transition-transform ease-in"}
                    >
                      <span
                        class="text-white text-[0.70rem] font-medium text-opacity-[0.6]"
                      >
                        {$cryptoTicker}
                      </span>
                      <span class="text-white font-medium text-sm">
                        {#if $currentPortfolioPrice !== null && $currentPortfolioPrice !== 0}
                          ${$currentPortfolioPrice}
                        {:else}
                          ---
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
                        shareContent(
                          "https://stocknear.com/crypto/" + $cryptoTicker,
                        )}
                    >
                      <svg
                        class="w-6 h-6 inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        ><path
                          fill="none"
                          stroke="white"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="32"
                          d="M336 192h40a40 40 0 0 1 40 40v192a40 40 0 0 1-40 40H136a40 40 0 0 1-40-40V232a40 40 0 0 1 40-40h40m160-64l-80-80l-80 80m80 193V48"
                        /></svg
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
                                  fill="white"
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
                                  fill="white"
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

            <div
              class="pt-20 sm:pt-0 w-auto max-w-3xl lg:max-w-content 2xl:max-w-6xl px-3 sm:px-0"
            >
              <div
                class="md:flex md:justify-between md:divide-x md:divide-slate-800"
              >
                <!-- Main content -->
                <div class="pb-12 md:pb-20 w-full 2xl:max-w-5xl">
                  <div class="md:pr-6 lg:pr-10">
                    <!-----Start-Header-CandleChart-Indicators------>

                    <div
                      class="m-auto pl-0 sm:pl-4 overflow-hidden mb-5 md:mt-10"
                    >
                      <div
                        class="hidden sm:flex flex-row w-full justify-between items-center pb-10"
                      >
                        <!--Start Watchlist-->

                        {#if data?.user}
                          <div class="flex flex-col ml-auto mr-2">
                            {#if userWatchList?.length !== 0}
                              <div
                                class="flex-shrink-0 rounded-full hover:bg-white hover:bg-opacity-[0.02] transition ease-out w-12 h-12 relative bg-default flex items-center justify-center"
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
                                        fill="white"
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
                                        fill="white"
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

                      <div class="flex items-center w-full">
                        <div
                          class="flex flex-row justify-start items-center mb-5 mt-2"
                        >
                          <!--<img class="rounded-full w-10 h-10" src={logoUrl} alt="" />-->
                          <div
                            class="rounded-full w-10 h-10 relative bg-[#141417] flex items-center justify-center border border-gray-600"
                          >
                            <img
                              style="clip-path: circle(50%);"
                              class="w-6 h-6"
                              src={`https://financialmodelingprep.com/image-stock/${$cryptoTicker?.toUpperCase()}.png`}
                              loading="lazy"
                            />
                          </div>

                          <div class="flex flex-col items-start ml-2 sm:ml-3">
                            <span class="text-xs text-blue-400">
                              {$cryptoTicker?.toUpperCase()}
                            </span>
                            <span
                              class="text-sm sm:text-xl font-medium text-slate-100"
                            >
                              {$displayCompanyName?.length > charNumber
                                ? $displayCompanyName?.slice(0, charNumber) +
                                  "..."
                                : $displayCompanyName}
                            </span>
                          </div>
                        </div>

                        <!--Start Trade-->
                        <!--
                                        <div class="hidden sm:flex ml-auto">
                                        {#if holdingShares !== 0 && data?.user}
                                        
                                        <label for="{!data?.user  ? 'userLogin' : userPortfolio?.length !== 0 ? 'typeOfTrade' : ''}" class="py-2 px-3 text-sm sm:text-[1rem] cursor-pointer mr-1 flex flex-row ease-in-out duration-100 rounded-full shadow-lg bg-default hover:bg-secondary border border-gray-600 normal-case cursor-pointer items-center">
                                          <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="white" d="M8 2.5a.5.5 0 0 0-1 0V7H2.5a.5.5 0 0 0 0 1H7v4.5a.5.5 0 0 0 1 0V8h4.5a.5.5 0 0 0 0-1H8z"/></svg>
                                          <span class="text-white font-medium">
                                            Portfolio
                                          </span>
                                        </label>
                                        {:else}
                                        <label for="{!data?.user  ? 'userLogin' : userPortfolio?.length === 0 ? 'addPortfolio' : 'buyTradeModal'}" class="py-2 px-3 text-sm sm:text-[1rem] cursor-pointer mr-1 flex flex-row ease-in-out duration-100 rounded-full shadow-lg bg-default hover:bg-secondary border border-gray-600 normal-case  cursor-pointer items-center">
                                          <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="white" d="M8 2.5a.5.5 0 0 0-1 0V7H2.5a.5.5 0 0 0 0 1H7v4.5a.5.5 0 0 0 1 0V8h4.5a.5.5 0 0 0 0-1H8z"/></svg>
                                          <span class="text-white font-medium">
                                            Portfolio
                                          </span>
                                        </label>
                                        {/if}
                                      </div>
                                      -->
                        <!--End Trade-->
                      </div>
                    </div>
                    <!-----End-Header-CandleChart-Indicators------>

                    <!--Start Ticker Section-->

                    <!--<div class="w-full max-w-3xl sm:max-w-2xl m-auto pt-2 pb-5 sm:pl-3 sticky z-20 bg-default"  style="top: {$screenWidth < 520 && $isScrollingUp ? '4rem' : '0rem'};">-->
                    <div
                      class="-ml-2 sm:ml-4 w-screen sm:w-full {$screenWidth <
                      640
                        ? 'overflow-auto scrollbar no-scrollbar'
                        : ''} mb-2"
                    >
                      <ul
                        class="pr-4 sm:pr-0 w-screen font-medium flex flex-row items-center bg-default overflow-x-scroll space-x-3 rtl:space-x-reverse py-2"
                      >
                        <li class="cursor-pointer flex flex-col items-center">
                          <a
                            href={`/crypto/${$cryptoTicker}`}
                            id="item1"
                            on:click={() => changeSection("overview", "item1")}
                            class="px-3 text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySection ===
                            'overview'
                              ? 'text-white '
                              : 'bg-default'}"
                          >
                            Overview
                          </a>
                          <div
                            class="{displaySection === 'overview'
                              ? 'bg-[#75D377]'
                              : 'bg-default'} mt-1 h-[3px] rounded-full w-[3.5rem]"
                          />
                        </li>
                        <li class="cursor-pointer flex flex-col items-center">
                          <a
                            href={`/crypto/${$cryptoTicker}/stats`}
                            id="item2"
                            on:click={() => changeSection("stats", "item2")}
                            class="px-3 text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySection ===
                            'stats'
                              ? 'text-white '
                              : 'bg-default'}">Stats</a
                          >
                          <div
                            class="{displaySection === 'stats'
                              ? 'bg-[#75D377]'
                              : 'bg-default'} mt-1 h-[3px] rounded-full w-[2rem]"
                          />
                        </li>
                        <li class="cursor-pointer flex flex-col items-center">
                          <a
                            href={`/crypto/${$cryptoTicker}/forecast`}
                            id="item2"
                            on:click={() => changeSection("forecast", "item3")}
                            class="px-3 text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySection ===
                            'forecast'
                              ? 'text-white '
                              : 'bg-default'}"
                          >
                            Forecast
                          </a>
                          <div
                            class="{displaySection === 'forecast'
                              ? 'bg-[#75D377]'
                              : 'bg-default'} mt-1 h-[3px] rounded-full w-[2rem]"
                          />
                        </li>
                        <li class="cursor-pointer flex flex-col items-center">
                          <a
                            href={`/crypto/${$cryptoTicker}/congress-trading`}
                            id="item7"
                            on:click={() =>
                              changeSection("congress-trading", "item7")}
                            class="px-3 text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySection ===
                            'congress-trading'
                              ? 'text-white '
                              : 'bg-default'}"
                          >
                            Insider
                          </a>
                          <div
                            class="{displaySection === 'congress-trading'
                              ? 'bg-[#75D377]'
                              : 'bg-default'} mt-1 h-[3px] rounded-full w-[2.5rem]"
                          />
                        </li>
                        <li class="cursor-pointer flex flex-col items-center">
                          <a
                            href={`/crypto/${$cryptoTicker}/news`}
                            id="item7"
                            on:click={() => changeSection("news", "item7")}
                            class="px-3 text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySection ===
                            'news'
                              ? 'text-white '
                              : 'bg-default'}"
                          >
                            News
                          </a>
                          <div
                            class="{displaySection === 'news'
                              ? 'bg-[#75D377]'
                              : 'bg-default'} mt-1 h-[3px] rounded-full w-[2rem]"
                          />
                        </li>
                      </ul>
                    </div>

                    <!--Start-Main Content-->
                    <slot />
                    <!--End Main Content-->
                  </div>
                </div>

                <aside
                  class="hidden lg:block w-fit max-w-xl 2xl:w-[120px] m-auto sm:m-0 md:shrink-0 md:pt-10 pb-12 md:pb-20"
                >
                  <div class="sm:pl-10">
                    <CryptoProfileCard {cryptoProfile} />
                  </div>
                </aside>
                <!--
                        {#if $screenWidth < 640 && MobileStockNavbar}
                          <MobileStockNavbar 
                            logoUrl={logoUrl}
                            holdingShares={holdingShares}
                            userPortfolio={userPortfolio}
                            cryptoProfile={cryptoProfile}
                            similarstock={similarstock}
                            data={data}
                          />
                        {/if}
                        -->

                <!--
                        <div class="sm:hidden fixed z-20 bottom-8 sm:bottom-10 right-5">
                          <div class="h-full mx-auto">        
                            <div class="flex items-center justify-end">
                              {#if holdingShares !== 0 && data?.user}
                              <label for="{!data?.user  ? 'userLogin' : userPortfolio?.length !== 0 ? 'typeOfTrade' : ''}" class="inline-flex items-center justify-center w-32 h-11 border border-[#000] ring-[#000] bg-[#0DDE00] text-[0.95rem] font-medium rounded-full text-[#09090B]">
                                Invest
                              </label>
                              {:else}
                              <label for="{!data?.user  ? 'userLogin' : userPortfolio?.length === 0 ? 'addPortfolio' : 'buyTradeModal'}"
                              class="inline-flex items-center justify-center w-32 h-11 border border-[#000] ring-[#000] bg-[#0DDE00] text-[0.95rem] font-medium rounded-full text-[#09090B]">
                                Invest
                              </label>
                              {/if}
                            </div>
                          </div>
                        </div>
                        -->
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

<!--
{#if BuyTrade}
<BuyTrade
  data = {data}
  holdingShares={holdingShares}
  availableCash = {availableCash}
/>
{/if}

{#if SellTrade}
<SellTrade 
  data = {data}
  holdingShares={holdingShares}
  availableCash = {availableCash}
/>
{/if}

{#if AddPortfolio}
<AddPortfolio data={data}/>
{/if}
-->

<PriceAlert {data} ticker={$cryptoTicker} assetType={$assetType} />

<!--Start Type of Trade-->

<input type="checkbox" id="typeOfTrade" class="modal-toggle" />

<dialog
  id="addWatchListModal"
  class="modal modal-bottom sm:modal-middle bg-[#000] bg-opacity-[0.5]"
>
  <label
    id="addWatchListModal"
    for="addWatchListModal"
    class="cursor-pointer modal-backdrop"
  ></label>

  <div
    class="modal-box rounded-md w-full bg-[#1E222D] sm:border sm:border-gray-600"
  >
    <label
      for="addWatchListModal"
      class="cursor-pointer bg-[#1E222D] absolute right-5 top-2 text-[1.8rem] text-white"
    >
      ✕
    </label>

    <div class="text-white">
      <h3 class="font-semibold text-lg sm:text-xl mb-10">Add to Watchlist</h3>

      <div class="flex flex-col items-center w-full max-w-3xl bg-[#1E222D]">
        {#each userWatchList as item}
          <label
            on:click|stopPropagation={() => toggleUserWatchlist(item?.id)}
            class="cursor-pointer w-full flex flex-row justify-start items-center mb-5"
          >
            <div
              class="flex flex-row items-center w-full bg-[#2A2E39] p-3 rounded-md {item?.ticker?.includes(
                $cryptoTicker,
              )
                ? 'border border-gray-400'
                : ''}"
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

              <div
                class="rounded-full w-8 h-8 relative border border-[#737373]"
              >
                {#if item?.ticker?.includes($cryptoTicker)}
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

<!--End Type of Trade-->

<!--Start Add Watchlist Modal-->
<input type="checkbox" id="addWatchListModal" class="modal-toggle" />

<dialog
  id="addWatchListModal"
  class="modal modal-bottom sm:modal-middle bg-[#000] bg-opacity-[0.5]"
>
  <label
    id="addWatchListModal"
    for="addWatchListModal"
    class="cursor-pointer modal-backdrop"
  ></label>

  <div class="modal-box w-full bg-[#191919] sm:border sm:border-gray-800">
    <label
      for="addWatchListModal"
      class="cursor-pointer bg-[#191919] absolute right-5 top-2 text-[1.8rem] text-white"
    >
      ✕
    </label>

    <div class="text-white">
      <h3 class="font-semibold text-lg sm:text-xl mb-10">Add to Watchlist</h3>

      <div class="flex flex-col items-center w-full max-w-3xl bg-[#191919]">
        {#each userWatchList as item}
          <label
            on:click|stopPropagation={() => toggleUserWatchlist(item?.id)}
            class="cursor-pointer w-full flex flex-row justify-start items-center mb-5"
          >
            <div
              class="flex flex-row items-center w-full bg-secondary p-3 rounded-md {item?.ticker?.includes(
                $cryptoTicker,
              )
                ? 'ring-2 ring-[#04E000]'
                : ''}"
            >
              <div class="flex flex-col items-center w-full">
                <span class="ml-1 text-white font-medium mr-auto">
                  {item?.title}
                </span>
                <span
                  class="ml-1 text-white text-opacity-40 text-sm font-medium mr-auto"
                >
                  {item?.ticker?.length}
                  {item?.ticker?.length !== 1 ? "Companies" : "Company"}
                </span>
              </div>

              <div
                class="rounded-full w-8 h-8 relative border border-[#737373]"
              >
                {#if item?.ticker?.includes($cryptoTicker)}
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
                        id="🔍-Product-Icons"
                        stroke="none"
                        stroke-width="1"
                        fill="none"
                        fill-rule="evenodd"
                      >
                        <g
                          id="ic_fluent_checkmark_circle_48_filled"
                          fill="#04E000"
                          fill-rule="nonzero"
                        >
                          <path
                            d="M24,4 C35.045695,4 44,12.954305 44,24 C44,35.045695 35.045695,44 24,44 C12.954305,44 4,35.045695 4,24 C4,12.954305 12.954305,4 24,4 Z M32.6338835,17.6161165 C32.1782718,17.1605048 31.4584514,17.1301307 30.9676119,17.5249942 L30.8661165,17.6161165 L20.75,27.732233 L17.1338835,24.1161165 C16.6457281,23.6279612 15.8542719,23.6279612 15.3661165,24.1161165 C14.9105048,24.5717282 14.8801307,25.2915486 15.2749942,25.7823881 L15.3661165,25.8838835 L19.8661165,30.3838835 C20.3217282,30.8394952 21.0415486,30.8698693 21.5323881,30.4750058 L21.6338835,30.3838835 L32.6338835,19.3838835 C33.1220388,18.8957281 33.1220388,18.1042719 32.6338835,17.6161165 Z"
                            id="🎨-Color"
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
