<script lang='ts'>
    import { numberOfUnreadNotification } from '$lib/store';
    import { page } from '$app/stores';
    import ArrowLogo from "lucide-svelte/icons/move-up-right";
    import { goto } from '$app/navigation';

    export let data;

let navigation = [
    {
        title: 'Stock Lists',
        link: '/list'
    },
    {
        title: 'Mega-Cap Stocks',
        link: '/list/mega-cap-stocks'
    },
    {
        title: 'Large-Cap Stocks',
        link: '/list/large-cap-stocks'
    },
    {
        title: 'Mid-Cap Stocks',
        link: '/list/mid-cap-stocks'
    },
    {
        title: 'Small-Cap Stocks',
        link: '/list/small-cap-stocks'
    },
    {
        title: 'Micro-Cap Stocks',
        link: '/list/micro-cap-stocks'
    },
    {
        title: 'Nano-Cap Stocks',
        link: '/list/nano-cap-stocks'
    },
    {
        title: 'All Stocks Listed on the NASDAQ',
        link: '/list/nasdaq-stocks'
    },
    {
        title: 'All Stocks Listed on the NYSE',
        link: '/list/nyse-stocks'
    },
    {
        title: 'All Stocks Listed on XETRA',
        link: '/list/xetra-stocks'
    },
    {
        title: 'All Stocks Listed on AMEX',
        link: '/list/amex-stocks'
    },
    {
        title: 'Dow Jones Industrial Average Stocks List',
        link: '/list/dow-jones-stocks'
    },
    {
        title: 'NASDAQ 100 Index Stocks List',
        link: '/list/nasdaq-100-stocks'
    },
    {
        title: 'S&P 500 Index Stocks List',
        link: '/list/sp-500-stocks'
    },
    {
        title: 'German Companies on the US Stock Market',
        link: '/list/german-stocks-us'
    },
    {
        title: 'Canadian Companies on the US Stock Market',
        link: '/list/canadian-stocks-us'
    },
    {
        title: 'Chinese Companies on the US Stock Market',
        link: '/list/chinese-stocks-us'
    },
    {
        title: 'Indian Companies on the US Stock Market',
        link: '/list/indian-stocks-us'
    },
    {
        title: 'Israeli Companies on the US Stock Market',
        link: '/list/israeli-stocks-us'
    },
    {
        title: 'UK Companies on the US Stock Market',
        link: '/list/uk-stocks-us'
    },
    {
        title: 'Japanese Companies on the US Stock Market',
        link: '/list/japanese-stocks-us'
    },
    {
        title: 'Financials Sector Stocks',
        link: '/list/financial-sector'
    },
    {
        title: 'Healthcare Sector Stocks',
        link: '/list/healthcare-sector'
    },
    {
        title: 'Technology Sector Stocks',
        link: '/list/technology-sector'
    },
    {
        title: 'Industrials Sector Stocks',
        link: '/list/industrials-sector'
    },
    {
        title: 'Energy Sector Stocks',
        link: '/list/energy-sector'
    },
    {
        title: 'Utilities Sector Stocks',
        link: '/list/utilities-sector'
    },
    {
        title: 'Consumer Cyclical Sector Stocks',
        link: '/list/consumer-cyclical-sector'
    },
    {
        title: 'Real Estate Sector Stocks',
        link: '/list/real-estate-sector'
    },
    {
        title: 'Basic Materials Sector Stocks',
        link: '/list/basic-materials-sector'
    },
    {
        title: 'Communication Services Sector Stocks',
        link: '/list/communication-services-sector'
    },
    {
        title: 'Consumer Defensive Sector Stocks',
        link: '/list/consumer-defensive-sector'
    },
    {
        title: 'Delisted Companies',
        link: '/list/delisted-stocks'
    },
    {
        title: 'Bitcoin ETFs',
        link: '/list/bitcoin-etfs'
    },
    {
        title: 'Magnificent Seven Stocks',
        link: '/list/magnificent-seven'
    },
    {
        title: 'Dividend Kings',
        link: '/list/dividend-kings'
    },
    {
        title: 'Dividend Aristocrats',
        link: '/list/dividend-aristocrats'
    },
    {
        title: 'All Active REITs on the US Stock Market',
        link: '/list/reit-stocks'
    },
    
];

let updatedNavigation = navigation?.map(item => {
    return {
        ...item,
        link: item.link + '/'
    };
});

const combinedNavigation = navigation?.concat(updatedNavigation);
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
                  <li><a href="/list/" class="text-gray-300">Lists</a></li>
                  {#if $page.url.pathname.startsWith('/list/')}
                    <li>
                        <a class="text-gray-300">
                            {combinedNavigation?.find((item) => item?.link === $page.url.pathname)?.title}
                        </a>
                    </li> 
                    {/if}
                </ul>
            </div>



        


        
        <div class="mt-10 sm:mt-5 w-full m-auto mb-10 bg-[#09090B] px-3 lg:px-10 overflow-hidden">
        
        
            <!--Start Top Winners/Losers-->
            <div class="flex flex-col justify-center items-center">
              
              <div class="ml-2 text-start w-full text-white mb-2">
                {#each navigation as item}
                  {#if item?.link === $page.url.pathname}      
                    <span class="font-bold text-2xl">
                      {item?.title}
                    </span>
                  {/if}
                  {/each}
              </div>
    
              <div class="border-b mt-2 border-blue-400 w-full mb-7" />

              <div class="flex justify-center w-full m-auto overflow-hidden">
      
            <main class="w-full">
              <slot />
            </main>

          

            </div>


          
          </div>
    
    
        </div>
     
        
        </section>
        
        