import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDTO, ProductFilterDto } from './dto/create-product.dto';
import { buildFileUrl } from 'src/helper/urlBuilder';
import { Express } from 'express'; // Import Express for Multer types

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // create product (UPDATED)
  async create(
    createProductDto: CreateProductDTO,
    imges: Express.Multer.File[],
    tutorialVideo: Express.Multer.File | null, // Correctly handle the optional single file
  ) {
    try {
      // 1. Process Images
      const imagePaths = imges?.map((file) => buildFileUrl(file.filename)) || [];

      // 2. Process Tutorial Video
      // If a video file exists, create its URL; otherwise, use null or the URL from DTO (if it contains an existing reference)
      const tutorialVideoUrl = tutorialVideo
        ? buildFileUrl(tutorialVideo.filename)
        : createProductDto.tutorial || null; // Fallback to DTO property if file is missing

      const discouted_price = createProductDto.price * 0.8;

      const res = await this.prisma.product.create({
        data: {
          title: createProductDto.title,
          description: createProductDto.description,
          product_type: createProductDto.product_type as any,
          up_to_kids: createProductDto.up_to_kids,
          age_range: createProductDto.age_range,
          price: createProductDto.price,
          theme: createProductDto.theme,
          included: createProductDto.included,
          // Use the generated video URL here
          tutorial: tutorialVideoUrl, 
          discounted_price: discouted_price,
          imges: imagePaths,
          avg_rating: 0,
          total_review: 0,
          activities: {
            create: createProductDto.activities.map((a) => ({
              title: a.title,
              description: a.description,
            })),
          },
        },
        include: { activities: true },
      });
      return res;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async findAll(filterDto: ProductFilterDto = {}) {
    const { search, age_range, theme } = filterDto;

    const filterCriteria: any = {};

    if (age_range) {
      filterCriteria.age_range = age_range;
    }
    if (theme) {
      filterCriteria.theme = theme;
    }

    let searchCondition: any = {};
    if (search) {
      searchCondition.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    const commonWhere = {
      ...searchCondition,
      ...filterCriteria,
    };

    // 3. Fetch DIY Boxes
    const diyBoxes = await this.prisma.product.findMany({
      where: {
        product_type: 'DIY_BOX',
        ...commonWhere,
      },
      include: { reviews: true },
    });

    const gifts = await this.prisma.product.findMany({
      where: {
        product_type: 'GIFT',
        ...commonWhere,
      },
      include: { reviews: true },
    });

    return { diyBoxes, gifts };
  }

  // Get product by Id
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { activities: true, reviews: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  // Update product (UPDATED)
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    images?: Express.Multer.File[],
    tutorialVideo?: Express.Multer.File | null,
  ) {
    try {
      const { activities, ...productData } = updateProductDto;
      const imagePaths = images?.map((file) => buildFileUrl(file.filename));
      let tutorialVideoUrl: string | undefined = undefined;
      if (tutorialVideo) {
          tutorialVideoUrl = buildFileUrl(tutorialVideo.filename);
      } else if (productData.tutorial !== undefined) {
          tutorialVideoUrl = productData.tutorial;
      }
      
      return this.prisma.$transaction(async (prisma) => {
        if (activities) {
          await prisma.activity.deleteMany({
            where: { productId: id },
          });
        }

        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            ...productData,
            ...(productData.product_type && { product_type: productData.product_type as any }),
            ...(imagePaths ? { imges: imagePaths } : {}), 
            ...(tutorialVideoUrl !== undefined ? { tutorial: tutorialVideoUrl } : {}),
          },
        });

        if (activities && activities.length > 0) {
          await prisma.activity.createMany({
            data: activities.map((a) => ({
              title: a.title,
              description: a.description,
              productId: updatedProduct.id,
            })),
          });
        }

        return prisma.product.findUnique({
          where: { id },
          include: { activities: true },
        });
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Delete product (NO CHANGE)
  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.prisma.$transaction(async (prisma) => {
      await prisma.activity.deleteMany({ where: { productId: id } });
      return prisma.product.delete({ where: { id } });
    });
  }
}