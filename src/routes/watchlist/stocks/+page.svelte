<script lang='ts'>
import { searchBarData, screenWidth, numberOfUnreadNotification, switchWatchList } from '$lib/store';
import { formatDate, abbreviateNumber } from '$lib/utils';
import toast from 'svelte-french-toast';
import { onDestroy, onMount } from 'svelte';

import Input from '$lib/components/Input.svelte';
import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
import { Button } from "$lib/components/shadcn/button/index.js";
import { Combobox } from "bits-ui";

export let data;
let searchQuery = '';
let editMode = false;
let numberOfChecked = 0;
let deleteTickerList = [];

let watchList: any[] = [];
let news = [];


let allRows = [
    { name: 'Volume', rule: 'volume' },
    { name: 'Market Cap', rule: 'marketCap' },
    { name: 'Price', rule: 'price' },
    { name: 'Change', rule: 'changesPercentage' },
    { name: 'EPS', rule: 'eps' },
    { name: 'PE', rule: 'pe' },
    { name: 'AI Score', rule: 'score' },
    { name: 'Revenue', rule: 'revenue'},
    { name: 'Net Income', rule: 'netIncome'},
    { name: 'Free Cash Flow', rule: 'freeCashFlow'}
];

let ruleOfList = [
    { name: 'Volume', rule: 'volume' },
    { name: 'Market Cap', rule: 'marketCap' },
    { name: 'Price', rule: 'price' },
    { name: 'Change', rule: 'changesPercentage' },
];


let isLoaded = false;
let searchDataLoaded = false; // Flag to track data loading
//let downloadWorker: Worker | undefined;
let displayWatchList;
let allList = data?.getAllWatchlist;
  
/*
const handleDownloadMessage = (event) => {
  isLoaded = false;
  watchList = event?.data?.watchlistData ?? [];
  isLoaded = true;
};

const updateStockScreenerData = async () => {
    downloadWorker.postMessage({ ruleOfList: ruleOfList, tickerList: watchList?.map(item => item?.symbol)});
};
*/

  
async function loadSearchData() {
  if ($searchBarData.length !== 0 || searchDataLoaded) return;
  else {
    searchDataLoaded = true;
      // make the GET request to the endpoint
      const response = await fetch('/api/searchbar-data', {
    method: 'GET',
    headers: {
        "Content-Type": "application/json"
    },
    });

    $searchBarData = await response.json();
    
  }
}
  

async function getWatchlistData()
{
  const postData = {'watchListId': displayWatchList?.id}
  

  const response = await fetch('/api/get-watchlist', {
      method: 'POST',
      headers: {
      "Content-Type": "application/json"
      },
      body: JSON.stringify(postData)
  });

const output = await response?.json();

  watchList = output?.data;
  news = output?.news;
}

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


