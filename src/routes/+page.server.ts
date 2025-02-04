import { error, fail, redirect } from "@sveltejs/kit";
import { validateData } from "$lib/utils";
import { loginUserSchema, registerUserSchema } from "$lib/schemas";
import fs from 'fs';
import path from 'path';
export const load = async ({ locals }) => {
  const { apiKey, apiURL } = locals;

  const getDashboard = async () => {
    // const response = await fetch(apiURL + "/dashboard-info", {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "X-API-KEY": apiKey,
    //   },
    // });

    // const output = await response?.json();

    // return output;
    return [];

  };
  function getSubreddits() {
    const subreddits = [];
    try {
      const filePath = path.join(process.cwd(), 'src/data', 'subreddit.csv');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const rows = fileContent.split('\n');

      for (let i = 1; i < rows.length; i++) { // Assuming the first row is a header
        const row = rows[i].trim();
        if (row) {
          subreddits.push(row);
        }
      }
    } catch (err) {
      console.error("Error reading or parsing subreddit.csv:", err);
      // You might want to handle the error differently depending on your needs
      // For example, you could throw the error to be handled by the caller:
      // throw err;
    }
    console.log(subreddits)
    return subreddits;
  }
  // Make sure to return a promise
  return {
    getDashboard: await getDashboard(),
    subreddits: getSubreddits(),
  };
};

