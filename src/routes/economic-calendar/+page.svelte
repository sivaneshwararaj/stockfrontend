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
  import { abbreviateNumber, listOfRelevantCountries } from "$lib/utils";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { onMount } from "svelte";

  export let data;

  let rawData;
  let filterList = [];
  let weekdayFiltered = [];
  let syncWorker: Worker | undefined;

  const maxWeeksChange = 4;
  const today = new Date();
  let currentWeek = startOfWeek(today, { weekStartsOn: 1 });
  let previousMax = false;
  let nextMax = false;
  let searchQuery = "";
  $: testList = [];

  $: economicCalendar = data?.getEconomicCalendar;
  $: daysOfWeek = getDaysOfWeek(currentWeek);
  $: formattedWeekday = daysOfWeek.map((day) => format(day.date, "EEE, MMM d"));
  $: weekday = getWeekdayData(economicCalendar, daysOfWeek);
  $: rawData = weekday;
  $: previousMax = differenceInWeeks(currentWeek, today) <= -maxWeeksChange;
  $: nextMax = differenceInWeeks(currentWeek, today) >= maxWeeksChange;

  let currentDate = new Date();
  let selectedWeekday = Math.min((currentDate.getDay() + 6) % 7, 4);

  function getDaysOfWeek(week) {
    const startDate = startOfWeek(week, { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, i) => ({
      name: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      date: addDays(startDate, i),
    }));
  }

  function getWeekdayData(calendar, days) {
    if (!calendar) return [];
    return days.map((day) => {
      const dayData = calendar.filter(
        (item) => item.date === format(day.date, "yyyy-MM-dd"),
      );
      return dayData.sort(
        (a, b) =>
          new Date(`1970-01-01T${a.time}`) - new Date(`1970-01-01T${b.time}`),
      );
    });
  }

  const handleMessage = (event) => {
    weekdayFiltered = event.data?.finalData?.output ?? [];
  };

  const loadWorker = async () => {
    syncWorker.postMessage({ rawData, filterList });
  };

  function toggleDate(index) {
    if ($screenWidth > 640) {
      selectedWeekday = index;
    }
  }

  function clickWeekday(state, index) {
    if (state === "next" && selectedWeekday < 4) {
      selectedWeekday++;
    } else if (state === "previous" && selectedWeekday > 0) {
      selectedWeekday--;
    } else if (state === "previous" && index === 0 && !previousMax) {
      changeWeek("previous");
      selectedWeekday = 4;
    } else if (state === "next" && index === 4 && !nextMax) {
      changeWeek("next");
      selectedWeekday = 0;
    }
  }

  function changeWeek(state) {
    currentWeek =
      state === "previous"
        ? subWeeks(currentWeek, 1)
        : addWeeks(currentWeek, 1);
  }

  onMount(async () => {
    if (!syncWorker) {
      const SyncWorker = await import("./workers/filterWorker?worker");
      syncWorker = new SyncWorker.default();
      syncWorker.onmessage = handleMessage;
    }
  });

  function handleInput(event) {
    const searchQuery = event.target.value?.toLowerCase() || "";

    setTimeout(() => {
      testList = [];

      if (searchQuery.length > 0) {
        const rawList = listOfRelevantCountries;
        testList =
          rawList?.filter((item) => {
            const index = item?.toLowerCase();
            // Check if country starts with searchQuery
            return index?.startsWith(searchQuery);
          }) || [];
      }
    }, 50);
  }

  $: checkedItems = new Set();

  async function handleChangeValue(value) {
    if (checkedItems.has(value)) {
      checkedItems.delete(value);
    } else {
      checkedItems.add(value);
    }
    const filterSet = new Set(filterList);
    filterSet.has(value) ? filterSet.delete(value) : filterSet.add(value);
    filterList = Array.from(filterSet);

    if (filterList.length !== 0) {
      await loadWorker();
    } else {
      weekday = rawData;
    }
  }

  function handleReset() {
    filterList = [];
    checkedItems = new Set();

    economicCalendar = data?.getEconomicCalendar;
    daysOfWeek = getDaysOfWeek(currentWeek);
    formattedWeekday = daysOfWeek.map((day) => format(day.date, "EEE, MMM d"));
    weekday = getWeekdayData(economicCalendar, daysOfWeek);
    rawData = weekday;
    previousMax = differenceInWeeks(currentWeek, today) <= -maxWeeksChange;
    nextMax = differenceInWeeks(currentWeek, today) >= maxWeeksChange;

    currentWeek = startOfWeek(today, { weekStartsOn: 1 });
    selectedWeekday = Math.min((currentDate.getDay() + 6) % 7, 4);
  }
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Worldwide
    Economic Calendar · stocknear
  </title>
  <meta
    name="description"
    content={`A list of upcoming economic events on the US stock market, with dates, times and estimation.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`Worldwide Economic Calendar · stocknear`}
  />
  <meta
    property="og:description"
    content={`A list of upcoming economic events on the US stock market, with dates, times and estimation.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`Worldwide Economic Calendar · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`A list of upcoming economic events on the US stock market, with dates, times and estimation.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 px-4 lg:px-3 mb-20"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Economic Calendar</li>
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
              Economic Calendar
            </h1>
          </div>

          <!-- Page wrapper -->
          <div class="flex justify-center w-full m-auto h-full overflow-hidden">
            <!-- Content area -->
            <div class="relative flex flex-col flex-1 overflow-hidden">
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
                {#each filterList?.length === 0 ? weekday : weekdayFiltered as day, index}
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
                        : ''} rounded sm:rounded-none flex bg-[#09090B] border border-gray-600 mb-3"
                    >
                      <div
                        class=" flex flex-row justify-center items-center w-full"
                      >
                        <label
                          on:click={() => clickWeekday("previous", index)}
                          class="sm:hidden ml-auto"
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
                          <span class="text-md">{formattedWeekday[index]}</span>
                          <span class="text-[1rem] sm:text-sm m-auto pt-1 pb-1">
                            {day?.length} Events</span
                          >
                        </div>
                        <label
                          on:click={() => clickWeekday("next", index)}
                          class="sm:hidden mr-auto"
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

              <div
                class="flex flex-row items-center w-full sm:w-fit m-auto sm:m-0 pt-6 pb-3"
              >
                <div
                  class="grid grid-cols-2 sm:grid-cols-3 gap-y-3 sm:gap-y-0 gap-x-2.5 lg:grid-cols-3 w-full mt-3"
                >
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                      <Button
                        builders={[builder]}
                        class="border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                      >
                        <span class="truncate text-white">Filter Country</span>
                        <svg
                          class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          style="max-width:40px"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                      class="w-56 h-fit max-h-72 overflow-y-auto scroller"
                    >
                      <div
                        class="relative sticky z-40 focus:outline-none -top-1"
                        tabindex="0"
                        role="menu"
                        style=""
                      >
                        <input
                          bind:value={searchQuery}
                          on:input={handleInput}
                          autocomplete="off"
                          class=" absolute fixed sticky w-full border-0 bg-[#09090B] border-b border-gray-200
          focus:border-gray-200 focus:ring-0 text-white placeholder:text-gray-300"
                          type="search"
                          placeholder="Search..."
                        />
                      </div>
                      <DropdownMenu.Group>
                        {#each testList.length > 0 && searchQuery?.length > 0 ? testList : searchQuery?.length > 0 && testList?.length === 0 ? [] : listOfRelevantCountries as item}
                          <DropdownMenu.Item class="sm:hover:bg-[#27272A]">
                            <div class="flex items-center">
                              <label
                                on:click={() => {
                                  handleChangeValue(item);
                                }}
                                class="cursor-pointer text-white"
                                for={item}
                              >
                                <input
                                  type="checkbox"
                                  checked={checkedItems?.has(item)}
                                />
                                <span class="ml-2">{item}</span>
                              </label>
                            </div>
                          </DropdownMenu.Item>
                        {/each}
                      </DropdownMenu.Group>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>

                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                      <Button
                        builders={[builder]}
                        class="border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                      >
                        <span class="truncate text-white"
                          >Filter Importance</span
                        >
                        <svg
                          class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          style="max-width:40px"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                      class="w-56 h-fit max-h-72 overflow-y-auto scroller"
                    >
                      <div
                        class="relative sticky z-40 focus:outline-none -top-1"
                        tabindex="0"
                        role="menu"
                        style=""
                      ></div>
                      <DropdownMenu.Group>
                        {#each [1, 2, 3] as i}
                          <DropdownMenu.Item class="sm:hover:bg-[#27272A]">
                            <div class="flex items-center">
                              <label
                                on:click={() => {
                                  handleChangeValue(i);
                                }}
                                class="flex flex-row items-center cursor-pointer text-white"
                                for={i}
                              >
                                <input
                                  type="checkbox"
                                  checked={checkedItems?.has(i)}
                                />
                                <div class="ml-2 flex flex-row items-center">
                                  {#if i > 0}
                                    {#each Array(i).fill() as _, index}
                                      <svg
                                        class="w-4 h-4 text-[#FBCE3C]"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 22 20"
                                      >
                                        <path
                                          d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
                                        />
                                      </svg>
                                    {/each}
                                    {#each Array(3 - i).fill() as _}
                                      <svg
                                        class="w-4 h-4 text-gray-300 dark:text-gray-500"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 22 20"
                                      >
                                        <path
                                          d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
                                        />
                                      </svg>
                                    {/each}
                                  {/if}
                                </div>
                              </label>
                            </div>
                          </DropdownMenu.Item>
                        {/each}
                      </DropdownMenu.Group>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>

                  {#if filterList?.length !== 0}
                    <Button
                      on:click={() => handleReset()}
                      class="w-fit border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out  flex flex-row justify-start items-center px-3 py-2 text-white rounded-md truncate"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="inline-block w-4 h-4 mr-2"
                        viewBox="0 0 21 21"
                        ><g
                          fill="none"
                          fill-rule="evenodd"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          ><path d="M3.578 6.487A8 8 0 1 1 2.5 10.5" /><path
                            d="M7.5 6.5h-4v-4"
                          /></g
                        ></svg
                      >
                      Reset All
                    </Button>
                  {/if}
                </div>
              </div>

              <div class="z-0 mb-40">
                {#each filterList?.length === 0 ? weekday : weekdayFiltered as day, index}
                  {#if index === selectedWeekday}
                    {#if day?.length !== 0}
                      <h2 class="font-semibold text-white text-xl mt-5">
                        {formattedWeekday[index]?.split(", ")[1]} · {day?.length}
                        Events
                      </h2>

                      <div class="w-full overflow-x-scroll no-scrollbar">
                        <table
                          class="table-sm table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4"
                        >
                          <thead>
                            <tr class="whitespace-nowrap">
                              <th
                                class="text-start text-white font-semibold text-sm"
                                >Time</th
                              >

                              <th
                                class="text-start text-white font-semibold text-sm sm:text-[1rem]"
                                >Country</th
                              >
                              <th
                                class="text-start text-white font-semibold text-sm sm:text-[1rem]"
                                >Event</th
                              >
                              <th
                                class="text-end text-white font-semibold text-sm sm:text-[1rem]"
                                >Actual</th
                              >
                              <th
                                class="text-end text-white font-semibold text-sm sm:text-[1rem]"
                                >Forecast</th
                              >
                              <th
                                class="text-end text-white font-semibold text-sm sm:text-[1rem]"
                                >Previous</th
                              >
                              <th
                                class="text-white font-semibold text-sm sm:text-[1rem] text-end"
                                >Importance</th
                              >
                            </tr>
                          </thead>
                          <tbody>
                            {#each day as item}
                              <!-- row -->
                              <tr
                                class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A]"
                              >
                                <td
                                  class="text-white text-sm sm:text-[1rem] border-b-[#09090B]"
                                >
                                  <label class="p-1.5 rounded-md">
                                    {item?.time}
                                  </label>
                                </td>

                                <td
                                  class="flex flex-row items-center text-sm sm:text-[1rem] whitespace-nowrap"
                                >
                                  {#if item?.country === "EU"}
                                    <svg
                                      style="clip-path: circle(50%);"
                                      class="w-4 h-4 sm:w-6 sm:h-6"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 512 512"
                                      ><mask id="circleFlagsEu0"
                                        ><circle
                                          cx="256"
                                          cy="256"
                                          r="256"
                                          fill="#fff"
                                        /></mask
                                      ><g mask="url(#circleFlagsEu0)"
                                        ><path
                                          fill="#0052b4"
                                          d="M0 0h512v512H0z"
                                        /><path
                                          fill="#ffda44"
                                          d="m256 100.2l8.3 25.5H291l-21.7 15.7l8.3 25.6l-21.7-15.8l-21.7 15.8l8.3-25.6l-21.7-15.7h26.8zm-110.2 45.6l24 12.2l18.9-19l-4.2 26.5l23.9 12.2l-26.5 4.2l-4.2 26.5l-12.2-24l-26.5 4.3l19-19zM100.2 256l25.5-8.3V221l15.7 21.7l25.6-8.3l-15.8 21.7l15.8 21.7l-25.6-8.3l-15.7 21.7v-26.8zm45.6 110.2l12.2-24l-19-18.9l26.5 4.2l12.2-23.9l4.2 26.5l26.5 4.2l-24 12.2l4.3 26.5l-19-19zM256 411.8l-8.3-25.5H221l21.7-15.7l-8.3-25.6l21.7 15.8l21.7-15.8l-8.3 25.6l21.7 15.7h-26.8zm110.2-45.6l-24-12.2l-18.9 19l4.2-26.5l-23.9-12.2l26.5-4.2l4.2-26.5l12.2 24l26.5-4.3l-19 19zM411.8 256l-25.5 8.3V291l-15.7-21.7l-25.6 8.3l15.8-21.7l-15.8-21.7l25.6 8.3l15.7-21.7v26.8zm-45.6-110.2l-12.2 24l19 18.9l-26.5-4.2l-12.2 23.9l-4.2-26.5l-26.5-4.2l24-12.2l-4.3-26.5l19 19z"
                                        /></g
                                      ></svg
                                    >
                                  {:else if item?.country === "UK"}
                                    <svg
                                      style="clip-path: circle(50%);"
                                      class="w-4 h-4 sm:w-6 sm:h-6"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 512 512"
                                      ><mask id="circleFlagsUk0"
                                        ><circle
                                          cx="256"
                                          cy="256"
                                          r="256"
                                          fill="#fff"
                                        /></mask
                                      ><g mask="url(#circleFlagsUk0)"
                                        ><path
                                          fill="#eee"
                                          d="m0 0l8 22l-8 23v23l32 54l-32 54v32l32 48l-32 48v32l32 54l-32 54v68l22-8l23 8h23l54-32l54 32h32l48-32l48 32h32l54-32l54 32h68l-8-22l8-23v-23l-32-54l32-54v-32l-32-48l32-48v-32l-32-54l32-54V0l-22 8l-23-8h-23l-54 32l-54-32h-32l-48 32l-48-32h-32l-54 32L68 0z"
                                        /><path
                                          fill="#0052b4"
                                          d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z"
                                        /><path
                                          fill="#d80027"
                                          d="M0 0v45l131 131h45zm208 0v208H0v96h208v208h96V304h208v-96H304V0zm259 0L336 131v45L512 0zM176 336L0 512h45l131-131zm160 0l176 176v-45L381 336z"
                                        /></g
                                      ></svg
                                    >
                                  {:else}
                                    <img
                                      style="clip-path: circle(50%);"
                                      class="w-4 h-4 sm:w-6 sm:h-6"
                                      src={`https://hatscripts.github.io/circle-flags/flags/${item?.countryCode}.svg`}
                                    />
                                  {/if}
                                  <span class="text-white ml-2">
                                    {item?.country}
                                  </span>
                                </td>

                                <td
                                  class="text-start text-white border-b-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap"
                                >
                                  {item?.event?.length > 40
                                    ? item?.event?.slice(0, 40) + "..."
                                    : item?.event}
                                </td>

                                <td
                                  class="text-white border-b-[#09090B] text-end text-sm sm:text-[1rem] whitespace-nowrap"
                                >
                                  {item?.actual !== (null || "")
                                    ? abbreviateNumber(item?.actual)
                                    : "-"}
                                </td>

                                <td
                                  class="text-white border-b-[#09090B] text-end text-sm sm:text-[1rem] whitespace-nowrap"
                                >
                                  {item?.consensus !== (null || "")
                                    ? abbreviateNumber(item?.consensus)
                                    : "-"}
                                </td>

                                <td
                                  class="text-white border-b-[#09090B] text-end text-sm sm:text-[1rem] whitespace-nowrap"
                                >
                                  {item?.prior !== (null || "")
                                    ? abbreviateNumber(item?.prior)
                                    : "-"}
                                </td>

                                <td
                                  class="text-white text-start text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
                                >
                                  <div
                                    class="flex flex-row items-center justify-end"
                                  >
                                    {#each Array.from({ length: 3 }) as _, i}
                                      {#if i < Math.floor(item?.importance)}
                                        <svg
                                          class="w-4 h-4 text-[#FBCE3C]"
                                          aria-hidden="true"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="currentColor"
                                          viewBox="0 0 22 20"
                                        >
                                          <path
                                            d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
                                          />
                                        </svg>
                                      {:else}
                                        <svg
                                          class="w-4 h-4 text-gray-300 dark:text-gray-500"
                                          aria-hidden="true"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="currentColor"
                                          viewBox="0 0 22 20"
                                        >
                                          <path
                                            d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
                                          />
                                        </svg>
                                      {/if}
                                    {/each}
                                  </div>
                                </td>
                              </tr>
                            {/each}
                          </tbody>
                        </table>
                      </div>
                    {:else}
                      <div
                        class="text-white p-5 mt-5 w-fit m-auto rounded-md sm:flex sm:flex-row sm:items-center border border-slate-800 text-[1rem]"
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
                        No Events available for the day.
                      </div>
                    {/if}
                  {/if}
                {/each}
              </div>
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
              href={"/dividends-calendar"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Dividend Calendar
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest dividend announcement
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
