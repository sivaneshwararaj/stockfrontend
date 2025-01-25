<script lang="ts">
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = data?.getFDACalendar ?? [];

  const groupNewsByStartDate = (rawData) => {
    return (
      Object.entries(
        rawData.reduce((acc, item) => {
          const dateKey = new Intl.DateTimeFormat("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(item?.date)); // Use start_date for grouping

          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(item);
          return acc;
        }, {}),
      )
        // Sort the grouped dates in descending order
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
        .map(([date, items]) => {
          // Sort items within each group by latest time (if needed)
          items.sort((a, b) => new Date(a?.date) - new Date(b?.date));

          // Get unique tickers in the group
          const tickers = [...new Set(items.map((item) => item.ticker))];

          return { date, items, tickers };
        })
    );
  };

  let groupData = groupNewsByStartDate(rawData);
</script>

<SEO
  title="FDA Calendar"
  description="FDA Approval to track success rates of Biotech companies in the stock market."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3 text-white"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">FDA Calendar</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              FDA Calendar
            </h1>
          </div>

          <Infobox
            text=" We update our data in realtime to provide you with the latest FDA Approvals
            and Trials for new Drugs and Studies from US Stock Companies."
          />

          {#if groupData?.length > 0}
            {#each groupData as { date, items }}
              <h3 class="mb-1.5 mt-6 font-semibold text-white">
                {date}
              </h3>
              <div class="border border-gray-700">
                {#each items as item, index}
                  <div
                    class="flex border-gray-600 {index + 1 === items?.length &&
                    data?.user?.tier !== 'Pro'
                      ? 'opacity-[0.2]'
                      : ''}"
                  >
                    <div
                      class="hidden min-w-[80px] max-w-[80px] text-[1rem] text-center items-center justify-center bg-primary p-1 lg:flex"
                    >
                      <a
                        href={`/stocks/${item?.ticker}`}
                        class="text-blue-400 sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                      >
                        <HoverStockChart symbol={item?.ticker} />
                      </a>
                    </div>
                    <div
                      class="flex-grow px-3 py-2 lg:py-3 border-t border-gray-700"
                    >
                      <div class="text-white mb-2">
                        <h4 class="font-semibold">
                          Drug: <span class="font-normal">{item?.drug}</span>
                        </h4>
                      </div>
                      <div class="text-white mb-2">
                        <h4 class="font-semibold">
                          Description: <span class="font-normal"
                            >{item?.description}</span
                          >
                        </h4>
                      </div>
                      <div class="text-white mb-2">
                        <h4 class="font-semibold">
                          Indication: <span class="font-normal"
                            >{item.indication}</span
                          >
                        </h4>
                      </div>
                      <div class="text-white">
                        <h4 class="font-semibold">
                          Status: <span class="font-normal">{item?.status}</span
                          >
                        </h4>
                      </div>
                      <div class="flex flex-wrap gap-x-2 pt-2 lg:pt-0.5">
                        <div class="text-white lg:hidden">
                          <h4 class="font-semibold">
                            Company: <a
                              href={`/stocks/${item?.ticker}`}
                              class="font-normal text-blue-400 sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                            >
                              <HoverStockChart symbol={item?.ticker} />
                            </a>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/each}
          {/if}
          <UpgradeToPro {data} />
        </main>
      </div>
    </div>
  </div>
</section>
