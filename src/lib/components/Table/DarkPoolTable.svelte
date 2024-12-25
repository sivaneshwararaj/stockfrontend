<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";

  import VirtualList from "svelte-tiny-virtual-list";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import toast from "svelte-french-toast";

  export let data;
  export let optionsWatchlist;
  export let displayedData = [];
  export let filteredData = [];
  export let rawData = [];

  let animationClass = "";
  let animationId = "";

  function formatTime(timeString) {
    // Split the time string into components
    const [hours, minutes, seconds] = timeString?.split(":").map(Number);

    // Determine AM or PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convert hours from 24-hour to 12-hour format
    const formattedHours = hours % 12 || 12; // Converts 0 to 12 for midnight

    // Format the time string
    const formattedTimeString = `${formattedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;

    return formattedTimeString;
  }

  function reformatDate(dateString) {
    return (
      dateString.substring(5, 7) +
      "/" +
      dateString.substring(8) +
      "/" +
      dateString.substring(2, 4)
    );
  }

  let sortOrders = {
    time: "none",
    ticker: "none",
    expiry: "none",
    dte: "none",
    strike: "none",
    callPut: "none",
    sentiment: "none",
    spot: "none",
    price: "none",
    premium: "none",
    type: "none",
    exec: "none",
    vol: "none",
    oi: "none",
  };

  // Generalized sorting function
  function sortData(key) {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k] = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];
    const currentOrderIndex = orderCycle.indexOf(sortOrders[key]);
    sortOrders[key] = orderCycle[(currentOrderIndex + 1) % orderCycle.length];

    const sortOrder = sortOrders[key];
    const originalData =
      filteredData?.length !== 0 ? [...filteredData] : [...rawData];

    // Reset to original data when 'none'
    if (sortOrder === "none") {
      displayedData = originalData;
      return;
    }

    const compareFunctions = {
      time: (a, b) => {
        const timeA = new Date("1970-01-01T" + a.time).getTime();
        const timeB = new Date("1970-01-01T" + b.time).getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      },
      ticker: (a, b) => {
        const tickerA = a.ticker.toUpperCase();
        const tickerB = b.ticker.toUpperCase();
        return sortOrder === "asc"
          ? tickerA.localeCompare(tickerB)
          : tickerB.localeCompare(tickerA);
      },
      expiry: (a, b) => {
        const timeA = new Date(a.date_expiration);
        const timeB = new Date(b.date_expiration);
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      },
      dte: (a, b) => {
        const timeA = new Date(a.date_expiration);
        const timeB = new Date(b.date_expiration);
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      },
      strike: (a, b) => {
        const strikeA = parseFloat(a.strike_price);
        const strikeB = parseFloat(b.strike_price);
        return sortOrder === "asc" ? strikeA - strikeB : strikeB - strikeA;
      },
      spot: (a, b) => {
        const spotA = parseFloat(a.underlying_price);
        const spotB = parseFloat(b.underlying_price);
        return sortOrder === "asc" ? spotA - spotB : spotB - spotA;
      },
      price: (a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      },
      premium: (a, b) => {
        const premiumA = parseFloat(a.cost_basis);
        const premiumB = parseFloat(b.cost_basis);
        return sortOrder === "asc" ? premiumA - premiumB : premiumB - premiumA;
      },
      size: (a, b) => {
        const volA = parseFloat(a?.size);
        const volB = parseFloat(b?.size);
        return sortOrder === "asc" ? volA - volB : volB - volA;
      },
      vol: (a, b) => {
        const volA = parseFloat(a.volume);
        const volB = parseFloat(b.volume);
        return sortOrder === "asc" ? volA - volB : volB - volA;
      },
      oi: (a, b) => {
        const oiA = parseFloat(a.open_interest);
        const oiB = parseFloat(b.open_interest);
        return sortOrder === "asc" ? oiA - oiB : oiB - oiA;
      },
      callPut: (a, b) => {
        const callPutA = a.put_call?.toUpperCase();
        const callPutB = b.put_call?.toUpperCase();
        return sortOrder === "asc"
          ? callPutA.localeCompare(callPutB)
          : callPutB.localeCompare(callPutA);
      },
      sentiment: (a, b) => {
        const sentimentOrder = { BULLISH: 1, NEUTRAL: 2, BEARISH: 3 };
        const sentimentA = sentimentOrder[a?.sentiment?.toUpperCase()] || 4;
        const sentimentB = sentimentOrder[b?.sentiment?.toUpperCase()] || 4;
        return sortOrder === "asc"
          ? sentimentA - sentimentB
          : sentimentB - sentimentA;
      },
      type: (a, b) => {
        const typeOrder = { SWEEP: 1, TRADE: 2 };
        const typeA = typeOrder[a.option_activity_type?.toUpperCase()] || 3;
        const typeB = typeOrder[b.option_activity_type?.toUpperCase()] || 3;
        return sortOrder === "asc" ? typeA - typeB : typeB - typeA;
      },
      exec: (a, b) => {
        const tickerA = a?.execution_estimate?.toUpperCase();
        const tickerB = b?.execution_estimate?.toUpperCase();
        return sortOrder === "asc"
          ? tickerA.localeCompare(tickerB)
          : tickerB.localeCompare(tickerA);
      },
    };

    // Sort using the appropriate comparison function
    displayedData = originalData.sort(compareFunctions[key]);
  }
</script>

<div class="table-container">
  <div class="table">
    <VirtualList
      width="100%"
      height={$screenWidth < 640 ? 550 : 850}
      itemCount={displayedData.length}
      itemSize={40}
    >
      <div slot="header" class="tr th sticky z-40 top-0">
        <!-- Table headers -->
        <div
          on:click={() => sortData("time")}
          class="td cursor-pointer select-none bg-[#1E222D] text-slate-300 font-bold text-xs text-start uppercase"
        >
          Time
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['time'] ===
            'asc'
              ? 'rotate-180'
              : ''} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("ticker")}
          class="td cursor-pointer select-none bg-[#1E222D] font-bold text-slate-300 text-xs text-start uppercase"
        >
          Symbol
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['ticker'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['ticker'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>

        <div
          on:click={() => sortData("price")}
          class="td cursor-pointer select-none bg-[#1E222D] text-slate-300 font-bold text-xs text-start uppercase"
        >
          Price
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['price'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['price'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("premium")}
          class="td cursor-pointer select-none bg-[#1E222D] text-slate-300 font-bold text-xs text-start uppercase"
        >
          Premium
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['premium'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['premium'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>

        <div
          on:click={() => sortData("size")}
          class="td cursor-pointer select-none bg-[#1E222D] text-slate-300 font-bold text-xs text-start uppercase"
        >
          Size
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['size'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['size'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("vol")}
          class="td cursor-pointer select-none bg-[#1E222D] text-slate-300 font-bold text-xs text-start uppercase"
        >
          Volume
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['vol'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['vol'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>

        <div
          on:click={() => sortData("vol")}
          class="td cursor-pointer select-none bg-[#1E222D] text-slate-300 font-bold text-xs text-start uppercase"
        >
          % Daily Volume
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['vol'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['vol'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>

        <div
          on:click={() => sortData("vol")}
          class="td cursor-pointer select-none bg-[#1E222D] text-slate-300 font-bold text-xs text-start uppercase"
        >
          % 30D Volume
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['vol'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['vol'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>

        <div
          on:click={() => sortData("vol")}
          class="td cursor-pointer select-none bg-[#1E222D] text-slate-300 font-bold text-xs text-start uppercase"
        >
          Sector
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['vol'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['vol'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>

        <div
          on:click={() => sortData("vol")}
          class="td cursor-pointer select-none bg-[#1E222D] text-slate-300 font-bold text-xs text-start uppercase"
        >
          Issue Type
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['vol'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['vol'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
      </div>

      <div
        slot="item"
        let:index
        let:style
        {style}
        class="tr {index % 2 === 0 ? 'bg-secondary' : 'bg-[#09090B]'}"
      >
        <!-- Row data -->

        <div
          style="justify-content: center;"
          class="td text-white text-sm sm:text-[1rem] text-start m-auto whitespace-nowrap"
        >
          {reformatDate(displayedData[index]?.date_expiration)}
        </div>
        <div
          on:click|stopPropagation
          style="justify-content: center;"
          class="td text-sm sm:hover:text-white sm:text-[1rem] text-blue-400 font-normal"
        >
          <HoverStockChart
            symbol={displayedData[index]?.ticker}
            assetType={displayedData[index]?.underlying_type}
          />
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-start text-white"
        >
          {displayedData[index]?.price}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-start text-white"
        >
          {@html abbreviateNumber(displayedData[index]?.cost_basis, true, true)}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end"
        >
          {new Intl.NumberFormat("en", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(displayedData[index]?.size)}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end"
        >
          {new Intl.NumberFormat("en", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(displayedData[index]?.volume)}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end"
        >
          {new Intl.NumberFormat("en", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(displayedData[index]?.volume)}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end"
        >
          {new Intl.NumberFormat("en", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(displayedData[index]?.volume)}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end truncate"
        >
          Healthcare
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end"
        >
          Stock
        </div>
      </div>
    </VirtualList>
  </div>
</div>

<style>
  .table-container {
    width: 100%;
    overflow-x: auto;
  }

  .table :global(.virtual-list-inner) {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    .table {
      width: 1000px;
    }
  }

  .table .virtual-list-inner {
    flex-flow: column nowrap;
    font-size: 0.8rem;
    line-height: 1.5;
    flex: 1 1 auto;
  }

  .th {
    display: none;
    font-weight: 700;
    background-color: #09090b;
  }

  .th > .td {
    white-space: nowrap;
    justify-content: center;
  }

  .tr {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
  }

  .tr.even {
    background-color: #2a2e39;
  }

  .tr.odd {
    background-color: #09090b;
  }

  .td {
    display: flex;
    flex-flow: row nowrap;
    flex-grow: 1;
    flex-basis: 0;
    padding: 0.5em;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0px;
    white-space: nowrap;
  }

  .heartbeat {
    animation: heartbeat-animation 0.3s;
    animation-timing-function: ease-in-out;
  }

  @keyframes heartbeat-animation {
    0% {
      transform: rotate(0deg) scale(0.95);
    }
    25% {
      transform: rotate(10deg) scale(1.05);
    }
    50% {
      transform: rotate(0deg) scale(1.2);
    }
    75% {
      transform: rotate(-10deg) scale(1.05);
    }
    100% {
      transform: rotate(0deg) scale(0.95);
    }
  }
</style>
