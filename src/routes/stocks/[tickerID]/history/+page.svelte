<script lang="ts">
  import {
    stockTicker,
    numberOfUnreadNotification,
    displayCompanyName,
  } from "$lib/store";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";

  import { onMount } from "svelte";

  export let data;
  let isLoaded = false;
  let timePeriod = "Daily";
  let rawData = data?.getData || [];
  let originalData = [];

  let stockList = [];
  function prepareDataset(data, timePeriod = "Daily") {
    if (timePeriod === "Weekly") {
      // Group data by week
      const weeklyData = [];
      let currentWeek = null;

      data.forEach((entry) => {
        const date = new Date(entry.time);
        // Calculate the start of the week (Monday)
        const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const weekStart = new Date(
          date.setDate(date.getDate() - ((dayOfWeek + 6) % 7)), // Adjust to get Monday
        );

        if (
          !currentWeek ||
          currentWeek.weekStart.getTime() !== weekStart.getTime()
        ) {
          // Start a new week
          currentWeek = {
            weekStart,
            open: entry.open,
            high: entry.high,
            low: entry.low,
            close: entry.close,
            volume: entry.volume,
          };
          weeklyData.push(currentWeek);
        } else {
          // Update the current week's values
          currentWeek.high = Math.max(currentWeek.high, entry.high);
          currentWeek.low = Math.min(currentWeek.low, entry.low);
          currentWeek.close = entry.close; // Update the close to the most recent in the week
          currentWeek.volume += entry.volume;
        }
      });

      // Replace Daily data with aggregated weekly data
      data = weeklyData.map((week) => ({
        time: week.weekStart.toISOString().split("T")[0],
        open: week.open,
        high: week.high,
        low: week.low,
        close: week.close,
        volume: week.volume,
      }));
    }

    // Process the data to add change and changesPercentage
    const modifiedData = data?.map((entry, index, arr) => {
      if (index === 0) {
        return { ...entry, change: null, changesPercentage: null };
      }

      const previousClose = arr[index - 1]?.close;
      const currentClose = entry?.close;
      const change = (currentClose - previousClose)?.toFixed(2);
      const changesPercentage =
        previousClose !== 0
          ? (((currentClose - previousClose) / previousClose) * 100)?.toFixed(2)
          : null;

      return { ...entry, change, changesPercentage };
    });

    // Sort the data by "time" from latest to earliest
    return modifiedData?.sort((a, b) => new Date(b?.time) - new Date(a?.time));
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;

    if (isBottom && stockList?.length !== originalData?.length) {
      const nextIndex = stockList?.length;
      const filteredNewResults = originalData?.slice(nextIndex, nextIndex + 50);
      stockList = [...stockList, ...filteredNewResults];
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: columns = [
    { key: "time", label: "Date", align: "left" },
    { key: "open", label: "Open", align: "right" },
    { key: "high", label: "High", align: "right" },
    { key: "low", label: "Low", align: "right" },
    { key: "close", label: "Close", align: "right" },
    { key: "change", label: "Change", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "volume", label: "Volume", align: "right" },
  ];

  $: sortOrders = {
    time: { order: "none", type: "date" },
    open: { order: "none", type: "number" },
    high: { order: "none", type: "number" },
    low: { order: "none", type: "number" },
    close: { order: "none", type: "number" },
    change: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    volume: { order: "none", type: "number" },
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

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...rawData]; // Reset originalData to rawData
      stockList = originalData?.slice(0, 50); // Reset displayed data
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
    stockList = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  $: {
    if (timePeriod && typeof window !== "undefined") {
      isLoaded = false;
      rawData = prepareDataset(rawData, timePeriod);
      originalData = rawData;
      stockList = rawData?.slice(0, 50);
      isLoaded = true;
    }
  }
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Holdings List · Stocknear
  </title>
  <meta
    name="description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$stockTicker}).`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Holdings List · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$stockTicker}).`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Holdings List · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$stockTicker}).`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="bg-default overflow-hidden text-white h-full min-h-screen mb-20 sm:mb-0 w-full mt-2 sm:mt-0"
>
  <div class="flex justify-center m-auto h-full overflow-hidden w-full">
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
    >
      <div class="mt-5 sm:mt-0 sm:p-7 w-full m-auto">
        <div class="flex flex-row items-center md:space-x-4 md:border-0">
          <h1 class=" text-xl sm:text-2xl font-bold">
            {$stockTicker} Stock Price History
          </h1>
          <div
            class="ml-3 sm:mt-1 whitespace-nowrap text-sm sm:text-[1rem] md:ml-0"
          ></div>
        </div>

        <div class="w-full m-auto mt-2">
          <div class="flex flex-row items-center w-fit sm:ml-auto mb-3">
            <div class="relative inline-block text-left grow">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                  <Button
                    builders={[builder]}
                    class="w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                  >
                    <span class="truncate text-white px-1">{timePeriod}</span>
                    <svg
                      class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      style="max-width:40px"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  class="w-56 h-fit max-h-72 overflow-y-auto scroller"
                >
                  <DropdownMenu.Label class="text-gray-400">
                    Select time frame
                  </DropdownMenu.Label>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    <DropdownMenu.Item
                      on:click={() => (timePeriod = "Daily")}
                      class="cursor-pointer hover:bg-primary"
                    >
                      Daily
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      on:click={() => (timePeriod = "Weekly")}
                      class="cursor-pointer hover:bg-primary"
                    >
                      Weekly
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      on:click={() => (timePeriod = "Monthly")}
                      class="cursor-pointer hover:bg-primary"
                    >
                      Monthly
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      on:click={() => (timePeriod = "Quarterly")}
                      class="cursor-pointer hover:bg-primary"
                    >
                      Quarterly
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      on:click={() => (timePeriod = "Annual")}
                      class="cursor-pointer hover:bg-primary"
                    >
                      Annual
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
            <!--
                    <Button
                      on:click={() => exportFundamentalData("csv")}
                      class="ml-2 w-fit border-gray-600 border bg-default sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                    >
                      <span class="truncate text-white">Download</span>
                      <svg
                        class="{data?.user?.tier === 'Pro'
                          ? 'hidden'
                          : ''} ml-1 -mt-0.5 w-3.5 h-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        ><path
                          fill="#A3A3A3"
                          d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                        /></svg
                      >
                    </Button>
                    -->
          </div>

          <div
            class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-scroll"
          >
            <table
              class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto"
            >
              <thead>
                <TableHeader {columns} {sortOrders} {sortData} />
              </thead>

              <tbody>
                {#each stockList as item, index}
                  <tr
                    class="sm:hover:bg-[#245073] border-b border-gray-800 sm:hover:bg-opacity-[0.2] odd:bg-odd {index +
                      1 ===
                      rawData?.length && data?.user?.tier !== 'Pro'
                      ? 'opacity-[0.1]'
                      : ''}"
                  >
                    <td
                      class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white"
                    >
                      {new Date(item?.time).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        daySuffix: "2-digit",
                      })}
                    </td>
                    <td
                      class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                    >
                      {item?.open?.toFixed(2)}
                    </td>
                    <td
                      class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                    >
                      {item?.high?.toFixed(2)}
                    </td>
                    <td
                      class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                    >
                      {item?.low?.toFixed(2)}
                    </td>
                    <td
                      class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                    >
                      {item?.close?.toFixed(2)}
                    </td>
                    <td
                      class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                    >
                      {item?.change !== null ? item?.change : "n/a"}
                    </td>
                    <td
                      class="text-sm sm:text-[1rem] {item?.changesPercentage >=
                        0 && item?.changesPercentage !== null
                        ? "text-[#00FC50] before:content-['+'] "
                        : item?.changesPercentage < 0 &&
                            item?.changesPercentage !== null
                          ? 'text-[#FF2F1F]'
                          : 'text-white'} text-end"
                    >
                      {item?.changesPercentage !== null
                        ? item?.changesPercentage + "%"
                        : "n/a"}
                    </td>
                    <td
                      class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                    >
                      {item?.volume?.toLocaleString("en-US")}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <UpgradeToPro {data} />
        </div>

        {#if rawData?.length !== 0}{:else}
          <Infobox
            text={`No price history are available for ${$displayCompanyName}.`}
          />
        {/if}
      </div>
    </div>
  </div>
</section>
