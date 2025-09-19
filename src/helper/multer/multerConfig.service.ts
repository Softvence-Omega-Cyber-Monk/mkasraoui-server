import { Injectable } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import * as fs from 'fs';


@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
createMulterOptions(): MulterModuleOptions {
return {
storage: diskStorage({
destination: (req, file, cb) => {
// Use process.cwd() so the folder is created in project root (not inside dist)
const uploadPath = resolve(process.cwd(), 'uploads');
try {
fs.mkdirSync(uploadPath, { recursive: true });
console.log('Ensured upload folder at:', uploadPath);
cb(null, uploadPath);
} catch (err) {
console.error('Failed to create upload folder', err);
cb(err as any, uploadPath);
}
},
filename: (req, file, cb) => {
const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
const fileExt = extname(file.originalname);
const filename = `product-${uniqueSuffix}${fileExt}`;
console.log('Saving file:', file.originalname, '->', filename);
cb(null, filename);
},
}),
fileFilter: (req, file, cb) => {
if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
return cb(new Error('Only image files are allowed!'), false);
}
cb(null, true);
},
limits: {
fileSize: 5 * 1024 * 1024, // 5 MB
},
};
}
}