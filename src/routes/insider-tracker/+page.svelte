<script lang="ts">
  import { numberOfUnreadNotification, screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";

  export let data;
  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;

  let isLoaded = false;
  let rawData = [];
  let stockList = [];

  function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);

    const options = { hour: "numeric", minute: "numeric", hour12: true };

    // Extract month and day
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Format the time as 12-hour format with AM/PM
    const time = date.toLocaleTimeString("en-US", options);

    return `${month}/${day} ${time}`;
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && stockList?.length !== rawData?.length) {
      const nextIndex = stockList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      stockList = [...stockList, ...filteredNewResults];
    }
  }

  onMount(() => {
    rawData = data?.getInsiderTracker ?? [];
    stockList = rawData?.slice(0, 50) ?? [];

    isLoaded = true;

    if (data?.user?.tier === "Pro") {
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  });

  let columns = [
    { key: "filingDate", label: "Date", align: "left" },
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "reportingName", label: "Member", align: "left" },
    { key: "marketCap", label: "Market Cap", align: "right" },
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "avgValue", label: "Avg. Value", align: "right" },
  ];

  let sortOrders = {
    filingDate: { order: "none", type: "date" },
    symbol: { order: "none", type: "string" },
    reportingName: { order: "none", type: "string" },
    marketCap: { order: "none", type: "number" },
    price: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    avgValue: { order: "none", type: "number" },
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

    let originalData = rawData;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      stockList = [...originalData]; // Reset to original data (spread to avoid mutation)
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
    stockList = [...originalData].sort(compareValues);
  };
  $: charNumber = $screenWidth < 640 ? 15 : 15;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Insider
    Tracker · stocknear
  </title>
  <meta
    name="description"
    content={`Stay ahead of the market with our real-time insider tracking page.`}
  />

  <!-- Other meta tags -->
  <meta property="og:title" content={`Insider Tracker · stocknear`} />
  <meta
    property="og:description"
    content={`Stay ahead of the market with our real-time insider tracking page.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`Insider Tracker · stocknear`} />
  <meta
    name="twitter:description"
    content={`Stay ahead of the market with our real-time insider tracking page.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 pb-40"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs ml-4">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Insider Tracker</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5 px-3 sm:px-0">
          <div
            class="w-full m-auto sm:bg-[#27272A] sm:rounded-xl h-auto pl-10 pr-10 pt-5 sm:pb-10 sm:pt-10 mt-3 mb-8"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <!-- Start Column -->
              <div>
                <div class="flex flex-row justify-center items-center">
                  <h1
                    class="text-3xl sm:text-4xl text-white text-center font-bold mb-5"
                  >
                    Unusual Insider Tracker
                  </h1>
                </div>

                <span
                  class="text-white text-md font-medium text-center flex justify-center items-center"
                >
                  Real-time Insider Trading Updates
                </span>
              </div>
              <!-- End Column -->

              <!-- Start Column -->
              <div
                class="hidden sm:block relative m-auto mb-5 mt-5 sm:mb-0 sm:mt-0"
              >
                <svg
                  class="w-40 -my-5"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="5" result="glow" />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    fill="#1E40AF"
                    d="M57.6,-58.7C72.7,-42.6,81.5,-21.3,82,0.5C82.5,22.3,74.7,44.6,59.7,60.1C44.6,75.6,22.3,84.3,0,84.3C-22.3,84.2,-44.6,75.5,-61.1,60.1C-77.6,44.6,-88.3,22.3,-87.6,0.7C-86.9,-20.8,-74.7,-41.6,-58.2,-57.7C-41.6,-73.8,-20.8,-85.2,0.2,-85.4C21.3,-85.6,42.6,-74.7,57.6,-58.7Z"
                    transform="translate(100 100)"
                    filter="url(#glow)"
                  />
                </svg>

                <div class="z-1 absolute -top-1">
                  <img
                    class="w-20 ml-10"
                    src={cloudFrontUrl + "/assets/insider_tracker_logo.png"}
                    alt="logo"
                    loading="lazy"
                  />
                </div>
              </div>
              <!-- End Column -->
            </div>
          </div>

          {#if isLoaded}
            <div
              class="mb-8 w-full text-center sm:text-start sm:flex sm:flex-row sm:items-center m-auto text-gray-100 border border-gray-800 rounded-md h-auto p-5"
            >
              <svg
                class="w-5 h-5 inline-block sm:mr-2 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                ><path
                  fill="#a474f6"
                  d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
                /></svg
              >
              We update our data in real time to bring you the latest insights on
              unusual insider trading, sourced from SEC filings with a minimum transaction
              value of $100,000.
            </div>

            <div class="w-screen sm:w-full m-auto mt-20 sm:mt-10">
              <div
                class="w-screen sm:w-full m-auto rounded-none sm:rounded-lg mb-4 overflow-x-scroll sm:overflow-hidden"
              >
                <table
                  class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto"
                >
                  <thead>
                    <TableHeader {columns} {sortOrders} {sortData} />
                  </thead>
                  <tbody>
                    {#each stockList as item, index}
                      <tr
                        class="sm:hover:bg-[#245073] border-b border-[#27272A] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] {index +
                          1 ===
                          stockList?.length && data?.user?.tier !== 'Pro'
                          ? 'opacity-[0.1]'
                          : ''}"
                      >
                        <td
                          class="text-white text-sm font-medium text-white whitespace-nowrap"
                        >
                          {formatDateTime(item?.filingDate)}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-start">
                          <a
                            href={"/stocks/" + item?.symbol}
                            class="sm:hover:text-white text-blue-400"
                          >
                            {item?.symbol}
                          </a>
                        </td>

                        <td
                          class="whitespace-nowrap text-white text-sm sm:text-[1rem] text-white text-start"
                        >
                          {item?.reportingName?.length > charNumber
                            ? item?.reportingName?.slice(0, charNumber) + "..."
                            : item?.reportingName}
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] font-medium text-white whitespace-nowrap"
                        >
                          {abbreviateNumber(item?.marketCap)}
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap font-medium text-white"
                        >
                          {item?.price}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] whitespace-nowrap text-end {item?.changesPercentage >=
                          0
                            ? 'text-[#37C97D]'
                            : 'text-[#FF2F1F]'}"
                        >
                          {item?.changesPercentage > 0
                            ? "+"
                            : ""}{item?.changesPercentage}%
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] font-medium whitespace-nowrap {item?.transactionType ===
                          'Buy'
                            ? 'text-[#37C97D]'
                            : item?.transactionType === 'Sell'
                              ? 'text-[#FF2F1F]'
                              : 'text-[#E57C34]'}"
                        >
                          <div class="flex flex-row items-center justify-end">
                            <div class="">
                              {abbreviateNumber(item?.avgValue)}
                            </div>
                            <div
                              class="ml-2 px-1.5 py-1.5 border text-center rounded-lg text-xs font-semibold"
                            >
                              {item?.transactionType}
                            </div>
                          </div>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
              <UpgradeToPro
                {data}
                title="Get the latest insider trading to never miss out"
              />
            </div>
          {:else}
            <div class="flex justify-center items-center h-80">
              <div class="relative">
                <label
                  class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
              class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href="/pricing"
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Pro Subscription 🔥
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
            class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href="/sentiment-tracker"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Sentiment Tracker <svg
                    class="w-6 h-6 inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    ><g fill="none"
                      ><rect
                        width="256"
                        height="256"
                        fill="#fff"
                        rx="60"
                      /><rect
                        width="256"
                        height="256"
                        fill="#1d9bf0"
                        rx="60"
                      /><path
                        fill="#fff"
                        d="M199.572 91.411c.11 1.587.11 3.174.11 4.776c0 48.797-37.148 105.075-105.075 105.075v-.03A104.54 104.54 0 0 1 38 184.677q4.379.525 8.79.533a74.15 74.15 0 0 0 45.865-15.839a36.98 36.98 0 0 1-34.501-25.645a36.8 36.8 0 0 0 16.672-.636c-17.228-3.481-29.623-18.618-29.623-36.198v-.468a36.7 36.7 0 0 0 16.76 4.622c-16.226-10.845-21.228-32.432-11.43-49.31a104.8 104.8 0 0 0 76.111 38.582a36.95 36.95 0 0 1 10.683-35.283c14.874-13.982 38.267-13.265 52.249 1.601a74.1 74.1 0 0 0 23.451-8.965a37.06 37.06 0 0 1-16.234 20.424A73.5 73.5 0 0 0 218 72.282a75 75 0 0 1-18.428 19.13"
                      /></g
                    ></svg
                  >
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Follow the latest trends in realtime on social media
              </span>
            </a>
          </div>

          <div
            class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href="/reddit-tracker"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Reddit Tracker 🚀
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest trends of r/Wallstreetbets
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
