<script>
  import { onMount } from "svelte";

  // Toy data structure representing market sectors and stocks
  const data = {
    labels: [
      "Technology",
      "Technology",
      "Technology",
      "Technology",
      "Financials",
      "Financials",
      "Healthcare",
      "Healthcare",
      "Consumer",
      "Consumer",
      "Energy",
      "Energy",
    ],
    parents: ["", "", "", "", "", "", "", "", "", "", "", ""],
    names: [
      "NVDA",
      "AAPL",
      "MSFT",
      "AMD",
      "JPM",
      "BAC",
      "PFE",
      "JNJ",
      "AMZN",
      "TSLA",
      "XOM",
      "CVX",
    ],
    values: [300, 280, 250, 150, 200, 180, 120, 140, 260, 220, 130, 110],
    changes: [
      4.36, -3.28, 0.21, 5.41, 1.44, 4.85, 2.26, 1.11, 1.24, -2.35, 1.1, 3.28,
    ],
  };

  let plotlyDiv;

  onMount(async () => {
    // Dynamically import Plotly to avoid SSR issues
    const Plotly = await import("plotly.js-dist");

    // Calculate colors based on percentage changes
    const colors = data.changes.map((change) =>
      change >= 0
        ? `rgb(${Math.max(0, 255 - Math.floor(change * 20))}, 255, ${Math.max(0, 255 - Math.floor(change * 20))})`
        : `rgb(255, ${Math.max(0, 255 + Math.floor(change * 20))}, ${Math.max(0, 255 + Math.floor(change * 20))})`,
    );

    // Create text labels with stock symbol and percentage change
    const text = data.names.map(
      (name, i) =>
        `${name}<br>${data.changes[i] >= 0 ? "+" : ""}${data.changes[i].toFixed(2)}%`,
    );

    const layout = {
      title: "Market Sectors Treemap",
      width: 1000,
      height: 800,
      showlegend: false,
      margin: { t: 30, l: 0, r: 0, b: 0 },
    };

    const trace = {
      type: "treemap",
      labels: data.labels,
      parents: data.parents,
      values: data.values,
      text: text,
      textinfo: "text",
      hoverongaps: false,
      marker: {
        colors: colors,
        line: { width: 1 },
      },
    };

    Plotly.newPlot(plotlyDiv, [trace], layout);
  });
</script>

<div bind:this={plotlyDiv} class="w-full h-full"></div>
