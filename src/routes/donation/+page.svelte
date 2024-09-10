<script>
import { numberOfUnreadNotification } from '$lib/store';
import ArrowLogo from "lucide-svelte/icons/move-up-right";
import { goto } from '$app/navigation';

let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;

</script>



<svelte:head>
  <title> {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ''} Donation · stocknear</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <!-- Other meta tags -->
  <meta property="og:title" content="Donation · stocknear"/>
  <meta property="og:type" content="website"/>
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="Donation · stocknear"/>
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>
	    


<section class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 pb-40">
     
  
      <div class="text-sm sm:text-[1rem] breadcrumbs ml-4">
        <ul>
          <li><a href="/" class="text-gray-300">Home</a></li> 
          <li class="text-gray-300">Donation</li>
        </ul>
      </div>
    
      <div class="w-full overflow-hidden m-auto mt-5">
        
        <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden ">
            <div class="relative flex justify-center items-start overflow-hidden w-full">
                
              
    <main class="w-full lg:w-3/4 lg:pr-5">
  
      <div class="w-full m-auto sm:bg-[#27272A] sm:rounded-xl h-auto pl-10 pr-10 pt-5 sm:pb-10 sm:pt-10 mt-3 mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
    
        <!-- Start Column -->
        <div>
        <div class="flex flex-row justify-center items-center">
            <h1 class="text-3xl sm:text-4xl text-white text-center font-bold mb-5">
            Donation
            </h1>
        </div>

        <span class="text-white text-[1rem] font-medium text-center flex justify-center  items-center ">
            Apes together donate strong—because when we unite our bananas, we can move mountains!
        </span>
        </div>
        <!-- End Column -->
    
        <!-- Start Column -->
        <div class="relative m-auto">
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
        
        
        <div class="z-1 absolute top-5">
            <img class="w-f ml-0" src={cloudFrontUrl+'/assets/donation_logo.png'} alt="logo">
        </div>
        </div>
        <!-- End Column -->
    
    </div>
    
    </div>

    

    <div class="card w-full bg-[#09090B] border-t sm:border rounded-none sm:rounded-lg border-gray-600 m-auto ">
        <div class="card-body">
            <h2 class="text-white text-2xl font-semibold">
                Hey,
            </h2>
            <p class="text-white mb-5 text-[1rem]">
                I guess you are here to see if I can convince you to donate or not.
                Well, you don't have to, but if you love the idea of stocknear helping people who don't have much and want to get high quality data for affordable prices 
                <br>
                <br>
            </p>
        
            <h2 class="text-white text-2xl font-semibold">
                Buy me a Coffee 
            </h2>
            <p class="text-white mb-5 text-[1rem]">
                I guess you are here to see if I can convince you to donate or not.
                Well, you don't have to, but if you love the idea of stocknear helping people who don't have much and want to get high quality data for affordable prices 
                <br>
                <br>
            </p>
        </div>
      </div>

        
     

</main>


<aside class="hidden lg:block relative fixed w-1/4 ml-4">        

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

  <div on:click={() => goto('/about')} class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer">
      <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
          <div class="w-full flex justify-between items-center p-3 mt-3">
          <h2 class="text-start text-xl font-semibold text-white ml-3">
          About Us ⚡
          </h2>
          <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0"/>
          </div>
          <span class="text-white p-3 ml-3 mr-3">
              Learn more about why we're doing this here
          </span>
      </div>
  </div>

  <div on:click={() => goto('/contact')} class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer">
      <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
          <div class="w-full flex justify-between items-center p-3 mt-3">
          <h2 class="text-start text-xl font-semibold text-white ml-3">
          Contact Us 💬
          </h2>
          <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0"/>
          </div>
          <span class="text-white p-3 ml-3 mr-3">
              Let me know if you need something
          </span>
      </div>
  </div>

</aside>

</div>
</div>


</div>



</section>

