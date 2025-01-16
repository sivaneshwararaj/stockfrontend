<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import logo from "$lib/images/newsletter.png";
  export let data;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Free
    Market Newsletter: Stay Informed in Just 2 Minutes Per Day · Stocknear
  </title>
  <meta
    name="description"
    content={`Get our free newsletter to be up to date with the current market.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`Free Market Newsletter: Stay Informed in Just 2 Minutes Per Day · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Get our free newsletter to be up to date with the current market.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`Free Market Newsletter: Stay Informed in Just 2 Minutes Per Day · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get our free newsletter to be up to date with the current market.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<div class="w-full max-w-7xl min-h-screen text-white m-auto mt-5">
  <main
    id="main"
    class="mx-auto max-w-screen-lg space-x-20 p-6 md:flex md:p-10"
  >
    <div class="md:text-lg [&amp;_li]:mb-5 [&amp;_p]:mb-5">
      <h1 class="mb-5 text-center text-3xl md:text-4xl font-bold">
        Stay informed in just 2 minutes per day
      </h1>
      <p>
        Market Bullets is a free newsletter that makes it super easy to keep up
        with financial markets.
      </p>
      <p class="mt-4">
        Our summaries are presented in short, bullet-point format, so reading
        this newsletter will never feel like a chore.
      </p>

      <p class="mt-4">
        Let us read the news for you and filter out the noise, then we'll send
        you the bullet points. Here's what you'll get:
      </p>
      <ul class="ml-8 list-disc mt-2">
        <li>
          Access the latest analyst reports, with key insights extracted using
          AI.
        </li>
        <li>Get a quick snapshot of recent and upcoming earnings releases.</li>
        <li>
          Stay updated on major economic events with the potential to
          significantly impact the market.
        </li>

        <li>
          Benefit from accurate, up-to-date information sourced exclusively from
          top-tier outlets.
        </li>
      </ul>

      <p class="mt-4">
        The newsletter is completely free, delivered to your inbox every morning
        before the market opens, Monday to Friday.
      </p>
      {#if !data?.user}
        <a
          href="/register"
          class="mt-10 btn bg-[#fff] border border-gray-600 sm:hover:bg-gray-300 transition duration-100 btn-md w-full rounded-md m-auto text-black font-semibold text-[1rem]"
        >
          <span class="text-[1rem] sm:text-lg">Sign Up</span>
        </a>
      {/if}
    </div>
    <div class="hidden md:block">
      <img
        src={logo}
        class="w-auto max-w-[300px] h-fit"
        alt="Morning bullets preview"
      />
    </div>
  </main>
</div>
