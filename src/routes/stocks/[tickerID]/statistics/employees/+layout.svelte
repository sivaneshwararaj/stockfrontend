<script lang="ts">
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  export let data;

  const similarStocks = data?.getSimilarStocks?.sort(
    (a, b) => b?.employees - a?.employees,
  );
</script>

<section class="w-full overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4">
          <slot />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-primary sm:hover:bg-secondary transition ease-out duration-100"
            >
              <a
                href="/pricing"
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Pro Subscription
                  </h2>
                  <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Upgrade now for unlimited access to all data and tools.
                </span>
              </a>
            </div>
          {/if}
          {#if similarStocks?.length > 0}
            <div
              class="w-full p-2 bg-primary text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <h3 class="p-2 pt-4 text-2xl font-semibold">Related Stocks</h3>
              <table class="table table-sm table-compact w-full text-white">
                <thead class="text-white"
                  ><tr
                    ><th
                      class="whitespace-nowrap border-b font-semibold text-[1rem] text-left"
                      >Company</th
                    >
                    <th
                      class="whitespace-nowrap border-b font-semibold text-[1rem] text-right"
                      >Employees</th
                    ></tr
                  ></thead
                >
                <tbody>
                  {#each similarStocks?.slice(0, 8) as item, index}
                    <tr
                      class="border-gray-600 {index !==
                      similarStocks?.slice(0, 8).length - 1
                        ? 'border-b'
                        : ''}"
                      ><td class="text-left"
                        ><a
                          href={`/stocks/${item?.symbol}`}
                          class="text-[1rem] sm:hover:text-white text-blue-400"
                          >{item?.symbol}</a
                        ></td
                      >
                      <td class="text-right text-[1rem] cursor-normal"
                        >{item?.employees !== null &&
                        item?.employees !== undefined
                          ? parseFloat(item?.employees).toLocaleString(
                              "en-US",
                              {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 0,
                              },
                            )
                          : "n/a"}</td
                      >
                    </tr>
                  {/each}
                </tbody>
              </table>
              <a
                href={`/list/most-employees`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-black m-auto sm:hover:bg-gray-300 bg-[#fff] transition duration-100"
              >
                Employee Rankings
              </a>
            </div>
          {/if}
        </aside>
      </div>
    </div>
  </div>
</section>
