<script lang="ts">
  import { goto } from '$app/navigation';
  import {screenWidth, numberOfUnreadNotification, etfTicker, stockTicker, isOpen } from '$lib/store';
  import notifySound from '$lib/audio/options-flow-reader.mp3';
  //import UpgradeToPro from '$lib/components/UpgradeToPro.svelte';
  import { abbreviateNumber,cn } from '$lib/utils';
  import { onMount, onDestroy } from 'svelte';
  import toast from 'svelte-french-toast';
  import {
    DateFormatter,
    type DateValue,
  } from "@internationalized/date";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import * as Popover from "$lib/components/shadcn/popover/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { Calendar } from "$lib/components/shadcn/calendar/index.js";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  
  import VirtualList from 'svelte-tiny-virtual-list';
  import { writable } from 'svelte/store';

  export let data;
  
  let ruleOfList = data?.getPredefinedCookieRuleOfList || [];

  let displayRules = [];
  let filterQuery = '';
  let socket: WebSocket | null = null; // Initialize socket as null
  
  let syncWorker: Worker | undefined;
  let ruleName = '';
  let searchTerm = '';
  let showFilters = true;
  let filteredRows = [];
  let shouldLoadWorker = writable(false);
  const df = new DateFormatter("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  let selectedDate: DateValue | undefined = undefined;

const allRules = {
  volume: { label: 'Volume', step: ['100K','10K','1K'],  defaultCondition: 'over', defaultValue: 'any' },
  open_interest: { label: 'Open Interest', step: ['100K','10K','1K'],  defaultCondition: 'over', defaultValue: 'any' },
  volumeOIRatio: { label: 'Volume / Open Interest', step: ['100%','80%','60%','50%','30%','15%','10%','5%'],  defaultCondition: 'over', defaultValue: 'any' },
  cost_basis: { label: 'Premium', step: ['10M','5M','1M','500K','100K','50K','10K','5K'],  defaultCondition: 'over', defaultValue: 'any' },
  put_call: { label: 'Contract Type', step: ["Calls", "Puts"],  defaultValue: 'any' },
  sentiment: { label: 'Sentiment', step: ["Bullish","Neutral", "Bearish"],  defaultValue: 'any' },
  execution_estimate: { label: 'Execution', step: ["At Ask","At Bid", "At Midpoint", "Below Ask", "Below Bid",], defaultValue: 'any' },
  option_activity_type: { label: 'Option Type', step: ["Sweep","Trade"],  defaultValue: 'any' },
  date_expiration: { label: 'Date Expiration', step: ["Same Day", "1 day","1 Week","2 Weeks","1 Month","3 Months","6 Months","1 Year","3 Years"], defaultValue: 'any' },
  underlying_type: { label: 'Asset Type', step: ["Stock", "ETF"], defaultValue: 'any' },

};

// Generate allRows from allRules
$: allRows = Object?.entries(allRules)
  ?.sort(([, a], [, b]) => a.label.localeCompare(b.label))  // Sort by label
  ?.map(([ruleName, ruleProps]) => ({
    rule: ruleName,
    ...ruleProps
  }));

let ruleCondition = {};
let valueMappings = {};

Object.keys(allRules).forEach(ruleName => {
  ruleCondition[ruleName] = allRules[ruleName].defaultCondition;
  valueMappings[ruleName] = allRules[ruleName].defaultValue;
});

// Update ruleCondition and valueMappings based on existing rules
ruleOfList.forEach(rule => {
ruleCondition[rule.name] = rule.condition || allRules[rule.name].defaultCondition;
valueMappings[rule.name] = rule.value || allRules[rule.name].defaultValue;
});



async function handleDeleteRule(state) {
  for (let i = 0; i < ruleOfList.length; i++) {
    if (ruleOfList[i].name === state) {
      ruleOfList.splice(i, 1); // Remove the element at index i from the ruleOfList
      ruleOfList = [...ruleOfList]
      break; // Exit the loop after deleting the element
    }
  }

  if(ruleOfList?.length === 0)
  {
    ruleName = '';
  }
  else if (state === ruleName)
  {
    ruleName = '';
  }
  
  displayRules = allRows?.filter(row => ruleOfList.some(rule => rule.name === row.rule));
  shouldLoadWorker.set(true);
}
      

      
async function handleResetAll() {
  ruleOfList = [];
  ruleOfList = [...ruleOfList];
  ruleName = '';
  filterQuery = '';
  checkedItems = new Set();
  Object.keys(allRules).forEach(ruleName => {
    ruleCondition[ruleName] = allRules[ruleName].defaultCondition;
    valueMappings[ruleName] = allRules[ruleName].defaultValue;
  });
  displayRules = allRows?.filter(row => ruleOfList.some(rule => rule.name === row.rule));
  displayedData = rawData;
  await saveCookieRuleOfList()

}

function changeRule(state: string)  
{
  searchTerm = '';
  ruleName = state;
  handleAddRule()

  //const closePopup = document.getElementById("ruleModal");
  //closePopup?.dispatchEvent(new MouseEvent('click'))
}

function handleAddRule() {
    
    if (ruleName === '') {
      toast.error('Please select a rule', {
        style: 'border-radius: 200px; background: #333; color: #fff;'
      });
      return;
    }
  
    let newRule;
  
   switch (ruleName) {
      case "put_call":
      case "sentiment":
      case "execution_estimate":
      case "option_activity_type":
      case "date_expiration":
      case "underlying_type":
        newRule = { name: ruleName, value: Array.isArray(valueMappings[ruleName]) ? valueMappings[ruleName] : [valueMappings[ruleName]] }; // Ensure value is an array
        break;
      default:
        newRule = { 
          name: ruleName, 
          condition: ruleCondition[ruleName], 
          value: valueMappings[ruleName] 
        };
        break;
    }
    handleRule(newRule);
}



async function handleRule(newRule) {
  const existingRuleIndex = ruleOfList.findIndex(rule => rule.name === newRule.name);
  
  if (existingRuleIndex !== -1) {
    const existingRule = ruleOfList[existingRuleIndex];
    if (existingRule.name === newRule.name) {
      // Remove the rule instead of showing an error
      ruleOfList.splice(existingRuleIndex, 1);
      ruleOfList = [...ruleOfList]; // Trigger reactivity
          Object.keys(allRules).forEach(ruleName => {
        ruleCondition[ruleName] = allRules[ruleName].defaultCondition;
        valueMappings[ruleName] = allRules[ruleName].defaultValue;
      });
      displayRules = allRows?.filter(row => ruleOfList.some(rule => rule.name === row.rule));
    } else {
      ruleOfList[existingRuleIndex] = newRule;
      ruleOfList = [...ruleOfList]; // Trigger reactivity
    }
  } else {
    ruleOfList = [...ruleOfList, newRule];
    /*
    toast.success('Rule added', {
      style: 'border-radius: 200px; background: #333; color: #fff;'
    });
    */

    shouldLoadWorker.set(true);
  }
}

const loadWorker = async () => {
    syncWorker.postMessage({ rawData, ruleOfList, filterQuery });
};

const handleMessage = (event) => {
    displayRules = allRows?.filter(row => ruleOfList.some(rule => rule.name === row.rule));
    displayedData = event.data?.filteredData ?? [];
    console.log('handle Message')
    calculateStats(displayedData);

    //console.log(displayedData)
};


function changeRuleCondition(name: string, state: string) {
  ruleName = name;
  ruleCondition[ruleName] = state;
}

let checkedItems = new Set(ruleOfList.flatMap(rule => rule.value));

function isChecked(item) {
    return checkedItems.has(item);
  }

async function handleChangeValue(value) {


  if (checkedItems.has(value)) {
      checkedItems.delete(value);
    } else {
      checkedItems.add(value);
    }
  if (["put_call","sentiment","execution_estimate","option_activity_type","date_expiration","underlying_type"]?.includes(ruleName)) {
    // Ensure valueMappings[ruleName] is initialized as an array
    if (!Array.isArray(valueMappings[ruleName])) {
      valueMappings[ruleName] = []; // Initialize as an empty array if not already
    }

    const index = valueMappings[ruleName].indexOf(value);
    if (index === -1) {
      // Add the country if it's not already selected
      valueMappings[ruleName].push(value);
    } else {
      // Remove the country if it's already selected (deselect)
      valueMappings[ruleName].splice(index, 1);
    }

    // If no countries are selected, set value to "any"
    if (valueMappings[ruleName].length === 0) {
      valueMappings[ruleName] = "any";
    }
    
  } else if (ruleName in valueMappings) {
    // Handle non-country rules as single values
    valueMappings[ruleName] = value;
  } else {
    console.warn(`Unhandled rule: ${ruleName}`);
  }

   const ruleToUpdate = ruleOfList?.find(rule => rule.name === ruleName);
    if (ruleToUpdate) {
      ruleToUpdate.value = valueMappings[ruleToUpdate.name];
      ruleToUpdate.condition = ruleCondition[ruleToUpdate.name];
      ruleOfList = [...ruleOfList];
    }

    shouldLoadWorker.set(true);
    await saveCookieRuleOfList()


}














const nyseDate = new Date(data?.getOptionsFlowFeed?.at(0)?.date ?? null)?.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Europe/Berlin' 
});

