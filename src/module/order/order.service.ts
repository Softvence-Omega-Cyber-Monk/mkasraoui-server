// import { Injectable } from '@nestjs/common';
// import { OrderStatus } from '@prisma/client';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class OrderService {
//      constructor(private prisma: PrismaService) {}
//     async getProductById(productId: string) {
//   return this.prisma.product.findUnique({ where: { id: productId } });
// }

// async getUserEmail(userId: string) {
//   const user = await this.prisma.user.findUnique({ where: { id: userId } });
//   return user?.email;
// }

// async createOrder(userId: string, product: any) {
//   return this.prisma.order.create({
//     data: {
//       userId,
//       productId: product.id,
//       amount: product.price,
//       status: 'PENDING',
//     },
//   });
// }

// async updateOrderStatus(orderId: string, status:OrderStatus) {
//   return this.prisma.order.update({
//     where: { id: orderId },
//     data: {
//       status:status
//      },
//   });
// }

// async createTransaction(data: {
//   orderId: string;
//   stripeId: string;
//   amount: number;
//   currency: string;
//   status: string;
// }) {
//   return this.prisma.transaction.create({ data });
// }

// }
