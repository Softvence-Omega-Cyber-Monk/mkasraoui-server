import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDTO, ProductFilterDto } from './dto/create-product.dto';
import { buildFileUrl } from 'src/helper/urlBuilder';
import { ActivityQuery } from './dto/activityQuery.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // create product (UPDATED)
// Assuming buildFileUrl is a helper function and CreateProductDTO is imported

async create(
  createProductDto: CreateProductDTO,
  imges: Express.Multer.File[],
  tutorialVideo: Express.Multer.File | null,
) {
  try {
    // 1. Prepare file URLs
    // This correctly uses the uploaded files, ignoring the (now optional) DTO.imges field.
    const imagePaths = imges?.map((file) => buildFileUrl(file.filename)) || [];

    const tutorialVideoUrl = tutorialVideo
      ? buildFileUrl(tutorialVideo.filename)
      : createProductDto.tutorial || null;

    // 2. Calculate discounted price
    const discouted_price = createProductDto.price * 0.8;

    // 3. Create Product record
    const res = await this.prisma.product.create({
      data: {
        title: createProductDto.title,
        description: createProductDto.description,
        
        product_type: createProductDto.product_type as any,
        up_to_kids: createProductDto.up_to_kids,
        age_range: createProductDto.age_range,
        price: createProductDto.price,
        theme: createProductDto.theme as any,
        category: createProductDto.category as any, 
        
        included: createProductDto.included,
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
    console.log('Error in product creation service:', err);
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

    // const gifts = await this.prisma.product.findMany({
    //   where: {
    //     product_type: 'GIFT',
    //     ...commonWhere,
    //   },
    //   include: { reviews: true },
    // });

    return { diyBoxes
      //  gifts 
      };
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

  // Delete product safely
  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (prisma) => {
      // Delete dependent records first
      await prisma.activity.deleteMany({ where: { productId: id } });
      await prisma.orderItem.deleteMany({ where: { productId: id } });
      await prisma.favorite.deleteMany({ where: { product_id: id } });
      await prisma.productReview.deleteMany({where: { productId: id }})


      // Now safely delete the product
      return prisma.product.delete({ where: { id } });
    });
  }




// DIY Activity 

  async create_activity(activity: any, videoFile: any, pdfFile: any) { // ADD pdfFile
    const videoUrl = videoFile ? buildFileUrl(videoFile.filename) : undefined;
    const pdfUrl = pdfFile ? buildFileUrl(pdfFile.filename) : undefined; // NEW
    
    // The 'activity' object already contains 'material' from the body
    const res = await this.prisma.dIY_activity.create({
        data: {
            ...activity,
            video: videoUrl,
            pdfFile: pdfUrl, // NEW
            // 'material' is spread in from '...activity'
        }
    });
    return res;
}

  async get_all_activity(filterDto: ActivityQuery) {
    const { search } = filterDto;
    const searchCondition: any = {};
    if (search) {
      searchCondition.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ];
    }
   
    return this.prisma.dIY_activity.findMany({
      where: {
        ...searchCondition
      }
    });
  }

  // Get product by Id
  async findOneActivity(id: string) {
    const product = await this.prisma.dIY_activity.findUnique({
      where: { id },
      include: { 
         activityReview: true },
    });

    if (!product) {
      throw new NotFoundException(`Activities with ID ${id} not found`);
    }

    return product;
  }


  async delete_activity(id:string){
    const product = await this.prisma.dIY_activity.findUnique(
      { where: { id } });
    if (!product) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (prisma) => {
      // Delete dependent records first
      await prisma.activityReview.deleteMany({ where: { activityId: id } });

      // Now safely delete the product
      return prisma.dIY_activity.delete({ where: { id } });
    });
  }






async update_activity(activity: any, videoFile: any, pdfFile: any, id: string) { // ADD pdfFile
    let videoUrl: any = undefined;
    let pdfUrl: any = undefined; // NEW

    // 1. Determine the video URL
    if (videoFile) {
        // New video file uploaded
        videoUrl = buildFileUrl(videoFile.filename);
    } else if (activity.video === null) {
        // Client explicitly sent 'video: null' to clear it
        videoUrl = null;
    }
    
    // 2. Determine the PDF URL (NEW LOGIC)
    if (pdfFile) {
        // New PDF file uploaded
        pdfUrl = buildFileUrl(pdfFile.filename);
    } else if (activity.pdfFile === null) {
        // Client explicitly sent 'pdfFile: null' to clear it
        pdfUrl = null;
    }

    const updateData: any = {
        title: activity.title,
        description: activity.description,
        instruction_sheet: activity.instruction_sheet,
        material: activity.material, // ADDED
        
        // Only include the video field if it was updated or explicitly cleared
        ...(videoUrl !== undefined ? { video: videoUrl } : {}), 
        
        // Only include the pdfFile field if it was updated or explicitly cleared (NEW)
        ...(pdfUrl !== undefined ? { pdfFile: pdfUrl } : {}), 
    };

    try {
        // 3. Use update for a single record.
        const res = await this.prisma.dIY_activity.update({
            where: {
                id: id
            },
            data: updateData
        });
        return res;
    } catch (err) {
        // Handle the case where the record ID doesn't exist
        if (err.code === 'P2025') {
            throw new NotFoundException(`DIY Activity with ID ${id} not found.`);
        }
        throw err;
    }
}



}