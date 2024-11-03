<script lang="ts">
  import {
    format,
    startOfWeek,
    addDays,
    addWeeks,
    subWeeks,
    differenceInWeeks,
  } from "date-fns";
  import { screenWidth, numberOfUnreadNotification } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  export let data;
  let currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  let dividendCalendar = data?.getDividendCalendar;
  const maxWeeksChange = 4; // Maximum allowed week change
  let previousMax = false;
  let nextMax = false;
  const today = new Date();

  let formattedMonday = startOfWeek(currentWeek, { weekStartsOn: 1 });
  let formattedTuesday = format(addDays(formattedMonday, 1), "EEE, MMM d");
  let formattedWednesday = format(addDays(formattedMonday, 2), "EEE, MMM d");
  let formattedThursday = format(addDays(formattedMonday, 3), "EEE, MMM d");
  let formattedFriday = format(addDays(formattedMonday, 4), "EEE, MMM d");
  formattedMonday = format(formattedMonday, "EEE, MMM d");

  let formattedWeekday = [
    formattedMonday,
    formattedTuesday,
    formattedWednesday,
    formattedThursday,
    formattedFriday,
  ];
  let weekday = [];

  let startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
  let endDate = addDays(startDate, 4);
  let formattedStartDate = format(startDate, "yyyy-MM-dd");
  let formattedEndDate = format(endDate, "yyyy-MM-dd");
  let daysOfWeek = [
    {
      name: "Monday",
      date: formattedStartDate,
    },
    {
      name: "Tuesday",
      date: format(addDays(startDate, 1), "yyyy-MM-dd"),
    },
    {
      name: "Wednesday",
      date: format(addDays(startDate, 2), "yyyy-MM-dd"),
    },
    {
      name: "Thursday",
      date: format(addDays(startDate, 3), "yyyy-MM-dd"),
    },
    {
      name: "Friday",
      date: formattedEndDate,
    },
  ];

  let currentDate = new Date();
  let currentWeekday = Math.min((currentDate.getDay() + 6) % 7, 4);
  let selectedWeekday = currentWeekday;

  function toggleDate(index) {
    if ($screenWidth > 640) {
      selectedWeekday = index;
    }
  }

  function clickWeekday(state, index) {
    if (state === "next" && selectedWeekday + 1 <= 4) {
      selectedWeekday = selectedWeekday + 1;
    } else if (state === "previous" && selectedWeekday - 1 >= 0) {
      selectedWeekday--;
    } else if (
      state === "previous" &&
      index === 0 &&
      differenceInWeeks(currentWeek, today) > -maxWeeksChange
    ) {
      changeWeek(state);
      selectedWeekday = 4;
    } else if (
      state === "next" &&
      index === 4 &&
      differenceInWeeks(currentWeek, today) < maxWeeksChange
    ) {
      changeWeek(state);
      selectedWeekday = 0;
    }
  }

  async function changeWeek(state) {
    //Limit the user to go back max 4 weeks and look forward 4 weeks
    if (
      state === "previous" &&
      differenceInWeeks(currentWeek, today) > -maxWeeksChange
    ) {
      currentWeek = subWeeks(currentWeek, 1);
    } else if (
      state === "next" &&
      differenceInWeeks(currentWeek, today) < maxWeeksChange
    ) {
      currentWeek = addWeeks(currentWeek, 1);
    }

    formattedMonday = startOfWeek(currentWeek, { weekStartsOn: 1 });
    formattedTuesday = format(addDays(formattedMonday, 1), "EEE, MMM d");
    formattedWednesday = format(addDays(formattedMonday, 2), "EEE, MMM d");
    formattedThursday = format(addDays(formattedMonday, 3), "EEE, MMM d");
    formattedFriday = format(addDays(formattedMonday, 4), "EEE, MMM d");
    formattedMonday = format(formattedMonday, "EEE, MMM d");

    formattedWeekday = [
      formattedMonday,
      formattedTuesday,
      formattedWednesday,
      formattedThursday,
      formattedFriday,
    ];
    weekday = [];

    startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
    endDate = addDays(startDate, 4);
    formattedStartDate = format(startDate, "yyyy-MM-dd");
    formattedEndDate = format(endDate, "yyyy-MM-dd");
    daysOfWeek = [
      {
        name: "Monday",
        date: formattedStartDate,
      },
      {
        name: "Tuesday",
        date: format(addDays(startDate, 1), "yyyy-MM-dd"),
      },
      {
        name: "Wednesday",
        date: format(addDays(startDate, 2), "yyyy-MM-dd"),
      },
      {
        name: "Thursday",
        date: format(addDays(startDate, 3), "yyyy-MM-dd"),
      },
      {
        name: "Friday",
        date: formattedEndDate,
      },
    ];

    dividendCalendar = daysOfWeek.map((day) => {
      return {
        name: day.name,
        data: data?.getDividendCalendar?.filter(
          (item) => item.date === day.date,
        ),
      };
    });

    if (dividendCalendar?.length) {
      // Loop through each day of the week
      for (let i = 0; i < dividendCalendar.length; i++) {
        const dayData = dividendCalendar[i].data;

        // Filter out entries with company name "---"

        // Sort and map the filtered data
        weekday[i] = dayData.sort((a, b) => b.marketCap - a.marketCap);
      }
    }
  }

  $: {
    if (dividendCalendar) {
      dividendCalendar = daysOfWeek.map((day) => {
        return {
          name: day.name,
          data: data?.getDividendCalendar?.filter(
            (item) => item.date === day.date,
          ),
        };
      });

      if (dividendCalendar?.length) {
        // Loop through each day of the week
        for (let i = 0; i < dividendCalendar.length; i++) {
          const dayData = dividendCalendar[i].data;

          // Filter out entries with company name "---"

          // Sort and map the filtered data
          weekday[i] = dayData.sort((a, b) => b.marketCap - a.marketCap);
        }
      }
    }
  }

  $: {
    if (currentWeek) {
      if (differenceInWeeks(currentWeek, today) > -maxWeeksChange) {
        previousMax = false;
      } else {
        previousMax = true;
      }
    }
  }

  $: {
    if (currentWeek) {
      if (differenceInWeeks(currentWeek, today) < maxWeeksChange) {
        nextMax = false;
      } else {
        nextMax = true;
      }
    }
  }
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Dividends
    Calendar · stocknear
  </title>
  <meta
    name="description"
    content={`A list of upcoming dividends on the US stock market, with dates, times and estimated revenue and dividends growth.`}
  />

  <!-- Other meta tags -->
  <meta property="og:title" content={`Dividends Calendar · stocknear`} />
  <meta
    property="og:description"
    content={`A list of upcoming dividends on the US stock market, with dates, times and estimated revenue and dividends growth.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`Dividends Calendar · stocknear`} />
  <meta
    name="twitter:description"
    content={`A list of upcoming dividends on the US stock market, with dates, times and estimated revenue and dividends growth.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 px-4 lg:px-3 mb-20"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Dividends Calendar</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Dividends Calendar
            </h1>
          </div>

          <!-- Page wrapper -->
          <div class="flex justify-center w-full m-auto h-full overflow-hidden">
            <!-- Content area -->
            <div class="w-full overflow-x-scroll">
              <!-- Cards -->
              <div
                class=" w-full flex flex-row justify-center m-auto items-center"
              >
                <!-- Start Columns -->
                <label
                  on:click={() => changeWeek("previous")}
                  class="{previousMax
                    ? 'opacity-80'
                    : ''} hidden sm:flex h-16 w-48 cursor-pointer border m-auto flex bg-[#27272A] border border-gray-600 mb-3"
                >
                  <svg
                    class="w-6 h-6 m-auto rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    ><path
                      fill="white"
                      d="M8.025 22L6.25 20.225L14.475 12L6.25 3.775L8.025 2l10 10l-10 10Z"
                    /></svg
                  >
                </label>
                {#each weekday as day, index}
                  <div
                    class="w-full text-white {index === selectedWeekday
                      ? ''
                      : 'hidden sm:block'}"
                  >
                    <label
                      on:click={() => toggleDate(index)}
                      class=" m-auto w-full cursor-pointer h-16 {index ===
                      selectedWeekday
                        ? 'bg-[#FBCE3C] text-black font-semibold'
                        : ''} rounded-md sm:rounded-none flex bg-[#09090B] border border-gray-600 mb-3"
                    >
                      <div
                        class=" flex flex-row justify-center items-center w-full"
                      >
                        <label
                          on:click={() => clickWeekday("previous", index)}
                          class="{previousMax === true && index === 0
                            ? 'opacity-20'
                            : ''} sm:hidden ml-auto"
                        >
                          <svg
                            class="w-8 h-8 inline-block rotate-180"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            ><path
                              fill="black"
                              d="M8.025 22L6.25 20.225L14.475 12L6.25 3.775L8.025 2l10 10l-10 10Z"
                            /></svg
                          >
                        </label>
                        <div
                          class="flex flex-col items-center truncate m-auto p-1"
                        >
                          <span class="text-[1rem]"
                            >{formattedWeekday[index]}</span
                          >
                          <span class="text-[1rem] sm:text-sm m-auto pt-1 pb-1">
                            {day?.length} Dividends</span
                          >
                        </div>
                        <label
                          on:click={() => clickWeekday("next", index)}
                          class="{nextMax === true && index === 4
                            ? 'opacity-20'
                            : ''} sm:hidden mr-auto"
                        >
                          <svg
                            class="w-8 h-8 inline-block"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            ><path
                              fill="black"
                              d="M8.025 22L6.25 20.225L14.475 12L6.25 3.775L8.025 2l10 10l-10 10Z"
                            /></svg
                          >
                        </label>
                      </div>
                    </label>
                  </div>
                {/each}
                <label
                  on:click={() => changeWeek("next")}
                  class="{nextMax
                    ? 'opacity-80'
                    : ''} hidden sm:flex h-16 w-48 cursor-pointer border m-auto flex bg-[#27272A] border border-gray-600 mb-3"
                >
                  <svg
                    class="w-6 h-6 m-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    ><path
                      fill="white"
                      d="M8.025 22L6.25 20.225L14.475 12L6.25 3.775L8.025 2l10 10l-10 10Z"
                    /></svg
                  >
                </label>
              </div>

              {#each weekday as day, index}
                {#if index === selectedWeekday}
                  {#if day?.length !== 0}
                    <h2 class="font-semibold text-white text-xl mt-5">
                      {formattedWeekday[index]?.split(", ")[1]} · {day?.length} Dividends
                    </h2>

                    <div class="w-full overflow-x-scroll no-scrollbar">
                      <table
                        class="table table-sm table-compact rounded-none sm:rounded-md w-full border-[#09090B] m-auto mt-4"
                      >
                        <thead>
                          <tr
                            class="whitespace-nowrap border-b border-[#27272A]"
                          >
                            <th class="text-white font-semibold text-sm"
                              >Symbol</th
                            >
                            <th class="text-white font-semibold text-sm"
                              >Company Name</th
                            >
                            <th
                              class="text-white font-semibold text-sm text-end"
                              >Market Cap</th
                            >
                            <th
                              class="text-white font-semibold text-sm text-end"
                              >Revenue</th
                            >

                            <th
                              class="text-white font-semibold text-sm text-end"
                              >Cash Amount</th
                            >
                            <th
                              class="text-white font-semibold text-sm text-end"
                              >Payment Date</th
                            >
                          </tr>
                        </thead>
                        <tbody>
                          {#each day as item}
                            <!-- row -->
                            <tr
                              class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B]"
                            >
                              <td
                                class="border-b-[#09090B] text-sm sm:text-[1rem]"
                              >
                                <a
                                  href={"/stocks/" + item?.symbol}
                                  class="text-blue-400 sm:hover:text-white"
                                  >{item?.symbol}
                                </a>
                              </td>

                              <td
                                class="text-white border-b-[#09090B] whitespace-nowrap text-sm sm:text-[1rem]"
                              >
                                {item?.name.length > 20
                                  ? item?.name.slice(0, 20) + "..."
                                  : item?.name}
                              </td>

                              <td
                                class="text-white border-b-[#09090B] text-sm text-end sm:text-[1rem]"
                              >
                                {item?.marketCap !== null
                                  ? abbreviateNumber(item?.marketCap)
                                  : "-"}
                              </td>

                              <td
                                class="text-white border-b-[#09090B] text-sm sm:text-[1rem] text-end"
                              >
                                {item?.revenue !== null
                                  ? abbreviateNumber(item?.revenue)
                                  : "-"}
                              </td>

                              <td
                                class="text-white border-b-[#09090B] text-center text-sm sm:text-[1rem] text-end"
                              >
                                {item?.adjDividend !== null
                                  ? item?.adjDividend?.toFixed(3)
                                  : "-"}
                              </td>

                              <td
                                class="text-white text-end border-b-[#09090B] text-sm sm:text-[1rem]"
                              >
                                {item?.paymentDate !== null
                                  ? new Date(item?.paymentDate)?.toLocaleString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        daySuffix: "2-digit",
                                      },
                                    )
                                  : "-"}
                              </td>
                            </tr>
                          {/each}
                        </tbody>
                      </table>
                    </div>
                  {:else}
                    <div
                      class="text-white p-5 mt-5 w-fit m-auto rounded-lg sm:flex sm:flex-row sm:items-center border border-slate-800 text-[1rem]"
                    >
                      <svg
                        class="w-6 h-6 flex-shrink-0 inline-block sm:mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                        ><path
                          fill="#FBCE3C"
                          d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
                        /></svg
                      >
                      No Dividends available for the day.
                    </div>
                  {/if}
                {/if}
              {/each}
            </div>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href={"/pricing"}
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

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/earnings-calendar"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Earnings Calendar
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest Earnings of companies
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/economic-calendar"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Economic Events
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Stay updated on upcoming Economic Events worldwide.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