let rawData = data?.getOptionsFlowFeed?.filter(item => 
  Object?.values(item)?.every(value => 
    value !== null && value !== undefined && 
    (typeof value !== 'object' || Object?.values(value)?.every(subValue => subValue !== null && subValue !== undefined))
  )
);
  rawData?.forEach((item) => {
        item.dte = daysLeft(item?.date_expiration);
    });
  
  let displayedData =[];

  let flowSentiment;
  let putCallRatio;
  let displayCallVolume;
  let displayPutVolume;
  let callPercentage;
  let putPercentage;
  let mostFrequentTicker;
  let highestVolumeTicker;
  let highestPremiumTicker;
  let highestOpenInterestTicker;
  
  let audio;
  let muted = true;
  let newIncomingData = false;
  let previousCallVolume = 0; //This is needed to play the sound only if it changes.
  let notFound = false;
  let isLoaded = false;
  let mode = $isOpen === true ? true : false;
  let showMore = false;
  
  let optionSymbol;
  let optionDescription;
  let optionPremium;
  let optionExpiry;
  let optionContract;
  let optionType;
  let optionStrike;
  let optionVolume;
  let optionSpot;

  let optionOpenInterest;
  let optionSentiment;
  let optionPrice;
  let optionexecution_estimate;


  function toggleMode()
  {
      if ($isOpen) {
        mode = !mode;
      }
      else {
        toast.error(`Market is closed`, {
            style: 'border-radius: 200px; background: #333; color: #fff;'
        });

      }
     
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

function handleViewData(optionData) {
  //optionStart = optionData['Start Date'] === null ? 'n/a' : new Date(optionData['Start Date'])?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', daySuffix: '2-digit' });
  optionSymbol = optionData?.option_symbol;
  optionDescription = optionData?.description;
  optionPremium = abbreviateNumber(optionData?.cost_basis,true);
  optionExpiry = reformatDate(optionData?.date_expiration);
  optionContract = optionData?.put_call;
  optionType = optionData?.option_activity_type;
  optionStrike = optionData?.strike_price;
  optionVolume = new Intl.NumberFormat("en", {minimumFractionDigits: 0, maximumFractionDigits: 0}).format(optionData?.volume);
  optionSpot = optionData?.underlying_price;
  optionOpenInterest = new Intl.NumberFormat("en", {minimumFractionDigits: 0, maximumFractionDigits: 0}).format(optionData?.open_interest);
  optionSentiment = optionData?.sentiment;
  optionPrice = optionData?.price;
  //optionTradeCount = optionData?.tradeCount;
  optionexecution_estimate = optionData?.execution_estimate;
  //optionExchange = optionData?.exchange;

  const openPopup = $screenWidth < 640 ? document.getElementById("optionDetailsMobileModal") : document.getElementById("optionDetailsDesktopModal");
  openPopup?.dispatchEvent(new MouseEvent('click'))

}
/*
function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    console.error("WebSocket is not open. Unable to send message.");
  }
}
*/

async function websocketRealtimeData() {
  let newData = [];
  try {
    socket = new WebSocket(data?.wsURL + "/options-flow-reader");
    /*
    socket.addEventListener("open", () => {
      const ids = rawData.map(item => item.id);
      sendMessage(JSON.stringify({ ids }));
    });
    */

    socket.addEventListener('message', (event) => {
      previousCallVolume = displayCallVolume ?? 0;
      if (mode === true) {
        try {
          newData = JSON.parse(event.data) ?? [];
          if (newData?.length !== 0) {
            newData.forEach((item) => {
              item.dte = daysLeft(item?.date_expiration);
            });
            rawData = newData;
          }

          if (ruleOfList?.length !== 0 || filterQuery?.length !== 0) {
            shouldLoadWorker.set(true);
          }
          if (previousCallVolume !== displayCallVolume && !muted && audio) {
            audio?.play();
          }
        } catch (e) {
          console.error('Error processing WebSocket message:', e);
        }
      }
    });

    socket.addEventListener('close', (event) => {
      console.log('WebSocket connection closed:', event.reason);
      // Handle disconnection, you might want to attempt to reconnect here
      setTimeout(() => websocketRealtimeData(), 5000); // Attempt to reconnect after 5 seconds
    });

    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      // Handle WebSocket errors here
    });

  } catch (error) {
    console.error('WebSocket connection error:', error);
    // Handle connection errors here
    setTimeout(() => websocketRealtimeData(), 5000); // Attempt to reconnect after 5 seconds
  }
}

function daysLeft(targetDate) {
  const targetTime = new Date(targetDate).getTime();
  const currentTime = new Date().getTime();
  const difference = targetTime - currentTime;

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math?.ceil(difference / millisecondsPerDay);

  return daysLeft;
}
    
async function saveCookieRuleOfList() {
    const postData = {
      'ruleOfList' : ruleOfList
    }

    const response = await fetch('/api/options-flow-filter-cookie', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postData),
      }); // make a POST request to the server with the FormData object
}

  onMount(async () => {

    displayRules = allRows?.filter(row => ruleOfList?.some(rule => rule?.name === row?.rule));


    audio = new Audio(notifySound);
    displayedData = rawData;
    calculateStats(rawData);

     if (!syncWorker) {
        const SyncWorker = await import('./workers/filterWorker?worker');
        syncWorker = new SyncWorker.default();
        syncWorker.onmessage = handleMessage;
    }

    shouldLoadWorker.subscribe(async (value) => {
    if (value) {
      isLoaded = false;
      await loadWorker();
      shouldLoadWorker.set(false); // Reset after worker is loaded
      isLoaded = true;
    }
  });

    if(ruleOfList?.length !== 0) {
      shouldLoadWorker.set(true);
      console.log('initial filter') 
    }    

    isLoaded = true;
    /*
    if ($isOpen) {
      await websocketRealtimeData();
    }
    */

    

  });
  
