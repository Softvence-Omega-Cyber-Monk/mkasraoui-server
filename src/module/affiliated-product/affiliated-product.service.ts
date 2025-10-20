import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAffiliatedProductDto } from './dto/create-affiliated-product.dto';
import { UpdateAffiliatedProductDto } from './dto/update-affiliated-product.dto';

@Injectable()
export class AffiliatedProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateAffiliatedProductDto) {
    // Keep server-side defaults for avg_rating and total_review unless provided
    const data = {
      title: createDto.title,
      price: createDto.price,
      avg_rating: createDto.avgRating ?? 0,
      total_review: createDto.totalRatings ?? 0,
      image_url: createDto.imageUrl ?? null,
      affiliated_company:createDto.affiliatedCompany??null,
      link: createDto.link,
    };

    return this.prisma.affiliatedProduct.create({ data });
  }

async findAll(params: {
  page: number;
  limit: number;
  search?: string;
  company?: string;
}) {
  const { page, limit, search, company } = params;

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { affiliated_company: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (company) {
    where.affiliated_company = {
      contains: company,
      mode: 'insensitive',
    };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await this.prisma.$transaction([
    this.prisma.affiliatedProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    this.prisma.affiliatedProduct.count({ where }),
  ]);

  return {
    items,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}


  async findOne(id: string) {
    const product = await this.prisma.affiliatedProduct.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Affiliated product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateDto: UpdateAffiliatedProductDto) {
    // ensure product exists
    const existing = await this.prisma.affiliatedProduct.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Affiliated product with ID ${id} not found`);
    }

    const data: any = {};
    if (updateDto.title !== undefined) data.title = updateDto.title;
    if (updateDto.price !== undefined) data.price = updateDto.price;
    if (updateDto.affiliatedCompany !== undefined) data.affiliated_company = updateDto.affiliatedCompany;
    if (updateDto.avgRating !== undefined) data.avg_rating = updateDto.avgRating;
    if (updateDto.totalRatings !== undefined) data.total_review = updateDto.totalRatings;
    if (updateDto.imageUrl !== undefined) data.image_url = updateDto.imageUrl;
    if (updateDto.link !== undefined) data.link = updateDto.link;

    return this.prisma.affiliatedProduct.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    // ensure product exists
    const existing = await this.prisma.affiliatedProduct.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Affiliated product with ID ${id} not found`);
    }
    return this.prisma.affiliatedProduct.delete({
      where: { id },
    });
  }

  
}
