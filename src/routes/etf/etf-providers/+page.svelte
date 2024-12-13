<script lang="ts">
  import { abbreviateNumber, formatETFName } from "$lib/utils";
  import { numberOfUnreadNotification } from "$lib/store";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";

  export let data;
  let etfProviderList = data?.getAllETFProviders;

  let columns = [
    { key: "etfProvider", label: "Provider Name", align: "left" },
    { key: "totalAssets", label: "Total Assets", align: "right" },
    { key: "funds", label: "Funds", align: "right" },
    { key: "avgExpenseRatio", label: "Avg. Cost", align: "right" },
    { key: "avgHoldings", label: "Avg. Holdings", align: "right" },
  ];

  let sortOrders = {
    etfProvider: { order: "none", type: "string" },
    totalAssets: { order: "none", type: "number" },
    funds: { order: "none", type: "number" },
    avgExpenseRatio: { order: "none", type: "number" },
    avgHoldings: { order: "none", type: "number" },
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

    let originalData = data?.getAllETFProviders;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      etfProviderList = [...originalData]; // Reset to original data (spread to avoid mutation)
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
    etfProviderList = [...originalData].sort(compareValues);
  };
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Largest
    ETF Providers by Assets Under Management · Stocknear
  </title>

  <meta
    name="description"
    content={`A complete list of all the companies that provide exchange-traded funds (ETFs) that are actively traded on the U.S. stock market.`}
  />
  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`Largest ETF Providers by Assets Under Management · Stocknear`}
  />
  <meta
    property="og:description"
    content={`A complete list of all the companies that provide exchange-traded funds (ETFs) that are actively traded on the U.S. stock market.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`Largest ETF Providers by Assets Under Management · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`A complete list of all the companies that provide exchange-traded funds (ETFs) that are actively traded on the U.S. stock market.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full overflow-hidden m-auto">
  <div
    class="w-full sm:flex sm:flex-row sm:items-center m-auto text-gray-100 border border-gray-800 sm:rounded-md h-auto p-5 mb-4"
  >
    <svg
      class="w-5 h-5 inline-block flex-shrink-0 mr-0.5 sm:mr-2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      ><path
        fill="#fff"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
      /></svg
    >

    Every Exchange-Traded Fund (ETF) is managed by a specific company. Below is
    a list of companies offering actively traded ETFs on the U.S. stock market.
  </div>

  <!-- Page wrapper -->
  <div class="flex justify-center w-full m-auto h-full overflow-hidden">
    <!-- Content area -->
    <div class="w-full overflow-x-scroll">
      <table
        class="table rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4"
      >
        <thead>
          <TableHeader {columns} {sortOrders} {sortData} />
        </thead>
        <tbody>
          {#each etfProviderList as item, index}
            <!-- row -->
            <tr
              class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-secondary border-b-[#09090B]"
            >
              <td
                class="text-sm sm:text-[1rem] whitespace-nowrap font-medium border-b-[#09090B]"
              >
                <a
                  href={"/etf/etf-providers/" + item?.etfProvider}
                  class="sm:hover:underline sm:hover:underline-offset-4 text-white"
                >
                  {formatETFName(item?.etfProvider)}
                </a>
              </td>

              <td
                class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B] text-end"
              >
                {abbreviateNumber(item?.totalAssets)}
              </td>

              <td
                class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
              >
                {item?.funds}
              </td>

              <td
                class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
              >
                {item?.avgExpenseRatio}%
              </td>

              <td
                class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
              >
                {item?.avgHoldings}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>
