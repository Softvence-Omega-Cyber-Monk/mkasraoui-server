import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { buildFileUrl } from 'src/helper/urlBuilder';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(createBlogDto:any, files: Express.Multer.File[], user_id: string) {
    const imagePaths = files?.map((file) => buildFileUrl(file.filename)) || [];

    const res = await this.prisma.blog.create({
      data: {
        title: (createBlogDto as any).title || '',
        description: (createBlogDto as any).description || '',
        conclusion: (createBlogDto as any).conclusion || '',
        badge: createBlogDto.badge || null,
        tag: createBlogDto.tag || [],
        images: imagePaths,
        user_id: user_id,
      },
    });
    return res;
  }

  async findAll() {
    try {
      const blogs = await this.prisma.blog.findMany();
      return blogs;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve blog posts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const blog = await this.prisma.blog.findUnique({
        where: { id },
      });

      if (!blog) {
        throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
      }
      return blog;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve blog post',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateBlogDto: any, files?: Express.Multer.File[]) {
    try {
      // Create a data object to hold the fields to update
      const updateData: any = {
      title: updateBlogDto.title, 
      description: updateBlogDto.description, 
      conclusion: updateBlogDto.conclusion,
       badge: updateBlogDto.badge, 
       tag: updateBlogDto.tag,
      };

      // Check if new files were uploaded and update the images field accordingly
      if (files && files.length > 0) {
        const imagePaths = files.map((file) => buildFileUrl(file.filename));
        updateData.images = imagePaths;
      }

      const updatedBlog = await this.prisma.blog.update({
        where: { id },
        data: updateData,
      });

      return updatedBlog;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update blog post',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      const blog = await this.prisma.blog.delete({
        where: { id },
      });
      return blog;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete blog post',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
