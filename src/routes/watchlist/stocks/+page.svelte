<script lang='ts'>
import { numberOfUnreadNotification } from '$lib/store';
//import { enhance } from '$app/forms';
import toast from 'svelte-french-toast';
import { onDestroy, onMount } from 'svelte';

import Input from '$lib/components/Input.svelte';
import WatchListCard from '$lib/components/WatchListCard.svelte';
import {switchWatchList } from '$lib/store';
import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
import { Button } from "$lib/components/shadcn/button/index.js";
import { writable } from 'svelte/store';

export let data;
let searchQuery = '';
let shouldLoadWorker = writable(false);


let indicatorList = ['Volume', 'Market Cap', 'Price', 'Change', 'EPS', 'PE'];
indicatorList = indicatorList.sort((a, b) => a.localeCompare(b));


let isLoaded = false;
let downloadWorker: Worker | undefined;
let displayWatchList;
let allList = data?.getAllWatchlist;
  

const handleDownloadMessage = (event) => {
    stockScreenerData = event?.data?.stockScreenerData;
    shouldLoadWorker.set(true);

};

const updateStockScreenerData = async () => {
    downloadWorker.postMessage({ indicatorList});
};
 

async function createWatchList(event) {
  event.preventDefault(); // prevent the default form submission behavior

  const formData = new FormData(event.target); // create a FormData object from the form

  const title = formData.get('title');

  if (!title || title?.length === 0) {
    toast.error('Title cannot be empty!', {
      style: 'border-radius: 200px; background: #333; color: #fff;',
    });
    return;
  }

  if (title?.length > 100) {
    toast.error('Title is too long. Keep it simple and concise bruv!', {
      style: 'border-radius: 200px; background: #333; color: #fff;',
    });
    return;
  }

  const postData = {};

  // Iterate through the FormData entries and populate the object
  for (const [key, value] of formData?.entries()) {
    postData[key] = value;
  }
  postData['path'] = 'create-watchlist'
  try {
    const response = await fetch('/api/fastify-post-data', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postData),
    }); // make a POST request to the server with the FormData object

    if (response.ok) {
      toast.success('Watchlist created successfully!', {
        style: 'border-radius: 200px; background: #333; color: #fff;',
      });

      
        const clicked = document.getElementById('addWatchlist');
        clicked?.dispatchEvent(new MouseEvent('click'));

        const anchor = document.createElement('a');
        anchor.href = '/watchlist/stocks';
        anchor.dispatchEvent(new MouseEvent('click'));
       
      
    } else {
      toast.error('Something went wrong. Please try again!', {
        style: 'border-radius: 200px; background: #333; color: #fff;',
      });
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('An error occurred. Please try again later.', {
      style: 'border-radius: 200px; background: #333; color: #fff;',
    });
  }
}



async function deleteWatchlist(event) {
  event.preventDefault(); // prevent the default form submission behavior

  const postData = {'watchListId': displayWatchList?.id, 'path': 'delete-watchlist'};

  try {
    
    const response = await fetch('/api/fastify-post-data', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postData),
    });

    const output = (await response.json())?.items;
    
  
    if (output === 'success') {
      toast.success('Watchlist deleted successfully!', {
        style: 'border-radius: 200px; background: #333; color: #fff;',
      });



      allList = allList?.filter(item => item?.id !== displayWatchList?.id);
      allList = [...allList];

      displayWatchList = allList[0];
      changeWatchList(displayWatchList);


      const clicked = document.getElementById('deleteWatchlist');
      clicked.dispatchEvent(new MouseEvent('click'));
       
      
    } else {
      toast.error('Something went wrong. Please try again!', {
        style: 'border-radius: 200px; background: #333; color: #fff;',
      });
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('An error occurred. Please try again later.', {
      style: 'border-radius: 200px; background: #333; color: #fff;',
    });
  }
}





function changeWatchList(newWatchList)
{
  displayWatchList = newWatchList;
  $switchWatchList = true;

}


onMount(async () => {
if(allList?.length !== 0)
    {
      displayWatchList = allList[0]
    }
    else {
      displayWatchList = '';
    }
  
    if (!downloadWorker) {
        const DownloadWorker = await import('./workers/downloadWorker?worker');
        downloadWorker = new DownloadWorker.default();
        downloadWorker.onmessage = handleDownloadMessage;
    }

isLoaded = true;

});

onDestroy( () => {
  $switchWatchList = false;
})


function handleWatchlistModal() {
  const closePopup = document.getElementById("addWatchlist");
  closePopup?.dispatchEvent(new MouseEvent('click'))
}

let testList = [];

