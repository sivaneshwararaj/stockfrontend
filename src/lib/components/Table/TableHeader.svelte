<script lang="ts">
  export let columns = [];
  export let sortOrders = {};
  export let sortData;

  const SortIcon = ({ sortOrder }) => `
    <svg class="flex-shrink-0 w-4 h-4 inline-block ${
      sortOrder === "asc" ? "rotate-180" : sortOrder === "desc" ? "" : "hidden"
    }" viewBox="0 0 20 20" fill="currentColor" style="max-width:50px">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
    </svg>
  `;
</script>

<tr class="bg-default border-b border-[#27272A]">
  {#each columns as column}
    <th
      on:click={() => sortData(column.key)}
      class="cursor-pointer select-none text-white font-semibold text-sm whitespace-nowrap {column.align ===
      'right'
        ? 'text-end'
        : 'text-start'}"
    >
      {column.label}
      {@html SortIcon({ sortOrder: sortOrders[column.key].order })}
    </th>
  {/each}
</tr>
