<script lang="ts">


import { numberOfUnreadNotification } from '$lib/store';
import { onMount } from 'svelte';

export let data;


let rawData = data?.getGeneralNews;
let news = rawData.slice(0,15) ?? [];

const formatDate = (dateString) => {
// Create a date object for the input dateString
const inputDate = new Date(dateString);
  
  // Create a date object for the current time in New York City
  const nycTime = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const currentNYCDate = new Date(nycTime);
  
  // Calculate the difference in milliseconds
  const difference = inputDate.getTime() - currentNYCDate.getTime();
  
  // Convert the difference to minutes
  const minutes = Math.abs(Math.round(difference / (1000 * 60)));
  
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else if (minutes < 1440) {
    const hours = Math.round(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    const days = Math.round(minutes / 1440);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
};


 async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && news?.length !== rawData?.length) {
        const nextIndex = news?.length;
        const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
        news = [...news, ...filteredNewResults];
    }
  }

  onMount(async () => {
    window.addEventListener('scroll', handleScroll);
      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  })

let videoId = null;


function checkIfYoutubeVideo(link) {

  const url = new URL(link);
  if (url.hostname === "www.youtube.com") {
  const searchParams = url.searchParams;
  searchParams?.delete('t'); // Remove the "t" parameter
  const videoIdMatch = url?.search?.match(/v=([^&]+)/);

  if (videoIdMatch) {
    return videoIdMatch[1];
  }
  } else {
    return null;
  }

}


</script>

    
<svelte:head>

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<title>
  {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ''} Today's General News and Breaking Stories · stocknear
</title>
<meta name="description" content={`Get the latest general news and breaking stories from the world's best finance and investing websites.`} />

<!-- Other meta tags -->
<meta property="og:title" content={`Today's General News and Breaking Stories · stocknear`}/>
<meta property="og:description" content={`Get the latest general news and breaking stories from the world's best finance and investing websites.`} />
<meta property="og:type" content="website"/>
<!-- Add more Open Graph meta tags as needed -->

<!-- Twitter specific meta tags -->
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content={`Today's General News and Breaking Stories · stocknear`}/>
<meta name="twitter:description" content={`Get the latest general news and breaking stories from the world's best finance and investing websites.`} />
<!-- Add more Twitter meta tags as needed -->

</svelte:head>
  
  
  
<section class="w-full overflow-hidden m-auto mt-10">
  
  <div class="flex justify-center w-full m-auto overflow-hidden">
      <div class="relative flex justify-center items-center overflow-hidden">
          <main>
              <div class="w-screen sm:w-full m-auto">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {#if news?.length !== 0}
                      {#each news as item}
                          <div class="flex flex-col w-full mt-5 bg-[#27272A] shadow-lg h-auto sm:h-[420px] pb-10 sm:pb-5 rounded-none sm:rounded-lg m-auto">
                            {#if videoId = checkIfYoutubeVideo(item.url)}
                                <iframe
                                    class="w-full h-60 rounded-none sm:rounded-lg"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    frameborder="0"
                                    allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen
                                ></iframe>
                            {:else}
                                <a href={item?.url} target="_blank">
                                <div class="h-48 sm:h-60 m-auto border border-slate-800 rounded-none sm:rounded-lg ">
                                    <img src={item?.image} class="w-screen sm:w-full object-cover h-48 sm:h-60 rounded-none sm:rounded-t-lg" alt="news image" loading="lazy">
                                </div>
                                </a>
                            {/if}

                            <div class="pl-3 pr-3">
                              <label class="mt-3 mb-3 cursor-pointer text-xs text-gray-200 flex flex-row items-center">
                                Source: {item?.source} · {formatDate(item?.datetime*1000)} ago
                              </label>
                                
                                  <a href={item?.url} target="_blank" class="text-lg font-bold text-white">
                                    {item?.headline?.length > 120 ? item?.headline?.slice(0,120) + "..." : item?.headline}
                                  </a>
                                  <p class="text-white text-sm mt-2">
                                    {item?.summary?.length > 100 ? item?.summary?.slice(0,100) + "..." : item?.summary}
                                  </p>
                              </div>

                        </div>

                          {/each}


  
                      
                      {/if}
                  </div>

          </main>
      </div>
  </div>
</section>






  
  
  
  
  