function handleInput(event) {
    searchQuery = event.target.value?.toLowerCase() || '';
  
    setTimeout(() => {
        testList = [];

        if (searchQuery.length > 0) {
          
          const rawList = indicatorList
            testList = rawList?.filter(item => {
                const index = item?.toLowerCase();
                // Check if country starts with searchQuery
                return index?.startsWith(searchQuery);
            }) || [];
        }
    }, 50);
}

let checkedItems = new Set(indicatorList);

function isChecked(item) {
  return checkedItems?.has(item);
}

async function handleChangeValue(value) {
  if (checkedItems.has(value)) {
    checkedItems.delete(value);  // Remove the value if it's already in the Set
  } else {
    checkedItems?.add(value);     // Add the value if it's not in the Set
  }
    indicatorList = [...indicatorList]
}


</script>



<svelte:head>
  <title> {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ''} Stock Watchlist · stocknear</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta name="description" content="A stock watchlist tracker tool. Add stocks and ETFs to keep track of their performance.">
  <!-- Other meta tags -->
  <meta property="og:title" content="Stock Watchlist · stocknear"/>
  <meta property="og:description" content="A stock watchlist tracker tool. Add stocks and ETFs to keep track of their performance.">
  <meta property="og:type" content="website"/>
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="Stock Watchlist · stocknear"/>
  <meta name="twitter:description" content="A stock watchlist tracker tool. Add stocks and ETFs to keep track of their performance.">
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>
    

      
    
    
        
    
    
