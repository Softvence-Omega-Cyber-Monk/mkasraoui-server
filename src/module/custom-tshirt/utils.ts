import axios from "axios";

export async function analyzeGelatoResponse() {
  try {
    const gelatoKey = process.env.GELATO_API_KEY;

    // Test the working endpoint with detailed logging
    const response = await axios.get(
      "https://api.gelato.com/v3/products?include=variants,options",
      {
        headers: {
          "X-API-KEY": gelatoKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("=== FULL RESPONSE ANALYSIS ===");
    console.log("Total products:", response.data.products.length);
    
    // Look at the first few products in detail
    const sampleProducts = response.data.products.slice(0, 3);
    
    sampleProducts.forEach((product: any, index: number) => {
      console.log(`\n--- Product ${index + 1} ---`);
      console.log("Product UID:", product.productUid);
      console.log("Product Name UID:", product.productNameUid);
      console.log("Product Type:", product.productTypeUid);
      console.log("All keys:", Object.keys(product));
      
      // Check if variants exist
      if (product.variants) {
        console.log("✅ HAS VARIANTS:", product.variants.length);
        console.log("Variant sample:", product.variants[0]);
      } else {
        console.log("❌ NO VARIANTS");
      }
      
      // Check if options exist
      if (product.options) {
        console.log("✅ HAS OPTIONS:", Object.keys(product.options));
      } else {
        console.log("❌ NO OPTIONS");
      }
      
      // Check attributes for size/color info
      if (product.attributes) {
        console.log("Attributes:", product.attributes);
      }
    });

    // Specifically look for apparel products
    const apparelProducts = response.data.products.filter((p: any) => 
      p.productTypeUid === 't-shirt' || p.productUid.includes('t-shirt')
    );
    
    console.log(`\n=== APPAREL PRODUCTS (${apparelProducts.length}) ===`);
    apparelProducts.forEach((product: any) => {
      console.log("Apparel Product:", product.productUid);
      console.log("Has variants?", !!product.variants);
      console.log("Has options?", !!product.options);
      console.log("---");
    });

    return response.data;

  } catch (error: any) {
    console.error("Analysis failed:", error.message);
    throw error;
  }
}


export async function testApparelEndpoint() {
  try {
    const gelatoKey = process.env.GELATO_API_KEY;

    const response = await axios.get(
      "https://api.gelato.com/v3/products?productType=apparel&include=variants",
      {
        headers: {
          "X-API-KEY": gelatoKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("=== APPAREL ENDPOINT ANALYSIS ===");
    console.log("Apparel products found:", response.data.products.length);
    
    if (response.data.products.length > 0) {
      const firstProduct = response.data.products[0];
      console.log("First apparel product:", firstProduct.productUid);
      console.log("All keys:", Object.keys(firstProduct));
      
      if (firstProduct.variants) {
        console.log("Variants found:", firstProduct.variants.length);
        console.log("First variant:", firstProduct.variants[0]);
      }
    }

    return response.data;

  } catch (error: any) {
    console.error("Apparel endpoint failed:", error.message);
    throw error;
  }
}