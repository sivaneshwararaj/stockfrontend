<script lang="ts">
  import { formatString, abbreviateNumber } from "$lib/utils";
  import { screenWidth } from "$lib/store";
  import { onMount } from "svelte";

  export let data;

  let rawData = data?.getIPOCalendar;
  let ipoList = rawData?.slice(0, 150);

  let isLoaded = false;

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

  let charNumber = 40;
  $: {
    if ($screenWidth < 640) {
      charNumber = 20;
    } else {
      charNumber = 40;
    }
  }
</script>

<section class="w-full overflow-hidden m-auto">
    

      <div class="w-full overflow-x-scroll">
        <table
          class="mt-5 table table-sm table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto overflow-hidden"
        >
          <thead>
            <tr>
              <th class="text-white font-medium text-[1rem] text-start"
                >IPO Date</th
              >
              <th class="text-white font-medium text-[1rem] text-start"
                >Symbol</th
              >
              <th class="text-white font-medium text-[1rem]">Name</th>
              <th class="text-white font-medium text-end text-[1rem]"
                >IPO Price</th
              >
              <th class="text-white font-medium text-end text-[1rem]"
                >Current Price</th
              >
              <th class="text-white font-medium text-end text-[1rem]"
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
                  class="text-white text-sm sm:text-[1rem] text-start border-b-[#09090B] whitespace-nowrap"
                >
                  {new Date(item?.date)?.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    daySuffix: "2-digit",
                  })}
                </td>

                <td
                  class="whitespace-nowrap text-sm sm:text-[1rem] text-start border-b-[#09090B]"
                >
                  <a
                    href={"/stocks/" + item?.symbol}
                    class="sm:hover:text-white text-blue-400"
                  >
                    {item?.symbol}
                  </a>
                </td>

                <td
                  class="text-white whitespace-nowrap text-sm sm:text-[1rem] border-b-[#09090B]"
                >
                  {item?.name?.length > charNumber
                    ? formatString(item?.name?.slice(0, charNumber)) + "..."
                    : formatString(item?.name)}
                </td>

                <td
                  class="text-white border-b-[#09090B] text-end text-sm sm:text-[1rem] whitespace-nowrap"
                >
                  {item?.ipoPrice !== null ? item?.ipoPrice : "-"}
                </td>

                <td
                  class="text-white border-b-[#09090B] text-end text-sm sm:text-[1rem] whitespace-nowrap"
                >
                  {item?.currentPrice !== null ? "$" + item?.currentPrice : "-"}
                </td>

                <td
                  class="text-white border-b-[#09090B] text-end text-sm sm:text-[1rem] whitespace-nowrap flex flex-row items-center justify-end"
                >
                  {#if item?.return >= 0 && item?.return !== null}
                    <span class="inline-block text-[#00FC50] text-md"
                      >{abbreviateNumber(item?.return)}%</span
                    >
                  {:else if item?.return < 0 && item?.return !== null}
                    <span class="inline-block text-[#FF2F1F] text-md"
                      >{abbreviateNumber(item?.return)}%
                    </span>
                  {:else}
                    <span class="inline-block text-white text-md"> - </span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

</section>
