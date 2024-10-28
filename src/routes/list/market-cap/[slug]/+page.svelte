<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";

  export let data;

  let rawData = [];
  let marketCapList = [];

  const BILLION = 1_000_000_000;
  const MILLION = 1_000_000;

  const marketCapNavigation = [
    {
      threshold: 200 * BILLION,
      name: "Mega Cap",
      link: "/list/market-cap/mega-cap-stocks",
    },
    {
      minThreshold: 10 * BILLION,
      maxThreshold: 200 * BILLION,
      name: "Large Cap",
      link: "/list/market-cap/large-cap-stocks",
    },
    {
      minThreshold: 2 * BILLION,
      maxThreshold: 10 * BILLION,
      name: "Mid Cap",
      link: "/list/market-cap/mid-cap-stocks",
    },
    {
      minThreshold: 300 * MILLION,
      maxThreshold: 2 * BILLION,
      name: "Small Cap",
      link: "/list/market-cap/small-cap-stocks",
    },
    {
      minThreshold: 50 * MILLION,
      maxThreshold: 300 * MILLION,
      name: "Micro Cap",
      link: "/list/market-cap/micro-cap-stocks",
    },
    {
      maxThreshold: 50 * MILLION,
      name: "Nano Cap",
      link: "/list/market-cap/nano-cap-stocks",
    },
  ];

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && marketCapList?.length !== rawData?.length) {
      const nextIndex = marketCapList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      marketCapList = [...marketCapList, ...filteredNewResults];
    }
  }

  onMount(async () => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  let columns = [
    { key: "rank", label: "Rank", align: "left" },
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "marketCap", label: "Market Cap", align: "right" },

    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "price", label: "Price", align: "right" },
    { key: "revenue", label: "Revenue", align: "right" },
  ];

  let sortOrders = {
    rank: { order: "none", type: "number" },
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    changesPercentage: { order: "none", type: "number" },
    price: { order: "none", type: "number" },
    marketCap: { order: "none", type: "number" },
    revenue: { order: "none", type: "number" },
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

    let originalData = data?.getMarketCapCategory;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      marketCapList = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
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
    marketCapList = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  let totalMarketCap = 0;
  let totalRevenue = 0;

  $: {
    if ($page?.url?.pathname && typeof window !== "undefined") {
      rawData = data?.getMarketCapCategory;
      marketCapList = rawData?.slice(0, 50);

      totalMarketCap = rawData?.reduce(
        (total, stock) => total + stock?.marketCap,
        0,
      );
      totalRevenue = rawData?.reduce(
        (total, stock) => total + stock?.revenue,
        0,
      );
    }
  }

  $: charNumber = $screenWidth < 640 ? 15 : 20;

  // Get current category from URL params
  $: currentCategory = data?.getParams?.replace("-stocks", "");
  // Filter out current category
  $: otherCategories = marketCapNavigation.filter(
    (cat) => !cat.link.includes(currentCategory),
  );

  // Format number to billions/millions
  function formatThreshold(value) {
    const billion = 1_000_000_000;
    const million = 1_000_000;

    if (value >= billion) {
      return `$${(value / billion).toFixed(0)} billion`;
    }
    return `$${(value / million).toFixed(0)} million`;
  }

  // Get description for current category
  $: currentCategoryData = marketCapNavigation.find((cat) =>
    cat.link.includes(currentCategory),
  );

  // Generate description based on thresholds
  $: description = currentCategoryData
    ? (() => {
        if (currentCategoryData.threshold) {
          return `above ${formatThreshold(currentCategoryData.threshold)}`;
        } else if (
          currentCategoryData.minThreshold &&
          currentCategoryData.maxThreshold
        ) {
          return `between ${formatThreshold(currentCategoryData.minThreshold)} and ${formatThreshold(currentCategoryData.maxThreshold)}`;
        } else if (currentCategoryData.maxThreshold) {
          return `below ${formatThreshold(currentCategoryData.maxThreshold)}`;
        }
        return "";
      })()
    : "";
</script>

<section class="w-full overflow-hidden m-auto">
  <div
    class="w-full m-auto text-white border border-gray-600 rounded-md h-auto p-5 mb-4"
  >
    {currentCategoryData?.name} stocks have market capitalizations ranging {description}
    USD, while additional categories include
    {#each otherCategories as category, i}
      {#if i === otherCategories.length - 1}
        and
        <a href={category.link} class="text-blue-400 sm:hover:text-white">
          {category.name}
        </a>.
      {:else if i === otherCategories.length - 2}
        <a href={category.link} class="text-blue-400 sm:hover:text-white">
          {category.name}
        </a>
      {:else}
        <a href={category.link} class="text-blue-400 sm:hover:text-white">
          {category.name}
        </a>,
      {/if}
    {/each}
  </div>

  <div
    class="mb-4 flex flex-col divide-y divide-gray-600 rounded-md border border-gray-600 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0"
  >
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-normal text-white">Total Stocks</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white tiny:text-lg xs:text-xl sm:text-2xl"
        >
          {new Intl.NumberFormat("en")?.format(rawData?.length)}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-normal text-white">Total Market Cap</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white tiny:text-lg xs:text-xl sm:text-2xl"
        >
          {abbreviateNumber(totalMarketCap)}
        </div>
      </div>
    </div>
    <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
      <div class="flex items-center justify-between sm:block">
        <div class="text-sm font-normal text-white">Total Revenue</div>
        <div
          class="mt-1 break-words font-semibold leading-8 text-white tiny:text-lg xs:text-xl sm:text-2xl"
        >
          {abbreviateNumber(totalRevenue)}
        </div>
      </div>
    </div>
  </div>

  <!-- Page wrapper -->
  <div class="flex justify-center w-full m-auto h-full overflow-hidden">
    <!-- Content area -->
    <div class="w-full overflow-x-scroll">
      <div class="w-full overflow-x-scroll">
        <table
          class="table table-sm table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4"
        >
          <thead>
            <TableHeader {columns} {sortOrders} {sortData} />
          </thead>
          <tbody>
            {#each marketCapList as item, index}
              <!-- row -->
              <tr
                class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B]"
              >
                <td
                  class="text-white text-center font-medium text-sm sm:text-[1rem] border-b-[#09090B]"
                >
                  {item?.rank}
                </td>

                <td
                  class="text-blue-400 font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
                >
                  <a
                    href={"/stocks/" + item?.symbol}
                    class="sm:hover:text-white text-blue-400"
                  >
                    {item?.symbol}
                  </a>
                </td>

                <td
                  class="text-gray-200 border-b-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap"
                >
                  {item?.name?.length > charNumber
                    ? item?.name?.slice(0, charNumber) + "..."
                    : item?.name}
                </td>

                <td
                  class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
                >
                  {abbreviateNumber(item?.marketCap)}
                </td>

                <td
                  class="text-white text-end border-b-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap"
                >
                  {item.price?.toFixed(2)}
                </td>

                <td
                  class="text-white text-end border-b-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap"
                >
                  {#if item?.changesPercentage >= 0}
                    <span class="text-[#00FC50]"
                      >+{item?.changesPercentage?.toFixed(2)}%</span
                    >
                  {:else}
                    <span class="text-[#FF2F1F]"
                      >{item?.changesPercentage?.toFixed(2)}%</span
                    >
                  {/if}
                </td>

                <td
                  class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
                >
                  {item?.revenue !== null
                    ? abbreviateNumber(item?.revenue)
                    : "-"}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>
