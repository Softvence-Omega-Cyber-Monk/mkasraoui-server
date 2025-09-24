// src/common/interceptors/transform.interceptor.ts

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, TResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<TResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map(result => {
        let message = 'Request successful';
        let data = result;
        if (result && typeof result === 'object' && result.message !== undefined) {
          message = result.message;
          data = result.data;
        } else {
          if (response.statusCode === HttpStatus.CREATED) {
            message = ' created successfully';
          } else if (response.statusCode === HttpStatus.OK) {
            message = ' retrieved successfully';
          } else if (response.statusCode === HttpStatus.NO_CONTENT) {
            message = ' deleted successfully';
          }
        }

        return {
          statusCode: response.statusCode,
          success: response.statusCode >= 200 && response.statusCode < 300,
          message: message,
          data: data,
        };
      }),
    );
  }
}