<script lang='ts'>
import { numberOfUnreadNotification } from '$lib/store';

import {screenWidth } from '$lib/store';
//import MiniPlot from '$lib/components/MiniPlot.svelte';
import { abbreviateNumber } from '$lib/utils';
import { goto } from '$app/navigation';
import ArrowLogo from "lucide-svelte/icons/move-up-right";

let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;



export let data;

    let isLoaded = false;

let optionsWatchlist = data?.getOptionsWatchlist

    function formatDate(dateStr) {
      // Parse the input date string (YYYY-mm-dd)
      var date = new Date(dateStr);
    
      // Get month, day, and year
      var month = date.getMonth() + 1; // Month starts from 0
      var day = date.getDate();
      var year = date.getFullYear();
    
      // Extract the last two digits of the year
      var shortYear = year.toString().slice(-2);
    
      // Add leading zeros if necessary
      month = (month < 10 ? "0" : "") + month;
      day = (day < 10 ? "0" : "") + day;
    
      var formattedDate = month + "/" + day + "/" + year;
    
      return formattedDate;
    }
    
    function formatTime(timeString) {
      // Split the time string into components
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
    
      // Determine AM or PM
      const period = hours >= 12 ? 'PM' : 'AM';
    
      // Convert hours from 24-hour to 12-hour format
      const formattedHours = hours % 12 || 12; // Converts 0 to 12 for midnight
    
      // Format the time string
      const formattedTimeString = `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
    
      return formattedTimeString;
    }
    
</script>



<svelte:head>
  <title> {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ''} Options Watchlist · stocknear</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta name="description" content="A option watchlist tracker tool. Add stocks and ETFs to keep track of their performance.">
  <!-- Other meta tags -->
  <meta property="og:title" content="Options Watchlist · stocknear"/>
  <meta property="og:description" content="A option watchlist tracker tool. Add stocks and ETFs to keep track of their performance.">
  <meta property="og:type" content="website"/>
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="Options Watchlist · stocknear"/>
  <meta name="twitter:description" content="A option watchlist tracker tool. Add stocks and ETFs to keep track of their performance.">
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>
    

      
    
    
        
    
    
<section class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 pb-40 lg:px-3">
          
  <div class="text-sm sm:text-[1rem] breadcrumbs ml-4">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Options Watchlist</li>
    </ul>
  </div>
          
  <div class="w-full overflow-hidden m-auto mt-5">
    
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden ">
        <div class="relative flex justify-center items-start overflow-hidden w-full">


            <main class="w-full lg:w-3/4 lg:pr-5">


              <div class="w-full m-auto bg-[#27272A] sm:rounded-xl h-auto pl-10 pr-10 pt-5 sm:pb-10 sm:pt-10 mt-3 mb-8">
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
      <div class="relative m-auto mb-5 mt-5 sm:mb-0 sm:mt-0">
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
          <img class="w-24" src={cloudFrontUrl+"/assets/options_logo.png"} alt="logo" loading='lazy'>
        </div>
      </div>
      <!-- End Column -->
  
    </div>
  </div>
    

    {#if optionsWatchlist?.length !== 0}

    <!--Start Table-->
            <div class="w-screen sm:w-full rounded-lg overflow-hidden overflow-x-scroll no-scrollbar">
                <table class="table table-pin-cols table-sm table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4 overflow-x-auto">
            <thead>
              <tr class="">
                <td class="text-slate-200 font-semibold text-sm text-start">Time</td>
                <td class="text-slate-200 font-semibold text-sm text-start">Date</td>
                <td class="text-slate-200 font-semibold text-sm text-end">Expiry</td>
                <td class="text-slate-200 font-semibold text-sm text-end">Strike</td>
                <td class="text-slate-200 font-semibold text-sm text-end">C/P</td>
                <td class="text-slate-200 font-semibold text-sm text-start">Sent.</td>
                <td class="text-slate-200 font-semibold text-sm text-start">Exec.</td>
                <td class="text-slate-200 font-semibold text-sm text-end">Spot</td>
                <td class="text-slate-200 font-semibold text-sm text-end">Price</td>
                <td class="text-slate-200 font-semibold text-sm text-end">Prem.</td>
                <td class="text-slate-200 font-semibold text-sm text-start">Type</td>
                <td class="text-slate-200 font-semibold text-sm text-end">Vol.</td>
                <td class="text-slate-200 font-semibold text-sm text-end">OI</td>
              </tr>
            </thead>
            <tbody>
              {#each optionsWatchlist as item}
              <!-- row -->
              <tr class="odd:bg-[#27272A] border-b-[#09090B]">
                
                <td class="text-white text-sm text-start whitespace-nowrap">
                  {formatTime(item?.time)}
                </td>

                <td class="text-white text-sm sm:text-[1rem] text-start">
                  {formatDate(item?.date)}
                </td>

                <td class="text-white text-sm sm:text-[1rem] text-end">
                  {item?.dte < 0 ? 'expired' : item?.dte +'d'}
                </td>
                
                <td class="text-sm sm:text-[1rem] text-end text-white">
                  {item?.strike_price}
                </td>

                <td class="text-sm sm:text-[1rem] {item?.put_call === 'Calls' ? 'text-[#00FC50]' : 'text-[#FC2120]'} text-start">
                  {item?.put_call}
                </td>

                <td class="text-sm sm:text-[1rem] {item?.sentiment === 'Bullish' ? 'text-[#00FC50]' : item?.sentiment === 'Bearish' ? 'text-[#FC2120]' : 'text-[#C6A755]'} text-start">
                  {item?.sentiment}
                </td>
                 <td class="text-sm sm:text-[1rem] text-white text-start whitespace-nowrap">
                  {item?.execution_estimate}
                </td>

                <td class="text-sm sm:text-[1rem] text-end text-white">
                  {item?.underlying_price}
                </td>
              
              <td class="text-sm sm:text-[1rem] text-end text-white">
                {item?.price}
              </td>
              
              <td class="text-sm sm:text-[1rem] text-end font-medium {item?.put_call === 'Puts' ? 'text-[#CB281C]' : 'text-[#0FB307]'} ">
                {abbreviateNumber(item?.cost_basis)}
              </td>

              <td class="text-sm sm:text-[1rem] text-start {item?.type === 'Sweep' ? 'text-[#C6A755]' : 'text-[#976DB7]'}">
                {item?.type}
              </td>



              <td class="text-white text-end">
                  {new Intl.NumberFormat("en", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                  }).format(item?.volume)}
              </td>

              <td class="text-white text-end">
                {new Intl.NumberFormat("en", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
              }).format(item?.open_interest)}
              </td>


        

              </tr>
              
          
              {/each}

            </tbody>
        </table>
        
        
                
        
        
              </div>
            <!--End Table-->
    {:else}
   <div class="flex flex-col justify-center items-center m-auto pt-8">
            <span class="text-white font-bold text-white text-2xl sm:text-3xl">
                Empty Options List
            </span>

            <span class="text-white text-sm sm:text-lg font-medium m-auto p-4 text-center">
                Add your unusual options contracts and start tracking them now!
            </span>
            {#if !data?.user}
            <a class="w-64 flex mt-5 justify-center items-center m-auto btn text-white bg-purple-600 sm:hover:bg-purple-700 transition duration-150 ease-in-out group" href="/register">
                <span>Get Started</span>
                <span class="tracking-normal group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g transform="rotate(90 12 12)"><g fill="none"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="white" d="M13.06 3.283a1.5 1.5 0 0 0-2.12 0L5.281 8.939a1.5 1.5 0 0 0 2.122 2.122L10.5 7.965V19.5a1.5 1.5 0 0 0 3 0V7.965l3.096 3.096a1.5 1.5 0 1 0 2.122-2.122L13.06 3.283Z"/></g></g></svg>
                </span>
            </a>
            {:else}
            <a href="/options-flow" class="w-64 flex mt-5 justify-center items-center m-auto btn text-white bg-purple-600 sm:hover:bg-purple-700 transition duration-150 ease-in-out group">
                <span class="font-semibold text-[1rem]">Follow the Whales 
                    <svg class="inline-block -mt-2 -ml-1 w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="none"><path fill="#00a6ed" d="M24.04 6.508C27.007 9.5 29 12.953 29 16.468c0 6.422-1.95 10.392-6.648 12.315a16 16 0 0 1-1.652-.318l-.012.582c-.105.563-.485 1.352-1.625.703c-.84-.478-2.112-1.55-2.33-4.281c-.511-1.271-.617-2.91-.733-4.969c-.164-2.91-3.078-3.89-5-4c-1.84-.105-8.316-.467-8.869-.498a15 15 0 0 1-.01-1.111c0-2.66 3.363-4.9 5.713-4.9h6.55c3.46 0 6.27 2.81 6.27 6.27c-.17 2.411 3.373 3.405 3.82.78c.492-2.896-.591-6.166-2.435-8.494c-.195-.047-.308-.047-.445.047c-1.258 1.258-2.16 1.312-3.852.914a1 1 0 0 0-.239-.103c-.228-.077-.435-.147-.331-.608c.14-.625 1.125-1.719 1.125-1.719c.773-.906 1.758-1.11 2.226-1.055c.402.047.515-.068.58-.135l.03-.029c.065-.051.133-.437.133-.437c-.164-.875.043-1.678.547-2.383c0 0 .882-1.266 1.687-1.344c.72-.07.803.37.879.768q.012.071.027.139c.334 1.535.17 1.902-.215 2.765c-.065.147-.137.308-.214.492c-.13.308-.058.434.038.605zM8.219 29.938c-1.735 0-3.64-2.438-3.11-5.922c.313.2 2.615 2.052 3.75 3.14c.329.844.11 2.782-.64 2.782"/><path fill="#1c1c1c" d="M15.517 15a.61.61 0 0 1-.604-.604v-.758c0-.33.274-.604.604-.604s.604.274.604.604v.758a.604.604 0 0 1-.604.604"/><path fill="#aeddff" d="M20.706 28.208q.745.278 1.692.556q-.84.348-1.8.608q.06-.166.09-.325zm-3.973-4.468c-.107-.771-.157-1.671-.217-2.74l-.016-.281c-.164-2.911-3.766-4.61-5.687-4.719c-1.839-.105-8.138-.01-8.682 0c.339 7.399 6.034 14.639 13.885 14.095a27 27 0 0 0 3.007-.367c-1-.583-2.564-2.007-2.29-5.988"/></g></svg>
                </span>
            </a>
            {/if}

        </div>
    {/if}

    

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
  
    
    

