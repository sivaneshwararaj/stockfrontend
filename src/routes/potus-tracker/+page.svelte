<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";
  import Map from "$lib/components/Map.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;

  let rawData = data?.getData?.history || [];
  let billData = data?.getData?.billData || [];

  const groupedByDate = rawData?.reduce((acc, item) => {
    const dateKey = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(item.date));

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  let modalTitle = "n/a";
  let modalDescription = "n/a";
</script>

<SEO
  title="POTUS Tracker - Executive Orders, Presidential Schedule, Signed Legislation"
  description="Where is the President? Find out what the President of the United States is doing with real-time location, schedule, legislation, and executive order updates."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3 text-white"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">POTUS Tracker</li>
    </ul>
  </div>

  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div
        class="relative flex flex-row justify-center items-start overflow-hidden w-full"
      >
        <div class="w-full mt-5">
          <div class="lg:float-left lg:w-[calc(100%-336px-20px)]">
            <h1 class="text-xl sm:text-2xl font-bold mb-4 w-full">
              POTUS Tracker
            </h1>
          </div>

          <div class=" lg:float-left lg:w-[calc(100%-336px-40px)]">
            <div class="sm-mt-5 mb-5">
              <Infobox
                text={`Since the inauguration of Donald J. Trump on January 20, 2025, the 
  S&P500 has ${data?.getData?.returnSince >= 0 ? "grown" : "declined"} by <span class="${data?.getData?.returnSince >= 0 ? "text-[#00FC50] before:content-['+']" : "text-[#FF2F1F]"}">
  ${data?.getData?.returnSince ?? "n/a"}%</span>.`}
              />
            </div>

            <h2 class="text-white text-lg font-semibold mb-2">
              The US President is currently located in {data?.getData?.city ??
                "n/a"}
            </h2>

            <div class="w-full m-auto border border-gray-800 rounded-[10px]">
              <Map LAT={data?.getData?.lat} LON={data?.getData?.lon} />
            </div>

            <h3 class="text-white text-xl font-semibold mb-2 mt-10">
              Official Presidential Schedule
            </h3>

            <div class="space-y-4">
              {#each Object.entries(groupedByDate) as [date, items], indexA}
                <div class="my-4">
                  <div
                    class="border-b border-gray-800 pb-2 w-full flex flex-row items-center justify-between"
                  >
                    <span class="text-lg font-semibold text-white">
                      {date}</span
                    >
                    {#if items?.at(0)?.changesPercentage}
                      <div class="ml-auto text-sm">
                        <span class="inline-block">S&P500</span>
                        <span
                          class="{items?.at(0)?.changesPercentage > 0
                            ? "text-[#00FC50] before:content-['+']"
                            : 'text-[#FF2F1F]'} "
                          >{items.length > 0
                            ? items?.at(0)?.changesPercentage
                            : "n/a"}%</span
                        >
                      </div>
                    {/if}
                  </div>
                  <!-- Display date -->
                  <br />
                  {#each items as item, indexB}
                    <div class="flex flex-col items-start space-y-1 mb-6">
                      <div class="flex flex-row items-center space-x-2">
                        <div class="relative">
                          <svg
                            fill={indexA === 0 && indexB === 0
                              ? "#2E86DE"
                              : "#808080"}
                            class="w-5 h-5 relative z-10"
                            viewBox="-51.2 -51.2 614.40 614.40"
                            id="_78_Circle-Full"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke={indexA === 0 && indexB === 0
                              ? "#2E86DE"
                              : "#808080"}
                            stroke-width="0.00512"
                          >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke="#CCCCCC"
                              stroke-width="24.576"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              <path
                                id="Path_111"
                                data-name="Path 111"
                                d="M256,512C114.625,512,0,397.375,0,256S114.625,0,256,0,512,114.625,512,256,397.375,512,256,512Zm0-448C149.969,64,64,149.969,64,256s85.969,192,192,192,192-85.969,192-192S362.031,64,256,64Zm0,320A128,128,0,1,1,384,256,128.006,128.006,0,0,1,256,384Z"
                                fill-rule="evenodd"
                              ></path>
                            </g>
                          </svg>

                          {#if indexA === 0 && indexB === 0}
                            <span
                              class="absolute -inset-1 rounded-full animate-ping w-3 h-3 m-auto bg-blue-400/75"
                            ></span>
                          {/if}
                        </div>

                        <span class="text-sm text-gray-400">
                          {item.time_formatted} - {item.location}
                        </span>
                      </div>

                      <span class="text-sm ml-7">
                        {item.details}
                      </span>
                    </div>
                  {/each}
                </div>
              {/each}
            </div>
          </div>

          <div class="order-4 flex-shrink-0 lg:float-right lg:w-[336px]">
            <h3 class="text-xl text-white font-semibold mb-3">
              Latest Legislations
            </h3>
            <div class="overflow-y-auto max-h-[1000px]">
              {#each billData as item}
                <div class="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <!-- Badge and Time -->
                  <div class="flex justify-between items-center mb-4">
                    <span
                      class="bg-emerald-500 text-white px-4 py-1 rounded text-sm font-medium"
                    >
                      {item?.badge}
                    </span>
                    <span class="text-gray-400 text-sm"
                      >{item?.time !== null ? item?.time : ""}</span
                    >
                  </div>

                  <!-- Title -->
                  <h2 class="text-[#E5E7EB] text-lg font-semibold mb-3">
                    {item?.title}
                  </h2>

                  <!-- Description -->
                  <p class="text-gray-400 text-sm mb-4">
                    {item?.description?.length > 150
                      ? item?.description?.slice(0, 150) + "..."
                      : item?.description}
                  </p>

                  <!-- Read More Button -->
                  <div class="flex justify-end">
                    <label
                      on:click={() => {
                        modalTitle = item?.title;
                        modalDescription = item?.description;
                      }}
                      for="readMore"
                      class="cursor-pointer bg-blue-500 sm:hover:bg-blue-600 ease-out transition duration-100 text-white px-3 py-1.5 rounded text-sm"
                    >
                      Read More
                    </label>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Desktop modal using dialog component -->
<input type="checkbox" id="readMore" class="modal-toggle" />

<dialog id="readMore" class="modal p-3 sm:p-0">
  <label
    for="readMore"
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.8]"
  ></label>

  <!-- Desktop modal content -->
  <div
    class="modal-box rounded-md border border-gray-600 w-full bg-secondary flex flex-col items-center"
  >
    <div class="mx-auto h-1.5 w-20 flex-shrink-0 rounded-full" />
    <div class="text-white mb-5 text-center">
      <h3 class="font-bold text-xl mb-5">{modalTitle}</h3>
      <span class="text-white text-[1rem] font-normal"
        >{@html modalDescription}</span
      >
    </div>

    <div class="border-t border-gray-600 mt-2 w-full">
      <label
        for="readMore"
        class="mt-4 font-semibold text-white text-xl m-auto flex justify-center cursor-pointer"
      >
        Close
      </label>
    </div>
  </div>
</dialog>
