<script lang="ts">
  import { isOpen, screenWidth } from "$lib/store";
</script>

<div class="flex flex-row items-center">
  <label for={$screenWidth > 640 ? "marketHour" : ""} class="cursor-pointer">
    {#if $isOpen}
      <div
        class="sm:border sm:border-gray-800 b sm:hover:bg-[#333333] sm:ease-in-out sm:duration-100 rounded-2xl pl-3 pr-3 pt-1 pb-1 flex flex-row items-center"
      >
        <span class="text-xs py-0.5 text-slate-200 font-semibold">
          Market Open
        </span>
        <span class="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 ml-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FC50] opacity-75"
          ></span>
          <span
            class="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#00FC50]"
          ></span>
        </span>
      </div>
    {:else}
      <div
        class="sm:border sm:border-gray-800 sm:hover:bg-[#333333] sm:ease-in-out sm:duration-100 rounded-2xl pl-3 pr-3 pt-1 pb-1 flex flex-row items-center"
      >
        <span class="text-xs py-0.5 text-slate-200 font-semibold">
          Market Closed
        </span>
        <span class="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 ml-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2F1F] opacity-75"
          ></span>
          <span
            class="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#FF2F1F]"
          ></span>
        </span>
      </div>
    {/if}
  </label>
</div>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="marketHour" class="modal-toggle" />

<label
  for="marketHour"
  class="modal modal-bottom sm:modal-middle cursor-pointer"
>
  <label for="marketHour" class="cursor-pointer modal-backdrop"></label>

  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label
    class="modal-box w-full relative bg-primary border border-gray-800 h-auto"
  >
    <label
      for="marketHour"
      class="cursor-pointer absolute right-5 top-2 bg-primary text-2xl text-white"
    >
      ✕
    </label>

    <h3 class="text-2xl font-bold text-white">Opening Hours</h3>
    <p class="py-4 text-gray-200 bg-primary w-full">
      The New York Stock Exchange, one of the largest stock exchanges in the
      world, operates on a regular trading schedule. Its trading hours are from <span
        class="text-white font-semibold underline">9:30</span
      >
      ET in the morning to
      <span class="text-white font-semibold underline">16:00</span>
      ET in the afternoon. Monday through Friday.
      <br />
      <br />
      The market is closed on the following holidays:
    </p>

    <table
      class="table table-sm table-compact bg-primary w-full mt-5 mb-10 text-white"
    >
      <!-- head -->
      <thead>
        <tr class="border-b border-slate-700 odd:bg-odd">
          <th class="bg-primary text-white text-sm font-semibold">
            Exchange holidays
          </th>
          <th class="bg-primary text-white text-sm font-semibold"> Date </th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr class="border-b border-slate-700 odd:bg-odd">
          <td class="font-semibold"> New Years Day</td>
          <td class="">01.01.2024</td>
        </tr>
        <!-- row 2 -->
        <tr class="border-b border-slate-700 odd:bg-odd">
          <td class="font-semibold">Martin Luther King, Jr. Day</td>
          <td class="">15.01.2024</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-odd">
          <td class="font-semibold">Washington's Birthday</td>
          <td class="">19.02.2024</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-odd">
          <td class="font-semibold"> Good Friday </td>
          <td class="bg-primary">29.03.2024</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-odd">
          <td class="font-semibold">Memorial Day</td>
          <td class="">27.05.2024</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-odd">
          <td class="font-semibold">Juneteenth National Independence Day</td>
          <td class="">19.06.2024</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-odd">
          <td class="font-semibold">Independence Day</td>
          <td class="">04.07.2024</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-odd">
          <td class="font-semibold">Labor Day</td>
          <td class="">02.09.2024</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-odd">
          <td class="font-semibold">Thanksgiving Day</td>
          <td class="">28.11.2024</td>
        </tr>
        <tr class="odd:bg-odd">
          <td class="font-semibold">Christmas</td>
          <td class="">25.12.2024</td>
        </tr>
      </tbody>
    </table>
  </label>
</label>
