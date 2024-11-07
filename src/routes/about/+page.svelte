<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";

  export let data;
  /*
  import { intersect } from 'svelte-intersection-observer-action';

  
  const threshold = 0.4 // change the threshold value to 0.4 for 40%
	const rootMargin = '-0px 0px'
	const intersectOptions = { callback, threshold, rootMargin }
	function callback(entry: IntersectionObserverEntry) {
		if (entry.intersectionRatio > threshold) {
      entry.target.classList.remove('invisible')
			entry.target.classList.add('')
    }
  }
  */

  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;
</script>

<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} About
    · stocknear</title
  >
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta
    name="description"
    content="Welcome to Stocknear — a site that aims to be the internet's best source of free stock data and information for small investors."
  />
  <!-- Other meta tags -->
  <meta property="og:title" content="About · stocknear" />
  <meta
    property="og:description"
    content="Welcome to Stocknear — a site that aims to be the internet's best source of free stock data and information for small investors."
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="About · stocknear" />
  <meta
    name="twitter:description"
    content="Welcome to Stocknear — a site that aims to be the internet's best source of free stock data and information for small investors."
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<body>
  <div class="w-full max-w-4xl overflow-hidden m-auto min-h-screen pt-10 mb-40">
    <!--Start Mission-->
    <div
      class="bg-[#09090B] w-full hover:border-slate-500 border-slate-600 h-auto sm:p-10 mt-3"
    >
      <div class="text-white text-3xl sm:text-5xl text-center p-3 sm:mt-5">
        <span class="font-bold">
          A stock analysis platform by the users, for the users.
        </span>
      </div>

      <div class="text-white text-[1rem] sm:text-lg mt-3 text-center px-5">
        Our mission is to create the first large-scale stock analysis platform
        in which the platform's interests are aligned with those of the user—a
        platform founded on ethical design principles. At the heart of these
        principles is the concept of complete transparency.

        <!-- Start Image -->
        <div class="m-auto flex justify-center mt-6">
          <div class="relative">
            <div
              class="z-1 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <img
                class="w-24 sm:w-28 mr-4"
                src={cloudFrontUrl + "/assets/globe.png"}
                alt="logo"
                loading="lazy"
              />
            </div>
            <svg
              id="visual"
              viewBox="0 0 960 540"
              width="380"
              height="200"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              version="1.1"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="12" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g transform="translate(506.6556351091302 253.49315711627338)">
                <path
                  d="M141.5 -60.2C185.5 -5.4 224.8 73.5 200.5 122.1C176.1 170.7 88 188.8 -4.7 191.5C-97.4 194.3 -194.9 181.5 -236.6 122.9C-278.3 64.3 -264.3 -40.1 -215.6 -97.5C-166.9 -155 -83.4 -165.5 -17.4 -155.5C48.7 -145.5 97.4 -114.9 141.5 -60.2"
                  fill="#1E40AF"
                  stroke-width="10"
                  filter="url(#glow)"
                ></path>
              </g>
            </svg>
          </div>
        </div>
        <!-- End Image -->
      </div>
    </div>
    <!--End Mission-->

    <div
      class="bg-[#09090B] w-full hover:border-slate-500 border-slate-600 h-auto pl-1 pr-1 sm:pl-0 sm:pr-0 pb-10 mb-8"
    >
      <div class="text-3xl sm:text-5xl text-white text-center p-3">
        <span class="font-bold"> Proudly Open Source </span>
      </div>

      <div
        class="text-[1rem] sm:text-lg text-white text-center w-11/12 sm:w-1/2 m-auto mb-8"
      >
        Stocknear is committed to open source & transparency. You can also run
        it locally or self-hosted.
      </div>

      <div class="w-11/12 sm:w-1/2 m-auto text-center">
        <a
          href="https://github.com/stocknear"
          rel="noopener noreferrer"
          target="_blank"
          class="w-fit sm:w-54 inline-flex animate-shine items-center justify-center rounded-xl text-sm border border-neutral-900 bg-[linear-gradient(110deg,#252626,55%,#fff,45%,#252626)] bg-[length:200%_100%] px-4 py-2 font-medium transition-colors"
        >
          <div class="m-auto flex-shrink-0 flex justify-center items-center">
            <svg
              class="w-8 h-8 sm:w-10 sm:h-10"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              ><path
                fill="#fff"
                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
              /></svg
            >

            <span class="text-white text-[1rem] ml-2 font-semibold">
              stocknear
              {data?.getFrontendStars + data?.getBackendStars}
            </span>
            <svg
              class="ml-1 w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              ><path
                fill="#fff"
                d="m18.7 4.627l2.247 4.31a2.27 2.27 0 0 0 1.686 1.189l4.746.65c2.538.35 3.522 3.479 1.645 5.219l-3.25 2.999a2.225 2.225 0 0 0-.683 2.04l.793 4.398c.441 2.45-2.108 4.36-4.345 3.24l-4.536-2.25a2.282 2.282 0 0 0-2.006 0l-4.536 2.25c-2.238 1.11-4.786-.79-4.345-3.24l.793-4.399c.14-.75-.12-1.52-.682-2.04l-3.251-2.998c-1.877-1.73-.893-4.87 1.645-5.22l4.746-.65a2.23 2.23 0 0 0 1.686-1.189l2.248-4.309c1.144-2.17 4.264-2.17 5.398 0"
              /></svg
            >
          </div>
        </a>

        <div class="text-white text-sm font-semibold font-mono mt-5">
          Leave a star to support us
        </div>
      </div>
    </div>

    <!-- Start Section-->
    <div
      class="bg-[#09090B] w-full hover:border-slate-500 border-slate-600 h-auto pl-1 pr-1 sm:pl-0 sm:pr-0 pb-10 mb-8"
    >
      <div
        class="text-3xl sm:text-5xl text-white text-center p-3 mt-10 sm:mt-5"
      >
        <span class="font-bold"> No ads. No tracking. </span>
      </div>

      <div class="text-white text-[1rem] sm:text-lg mt-3 text-center px-5">
        Stocknear has no ads or affiliate marketing, or tracking. Your attention
        and data are never monetized. If you're skeptical, just look at our code <a
          href="https://github.com/stocknear"
          rel="noopener noreferrer"
          target="_blank"
          class="text-blue-400 sm:hover:text-white sm:hover:underline">here</a
        >.
      </div>
    </div>
    <!--End Section-->

    <!-- Start Section-->
    <div
      class="bg-[#09090B] w-full hover:border-slate-500 border-slate-600 h-auto pb-10 mb-8"
    >
      <div
        class="text-3xl sm:text-5xl text-white text-center p-3 mt-10 sm:mt-5"
      >
        <span class="font-bold"> No Dark Patterns </span>
      </div>

      <div class="text-white text-[1rem] sm:text-lg mt-3 text-center px-5">
        On Stocknear, you won't encounter intrusive pop-ups prompting you to
        sign up unless it's essential for accessing all platform features. We
        don't manipulate you into using our platform more than you want to. If
        you wish to cancel your subscription, there's no survey to fill out; you
        can cancel it in just 2 seconds.
      </div>
    </div>
    <!--End Section-->

    <!--Start Why we need this -->
    <div
      class="bg-[#09090B] w-full hover:border-slate-500 border-slate-600 h-auto pb-10 mb-8"
    >
      <div
        class="text-3xl sm:text-5xl text-white text-center p-3 mt-10 sm:mt-5"
      >
        <span class="font-bold"> What we offer </span>
      </div>

      <div
        class="text-white text-[1rem] sm:text-lg mt-3 text-center pl-3 pr-3 sm:pl-10 sm:pr-10"
      >
        We provide retail traders with high-quality, accurate data that is only
        available to hedge funds and institutional investors. By bridging the
        gap between <span class="text-[#fff] font-semibold italic"
          >Wall Street</span
        >
        and
        <span class="text-[#fff] font-semibold italic">Retail Traders</span>, we
        enhance your stock analysis with a wide range of data sources. Take
        control of your investments, make informed decisions, and execute
        profitable trades using our comprehensive data presented in an intuitive
        UI.
        <!-- Start Image -->
        <div class="m-auto flex justify-center mt-5">
          <div class="relative">
            <div
              class="z-1 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <img
                class="w-20 mr-8"
                src={cloudFrontUrl + "/assets/no_money_logo.png"}
                alt="logo"
                loading="lazy"
              />
            </div>
            <svg
              id="visual"
              viewBox="0 0 960 540"
              width="380"
              height="200"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              version="1.1"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="12" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g transform="translate(506.6556351091302 253.49315711627338)">
                <path
                  d="M141.5 -60.2C185.5 -5.4 224.8 73.5 200.5 122.1C176.1 170.7 88 188.8 -4.7 191.5C-97.4 194.3 -194.9 181.5 -236.6 122.9C-278.3 64.3 -264.3 -40.1 -215.6 -97.5C-166.9 -155 -83.4 -165.5 -17.4 -155.5C48.7 -145.5 97.4 -114.9 141.5 -60.2"
                  fill="#1E40AF"
                  stroke-width="10"
                  filter="url(#glow)"
                ></path>
              </g>
            </svg>
          </div>
        </div>
        <!-- End Image -->
      </div>
    </div>
    <!--End Why we need this -->

    <!--Start Why we need this -->
    <div
      class="bg-[#09090B] w-full bg-[#09090B] sm:border-t hover:border-slate-500 border-slate-600 h-auto sm:p-10 mt-3 mb-20 sm:mb-8"
    >
      <div
        class="text-3xl sm:text-5xl font-bold text-white text-center p-3 mt-10 sm:mt-5"
      >
        <span class="font-bold"> Why choose us </span>
      </div>

      <div
        class="-mt-10 sm:mt-0 text-white text-[1rem] sm:text-lg text-center pl-3 pr-3 sm:pl-10 sm:pr-10"
      >
        <br class="mb-8 sm:mb-5" />
        We love data and want to understand what drives the stock market. We collaborate
        with top data vendors to provide clear and actionable insights, giving you
        a competitive advantage over other traders.
        <br />
        <br />

        As a physicist, I prioritize transparency and rigorous analysis. During
        my PhD in theoretical particle physics, I developed models to describe
        New Physics effects beyond our current knowledge of the universe, as
        shown by my publication record
        <a
          href="https://inspirehep.net/authors/1838037"
          target="_blank"
          class="hover:text-white text-blue-400 underline">here</a
        >.
        <br class="mb-5" />
        Unlike most financial websites run by programmers, I combine my programming
        skills with a scientific approach.
        <br />
        <br />
        If you find value in stocknear's approach to tackling stock analysis tasks,
        that's great. If not, I wish you all the best on your trading journey and
        maybe we will see us again in the future.
        <!-- Start Image -->
        <div class="m-auto flex justify-center mt-5">
          <div class="relative">
            <div class="z-2 absolute mt-3">
              <img
                class="w-56 sm:w-64 ml-16 sm:ml-10 mt-12 sm:mt-8"
                src={cloudFrontUrl + "/assets/community_logo.png"}
                alt="logo"
                loading="lazy"
              />
            </div>
            <svg
              id="visual"
              viewBox="0 0 960 540"
              width="380"
              height="200"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              version="1.1"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="12" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g transform="translate(506.6556351091302 253.49315711627338)">
                <path
                  d="M141.5 -60.2C185.5 -5.4 224.8 73.5 200.5 122.1C176.1 170.7 88 188.8 -4.7 191.5C-97.4 194.3 -194.9 181.5 -236.6 122.9C-278.3 64.3 -264.3 -40.1 -215.6 -97.5C-166.9 -155 -83.4 -165.5 -17.4 -155.5C48.7 -145.5 97.4 -114.9 141.5 -60.2"
                  fill="#1E40AF"
                  stroke-width="10"
                  filter="url(#glow)"
                ></path>
              </g>
            </svg>
          </div>
        </div>
        <!-- End Image -->
      </div>
    </div>
    <!--End Why we need this -->

    <!--Start Team -->
    <div
      class="bg-[#09090B] w-full bg-[#09090B] sm:border-t hover:border-slate-500 border-slate-600 h-auto sm:p-10 mt-3"
    >
      <div
        class="text-3xl sm:text-5xl font-bold text-white text-center p-3 mt-10 sm:mt-5"
      >
        Team
      </div>

      <div class="text-white text-[1rem] sm:text-lg mt-3 text-center">
        <!-- Team members -->
        <div class="sm:flex sm:flex-wrap sm:justify-center mb-4">
          <!-- 1st member -->
          <div class="m-auto flex justify-center items-center mt-6">
            <div class="flex flex-col justify-center items-center w-full">
              <img
                class="rounded-full mb-4 w-20 sm:w-28"
                src={cloudFrontUrl + "/assets/mrahimi.webp"}
                alt="Founder"
                loading="lazy"
              />
              <h4 class="text-lg mb-1">Dr. Muslem Rahimi</h4>
              <div class="text-white mb-6">Chief of Nothing</div>
              <span class="text-[1.1rem] p-3 text-gray-300">
                During my PhD in physics, I was developing models to describe
                New Physics. Now I'm developing a stock analysis platform to
                help small investors.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--End Team -->
  </div>
</body>
