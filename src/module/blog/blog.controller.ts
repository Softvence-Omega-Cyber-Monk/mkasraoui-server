import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, HttpException, HttpStatus, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import sendResponse from '../utils/sendResponse';
import { Public } from 'src/common/decorators/public.decorators';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

@Post()
  @ApiOperation({ summary: 'Create a new blog post with images.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description:
            'The blog data as a JSON string, including title, description, and conclusion.',
          example: JSON.stringify({
            title: 'My First Blog Post',
            description: 'A detailed description of my new blog post.',
            conclusion: 'In conclusion, this topic is very interesting.',
          }),
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'The image files for the blog post.',
        },
      },
      required: ['data', 'files'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Blog post created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or file upload error.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'An unexpected error occurred.',
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async createBlog(
    @Body('data') data: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req:any,
  ) {
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const blogData: CreateBlogDto = JSON.parse(data);
      const user=req.user
      const createdBlog = await this.blogService.create(blogData, files,user.id);
      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: 'Blog post created successfully',
        data: createdBlog,
      };
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new HttpException('Invalid JSON data', HttpStatus.BAD_REQUEST);
      }
      console.error('Error creating blog post:', err);
      throw new HttpException(
        'Failed to create blog post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Retrieve all blog posts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all blog posts retrieved successfully.',
  })
  async findAll(@Res() res: Response) {
    try {
      const blogs = await this.blogService.findAll();
      sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Blog posts retrieved successfully',
        data: blogs,
      });
    } catch (error) {
      sendResponse(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Failed to retrieve blog posts',
        data: null,
      });
    }
  }
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Retrieve a single blog post by its ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog post retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Blog post not found.',
  })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const blog = await this.blogService.findOne(id);
      if (!blog) {
        throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
      }
      sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Blog post retrieved successfully',
        data: blog,
      });
    } catch (error) {
      sendResponse(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Failed to retrieve blog post',
        data: null,
      });
    }
  }

  // PATCH method for updating a blog by ID
    @Patch(':id')
  @ApiOperation({ summary: 'Update a blog post by its ID, including images.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description:
            'The blog data as a JSON string. Include fields like `title` and `description` to update.',
          example: JSON.stringify({
            title: 'My Updated Blog Title',
            description: 'This is the new description for the blog.',
          }),
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'The new image files for the blog post.',
        },
      },
      required: ['data'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog post updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Blog post not found.',
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body('data') data: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res: Response,
  ) {
    try {
      const updateBlogDto: UpdateBlogDto = data ? JSON.parse(data) : {};
      const updatedBlog = await this.blogService.update(id, updateBlogDto, files);

      sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Blog post updated successfully',
        data: updatedBlog,
      });
    } catch (error) {
      sendResponse(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Failed to update blog post',
        data: null,
      });
    }
  }

  // DELETE method for removing a blog by ID
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blog post by its ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog post deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Blog post not found.',
  })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const removedBlog = await this.blogService.remove(id);
      sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Blog post deleted successfully',
        data: removedBlog,
      });
    } catch (error) {
      sendResponse(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Failed to delete blog post',
        data: null,
      });
    }
  }
}
