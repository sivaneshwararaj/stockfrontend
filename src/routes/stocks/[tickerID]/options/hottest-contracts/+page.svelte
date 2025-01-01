<script lang="ts">
  import { abbreviateNumberWithColor } from "$lib/utils";
  import * as HoverCard from "$lib/components/shadcn/hover-card/index.js";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  export let data;

  let volumeList = data?.getData;
  let openInterestList = volumeList?.sort(
    (a, b) => b?.open_interest - a?.open_interest,
  );

  const currentTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
  )?.getTime();

  function daysLeft(targetDate) {
    const targetTime = new Date(targetDate).getTime();
    const difference = targetTime - currentTime;

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math?.ceil(difference / millisecondsPerDay);

    return daysLeft + "D";
  }
</script>

<section
  class="w-full bg-default overflow-hidden text-white min-h-screen pb-40"
>
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if volumeList?.length > 0}
        <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
          <h2
            class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
          >
            Hottest Contracts (Highest Volume)
          </h2>
          <div class="w-full overflow-x-scroll text-white">
            <table
              class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto mt-4 overflow-x-auto"
            >
              <thead class="bg-default">
                <tr class="">
                  <td class="text-white font-semibold text-sm text-center"
                    >Chain</td
                  >

                  <td class="text-white font-semibold text-sm text-end">Last</td
                  >
                  <td class="text-white font-semibold text-sm text-end"
                    >Low-High</td
                  >
                  <td class="text-white font-semibold text-sm text-end"
                    >Volume</td
                  >
                  <td class="text-white font-semibold text-sm text-end">OI</td>
                  <td class="text-white font-semibold text-sm text-end"
                    >OI Change</td
                  >
                  <td class="text-white font-semibold text-sm text-end"
                    >Bid/Ask Vol</td
                  >
                  <td class="text-white font-semibold text-sm text-end"
                    >Total Prem</td
                  >
                </tr>
              </thead>
              <tbody>
                {#each volumeList as item, index}
                  <tr
                    class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800 {index +
                      1 ===
                      volumeList?.slice(0, 3)?.length &&
                    data?.user?.tier !== 'Pro'
                      ? 'opacity-[0.1]'
                      : ''}"
                  >
                    <td
                      class="text-white text-sm sm:text-[1rem] text-start whitespace-nowrap"
                    >
                      {item?.strike_price}
                      <span
                        class={item?.option_type === "C"
                          ? "text-[#00FC50]"
                          : "text-[#FF2F1F]"}
                      >
                        {item?.option_type === "C" ? "Call" : "Put"}
                      </span>
                      {" " +
                        item?.date_expiration +
                        " " +
                        `(${daysLeft(item?.date_expiration)})`}
                    </td>

                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.last_price}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.low_price}-{item?.high_price}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.volume?.toLocaleString("en-US")}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.open_interest?.toLocaleString("en-US")}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {#if item?.open_interest_change >= 0}
                        <span class="text-[#00FC50]"
                          >+{item?.open_interest_change?.toLocaleString(
                            "en-US",
                          )}</span
                        >
                      {:else}
                        <span class="text-[#FF2F1F]"
                          >{item?.open_interest_change?.toLocaleString(
                            "en-US",
                          )}</span
                        >
                      {/if}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end">
                      <HoverCard.Root>
                        <HoverCard.Trigger
                          class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
                        >
                          <div class="flex items-center justify-end">
                            <!-- Bar Container -->
                            <div
                              class="flex w-full max-w-28 h-5 bg-gray-200 rounded-md overflow-hidden"
                            >
                              <!-- Bearish -->
                              <div
                                class="bg-red-500 h-full"
                                style="width: calc(({item?.bid_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>

                              <!-- Neutral -->
                              <div
                                class="bg-gray-300 h-full"
                                style="width: calc(({item?.mid_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>

                              <!-- Bullish -->
                              <div
                                class="bg-green-500 h-full"
                                style="width: calc(({item?.ask_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>
                            </div>
                          </div>
                        </HoverCard.Trigger>
                        <HoverCard.Content
                          class="w-auto bg-secondary border border-gray-600"
                        >
                          <div class="flex justify-between space-x-4">
                            <div
                              class="space-y-1 flex flex-col items-start text-white"
                            >
                              <div>
                                Bid Vol: {@html abbreviateNumberWithColor(
                                  item?.bid_volume,
                                  false,
                                  true,
                                )}
                              </div>
                              <div>
                                Mid Vol: {@html abbreviateNumberWithColor(
                                  item?.mid_volume,
                                  false,
                                  true,
                                )}
                              </div>
                              <div>
                                Ask Vol: {@html abbreviateNumberWithColor(
                                  item?.ask_volume,
                                  false,
                                  true,
                                )}
                              </div>
                            </div>
                          </div>
                        </HoverCard.Content>
                      </HoverCard.Root>
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {@html abbreviateNumberWithColor(
                        item?.total_premium,
                        false,
                        true,
                      )}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <h2
            class="mt-10 flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
          >
            Highest OI Contracts
          </h2>
          <div class="w-full overflow-x-scroll text-white">
            <table
              class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto mt-4 overflow-x-auto"
            >
              <thead class="bg-default">
                <tr class="">
                  <td class="text-white font-semibold text-sm text-center"
                    >Chain</td
                  >

                  <td class="text-white font-semibold text-sm text-end">Last</td
                  >
                  <td class="text-white font-semibold text-sm text-end"
                    >Low-High</td
                  >
                  <td class="text-white font-semibold text-sm text-end"
                    >Volume</td
                  >
                  <td class="text-white font-semibold text-sm text-end">OI</td>
                  <td class="text-white font-semibold text-sm text-end"
                    >OI Change</td
                  >
                  <td class="text-white font-semibold text-sm text-end"
                    >Bid/Ask Vol</td
                  >
                  <td class="text-white font-semibold text-sm text-end"
                    >Total Prem</td
                  >
                </tr>
              </thead>
              <tbody>
                {#each openInterestList as item, index}
                  <tr
                    class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800 {index +
                      1 ===
                      openInterestList?.slice(0, 3)?.length &&
                    data?.user?.tier !== 'Pro'
                      ? 'opacity-[0.1]'
                      : ''}"
                  >
                    <td
                      class="text-white text-sm sm:text-[1rem] text-start whitespace-nowrap"
                    >
                      {item?.strike_price}
                      <span
                        class={item?.option_type === "C"
                          ? "text-[#00FC50]"
                          : "text-[#FF2F1F]"}
                      >
                        {item?.option_type === "C" ? "Call" : "Put"}
                      </span>
                      {" " +
                        item?.date_expiration +
                        " " +
                        `(${daysLeft(item?.date_expiration)})`}
                    </td>

                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.last_price}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.low_price}-{item?.high_price}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.volume?.toLocaleString("en-US")}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {item?.open_interest?.toLocaleString("en-US")}
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {#if item?.open_interest_change >= 0}
                        <span class="text-[#00FC50]"
                          >+{item?.open_interest_change?.toLocaleString(
                            "en-US",
                          )}</span
                        >
                      {:else}
                        <span class="text-[#FF2F1F]"
                          >{item?.open_interest_change?.toLocaleString(
                            "en-US",
                          )}</span
                        >
                      {/if}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end">
                      <HoverCard.Root>
                        <HoverCard.Trigger
                          class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
                        >
                          <div class="flex items-center justify-end">
                            <!-- Bar Container -->
                            <div
                              class="flex w-full max-w-28 h-5 bg-gray-200 rounded-md overflow-hidden"
                            >
                              <!-- Bearish -->
                              <div
                                class="bg-red-500 h-full"
                                style="width: calc(({item?.bid_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>

                              <!-- Neutral -->
                              <div
                                class="bg-gray-300 h-full"
                                style="width: calc(({item?.mid_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>

                              <!-- Bullish -->
                              <div
                                class="bg-green-500 h-full"
                                style="width: calc(({item?.ask_volume} / ({item?.bid_volume} + {item?.mid_volume} + {item?.ask_volume})) * 100%)"
                              ></div>
                            </div>
                          </div>
                        </HoverCard.Trigger>
                        <HoverCard.Content
                          class="w-auto bg-secondary border border-gray-600"
                        >
                          <div class="flex justify-between space-x-4">
                            <div
                              class="space-y-1 flex flex-col items-start text-white"
                            >
                              <div>
                                Bid Vol: {@html abbreviateNumberWithColor(
                                  item?.bid_volume,
                                  false,
                                  true,
                                )}
                              </div>
                              <div>
                                Mid Vol: {@html abbreviateNumberWithColor(
                                  item?.mid_volume,
                                  false,
                                  true,
                                )}
                              </div>
                              <div>
                                Ask Vol: {@html abbreviateNumberWithColor(
                                  item?.ask_volume,
                                  false,
                                  true,
                                )}
                              </div>
                            </div>
                          </div>
                        </HoverCard.Content>
                      </HoverCard.Root>
                    </td>
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                    >
                      {@html abbreviateNumberWithColor(
                        item?.total_premium,
                        false,
                        true,
                      )}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <UpgradeToPro {data} />
        </div>
      {:else}
        <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
          <h2
            class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
          >
            Hottest Contracts
          </h2>
          <div class="mt-2">
            <Infobox text="No data is available" />
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
