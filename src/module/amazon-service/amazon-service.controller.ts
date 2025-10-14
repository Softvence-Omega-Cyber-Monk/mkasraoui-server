// src/amazon/amazon.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AmazonService } from './amazon-service.service';

@ApiTags('Shop') // Group endpoints under "Shop" in Swagger
@Controller('shop')
export class AmazonController {
  constructor(private readonly amazonService: AmazonService) {}

  /**
   * Get specific products by ASINs
   * If no ASINs are provided, returns a default static product list
   */
  @Get('products')
  @ApiOperation({ summary: 'Fetch products by ASINs' })
  @ApiQuery({
    name: 'asins',
    required: false,
    description: 'Comma-separated list of Amazon ASINs to fetch',
    example: 'B08N5WRWNW,B08XVYZ1Y5',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of products',
    schema: {
      example: {
        data: [
          {
            asin: 'B08N5WRWNW',
            title: 'Echo Dot (4th Gen)',
            price: '$49.99',
            image: 'https://m.media-amazon.com/images/I/61u0y9ADElL._AC_SL1000_.jpg',
            link: 'https://amzn.to/3KHm6Ye',
          },
        ],
      },
    },
  })
  
  async getProducts(@Query('asins') asins: string) {
    const asinList = asins
      ? asins.split(',').map((a) => a.trim())
      : [
          // fallback default list of ASINs for static links
          'B0CTR3M62N',
          'B0DT6CPQJN',
          'B0B8BQN8V1',
          'B0FFMQP4QQ',
          'B0FJFPMGB3',
          'B097BRC39P',
          'B0CF999CQ3',
          'B08XY91S8Q'
        ];

    const products = await this.amazonService.getProducts(asinList);
    return { data: products };
  }

  /**
   * Search products dynamically by keyword
   */
  @Get('search')
  @ApiOperation({ summary: 'Search products by keyword' })
  @ApiQuery({
    name: 'keyword',
    required: true,
    description: 'Keyword to search products on Amazon',
    example: 'escape room',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of products matching the search keyword',
    schema: {
      example: {
        keyword: 'escape room',
        data: [
          {
            asin: 'B0B7FZVCS2',
            title: 'Escape Room The Game',
            price: '$29.99',
            image: 'https://m.media-amazon.com/images/I/81ZQ.jpg',
            link: 'https://www.amazon.com/dp/B0B7FZVCS2?tag=yourtag-20',
          },
        ],
      },
    },
  })
  async searchProducts(@Query('keyword') keyword: string) {
    if (!keyword) {
      return { message: 'Please provide a search keyword.' };
    }

    const products = await this.amazonService.searchProducts(keyword);
    return { keyword, data: products };
  }
}