<section class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 pb-40 ">
          
  <div class="w-full overflow-hidden m-auto mt-5">
    
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden ">
        <div class="relative flex justify-center items-start overflow-hidden w-full">


            <main class="w-full">


    {#if isLoaded}


     <div class="flex w-full sm:w-[50%] md:block md:w-auto px-2 sm:px-0">
            <div class="hidden text-sm sm:text-[1rem] font-semibold text-white md:block sm:mb-2">
                My Watchlist
            </div>
            <div class="relative inline-block text-left w-full flex flex-row items-center">
                <DropdownMenu.Root >
                      <DropdownMenu.Trigger asChild let:builder>
                        <Button builders={[builder]}  class="min-w-[110px] w-fit border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-lg truncate">
                          <span class="truncate font-semibold text-white shadow-sm">{displayWatchList?.title !== undefined ? displayWatchList?.title : 'Create Watchlist'}</span>
                          <svg class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block" viewBox="0 0 20 20" fill="currentColor" style="max-width:40px" aria-hidden="true">
                              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                          </svg>
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content class="w-56 h-fit max-h-72 overflow-y-auto scroller">
                        <DropdownMenu.Label class="text-gray-400">
                          <DropdownMenu.Trigger asChild let:builder>
                          <Button on:click={handleWatchlistModal} builders={[builder]} class="p-0 -mb-2 -mt-2 text-sm inline-flex cursor-pointer items-center justify-center space-x-1 whitespace-nowrap text-base text-white bg-[#0909B] focus:outline-none sm:text-smaller">
                              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" style="max-width:40px" aria-hidden="true">
                                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                              </svg> 
                              <div class="text-sm text-start">New Watchlist</div>
                          </Button>
                          </DropdownMenu.Trigger>
                        </DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Group>
                          {#each allList as item}
                            <DropdownMenu.Item on:click={() => changeWatchList(item)} class="{item?.id === displayWatchList?.id ? 'bg-[#27272A]' : ''} cursor-pointer sm:hover:bg-[#27272A]">
                              {item?.title} ({item?.ticker?.length})
                            </DropdownMenu.Item>
                          {/each}
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    <label for="deleteWatchlist" class="border text-sm border-gray-600 ml-3 cursor-pointer inline-flex items-center justify-center space-x-1 whitespace-nowrap rounded-md py-2 pl-3 pr-4 font-semibold text-white shadow-sm bg-[#09090B] sm:hover:bg-[#09090B]/60 ease-out sm:hover:text-red-500">
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M360 184h-8c4.4 0 8-3.6 8-8zh304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32M731.3 840H292.7l-24.2-512h487z"/></svg>
                        <div>Delete</div>
                    </label>

                    <DropdownMenu.Root >
                      <DropdownMenu.Trigger asChild let:builder>
                        <Button builders={[builder]}  class="ml-3 sm:ml-auto min-w-[110px] w-fit border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-lg truncate">
                          <span class="truncate font-semibold text-white shadow-sm">
                            Indicators
                          </span>
                          <svg class="-mr-1 ml-2 h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor" style="max-width:40px" aria-hidden="true">
                              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                          </svg>
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content class="w-56 h-fit max-h-72 overflow-y-auto scroller">
                        <div class="relative sticky z-40 focus:outline-none -top-1"
                            tabindex="0" role="menu" style="">
                        <input bind:value={searchQuery}
                            on:input={handleInput}
                            autocomplete="off"
                            class="text-sm absolute fixed sticky w-full border-0 bg-[#09090B] border-b border-gray-200 
                            focus:border-gray-200 focus:ring-0 text-white placeholder:text-gray-300" 
                            type="search" 
                            placeholder="Search...">
                        </div>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Group>
                          {#each (searchQuery?.length !== 0 ? testList : indicatorList) as item}
                            <DropdownMenu.Item class="sm:hover:bg-[#27272A]">
                            <div class="flex items-center" on:click|capture={(event) => event.preventDefault()}>
                              <label on:click={() => {handleChangeValue(item)}} class="cursor-pointer text-white" for={item}>
                                <input type="checkbox" class="rounded" checked={isChecked(item)}>
                                <span class="ml-2">{item}</span>
                              </label>
                            </div>
                          </DropdownMenu.Item>  
                          {/each}
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>

            </div>
    </div>



    
        {#if allList.length === 0}
        <div class="flex flex-col justify-center items-center m-auto pt-8">
            <span class="text-white font-bold text-white text-xl sm:text-3xl">
                Empty Watchlist
            </span>

            <span class="text-white text-sm sm:text-lg m-auto p-4 text-center">
                Fill it up with your favorite stocks and get realtime data and the latest news in one place!
            </span>
            {#if !data?.user}
            <a class="w-64 flex mt-10 justify-center items-center m-auto btn text-white bg-purple-600 hover:bg-purple-500 transition duration-150 ease-in-out group" href="/register">
                Get Started 
                <span class="tracking-normal group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g transform="rotate(90 12 12)"><g fill="none"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="white" d="M13.06 3.283a1.5 1.5 0 0 0-2.12 0L5.281 8.939a1.5 1.5 0 0 0 2.122 2.122L10.5 7.965V19.5a1.5 1.5 0 0 0 3 0V7.965l3.096 3.096a1.5 1.5 0 1 0 2.122-2.122L13.06 3.283Z"/></g></g></svg>
                </span>
            </a>
            {/if}

        </div>
        {:else}

        <WatchListCard
          watchListId={displayWatchList?.id}
          indicatorList={indicatorList}
        />
        
        
        {/if}
    {:else}
    <div class="flex justify-center items-center h-80">
      <div class="relative">
      <label class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span class="loading loading-spinner loading-md text-gray-400"></span>
      </label>
      </div>
  </div>

    {/if}
    

  </main>


 
  
  </div>
  </div>
  
  
  </div>
  
  
  
  </section>
  
    
    



<!--Start Create Watchlist Modal-->

  <!-- Desktop modal using dialog component -->
    <input type="checkbox" id="addWatchlist" class="modal-toggle" />
  
    <dialog id="addWatchlist" class="modal modal-bottom sm:modal-middle">
      <!-- Modal backdrop for desktop -->
      <label for="addWatchlist" class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.5]"></label>
  
      <!-- Desktop modal content -->
      <div class="modal-box w-full bg-[#191919]">
        <div class="text-white mb-5">
          <h3 class="font-bold text-2xl mb-5">New Watchlist</h3>
          
          <form
            on:submit={createWatchList}
            class="space-y-2 w-full m-auto"
            >
            <Input
            id="title"
            type="text"
            label="List Name"
            errors=''
            required={true}
            />

            <input class="hidden" name='user' value={data?.user?.id} />
            <input class="hidden" name='ticker' value={JSON.stringify([])} />


            <button type="submit" class="mt-10 btn bg-purple-600 sm:hover:bg-purple-700 btn-md w-full rounded-lg m-auto text-white font-bold text-md">
              Create List
          </button>
        </form>

        </div>
      </div>
    </dialog>  
<!--End Create Watchlist Modal-->






    
<!--Start Delete Strategy Modal-->

  <!--Start Delete Strategy Modal-->
  <input type="checkbox" id="deleteWatchlist" class="modal-toggle" />
  
  <dialog id="deleteWatchlist" class="modal modal-bottom sm:modal-middle">
  
  
    <label for="deleteWatchlist"  class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.5]"></label>
    
    
    <div class="modal-box w-full bg-[#141417] border border-gray-800 overflow-hidden ">
  
      <h3 class="font-bold text-[1rem] text-center sm:text-lg flex justify-center items-center mt-10 text-white">
        Are you sure you want to delete the watchlist?
      </h3>
  
      <div class="modal-action w-full m-auto p-5 flex flex-col sm:flex-row items-center">
         
  
      <label for="deleteWatchlist" on:click={deleteWatchlist} class="mt-5 btn bg-purple-600 hover:bg-purple-500 btn-md w-full rounded-lg m-auto text-white font-bold text-md">
          Proceed
      </label>


      </div>
  
          
        </div>
    </dialog>
  
  <!--End Delete Strategy Modal-->

<!--End Delete Strategy Modal-->
    
    

