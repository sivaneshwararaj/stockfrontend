<script lang="ts">
  import * as Avatar from "$lib/components/shadcn/avatar/index.js";
  import * as HoverCard from "$lib/components/shadcn/hover-card/index.js";

  import { ColorType } from "lightweight-charts";
  import { Chart, BaselineSeries, PriceLine } from "svelte-lightweight-charts";
  import { screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import { afterUpdate } from "svelte";
  export let stockChartData;
  export let symbol;

  export let priceData;
  export let changesPercentage;
  export let change;

  const topLineColor = "#71CA96";
  const topFillColor1 = "rgba( 38, 166, 154, 0.2)";
  const bottomLineColor = "#FF7070";
  const bottomFillColor1 = "rgba(239, 83, 80, 0.2)";

  let width = $screenWidth < 640 ? 80 : 150; //= ($screenWidth <= 1200 && $screenWidth > 900) ? 360 : ($screenWidth <= 900 && $screenWidth > 700) ? 260 : ($screenWidth <= 700 && $screenWidth >=600 ) ? 200 : ($screenWidth < 600 && $screenWidth >=500 ) ? 150 : 80;

  //Initial height of graph
  let height = $screenWidth < 640 ? 50 : 60;

  let observer;
  let ref;
  let chart;

  ref = (element) => {
    if (observer) {
      observer?.disconnect();
    }
    if (!element) {
      return;
    }

    observer = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    });
    observer.observe(element);
  };

  const THEMES = {
    Dark: {
      chart: {
        layout: {
          background: {
            type: ColorType.Solid,
            color: "#09090B",
          },
          lineColor: "#2B2B43",
          textColor: "#D9D9D9",
        },
        crosshair: {
          mode: 2,
        },
        grid: {
          vertLines: {
            visible: false,
          },
          horzLines: {
            visible: false,
          },
        },
      },

      series: {
        baseValue: { type: "price", price: priceData?.at(0)?.value },
        priceLineVisible: false,
        baseLineVisible: true,
        baseLineColor: "#B2B5BE",
        baseLineWidth: 1,
        baseLineStyle: 1,
        lineWidth: 1.5,
      },
    },
  };

  const AVAILABLE_THEMES = Object?.keys(THEMES);

  let selected = AVAILABLE_THEMES[0];
  $: theme = THEMES[selected];

  const options = {
    width: width,
    height: height,
    rightPriceScale: {
      visible: false,
    },
    timeScale: {
      borderColor: "#FFFFFF",
      textColor: "#FFFFFF",
      visible: false,
      fixLeftEdge: true,
      fixRightEdge: true,
    },
    handleScale: {
      mouseWheel: false,
    },
    handleScroll: {
      mouseWheel: false,
      horzTouchDrag: false,
      vertTouchDrag: false,
      pressedMouseMove: false,
    },
  };

  afterUpdate(async () => {
    if (
      $screenWidth &&
      stockChartData &&
      chart &&
      typeof window !== "undefined"
    ) {
      console.log("yes");

      chart?.timeScale()?.fitContent();
    }
  });
</script>

<div on:mouseover>
  <HoverCard.Root>
    <div on:mouseover>
      <HoverCard.Trigger
        class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
      >
        <a
          href={symbol?.length !== 0 && !["BTC", "USD"]?.includes(symbol)
            ? `/stocks/${symbol}`
            : symbol === "BTC"
              ? "/crypto/BTCUSD"
              : ""}
          class="sm:hover:text-white text-blue-400"
          >{symbol?.length !== 0 ? symbol : "-"}</a
        >
      </HoverCard.Trigger>
    </div>
    <HoverCard.Content class=" w-96 bg-[#09090B] border border-gray-400">
      <div class="flex justify-between space-x-4 w-full text-white">
        <div class="space-y-1 w-full">
          <!--Hover Stock Chart-->
          <label
            class=" text-sm flex flex-row items-center justify-start bg-[#09090B]"
          >
            <div class="flex flex-col items-start w-full">
              <div class="-ml-2 flex flex-row items-center pb-1">
                <Avatar.Root>
                  <Avatar.Image
                    class="w-5 h-5 rounded-full avatar text-center m-auto flex-shrink-0"
                    src={`https://financialmodelingprep.com/image-stock/${symbol}.png`}
                  />
                  <Avatar.Fallback>SK</Avatar.Fallback>
                </Avatar.Root>
                <h4 class="text-[1rem] font-semibold inline-block">{symbol}</h4>
              </div>
              <p>
                Current Price: {stockChartData?.price?.toFixed(2)} (<span
                  class="text-xs {change >= 0
                    ? "before:content-['+'] text-[#00FC50]"
                    : 'text-[#FF2F1F]'}">{change?.toFixed(2)}</span
                >)
              </p>
              <p>
                <svg
                  class="inline-block w-4 h-4 {changesPercentage >= 0
                    ? ''
                    : 'rotate-180'}"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill={changesPercentage >= 0 ? "#00FC50" : "#FF2F1F"}
                    d="M12.884 5.116a1.253 1.253 0 0 0-1.768 0l-5 5a1.25 1.25 0 0 0 1.768 1.768l2.866-2.866V18a1.25 1.25 0 1 0 2.5 0V9.018l2.866 2.866a1.25 1.25 0 1 0 1.768-1.768z"
                  />
                </svg>
                {#if changesPercentage != null}
                  <span
                    class="-ml-1"
                    style="color: {changesPercentage >= 0
                      ? '#00FC50'
                      : '#FF2F1F'}"
                  >
                    {changesPercentage >= 1000 || changesPercentage <= -1000
                      ? abbreviateNumber(changesPercentage)
                      : changesPercentage?.toFixed(2)}%
                  </span>
                {:else}
                  -
                {/if}
                today
              </p>
            </div>
            {#if priceData?.length > 0}
              <div class="w-[40%]">
                <Chart
                  {...options}
                  {...theme.chart}
                  autoSize={true}
                  ref={(ref) => (chart = ref)}
                >
                  <BaselineSeries
                    data={priceData}
                    {...theme.series}
                    {topLineColor}
                    {topFillColor1}
                    {bottomLineColor}
                    {bottomFillColor1}
                  >
                    <PriceLine
                      price={priceData?.at(0)?.value}
                      lineWidth={1}
                      color="#fff"
                    />
                  </BaselineSeries>
                </Chart>
              </div>
            {/if}
          </label>

          <!--Hover Stock Chart-->
        </div>
      </div>
    </HoverCard.Content>
  </HoverCard.Root>
</div>
