<script lang="ts">
  import toast from "svelte-french-toast";
  import veryGoodEmoji from "$lib/assets/veryGoodEmoji.svg";
  import goodEmoji from "$lib/assets/goodEmoji.svg";
  import badEmoji from "$lib/assets/badEmoji.svg";
  import veryBadEmoji from "$lib/assets/veryBadEmoji.svg";
  export let data;
  import * as Tabs from "$lib/components/shadcn/tabs/index.js";

  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;

  let rating = "";
  let inputValue = "";
  let category = "general";
  /*
  async function handleReturn() {
    rating = '';
    inputValue = '';
  
  }
  */

  async function sendFeedback() {
    if (inputValue?.length === 0) {
      toast.error("Please enter your feedback", {
        style: "border-radius: 200px; background: #333; color: #fff;",
      });
      return;
    }

    if (rating?.length === 0 && category === "general") {
      toast.error("Please select an emoji", {
        style: "border-radius: 200px; background: #333; color: #fff;",
      });
      return;
    }

    const closePopup = document.getElementById("feedbackInfo");
    closePopup?.dispatchEvent(new MouseEvent("click"));

    const userId = data?.user?.id ?? "";

    const postData = {
      user: userId,
      rating: rating,
      description: inputValue,
      category: category,
    };

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    toast.success("Thank you for your feedback", {
      style: "border-radius: 200px; background: #333; color: #fff;",
    });

    rating = "";
    inputValue = "";
  }

  function handleInput(event) {
    inputValue = event.target.value;
  }
</script>

<svelte:head>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
  />
</svelte:head>

<div class="fixed z-[100] bottom-8 sm:bottom-10 right-8 sm:right-16">
  <label
    for="feedbackInfo"
    class="inline-flex items-center justify-center w-12 h-12 sm:w-full sm:h-10 font-semibold bg-gray-700 sm:bg-[#fff] ml-1 mr-0 sm:mr-2 rounded-full cursor-pointer"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="sm:hidden sm:ml-4 w-6 h-6 text-white inline-block"
      viewBox="0 0 256 256"
      ><path
        fill="white"
        d="M140 180a12 12 0 1 1-12-12a12 12 0 0 1 12 12M128 72c-22.06 0-40 16.15-40 36v4a8 8 0 0 0 16 0v-4c0-11 10.77-20 24-20s24 9 24 20s-10.77 20-24 20a8 8 0 0 0-8 8v8a8 8 0 0 0 16 0v-.72c18.24-3.35 32-17.9 32-35.28c0-19.85-17.94-36-40-36m104 56A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88"
      /></svg
    >
    <span class="text-black hidden sm:block text-md px-3"> Feedback </span>
    <img
      class="hidden sm:inline-block w-12 -mt-6 opacity-[0.85]"
      src={cloudFrontUrl + "/assets/feedback_icon.png"}
      alt="feedback logo"
    />
  </label>
</div>

<!--Start Create Watchlist Modal-->
<input type="checkbox" id="feedbackInfo" class="modal-toggle" />

<dialog
  id="feedbackInfo"
  class="modal modal-bottom sm:modal-middle overflow-hidden"
>
  <label
    for="feedbackInfo"
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.9]"
  ></label>

  <div class="modal-box w-full bg-[#09090B] border border-gray-600">
    <div class="flex flex-row items-center pt-5">
      <h1 class="text-white text-xl sm:text-2xl font-bold">
        Your Feedback matters!
      </h1>
    </div>

    <Tabs.Root value="general" class="w-full mt-5 m-auto">
      <Tabs.List class="grid w-full grid-cols-3 bg-[#09090B]">
        <Tabs.Trigger
          on:click={() => (category = "general")}
          value="general"
          class="text-sm">General</Tabs.Trigger
        >
        <Tabs.Trigger
          on:click={() => (category = "feature-request")}
          value="feature-request"
          class="text-sm">Feature Request</Tabs.Trigger
        >
        <Tabs.Trigger
          on:click={() => (category = "bug-report")}
          value="bug-report"
          class="text-sm">Bug Report</Tabs.Trigger
        >
      </Tabs.List>
    </Tabs.Root>

    <div class="p-2 mt-5 w-full h-[200px] max-h-[1000px]">
      <textarea
        class="max-h-[1000px] h-[200px] textarea textarea-bordered placeholder-gray-300 w-full bg-[#27272A] ring-1 text-white border border-gray-600"
        placeholder="Your feedback..."
        value={inputValue}
        on:input={handleInput}
      />
    </div>

    <ul class="flex gap-5 justify-center mt-5 mb-5">
      {#if category === "general"}
        <li on:click={() => (rating = "Very Good")} class="cursor-pointer">
          <div
            class="rounded-full w-16 h-16 relative {rating === 'Very Good'
              ? 'bg-[#333333]'
              : ''} hover:bg-[#333333] flex items-center justify-center"
          >
            <img
              class="w-8 h-8 sm:w-10 sm:h-10"
              src={veryGoodEmoji}
              loading="lazy"
            />
          </div>
        </li>
        <li on:click={() => (rating = "Good")} class="cursor-pointer">
          <div
            class="rounded-full w-16 h-16 relative {rating === 'Good'
              ? 'bg-[#333333]'
              : ''} hover:bg-[#333333] flex items-center justify-center"
          >
            <img
              class="w-8 h-8 sm:w-10 sm:h-10"
              src={goodEmoji}
              loading="lazy"
            />
          </div>
        </li>
        <li on:click={() => (rating = "Bad")} class="cursor-pointer">
          <div
            class="rounded-full w-16 h-16 relative {rating === 'Bad'
              ? 'bg-[#333333]'
              : ''} hover:bg-[#333333] flex items-center justify-center"
          >
            <img
              class="w-8 h-8 sm:w-10 sm:h-10"
              src={badEmoji}
              loading="lazy"
            />
          </div>
        </li>
        <li on:click={() => (rating = "Very Bad")} class="cursor-pointer">
          <div
            class="rounded-full w-16 h-16 relative {rating === 'Very Bad'
              ? 'bg-[#333333]'
              : ''} hover:bg-[#333333] flex items-center justify-center"
          >
            <img
              class="w-8 h-8 sm:w-10 sm:h-10"
              src={veryBadEmoji}
              loading="lazy"
            />
          </div>
        </li>
      {/if}
    </ul>

    <button
      on:click={() => sendFeedback()}
      class="mb-4 px-3 py-2 bg-[#fff] sm:hover:bg-gray-300 {(category ===
        'general' &&
        rating?.length !== 0 &&
        inputValue?.length !== 0) ||
      (category !== 'general' && inputValue?.length !== 0)
        ? 'opacity-100 cursor-pointer'
        : 'opacity-60 cursor-not-allowed'} w-11/12 rounded-lg m-auto text-black font-semibold text-md"
    >
      Send Feedback
    </button>
  </div>
</dialog>
