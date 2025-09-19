import { Injectable, NotFoundException } from '@nestjs/common';


import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDTO } from './dto/create-product.dto';
import { buildFileUrl } from 'src/helper/urlBuilder';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDTO, imges: Express.Multer.File[]) {
   try{
     const imagePaths = imges?.map((file) => buildFileUrl(file.filename)) || [];
    
    const res=await this.prisma.product.create({
      data: {
        title: createProductDto.title,
        description: createProductDto.description,
        product_type: createProductDto.product_type,
        age_range: createProductDto.age_range,
        rattings: createProductDto.rattings,
        review: createProductDto.review,
        price: createProductDto.price,
        included: createProductDto.included,
        tutorial: createProductDto.tutorial,
        imges: imagePaths, 
        activities: {
          create: createProductDto.activities.map((a) => ({
            title: a.title,
            description: a.description,
          })),
        },
      },
      include: { activities: true },
    });
    return res
   }catch(err){
    console.log(err)
   }
  }

  async findAll() {
    return this.prisma.product.findMany({ include: { activities: true } });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { activities: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, imges?: Express.Multer.File[]) {
    const imagePaths = imges?.map((file) => file.filename);
    // const { activities, imges: _, ...productData } = updateProductDto;

    // return this.prisma.product.update({
    //   where: { id },
    //   data: {
    //     ...productData,
    //     ...(imagePaths ? { imges: imagePaths } : {}),
    //     activities: activities
    //       ? {
    //           deleteMany: { productId: id }, 
    //           create: activities.map((a) => ({
    //             title: a.title,
    //             description: a.description,
    //           })),
    //         }
    //       : undefined,
    //   },
    //   include: { activities: true },
    // });
  }

  async remove(id: string) {
    await this.prisma.activity.deleteMany({ where: { productId: id } });
    return this.prisma.product.delete({ where: { id } });
  }
}
