<script>
  import Plot from "svelte-plotly.js";

  // Treemap data configuration
  const data = [
    {
      type: "treemap",
      labels: [
        "Eve",
        "Cain",
        "Seth",
        "Enos",
        "Noam",
        "Abel",
        "Awan",
        "Enoch",
        "Azura",
      ],
      parents: ["", "Eve", "Eve", "Seth", "Seth", "Eve", "Eve", "Awan", "Eve"],
      textinfo: "label+parent",
      marker: { line: { width: 2 } },
    },
  ];

  // Layout configuration with black background
  const layout = {
    title: "Family Tree Treemap",
    margin: { l: 0, r: 0, b: 20, t: 40 },
    width: 800,
    height: 600,
    paper_bgcolor: "#09090b", // Sets the outer background to black
    font: { color: "#FFFFFF" }, // Optional: Change text color to white for better contrast
  };
</script>

<div class="w-full min-h-screen">
  <div class="treemap-container">
    <Plot {data} {layout} />
  </div>
</div>

<style>
  .treemap-container {
    margin: 1rem;
    padding: 1rem;
  }
</style>
