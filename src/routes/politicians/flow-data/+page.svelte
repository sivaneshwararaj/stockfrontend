<script lang="ts">
  import { formatString } from "$lib/utils";
  import { getPartyForPoliticians } from "$lib/utils";
  import { screenWidth, numberOfUnreadNotification } from "$lib/store";
  import { onMount } from "svelte";
  //import UpgradeToPro from '$lib/components/UpgradeToPro.svelte';
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  //  import * as XLSX from 'xlsx';

  export let data;

  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;

  let rawData = data?.getPoliticianRSS;
  let slicedRawData = [];
  let displayList = [];

  let isLoaded = false;
  let displayStructure = "Table";
  let displayRows = 100;

  let filterList = [];

  let changeRowFilter = false;
  let changeRuleFilter = false;

  const rowList = [10, 20, 50, 100, 200];

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && displayList?.length !== slicedRawData?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = slicedRawData?.slice(nextIndex, nextIndex + 9);
      displayList = [...displayList, ...filteredNewResults];
    }
  }

  function changeRows(rows: Number) {
    changeRowFilter = true;
    displayRows = rows;
  }
  function changeStructure() {
    if (displayStructure === "Card") {
      displayStructure = "Table";
    } else {
      displayStructure = "Card";
    }
  }

  onMount(async () => {
    rawData?.forEach((item) => {
      let representative = item?.representative || "";

      representative = representative
        ?.replace("Jr", "")
        .replace(/Dr./g, "")
        .replace(/Dr_/g, "");

      const fullName = representative
        ?.replace(/(\s(?:Dr\s)?\w(?:\.|(?=\s)))?\s/g, "_")
        .trim();
      item.representative = fullName?.replace(/_/g, " ");
    });

    rawData = rawData?.map((item) => {
      const party = getPartyForPoliticians(item?.representative);
      return {
        ...item,
        party: party,
      };
    });

    slicedRawData = rawData?.slice(0, displayRows) ?? [];
    displayList = slicedRawData?.slice(0, 20) ?? [];
    isLoaded = true;

    window.addEventListener("scroll", handleScroll);
    //window.addEventListener('keydown', handleKeyDown);

    return () => {
      // Cleanup the event listeners when the component is unmounted
      window.removeEventListener("scroll", handleScroll);
      //window.removeEventListener('keydown', handleKeyDown);
    };
  });

  function getAbbreviatedName(fullName) {
    if (fullName === null) {
      return "-";
    }

    const names = fullName?.split(" ");
    let firstName = names[0];
    // Remove any title prefix (e.g. Dr., Mr., Mrs., Ms.)
    if (names.length > 1 && /^(Dr|Mr|Mrs|Ms)\.?$/i.test(names[0])) {
      firstName = names[1];
      names?.splice(0, 1);
    }
    const initials = names
      ?.slice(0, -1)
      ?.map((name) => name?.charAt(0))
      ?.join(". ");
    const lastName = names[names?.length - 1];
    return `${firstName?.charAt(0)}. ${lastName}`;
  }

  const exportData = (format = "csv") => {
    const data = slicedRawData;
    if (!data || data.length === 0) {
      return;
    }

    let properties = [
      { key: "disclosureDate", label: "Disclosure Date" },
      { key: "transactionDate", label: "Transaction Date" },
      { key: "owner", label: "Owner" },
      { key: "ticker", label: "Ticker" },
      { key: "assetDescription", label: "Asset Description" },
      { key: "type", label: "Type" },
      { key: "amount", label: "Amount" },
      { key: "representative", label: "Representative" },
      { key: "district", label: "District" },
      { key: "link", label: "Link" },
      { key: "capitalGainsOver200USD", label: "Capital Gains Over $200" },
      { key: "assetType", label: "Asset Type" },
      { key: "party", label: "Party" },
    ];

    // Create rows for CSV/Excel
    let rows = data?.map((item) =>
      properties?.map((property) => item[property.key] || ""),
    );

    // Include headers
    const headers = properties.map((prop) => prop.label);
    rows.unshift(headers);

    // Check the format to export
    if (format.toLowerCase() === "csv") {
      const csvContent = rows.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], {
        type: "data:text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format.toLowerCase() === "excel") {
      /*
          const worksheet = XLSX.utils.aoa_to_sheet(rows);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
          XLSX.writeFile(workbook, "data.xlsx");
          */
    }
  };

  async function handleFilter(e, newFilter) {
    //e.preventDefault();

    changeRuleFilter = true;
    const filterSet = new Set(filterList);

    // Check if the new filter already exists in the list
    if (filterSet?.has(newFilter)) {
      // If it exists, remove it from the list
      filterSet?.delete(newFilter);
    } else {
      // If it doesn't exist, add it to the list
      filterSet?.add(newFilter);
    }
    filterList = Array?.from(filterSet);
    //console.log(filterList)
    changeRuleFilter = true;
  }

  function filterData(data) {
    const newData = data?.filter((item) => {
      //Bought only nested conditions
      if (
        filterList?.includes("Bought") &&
        item?.type === "Bought" &&
        !filterList?.includes("Democratic") &&
        !filterList?.includes("Republican") &&
        !filterList?.includes("Other")
      ) {
        return true;
      }
      //Sell only nested conditions
      if (
        filterList?.includes("Sold") &&
        item?.type === "Sold" &&
        !filterList?.includes("Democratic") &&
        !filterList?.includes("Republican") &&
        !filterList?.includes("Other")
      ) {
        return true;
      }

      //Amount only nested conditions
      if (
        filterList?.includes("$1,001 - $15,000") &&
        item?.amount === "$1,001 - $15,000"
      ) {
        return true;
      }

      //Democratic Party nested conditions
      if (
        filterList?.includes("Democratic") &&
        item?.party &&
        item?.party?.toLowerCase() === "democratic"
      ) {
        if (!filterList?.includes("Sold") && !filterList?.includes("Bought")) {
          return true;
        } else if (
          filterList?.includes("Democratic") &&
          item?.party &&
          item?.party?.toLowerCase() === "democratic" &&
          filterList?.includes("Bought") &&
          item?.type === "Bought"
        ) {
          return true;
        } else if (
          filterList?.includes("Democratic") &&
          item?.party &&
          item?.party?.toLowerCase() === "democratic" &&
          filterList?.includes("Sold") &&
          item?.type === "Sold"
        ) {
          return true;
        }
      }
      //Republican Party nested conditions
      if (
        filterList?.includes("Republican") &&
        item?.party &&
        item?.party?.toLowerCase() === "republican"
      ) {
        if (!filterList?.includes("Sold") && !filterList?.includes("Bought")) {
          return true;
        } else if (
          filterList.includes("Republican") &&
          item?.party &&
          item?.party?.toLowerCase() === "republican" &&
          filterList?.includes("Bought") &&
          item?.type === "Bought"
        ) {
          return true;
        } else if (
          filterList.includes("Republican") &&
          item?.party &&
          item?.party?.toLowerCase() === "republican" &&
          filterList?.includes("Sold") &&
          item?.type === "Sold"
        ) {
          return true;
        }
      }

      //Other Party nested conditions
      if (
        filterList?.includes("Other") &&
        item?.party &&
        item?.party?.toLowerCase() === "other"
      ) {
        if (!filterList?.includes("Sold") && !filterList?.includes("Bought")) {
          return true;
        } else if (
          filterList.includes("Other") &&
          item?.party &&
          item?.party?.toLowerCase() === "other" &&
          filterList?.includes("Bought") &&
          item?.type === "Bought"
        ) {
          return true;
        } else if (
          filterList.includes("Other") &&
          item?.party &&
          item?.party?.toLowerCase() === "other" &&
          filterList?.includes("Sold") &&
          item?.type === "Sold"
        ) {
          return true;
        }
      } else {
        return false;
      }
    });

    return newData;
  }

  $: charNumber = $screenWidth < 640 ? 20 : 40;

  $: {
    if (displayRows && changeRowFilter === true) {
      slicedRawData = rawData?.slice(0, displayRows);

      slicedRawData =
        filterList?.length !== 0 ? filterData(slicedRawData) : slicedRawData;
      slicedRawData = [...slicedRawData];
      displayList = slicedRawData?.slice(0, 20) ?? [];
      displayList = [...displayList];

      changeRowFilter = false;
    }
  }

  $: {
    if (filterList && changeRuleFilter === true) {
      slicedRawData = rawData?.slice(0, displayRows);
      slicedRawData =
        filterList?.length !== 0 ? filterData(slicedRawData) : slicedRawData;
      slicedRawData = [...slicedRawData];
      displayList = slicedRawData?.slice(0, 20) ?? [];
      displayList = [...displayList];
      changeRuleFilter = false;
      //console.log(slicedRawData?.length)
    }
  }
