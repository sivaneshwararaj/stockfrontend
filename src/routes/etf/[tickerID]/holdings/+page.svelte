<script lang="ts">
  import {
    etfTicker,
    numberOfUnreadNotification,
    displayCompanyName,
  } from "$lib/store";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { screenWidth, getCache, setCache } from "$lib/store";
  import { abbreviateNumber, formatString } from "$lib/utils";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";

  export let data;
  let rawData = data?.getETFHoldings;
  let holdings = rawData?.slice(0, 50);

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && holdings?.length !== rawData?.length) {
      const nextIndex = holdings?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      holdings = [...holdings, ...filteredNewResults];
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: charNumber = $screenWidth < 640 ? 20 : 20;

  let columns = [
    { key: "asset", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "Change", align: "right" },
    { key: "sharesNumber", label: "Shares", align: "right" },
    { key: "weightPercentage", label: "% Weight", align: "right" },
  ];

  let sortOrders = {
    asset: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    price: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    sharesNumber: { order: "none", type: "number" },
    weightPercentage: { order: "none", type: "number" },
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
      holdings = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
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
    holdings = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  const exportData = (format = "csv") => {
    if (data?.user?.tier === "Pro") {
      // Add headers row
      const csvRows = [];
      csvRows.push("Symbol,Name,Price, Change, Shares,Weight");

      // Add data rows
      rawData.forEach((item) => {
        const csvRow = `${item?.asset},${item?.name},${item?.price},${item?.changesPercentage},${item?.sharesNumber},${item?.weightPercentage}`;
        csvRows.push(csvRow);
      });

      // Create CSV blob and trigger download
      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", `${$etfTicker}_holdings.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      goto("/pricing");
    }
  };
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$etfTicker}) Holdings List · stocknear
  </title>
  <meta
    name="description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$etfTicker}) Holdings List · stocknear`}
  />
  <meta
    property="og:description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$etfTicker}) Holdings List · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="bg-[#09090B] overflow-hidden text-white h-full mb-40 sm:mb-0 w-full"
>
  <div class="flex justify-center m-auto h-full overflow-hidden w-full">
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
    >
      <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
        <div class="mb-6">
          <h2 class="text-2xl sm:text-3xl text-gray-200 font-bold mb-4">
            ETF Holdings
          </h2>

          <div
            class="text-white p-3 sm:p-5 mb-10 rounded-lg sm:flex sm:flex-row sm:items-center border border-slate-800 text-sm sm:text-[1rem]"
          >
            <svg
              class="w-6 h-6 flex-shrink-0 inline-block sm:mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              ><path
                fill="#a474f6"
                d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
              /></svg
            >

            {#if rawData?.length !== 0}
              The {$displayCompanyName} holds {rawData?.length} different assets
              and the largest one in the portfolio is {formatString(
                rawData?.at(0)?.name,
              )}, making up {rawData?.at(0)?.weightPercentage?.toFixed(2)}% of
              the total.
            {:else}
              No information available for {$displayCompanyName}.
            {/if}
          </div>
        </div>

        {#if holdings?.length !== 0}
          <div
            class="flex flex-row items-center justify-end w-fit sm:w-[50%] md:w-auto ml-auto"
          >
            <Button
              on:click={() => exportData("csv")}
              class="w-fit border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-lg truncate"
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
          </div>

          <div class="w-full overflow-x-auto mt-5">
            <table
              class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B]"
            >
              <thead>
                <TableHeader {columns} {sortOrders} {sortData} />
              </thead>
              <tbody>
                {#each holdings as item}
                  <!-- row -->
                  {#if item?.asset !== null}
                    <tr
                      class="w-full sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A]"
                    >
                      <td
                        class="text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B]"
                      >
                        <HoverStockChart symbol={item?.asset} />
                      </td>

                      <td
                        class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B]"
                      >
                        {item?.name?.length > charNumber
                          ? formatString(item?.name?.slice(0, charNumber)) +
                            "..."
                          : formatString(item?.name)}
                      </td>

                      <td
                        class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B] text-end"
                      >
                        {item?.price}
                      </td>

                      <td
                        class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B] text-end"
                      >
                        {#if item?.changesPercentage >= 0}
                          <span class="text-[#00FC50]"
                            >+{item?.changesPercentage >= 1000
                              ? abbreviateNumber(item?.changesPercentage)
                              : item?.changesPercentage?.toFixed(2)}%</span
                          >
                        {:else if item?.changesPercentage < 0}
                          <span class="text-[#FF2F1F]"
                            >{item?.changesPercentage <= -1000
                              ? abbreviateNumber(item?.changesPercentage)
                              : item?.changesPercentage?.toFixed(2)}%
                          </span>
                        {:else}
                          -
                        {/if}
                      </td>

                      <td
                        class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B] text-end"
                      >
                        {abbreviateNumber(item?.sharesNumber)}
                      </td>

                      <td
                        class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b border-[#09090B] text-end"
                      >
                        {item?.weightPercentage >= 0.01
                          ? item?.weightPercentage?.toFixed(2)
                          : "< 0.01"}%
                      </td>
                    </tr>
                  {/if}
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <h2
            class="pl-4 pr-4 flex justify-center items-center text-md sm:text-lg text-center text-slate-200"
          >
            No holdings are available for {$displayCompanyName}.
          </h2>
        {/if}
      </div>
    </div>
  </div>
</section>
