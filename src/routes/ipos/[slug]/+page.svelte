<script lang="ts">
  import { formatString, abbreviateNumber } from "$lib/utils";
  import { screenWidth } from "$lib/store";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;

  let rawData = data?.getIPOCalendar;
  let ipoList = rawData?.slice(0, 150);
  let year = data?.getYear;

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && ipoList?.length !== rawData?.length) {
      const nextIndex = ipoList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      ipoList = [...ipoList, ...filteredNewResults];
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: {
    if ($page?.url?.pathname) {
      rawData = data?.getIPOCalendar;
      ipoList = rawData?.slice(0, 150);
      year = data?.getYear;
    }
  }

  $: charNumber = $screenWidth < 640 ? 20 : 40;
</script>

<section class="w-full overflow-hidden m-auto">
  <div class="flex flex-col justify-center items-center">
    {#if rawData?.length !== 0}
      <h2 class="text-white text-xl font- text-start mt-5 w-full font-semibold">
        {rawData?.length} IPOs
      </h2>
      <div class="w-full overflow-x-scroll">
        <table
          class="mt-5 table table-sm table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto overflow-hidden"
        >
          <thead class="bg-default">
            <tr>
              <th class="text-white font-semibold text-sm text-start"
                >IPO Date</th
              >
              <th class="text-white font-semibold text-sm text-start">Symbol</th
              >
              <th class="text-white font-semibold text-sm">Name</th>
              <th class="text-white font-semibold text-end text-sm"
                >IPO Price</th
              >
              <th class="text-white font-semibold text-end text-sm"
                >Current Price</th
              >
              <th class="text-white font-semibold text-end text-sm"
                >Return Since</th
              >
            </tr>
          </thead>
          <tbody>
            {#each ipoList as item}
              <tr
                class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b-[#09090B]"
              >
                <td
                  class="text-white text-sm sm:text-[1rem] whitespace-nowrap text-start border-b-[#09090B] whitespace-nowrap"
                >
                  {new Date(item?.date)?.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    daySuffix: "2-digit",
                  })}
                </td>

                <td
                  class="text-sm sm:text-[1rem] whitespace-nowrap text-start border-b-[#09090B] whitespace-nowrap"
                >
                  <a
                    href={"/stocks/" + item?.symbol}
                    class="sm:hover:text-white text-blue-400"
                  >
                    {item?.symbol}
                  </a>
                </td>

                <td
                  class="text-gray-200 border-b-[#09090B] whitespace-nowrap text-sm sm:text-[1rem]"
                >
                  <span class="text-white"
                    >{item?.name?.length > charNumber
                      ? formatString(item?.name?.slice(0, charNumber)) + "..."
                      : formatString(item?.name)}</span
                  >
                </td>

                <td
                  class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B] text-end"
                >
                  {item?.ipoPrice !== null ? item?.ipoPrice : "-"}
                </td>

                <td
                  class="text-white border-b-[#09090B] text-sm sm:text-[1rem] text-end"
                >
                  {item?.currentPrice !== null ? item?.currentPrice : "-"}
                </td>

                <td
                  class="text-white border-b-[#09090B] text-end flex flex-row items-center justify-end"
                >
                  {#if item?.return >= 0 && item?.return !== null}
                    <span
                      class="inline-block text-[#00FC50] text-sm sm:text-[1rem] whitespace-nowrap"
                      >+{abbreviateNumber(item?.return)}%</span
                    >
                  {:else if item?.return < 0 && item?.return !== null}
                    <span
                      class="inline-block text-[#FF2F1F] text-sm sm:text-[1rem] whitespace-nowrap"
                      >{abbreviateNumber(item?.return)}%
                    </span>
                  {:else}
                    <span
                      class="inline-block text-white text-sm sm:text-[1rem] whitespace-nowrap"
                    >
                      -
                    </span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <Infobox
        text={`No IPOs found. Please adjust your search timeframe for the latest ${year}
          IPOs.`}
      />
    {/if}
  </div>
</section>
