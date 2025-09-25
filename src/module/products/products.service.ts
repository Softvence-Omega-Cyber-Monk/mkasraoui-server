import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDTO } from './dto/create-product.dto';
import { buildFileUrl } from 'src/helper/urlBuilder';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  
  // create product
  async create(createProductDto: CreateProductDTO, imges: Express.Multer.File[]) {
    try {
      const imagePaths = imges?.map((file) => buildFileUrl(file.filename)) || [];

      const res = await this.prisma.product.create({
        data: {
          ...createProductDto, 
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

  async findAll() {
    return this.prisma.product.findMany({ include: { reviews: true } });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { activities: true,reviews: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  // Update product
  async update(id: string, updateProductDto: UpdateProductDto, images?: Express.Multer.File[]) {
    try {
      const { activities, ...productData } = updateProductDto;
      const imagePaths = images?.map((file) => buildFileUrl(file.filename));

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
            ...(imagePaths ? { imges: imagePaths } : {}),
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

  // Delete product
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