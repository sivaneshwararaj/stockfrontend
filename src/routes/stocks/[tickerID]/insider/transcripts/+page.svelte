<script lang="ts">
  import {
    stockTicker,
    getCache,
    setCache,
    displayCompanyName,
    numberOfUnreadNotification,
  } from "$lib/store";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { onMount } from "svelte";

  let chats = [];
  let date;

  const now = new Date();
  let year = now.getFullYear();
  let quarter = Math.floor(now.getMonth() / 3) + 1;
  let yearRange = ["2024", "2023", "2022", "2021"];
  let displayQuarter = quarter;
  let displayYear = year;
  let isLoaded = false;

  function backToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const getTranscripts = async () => {
    isLoaded = false;
    chats = [];
    let output;
    // Get cached data for the specific tickerID
    const cachedData = getCache(
      `${$stockTicker}-Q-${quarter}-${year}`,
      "getTranscripts",
    );
    if (cachedData) {
      output = cachedData;
    } else {
      const postData = {
        ticker: $stockTicker,
        quarter: quarter,
        year: year,
      };
      // make the POST request to the endpoint
      const response = await fetch("/api/earnings-call-transcripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();
      // Cache the data for this specific tickerID with a specific name 'getTranscripts'
      setCache(
        `${$stockTicker}-Q-${quarter}-${year}`,
        output,
        "getTranscripts",
      );
    }

    chats = output?.chat ?? [];
    date = output?.date ?? "-";
    displayQuarter = quarter;
    displayYear = year;
    isLoaded = true;
  };

  onMount(async () => {
    await getTranscripts();
  });
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) · Q{quarter}
    {year} · Earnings Call Transcript · stocknear
  </title>
  <meta
    name="description"
    content={`Get the latest Earnings Call Transcript of ${$displayCompanyName} (${$stockTicker}) for different years and quarters.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) · Q${quarter} ${year} · Earnings Call Transcript · stocknear`}
  />
  <meta
    property="og:description"
    content={`Get the latest Earnings Call Transcript of ${$displayCompanyName} (${$stockTicker}) for different years and quarters.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) · Q${quarter} ${year} · Earnings Call Transcript · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get the latest Earnings Call Transcript of ${$displayCompanyName} (${$stockTicker}) for different years and quarters.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full bg-[#09090B] overflow-hidden text-white h-full mb-40 sm:mb-0"
>
  <div class="h-full overflow-hidden">
    <div class="relative flex justify-center items-center overflow-hidden">
      <div class="sm:p-7 w-full mt-2 sm:mt-0">
        <div class="mb-6">
          <h1 class="text-2xl sm:text-3xl text-gray-200 font-bold mb-4">
            Transcripts
          </h1>

          <div
            class="text-white p-3 sm:p-5 mb-10 rounded-lg sm:flex sm:flex-row sm:items-center border border-slate-800 text-sm sm:text-[1rem]"
          >
            <svg
              class="w-6 h-6 flex-shrink-0 inline-block sm:mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              ><path
                fill="#a474f6"
                d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
              /></svg
            >
            Discover the earnings call highlights and investor Q&A with {$displayCompanyName}!
          </div>

          <div class="flex w-fit sm:w-[50%] md:block md:w-auto ml-auto">
            <div class="relative inline-block text-left grow">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                  <Button
                    builders={[builder]}
                    class="w-full border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-lg truncate"
                  >
                    <span class="truncate text-white">Year: {year}</span>
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
                  <DropdownMenu.Label class="text-gray-400">
                    Select Year
                  </DropdownMenu.Label>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    {#each yearRange as index}
                      <DropdownMenu.Item
                        on:click={() => {
                          year = index;
                          getTranscripts();
                        }}
                        class="cursor-pointer hover:bg-[#27272A]"
                      >
                        {index}
                      </DropdownMenu.Item>
                    {/each}
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
            <div class="relative inline-block text-left grow ml-3">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                  <Button
                    builders={[builder]}
                    class="w-full border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-lg truncate"
                  >
                    <span class="truncate text-white">Quarter: Q{quarter}</span>
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
                  <DropdownMenu.Label class="text-gray-400">
                    Select Quarter
                  </DropdownMenu.Label>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    {#each [1, 2, 3, 4] as index}
                      <DropdownMenu.Item
                        on:click={() => {
                          quarter = index;
                          getTranscripts();
                        }}
                        class="cursor-pointer hover:bg-[#27272A]"
                      >
                        Q{index}
                      </DropdownMenu.Item>
                    {/each}
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>

        {#if isLoaded}
          {#if chats?.length !== 0}
            <div class="flex flex-col sm:flex-row items-center pt-5 pb-5">
              <span class="text-white text-md">
                Q{displayQuarter}
                {displayYear} · Earnings Call Transcript
              </span>
              <span
                class="text-white text-opacity-80 text-md mt-2 sm:mt-0 sm:ml-auto"
              >
                {new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {#each chats as item}
              {#if item?.name === "Operator"}
                <div class="flex flex-col items-start gap-2.5 mt-5">
                  <div class="flex flex-row items-center ml-auto mr-2">
                    <div
                      class="flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <span class="text-sm text-base">
                        {item?.name}
                      </span>
                    </div>
                    <div
                      class="ml-2 avatar rounded-full w-8 h-8 sm:w-10 sm:h-10 relative bg-[#0DDE00] bg-opacity-[0.6] flex items-center justify-center"
                    >
                      <svg
                        class="w-6 h-6 sm:w-7 sm:h-7"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        ><path
                          fill="#27272A"
                          d="M12 14q-1.25 0-2.125-.875T9 11V5q0-1.25.875-2.125T12 2q1.25 0 2.125.875T15 5v6q0 1.25-.875 2.125T12 14m-1 7v-3.075q-2.6-.35-4.3-2.325T5 11h2q0 2.075 1.463 3.538T12 16q2.075 0 3.538-1.463T17 11h2q0 2.625-1.7 4.6T13 17.925V21z"
                        /></svg
                      >
                    </div>
                  </div>
                  <div
                    class="flex flex-col w-full leading-1.5 p-4 bg-[#27272A] rounded-l-xl rounded-tr-xl"
                  >
                    <p class="text-sm font-normal py-2.5 text-gray-200">
                      {@html item?.description}
                    </p>
                  </div>
                </div>
              {:else}
                <div class="flex flex-col items-start gap-2.5 mt-8">
                  <div class="flex flex-row items-center">
                    <div
                      class="avatar rounded-full w-8 h-8 sm:w-10 sm:h-10 relative bg-red-600 bg-opacity-[0.6] flex items-center justify-center text-white text-sm sm:text-base"
                    >
                      <span
                        class="absolute inset-0 flex items-center justify-center"
                      >
                        {item?.name?.slice(0, 1)}
                      </span>
                    </div>
                    <div
                      class="ml-2 flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <span class="text-sm text-base">
                        {item?.name}
                      </span>
                    </div>
                  </div>
                  <div
                    class="flex flex-col w-full leading-1.5 p-4 bg-[#27272A] rounded-r-xl rounded-tl-xl"
                  >
                    <p class="text-sm font-normal py-2.5 text-gray-200">
                      {@html item?.description}
                    </p>
                  </div>
                </div>
              {/if}
            {/each}

            <label
              on:click={backToTop}
              class="w-32 py-1.5 mt-10 hover:bg-white hover:bg-opacity-[0.05] cursor-pointer m-auto flex justify-center items-center border border-slate-800 rounded-full"
            >
              Back to top
            </label>
          {:else}
            <h3
              class="pl-4 pr-4 pt-5 flex justify-center items-center text-md sm:text-lg text-center text-slate-200"
            >
              No transcript available for {$displayCompanyName} for the Q{displayQuarter}
              of {displayYear} 🧐.
            </h3>
          {/if}
        {:else}
          <div class="flex justify-center items-center h-80">
            <div class="relative">
              <label
                class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <span class="loading loading-spinner loading-md text-gray-400"
                ></span>
              </label>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
