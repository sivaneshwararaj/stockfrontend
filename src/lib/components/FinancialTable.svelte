<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  export let data;
  export let fields;
</script>

{#each fields as { label, key }}
  <tr class="text-white odd:bg-odd whitespace-nowrap border-b border-gray-800">
    <td
      class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
    >
      {label}
    </td>
    {#each data as item}
      <td class="text-sm sm:text-[1rem] text-end">
        {#if ["pretaxProfitMargin", "freeCashFlowMargin", "grossProfitMargin", "netProfitMargin", "operatingProfitMargin", "ebitdaMargin"]?.includes(key)}
          {item[key] !== null && item[key] !== 0 && item[key] !== undefined
            ? abbreviateNumber(item[key]?.toFixed(2)) + "%"
            : "n/a"}
        {:else}
          {item[key] !== null && item[key] !== 0 && item[key] !== undefined
            ? abbreviateNumber(item[key]?.toFixed(2))
            : "n/a"}
        {/if}
      </td>
    {/each}
  </tr>
{/each}
