import { Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /**
   * Add product to cart (if exists, increase quantity)
   */
  async addToCart(userId: string, productId: string, quantity: number = 1) {
    // Ensure product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Ensure user has a cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    }

    // Otherwise, create new cart item
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  /**
   * Get user cart with products
   */
  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return { items: [], total: 0 };
    }

    // Calculate total
    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    return { ...cart, total };
  }

  /**
   * Update quantity of an item
   */
  async updateQuantity(userId: string, productId: string, quantity: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => i.productId === productId);
    if (!item) throw new NotFoundException('Item not found in cart');

    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    return this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  }

  /**
   * Remove an item from cart
   */
  async removeItem(userId: string, productId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => i.productId === productId);
    if (!item) throw new NotFoundException('Item not found in cart');

    return this.prisma.cartItem.delete({
      where: { id: item.id },
    });
  }

  /**
   * Clear cart after successful order
   */
  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    if (!cart) return;

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Cart cleared' };
  }
}