async function checkDisposableEmail(email) {
  const url = `https://disposable.debounce.io/?email=${encodeURIComponent(email)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const output = (await response.json())?.disposable ?? false;
  return output;
}

export const actions = {
  login: async ({ request, locals }) => {
    const { formData, errors } = await validateData(
      await request.formData(),
      loginUserSchema,
    );

    if (errors) {
      return fail(400, {
        data: formData,
        errors: errors.fieldErrors,
      });
    }

    try {
      await locals.pb
        .collection("users")
        .authWithPassword(formData.email, formData.password);

    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    redirect(301, "/pricing");
  },

  register: async ({ locals, request }) => {
    const { formData, errors } = await validateData(
      await request.formData(),
      registerUserSchema,
    );
    if (errors) {
      return fail(400, {
        data: formData,
        errors: errors.fieldErrors,
      });
    }
    const isEmailDisposable = await checkDisposableEmail(formData?.email);

    if (isEmailDisposable === "true") {
      error(400, "Disposable Email Addresses not allowed!");
    }

    //let username = generateUsername(formData.name.split(' ').join('')).toLowerCase();

    try {
      await locals.pb.collection("users").create(formData);
      /*
		await locals.pb?.collection('users').update(
						newUser?.id, {
							'freeTrial' : true,
							'tier': 'Pro', //Give new users a free trial for the Pro Subscription
					});
		*/

      await locals.pb.collection("users").requestVerification(formData.email);
    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    try {
      await locals.pb
        .collection("users")
        .authWithPassword(formData.email, formData.password);

      /*
			if (!locals.pb?.authStore?.model?.verified) {
				locals.pb.authStore.clear();
				return {
					notVerified: true,
				};
			}
			*/
    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    redirect(301, "/pricing");
  },

  oauth2: async ({ url, locals, request, cookies }) => {
    const authMethods = (await locals?.pb
      ?.collection("users")
      ?.listAuthMethods())?.oauth2;


    const data = await request?.formData();
    const providerSelected = data?.get("provider");

    if (!authMethods) {
      return {
        authProviderRedirect: "",
        authProviderState: "",
      };
    }
    const redirectURL = `${url.origin}/oauth`;

    const targetItem = authMethods?.providers?.findIndex(
      (item) => item?.name === providerSelected,
    );
    //console.log("==================")
    //console.log(authMethods.authProviders)
    //console.log('target item is: ', targetItem)

    const provider = authMethods.providers[targetItem];
    const authProviderRedirect = `${provider.authUrl}${redirectURL}`;
    const state = provider.state;
    const verifier = provider.codeVerifier;

    
    
    cookies.set("state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60,
    });

    cookies.set("verifier", verifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60,
    });

    cookies.set("provider", providerSelected, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60,
    });

    cookies.set("path", "/", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60,
    });

    redirect(302, authProviderRedirect);
  },
  updateMentions: async ({ request }) => {
    try {
      const body = await request.formData();
      const timeframe = body.get('timeframe');
      const subredditsString = body.getAll('subreddits'); // This will be a comma-separated string

      if (!timeframe || !subredditsString) {
        return fail(400, { error: 'Missing required fields' });
      }

      // Convert subreddits to an array

      // Validate (optional, but recommended)
      if (typeof timeframe !== 'string') {
        return fail(400, { error: 'Invalid timeframe provided' });
      }
      if (!Array.isArray(subredditsString)) {
        return fail(400, { error: 'Invalid subreddits provided' });
      }

      // Process the data (replace with your actual logic)
      console.log('Received timeframe:', timeframe);
      console.log('Received subreddits:', subredditsString);

      // Simulate processing and getting some data
      // Replace this with your actual data fetching and processing logic
      const apiResponse = [
        {
          "ticker": "PLTR",
          "type": "stock",
          "name": "Palantir Technologies Inc - Class A",
          "symbol": "US:PLTR",
          "count": 1390,
          "sentiment": "0.13"
        },
        {
          "ticker": "BTC",
          "type": "crypto",
          "name": "Bitcoin",
          "symbol": "BTC:USDT",
          "count": 1261,
          "sentiment": "0.15"
        },
        {
          "ticker": "NVDA",
          "type": "stock",
          "name": "NVIDIA Corp",
          "symbol": "US:NVDA",
          "count": 1066,
          "sentiment": "0.12"
        },
        {
          "ticker": "SPY",
          "type": "stock",
          "name": "SPDR S&P 500 ETF Trust",
          "symbol": "US:SPY",
          "count": 975,
          "sentiment": "0.10"
        },
        {
          "ticker": "ETH",
          "type": "crypto",
          "name": "Ethereum",
          "symbol": "ETH:USDT",
          "count": 897,
          "sentiment": "0.16"
        },
        {
          "ticker": "AMD",
          "type": "stock",
          "name": "Advanced Micro Devices Inc.",
          "symbol": "US:AMD",
          "count": 657,
          "sentiment": "0.18"
        },
        {
          "ticker": "EU",
          "type": "stock",
          "name": "enCore Energy Corp",
          "symbol": "US:EU",
          "count": 546,
          "sentiment": "-0.05"
        },
        {
          "ticker": "XRP",
          "type": "crypto",
          "name": "XRP",
          "symbol": "XRP:USDT",
          "count": 504,
          "sentiment": "0.20"
        },
        {
          "ticker": "TSLA",
          "type": "stock",
          "name": "Tesla Inc",
          "symbol": "US:TSLA",
          "count": 451,
          "sentiment": "0.06"
        },
        {
          "ticker": "MAGA",
          "type": "stock",
          "name": "Point Bridge America First ETF",
          "symbol": "US:MAGA",
          "count": 356,
          "sentiment": "-0.06"
        },
        {
          "ticker": "VOO",
          "type": "stock",
          "name": "Vanguard S&P 500 ETF",
          "symbol": "US:VOO",
          "count": 351,
          "sentiment": "0.33"
        },
        {
          "ticker": "GME",
          "type": "stock",
          "name": "Gamestop Corporation - Class A",
          "symbol": "US:GME",
          "count": 293,
          "sentiment": "0.18"
        },
        {
          "ticker": "SOL",
          "type": "crypto",
          "name": "Solana",
          "symbol": "SOL:USDT",
          "count": 241,
          "sentiment": "0.33"
        },
        {
          "ticker": "DOGE",
          "type": "crypto",
          "name": "Dogecoin",
          "symbol": "DOGE:USDT",
          "count": 220,
          "sentiment": "0.06"
        },
        {
          "ticker": "DEI",
          "type": "stock",
          "name": "Douglas Emmett Inc",
          "symbol": "US:DEI",
          "count": 196,
          "sentiment": "-0.03"
        },
        {
          "ticker": "QQQ",
          "type": "stock",
          "name": "Invesco QQQ Trust Series 1",
          "symbol": "US:QQQ",
          "count": 186,
          "sentiment": "0.15"
        },
        {
          "ticker": "VTI",
          "type": "stock",
          "name": "Vanguard Total Stock Market ETF",
          "symbol": "US:VTI",
          "count": 186,
          "sentiment": "0.31"
        },
        {
          "ticker": "RDDT",
          "type": "stock",
          "name": "Reddit Inc. - Class A",
          "symbol": "US:RDDT",
          "count": 150,
          "sentiment": "0.07"
        },
        {
          "ticker": "SCHD",
          "type": "stock",
          "name": "Schwab US Dividend Equity ETF",
          "symbol": "US:SCHD",
          "count": 146,
          "sentiment": "0.32"
        },
        {
          "ticker": "IBKR",
          "type": "stock",
          "name": "Interactive Brokers Group Inc - Class A",
          "symbol": "US:IBKR",
          "count": 130,
          "sentiment": "0.21"
        },
        {
          "ticker": "MSFT",
          "type": "stock",
          "name": "Microsoft Corporation",
          "symbol": "US:MSFT",
          "count": 124,
          "sentiment": "0.28"
        },
        {
          "ticker": "TRUMP",
          "type": "crypto",
          "name": "TrumpCoin",
          "symbol": "TRUMP:USDT",
          "count": 121,
          "sentiment": "0.01"
        },
        {
          "ticker": "DJT",
          "type": "stock",
          "name": "Trump Media & Technology Group Corp.",
          "symbol": "US:DJT",
          "count": 118,
          "sentiment": "0.04"
        },
        {
          "ticker": "VT",
          "type": "stock",
          "name": "Vanguard Total World Stock ETF",
          "symbol": "US:VT",
          "count": 116,
          "sentiment": "0.25"
        },
        {
          "ticker": "VXUS",
          "type": "stock",
          "name": "Vanguard Total International Stock ETF",
          "symbol": "US:VXUS",
          "count": 115,
          "sentiment": "0.25"
        },
        {
          "ticker": "GOOG",
          "type": "stock",
          "name": "Alphabet Inc - Class C",
          "symbol": "US:GOOG",
          "count": 111,
          "sentiment": "0.15"
        },
        {
          "ticker": "GOP",
          "type": "stock",
          "name": "Games Operators S.A.",
          "symbol": "US:GOP",
          "count": 109,
          "sentiment": "-0.04"
        },
        {
          "ticker": "MSTR",
          "type": "stock",
          "name": "Microstrategy Inc. - Class A",
          "symbol": "US:MSTR",
          "count": 109,
          "sentiment": "0.06"
        },
        {
          "ticker": "META",
          "type": "stock",
          "name": "Meta Platforms Inc - Class A",
          "symbol": "US:META",
          "count": 106,
          "sentiment": "0.10"
        },
        {
          "ticker": "SPGC",
          "type": "stock",
          "name": "Sacks Parente Golf Inc",
          "symbol": "US:SPGC",
          "count": 98,
          "sentiment": "0.16"
        },
        {
          "ticker": "DM",
          "type": "stock",
          "name": "Desktop Metal Inc - Class A",
          "symbol": "US:DM",
          "count": 97,
          "sentiment": "0.36"
        },
        {
          "ticker": "NATO",
          "type": "stock",
          "name": "Themes Transatlantic Defense ETF",
          "symbol": "US:NATO",
          "count": 94,
          "sentiment": "0.01"
        },
        {
          "ticker": "OKLO",
          "type": "stock",
          "name": "Oklo Inc. - Class A",
          "symbol": "US:OKLO",
          "count": 86,
          "sentiment": "0.14"
        },
        {
          "ticker": "AMZN",
          "type": "stock",
          "name": "Amazon.com Inc.",
          "symbol": "US:AMZN",
          "count": 85,
          "sentiment": "0.35"
        },
        {
          "ticker": "CVNA",
          "type": "stock",
          "name": "Carvana Co. - Class A",
          "symbol": "US:CVNA",
          "count": 85,
          "sentiment": "0.02"
        },
        {
          "ticker": "GOOGL",
          "type": "stock",
          "name": "Alphabet Inc - Class A",
          "symbol": "US:GOOGL",
          "count": 84,
          "sentiment": "0.18"
        },
        {
          "ticker": "LNG",
          "type": "stock",
          "name": "Cheniere Energy Inc.",
          "symbol": "US:LNG",
          "count": 82,
          "sentiment": "0.07"
        },
        {
          "ticker": "ET",
          "type": "stock",
          "name": "Energy Transfer LP - Unit",
          "symbol": "US:ET",
          "count": 80,
          "sentiment": "0.39"
        },
        {
          "ticker": "PC",
          "type": "stock",
          "name": "Premium Catering (Holdings) Limited Ordinary Shares",
          "symbol": "US:PC",
          "count": 78,
          "sentiment": "-0.22"
        },
        {
          "ticker": "MSCI",
          "type": "stock",
          "name": "MSCI Inc",
          "symbol": "US:MSCI",
          "count": 77,
          "sentiment": "-0.20"
        },
        {
          "ticker": "TR",
          "type": "stock",
          "name": "Tootsie Roll Industries, Inc.",
          "symbol": "US:TR",
          "count": 77,
          "sentiment": "-0.27"
        },
        {
          "ticker": "ADA",
          "type": "crypto",
          "name": "Cardano",
          "symbol": "ADA:USDT",
          "count": 76,
          "sentiment": "0.14"
        },
        {
          "ticker": "SMCI",
          "type": "stock",
          "name": "Super Micro Computer Inc",
          "symbol": "US:SMCI",
          "count": 74,
          "sentiment": "0.14"
        },
        {
          "ticker": "AAPL",
          "type": "stock",
          "name": "Apple Inc",
          "symbol": "US:AAPL",
          "count": 71,
          "sentiment": "0.15"
        },
        {
          "ticker": "HYSA",
          "type": "stock",
          "name": "BondBloxx ETF Trust - BondBloxx USD High Yield Bond Sector Rotation ETF",
          "symbol": "US:HYSA",
          "count": 70,
          "sentiment": "0.40"
        },
        {
          "ticker": "INTC",
          "type": "stock",
          "name": "Intel Corp.",
          "symbol": "US:INTC",
          "count": 70,
          "sentiment": "0.13"
        },
        {
          "ticker": "AMC",
          "type": "stock",
          "name": "AMC Entertainment Holdings Inc - Class A",
          "symbol": "US:AMC",
          "count": 67,
          "sentiment": "0.18"
        },
        {
          "ticker": "TDS",
          "type": "stock",
          "name": "Telephone And Data Systems, Inc.",
          "symbol": "US:TDS",
          "count": 65,
          "sentiment": "-0.00"
        },
        {
          "ticker": "RKLB",
          "type": "stock",
          "name": "Rocket Lab USA Inc",
          "symbol": "US:RKLB",
          "count": 63,
          "sentiment": "0.18"
        },
        {
          "ticker": "ASTS",
          "type": "stock",
          "name": "AST SpaceMobile Inc - Class A",
          "symbol": "US:ASTS",
          "count": 62,
          "sentiment": "0.11"
        },
        {
          "ticker": "PR",
          "type": "stock",
          "name": "Permian Resources Corp - Class A",
          "symbol": "US:PR",
          "count": 61,
          "sentiment": "0.17"
        },
        {
          "ticker": "DOE",
          "type": "crypto",
          "name": "Double Eagle",
          "symbol": "DOE:USDT",
          "count": 61,
          "sentiment": "0.07"
        },
        {
          "ticker": "WTS",
          "type": "stock",
          "name": "Watts Water Technologies, Inc. - Class A",
          "symbol": "US:WTS",
          "count": 59,
          "sentiment": "0.21"
        },
        {
          "ticker": "DC",
          "type": "stock",
          "name": "Dakota Gold Corp",
          "symbol": "US:DC",
          "count": 59,
          "sentiment": "0.05"
        },
        {
          "ticker": "ONE",
          "type": "crypto",
          "name": "Harmony",
          "symbol": "ONE:USDT",
          "count": 57,
          "sentiment": "0.04"
        },
        {
          "ticker": "MGOL",
          "type": "stock",
          "name": "MGO Global Inc",
          "symbol": "US:MGOL",
          "count": 57,
          "sentiment": "0.28"
        },
        {
          "ticker": "LINK",
          "type": "crypto",
          "name": "Chainlink",
          "symbol": "LINK:USDT",
          "count": 57,
          "sentiment": "0.17"
        },
        {
          "ticker": "EPS",
          "type": "stock",
          "name": "WisdomTree U.S. LargeCap Fund",
          "symbol": "US:EPS",
          "count": 57,
          "sentiment": "0.31"
        },
        {
          "ticker": "USDC",
          "type": "crypto",
          "name": "USD Coin",
          "symbol": "USDC:USDT",
          "count": 56,
          "sentiment": "0.26"
        },
        {
          "ticker": "COST",
          "type": "stock",
          "name": "Costco Wholesale Corp",
          "symbol": "US:COST",
          "count": 55,
          "sentiment": "0.26"
        },
        {
          "ticker": "PYPL",
          "type": "stock",
          "name": "PayPal Holdings Inc",
          "symbol": "US:PYPL",
          "count": 54,
          "sentiment": "0.11"
        },
        {
          "ticker": "USDT",
          "type": "crypto",
          "name": "Tether USD",
          "symbol": "USDT:USD",
          "count": 53,
          "sentiment": "0.22"
        },
        {
          "ticker": "GOOD",
          "type": "stock",
          "name": "Gladstone Commercial Corp",
          "symbol": "US:GOOD",
          "count": 53,
          "sentiment": "0.15"
        },
        {
          "ticker": "LUNR",
          "type": "stock",
          "name": "Intuitive Machines Inc - Class A",
          "symbol": "US:LUNR",
          "count": 53,
          "sentiment": "0.24"
        },
        {
          "ticker": "SCHG",
          "type": "stock",
          "name": "Schwab U.S. Large-Cap Growth ETF",
          "symbol": "US:SCHG",
          "count": 52,
          "sentiment": "0.34"
        },
        {
          "ticker": "HOOD",
          "type": "stock",
          "name": "Robinhood Markets Inc - Class A",
          "symbol": "US:HOOD",
          "count": 52,
          "sentiment": "0.11"
        },
        {
          "ticker": "SGOV",
          "type": "stock",
          "name": "iShares 0-3 Month Treasury Bond ETF",
          "symbol": "US:SGOV",
          "count": 51,
          "sentiment": "0.34"
        },
        {
          "ticker": "CNN",
          "type": "crypto",
          "name": "Content Neutrality Network",
          "symbol": "CNN:USD",
          "count": 51,
          "sentiment": "-0.06"
        },
        {
          "ticker": "JEPQ",
          "type": "stock",
          "name": "J.P. Morgan Exchange-Traded Fund Trust - JPMorgan Nasdaq Equity Premium Income ETF",
          "symbol": "US:JEPQ",
          "count": 51,
          "sentiment": "0.31"
        },
        {
          "ticker": "BBBY",
          "type": "stock",
          "name": "Bed, Bath & Beyond Inc.",
          "symbol": "US:BBBY",
          "count": 51,
          "sentiment": "0.08"
        },
        {
          "ticker": "IQ",
          "type": "stock",
          "name": "iQIYI Inc - ADR",
          "symbol": "US:IQ",
          "count": 49,
          "sentiment": "-0.00"
        },
        {
          "ticker": "GM",
          "type": "stock",
          "name": "General Motors Company",
          "symbol": "US:GM",
          "count": 48,
          "sentiment": "0.06"
        },
        {
          "ticker": "IP",
          "type": "stock",
          "name": "International Paper Co.",
          "symbol": "US:IP",
          "count": 48,
          "sentiment": "0.01"
        },
        {
          "ticker": "CAN",
          "type": "stock",
          "name": "Canaan Inc - ADR",
          "symbol": "US:CAN",
          "count": 46,
          "sentiment": "0.06"
        },
        {
          "ticker": "MO",
          "type": "stock",
          "name": "Altria Group Inc.",
          "symbol": "US:MO",
          "count": 45,
          "sentiment": "0.18"
        },
        {
          "ticker": "CRO",
          "type": "crypto",
          "name": "Crypto.com Coin",
          "symbol": "CRO:USDT",
          "count": 44,
          "sentiment": "0.13"
        },
        {
          "ticker": "MF",
          "type": "stock",
          "name": "Missfresh Ltd - ADR",
          "symbol": "US:MF",
          "count": 43,
          "sentiment": "0.06"
        },
        {
          "ticker": "SPOT",
          "type": "stock",
          "name": "Spotify Technology S.A.",
          "symbol": "US:SPOT",
          "count": 43,
          "sentiment": "0.17"
        },
        {
          "ticker": "JD",
          "type": "stock",
          "name": "JD.com Inc - ADR",
          "symbol": "US:JD",
          "count": 42,
          "sentiment": "0.09"
        },
        {
          "ticker": "NIO",
          "type": "stock",
          "name": "NIO Inc - ADR",
          "symbol": "US:NIO",
          "count": 42,
          "sentiment": "0.05"
        },
        {
          "ticker": "DIP",
          "type": "stock",
          "name": "BTD Capital Fund",
          "symbol": "US:DIP",
          "count": 42,
          "sentiment": "0.05"
        },
        {
          "ticker": "MORE",
          "type": "stock",
          "name": "ASYMmetric ETFs Trust - ASYMmetric Smart Income ETF",
          "symbol": "US:MORE",
          "count": 41,
          "sentiment": "-0.06"
        },
        {
          "ticker": "HIMS",
          "type": "stock",
          "name": "Hims & Hers Health Inc - Class A",
          "symbol": "US:HIMS",
          "count": 41,
          "sentiment": "0.08"
        },
        {
          "ticker": "HBAR",
          "type": "crypto",
          "name": "Hedera Hashgraph",
          "symbol": "HBAR:USDT",
          "count": 41,
          "sentiment": "0.21"
        },
        {
          "ticker": "LOT",
          "type": "stock",
          "name": "Lotus Technology Inc. - ADR",
          "symbol": "US:LOT",
          "count": 41,
          "sentiment": "0.14"
        },
        {
          "ticker": "ACHR",
          "type": "stock",
          "name": "Archer Aviation Inc - Class A",
          "symbol": "US:ACHR",
          "count": 41,
          "sentiment": "0.23"
        },
        {
          "ticker": "TSM",
          "type": "stock",
          "name": "Taiwan Semiconductor Manufacturing - ADR",
          "symbol": "US:TSM",
          "count": 41,
          "sentiment": "0.12"
        },
        {
          "ticker": "OUT",
          "type": "stock",
          "name": "Outfront Media Inc",
          "symbol": "US:OUT",
          "count": 41,
          "sentiment": "0.02"
        },
        {
          "ticker": "WAS",
          "type": "crypto",
          "name": "WAS",
          "symbol": "WAS:USDT",
          "count": 41,
          "sentiment": "-0.10"
        },
        {
          "ticker": "NEWS",
          "type": "stock",
          "name": "News Network Corporation Public Company Limited",
          "symbol": "US:NEWS",
          "count": 41,
          "sentiment": "0.11"
        },
        {
          "ticker": "PP",
          "type": "stock",
          "name": "Tidal Trust II - The Meet Kevin Pricing Power ETF",
          "symbol": "US:PP",
          "count": 40,
          "sentiment": "0.19"
        },
        {
          "ticker": "BABA",
          "type": "stock",
          "name": "Alibaba Group Holding Ltd - ADR",
          "symbol": "US:BABA",
          "count": 40,
          "sentiment": "0.23"
        },
        {
          "ticker": "UBER",
          "type": "stock",
          "name": "Uber Technologies Inc",
          "symbol": "US:UBER",
          "count": 39,
          "sentiment": "0.22"
        },
        {
          "ticker": "ASAP",
          "type": "stock",
          "name": "Waitr Holdings Inc",
          "symbol": "US:ASAP",
          "count": 39,
          "sentiment": "0.03"
        },
        {
          "ticker": "ID",
          "type": "stock",
          "name": "PARTS iD Inc - Class A",
          "symbol": "US:ID",
          "count": 39,
          "sentiment": "0.18"
        },
        {
          "ticker": "HE",
          "type": "stock",
          "name": "Hawaiian Electric Industries, Inc.",
          "symbol": "US:HE",
          "count": 39,
          "sentiment": "-0.10"
        },
        {
          "ticker": "BYD",
          "type": "stock",
          "name": "Boyd Gaming Corp.",
          "symbol": "US:BYD",
          "count": 39,
          "sentiment": "0.12"
        },
        {
          "ticker": "OG",
          "type": "stock",
          "name": "Onion Global Ltd - ADR",
          "symbol": "US:OG",
          "count": 38,
          "sentiment": "0.12"
        },
        {
          "ticker": "BACK",
          "type": "stock",
          "name": "IMAC Holdings Inc",
          "symbol": "US:BACK",
          "count": 38,
          "sentiment": "-0.06"
        },
        {
          "ticker": "VGT",
          "type": "stock",
          "name": "Vanguard Information Technology ETF",
          "symbol": "US:VGT",
          "count": 38,
          "sentiment": "0.33"
        }
      ]





      // Return the processed data as an object
      return {
        data: apiResponse, // No need to stringify
        success: true
      };

    } catch (err) {
      console.error('Error processing updateMentions request:', err);
      return fail(500, { error: 'Internal server error' });
    }
  }

};

