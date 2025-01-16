<script lang="ts">
  import { articleId, numberOfUnreadNotification } from "$lib/store";
  import { goto } from "$app/navigation";
  import { getImageURL } from "$lib/utils";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  export let data;
  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;

  function blogSelector(state: string) {
    $articleId = state;
    goto("/blog/article/" + $articleId);
  }

  /*
let allBlogPosts = [
    {
        'title': 'How the Stock Market is Corrupted by Market Makers',
        'description': `If you've explored the stock market, you've probably heard of "Market Makers." In this article, we'll break down what Market Makers are and discuss why they faced allegations of corruption during the GameStop Rally.`,
        'created': '2023-11-04',
        'username': 'mrahimi',
        'userId': 'db5s41oatgoeh0q',
        'link': 'how-the-stock-market-is-corrupted-by-market-makers',
        'readingTime': '4',
        'image': coverLogo1,
    },
    {
        'title': `Ken Griffin's Vision for Miami: A Financial Hub Rivaling New York`,
        'description': `Ken Griffin, the founder of Citadel hedge fund, foresees a transformative shift in the financial landscape, with Miami poised to surpass New York as a financial hub. Griffin, who is currently overseeing the construction of Citadel's $1 billion headquarters in Miami's Brickell Bay district, emphasizes the city's potential to outpace its northern counterpart.`,
        'created': '2023-11-29',
        'username': 'mrahimi',
        'userId': 'db5s41oatgoeh0q',
        'link': 'ken-griffin-vision-for-miami',
        'readingTime': '2',
        'image': coverLogo2,
    },
    {
        'title': `Amazon's Expansion in Generative AI: A New Collaboration with Nvidia`,
        'description': `During the recent AWS re:Invent event, Amazon (NASDAQ: AMZN) made significant strides in amplifying its AI capabilities, unveiling an array of innovative products centered around generative AI. Wedbush's latest report highlights Amazon's triple-layered strategy in the generative AI landscape, spanning infrastructure, foundational models, and applications.`,
        'created': '2023-12-01',
        'username': 'mrahimi',
        'userId': 'db5s41oatgoeh0q',
        'link': 'amazon-expansion-in-generative-ai',
        'readingTime': '2',
        'image': coverLogo3,
    }

    
]
*/
  let allBlogPosts = data?.getAllBlogPost;
</script>

<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Stock
    Analysis Blog · stocknear</title
  >
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta
    name="description"
    content="Get the latest blog post to understand and invest correctly into companies."
  />
  <!-- Other meta tags -->
  <meta property="og:title" content="Stock Analysis Blog · stocknear" />
  <meta
    property="og:description"
    content="Get the latest blog post to understand and invest correctly into companies."
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Stock Analysis Blog · stocknear" />
  <meta
    name="twitter:description"
    content="Get the latest blog post to understand and invest correctly into companies."
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Stock Analysis Blog</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Stock Analysis Blog
            </h1>
          </div>

          <div class="w-full grid grid-cols-1 sm:grid-cols-3 sm:gap-5">
            {#if allBlogPosts?.length !== 0}
              {#each allBlogPosts as item}
                <div
                  class="flex flex-col overflow-hidden rounded-lg shadow-lg sm:hover:shadow-2xl border border-gray-600"
                >
                  <div class="flex-shrink-0">
                    <a href="/article/yahoo-finance-alternatives/"
                      ><img
                        class="h-48 w-full object-cover"
                        src={getImageURL(
                          item?.collectionId,
                          item?.id,
                          item?.cover,
                        )}
                        alt="Stock Research Close up Chart and Coffee"
                        loading="eager"
                      /></a
                    >
                  </div>
                  <div
                    class="flex flex-1 flex-col justify-between bg-table p-4 xs:p-5 sm:p-6"
                  >
                    <div class="flex-1">
                      <a
                        href="/article/yahoo-finance-alternatives/"
                        class="mt-2 block"
                        ><h2 class="text-xl font-semibold text-white">
                          {item?.title}
                        </h2>
                        <p class="mt-3 text-sm text-white">
                          {item?.abstract.length > 250
                            ? item?.abstract?.slice(0, 250) + "..."
                            : item?.abstract}
                        </p></a
                      >
                    </div>
                    <div class="mt-6 flex items-center">
                      <div class="flex-shrink-0">
                        <img
                          class="h-10 w-10 rounded-full"
                          src="https://img.stockanalysis.com/cd35b0bc-8afb-4475-b42c-c6aebc4cd283/lincoln-olson.jpeg"
                          alt="Lincoln Olson profile image"
                          loading="eager"
                        />
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-semibold text-white">
                          <a class="hover:underline">Lincoln Olson</a>
                        </p>
                        <div
                          class="flex space-x-1 text-sm text-gray-500 dark:text-muted"
                        >
                          <time datetime="2025-01-14">Jan 14, 2025</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
