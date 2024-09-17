<script lang='ts'>
    import { numberOfUnreadNotification } from '$lib/store';
   import { goto } from '$app/navigation';
  import { page } from '$app/stores';

    export let data;




  function handleMode(i) {
    activeIdx = i;
    if(activeIdx === 0) {
      goto("/industry")
    } else if (activeIdx === 1) {
      goto("/industry/sectors")
    } else if (activeIdx === 2) {
      goto("/industry/all")
    }
  }
  
  const tabs = [
      {
        title: "Overview",
      },
      {
        title: "Sectors",
      },
      {
        title: "Industries",
      },
    ];
  
let activeIdx = 0;

  // Subscribe to the $page store to reactively update the activeIdx based on the URL
  $: if ($page.url.pathname === '/industry') {
    activeIdx = 0;
  } else if ($page.url.pathname.startsWith('/industry/sectors')) {
    activeIdx = 1;
  } else if ($page.url.pathname.startsWith('/industry/all')) {
    activeIdx = 2;
  }

</script>
        


<svelte:head>
  <title> {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ''} Industry · stocknear</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta name="description" content="Lists of stocks industry and sectors.">
  <!-- Other meta tags -->
  <meta property="og:title" content="Industry · stocknear"/>
  <meta property="og:description" content="Lists of stocks industry and sectors.">
  <meta property="og:type" content="website"/>
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="Industry · stocknear"/>
  <meta name="twitter:description" content="Lists of stocks industry and sectors.">
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>
    
    
          
<section class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 pb-40">
            
            <div class="text-sm sm:text-[1rem] breadcrumbs ml-3 lg:ml-10">
                <ul>
                  <li><a href="/" class="text-gray-300">Home</a></li> 
                  <li><span class="text-gray-300">Industry</span></li>
                </ul>
            </div>



        
        <div class="mt-10 sm:mt-5 w-full m-auto mb-10 bg-[#09090B]  lg:px-10 overflow-hidden">
        
        
            <!--Start Top Winners/Losers-->
            <div class="flex flex-col justify-center items-center">
              
              <div class="ml-4 sm:ml-2 text-start w-full text-white mb-1 text-2xl sm:text-3xl font-semibold">
                Stock Sectors & Industries
              </div>
    
              <div class="border-b mt-2 border-blue-400 w-full mb-7" />
                <div class="ml-4 sm:ml-0 w-full mb-4">
                    <div class="bg-[#313131] w-fit relative mr-auto flex flex-wrap items-center justify-center rounded sm:rounded-lg p-1 -mt-3">
                    {#each tabs as item, i}
                    <button
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
                        <span class="relative text-[1rem] block font-semibold duration-200 text-white">
                            {item.title}
                        </span>
                    </button>
                    {/each}
                    </div>
                </div>

              <div class="flex justify-center w-full m-auto overflow-hidden">
      
            <main class="w-full">
              <slot />
            </main>

          

            </div>


          
          </div>
    
    
        </div>
     
        
        </section>
        
        