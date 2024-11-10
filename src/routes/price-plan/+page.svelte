<script>
  import { numberOfUnreadNotification, screenWidth } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Price
    Plan
  </title>
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden pb-20 min-h-screen pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Price Plan</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Price Plan
            </h1>
          </div>

          <div class="w-full bg-[#09090B] m-auto">
            <div class="h-full">
              <h2 class="text-white text-xl font-semibold mb-5">
                Hi everyone 👋,
              </h2>
              <p class="text-white mb-5 text-[1rem]">
                After gathering feedback from users and analyzing our data at
                the $1.99/month price point, I wanted to share some insights and
                plans with you.
                <br />
                <br />
                At our current rate, Stocknear is on track to reach profitability
                in about 2–2.5 years, a timeline that may not be sustainable for
                our platform. To give us a stronger chance of sustaining the platform
                over the next 12 months, we're considering a new price point of
                <strong>$4.99/month</strong>, which still keeps us among the
                most affordable option for premium Wall Street data.
              </p>
              <div class="text-white mb-5 text-[1rem]">
                If you're already a Pro Member, your current rate will remain
                locked in as long as your subscription stays active.
                <br />
                <br />
                This new price plan will take effect on
                <strong>Monday, November 11, 2024</strong>. Now is the last
                chance to secure the
                <a href="/pricing" class="sm:hover:text-white text-blue-400"
                  >Pro Subscription</a
                >
                at <strong>$1.99/month</strong>—after this, the introductory
                price will no longer be available.
                <br />
                <br />
                To my Pro Members, I want to take a moment to say thank you. You're
                the reason I’m doing this. The mission of Stocknear has always been
                to support small retail investors who may not have the resources
                to pay for high-priced subscriptions. Many of you have supported
                me through valuable feedback, bug reports, donations, and by subscribing
                to the platform. Hearing how Stocknear has helped so many of you
                has been incredibly motivating. Thank you for sticking with me!

                <br />
                <br />

                Cheers,
                <br />
                <br /> Your Chief of Nothing
              </div>
            </div>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href="/pricing"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Pro Subscription
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Upgrade now for unlimited access to all data and tools.
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href="/about"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  About Us
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Learn more about why we're doing this here
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href="/contact"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Contact Us
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Let me know if you need something
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
