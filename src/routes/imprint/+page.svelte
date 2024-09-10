<script>
import { numberOfUnreadNotification } from '$lib/store';
import { goto } from '$app/navigation';
import ArrowLogo from "lucide-svelte/icons/move-up-right";

  const emailAddress = 'support@stocknear.com';
  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;


</script>


<svelte:head>
  <title> {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ''} Imprint · stocknear</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta name="description" content="Imprint of Stocknear. Contact Information if you need help.">
  <!-- Other meta tags -->
  <meta property="og:title" content="Imprint · stocknear"/>
  <meta property="og:description" content="Imprint of Stocknear. Contact Information if you need help.">
  <meta property="og:type" content="website"/>
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="Imprint · stocknear"/>
  <meta name="twitter:description" content="Imprint of Stocknear. Contact Information if you need help.">
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>


<section class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 pb-40">
    
      <div class="text-sm sm:text-[1rem] breadcrumbs">
        <ul>
          <li><a href="/" class="text-gray-300">Home</a></li> 
          <li class="text-gray-300">Imprint</li>
        </ul>
      </div>
    

      <div class="w-full overflow-hidden m-auto mt-5">
        
        <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden ">
            <div class="relative flex justify-center items-start overflow-hidden w-full">
                
              
              <main class="w-full lg:w-3/4 lg:pr-5">
  
      <div class="w-full m-auto sm:bg-[#27272A] sm:rounded-xl h-auto pl-10 pr-10 pt-5 sm:pb-10 sm:pt-10 mt-3 mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
  
      <!-- Start Column -->
      <div>
        <div class="flex flex-row justify-center items-center">
          <h1 class="text-3xl sm:text-4xl text-white text-center font-bold mb-5">
            Imprint
          </h1>
        </div>

        <span class="text-white text-md font-medium text-center flex justify-center  items-center ">
          because Germany loves bureaucracy
        </span>
      </div>
      <!-- End Column -->
  
      <!-- Start Column -->
      <div class="relative m-auto">
        <svg class="w-40 -my-5" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="5" result="glow"/>
              <feMerge>
                <feMergeNode in="glow"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path fill="#1E40AF" d="M57.6,-58.7C72.7,-42.6,81.5,-21.3,82,0.5C82.5,22.3,74.7,44.6,59.7,60.1C44.6,75.6,22.3,84.3,0,84.3C-22.3,84.2,-44.6,75.5,-61.1,60.1C-77.6,44.6,-88.3,22.3,-87.6,0.7C-86.9,-20.8,-74.7,-41.6,-58.2,-57.7C-41.6,-73.8,-20.8,-85.2,0.2,-85.4C21.3,-85.6,42.6,-74.7,57.6,-58.7Z" transform="translate(100 100)" filter="url(#glow)" />
        </svg>
        
        
        <div class="z-1 absolute top-4 left-4">
          <img class="w-[70px] ml-5" src={cloudFrontUrl+"/assets/imprint_logo.png"} alt="logo" loading='lazy'>
        </div>
      </div>
      <!-- End Column -->
  
    </div>
    
  </div>


    <div class="card w-full bg-[#09090B] border-t rounded-none sm:rounded-xl sm:border border-slate-700 m-auto ">
      <div class="card-body">
        <p class="text-white italic mb-2">
          According to § 5 Telemediengesetz (TMG) ‍
        </p>

          <p class="text-white mb-5">
            Stocknear GmbH
            <br>
            Am Lohgraben 30
            <br>
            57074 Siegen
            <br>
            Email: <a href={`mailto:${emailAddress}`} class="text-blue-400 hover:text-white hover:underline">{emailAddress}</a>.
            <br>
            <br>
            Managing Director (<span class="italic">Geschäftsführer</span>): Muslem Rahimi
            <br>
            <br>
            Registered in the commercial register at the local court at Siegen under:  HRB 13800
            <br>
            VAT ID: DE366905061
          </p>

          <p class="text-white mb-5">
            Responsible for the content according § 55 Abs. 2 RStV
          <br>
          Notice according to the Online Dispute Settlement Regulation
          </p>

      
          
          <p class="text-white mb-5">
            Under applicable law, we are required to inform consumers of the existence of the European Online Dispute Resolution platform, which can be used to resolve disputes without having to go to court. The European Commission is responsible for setting up the platform. The European Online Dispute Resolution Platform can be found here:
            <a target= "_blank" href="http://ec.europa.eu/odr">http://ec.europa.eu/odr.</a>
            <br>
            However, we would like to point out that we are not prepared to participate in the dispute resolution procedure within the framework of theEuropean Online Dispute Resolution Platform. To contact us, please use our above e-mail and phone number.
          </p> 


          <h1 class="text-white text-2xl text-start mb-5">
            Notice in accordance with the Consumer Dispute Settlement Act (VSBG)
        </h1>
        <p class="text-white mb-5 ">
            We are not willing and obliged to participate in dispute resolution proceedings before a consumer arbitration board.  
        </p> 


        
        <h1 class="text-white text-2xl font-bold text-start mb-5">
            Disclaimer - legal notice
        </h1>
        <h1 class="text-white text-xl font-bold text-start mb-3 ml-2">
            § 1 Content warning 
        </h1> 

        <p class="text-white mb-3 ml-2">
          The free and freely accessible content of this website has been created with the greatest possible care, but the provider of this website does not guarantee the accuracy and timeliness of the free and freely accessible journalistic advice and news. Contributions identified by name reflect the opinion of the respective author and not always the opinion of the provider. Simply by calling up the free and freely accessible content, no contractual relationship is established between the user and the provider; in this respect, there is no intention on the part of the provider to be legally bound.
      </p>

      <h1 class="text-white text-xl font-bold text-start mb-3 ml-2">
        § 2 External Links 
      </h1> 
      <p class="text-white mb-3 ml-2 ">
          This website contains links to third-party websites ("external links"). These websites are subject to the liability of the respective operators. When the external links were first created, the provider checked the external content for any legal violations. At that time, no legal violations were apparent. The provider has no influence on the current and future design and content of the linked pages. The inclusion of external links does not imply that the provider adopts the content behind the reference or link as its own. A constant control of the external links is not reasonable for the provider without concrete evidence of violations. However, in the event of knowledge of legal violations, such external links will be deleted immediately.
      </p>


      <h1 class="text-white text-xl font-bold text-start mb-3 ml-2">
        § 3 Copyrights and ancillary copyrights 
      </h1> 
      <p class="text-white mb-3 ml-2 ">
          The content published on this website is subject to German copyright and ancillary copyright law. Any use not permitted by German copyright and ancillary copyright law requires the prior written consent of the provider or the respective copyright holder.
          This applies in particular to the copying, editing, translation, storage, processing or reproduction of content in databases or other electronic media and systems. Contents and rights of third parties are marked as such. The unauthorized reproduction or transmission of individual content or complete pages is not permitted and is punishable by law. Only the production of copies and downloads for personal, private and non-commercial use is permitted. The display of this website in external frames is only permitted with written permission.
      </p>

     

      <h1 class="text-white text-xl font-bold text-start mb-3 ml-2">
          § 4 Special conditions of use
      </h1> 
      <p class="text-white mb-3 ml-2">
          Insofar as special conditions for individual uses of this website deviate from the aforementioned paragraphs, this will be expressly pointed out at the appropriate place. In this case, the special conditions of use shall apply in the respective individual case.
      </p>
          
      </div>
    </div>

  
      

