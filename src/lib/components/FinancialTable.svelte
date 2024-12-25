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
        {@html item[key] !== null && item[key] !== 0
          ? abbreviateNumber(item[key]?.toFixed(2), false, true)
          : "n/a"}
      </td>
    {/each}
  </tr>
{/each}
