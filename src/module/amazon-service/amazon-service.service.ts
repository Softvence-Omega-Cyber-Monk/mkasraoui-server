// src/amazon/amazon.service.ts
import { Injectable, Logger } from '@nestjs/common';
import amazonPaapi from 'amazon-paapi';

@Injectable()
export class AmazonService {
  private readonly logger = new Logger(AmazonService.name);
  private config: any;
  private enabled = false;

  constructor() {
    this.loadConfig();
  }

  /** Load credentials from .env and enable/disable API */
  private loadConfig() {
    const accessKey = process.env.AMAZON_ACCESS_KEY;
    const secretKey = process.env.AMAZON_SECRET_KEY;
    const partnerTag = process.env.AMAZON_PARTNER_TAG;
    const region = process.env.AMAZON_REGION || 'us-east-1';
    const enabled = process.env.AMAZON_ENABLED === 'true';

    if (enabled && accessKey && secretKey && partnerTag) {
      this.config = { accessKey, secretKey, partnerTag, region };
      this.enabled = true;
      this.logger.log('Amazon API initialized.');
    } else {
      this.logger.warn('Amazon API not enabled. Using static fallback data.');
    }
  }

  /** Fetch product details by ASINs */
  async getProducts(asins: string[]) {
    if (!this.enabled) {
      this.logger.warn('Returning static mock data (API not active).');
      return this.getStaticProducts();
    }

    try {
      const commonParameters = {
        AccessKey: this.config.accessKey,
        SecretKey: this.config.secretKey,
        PartnerTag: this.config.partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com',
      };

      const requestParameters = {
        ItemIds: asins,
        Resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'Offers.Listings.Price',
        ],
      };

      const response = await amazonPaapi.GetItems(commonParameters, requestParameters);
      const items = response.ItemsResult?.Items || [];

      return items.map((item) => ({
        asin: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Title',
        price:
          item.Offers?.Listings?.[0]?.Price?.DisplayAmount ||
          'Price unavailable',
        image: item.Images?.Primary?.Large?.URL || null,
        link: item.DetailPageURL || '',
      }));
    } catch (error) {
      this.logger.error('Error fetching data from Amazon API:', error);
      return this.getStaticProducts();
    }
  }

  /** Search products dynamically by keyword */
  async searchProducts(keyword: string) {
    if (!this.enabled) {
      this.logger.warn('Returning static mock data for search (API not active).');
      return this.getStaticProducts();
    }

    try {
      const commonParameters = {
        AccessKey: this.config.accessKey,
        SecretKey: this.config.secretKey,
        PartnerTag: this.config.partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com',
      };

      const requestParameters = {
        Keywords: keyword,
        SearchIndex: 'All',
        ItemCount: 6,
        Resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'Offers.Listings.Price',
        ],
      };

      const response = await amazonPaapi.SearchItems(commonParameters, requestParameters);
      const items = response.SearchResult?.Items || [];

      return items.map((item) => ({
        asin: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Title',
        price:
          item.Offers?.Listings?.[0]?.Price?.DisplayAmount ||
          'Price unavailable',
        image: item.Images?.Primary?.Large?.URL || null,
        link: item.DetailPageURL || '',
      }));
    } catch (error) {
      this.logger.error('Error searching products from Amazon API:', error);
      return this.getStaticProducts();
    }
  }

  /** Static fallback products for mock mode */
  private getStaticProducts() {
    return [
      {
        asin: 'B08N5WRWNW',
        title: 'Echo Dot (4th Gen)',
        price: '$49.99',
        image: 'https://m.media-amazon.com/images/I/61u0y9ADElL._AC_SL1000_.jpg',
        link: 'https://amzn.to/3KHm6Ye',
      },
      {
        asin: 'B08XVYZ1Y5',
        title: 'Fire TV Stick 4K',
        price: '$39.99',
        image: 'https://m.media-amazon.com/images/I/51CgKGfMelL._AC_SL1000_.jpg',
        link: 'https://amzn.to/48pBouy',
      },
      {
        asin: 'B0B8BQN8V1',
        title: 'Kindle Paperwhite',
        price: '$129.99',
        image: 'https://m.media-amazon.com/images/I/61Qe.jpg',
        link: 'https://amzn.to/3VVLJa7',
      },
      {
        asin: 'B0C5J5W9W8',
        title: 'Amazon Smart Plug',
        price: '$24.99',
        image: 'https://m.media-amazon.com/images/I/41k.jpg',
        link: 'https://amzn.to/47i2xOO',
      },
      // Add more static products if needed
    ];
  }
}
