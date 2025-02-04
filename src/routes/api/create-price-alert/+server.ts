import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
    const { pb } = locals;
  const data = await request.json();

      let output;

 let newAlert = {
        'user': data['userId'],
        'symbol': data['symbol']?.toUpperCase(),
        'name': data['name'],
        'assetType': data['assetType']?.toLowerCase(),
        'targetPrice': Number(data['targetPrice']),
        'condition': data['condition']?.toLowerCase(),
        'priceWhenCreated': Number(data['priceWhenCreated']),
        'triggered': false,
    }

    
    try {

        output = await pb.collection("priceAlert")?.create(newAlert)

      } catch (err) {
          output = {}
      }

  return new Response(JSON.stringify(output));
};
