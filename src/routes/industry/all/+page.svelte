<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";

  export let data;
  let rawData = data?.getIndustryOverview;

  $: charNumber = $screenWidth < 640 ? 20 : 30;
</script>

<section class="w-full overflow-hidden m-auto">
  <!-- Page wrapper -->
  <div class="flex justify-center w-full m-auto h-full overflow-hidden">
    <!-- Content area -->
    <div class="w-full overflow-x-scroll">
      <table class="table rounded-none sm:rounded-md w-full m-auto mt-4">
        <thead>
          <tr class="border border-slate-800">
            <th class="text-white font-semibold text-[1rem]">Industry Name</th>
            <th class="text-white text-end font-semibold text-[1rem]">Stocks</th
            >
            <th class="text-white font-semibold text-end text-[1rem]"
              >Market Cap</th
            >
            <th class="text-white font-semibold text-[1rem] text-end"
              >Div. Yield</th
            >
            <th class="text-white font-semibold text-[1rem] text-end"
              >PE Ratio</th
            >
            <th class="text-white font-semibold text-[1rem] text-end"
              >Profit Margin</th
            >
            <th class="text-white font-semibold text-[1rem] text-end"
              >1M Change</th
            >
            <th class="text-white font-semibold text-[1rem] text-end"
              >1Y Change</th
            >
          </tr>
        </thead>
        <tbody>
          {#each rawData as item}
            <!-- row -->
            <tr
              class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B]"
            >
              <td
                class="font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
              >
                <a
                  href={`/list/industry/${item?.industry?.replace(/ /g, "-")?.replace(/&/g, "and")?.replace(/-{2,}/g, "-")?.toLowerCase()}`}
                  class="sm:hover:text-white text-blue-400"
                >
                  {item?.industry?.length > charNumber
                    ? item?.industry?.slice(0, charNumber) + "..."
                    : item?.industry}
                </a>
              </td>

              <td
                class="text-white text-end text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
              >
                {item?.numStocks}
              </td>

              <td
                class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
              >
                {abbreviateNumber(item?.totalMarketCap) ?? "-"}
              </td>

              <td
                class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
              >
                {item?.avgDividendYield?.toFixed(2) ?? "-"}%
              </td>

              <td
                class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
              >
                {item?.pe?.toFixed(2) ?? "-"}
              </td>

              <td
                class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap text-end border-b-[#09090B]"
              >
                {item?.profitMargin?.toFixed(2)}%
              </td>

              <td
                class="{item?.avgChange1M >= 0
                  ? "before:content-['+']  text-[#00FC50]"
                  : 'text-[#FF2F1F]'} text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
              >
                {item?.avgChange1M?.toFixed(2) ?? "-"}%
              </td>

              <td
                class="{item?.avgChange1Y >= 0
                  ? "before:content-['+']  text-[#00FC50]"
                  : 'text-[#FF2F1F]'} text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
              >
                {item?.avgChange1Y?.toFixed(2) ?? "-"}%
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>