function handleDeleteModal(event) {
  event?.preventDefault();
  const clicked = document.getElementById('deleteWatchlist');
  clicked.dispatchEvent(new MouseEvent('click'));
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

function handleEditMode() {
  if (editMode === true) {
    deleteTickerList = [];
    numberOfChecked = 0;
  }
  editMode = !editMode;
}

async function handleFilter(symbol) {

  const filterSet = new Set(deleteTickerList);

  // Check if the new filter already exists in the list
  if (filterSet?.has(symbol)) {
    // If it exists, remove it from the list
    filterSet?.delete(symbol);
  } else {
    // If it doesn't exist, add it to the list
    filterSet?.add(symbol);

  }
  deleteTickerList = Array?.from(filterSet);
  numberOfChecked = deleteTickerList?.length;
}


async function handleDeleteTickers() {

    if (numberOfChecked === 0) {
        toast.error(`You need to select symbols before you can delete them`, {
            style: 'border-radius: 10px; background: #333; color: #fff;  padding: 12px; margin-top: 10px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);',
        });
    }
    else {

        watchList = watchList?.filter(item => !deleteTickerList?.includes(item?.symbol));

        deleteTickerList = [...deleteTickerList];
        editMode = false;
        const postData = {
            'ticker': watchList?.map(item => item?.symbol),
            'watchListId': displayWatchList?.id
        }
      
        const response = await fetch('/api/update-watchlist', {
            method: 'POST',
            headers: {
             "Content-Type": "application/json"
            },
            body: JSON.stringify(postData)
        });
      
        deleteTickerList = [];
        numberOfChecked = 0;
        allList = allList?.map(item => {
          if (item?.id === displayWatchList?.id) {
            return { ...item, ticker: watchList }; // Update ticker with watchlist
          }
          return item; // Return unchanged item if condition doesn't match
        });

        allList = [...allList];

    }

}

async function handleAddTicker(event, ticker) {
  event.preventDefault();
  
  // Ensure inputValue is reset
  inputValue = '';

  // Check if the ticker is already in the watchList; if not, add it
  if (!watchList.includes(ticker)) {
    watchList = [...watchList, ticker]; // Add ticker to watchlist
  }

  // Exit edit mode
  editMode = false;

  // Prepare the data to send to the API
  const postData = {
    'ticker': ticker,
    'watchListId': displayWatchList?.id
  };
  
  // Send the updated watchlist to the server
  const response = await fetch('/api/update-watchlist', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(postData)
  });

  // Update the allList with the new watchlist
  allList = allList?.map(item => {
    if (item?.id === displayWatchList?.id) {
      return { ...item, tickers: watchList }; // Update tickers in the watchlist
    }
    return item; // Return unchanged item
  });

  // Refresh the displayWatchList with the updated watchlist
  displayWatchList = allList.find(item => item?.id === displayWatchList?.id);

  // Fetch the updated watchlist data (assuming this function refreshes the UI or state)
  await getWatchlistData();
}




function changeWatchList(newWatchList)
{
  displayWatchList = newWatchList;
  $switchWatchList = true;

}


onMount(async () => {
if(allList?.length !== 0)
    {
      displayWatchList = allList?.at(0)
    }
    else {
      displayWatchList = '';
    }
    await getWatchlistData();
    /*
    if (!downloadWorker) {
        const DownloadWorker = await import('./workers/downloadWorker?worker');
        downloadWorker = new DownloadWorker.default();
        downloadWorker.onmessage = handleDownloadMessage;
    }
        */

  checkedItems = new Set(ruleOfList.map(item => item.name))
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
          
          const rawList = allRows
            testList = rawList?.filter(item => {
                const index = item?.name?.toLowerCase();
                // Check if country starts with searchQuery
                return index?.startsWith(searchQuery);
            }) || [];
        }
    }, 50);
}

let checkedItems;

function isChecked(item) {
  return checkedItems?.has(item);
}

async function handleChangeValue(value) {
  if (checkedItems.has(value)) {
    checkedItems.delete(value);  // Remove the value if it's already in the Set
  } else {
    checkedItems.add(value);      // Add the value if it's not in the Set
      // Update ruleOfList based on checked items from indicatorList
  }
  ruleOfList = allRows.filter(item => checkedItems.has(item.name)); // Assuming each item has a `value` property
  allRows = [...allRows];
  ruleOfList = [...ruleOfList];

const priorityItems = new Set(['AI Score', 'Revenue', 'Net Income', 'Free Cash Flow']);

allRows = allRows
  ?.filter(item => checkedItems.has(item.name) || !checkedItems.has(item.name))
  ?.sort((a, b) => {
    const isAChecked = checkedItems.has(a.name);
    const isBChecked = checkedItems.has(b.name);

    // Sort checked items first
    if (isAChecked !== isBChecked) return isAChecked ? -1 : 1;

    // Check if the user is not Pro
    if (data?.user?.tier !== 'Pro') {
      // Check if both items are priority items
      const isAPriority = priorityItems.has(a.name);
      const isBPriority = priorityItems.has(b.name);

      // If both are priority items or both are not, sort alphabetically
      if (isAPriority === isBPriority) return a.name.localeCompare(b.name);

      // Move priority items to the bottom
      return isAPriority ? 1 : -1;
    }

    // If the user is Pro, sort alphabetically
    return a.name.localeCompare(b.name);
  });

    
}


  
$: charNumber = $screenWidth < 640 ? 15 : 20;

