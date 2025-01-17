<script lang="ts">
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
        <main class="w-full lg:w-3/4 lg:pr-10">
          <slot />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 mt-3">
          {#if similarStocks?.length > 0}
            <div
              class="w-full p-2 bg-inherit text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <h3 class="p-2 pt-4 text-2xl font-semibold">Related Stocks</h3>
              <table class="table table-sm table-compact w-full text-white">
                <thead class="text-white"
                  ><tr
                    ><th
                      class="whitespace-nowrap border-b border-gray-600 font-semibold text-[1rem] text-left"
                      >Company</th
                    >
                    <th
                      class="whitespace-nowrap border-b border-gray-600 font-semibold text-[1rem] text-right"
                      >Employees</th
                    ></tr
                  ></thead
                >
                <tbody>
                  {#each similarStocks?.slice(0, 8) as item, index}
                    <tr
                      class="border-gray-800 {index !==
                      similarStocks?.slice(0, 8).length - 1
                        ? 'border-b'
                        : ''}"
                      ><td class="text-left"
                        ><a
                          href={`/stocks/${item?.symbol}/statistics/employees`}
                          class="text-[1rem] sm:hover:text-white text-blue-400"
                          >{item?.name?.length > 30
                            ? item?.name?.slice(0, 30) + "..."
                            : item?.name}</a
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
