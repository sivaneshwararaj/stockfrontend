<script lang="ts">
  import { stockTicker } from "$lib/store";

  export let data;
  let similarStocks;

  $: {
    if ($stockTicker) {
      similarStocks = data?.getSimilarStocks?.sort(
        (a, b) => b?.dividendYield - a?.dividendYield,
      );
    }
  }
</script>

<section class="w-auto overflow-hidden min-h-screen">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-10">
          <slot />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 mt-3">
          {#if similarStocks?.length > 0}
            <div
              class="w-full p-2 text-white border border-gray-600 bg-inherit rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <h3 class="p-2 pt-4 text-xl font-semibold">Related Stocks</h3>
              <table class="table table-sm table-compact w-full text-white">
                <thead class="text-white"
                  ><tr
                    ><th
                      class="whitespace-nowrap border-b border-gray-600 font-semibold text-[1rem] text-left"
                      >Company</th
                    >
                    <th
                      class="whitespace-nowrap border-b border-gray-600 font-semibold text-[1rem] text-right"
                      >Dividend Yield</th
                    ></tr
                  ></thead
                >
                <tbody>
                  {#each similarStocks?.slice(0, 8) as item}
                    <tr class="border-gray-800 border-b text-[1rem]"
                      ><td class="text-left text-[1rem]"
                        ><a
                          href={`/stocks/${item?.symbol}/dividends`}
                          class="sm:hover:text-white text-blue-400"
                          >{item?.name?.length > 30
                            ? item?.name?.slice(0, 30) + "..."
                            : item?.name}</a
                        ></td
                      >
                      <td class="text-right cursor-normal text-[1rem]"
                        >{item?.dividendYield !== null &&
                        item?.dividendYield !== undefined
                          ? item?.dividendYield + "%"
                          : "n/a"}</td
                      >
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </aside>
      </div>
    </div>
  </div>
</section>
