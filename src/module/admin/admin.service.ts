import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
constructor(private prisma:PrismaService) {}

 async getDashboardStats() {
    const [userCount, productCount, subscriptionRevenue,totalOrderRevenue,totalProvider] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.product.count(),

        this.prisma.subscription.aggregate({
            _sum: {
                price: true,
            },
        }),
        this.prisma.order.aggregate({
            _sum: {
                total: true,
            },
        }),
        this.prisma.user.count({
          where: { role: 'PROVIDER' }
        }),
    ]);
    const totat_subscription = subscriptionRevenue._sum.price || 0;
    const total_order = totalOrderRevenue._sum.total || 0;
    
    return {
        totalUsers: userCount,
        totalProducts: productCount,
        totalRevenue: total_order + totat_subscription,
        totalProviders: totalProvider
    };
}
}
