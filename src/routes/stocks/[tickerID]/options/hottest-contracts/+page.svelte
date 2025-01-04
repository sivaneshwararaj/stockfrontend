<script lang="ts">
  import { abbreviateNumberWithColor } from "$lib/utils";
  import { setCache, getCache, stockTicker } from "$lib/store";

  import * as HoverCard from "$lib/components/shadcn/hover-card/index.js";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";

  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  export let data;
  let isLoaded = false;

  let optionHistoryList = [];

  let container;
  let rawDataHistory = [];

  function formatDate(dateStr) {
    // Parse the input date string (YYYY-mm-dd)
    var date = new Date(dateStr);

    // Get month, day, and year
    var month = date.getMonth() + 1; // Month starts from 0
    var day = date.getDate();
    var year = date.getFullYear();

    // Extract the last two digits of the year
    var shortYear = year.toString().slice(-2);

    // Add leading zeros if necessary
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;

    var formattedDate = day + "/" + year;

    return formattedDate;
  }

  function getScroll() {
    const scrollThreshold = container.scrollHeight * 0.8; // 80% of the container height

    // Check if the user has scrolled to the bottom based on the threshold
    const isBottom =
      container.scrollTop + container.clientHeight >= scrollThreshold;

    // Only load more data if at the bottom and there is still data to load
    if (isBottom && optionHistoryList?.length !== rawDataHistory?.length) {
      const nextIndex = optionHistoryList.length; // Ensure optionHistoryList is defined
      const filteredNewResults = rawDataHistory.slice(
        nextIndex,
        nextIndex + 25,
      ); // Ensure rawData is defined
      optionHistoryList = [...optionHistoryList, ...filteredNewResults];
    }
  }

  const currentTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
  )?.getTime();

  function daysLeft(targetDate) {
    const targetTime = new Date(targetDate).getTime();
    const difference = targetTime - currentTime;

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math?.ceil(difference / millisecondsPerDay);

    return daysLeft + "D";
  }

  let rawDataVolume = data?.getData?.volume?.map((item) => ({
    ...item,
    dte: daysLeft(item?.date_expiration),
  }));

  let rawDataOI = data?.getData?.openInterest?.map((item) => ({
    ...item,
    dte: daysLeft(item?.date_expiration),
  }));

  let volumeList = rawDataVolume;
  let openInterestList = rawDataOI;

  $: columns = [
    { key: "strike_price", label: "Chain", align: "left" },
    { key: "dte", label: "DTE", align: "right" },
    { key: "last_price", label: "Last", align: "right" },
    { key: "high_price", label: "Low-High", align: "right" },
    { key: "volume", label: "Volume", align: "right" },
    { key: "open_interest", label: "OI", align: "right" },
    { key: "open_interest_change", label: "OI Change", align: "right" },
    { key: "bid_volume", label: "Bid/Ask Vol", align: "right" },
    { key: "total_premium", label: "Total Prem", align: "right" },
  ];

  $: sortOrders = {
    strike_price: { order: "none", type: "number" },
    dte: { order: "none", type: "number" },
    last_price: { order: "none", type: "number" },
    high_price: { order: "none", type: "number" },
    volume: { order: "none", type: "number" },
    open_interest: { order: "none", type: "number" },
    open_interest_change: { order: "none", type: "number" },
    bid_volume: { order: "none", type: "number" },
    total_premium: { order: "none", type: "number" },
  };

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];
    let originalData = rawDataVolume?.sort(
      (a, b) => b?.open_interest - a?.open_interest,
    );
    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...rawDataVolume]; // Reset originalData to rawDataVolume
      volumeList = originalData;
      return;
    }

    // Define a generic comparison function
    const compareValues = (a, b) => {
      const { type } = sortOrders[key];
      let valueA, valueB;

      switch (type) {
        case "date":
          valueA = new Date(a[key]);
          valueB = new Date(b[key]);
          break;
        case "string":
          valueA = a[key].toUpperCase();
          valueB = b[key].toUpperCase();
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    };

    // Sort using the generic comparison function
    volumeList = [...originalData].sort(compareValues);
  };

  const sortDataOI = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];
    let originalData = rawDataOI?.sort(
      (a, b) => b?.open_interest - a?.open_interest,
    );
    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...rawDataOI]; // Reset originalData to rawDataOI
      volumeList = originalData;
      return;
    }

    // Define a generic comparison function
    const compareValues = (a, b) => {
      const { type } = sortOrders[key];
      let valueA, valueB;

      switch (type) {
        case "date":
          valueA = new Date(a[key]);
          valueB = new Date(b[key]);
          break;
        case "string":
          valueA = a[key].toUpperCase();
          valueB = b[key].toUpperCase();
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    };

    // Sort using the generic comparison function
    openInterestList = [...originalData].sort(compareValues);
  };

  const getContractHistory = async (contractId) => {
    let output;
    const cachedData = getCache(contractId, "getContractHistory");
    if (cachedData) {
      output = cachedData;
    } else {
      const postData = {
        params: contractId,
      };

      // make the POST request to the endpoint
      const response = await fetch("/api/options-contract-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();

      setCache(contractId, output, "getContractHistory");
    }

    return output;
  };

  async function handleViewData(contractId) {
    isLoaded = false;
    optionDetailsDesktopModal?.showModal();

    rawDataHistory = await getContractHistory(contractId);
    optionHistoryList = rawDataHistory?.slice(0, 20);
    isLoaded = true;
  }
</script>

<section
  class="w-full bg-default overflow-hidden text-white min-h-screen pb-40"
>
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if rawDataVolume?.length > 0}
        <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
          <h2
            class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
          >
            Hottest Contracts (Highest Volume)
          </h2>
          <div class="w-full overflow-x-scroll text-white">
            <table
              class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto mt-4 overflow-x-auto"
            >
              <thead>
                <TableHeader {columns} {sortOrders} {sortData} />
              </thead>
              <tbody>
                {#each volumeList as item, index}
                  <tr
                    class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800 {index +
                      1 ===
                      volumeList?.slice(0, 3)?.length &&
                    data?.user?.tier !== 'Pro'
                      ? 'opacity-[0.1]'
                      : ''}"
                  >
                    <td
                      class=" text-sm sm:text-[1rem] text-start whitespace-nowrap"
                    >
                      <span
                        class={item?.option_type === "C"
                          ? "text-[#00FC50]"
                          : "text-[#FF2F1F]"}
                      >
                        {item?.option_type === "C" ? "Call" : "Put"}
                      </span>
                      <label
                        class="cursor-pointer text-[#04D9FF] sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                      >
                        {item?.strike_price}

                        {" " + item?.date_expiration}

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="inline-block w-4 h-4"
                          viewBox="0 0 512 512"
                          fill="#04D9FF"
                          ><path
                            d="M104 496H72a24 24 0 01-24-24V328a24 24 0 0124-24h32a24 24 0 0124 24v144a24 24 0 01-24 24zM328 496h-32a24 24 0 01-24-24V232a24 24 0 0124-24h32a24 24 0 0124 24v240a24 24 0 01-24 24zM440 496h-32a24 24 0 01-24-24V120a24 24 0 0124-24h32a24 24 0 0124 24v352a24 24 0 01-24 24zM216 496h-32a24 24 0 01-24-24V40a24 24 0 0124-24h32a24 24 0 0124 24v432a24 24 0 01-24 24z"
                          ></path></svg
                        >
                      </label>
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.dte}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.last_price}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.low_price}-{item?.high_price}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.volume?.toLocaleString("en-US")}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.open_interest?.toLocaleString("en-US")}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {#if item?.open_interest_change >= 0}
                        <span class="text-[#00FC50]"
                          >+{item?.open_interest_change?.toLocaleString(
                            "en-US",
                          )}</span
                        >
                      {:else}
                        <span class="text-[#FF2F1F]"
                          >{item?.open_interest_change?.toLocaleString(
                            "en-US",
                          )}</span
                        >
                      {/if}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end">
                      <HoverCard.Root>
                        <HoverCard.Trigger
                          class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
                        >
                          <div class="flex items-center justify-end">
                            <!-- Bar Container -->
                            <div
                              class="flex w-full max-w-28 h-5 bg-gray-200 rounded-md overflow-hidden"
                            >
                              <!-- Bearish -->
                              <div
                                class="bg-red-500 h-full"
                                style="width: calc(({item?.bid_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>

                              <!-- Neutral -->
                              <div
                                class="bg-gray-300 h-full"
                                style="width: calc(({item?.mid_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>

                              <!-- Bullish -->
                              <div
                                class="bg-green-500 h-full"
                                style="width: calc(({item?.ask_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>
                            </div>
                          </div>
                        </HoverCard.Trigger>
                        <HoverCard.Content
                          class="w-auto bg-secondary border border-gray-600"
                        >
                          <div class="flex justify-between space-x-4">
                            <div
                              class="space-y-1 flex flex-col items-start text-white"
                            >
                              <div>
                                Bid Vol: {@html abbreviateNumberWithColor(
                                  item?.bid_volume,
                                  false,
                                  true,
                                )}
                              </div>
                              <div>
                                Mid Vol: {@html abbreviateNumberWithColor(
                                  item?.mid_volume,
                                  false,
                                  true,
                                )}
                              </div>
                              <div>
                                Ask Vol: {@html abbreviateNumberWithColor(
                                  item?.ask_volume,
                                  false,
                                  true,
                                )}
                              </div>
                            </div>
                          </div>
                        </HoverCard.Content>
                      </HoverCard.Root>
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {@html abbreviateNumberWithColor(
                        item?.total_premium,
                        false,
                        true,
                      )}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <h2
            class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit mt-10"
          >
            Highest OI Contracts
          </h2>
          <div class="w-full overflow-x-scroll text-white">
            <table
              class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto mt-4 overflow-x-auto"
            >
              <thead>
                <TableHeader {columns} {sortOrders} sortData={sortDataOI} />
              </thead>
              <tbody>
                {#each openInterestList as item, index}
                  <tr
                    class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800 {index +
                      1 ===
                      openInterestList?.slice(0, 3)?.length &&
                    data?.user?.tier !== 'Pro'
                      ? 'opacity-[0.1]'
                      : ''}"
                  >
                    <td
                      class=" text-sm sm:text-[1rem] text-start whitespace-nowrap"
                    >
                      <span
                        class={item?.option_type === "C"
                          ? "text-[#00FC50]"
                          : "text-[#FF2F1F]"}
                      >
                        {item?.option_type === "C" ? "Call" : "Put"}
                      </span>
                      <label
                        on:click={() => handleViewData(item?.option_symbol)}
                        on:mouseover={() =>
                          getContractHistory(item?.option_symbol)}
                        class="cursor-pointer text-[#04D9FF] sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                      >
                        {item?.strike_price}

                        {" " + item?.date_expiration}

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="inline-block w-4 h-4"
                          viewBox="0 0 512 512"
                          fill="#04D9FF"
                          ><path
                            d="M104 496H72a24 24 0 01-24-24V328a24 24 0 0124-24h32a24 24 0 0124 24v144a24 24 0 01-24 24zM328 496h-32a24 24 0 01-24-24V232a24 24 0 0124-24h32a24 24 0 0124 24v240a24 24 0 01-24 24zM440 496h-32a24 24 0 01-24-24V120a24 24 0 0124-24h32a24 24 0 0124 24v352a24 24 0 01-24 24zM216 496h-32a24 24 0 01-24-24V40a24 24 0 0124-24h32a24 24 0 0124 24v432a24 24 0 01-24 24z"
                          ></path></svg
                        >
                      </label>
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.dte}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.last_price}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.low_price}-{item?.high_price}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.volume?.toLocaleString("en-US")}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.open_interest?.toLocaleString("en-US")}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {#if item?.open_interest_change >= 0}
                        <span class="text-[#00FC50]"
                          >+{item?.open_interest_change?.toLocaleString(
                            "en-US",
                          )}</span
                        >
                      {:else}
                        <span class="text-[#FF2F1F]"
                          >{item?.open_interest_change?.toLocaleString(
                            "en-US",
                          )}</span
                        >
                      {/if}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end">
                      <HoverCard.Root>
                        <HoverCard.Trigger
                          class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
                        >
                          <div class="flex items-center justify-end">
                            <!-- Bar Container -->
                            <div
                              class="flex w-full max-w-28 h-5 bg-gray-200 rounded-md overflow-hidden"
                            >
                              <!-- Bearish -->
                              <div
                                class="bg-red-500 h-full"
                                style="width: calc(({item?.bid_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>

                              <!-- Neutral -->
                              <div
                                class="bg-gray-300 h-full"
                                style="width: calc(({item?.mid_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>

                              <!-- Bullish -->
                              <div
                                class="bg-green-500 h-full"
                                style="width: calc(({item?.ask_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>
                            </div>
                          </div>
                        </HoverCard.Trigger>
                        <HoverCard.Content
                          class="w-auto bg-secondary border border-gray-600"
                        >
                          <div class="flex justify-between space-x-4">
                            <div
                              class="space-y-1 flex flex-col items-start text-white"
                            >
                              <div>
                                Bid Vol: {@html abbreviateNumberWithColor(
                                  item?.bid_volume,
                                  false,
                                  true,
                                )}
                              </div>
                              <div>
                                Mid Vol: {@html abbreviateNumberWithColor(
                                  item?.mid_volume,
                                  false,
                                  true,
                                )}
                              </div>
                              <div>
                                Ask Vol: {@html abbreviateNumberWithColor(
                                  item?.ask_volume,
                                  false,
                                  true,
                                )}
                              </div>
                            </div>
                          </div>
                        </HoverCard.Content>
                      </HoverCard.Root>
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {@html abbreviateNumberWithColor(
                        item?.total_premium,
                        false,
                        true,
                      )}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <UpgradeToPro {data} />
        </div>
      {:else}
        <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
          <h2
            class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
          >
            Hottest Contracts
          </h2>
          <div class="mt-2">
            <Infobox text="No data is available" />
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>

<dialog
  id="optionDetailsDesktopModal"
  class="modal cursor-pointer bg-[#000] bg-opacity-[0.8] px-5"
>
  <div
    class="modal-box w-full max-w-7xl bg-[#141417] sm:bg-default border-t sm:border border-gray-600 h-auto"
  >
    <form method="dialog" class="modal-backdrop backdrop-blur-[4px]">
      <button
        class="cursor-pointer absolute right-0 top-0 text-[1.8rem] text-white focus:outline-none"
      >
        <svg
          class="w-8 h-8"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          ><path
            fill="white"
            d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
          />
        </svg>
      </button>
    </form>

    <p class="text-white text-xl mt-10 font-semibold cursor-text">
      Contract: {$stockTicker} 32 C 2025-01-03 (-1D)
    </p>
    <div class="border-gray-600 border-b w-full mb-3 mt-5"></div>
    <div
      bind:this={container}
      on:scroll={getScroll}
      class="h-full max-h-[500px] overflow-y-scroll overflow-x-auto"
    >
      <div class="flex justify-start items-center m-auto">
        {#if isLoaded}
          <table
            class="table table-pin-cols table-sm bg-table border border-gray-800 table-compact rounded-none sm:rounded-md w-full m-auto mt-4 overflow-x-auto"
          >
            <thead class="bg-default">
              <tr class="">
                <td class="text-white font-semibold text-sm text-start">Date</td
                >
                <td class="text-white font-semibold text-sm text-end">Vol</td>
                <td class="text-white font-semibold text-sm text-end">OI</td>
                <td class="text-white font-semibold text-sm text-end"
                  >OI Change</td
                >
                <td class="text-white font-semibold text-sm text-end"
                  >% Change OI</td
                >
                <td class="text-white font-semibold text-sm text-start"
                  >Last Price</td
                >
                <td class="text-white font-semibold text-sm text-start"
                  >Avg Price</td
                >
                <td class="text-white font-semibold text-sm text-start"
                  >Bid/Ask</td
                >
                <td class="text-white font-semibold text-sm text-end">IV</td>
                <td class="text-white font-semibold text-sm text-end">Floor</td>
                <td class="text-white font-semibold text-sm text-end">Sweep</td>
                <td class="text-white font-semibold text-sm text-start"
                  >Multileg Vol</td
                >
                <td class="text-white font-semibold text-sm text-end"
                  >Total Prem</td
                >
              </tr>
            </thead>
            <tbody>
              {#each optionHistoryList as item}
                <!-- row -->
                <tr class="odd:bg-odd border-b border-gray-800">
                  <td class="text-sm sm:text-[1rem] text-start text-white">
                    {formatDate(item?.date)}
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {item?.volume?.toLocaleString("en-US")}
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {item?.open_interest !== undefined
                      ? item?.open_interest?.toLocaleString("en-US")
                      : "n/a"}
                  </td>
                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {#if item?.open_interest_change >= 0 && item?.open_interest_change !== undefined}
                      <span class="text-[#00FC50]"
                        >+{item?.open_interest_change?.toLocaleString(
                          "en-US",
                        )}</span
                      >
                    {:else if item?.open_interest_change < 0 && item?.open_interest_change !== undefined}
                      <span class="text-[#FF2F1F]"
                        >{item?.open_interest_change?.toLocaleString(
                          "en-US",
                        )}</span
                      >
                    {:else}
                      n/a
                    {/if}
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {#if item?.open_interest_change_percent >= 0 && item?.open_interest_change_percent !== undefined}
                      <span class="text-[#00FC50]"
                        >+{item?.open_interest_change_percent + "%"}</span
                      >
                    {:else if item?.open_interest_change_percent < 0 && item?.open_interest_change_percent !== undefined}
                      <span class="text-[#FF2F1F]"
                        >{item?.open_interest_change_percent + "%"}</span
                      >
                    {:else}
                      n/a
                    {/if}
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {item?.last_price}
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {item?.avg_price}
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end">
                    <HoverCard.Root>
                      <HoverCard.Trigger
                        class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
                      >
                        <div class="flex items-center justify-end">
                          <!-- Bar Container -->
                          <div
                            class="flex w-full max-w-28 h-5 bg-gray-200 rounded-md overflow-hidden"
                          >
                            <!-- Bearish -->
                            <div
                              class="bg-red-500 h-full"
                              style="width: calc(({item?.bid_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                            ></div>

                            <!-- Neutral -->
                            <div
                              class="bg-gray-300 h-full"
                              style="width: calc(({item?.mid_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                            ></div>

                            <!-- Bullish -->
                            <div
                              class="bg-green-500 h-full"
                              style="width: calc(({item?.ask_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                            ></div>
                          </div>
                        </div>
                      </HoverCard.Trigger>
                      <HoverCard.Content
                        class="w-auto bg-secondary border border-gray-600"
                      >
                        <div class="flex justify-between space-x-4">
                          <div
                            class="space-y-1 flex flex-col items-start text-white"
                          >
                            <div>
                              Bid Vol: {@html abbreviateNumberWithColor(
                                item?.bid_volume,
                                false,
                                true,
                              )}
                            </div>
                            <div>
                              Mid Vol: {@html abbreviateNumberWithColor(
                                item?.mid_volume,
                                false,
                                true,
                              )}
                            </div>
                            <div>
                              Ask Vol: {@html abbreviateNumberWithColor(
                                item?.ask_volume,
                                false,
                                true,
                              )}
                            </div>
                          </div>
                        </div>
                      </HoverCard.Content>
                    </HoverCard.Root>
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {(item?.implied_volatility * 100)?.toLocaleString("en-US") +
                      "%"}
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {((item?.floor_volume / item?.volume) * 100)?.toFixed(2) +
                      "%"}
                  </td>
                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {((item?.sweep_volume / item?.volume) * 100)?.toFixed(2) +
                      "%"}
                  </td>
                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {((item?.multi_leg_volume / item?.volume) * 100)?.toFixed(
                      2,
                    ) + "%"}
                  </td>
                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {@html abbreviateNumberWithColor(
                      item?.total_premium,
                      false,
                      true,
                    )}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else}
          <div class="m-auto flex justify-center items-center h-80">
            <div class="relative">
              <label
                class="bg-[#272727] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <span class="loading loading-spinner loading-md text-gray-400"
                ></span>
              </label>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