onDestroy(async() => {

 try {
      //socket?.send('close')
      socket?.close();
    } catch (e) {
      console.log(e);
    }
    if (audio) {
      audio?.pause();
      audio = null;
    }

  
  })
  
  
  function reformatDate(dateString) {
      return dateString.substring(5, 7) + '/' + dateString.substring(8) + '/' + dateString.substring(2, 4);
  }
  
  
  
function calculateStats(data) {
    const { callVolumeSum, putVolumeSum, bullishCount, bearishCount, neutralCount } = data?.reduce((acc, item) => {
      const volume = parseInt(item?.volume);
  
      if (item?.put_call === "Calls") {
        acc.callVolumeSum += volume;
      } else if (item?.put_call === "Puts") {
        acc.putVolumeSum += volume;
      }

      if (item?.sentiment === "Bullish") {
        acc.bullishCount += 1;
      } else if (item?.sentiment === "Bearish") {
        acc.bearishCount += 1;
      } else if (item?.sentiment === "Neutral") {
        acc.neutralCount += 1;
      }
  
        return acc;
      }, { callVolumeSum: 0, putVolumeSum: 0, bullishCount: 0, bearishCount: 0, neutralCount: 0 });

      if (bullishCount > bearishCount) {
        flowSentiment = 'Bullish';
      } else if (bullishCount < bearishCount) {
        flowSentiment = 'Bearish';
      } else if (neutralCount > bearishCount && neutralCount > bullishCount) {
        flowSentiment = 'Neutral';
      } else {
        flowSentiment = '-';
      }


      putCallRatio = callVolumeSum !== 0 ? (putVolumeSum / callVolumeSum) : 0;
      
      callPercentage = (callVolumeSum+putVolumeSum) !== 0 ? Math.floor((callVolumeSum)/(callVolumeSum+putVolumeSum)*100) : 0;
      putPercentage = (callVolumeSum+putVolumeSum) !== 0 ? (100-callPercentage) : 0;
  
      displayCallVolume = callVolumeSum;
      displayPutVolume = putVolumeSum;

      mostFrequentTicker = findMostFrequentTicker(data);
      highestVolumeTicker = findHighestVolume(data);
      highestPremiumTicker = findHighestCostBasis(data);
      highestOpenInterestTicker = findHighestOpenInterest(data);

  }
  
  function findMostFrequentTicker(data) {
    const tickerCountMap = new Map();
    // Iterate through the data and update the count for each ticker
    data?.forEach(item => {
      const ticker = item?.ticker;
      if (tickerCountMap?.has(ticker)) {
        tickerCountMap?.set(ticker, tickerCountMap?.get(ticker) + 1);
      } else {
        tickerCountMap?.set(ticker, 1);
      }
    });
  
    let maxTicker;
    let maxCount = -1;
  
    // Find the ticker with the highest count
    tickerCountMap?.forEach((count, ticker) => {
      if (count > maxCount) {
        maxCount = count;
        maxTicker = ticker;
      }
    });
  
    return { ticker: maxTicker, count: maxCount };
  }
  
  function findHighestVolume(data) {
    let maxVolume = -1;
    let maxVolumeTicker = null;
  
    // Iterate through the data and find the ticker with the highest volume
    data?.forEach(item => {
      const volume = parseInt(item?.volume); // Assuming volume is a string, parse it to an integer
      if (volume > maxVolume) {
        maxVolume = volume;
        maxVolumeTicker = item?.ticker;
      }
    });
  
    return { ticker: maxVolumeTicker, volume: maxVolume };
  }
  
  function findHighestCostBasis(data) {
    let maxCostBasis = -1;
    let maxCostBasisTicker = null;
  
    // Iterate through the data and find the ticker with the highest cost basis
    data?.forEach(item => {
      if (item?.cost_basis > maxCostBasis) {
        maxCostBasis = item?.cost_basis;
        maxCostBasisTicker = item?.ticker;
      }
    });
  
    return { ticker: maxCostBasisTicker, costBasis: maxCostBasis };
  }
  
  function findHighestOpenInterest(data) {
    let maxOpenInterest = -1;
    let maxOpenInterestTicker = null;
  
    // Iterate through the data and find the ticker with the highest open interest
    data?.forEach(item => {
      const openInterest = parseInt(item?.open_interest); // Assuming open interest is a string, parse it to an integer
      if (openInterest > maxOpenInterest) {
        maxOpenInterest = openInterest;
        maxOpenInterestTicker = item?.ticker;
      }
    });
  
    return { ticker: maxOpenInterestTicker, openInterest: maxOpenInterest };
  }
  
  
const getHistoricalFlow = async () => {
  // Create a delay using setTimeout wrapped in a Promise
  if(data?.user?.tier === 'Pro') {
    isLoaded = false;

    displayRules = allRows?.filter(row => ruleOfList.some(rule => rule.name === row.rule));
    displayedData = [];
    calculateStats(displayedData);

    await new Promise(resolve => setTimeout(resolve, 300));

    // Make the POST request after the delay
    const convertDate = new Date(df.format(selectedDate?.toDate()))
    const year = convertDate?.getFullYear();
    const month = String(convertDate?.getMonth() + 1).padStart(2, '0');
    const day = String(convertDate?.getDate()).padStart(2, '0');
    
    const postData = { 'selectedDate': `${year}-${month}-${day}`}  

      try {
      const response = await fetch('/api/options-historical-flow', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });

        rawData = await response?.json();
        if(rawData?.length !== 0) {
          rawData?.forEach((item) => {
          item.dte = daysLeft(item?.date_expiration);
          });
          shouldLoadWorker.set(true);
        }
      } catch (error) {
        console.error("Error fetching historical flow:", error);
        rawData = [];
      } finally {
        isLoaded = true;
      }
  
  }
  else {
    toast.error('Only for Pro Members', {
        style: 'border-radius: 200px; background: #333; color: #fff;'
      });
  }

};



  function handleInput(event) {
    filterQuery = event.target.value;

    setTimeout(() => {
        shouldLoadWorker.set(true)
    }, 0);
}

function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

const debouncedHandleInput = debounce(handleInput, 300);

$: {
  if(searchTerm)
  {
    filteredRows = allRows?.filter((row) => row?.label?.toLowerCase()?.includes(searchTerm?.toLowerCase()));
  }
}

  
$: {
  if (ruleOfList) {
    const ruleToUpdate = ruleOfList?.find(rule => rule?.name === ruleName);
    if (ruleToUpdate) {
      ruleToUpdate.value = valueMappings[ruleToUpdate.name];
      ruleToUpdate.condition = ruleCondition[ruleToUpdate.name];
      ruleOfList = [...ruleOfList];
      console.log('test')
      shouldLoadWorker.set(true);

    }
  }
}




</script>
         
  
  <svelte:head>
  
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
  
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ''} Options Flow Feed · stocknear
  </title>
  <meta name="description" content={`Explore unusual options from big institutional traders and hedge funds.`} />
  
  <!-- Other meta tags -->
  <meta property="og:title" content={`Options Flow Feed · stocknear`}/>
  <meta property="og:description" content={`Explore unusual options from big institutional traders and hedge funds.`} />
  <meta property="og:type" content="website"/>
  <!-- Add more Open Graph meta tags as needed -->
  
  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content={`Options Flow Feed · stocknear`}/>
  <meta name="twitter:description" content={`Explore unusual options from big institutional traders and hedge funds.`} />
  <!-- Add more Twitter meta tags as needed -->
  
  </svelte:head>
    
