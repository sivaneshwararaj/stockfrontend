<script lang="ts">
  import { etfTicker } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { formatDate } from "$lib/utils";

  export let data;

  let newsList = data?.getNews ?? [];
</script>

<section class="w-auto overflow-hidden min-h-screen">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4">
          <slot />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if newsList?.length !== 0}
            <div
              class="w-full sm:hover:text-white text-white border border-gray-600 bg-primary rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <div class="p-4 text-sm">
                <h3 class="text-lg text-white font-semibold mb-3">
                  {$etfTicker} News
                </h3>
                <ul class="text-white">
                  {#each newsList?.slice(0, 10) as item}
                    <li class="mb-3 last:mb-1">
                      {formatDate(item?.publishedDate)} &#183;
                      <a
                        class="sm:hover:text-white text-blue-400"
                        href={item?.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow">{item?.title}</a
                      >
                      - {item?.site}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
        </aside>
      </div>
    </div>
  </div>
</section>