</main>


<aside class="hidden lg:block relative fixed w-1/4 ml-4">        

  <div on:click={() => goto('/pricing')} class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer">
      <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
          <div class="w-full flex justify-between items-center p-3 mt-3">
          <h2 class="text-start text-xl font-semibold text-white ml-3">
          Pro Subscription 🔥
          </h2>
          <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0"/>
          </div>
          <span class="text-white p-3 ml-3 mr-3">
              Upgrade now for unlimited access to all data and tools.
          </span>
      </div>
  </div>

  <div on:click={() => goto('/donation')} class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer">
      <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
          <div class="w-full flex justify-between items-center p-3 mt-3">
          <h2 class="text-start text-xl font-semibold text-white ml-3">
          Donation ❤
          </h2>
          <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0"/>
          </div>
          <span class="text-white p-3 ml-3 mr-3">
              Learn more about why we're doing this here
          </span>
      </div>
  </div>

  <div on:click={() => goto('/contact')} class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer">
      <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
          <div class="w-full flex justify-between items-center p-3 mt-3">
          <h2 class="text-start text-xl font-semibold text-white ml-3">
          Contact Us 💬
          </h2>
          <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0"/>
          </div>
          <span class="text-white p-3 ml-3 mr-3">
              Let me know if you need something
          </span>
      </div>
  </div>

</aside>

</div>
</div>


</div>



</section>
