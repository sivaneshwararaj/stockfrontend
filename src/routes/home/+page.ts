import { userRegion, getCache, setCache } from '$lib/store';
import defaultAvatar from '$lib/images/senator/default-avatar.png';
import { getPartyForPoliticians } from '$lib/utils';
import { redirect } from '@sveltejs/kit';


const usRegion = ['cle1','iad1','pdx1','sfo1'];

let apiURL;
let apiKey = import.meta.env.VITE_STOCKNEAR_API_KEY;



let images = {};
// Function to load images only when they are viewed
async function loadImages() {
  const imageFiles = import.meta.glob('$lib/images/senator/*.png');
  const imagesPromises = [];

  for (const [path, resolver] of Object?.entries(imageFiles)) {
    const imageNameMatch = path?.match(/\/([^/]+)\.png$/);
    if (imageNameMatch && imageNameMatch[1] !== 'default-avatar') {
      imagesPromises?.push(resolver()?.then(module => {
        images[imageNameMatch[1]] = module.default;
      }));
    }
  }

  await Promise?.all(imagesPromises);
}



userRegion.subscribe(value => {

  if (usRegion.includes(value)) {
    apiURL = import.meta.env.VITE_USEAST_API_URL;
  } else {
    apiURL = import.meta.env.VITE_EU_API_URL;
  }
});


export const load = async ({ parent}) => {

  const data = await parent();

  if (!data?.user) {
		redirect(303, '/');
	}

  const getDailyGainerLoserActive = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache('', 'getDailyGainerLoserActive');
    if (cachedData) {
      output = cachedData;
    } else {

      // make the POST request to the endpoint
      const response = await fetch(apiURL + '/market-movers', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json", "X-API-KEY": apiKey
        },
      });

      output = await response.json();

      setCache('', output, 'getDailyGainerLoserActive');
    }

    return output;
  };

  const getRssFeedWIIM = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache('', 'getRssFeedWIIM');
    if (cachedData) {
      output = cachedData;
    } else {

      // make the POST request to the endpoint
      const response = await fetch(apiURL + '/rss-feed-wiim', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json", "X-API-KEY": apiKey
        },
      });

      output = await response.json();

      setCache('', output, 'getRssFeedWIIM');
    }

    return output;
  };

  const getOptionsFlowFeed = async () => {
    // make the POST request to the endpoint
    const response = await fetch(apiURL + '/options-flow-feed', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json", "X-API-KEY": apiKey
      },
    });
    const output = await response.json();

    return output;
  };

  const getPoliticianRSS = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache('', 'getPoliticianRSS');
    if (cachedData) {
      output = cachedData;
    } else {

      const response = await fetch(apiURL + '/congress-rss-feed', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json", "X-API-KEY": apiKey
        },
      });

      output = await response.json();

      // Cache the data for this specific tickerID with a specific name 'getPoliticianRSS'

      await loadImages();
      output?.forEach(item => {
        let representative = item?.representative || '';
    
        representative = representative?.replace('Jr', '')
            .replace(/Dr./g, '')
            .replace(/Dr_/g, '')
    
        const fullName = representative?.replace(/(\s(?:Dr\s)?\w(?:\.|(?=\s)))?\s/g, '_').trim();
        item.image = images[fullName] || defaultAvatar;
        item.representative = fullName?.replace(/_/g, ' ');
        });
    
        output = output?.map(item => {
            const party = getPartyForPoliticians(item?.representative);
            return {
                ...item,
                party: party
            };
      });

      
      setCache('', output, 'getPoliticianRSS');
    }
    return output;
  };

  // Make sure to return a promise
  return {
    getDailyGainerLoserActive: await getDailyGainerLoserActive(),
    getRssFeedWIIM: await getRssFeedWIIM(),
    getPoliticianRSS: await getPoliticianRSS(),
    getOptionsFlowFeed: await getOptionsFlowFeed(),
  };
};