<body class="xl:fixed h-screen w-full max-w-screen-xl">

 

  <section class="w-full max-w-screen sm:max-w-6xl xl:max-w-7xl flex justify-center items-center  bg-[#09090B] pb-20">
      
    
      <div class="w-full m-auto pl-3 pr-3">
        <!--
        <div class="text-sm sm:text-[1rem] breadcrumbs mb-5">
          <ul>
            <li><a href="/" class="text-gray-300">Home</a></li>
            <li class="text-gray-300">Options Flow</li>
          </ul>
        </div>
        -->

        {#if !$isOpen}
          <div class="text-white text-sm sm:text-[1rem] italic text-center sm:text-start w-full ml-2 mb-3">
            Live flow of {data?.user?.tier === 'Pro' && selectedDate ? df.format(selectedDate?.toDate()) : nyseDate} (NYSE Time)
          </div>
        {/if}

        


      


         <div class="rounded-md border border-gray-700 bg-[#262626] p-2">
              <div class="flex flex-col sm:flex-row items-center pt-3 sm:pt-1 pb-3 sm:border-b sm:border-gray-600">
                <div class="flex flex-row items-center justify-center sm:justify-start">
                  <label data-tip="Audio Preference" on:click={() => muted = !muted} class="xl:tooltip xl:tooltip-bottom flex flex-col items-center mr-3 cursor-pointer">
                    <div class="rounded-full w-10 h-10 relative bg-[#000] flex items-center justify-center">
                      {#if !muted}
                      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="#fff" d="M9 2.5a.5.5 0 0 0-.849-.358l-2.927 2.85H3.5a1.5 1.5 0 0 0-1.5 1.5v2.99a1.5 1.5 0 0 0 1.5 1.5h1.723l2.927 2.875A.5.5 0 0 0 9 13.5zm1.111 2.689a.5.5 0 0 1 .703-.08l.002.001l.002.002l.005.004l.015.013l.046.04c.036.034.085.08.142.142c.113.123.26.302.405.54c.291.48.573 1.193.573 2.148c0 .954-.282 1.668-.573 2.148a3.394 3.394 0 0 1-.405.541a2.495 2.495 0 0 1-.202.196l-.008.007h-.001s-.447.243-.703-.078a.5.5 0 0 1 .075-.7l.002-.002l-.001.001l.002-.001h-.001l.018-.016c.018-.017.048-.045.085-.085a2.4 2.4 0 0 0 .284-.382c.21-.345.428-.882.428-1.63c0-.747-.218-1.283-.428-1.627a2.382 2.382 0 0 0-.368-.465a.5.5 0 0 1-.096-.717m1.702-2.08a.5.5 0 1 0-.623.782l.011.01l.052.045c.047.042.116.107.201.195c.17.177.4.443.63.794c.46.701.92 1.733.92 3.069a5.522 5.522 0 0 1-.92 3.065c-.23.35-.46.614-.63.79a3.922 3.922 0 0 1-.252.24l-.011.01h-.001a.5.5 0 0 0 .623.782l.033-.027l.075-.065c.063-.057.15-.138.253-.245a6.44 6.44 0 0 0 .746-.936a6.522 6.522 0 0 0 1.083-3.614a6.542 6.542 0 0 0-1.083-3.618a6.517 6.517 0 0 0-.745-.938a4.935 4.935 0 0 0-.328-.311l-.023-.019l-.007-.006l-.002-.002zM10.19 5.89l-.002-.001Z"/></svg>
                      {:else}
                      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M3.28 2.22a.75.75 0 1 0-1.06 1.06L6.438 7.5H4.25A2.25 2.25 0 0 0 2 9.749v4.497a2.25 2.25 0 0 0 2.25 2.25h3.68a.75.75 0 0 1 .498.19l4.491 3.994c.806.716 2.081.144 2.081-.934V16.06l5.72 5.72a.75.75 0 0 0 1.06-1.061zm13.861 11.74l1.138 1.137A6.974 6.974 0 0 0 19 12a6.973 6.973 0 0 0-.84-3.328a.75.75 0 0 0-1.32.714c.42.777.66 1.666.66 2.614c0 .691-.127 1.351-.359 1.96m2.247 2.246l1.093 1.094A9.956 9.956 0 0 0 22 12a9.959 9.959 0 0 0-1.96-5.946a.75.75 0 0 0-1.205.892A8.459 8.459 0 0 1 20.5 12a8.458 8.458 0 0 1-1.112 4.206M9.52 6.338l5.48 5.48V4.25c0-1.079-1.274-1.65-2.08-.934z"/></svg>
                      {/if}
                    </div>
                  </label>
                  
    
                <span class="text-xs sm:text-sm sm:text-lg {!mode ? 'text-white' : 'text-gray-400'} mr-3">
                    {$isOpen ? 'Paused' : 'Market Closed'}
                </span>
                
                <label class="inline-flex cursor-pointer relative focus-none">
                  <input on:click={toggleMode} type="checkbox" class="toggle toggle-success" checked={mode} value={mode} disabled={!$isOpen ? true : false} />
                </label>

    
              
                <div class="ml-3 flex flex-col items-start">
                    <span class="text-xs sm:text-sm sm:text-lg {mode ? 'text-white' : 'text-gray-400'}">
                      Live Flow
                    </span>
                </div>
              
              
                </div>

                <div class="sm:ml-auto w-full sm:w-fit pt-5">
                    <div class="relative flex flex-col sm:flex-row items-center">

      
                        <div class="relative w-full sm:w-fit pl-3  sm:mr-5 mb-4 sm:mb-0 flex-auto text-center bg-[#313131] rounded-md border border-gray-600">
                          <label class="flex flex-row items-center ">
                            <input 
                            id="modal-search"
                              type="search" 
                              class="text-white sm:ml-2 text-[1rem] placeholder-gray-300 border-transparent focus:border-transparent focus:ring-0 flex items-center justify-center w-full px-0 py-1.5 bg-inherit"
                              placeholder="Find by Symbol"
                              bind:value={filterQuery}
                              on:input={debouncedHandleInput}
                              autocomplete="off"
                            />
                            <svg class="ml-auto h-7 w-7 sm:h-8 sm:w-8 inline-block mr-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="m19.485 20.154l-6.262-6.262q-.75.639-1.725.989t-1.96.35q-2.402 0-4.066-1.663T3.808 9.503T5.47 5.436t4.064-1.667t4.068 1.664T15.268 9.5q0 1.042-.369 2.017t-.97 1.668l6.262 6.261zM9.539 14.23q1.99 0 3.36-1.37t1.37-3.361t-1.37-3.36t-3.36-1.37t-3.361 1.37t-1.37 3.36t1.37 3.36t3.36 1.37"/></svg>
                          </label>
                          {#if notFound === true}
                          <span class="absolute left-1 -bottom-6 label-text text-error text-[0.65rem] mt-2">
                              No Results Found
                          </span>
                          {/if}
                        </div>

                      <Popover.Root>
                        <Popover.Trigger asChild let:builder>
                          <Button
                            class={cn(
                              "w-full sm:w-[160px] truncate sm:mr-3 py-3 bg-[#000] sm:hover:bg-[#000] sm:hover:text-white text-white justify-center sm:justify-start text-center sm:text-left font-normal border-none rounded-md",
                              !selectedDate && "text-gray-300"
                            )}
                            builders={[builder]}
                          >
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {selectedDate ? df.format(selectedDate?.toDate()) : "Pick a date"}
                          </Button>
                        </Popover.Trigger>
                        <Popover.Content class="w-auto p-0 border-gray-500">
                          <Calendar class="bg-[#09090B] text-white" bind:value={selectedDate} initialFocus onValueChange={getHistoricalFlow}/>
                        </Popover.Content>
                      </Popover.Root>


                </div>
              </div>

              </div>

              
                <div class="mr-1 flex items-center justify-between lg:mr-2 pb-1.5 border-b border-gray-600 mt-1.5">
                    <button on:click={() => showFilters = !showFilters} class="flex cursor-pointer items-center text-lg sm:text-xl font-semibold text-gray-200" title="Hide Filter Area">
                      <svg class="-mb-0.5 h-6 w-6 {showFilters ? '' : '-rotate-90'} " viewBox="0 0 20 20" fill="currentColor" style="max-width:40px">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                        {ruleOfList?.length} Filters
                    </button> 
                </div>

                {#if showFilters}
                <div class="sm:mt-3 flex flex-col gap-y-2.5 sm:flex-row lg:gap-y-2 pb-1">
                    <label for="ruleModal" class="inline-flex cursor-pointer items-center justify-center space-x-1 whitespace-nowrap rounded-md border border-transparent bg-blue-brand_light py-2 pl-3 pr-4 text-base font-semibold text-white shadow-sm bg-[#000] sm:hover:bg-[#09090B]/60 ease-out  focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-smaller">
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style="max-width:40px" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                        </svg> 
                        <div>Add Filters</div>
                    </label>

                    {#if ruleOfList?.length !== 0}
                    <label on:click={handleResetAll} class="sm:ml-3 cursor-pointer inline-flex items-center justify-center space-x-1 whitespace-nowrap rounded-md border border-transparent bg-blue-brand_light py-2 pl-3 pr-4 text-base font-semibold text-white shadow-sm bg-[#000] sm:hover:text-red-500 ease-out  focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-smaller">
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3.578 6.487A8 8 0 1 1 2.5 10.5"/><path d="M7.5 6.5h-4v-4"/></g></svg>
                        <div>Reset All</div>
                    </label>
                    {/if}

                </div> 


                <div class="sm:grid sm:grid-cols-2 sm:gap-x-2.5 lg:grid-cols-3 w-full mt-2 border-t border-b border-gray-600">
                  {#each displayRules as row (row?.rule)}
                    <!--Start Added Rules-->
                    <div class="flex items-center justify-between space-x-2 px-1 py-1.5 text-smaller leading-tight text-default">
                      <div class="text-white text-[1rem]">
                          {row?.label?.replace('[%]','')}
                      </div> 
                      <div class="flex items-center">
                          <button on:click={() => handleDeleteRule(row?.rule)} class="mr-1.5 cursor-pointer text-gray-300 sm:hover:text-red-500 focus:outline-none" title="Remove filter">
                              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="CurrentColor" style="max-width:40px">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                          </button> 
                          <div class="relative inline-block text-left">
                            <div on:click={() => ruleName = row?.rule}>
                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild let:builder>
                                  <Button builders={[builder]}  class="bg-[#000] h-[40px] flex flex-row justify-between items-center w-[150px] xs:w-[140px] sm:w-[150px] px-3 text-white rounded-md truncate">
                                    <span class="truncate ml-2 text-sm sm:text-[1rem]">
                                      {#if valueMappings[row?.rule] === 'any'} 
                                      Any
                                      {:else}
                                      {ruleCondition[row?.rule] !== undefined ? ruleCondition[row?.rule] : ''} {valueMappings[row?.rule]}
                                      {/if}
                                    </span> 
                                    <svg class=" ml-1 h-6 w-6 xs:ml-2 inline-block" viewBox="0 0 20 20" fill="currentColor" style="max-width:40px" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                    </svg>
                                  </Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content class="w-56 h-fit max-h-72 overflow-y-auto scroller">
                                  {#if !['put_call',"sentiment", "execution_estimate","option_activity_type","date_expiration","underlying_type"]?.includes(row?.rule)}
                                  <DropdownMenu.Label class="absolute mt-2 h-11 border-gray-800 border-b -top-1 z-20 fixed sticky bg-[#09090B]">
                                    <div class="flex items-center justify-start gap-x-1">
                                        <div class="relative inline-block flex flex-row items-center justify-center">
                                            <label on:click={() => changeRuleCondition(row?.rule, 'under')} class="cursor-pointer flex flex-row mr-2 justify-center items-center">
                                              <input type="radio" class="radio checked:bg-purple-600 bg-[#09090B] border border-slate-800 mr-2" 
                                                  checked={ruleCondition[row?.rule] === 'under'} name={row?.rule} />
                                              <span class="label-text text-white">Under</span> 
                                            </label>
                                            <label on:click={() => changeRuleCondition(row?.rule, 'over')} class="cursor-pointer flex flex-row ml-2 justify-center items-center">
                                              <input type="radio" class="radio checked:bg-purple-600 bg-[#09090B] border border-slate-800 mr-2"
                                                checked={ruleCondition[row?.rule] === 'over'} name={row?.rule} />
                                              <span class="label-text text-white">Over</span> 
                                            </label>
                                        </div>
                                    </div> 
                                  </DropdownMenu.Label>
                                  {:else}
                                  <div class="relative sticky z-40 focus:outline-none -top-1"
                                      tabindex="0" role="menu" style="">
                                  
                                  </div>
                                  {/if}
                                  <DropdownMenu.Group class="min-h-10 mt-2">
                                    {#if !['put_call',"sentiment", "execution_estimate","option_activity_type","date_expiration","underlying_type"]?.includes(row?.rule)}
                                      {#each row?.step as newValue}
                                        <DropdownMenu.Item class="sm:hover:bg-[#27272A]">

                                        <button on:click={() => {handleChangeValue(newValue)}} class="block w-full border-b border-gray-600 px-4 py-1.5 text-left text-sm sm:text-[1rem] rounded text-white last:border-0 sm:hover:bg-[#27272A] focus:bg-blue-100 focus:text-gray-900 focus:outline-none">            
                                            {ruleCondition[row?.rule] !== undefined ? ruleCondition[row?.rule] : ''} {newValue}
                                        </button>
                                        </DropdownMenu.Item>      
                                      {/each}
                                    {:else if ['put_call',"sentiment", "execution_estimate","option_activity_type","date_expiration","underlying_type"]?.includes(row?.rule)}
                                      {#each row?.step as item}
                                        <DropdownMenu.Item class="sm:hover:bg-[#27272A]">
                                          <div class="flex items-center" on:click|capture={(event) => event.preventDefault()}>
                                            <label on:click={() => {handleChangeValue(item)}} class="cursor-pointer text-white" for={item}>
                                              <input type="checkbox" class="rounded" checked={isChecked(item)}>
                                              <span class="ml-2">{item}</span>
                                            </label>
                                          </div>
                                        </DropdownMenu.Item>     
                                      {/each}

                                    {/if}                      
                                  </DropdownMenu.Group>
                                </DropdownMenu.Content>
                              </DropdownMenu.Root>
                            </div>
                          </div>
                      </div>
                    </div>
                    <!--End Added Rules-->
                {/each}
                </div>

                {/if}
                
            </div>
  
          
    

  
          {#if isLoaded }

  
          <div class="w-full mt-5 m-auto flex justify-center items-center">

            
            <div class="w-full grid grid-cols-1 lg:grid-cols-4 gap-y-3 gap-x-3 ">

              
              <!--Start Flow Sentiment-->  
              <div class="flex flex-row items-center flex-wrap w-full px-5 bg-[#262626] shadow-lg rounded-md h-20">
                  <div class="flex flex-col items-start">
                      <span class="font-semibold text-gray-200 text-sm sm:text-[1rem] ">Flow Sentiment</span>
                      <span class="text-start text-[1rem] font-semibold {flowSentiment === 'Bullish' ? 'text-[#00FC50]' : flowSentiment === 'Bearish' ? 'text-[#FC2120]' : flowSentiment === 'Neutral' ? 'text-[#FBCE3C]' : 'text-white'}">{flowSentiment}</span>
                  </div>
                  
              </div>
              <!--End Flow Sentiment-->
               <!--Start Put/Call-->  
               <div class="flex flex-row items-center flex-wrap w-full px-5 bg-[#262626] shadow-lg rounded-md h-20">
                <div class="flex flex-col items-start">
                    <span class="font-semibold text-gray-200 text-sm sm:text-[1rem] ">Put/Call</span>
                    <span class="text-start text-[1rem] font-semibold text-white">
                      {putCallRatio?.toFixed(3)}
                    </span>
                </div>
                <!-- Circular Progress -->
                  <div class="relative size-14 ml-auto">
                    <svg class="size-full w-14 h-14" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                      <!-- Background Circle -->
                      <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-[#3E3E3E]" stroke-width="3"></circle>
                      <!-- Progress Circle inside a group with rotation -->
                      <g class="origin-center -rotate-90 transform">
                        <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-blue-500" stroke-width="3" stroke-dasharray="100" stroke-dashoffset={putCallRatio >=1 ? 0 : 100-(putCallRatio*100)?.toFixed(2)}></circle>
                      </g>
                    </svg>
                    <!-- Percentage Text -->
                    <div class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                      <span class="text-center text-white text-sm">{putCallRatio?.toFixed(2)}</span>
                    </div>
                  </div>
                <!-- End Circular Progress -->

            </div>
            <!--End Put/Call-->
             <!--Start Call Flow-->  
             <div class="flex flex-row items-center flex-wrap w-full px-5 bg-[#262626] shadow-lg rounded-md h-20">
              <div class="flex flex-col items-start">
                  <span class="font-semibold text-gray-200 text-sm sm:text-[1rem] ">Call Flow</span>
                  <span class="text-start text-[1rem] font-semibold text-white">
                    {new Intl.NumberFormat("en", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                  }).format(displayCallVolume)}
                  </span>
              </div>
               <!-- Circular Progress -->
               <div class="relative size-14 ml-auto">
                <svg class="size-full w-14 h-14" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                  <!-- Background Circle -->
                  <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-[#3E3E3E]" stroke-width="3"></circle>
                  <!-- Progress Circle inside a group with rotation -->
                  <g class="origin-center -rotate-90 transform">
                    <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-[#00FC50]" stroke-width="3" stroke-dasharray="100" stroke-dashoffset={100-callPercentage?.toFixed(2)}></circle>
                  </g>
                </svg>
                <!-- Percentage Text -->
                <div class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                  <span class="text-center text-white text-sm">{callPercentage}%</span>
                </div>
              </div>
              <!-- End Circular Progress -->
            </div>
            <!--End Call Flow-->
            <!--Start Put Flow-->  
            <div class="flex flex-row items-center flex-wrap w-full px-5 bg-[#262626] shadow-lg rounded-md h-20">
              <div class="flex flex-col items-start">
                  <span class="font-semibold text-gray-200 text-sm sm:text-[1rem] ">Put Flow</span>
                  <span class="text-start text-[1rem] font-semibold text-white">
                    {new Intl.NumberFormat("en", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                  }).format(displayPutVolume)}
                  </span>
              </div>
               <!-- Circular Progress -->
               <div class="relative size-14 ml-auto">
                <svg class="size-full w-14 h-14" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                  <!-- Background Circle -->
                  <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-[#3E3E3E]" stroke-width="3"></circle>
                  <!-- Progress Circle inside a group with rotation -->
                  <g class="origin-center -rotate-90 transform">
                    <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-[#EE5365]" stroke-width="3" stroke-dasharray="100" stroke-dashoffset={100-putPercentage?.toFixed(2)}></circle>
                  </g>
                </svg>
                <!-- Percentage Text -->
                <div class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                  <span class="text-center text-white text-sm">{putPercentage}%</span>
                </div>
              </div>
              <!-- End Circular Progress -->
            </div>
            <!--End Put Flow-->
            <!--
            {#if showMore}

            <div class="flex flex-row items-center flex-wrap w-full px-5 bg-[#262626] shadow-lg rounded-md h-20">
              <div class="flex flex-col items-start">
                  <span class="font-semibold text-gray-200 text-sm sm:text-[1rem] ">Most Traded Option</span>
                  <span class="text-start text-[1rem] font-semibold text-white mt-0.5">
                    <span class="text-blue-400 ">
                      {mostFrequentTicker?.ticker}
                    </span>
                    {new Intl.NumberFormat("en", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                  }).format(mostFrequentTicker?.count)}
                  </span>
              </div>
            </div>

             <div class="flex flex-row items-center flex-wrap w-full px-5 bg-[#262626] shadow-lg rounded-md h-20">
              <div class="flex flex-col items-start">
                  <span class="font-semibold text-gray-200 text-sm sm:text-[1rem] ">Highest Premium</span>
                  <span class="text-start text-[1rem] font-semibold text-white mt-0.5">
                    <span class="text-blue-400 ">
                      {highestPremiumTicker?.ticker}
                    </span>
                    ${new Intl.NumberFormat("en", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                  }).format(highestPremiumTicker?.costBasis)}
                  </span>
              </div>
            </div>

            
            <div class="flex flex-row items-center flex-wrap w-full px-5 bg-[#262626] shadow-lg rounded-md h-20">
              <div class="flex flex-col items-start">
                  <span class="font-semibold text-gray-200 text-sm sm:text-[1rem] ">Highest Volume</span>
                  <span class="text-start text-[1rem] font-semibold text-white mt-0.5">
                    <span class="text-blue-400 ">
                      {highestVolumeTicker?.ticker}
                    </span>
                    {new Intl.NumberFormat("en", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                  }).format(highestVolumeTicker?.volume)}
                  </span>
              </div>
            </div>

            
             <div class="flex flex-row items-center flex-wrap w-full px-5 bg-[#262626] shadow-lg rounded-md h-20">
              <div class="flex flex-col items-start">
                  <span class="font-semibold text-gray-200 text-sm sm:text-[1rem] ">Highest Open Interest</span>
                  <span class="text-start text-[1rem] font-semibold text-white mt-0.5">
                    <span class="text-blue-400 ">
                      {highestOpenInterestTicker?.ticker}
                    </span>
                    {new Intl.NumberFormat("en", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                  }).format(highestOpenInterestTicker?.openInterest)}
                  </span>
              </div>
            </div>
  
            {/if}
            -->
  
            </div>
          </div>
          
          <!--Start Expand-->
          <!--
          <label on:click={() => showMore=!showMore} class="cursor-pointer w-full flex justify-center items-center -mt-5 transition duration-150 ease-in-out group">
            <div class="tracking-normal group-hover:translate-y-0.5 transition-transform duration-150 ease-in-out">
              <svg class="w-10 h-10 {showMore ? 'rotate-180' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="M12 14.373q-.162 0-.298-.053q-.137-.053-.267-.183L7.046 9.748q-.14-.14-.15-.344q-.01-.204.15-.364t.354-.16t.354.16L12 13.287l4.246-4.247q.14-.14.344-.15q.204-.01.364.15t.16.354q0 .194-.16.354l-4.389 4.389q-.13.13-.267.183q-.136.053-.298.053"/></svg>
            </div>
          </label>
          -->
          <!--End Expand-->
  
        
  
  
          <!-- Page wrapper -->
          <div class="flex w-full m-auto h-full overflow-hidden">
              {#if displayedData?.length !== 0}
             <div class="mt-8 w-full overflow-x-auto overflow-y-auto h-[850px]">
                <div class="table-container">
                  <div class="table">
                    <VirtualList
                      width="100%"
                      height={$screenWidth < 640 ? 550 : 850}
                      itemCount={displayedData.length}
                      itemSize={40}
                    >
                      <div slot="header" class="tr th sticky z-40 top-0">
                        <!-- Table headers -->
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-start uppercase">Time</div>
                        <div class="td bg-[#161618] font-bold text-slate-300 text-xs text-start uppercase">Symbol</div>
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-start uppercase">Expiry</div>
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-start uppercase">DTE</div>
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-start uppercase">Strike</div>
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-start uppercase">C/P</div>
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-start uppercase">Sent.</div>
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-start uppercase">Spot</div>
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-start uppercase">Price</div>
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-start uppercase">Prem.</div>
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-start uppercase">Type</div>
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-end uppercase">Vol</div>
                        <div class="td bg-[#161618] text-slate-300 font-bold text-xs text-end uppercase">OI</div>
                      </div>

                      <div
                        on:click={() => handleViewData(displayedData[index])}
                        slot="item"
                        let:index
                        let:style
                        {style}
                        class="tr {index % 2 === 0 ? 'bg-[#27272A]' : 'bg-[#09090B]'}"
                      >
                        <!-- Row data -->
                         
                        <div style="justify-content: center;" class="td text-white pb-3 text-xs sm:text-sm text-start">
                          {formatTime(displayedData[index]?.time)}
                        </div>
                        <a href={displayedData[index]?.underlying_type === 'stock' ? `/stocks/${displayedData[index]?.ticker}` : `/etf/${displayedData[index]?.ticker}`} on:click|stopPropagation style="justify-content: center;" class="td text-sm sm:hover:text-white sm:text-[1rem] text-blue-400 font-normal">
                          {displayedData[index]?.ticker}
                        </a>

                        <div style="justify-content: center;" class="td text-sm sm:text-[1rem] text-white text-start">
                          {reformatDate(displayedData[index]?.date_expiration)}
                        </div>

                        <div style="justify-content: center;" class="td text-sm sm:text-[1rem] text-white text-start">
                          {displayedData[index]?.dte < 0 ? 'expired' : displayedData[index]?.dte + 'd'}
                        </div>

                        <div style="justify-content: center;" class="td text-sm sm:text-[1rem] text-white text-start">
                          {displayedData[index]?.strike_price}
                        </div>

                        <div style="justify-content: center;" class="td text-sm sm:text-[1rem] {displayedData[index]?.put_call === 'Calls' ? 'text-[#00FC50]' : 'text-[#FC2120]'} text-start">
                          {displayedData[index]?.put_call}
                        </div>

                        <div style="justify-content: center;" class="td text-sm sm:text-[1rem] {displayedData[index]?.sentiment === 'Bullish' ? 'text-[#00FC50]' : displayedData[index]?.sentiment === 'Bearish' ? 'text-[#FC2120]' : 'text-[#C6A755]'} text-start">
                          {displayedData[index]?.sentiment}
                        </div>

                        <div style="justify-content: center;" class="td text-sm sm:text-[1rem] text-start text-white">
                          {displayedData[index]?.underlying_price}
                        </div>

                        <div style="justify-content: center;" class="td text-sm sm:text-[1rem] text-start text-white">
                          {displayedData[index]?.price}
                        </div>

                        <div style="justify-content: center;" class="td text-sm sm:text-[1rem] text-start font-semibold {displayedData[index]?.put_call === 'Puts' ? 'text-[#CB281C]' : 'text-[#0FB307]'}">
                          {abbreviateNumber(displayedData[index]?.cost_basis)}
                        </div>

                        <div style="justify-content: center;" class="td text-sm sm:text-[1rem] text-start {displayedData[index]?.option_activity_type === 'Sweep' ? 'text-[#C6A755]' : 'text-[#976DB7]'}">
                          {displayedData[index]?.option_activity_type}
                        </div>

                        <div style="justify-content: center;" class="td text-sm sm:text-[1rem] text-white text-end">
                          {new Intl.NumberFormat('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(displayedData[index]?.volume)}
                        </div>

                        <div style="justify-content: center;" class="td text-sm sm:text-[1rem] text-white text-end">
                          {new Intl.NumberFormat('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(displayedData[index]?.open_interest)}
                        </div>
                      </div>
                    </VirtualList>
                  </div>
                </div>
              </div>
              {:else}
              <div class="text-white text-center p-3 sm:p-5 mb-10 mt-5 rounded-md sm:flex sm:flex-row sm:items-center border border-slate-800 text-sm sm:text-[1rem]">      
                  <svg class="w-6 h-6 flex-shrink-0 inline-block sm:mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#a474f6" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"/></svg>
                  Looks like your taste is one-of-a-kind! No matches found... yet!
              </div>
              {/if}
      
          </div>

          <!--
          <div class="relative bottom-[400px] w-fit m-auto flex justify-center items-center">
            <UpgradeToPro data={data} title="Get the recent Options Flow Data from Hedge Funds and major institutional traders to never miss out"/>
          </div>
          -->
  
         
          {:else}
          <div class="flex justify-center items-center h-80">
            <div class="relative">
            <label class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span class="loading loading-spinner loading-md"></span>
            </label>
            </div>
        </div>
  
          {/if}
      </div>        
      
  </section>
      
</body>
      


<!--Start Choose Rule Modal-->
<input type="checkbox" id="ruleModal" class="modal-toggle" />

<dialog id="ruleModal" class="modal modal-bottom sm:modal-middle ">


  <label id="ruleModal" for="ruleModal" on:click={() => searchTerm = ''} class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.5]"></label>
  
  
  <div class="modal-box w-full bg-[#141417] border border-gray-800  h-[800px] overflow-hidden ">


    <div class="flex flex-col w-full mt-10 sm:mt-0">

    
      <div class="text-white text-xl sm:text-3xl font-semibold mb-5">
        Add Filters
      </div>

      <label for="ruleModal" class="cursor-pointer absolute right-5 top-5 bg-[#141417] text-[1.8rem] text-white">
        <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"/></svg>
      </label>

      <!--Start Search bar-->
      <form class="w-11/12 h-8 mb-8" on:keydown={(e) => e?.key === 'Enter' ? e.preventDefault() : '' }>   
        <label for="search" class="mb-2 text-sm font-medium text-gray-200 sr-only">Search</label>
        <div class="relative">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-200 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input 
              autocomplete="off"
              type="search"
              id="search"
              class="placeholder-gray-300 block w-full p-2 ps-10 text-sm text-gray-200 border border-gray-300 rounded-md bg-[#404040] border border-blue-500"
              placeholder="Search {allRows?.length} filters..."
              bind:value={searchTerm}
              />
        </div>
      </form>
      <!-- End Search bar-->

      <div class="text-white text-sm bg-[#141417] overflow-y-scroll  pt-3 rounded-md max-h-[500px] sm:max-h-[420px] md:max-h-[540px] lg:max-h-[600px]">

        <div class="text-white relative">
          
        {#if searchTerm?.length !== 0 && filteredRows?.length === 0}
          <span class="text-lg text-white font-medium flex justify-center items-center m-auto">
            Nothing Found
          </span>
        {:else}

        <table class="w-full table-sm table-compact">
          <!-- head -->
          <tbody>
            {#each (searchTerm?.length !== 0 ? filteredRows : allRows) as row, index}
              <tr on:click={() => changeRule(row?.rule)} class="sm:hover:bg-[#333333] cursor-pointer">
                <td class="border-b border-[#262626]">{index+1}</td>
                <td class="text-start border-b border-[#262626]">
                  {#if ruleOfList?.find((rule) => rule?.name === row?.rule)}
                  <svg class="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 text-green-400 inline-block" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                  {/if}
                </td>
                <td class="text-start border-b border-[#262626]">{row?.label}</td>
              </tr>
            {/each}

          </tbody>
        </table>
        {/if}

    </div>

    </div>

        
      </div>
  </dialog>
<!--End Choose Rule Modal-->
      



      

<!--Start Options Detail Desktop Modal-->


<!-- Put this part before </body> tag -->
<input type="checkbox" id="optionDetailsDesktopModal" class="modal-toggle" />

<label for="optionDetailsDesktopModal" class="modal modal-bottom sm:modal-middle cursor-pointer">

  <label for="optionDetailsDesktopModal"  class="cursor-pointer modal-backdrop"></label>



  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="modal-box w-full relative bg-[#09090B] h-auto max-h-[900px] border border-gray-800 overflow-y-scroll">
    <label for="optionDetailsDesktopModal" class="cursor-pointer absolute right-5 top-2 bg-[#09090B] text-2xl text-white">
      ✕
    </label>

    <p class="text-gray-200 mt-10">
      <span class="text-white text-xl font-semibold">Order Details:</span>
      <br>
      {optionSymbol}

    </p>
    <p class="py-4 text-gray-200 bg-[#09090B] w-full">
      <span class="font-semibold text-white">Description:</span>
      <br>
      {optionDescription}
    </p>

    <table class="table table-sm table-compact bg-[#09090B] w-full mt-5 mb-10 text-white">
      <tbody>
        <!-- row 1 -->
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Premium</td>
          <td class="">{optionPremium}</td>
          <td class="font-semibold">C/P</td>
          <td class="">{optionContract}</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Expiry</td>
          <td class="">{optionExpiry}</td>
          <td class="font-semibold">Type</td>
          <td class="">{optionType}</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Strike</td>
          <td class="">${optionStrike}</td>
          <td class="font-semibold">Volume</td>
          <td class="">{optionVolume}</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Spot</td>
          <td class="">${optionSpot}</td>
          <td class="font-semibold">Open Interest</td>
          <td class="">{optionOpenInterest}</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Price</td>
          <td class="">${optionPrice}</td>
          <td class="font-semibold">Sentiment</td>
          <td class="">{optionSentiment}</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Execution Estimate</td>
          <td class="">{optionexecution_estimate}</td>
          <td class="font-semibold"></td>
          <td class=""></td>
        </tr>
      </tbody>
    </table>


  </label>
</label>


<!--End Options Detial Desktop Modal-->

  <!--Start Options Detail Modal-->
  <!--
<div class="hidden drawer drawer-end z-[999] w-full overflow-hidden">
  <input id="optionDetailsMobileModal" type="checkbox" class="drawer-toggle"/>
  <div class="drawer-side overflow-hidden z-[999]">
  
      
    <div class="bg-[#000] min-h-screen w-full border pb-20 overflow-hidden">

        <label for="optionDetailsMobileModal" class="absolute left-6 top-6">
          <svg class="w-6 h-6 inline-block mb-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M9.125 21.1L.7 12.7q-.15-.15-.213-.325T.425 12q0-.2.063-.375T.7 11.3l8.425-8.425q.35-.35.875-.35t.9.375q.375.375.375.875t-.375.875L3.55 12l7.35 7.35q.35.35.35.863t-.375.887q-.375.375-.875.375t-.875-.375Z"/></svg>
        </label>

  
  <div class="w-fit border overflow-hidden p-2">

    <p class="text-xl font-semibold text-white mt-16 p-3">
      <span class="text-xl font-semibold">Order Details:</span>
      <br>
      {optionSymbol}
    </p>
    <p class="py-4 text-gray-200 w-full p-3">
      <span class="font-semibold text-white">Description:</span>
      {optionDescription}
    </p>

    <table class="table table-sm table-compact w-full mt-5 mb-10 text-white">
      <tbody>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Premium</td>
          <td class="">{optionPremium}</td>
          <td class="font-semibold">C/P</td>
          <td class="">{optionContract}</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Expiry</td>
          <td class="">{optionExpiry}</td>
          <td class="font-semibold">Type</td>
          <td class="">{optionType}</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Strike</td>
          <td class="">${optionStrike}</td>
          <td class="font-semibold">Volume</td>
          <td class="">{optionVolume}</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Spot</td>
          <td class="">${optionSpot}</td>
          <td class="font-semibold">Open Interest</td>
          <td class="">{optionOpenInterest}</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Price</td>
          <td class="">${optionPrice}</td>
          <td class="font-semibold">Sentiment</td>
          <td class="">{optionSentiment}</td>
        </tr>
        <tr class="odd:bg-[#27272A]">
          <td class="font-semibold">Trade Count</td>
          <td class="">{optionTradeCount}</td>
          <td class="font-semibold">Exchange</td>
          <td class="">{optionExchange}</td>
        </tr>
        <tr class="border-b border-slate-700 odd:bg-[#27272A]">
          <td class="font-semibold">Execution Est.</td>
          <td class="">{optionexecution_estimate}</td>
          <td class="font-semibold"></td>
          <td class=""></td>
        </tr>
      </tbody>
    </table>

        
  </div>

</div>
</div>
</div>
-->
<!--End Options Detail Modal-->

<style>
  .table-container {
      width: 100%;
      overflow-x: auto;
  }

  .table :global(.virtual-list-inner) {
      width: 100%;
      display: flex;
      flex-direction: column;
  }

  @media (max-width: 768px) {
      .table {
          width: 1000px;
      }
  }

  .table .virtual-list-inner {
      flex-flow: column nowrap;
      font-size: .8rem;
      line-height: 1.5;
      flex: 1 1 auto;
  }

  .th {
      display: none;
      font-weight: 700;
      background-color: #09090B;
  }

  .th > .td {
      white-space: normal;
      justify-content: center;
  }

  .tr {
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
  }

  .tr.even {
      background-color: #27272A;
  }

  .tr.odd {
      background-color: #09090B;
  }

  .td {
      display: flex;
      flex-flow: row nowrap;
      flex-grow: 1;
      flex-basis: 0;
      padding: 0.5em;
      word-break: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0px;
      white-space: nowrap;
      border-bottom: 1px solid #09090B;
  }
</style>