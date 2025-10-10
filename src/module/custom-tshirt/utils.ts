// import axios from 'axios';

// export async function getGelatoVariantUid(
//   productUid: string,
//   tShirtType: string,
//   size: string,
//   color: string
// ): Promise<string> {
//   const gelatoKey = process.env.GELATO_API_KEY!;
//   const gelatoApi = process.env.GELATO_API_URL!;
//   console.log(gelatoApi,gelatoKey)
//   // Fetch all variants from Gelato
//   const response = await axios.get(`${gelatoApi}/products/${productUid}/variants`, {
//     headers: { 'X-API-KEY': gelatoKey }
//   });

//   const variants = response.data;

//   // Normalize input
//   const typeLower = tShirtType.toLowerCase();
//   const sizeLower = size.toLowerCase();
//   const colorLower = color.toLowerCase();

//   // Find matching variant
//   const variant = variants.find(
//     (v: any) =>
//       v.size.toLowerCase() === sizeLower &&
//       v.color.toLowerCase() === colorLower &&
//       v.uid.toLowerCase().includes(typeLower) 
//   );

//   if (!variant) {
//     throw new Error(
//       `No Gelato variant found for type=${tShirtType}, size=${size}, color=${color}`
//     );
//   }

//   return variant.uid;
// }