$: {
  if($switchWatchList && typeof window !== 'undefined')
  {
    isLoaded = false
    getWatchlistData()
    isLoaded = true;
    $switchWatchList = false;
  }
}

 
  let inputValue = "";
  let touchedInput = false;

$: filteredStocks = inputValue ? search() : [];

function search() {
  const normalizedSearchQuery = inputValue.toLowerCase();

  const filteredList = $searchBarData
    .map(item => ({
      ...item,
      nameLower: item?.name?.toLowerCase(),
      symbolLower: item?.symbol?.toLowerCase(),
    }))
    .filter(({ nameLower, symbolLower }) =>
      nameLower.includes(normalizedSearchQuery) ||
      symbolLower.includes(normalizedSearchQuery)
    );

  filteredList.sort((a, b) => {
    const aSymbolLower = a.symbolLower;
    const bSymbolLower = b.symbolLower;
    const aNameLower = a.nameLower;
    const bNameLower = b.nameLower;

    // Check for exact symbol matches
    const isExactMatchA = aSymbolLower === normalizedSearchQuery;
    const isExactMatchB = bSymbolLower === normalizedSearchQuery;

    if (isExactMatchA && !isExactMatchB) {
      return -1; // Prioritize exact symbol match for A
    } else if (!isExactMatchA && isExactMatchB) {
      return 1; // Prioritize exact symbol match for B
    }

    const aSymbolIndex = aSymbolLower.indexOf(normalizedSearchQuery);
    const bSymbolIndex = bSymbolLower.indexOf(normalizedSearchQuery);

    const aNameIndex = aNameLower.indexOf(normalizedSearchQuery);
    const bNameIndex = bNameLower.indexOf(normalizedSearchQuery);

    // If no exact symbol match, prioritize based on the combined position in name and symbol
    const positionComparison = (aSymbolIndex + aNameIndex) - (bSymbolIndex + bNameIndex);


    return positionComparison;
  });

  // Limit results to 5
  const resultList = filteredList?.slice(0, 5);
  return resultList;
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
    
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
        <div class="relative flex justify-center items-start overflow-hidden w-full">


            <main class="w-full">


    {#if isLoaded}


     <div class="flex w-full sm:w-[50%] md:w-auto px-2 sm:px-0 mb-10 {!data?.user ? 'hidden' : 'md:block'}">
            <div class="hidden text-sm sm:text-[1rem] font-semibold text-white md:block sm:mb-2">
                My Watchlist
            </div>
            <div class="{$screenWidth < 640 ? 'grid grid-cols-2' : ''} gap-x-3 gap-y-3 sm:gap-x-0 sm:gap-y-0 px-2 sm:px-0 relative inline-block text-left w-full flex flex-col sm:flex-row items-center">
              <div class="order-0 w-full sm:w-fit">
                <DropdownMenu.Root >
                      <DropdownMenu.Trigger asChild let:builder>
                        <Button builders={[builder]}  class="min-w-[110px] w-full sm:w-fit border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out flex flex-row justify-between items-center px-3 py-2.5 text-white rounded-md truncate">
                          <span class="truncate font-semibold text-white text-sm sm:text-[1rem]">{displayWatchList?.title !== undefined ? displayWatchList?.title : 'Create Watchlist'}</span>
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
                            <DropdownMenu.Item on:click={() => changeWatchList(item)} class="text-sm sm:text-[1rem] {item?.id === displayWatchList?.id ? 'bg-[#27272A]' : ''} cursor-pointer sm:hover:bg-[#27272A]">
                              {item?.title} ({item?.ticker?.length})
                              <label for="deleteWatchlist" class="ml-auto inline-block cursor-pointer text-white sm:hover:text-red-500" on:click|capture={handleDeleteModal}>
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="max-width:40px"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </label>
                            </DropdownMenu.Item>
                          {/each}
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>

              <div class="order-4 w-fit flex justify-end sm:ml-3">
                <div class="flex flex-row items-center justify-end">
                     {#if editMode}
                      <label on:click={handleDeleteTickers} class="border text-sm border-gray-600 mr-2 sm:ml-3 sm:mr-0 cursor-pointer inline-flex items-center justify-center space-x-1 whitespace-nowrap rounded-md py-2.5 pl-3 pr-4 font-semibold text-white  bg-[#09090B] sm:hover:bg-[#09090B]/60 ease-out sm:hover:text-red-500">
                          <svg class="inline-block w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="M10 5h4a2 2 0 1 0-4 0M8.5 5a3.5 3.5 0 1 1 7 0h5.75a.75.75 0 0 1 0 1.5h-1.32l-1.17 12.111A3.75 3.75 0 0 1 15.026 22H8.974a3.75 3.75 0 0 1-3.733-3.389L4.07 6.5H2.75a.75.75 0 0 1 0-1.5zm2 4.75a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0zM14.25 9a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75m-7.516 9.467a2.25 2.25 0 0 0 2.24 2.033h6.052a2.25 2.25 0 0 0 2.24-2.033L18.424 6.5H5.576z"/></svg>
                          <span class="ml-1 text-white text-sm">
                              {numberOfChecked}
                          </span>
                      </label>
                      {/if}
                      <label on:click={handleEditMode} class="border text-sm border-gray-600 sm:ml-3 cursor-pointer inline-flex items-center justify-center space-x-1 whitespace-nowrap rounded-md py-2.5 pl-3 pr-4 text-white bg-[#09090B] sm:hover:bg-[#27272A] ease-out sm:hover:text-red-500">
                        <svg class="inline-block w-5 h-5" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 1024 1024"><path fill="white" d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"/><path fill="white" d="m469.952 554.24l52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"/></svg>
                        {#if !editMode}
                        <span class="ml-1 text-white text-sm sm:text-[1rem]">
                            Edit Watchlist
                        </span>
                        {:else}
                        <span class="ml-1 text-white text-sm sm:text-[1rem]">
                          Cancel
                        </span>
                        {/if}
                    </label>
                    </div>
              </div>
              <div class="order-2 sm:order-1 w-full sm:w-fit">
                  <Combobox.Root items={filteredStocks} bind:inputValue bind:touchedInput>
                    <div class="relative sm:ml-3 w-full">
                      <div class="absolute inset-y-0 left-0 flex items-center pl-2.5">
                        <svg class="h-4 w-4 text-icon xs:h-5 xs:w-5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" stroke="currentColor" viewBox="0 0 24 24" style="max-width: 40px" aria-hidden="true">
                          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                      </div>
                      <Combobox.Input 
                        on:click={loadSearchData}
                        class="controls-input text-white bg-[#09090B] focus:outline-none border border-gray-600 rounded-md placeholder:text-white/80 px-3 py-2 pl-8 xs:pl-10 flex-grow w-full sm:min-w-56 max-w-xs" 
                        placeholder="Add new stock"
                        aria-label="Add new stock"
                      />
                    </div>
                    {#if inputValue?.length !== 0}
                    <Combobox.Content
                      class="w-auto rounded-md border border-gray-700 bg-[#09090B] px-1 py-3 shadow-popover outline-none"
                      sideOffset={8}
                    >
                      {#each filteredStocks as item}
                        <Combobox.Item
                          class="cursor-pointer text-white border-b border-gray-600 last:border-none flex h-fit w-auto select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm capitalize outline-none transition-all duration-75 data-[highlighted]:bg-[#27272A]"
                          value={item.symbol}
                          label={item.name}
                          on:click={() => handleAddTicker(event, item?.symbol)}
                        >
                        <div class="flex flex-col items-start">
                          <span class="text-blue-400">{item?.symbol}</span>
                          <span class="text-white">{item?.name}</span>
                        </div>
                        </Combobox.Item>
                      {:else}
                        <span class="block px-5 py-2 text-sm text-muted-foreground">
                          No results found
                        </span>
                      {/each}
                    </Combobox.Content>
                    {/if}
                  </Combobox.Root>
              </div>
                    

                  <div class="order-0  sm:order-4 w-full">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild let:builder>
                        <Button builders={[builder]}  class="sm:ml-auto min-w-[110px] w-full sm:w-fit border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out flex flex-row justify-between items-center px-3 py-2.5 text-white rounded-md truncate">
                          <span class="truncate text-white text-sm sm:text-[1rem]">
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
                          {#each (searchQuery?.length !== 0 ? testList : allRows) as item}
                            <DropdownMenu.Item class="sm:hover:bg-[#27272A]" >
                            <div class="flex items-center">
                              {#if (data?.user?.tier === 'Pro') || (item.rule !== 'revenue' && item.rule !== 'netIncome' && item.rule !== 'freeCashFlow' && item.rule !== 'score')}
                                <label on:click|capture={(event) => { event.preventDefault(); handleChangeValue(item?.name) }} class="cursor-pointer text-white" for={item?.name}>
                                  <input type="checkbox" class="rounded" checked={isChecked(item?.name)}>
                                  <span class="ml-2">{item?.name}</span>
                                </label>
                              {:else}
                                <a href="/pricing" class="cursor-pointer text-white">
                                  <svg class="h-[18px] w-[18px] inline-block text-icon group-hover:text-dark-400" viewBox="0 0 20 20" fill="currentColor" style="max-width:40px">
                                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                                  </svg>
                                  <span class="ml-2">{item?.name}</span>
                                </a>
                              {/if}

                            </div>
                          </DropdownMenu.Item>  
                          {/each}
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>


            </div>
    </div>



    
        {#if allList.length === 0}
        <div class="flex flex-col justify-center items-center m-auto z-0">
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

        <!--Start Table of Watchlist-->
      {#if watchList?.length !== 0}


  
      <div class="w-screen sm:w-full">

        <div class="w-full overflow-x-scroll">
          <table class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B] m-auto mt-4 ">
            <!-- head -->
            <thead>
              <tr class="border-b-[#09090B]">
                <th class="text-white font-semibold text-sm sm:text-[1rem]">Symbol</th>
                <th class="text-white font-semibold text-sm sm:text-[1rem]">Company</th>

                {#each ruleOfList as item}
                  {#if isChecked(item?.name)}
                    <th class="text-white font-semibold text-end text-sm sm:text-[1rem]">{item?.name}</th>
                  {/if}
                {/each}
              </tr>
            </thead>
            <tbody class="p-0">
              {#each watchList as item}
              <tr class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-[#27272A] border-b-[#09090B]">
                
                <td on:click={() => handleFilter(item?.symbol)} class="text-blue-400 font-medium text-sm sm:text-[1rem] whitespace-nowrap text-start border-b-[#09090B] flex flex-row items-center">
                  <input type="checkbox" checked={deleteTickerList?.includes(item?.symbol) ?? false} class="{!editMode ? 'hidden' : ''} bg-[#2E3238] h-[18px] w-[18px] rounded-sm ring-offset-0 mr-3" />
                  {#if editMode}
                  <label class="text-blue-400 sm:hover:text-white cursor-pointer">
                    {item?.symbol}
                  </label>
                  {:else} 
                  <a href={`/${item?.type === 'stock' ? 'stocks' : item?.type === 'etf' ? 'etf' : 'crypto'}/${item?.symbol}`} class="text-blue-400 sm:hover:text-white">
                    {item?.symbol}
                  </a>
                  {/if}
                </td>

                <td class="text-white text-sm sm:text-[1rem] border-b-[#09090B] whitespace-nowrap">
                  {item?.name?.length > charNumber ? item?.name?.slice(0, charNumber) + "..." : item?.name}
                </td>
                {#each ruleOfList as row}
                  {#if isChecked(row?.name)}
                    <td class="whitespace-nowrap text-sm sm:text-[1rem] text-end text-white border-b-[#09090B]">
                      {#if item?.[row?.rule] !== undefined &&  item?.[row?.rule] !== null}
                        {#if ['marketCap', 'volume','revenue','netIncome','freeCashFlow'].includes(row?.rule)}
                          {abbreviateNumber(item[row?.rule])}
                        {:else if ['eps', 'pe', 'price','freeCashFlow'].includes(row?.rule)}
                          {item[row?.rule] !== null ? item[row?.rule]?.toFixed(2) : '-'}
                        {:else if ['changesPercentage'].includes(row?.rule)}
                          {#if item[row?.rule] >= 0}
                            <span class="text-[#37C97D]">+{item[row?.rule]?.toFixed(2)}%</span>
                          {:else}
                            <span class="text-[#FF2F1F]">{item[row?.rule]?.toFixed(2)}%</span> 
                          {/if}
                          {:else if "score" === row?.rule}
                            {#if ['Strong Buy', 'Buy'].includes(item[row?.rule])}
                              <span class="text-[#37C97D]">{item[row?.rule]}</span>
                            {:else if ['Strong Sell', 'Sell'].includes(item[row?.rule])}
                              <span class="text-[#FF2F1F]">{item[row?.rule]}</span>
                            {:else if item[row?.rule] === 'Hold'}
                              <span class="text-[#FFA838]">{item[row?.rule]}</span>
                            {/if}
                        {/if}

                      {:else}
                        -
                      {/if}
                      
                    </td>
                  {/if}
                {/each}

              </tr>
            {/each}
            </tbody>
          </table>
        </div>


            
            <div class="w-full m-auto border-b border-slate-800 mt-16 mb-16"></div>

            <h2 class="text-start text-white ml-2 text-xl font-bold text-black mb-3 ">Latest News</h2>
            <div class="relative text-gray-800 m-auto">
              <div class="flex flex-wrap md:flex-row">
                  {#each news as item}
                
                      <a href={item.url} target="_blank" class="cursor-pointer mb-10 w-full">
                        <div class="flex-shrink-0 float-left">
                          <img src={item?.image} class="float-left w-36 sm:w-40 rounded-xl ml-2 mr-4 mb-2" alt="news image" loading="lazy">
                          <div class="absolute w-36 sm:w-40 ml-2 mr-4 mb-2 h-6 bg-[#0C0F17] bg-opacity-80 flex justify-center items-center">
                            <p class="text-white italic text-xs">{(new URL(item?.url)).hostname.replace('www.','')}</p>
                          </div>
                        </div>
                        <div class="flex-grow">
                          <div class="text-sm text-white flex flex-row">
                        
                            <div class="rounded-full w-6 h-6 relative bg-gray-800 mr-1.5 mb-0.5">
                              <img class="rounded-full w-4 h-4 absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2" src={`https://financialmodelingprep.com/image-stock/${item.symbol}.png`} loading="lazy"/>
                            </div>
                            {item?.symbol} &centerdot; {formatDate(item?.publishedDate)} ago
                          </div>
                          <h2 class="text-start text-sm sm:text-md font-medium mb-2 flex-shrink text-white">{item.title}</h2>
                          <p class="text-white text-sm sm:text-md p-2">
                            {item?.text?.length > 250 ? item?.text?.slice(0,250) + "..." : item?.text}
                          </p>
                        </div>
                      </a>
                    {/each}
               
              </div>
            </div>

            


      </div>
  
  {:else}
  <div class="flex flex-col justify-center items-center m-auto pt-5 z-0">
    <span class="text-white font-bold text-white text-xl sm:text-3xl">
      Empty Watchlist
  </span>



    <span class="text-white text-sm sm:text-lg pt-5 m-auto p-4 text-center">
      Fill it up with your favorite stocks and get realtime data and the latest news in one place!
    </span>
  </div>
  {/if}
        <!--End Table of Watchlist-->
        
        
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

            <button type="submit" class="mt-10 btn bg-purple-600 sm:hover:bg-purple-700 btn-md w-full rounded-md m-auto text-white font-bold text-md">
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
    
    

