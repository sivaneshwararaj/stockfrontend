<script lang="ts">
  import { screenWidth, numberOfUnreadNotification } from "$lib/store";
  import logo from "$lib/images/top_winner_logo.png";
  import { abbreviateNumber } from "$lib/utils";
  import MiniPlot from "$lib/components/MiniPlot.svelte";
  import { onMount } from "svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";

  export let data;
  let isLoaded = false;
  const rawData = data?.getMiniPlotsIndex;
  let timePeriod = "1D";
  let priceDataSP500;
  let priceDataNasdaq;
  let priceDataDowJones;
  let priceDataRussel2000;

  let changeSP500, changeNasdaq, changeDowJones, changeRussel2000;
  let previousCloseSP500,
    previousCloseNasdaq,
    previousCloseDowJones,
    previousCloseRussel2000;

  function getCurrentDateFormatted() {
    // Get current date
    let date = new Date();

    // If today is Saturday or Sunday, move to the previous Friday
    if (date.getDay() === 6) {
      // Saturday
      date.setDate(date.getDate() - 1);
    } else if (date.getDay() === 0) {
      // Sunday
      date.setDate(date.getDate() - 2);
    }

    // Define months array for formatting
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Get formatted date components
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    // Return formatted date
    return `${month} ${day}, ${year}`;
  }

  // Assign values based on the symbol
  rawData?.forEach(
    ({ symbol, priceData, changesPercentage, previousClose }) => {
      switch (symbol) {
        case "SPY":
          priceDataSP500 = priceData?.map(({ time, value }) => ({
            time: Date?.parse(time),
            value,
          }));
          priceDataSP500 = priceDataSP500?.filter(
            (item) =>
              item.value !== 0 &&
              item.value !== null &&
              item.value !== undefined,
          );
          changeSP500 = changesPercentage;
          previousCloseSP500 = previousClose;
          break;
        case "QQQ":
          priceDataNasdaq = priceData?.map(({ time, value }) => ({
            time: Date?.parse(time),
            value,
          }));
          priceDataNasdaq = priceDataNasdaq?.filter(
            (item) =>
              item.value !== 0 &&
              item.value !== null &&
              item.value !== undefined,
          );
          changeNasdaq = changesPercentage;
          previousCloseNasdaq = previousClose;
          break;
        case "DIA":
          priceDataDowJones = priceData?.map(({ time, value }) => ({
            time: Date?.parse(time),
            value,
          }));
          priceDataDowJones = priceDataDowJones?.filter(
            (item) =>
              item.value !== 0 &&
              item.value !== null &&
              item.value !== undefined,
          );
          changeDowJones = changesPercentage;
          previousCloseDowJones = previousClose;
          break;
        case "IWM":
          priceDataRussel2000 = priceData?.map(({ time, value }) => ({
            time: Date?.parse(time),
            value,
          }));
          priceDataRussel2000 = priceDataRussel2000?.filter(
            (item) =>
              item.value !== 0 &&
              item.value !== null &&
              item.value !== undefined,
          );
          changeRussel2000 = changesPercentage;
          previousCloseRussel2000 = previousClose;
          break;
        default:
          // Handle unknown symbol
          break;
      }
    },
  );

  let outputList = data?.getDailyGainerLoserActive;
  let gainerLoserActive = outputList?.gainers[timePeriod];

  let buttonText = "Top Winners";

  const tabs = [
    {
      title: "Gainers",
    },
    {
      title: "Losers",
    },
    {
      title: "Active",
    },
  ];

  let activeIdx = 0;

  function changeSection(index) {
    activeIdx = index;
    sortOrders = {
      symbol: { order: "none", type: "string" },
      name: { order: "none", type: "string" },
      changesPercentage: { order: "none", type: "number" },
      price: { order: "none", type: "number" },
      marketCap: { order: "none", type: "number" },
      volume: { order: "none", type: "number" },
    };
    if (index === 0) {
      gainerLoserActive = outputList?.gainers[timePeriod];
      buttonText = "Top Winners";
    } else if (index === 1) {
      gainerLoserActive = outputList?.losers[timePeriod];
      buttonText = "Top Losers";
    } else if (index === 2) {
      gainerLoserActive = outputList?.active[timePeriod];
      buttonText = "Most Active";
    }
  }

  function selectTimeInterval(state) {
    timePeriod = state;
    if (buttonText === "Top Winners") {
      gainerLoserActive = outputList?.gainers[timePeriod];
    } else if (buttonText === "Top Losers") {
      gainerLoserActive = outputList?.losers[timePeriod];
    } else if (buttonText === "Most Active") {
      gainerLoserActive = outputList?.active[timePeriod];
    }
  }

  onMount(() => {
    isLoaded = true;
  });

  let columns = [
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "price", label: "Price", align: "right" },
    { key: "marketCap", label: "Market Cap", align: "right" },
    { key: "volume", label: "Volume", align: "right" },
  ];

  let sortOrders = {
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    changesPercentage: { order: "none", type: "number" },
    price: { order: "none", type: "number" },
    marketCap: { order: "none", type: "number" },
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

    let originalData = [];

    if (buttonText === "Top Winners") {
      originalData = data?.getDailyGainerLoserActive?.gainers[timePeriod];
    } else if (buttonText === "Top Losers") {
      originalData = data?.getDailyGainerLoserActive?.losers[timePeriod];
    } else if (buttonText === "Most Active") {
      originalData = data?.getDailyGainerLoserActive?.active[timePeriod];
    }

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      gainerLoserActive = [...originalData]; // Reset to original data (spread to avoid mutation)
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
    gainerLoserActive = [...originalData].sort(compareValues);
  };
  $: charNumber = $screenWidth < 640 ? 20 : 30;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Today's
    Top Stock Gainers, Losers and Most Active · stocknear
  </title>
  <meta
    name="description"
    content={`A list of the stocks with the highest percentage gain, highest percentage loss and most active today. See stock price, volume, market cap and more.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`Today's Top Stock Gainers, Losers and Most Active · stocknear`}
  />
  <meta
    property="og:description"
    content={`A list of the stocks with the highest percentage gain, highest percentage loss and most active today. See stock price, volume, market cap and more.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`Today's Top Stock Gainers, Losers and Most Active · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`A list of the stocks with the highest percentage gain, highest percentage loss and most active today. See stock price, volume, market cap and more.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-screen-2xl overflow-hidden min-h-screen pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li class=""><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Market Movers</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <h1 class="mb-6 text-white text-2xl sm:text-3xl font-bold">
            Market Movers
          </h1>

          {#if isLoaded}
            <div class="sm:hidden text-white text-xs sm:text-sm pb-5 sm:pb-2">
              Stock Indexes - {getCurrentDateFormatted()}
            </div>

            <div
              class="w-full sm:hidden -mt-4 sm:mt-0 mb-8 m-auto flex justify-start sm:justify-center items-center pb-3 sm:pb-0"
            >
              <div
                class="w-full grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-3"
              >
                <MiniPlot
                  title="S&P500"
                  priceData={priceDataSP500}
                  changesPercentage={changeSP500}
                  previousClose={previousCloseSP500}
                />
                <MiniPlot
                  title="Nasdaq"
                  priceData={priceDataNasdaq}
                  changesPercentage={changeNasdaq}
                  previousClose={previousCloseNasdaq}
                />
                <MiniPlot
                  title="Dow"
                  priceData={priceDataDowJones}
                  changesPercentage={changeDowJones}
                  previousClose={previousCloseDowJones}
                />
                <MiniPlot
                  title="Russel"
                  priceData={priceDataRussel2000}
                  changesPercentage={changeRussel2000}
                  previousClose={previousCloseRussel2000}
                />
              </div>
            </div>

            <nav class="border-b-[2px] overflow-x-scroll whitespace-nowrap">
              <ul
                class="flex flex-row items-center w-full text-[1rem] sm:text-lg text-white"
              >
                <li
                  on:click={() => changeSection(0)}
                  class="p-2 px-5 cursor-pointer {activeIdx === 0
                    ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
                >
                  Gainers
                </li>
                <li
                  on:click={() => changeSection(1)}
                  class="p-2 px-5 cursor-pointer {activeIdx === 1
                    ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
                >
                  Losers
                </li>
                <li
                  on:click={() => changeSection(2)}
                  class="p-2 px-5 cursor-pointer {activeIdx === 2
                    ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
                >
                  Active
                </li>
              </ul>
            </nav>

            <nav class="mb-3 pt-1 overflow-x-scroll whitespace-nowrap">
              <ul
                class="flex flex-row items-center w-full text-sm sm:text-[1rem] text-white"
              >
                <li
                  on:click={() => selectTimeInterval("1D")}
                  class="p-2 px-5 cursor-pointer {timePeriod === '1D'
                    ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
                >
                  Today
                </li>
                <li
                  on:click={() => selectTimeInterval("1W")}
                  class="p-2 px-5 cursor-pointer {timePeriod === '1W'
                    ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
                >
                  Week
                </li>
                <li
                  on:click={() => selectTimeInterval("1M")}
                  class="p-2 px-5 cursor-pointer {timePeriod === '1M'
                    ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
                >
                  Month
                </li>
                <li
                  on:click={() => selectTimeInterval("3M")}
                  class="p-2 px-5 cursor-pointer {timePeriod === '3M'
                    ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
                >
                  3 Months
                </li>
                <li
                  on:click={() => selectTimeInterval("6M")}
                  class="p-2 px-5 cursor-pointer {timePeriod === '6M'
                    ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                    : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
                >
                  6 Months
                </li>
              </ul>
            </nav>

            <!--Start Top Winners/Losers-->
            <div
              class="flex flex-col justify-center items-center overflow-hidden mt-10"
            >
              <div class="w-full overflow-x-scroll no-scrollbar">
                <table
                  class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B]"
                >
                  <thead>
                    <TableHeader {columns} {sortOrders} {sortData} />
                  </thead>
                  <tbody>
                    {#each gainerLoserActive as item}
                      <tr
                        class="border-b border-[#27272A] sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A]"
                      >
                        <td
                          class="border-b-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          <a
                            href={"/stocks/" + item?.symbol}
                            class="sm:hover:text-white text-blue-400"
                          >
                            {item?.symbol}
                          </a>
                        </td>
                        <td
                          class="border-b-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.name?.length > charNumber
                            ? item?.name?.slice(0, charNumber) + "..."
                            : item?.name}
                        </td>

                        <td
                          class="text-white text-end text-sm sm:text-[1rem] font-medium border-b-[#09090B]"
                        >
                          {#if item?.changesPercentage >= 0}
                            <span class="text-[#00FC50]"
                              >+{item?.changesPercentage >= 1000
                                ? abbreviateNumber(item?.changesPercentage)
                                : item?.changesPercentage?.toFixed(2)}%</span
                            >
                          {:else}
                            <span class="text-[#FF2F1F]"
                              >{item?.changesPercentage <= -1000
                                ? abbreviateNumber(item?.changesPercentage)
                                : item?.changesPercentage?.toFixed(2)}%
                            </span>
                          {/if}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] text-end border-b-[#09090B]"
                        >
                          {item?.price?.toFixed(2)}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] border-b-[#09090B] text-end"
                        >
                          {item?.marketCap !== null
                            ? abbreviateNumber(item?.marketCap)
                            : "-"}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] border-b-[#09090B] text-end"
                        >
                          {item?.volume !== null
                            ? abbreviateNumber(item?.volume)
                            : "-"}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {:else}
            <div class="flex justify-center items-center h-80">
              <div class="relative">
                <label
                  class="bg-[#09090B] rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <span class="loading loading-spinner loading-md text-gray-400"
                  ></span>
                </label>
              </div>
            </div>
          {/if}
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href={"/pricing"}
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

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/analysts"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Analyst
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Wall Street analyst ratings.
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/politicians"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Congress Trading
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Congress trading insights.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
