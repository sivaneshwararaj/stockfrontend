<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  export let data;

  const fields = [
    { label: "Revenue", key: "revenue" },
    { label: "Cost of Revenue", key: "costOfRevenue" },
    { label: "Gross Profit", key: "grossProfit" },
    { label: "Net Income", key: "netIncome" },
    { label: "Operating Income", key: "operatingIncome" },
    {
      label: "Selling, General & Admin",
      key: "sellingGeneralAndAdministrativeExpenses",
    },
    {
      label: "Selling & Marketing Expenses",
      key: "sellingAndMarketingExpenses",
    },
    { label: "Research & Development", key: "researchAndDevelopmentExpenses" },
    { label: "Other Expenses", key: "otherExpenses" },
    { label: "Operating Expenses", key: "operatingExpenses" },
    { label: "Cost & Expenses", key: "costAndExpenses" },
    { label: "Interest Expense", key: "interestExpense" },
    { label: "Pretax Income", key: "incomeBeforeTax" },
    { label: "Income Tax", key: "incomeTaxExpense" },

    { label: "Interest Income", key: "interestIncome" },
    { label: "Interest Expense", key: "interestExpense" },
    { label: "Shares Outstanding (Basic)", key: "weightedAverageShsOut" },
    { label: "Shares Outstanding (Diluted)", key: "weightedAverageShsOutDil" },
    { label: "EPS (Basic)", key: "eps" },
    { label: "EPS (Diluted)", key: "epsdiluted" },
    { label: "EBITDA", key: "ebitda" },
    { label: "Depreciation & Amortization", key: "depreciation" },
  ];
</script>

{#each fields as { label, key }}
  <tr class="text-white odd:bg-[#27272A] whitespace-nowrap">
    <td
      class="text-start border-r border-gray-700 text-white text-sm sm:text-[1rem]"
    >
      {label}
    </td>
    {#each data as item}
      <td class="text-sm sm:text-[1rem] text-end">
        {item[key] !== null && item[key] !== 0
          ? abbreviateNumber(item[key])
          : "-"}
      </td>
    {/each}
  </tr>
{/each}