</script>

<!-- HEADER FOR BETTER SEO -->
<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Latest
    Congressional Trading · stocknear</title
  >
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta
    name="description"
    content="Find the latest congress trading and see what insiders who have access to regulations are investing."
  />
  <!-- Other meta tags -->
  <meta
    property="og:title"
    content="Latest Congressional Trading · stocknear"
  />
  <meta
    property="og:description"
    content="Find the latest congress trading and see what insiders who have access to regulations are investing."
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content="Latest Congressional Trading · stocknear"
  />
  <meta
    name="twitter:description"
    content="Find the latest congress trading and see what insiders who have access to regulations are investing."
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 pb-40 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs ml-4">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Congress Flow</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div
            class="w-full m-auto sm:bg-[#27272A] sm:rounded-xl h-auto pl-10 pr-10 pt-5 sm:pb-10 sm:pt-10 mt-3 mb-8"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <!-- Start Column -->
              <div>
                <div class="flex flex-row justify-center items-center">
                  <h1
                    class="text-3xl sm:text-4xl text-white text-center font-bold mb-5 w-80 whitespace-normal"
                  >
                    Latest Trades of Politicians
                  </h1>
                </div>

                <span
                  class="hidden sm:block text-white text-md font-medium text-center flex justify-center items-center"
                >
                  Gain from monitoring the latest trades of corrupt U.S.
                  politicians
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

                <div class="z-1 absolute top-2 right-0">
                  <img
                    class="w-24 mr-8"
                    src={cloudFrontUrl + "/assets/politician_logo.png"}
                    alt="logo"
                    loading="lazy"
                  />
                </div>
              </div>
              <!-- End Column -->
            </div>
          </div>

          <body class="w-full overflow-hidden m-auto">
            {#if isLoaded}
              <section class="w-full overflow-hidden m-auto sm:mt-10">
                <div
                  class="p-3 sm:p-0 flex justify-center w-full m-auto overflow-hidden"
                >
                  <div
                    class="relative flex justify-center items-center overflow-hidden w-full"
                  >
                    <main class="w-full">
                      <div class="w-full m-auto mt-4">
                        <div
                          class="w-full m-auto rounded-none sm:rounded-lg mb-4 overflow-x-scroll sm:overflow-hidden"
                        >
                          <table
                            class="table table-sm sm:table-md table-pin-cols table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto"
                          >
                            <thead>
                              <tr
                                class="bg-[#09090B] border-b border-[#27272A]"
                              >
                                <th
                                  class="bg-[#09090B] text-start bg-[#09090B] text-white text-sm font-medium sm:font-semibold"
                                >
                                  Person
                                </th>
                                <td
                                  class="text-start bg-[#09090B] text-white text-sm font-medium sm:font-semibold"
                                >
                                  Company
                                </td>
                                <td
                                  class="text-end bg-[#09090B] text-white text-sm font-medium sm:font-semibold"
                                >
                                  Transaction
                                </td>
                                <td
                                  class="text-end bg-[#09090B] text-white text-sm font-medium sm:font-semibold"
                                >
                                  Disclosure
                                </td>
                                <td
                                  class="text-center bg-[#09090B] text-white text-sm font-medium sm:font-semibold"
                                >
                                  Amount
                                </td>
                                <td
                                  class="text-white text-end text-sm font-medium sm:font-semibold"
                                  >Type</td
                                >
                              </tr>
                            </thead>
                            <tbody>
                              {#each displayList as item, index}
                                <tr
                                  class="odd:bg-[#27272A] border-b-[#09090B] {index +
                                    1 ===
                                    rawData?.length &&
                                  data?.user?.tier !== 'Pro'
                                    ? 'opacity-[0.1]'
                                    : ''}"
                                >
                                  <th
                                    class="{index % 2
                                      ? 'bg-[#09090B]'
                                      : 'bg-[#27272A]'} text-white text-sm sm:text-[1rem] whitespace-nowrap"
                                  >
                                    <div class="flex flex-row items-center">
                                      <div
                                        class="flex-shrink-0 rounded-full border border-slate-700 w-9 h-9 relative {item?.party ===
                                        'Republican'
                                          ? 'bg-[#98272B]'
                                          : item?.party === 'Democratic'
                                            ? 'bg-[#295AC7]'
                                            : 'bg-[#4E2153]'} flex items-center justify-center"
                                      >
                                        <img
                                          style="clip-path: circle(50%);"
                                          class="rounded-full w-7"
                                          src={`${cloudFrontUrl}/assets/senator/${item?.representative?.replace(/\s+/g, "_")}.png`}
                                          loading="lazy"
                                        />
                                      </div>
                                      <div
                                        class="flex flex-col ml-3 font-normal"
                                      >
                                        <a
                                          href={`/politicians/${item?.id}`}
                                          class="sm:hover:text-white text-blue-400"
                                          >{getAbbreviatedName(
                                            item?.representative?.replace(
                                              "_",
                                              " ",
                                            ),
                                          )}</a
                                        >
                                        <span class="text-gray-300"
                                          >{item?.party}</span
                                        >
                                      </div>
                                    </div>
                                    <!--{item?.firstName} {item?.lastName}-->
                                  </th>

                                  <td
                                    class="text-start whitespace-nowrap text-sm sm:text-[1rem] text-blue-400"
                                  >
                                    <div class="flex flex-col items-start">
                                      <a
                                        href={item?.assetType === "stock"
                                          ? `/stocks/${item?.ticker}`
                                          : item?.assetType ===
                                              ("etf" || "crypto")
                                            ? `/${item?.assetType}/${item?.ticker}`
                                            : "#"}
                                        class="sm:hover:text-white text-blue-400"
                                        >{item?.ticker?.length !== 0
                                          ? item?.ticker
                                          : "-"}</a
                                      >
                                      <span class="text-white"
                                        >{item?.assetDescription.length >
                                        charNumber
                                          ? formatString(
                                              item?.assetDescription.slice(
                                                0,
                                                charNumber,
                                              ),
                                            ) + "..."
                                          : formatString(item?.assetDescription)
                                              ?.replace("- Common Stock", "")
                                              ?.replace(
                                                "Common Stock",
                                                "",
                                              )}</span
                                      >
                                    </div>
                                  </td>

                                  <td
                                    class="text-end text-sm sm:text-[1rem] text-white whitespace-nowrap"
                                  >
                                    {new Date(
                                      item?.transactionDate,
                                    )?.toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      daySuffix: "2-digit",
                                    })}
                                  </td>

                                  <td
                                    class="text-end text-sm sm:text-[1rem] text-white whitespace-nowrap"
                                  >
                                    {new Date(
                                      item?.disclosureDate,
                                    )?.toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      daySuffix: "2-digit",
                                    })}
                                  </td>

                                  <td
                                    class="text-center text-sm sm:text-[1rem] text-white whitespace-nowrap"
                                  >
                                    {item?.amount?.replace(
                                      "$1,000,001 - $5,000,000",
                                      "$1Mio - $5Mio",
                                    )}
                                  </td>
                                  <td
                                    class="text-sm sm:text-[1rem] text-end text-white"
                                  >
                                    {#if item?.type === "Bought"}
                                      <span class="text-[#37C97D]">Bought</span>
                                    {:else if item?.type === "Sold"}
                                      <span class="text-[#FF2F1F]">Sold</span>
                                    {/if}
                                  </td>
                                </tr>
                              {/each}
                            </tbody>
                          </table>
                        </div>
                        <!--<InfiniteLoading on:infinite={infiniteHandler} />-->

                        <!--<UpgradeToPro data={data} title="Track the latest trades of corrupt US Politicians"/>-->
                      </div>
                    </main>
                  </div>
                </div>
              </section>
            {:else}
              <div class="flex justify-center items-center h-80">
                <div class="relative">
                  <label
                    class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <span
                      class="loading loading-spinner loading-md text-gray-400"
                    ></span>
                  </label>
                </div>
              </div>
            {/if}
          </body>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href={"/pricing"}
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
              href={"/analysts"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Analyst 📊
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Wall Street analyst ratings
              </span>
            </a>
          </div>

          <div
            class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/politicians"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Congress Trading 🇺🇸
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
