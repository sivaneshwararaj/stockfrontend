<script lang="ts">
    import { onMount } from "svelte";
    import * as Card from "$lib/components/shadcn/card/index.ts";
    import * as Table from "$lib/components/shadcn/table/index.ts";
    import ArrowUpRight from "lucide-svelte/icons/arrow-up-right";
    import { pb } from '$lib/pocketbase';
    import { redirect } from '@sveltejs/kit';
    import { goto } from '$app/navigation';
    import { createEventDispatcher } from 'svelte';
    import { enhance } from '$app/forms';
    import { debounce } from 'lodash-es';
    import * as devalue from 'devalue';
    import { closedPWA } from "$lib/store";
    import { Icon, ArrowUp, ArrowDown } from "svelte-hero-icons";
    


    export let form;
    // Props and initial data
    export let data;
    
    // Add missing store import
    import { screenWidth } from "$lib/store";
    import { numberOfUnreadNotification } from "$lib/store";

    let optionsMode = "openInterest";
    let Feedback;
    let pwaInstalled = false;
    let AppInstalled = null;
    let dropdownElement: HTMLDivElement;
    let isDropdownOpen = false;
    const dispatch = createEventDispatcher();

    // Time options
    const timeOptions = [
        "4 Hours", "6 Hours", "12 Hours", "24 Hours", "2 Days",
    ];
    let selectedTime = "24 Hours";
    let selectedPennyStockTime = "24 Hours";  // Separate timeframe for penny stocks
    $: console.log("selectedTime changed:", selectedTime);

    // Sample top mentions data
    let topMentions = [ ];
    let pennyStockMentions = []; // For penny stock tracker
    let selectedSubreddits: string[] = []; // Initialize selectedSubreddits

    // Add missing isPWAInstalled function
    function isPWAInstalled() {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(display-mode: standalone)').matches;
        }
        return false;
    }

    onMount(() => {
        debouncedFetchMentions();
        debouncedFetchPennyStockMentions(); // Fetch penny stock data on mount
    });

    function convertTimesToUnix(timeString) {
        const now = Math.floor(Date.now() / 1000);
        let givenTimeTimestamp = null;

        const match = timeString.match(/^(\d+)\s*(Hours?|Days?|Week)$/i);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            let seconds = 0;

            if (unit.startsWith("hour")) {
                seconds = value * 3600;
            } else if (unit.startsWith("day")) {
                seconds = value * 86400;
            } else if (unit === "week") {
                seconds = value * 604800;
            }

            givenTimeTimestamp = now - seconds; // Calculate past timestamp
            return {
                currentTime: now,
                givenTime: givenTimeTimestamp,
                givenTimeString: timeString,// Include the original string
            };
        } else {
            return{
                currentTime: now,
                givenTime: null, // Indicate invalid input
                givenTimeString: timeString,
            };
        }
    }

  async function toggleStar(symbol: string, isPennyStock: boolean = false) {
    if (!pb.authStore.isValid) {
        goto('/login');
        return;
    }

    const targetArray = isPennyStock ? pennyStockMentions : topMentions;
    const updatedArray = targetArray.map(item => {
        if (item.symbol === symbol) {
            const newState = !item.isStarred;
            console.log(`Toggled ${symbol} star to ${newState}`);
            // Update the database (replace with your actual PocketBase update logic)
            pb.collection('your_collection_name').update(item.id, { isStarred: newState }); // Replace 'your_collection_name' and 'item.id'
            return { ...item, isStarred: newState };
        }
        return item;
    });

    if (isPennyStock) {
        pennyStockMentions = updatedArray;
    } else {
        topMentions = updatedArray;
    }
}


    function getClosedPWA() {
        // Use devalue.parse to correctly parse the stored value
        const storedValue = localStorage.getItem("closePWA");
        if (!storedValue) return null;
        const { value, expires } = JSON.parse(storedValue);

        if (new Date() > new Date(expires)) {
            localStorage.removeItem("closePWA");
            return null;
        }

        return value;
    }

    onMount(async () => {
        pwaInstalled = isPWAInstalled();
        if (!pwaInstalled) {
            try {
                $closedPWA = getClosedPWA();
                if (!$closedPWA) {
                    AppInstalled = (await import("$lib/components/AppInstalled.svelte")).default;
                }
            } catch (e) {
                console.error("Error loading AppInstalled component:", e);
            }
        }
        Feedback = (await import("$lib/components/Feedback.svelte")).default;
    });

    // Reactive statements
    $: charNumber = $screenWidth < 640 ? 20 : 15;
    $: newsData = data?.getDashboard?.newsData || [];
    $: {
        if (selectedSubreddits) {
            console.log('Selected subreddits updated:', selectedSubreddits);
        }
    }

    // Add missing formatTime function
    function formatTime(timestamp) {
        if (!timestamp) return 'Unknown time';
        
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

   async function fetchMentionsData(endpoint: string = 'updateMentions', timeframe: string = selectedTime, subreddits: string[] | null = null) {
        const formData = new FormData();
        formData.append('timeframe', timeframe);

        // Only include subreddits if they are provided (for the sentiment tracker)
        if (subreddits) {
            subreddits.forEach(subreddit => {
                formData.append('subreddits', subreddit);
            });
        }


        try {
            const response = await fetch(`?/${endpoint}`, {
                method: 'POST',
                body: formData
            });
            const result = await response?.json();

            if (result) {
                // Parse the JSON string in result.data
                let parsedData = result?.data;
                let stringified = devalue.parse(parsedData);
                stringified = stringified.data;
                // Initialize array to store formatted mentions
                const formattedMentions = [];

                // Skip first element (metadata) and iterate through data
                for(let i = 1; i < stringified.length-1; i++) {
                    if (stringified[i] && stringified[i].ticker) {
                        const item = {
                            symbol: stringified[i].ticker,
                            name: stringified[i].name,
                            price: "N/A",// You'll need to get price data from another source
                            mentionCount: stringified[i].count,
                            mentionChange: `${(parseFloat(stringified[i].sentiment) * 100).toFixed(2)}%`,
                            marketCap: "N/A", // You'll need to get market cap data from another source
                            isStarred: false,
                            rank_change:stringified[i].rank_change,
                        };
                        formattedMentions.push(item);
                    }
                }

                return formattedMentions; // Return the data
            } else {
                console.error('Failed to fetch mentions:', result.error);
                return []; // Return empty array on failure
            }
        } catch (error) {
            console.error('Error fetching mentions:', error);
            return []; // Return empty array on error
        }
    }

    // Debounced version of fetchMentionsData
    const debouncedFetchMentions = debounce(async () => {
        topMentions = await fetchMentionsData('updateMentions',selectedTime,selectedSubreddits);
    }, 500);

    const debouncedFetchPennyStockMentions = debounce(async () => {
    pennyStockMentions = await fetchMentionsData('updateMentionsPenny',selectedPennyStockTime);
    }, 500);


    // Handle subreddit changes
    function handleSubredditChange() {
        isDropdownOpen = true;
        debouncedFetchMentions();
    }

    // Watch for changes in selectedTime or selectedSubreddits
    $: {
        if (selectedTime || selectedSubreddits) {
            // debouncedFetchMentions(); // Removed to prevent double fetching on mount
        }
         if (selectedPennyStockTime) {
           // debouncedFetchPennyStockMentions(); // Removed to prevent double fetching on mount
        }
    }

  $: {
    if (form?.success) {
        try {
            // This part might need adjustment depending on how your form handles different datasets
            const parsedData = JSON.parse(form.data);
            const formattedMentions = [];

            for (let i = 6; i < parsedData.length; i++) {
                if (parsedData[i].ticker && parsedData[i].name) {
                    const item = {
                        symbol: parsedData[i].ticker,
                        name: parsedData[i].name,
                        price: "N/A",
                        mentionCount: parsedData[i].count,
                        mentionChange: `${(parseFloat(parsedData[i].sentiment) * 100).toFixed(2)}%`,
                        marketCap: "N/A",
                        isStarred: false
                    };
                    formattedMentions.push(item);
                }
            }

            // You need to determine *which* array to update based on the form.  This is a placeholder.
            // You might need a hidden form field, or some other indicator, to know which dataset the form is for.
            if (form.formData.get('dataType') === 'pennyStocks') { // Example - adjust as needed!
                pennyStockMentions = formattedMentions;
            } else {
                 topMentions = formattedMentions;
            }
             console.log("Processed mentions:", topMentions, pennyStockMentions);

        } catch (error) {
            console.error('Error parsing or processing data:', error);
        }
    }
}


    // Fix for clicking outside dropdown to close it
    function handleClickOutside(event) {
        if (dropdownElement && !dropdownElement.contains(event.target)) {
            isDropdownOpen = false;
        }
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<svelte:head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>
        {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Stocknear - Free Online Stock Analysis
        for Investors
    </title>
    <meta
        name="description"
        content="Stocknear has everything you need to analyze stocks with help of AI, including detailed financial data, statistics, news and charts."
    />
</svelte:head>

<div class="min-h-screen bg-black-900 text-white p-6 justify-center items-center">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
            <h1 class="text-xl font-semibold items-center text-center">Sentiment and Mention Tracker — All Subreddits</h1>
            <p class="text-xs font-semibold text-center">Discover what tickers are trending and monitor social sentiment on Reddit across 231 stock and crypto subreddits.</p>

            <div class="flex gap-4 mt-4 items-center justify-center">
                <div class="flex gap-2">
                    <span class="text-gray-400">Top Mentions - Timeframe</span>
                    <div class="flex items-center gap-2">
                        <select class="bg-gray-800 rounded px-2 py-1" bind:value={selectedTime} on:change={debouncedFetchMentions}>
                            {#each timeOptions as option}
                                <option value={option}>{option}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <form method="POST" use:enhance class="w-full">
                        <div class="relative" bind:this={dropdownElement}>
                            <button
                                type="button"
                                class="bg-gray-800 rounded px-2 py-1 w-48 text-left"
                                on:click={() => isDropdownOpen = !isDropdownOpen}
                            >
                                {selectedSubreddits.length === 0 ? 'All Subreddits' : `${selectedSubreddits.length} selected`}
                            </button>
                            {#if isDropdownOpen}
                                <div class="absolute bg-gray-800 mt-1 rounded shadow-lg z-50 w-64 max-h-60 overflow-y-auto">
                                    <div class="p-2 space-y-2">
                                        {#each data?.subreddits as subreddit}
                                            <label class="flex items-center p-1 hover:bg-gray-700 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="subreddits"
                                                    value={subreddit}
                                                    bind:group={selectedSubreddits}
                                                    class="mr-2"
                                                    on:change={handleSubredditChange}
                                                />
                                                <span class="text-gray-300">{subreddit}</span>
                                            </label>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                            <button type="submit" class="hidden">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Main Table (Sentiment Tracker) -->
        <div class="bg-gray-800 rounded-lg overflow-hidden mb-6">
           
            <div class="overflow-x-auto">
                <div class="overflow-y-auto" style="max-height: 330px;">
                    <table class="w-full">
                        <thead class="sticky top-0 bg-gray-800">
                            <tr class="text-gray-400 text-sm">
                                
                                <th class="px-4 py-2 text-left"></th>
                                <th class="px-4 py-2 text-left"></th>
                                <th class="px-4 py-2 text-left">#</th>
                                <th class="px-4 py-2 text-left">Symbol</th>
                                <th class="px-4 py-2 text-left">Name</th>
                                <th class="px-4 py-2 text-right">Price</th>
                                <th class="px-4 py-2 text-right">Mention Count</th>
                                <th class="px-4 py-2 text-right">Mention Change</th>
                                <th class="px-4 py-2 text-right">Market Cap</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each topMentions as item, i}
                                <tr class="border-t border-gray-700">
                                     <td class="px-4 py-3">
                                    {#if item.rank_change !== 0}
                                        {#if item.rank_change < 0}
                                        
                                            <span class="text-red-500"><Icon src="{ArrowDown}" class="text-red-500 h-3 w-3" />{Math.abs(item.rank_change)}</span>
                                        {:else}
                                            <span class="text-green-500"><Icon src="{ArrowUp}" class="text-green-500 h-3 w-3" /> {item.rank_change}</span>
                                        {/if}
                                        {:else}
                                        <span class="text-gray-500">    </span>
                                        {/if}
                                        </td>
                                    <td class="px-4 py-3">
                                         <button on:click={() => toggleStar(item.symbol)} class="hover:text-yellow-400 focus:outline-none" >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={item.isStarred ? 'rgb(250 204 21)' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={item.isStarred ? 'text-yellow-400' : 'text-gray-400'} >
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                            </svg>
                                        </button>
                                    </td>
                                    
                                     <td class="px-4 py-3">{i + 1}</td>
                                    <td class="px-4 py-3 font-semibold">{item.symbol}</td>
                                    <td class="px-4 py-3">{item.name}</td>
                                    <td class="px-4 py-3 text-right">{item.price}</td>
                                    <td class="px-4 py-3 text-right">{item.mentionCount}</td>
                                    <td class="px-4 py-3 text-right"
                                        class:text-green-400={parseFloat(item.mentionChange) >= 0}
                                        class:text-red-400={parseFloat(item.mentionChange) < 0}
                                    >
                                        {item.mentionChange}
                                    </td>
                                    <td class="px-4 py-3 text-right">{item.marketCap}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- tracker Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Top Gainers -->
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold">Top Gainers</h2>
                    <button class="text-blue-400 text-sm">View All →</button>
                </div>
                <table class="w-full">
                    <thead>
                        <tr class="text-gray-400 text-sm">
                            <th class="px-2 py-2 text-left">Symbol</th>
                            <th class="px-2 py-2 text-left">Name</th>
                            <th class="px-2 py-2 text-right">Price</th>
                            <th class="px-2 py-2 text-right">Change</th>
                        </tr>
                    </thead>
                    <tbody>
                         {#each topMentions
                        .sort((a, b) => parseFloat(b.mentionChange) - parseFloat(a.mentionChange))
                        .slice(0, 5) as item}
                        <tr class="border-t border-gray-700">
                            <td class="px-2 py-2 font-semibold">{item.symbol}</td>
                            <td class="px-2 py-2">{item.name}</td>
                            <td class="px-2 py-2 text-right">{item.price}</td>
                            <td class="px-2 py-2 text-right"
                                class:text-green-400={parseFloat(item.mentionChange) >= 0}
                                class:text-red-400={parseFloat(item.mentionChange) < 0}
                            >
                                {item.mentionChange}
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            <!-- News Section -->
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold">Top News</h2>
                    <button class="text-blue-400 text-sm">View All →</button>
                </div>
                <div class="space-y-4">
                    {#each data?.getDashboard?.newsData || [] as news}
                        <div class="border-t border-gray-700 pt-4">
                            <div class="flex items-center gap-2 mb-2">
                                <a
                                    href={news.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-gray-200 hover:text-blue-400 transition-colors"
                                >
                                    {news.title}
                                </a>
                            </div>
                            <div class="flex items-center justify-between text-sm text-gray-400">
                                <span>{news.author}</span>
                                <span>{formatTime(news.publishedAt)}</span>
                            </div>
                            {#if news.channel}
                                <span class="inline-block mt-2 text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                                    {news.channel}
                                </span>
                            {/if}
                        </div>
                    {/each}
                    {#if !data?.getDashboard?.newsData?.length}
                        <div class="text-gray-400 text-center py-4">
                            No news available at the moment
                        </div>
                    {/if}
                </div>
            </div>
        </div>


        <!-- Penny Stock Tracker Header -->
        <div class="mb-6">
           <h1 class="text-xl font-semibold items-center text-center">Penny Stock Tracker</h1>
            <p class="text-xs font-semibold text-center">Discover what penny stock tickers are trending.</p>
             <div class="flex gap-4 mt-4 items-center justify-center">
                <div class="flex gap-2">
                    <span class="text-gray-400">Top Mentions - Timeframe</span>
                    <div class="flex items-center gap-2">
                        <select class="bg-gray-800 rounded px-2 py-1" bind:value={selectedPennyStockTime} on:change={debouncedFetchPennyStockMentions}>
                            {#each timeOptions as option}
                                <option value={option}>{option}</option>
                            {/each}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- Penny Stock Tracker Table -->
        <div class="bg-gray-800 rounded-lg overflow-hidden mb-6">
            <div class="overflow-x-auto">
                <div class="overflow-y-auto" style="max-height: 330px;">
                    <table class="w-full">
                        <thead class="sticky top-0 bg-gray-800">
                            <tr class="text-gray-400 text-sm">
                                <th class="px-4 py-2 text-left"></th>
                                <th class="px-4 py-2 text-left"></th>
                                <th class="px-4 py-2 text-left">#</th>
                                <th class="px-4 py-2 text-left">Symbol</th>
                                <th class="px-4 py-2 text-left">Name</th>
                                <th class="px-4 py-2 text-right">Price</th>
                                <th class="px-4 py-2 text-right">Mention Count</th>
                                <th class="px-4 py-2 text-right">Mention Change</th>
                                <th class="px-4 py-2 text-right">Market Cap</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each pennyStockMentions as item, i}
                                <tr class="border-t border-gray-700">
                                    <td class="px-4 py-3">
                                    {#if item.rank_change !== 0}
                                        {#if item.rank_change < 0}
                                        
                                            <span class="text-red-500"><Icon src="{ArrowDown}" class="text-red-500 h-3 w-3" />{Math.abs(item.rank_change)}</span>
                                        {:else}
                                            <span class="text-green-500"><Icon src="{ArrowUp}" class="text-green-500 h-3 w-3" /> {item.rank_change}</span>
                                        {/if}
                                        {:else}
                                        <span class="text-gray-500">    </span>
                                        {/if}
                                        </td>
                                    <td class="px-4 py-3">
                                            <button on:click={() => toggleStar(item.symbol, true)} class="hover:text-yellow-400 focus:outline-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={item.isStarred ? 'rgb(250 204 21)' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={item.isStarred ? 'text-yellow-400' : 'text-gray-400'}>
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                            </svg>
                                        </button>
                                    </td>
                                    <td class="px-4 py-3">{i + 1}</td>
                                    <td class="px-4 py-3 font-semibold">{item.symbol}</td>
                                    <td class="px-4 py-3">{item.name}</td>
                                    <td class="px-4 py-3 text-right">{item.price}</td>
                                    <td class="px-4 py-3 text-right">{item.mentionCount}</td>
                                    <td class="px-4 py-3 text-right"
                                        class:text-green-400={parseFloat(item.mentionChange) >= 0}
                                        class:text-red-400={parseFloat(item.mentionChange) < 0}
                                    >
                                        {item.mentionChange}
                                    </td>
                                    <td class="px-4 py-3 text-right">{item.marketCap}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Bottom Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Top Gainers -->
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold">Top Gainers</h2>
                    <button class="text-blue-400 text-sm">View All →</button>
                </div>
                <table class="w-full">
                    <thead>
                        <tr class="text-gray-400 text-sm">
                            <th class="px-2 py-2 text-left">Symbol</th>
                            <th class="px-2 py-2 text-left">Name</th>
                            <th class="px-2 py-2 text-right">Price</th>
                            <th class="px-2 py-2 text-right">Change</th>
                        </tr>
                    </thead>
                    <tbody>
                         {#each topMentions
                        .sort((a, b) => parseFloat(b.mentionChange) - parseFloat(a.mentionChange))
                        .slice(0, 5) as item}
                        <tr class="border-t border-gray-700">
                            <td class="px-2 py-2 font-semibold">{item.symbol}</td>
                            <td class="px-2 py-2">{item.name}</td>
                            <td class="px-2 py-2 text-right">{item.price}</td>
                            <td class="px-2 py-2 text-right"
                                class:text-green-400={parseFloat(item.mentionChange) >= 0}
                                class:text-red-400={parseFloat(item.mentionChange) < 0}
                            >
                                {item.mentionChange}
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            <!-- News Section -->
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold">Top News</h2>
                    <button class="text-blue-400 text-sm">View All →</button>
                </div>
                <div class="space-y-4">
                    {#each data?.getDashboard?.newsData || [] as news}
                        <div class="border-t border-gray-700 pt-4">
                            <div class="flex items-center gap-2 mb-2">
                                <a
                                    href={news.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-gray-200 hover:text-blue-400 transition-colors"
                                >
                                    {news.title}
                                </a>
                            </div>
                            <div class="flex items-center justify-between text-sm text-gray-400">
                                <span>{news.author}</span>
                                <span>{formatTime(news.publishedAt)}</span>
                            </div>
                            {#if news.channel}
                                <span class="inline-block mt-2 text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                                    {news.channel}
                                </span>
                            {/if}
                        </div>
                    {/each}
                    {#if !data?.getDashboard?.newsData?.length}
                        <div class="text-gray-400 text-center py-4">
                            No news available at the moment
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>