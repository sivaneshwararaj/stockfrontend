<script lang="ts">
  import toast from "svelte-french-toast";
  import { openPriceAlert, newPriceAlertData } from "$lib/store";

  export let data;
  export let ticker;
  export let assetType;

  let currentPrice = Number(data?.getStockQuote?.price?.toFixed(2));
  let targetPrice = currentPrice; //(currentPrice * (1 + targetPrice / 100))?.toFixed(2);
  let condition = "above";

  function changeStatement(event) {
    condition = event.target.value;
  }

  async function handleCreateAlert() {
    if (targetPrice < 0) {
      toast.error(`Target Price must be above zero`, {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });
    } else {
      const closePopup = document.getElementById("priceAlertModal");
      closePopup?.dispatchEvent(new MouseEvent("click"));

      const postData = {
        userId: data?.user?.id,
        symbol: ticker,
        name: data?.getStockQuote?.name,
        assetType: assetType,
        priceWhenCreated: currentPrice,
        condition: condition,
        targetPrice: targetPrice,
      };

      // Make the POST request to the endpoint
      const response = await fetch("/api/create-price-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      $newPriceAlertData = await response?.json();

      //const output = await response.json();

      toast.success(`Successfully created price alert`, {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });
      targetPrice = currentPrice;
    }
  }

  async function stepSizeValue(condition) {
    let step = 0.01;
    if (targetPrice <= 2) {
      step = 0.01;
    } else if (targetPrice <= 5) {
      step = 0.1;
    } else if (targetPrice <= 100) {
      step = 0.5;
    } else if (targetPrice <= 200) {
      step = 1;
    }

    targetPrice += condition === "add" ? step : -step;

    // Round to 2 decimal places
    targetPrice = parseFloat(targetPrice.toFixed(2));
  }

  $: {
    if ($openPriceAlert === true) {
      $openPriceAlert = false;
      currentPrice = Number(data?.getStockQuote?.price?.toFixed(2));
      targetPrice = currentPrice;
      condition = "above";
    }
  }
</script>

<svelte:head>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
  />
</svelte:head>

<!--Start Trade Modal-->
<input type="checkbox" id="priceAlertModal" class="modal-toggle" />

<dialog id="priceAlertModal" class="modal modal-middle p-2 sm:p-0">
  <label
    for="priceAlertModal"
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.3]"
  ></label>

  <div
    class="modal-box rounded-md w-full bg-secondary border border-gray-600 min-h-fit h-[600px] sm:h-[500px]"
  >
    <!--Start Trade Modal-->
    <label
      for="priceAlertModal"
      class="cursor-pointer absolute right-5 top-5 text-[1.8rem] text-white"
    >
      <svg
        class="w-8 h-8"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        ><path
          fill="white"
          d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
        /></svg
      >
    </label>

    <div class="flex flex-col w-full">
      <h2 class="text-white font-semibold text-lg text-start mb-5">
        Create Price Alert on {ticker}
      </h2>

      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-5 font-semibold text-white"
      >
        <label class="text-sm w-[20%] mb-1 sm:mb-0">Symbol</label>

        <label
          class="rounded-md bg-[#2A2E39] w-full sm:w-[80%] py-2 px-2 text-sm border border-gray-600"
        >
          <!--
          <img
            style="clip-path: circle(50%);"
            class="w-4 h-4 inline-block -mt-1 mr-1"
            src={`https://financialmodelingprep.com/image-stock/${ticker?.toUpperCase()}.png`}
            alt="logo"
            loading="lazy"
          />
          -->

          {ticker?.toUpperCase()}, Regular trading hours
        </label>
      </div>

      <div class="flex flex-col gap-4 mt-5 font-semibold text-white">
        <!-- Condition Label -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center">
          <label class="text-sm w-[20%] mb-1 sm:mb-0">Condition</label>
          <input
            type="text"
            value="Price"
            class="w-full sm:w-[80%] bg-[#2A2E39] border border-gray-600 text-sm rounded-md py-2 px-3 text-white"
            readonly
          />
        </div>

        <!-- Crossing Dropdown -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center">
          <label class="text-sm w-[20%] mb-1 sm:mb-0">Crossing</label>
          <select
            on:change={changeStatement}
            class="w-full sm:w-[80%] bg-[#2A2E39] border border-gray-600 text-sm rounded-md py-2 px-3 text-white"
          >
            <option value="above" selected>Above</option>
            <option value="below">Below</option>
          </select>
        </div>

        <!-- Value Input -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center">
          <label class="text-sm w-[20%] mb-1 sm:mb-0">Value</label>

          <div class="relative w-full sm:w-[80%]">
            <input
              bind:value={targetPrice}
              class="w-full bg-[#2A2E39] border border-gray-600 text-sm rounded-md py-2 px-3 pr-16 text-white"
            />
            <div
              class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-x-1.5"
            >
              <button on:click={() => stepSizeValue("add")}>
                <svg
                  class="size-6 cursor-pointer text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="max-width: 40px"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </button>
              <button on:click={() => stepSizeValue("minus")}>
                <svg
                  class="size-6 cursor-pointer text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="max-width: 40px"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {#if !isNaN(targetPrice) && targetPrice !== undefined && targetPrice !== null}
          <div class="flex flex-col gap-2 mt-5 text-white">
            <label class="text-sm sm:text-[1rem] font-semibold"
              >Quick Summary:</label
            >
            <p class="text-sm sm:text-[1rem]">
              Your price alert will notify you when the stock price is {condition}
              {targetPrice}.
            </p>
          </div>
        {/if}

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 mt-6 absolute bottom-5 right-5">
          <label
            for="priceAlertModal"
            class="cursor-pointer border border-gray-600 text-white py-2 px-4 rounded-md text-sm"
          >
            Cancel
          </label>
          <button
            on:click={handleCreateAlert}
            class="bg-white text-black py-2 px-4 rounded-md text-sm"
          >
            Save
          </button>
        </div>
      </div>

      <!--End Trade Modal-->
    </div>
  </div>
</dialog>
