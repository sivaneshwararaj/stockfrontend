<script lang='ts'>
import ScrollToTop from '$lib/components/ScrollToTop.svelte';
import ArrowLogo from "lucide-svelte/icons/move-up-right";
import { goto } from '$app/navigation';
import { page } from '$app/stores';

export let data;
let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;


function handleMode(i) {
    activeIdx = i;
    if(activeIdx === 0) {
      goto("/watchlist/stocks")
    } else if (activeIdx === 1) {
      goto("/watchlist/options")
    }
  }
  
  const tabs = [
      {
        title: "Stocks",
      },
      {
        title: "Options",
      },
    ];
  
let activeIdx = 0;

  // Subscribe to the $page store to reactively update the activeIdx based on the URL
  $: if ($page.url.pathname === '/watchlist/stocks') {
    activeIdx = 0;
  } else if ($page.url.pathname.startsWith('/watchlist/options')) {
    activeIdx = 1;
  } 

</script>

<!-- HEADER FOR BETTER SEO -->
<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
</svelte:head>




<section class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 pb-40 lg:px-3">
          
  <div class="text-sm sm:text-[1rem] breadcrumbs ml-4">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Watchlist</li>
    </ul>
  </div>
          
  <div class="w-full overflow-hidden m-auto mt-5">
    
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden ">
        <div class="relative flex justify-center items-start overflow-hidden w-full">


            <main class="w-full lg:w-3/4 lg:pr-5">
             
              <div class="w-full  m-auto sm:bg-[#27272A] sm:rounded-xl h-auto pl-10 pr-10 pt-5 sm:pb-10 sm:pt-10 mt-3 mb-8">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <!-- Start Column -->
                    <div>
                        <div class="flex flex-row justify-center items-center">
                        <h1 class="text-4xl sm:text-5xl text-white font-bold mb-5">
                            Watchlist
                        </h1>
                        </div>

                        <span class="text-white text-md font-medium text-center flex justify-center items-center ">
                        Monitor the performance and recent updates of your favorite options.
                        </span>
                    </div>
                    <!-- End Column -->
                
                    <!-- Start Column -->
                    <div class="hidden sm:block relative m-auto mb-5 mt-5 sm:mb-0 sm:mt-0">
                        <svg class="w-40 -my-5" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <filter id="glow">
                            <feGaussianBlur stdDeviation="5" result="glow"/>
                            <feMerge>
                                <feMergeNode in="glow"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                            </filter>
                        </defs>
                        <path fill="#1E40AF" d="M57.6,-58.7C72.7,-42.6,81.5,-21.3,82,0.5C82.5,22.3,74.7,44.6,59.7,60.1C44.6,75.6,22.3,84.3,0,84.3C-22.3,84.2,-44.6,75.5,-61.1,60.1C-77.6,44.6,-88.3,22.3,-87.6,0.7C-86.9,-20.8,-74.7,-41.6,-58.2,-57.7C-41.6,-73.8,-20.8,-85.2,0.2,-85.4C21.3,-85.6,42.6,-74.7,57.6,-58.7Z" transform="translate(100 100)" filter="url(#glow)" />
                        </svg>
                        
                        <div class="z-1 absolute top-3 right-10 ">
                        <img class="w-24" src={cloudFrontUrl+(activeIdx === 0 ? "/assets/watchlist_logo.png" : "/assets/options_logo.png") } alt="logo" loading='lazy'>
                        </div>
                    </div>
                    <!-- End Column -->
                </div>
          
               
          
          
              </div>
  


                <div class="bg-[#313131] w-52 sm:w-fit relative m-auto sm:m-0 sm:mr-auto flex sm:flex-wrap items-center justify-center rounded-lg p-1 -mt-3">
                    {#each tabs as item, i}
                    <a  href={i === 0 ? '/watchlist/stocks' : '/watchlist/options'}
                        on:click={() => handleMode(i)}
                        class="group relative z-[1] rounded-full px-6 py-1 {activeIdx === i
                        ? 'z-0'
                        : ''} "
                    >
                        {#if activeIdx === i}
                            <div
                            class="absolute inset-0 rounded-lg bg-purple-600"
                            ></div>
                        {/if}
                        <span class="relative text-[1rem] sm:text-lg block font-semibold duration-200 text-white">
                            {item.title}
                        </span>
                    </a>
                    {/each}
                    </div>




              <div class="sm:border-b mt-5 border-slate-700" />

                <slot />
                
                <ScrollToTop />
                
            </main>

             <aside class="hidden lg:block relative fixed w-1/4 ml-4">        
  
                {#if data?.user?.tier !== 'Pro' || data?.user?.freeTrial}
                <div on:click={() => goto('/pricing')} class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer">
                    <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
                        <div class="w-full flex justify-between items-center p-3 mt-3">
                        <h2 class="text-start text-xl font-semibold text-white ml-3">
                        Pro Subscription 🔥
                        </h2>
                        <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0"/>
                        </div>
                        <span class="text-white p-3 ml-3 mr-3">
                            Upgrade now for unlimited access to all data and tools.
                        </span>
                    </div>
                </div>
                {/if}
            
                <div on:click={() => goto('/price-alert')} class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer">
                    <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
                        <div class="w-full flex justify-between items-center p-3 mt-3">
                        <h2 class="text-start text-xl font-semibold text-white ml-3">
                        Price Alert ⏰
                        </h2>
                        <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0"/>
                        </div>
                        <span class="text-white p-3 ml-3 mr-3">
                            Customize your alerts to never miss out again
                        </span>
                    </div>
                </div>
            
                <div on:click={() => goto('/stock-screener')} class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer">
                    <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
                        <div class="w-full flex justify-between items-center p-3 mt-3">
                        <h2 class="text-start text-xl font-semibold text-white ml-3">
                        Stock Screener 🔎
                        </h2>
                        <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0"/>
                        </div>
                        <span class="text-white p-3 ml-3 mr-3">
                            Build your Stock Screener to find profitable stocks.
                        </span>
                    </div>
                </div>
            
            </aside>

      </div>
    </div>

  
  </div>
      
      
  
</section>
    
  
  
  