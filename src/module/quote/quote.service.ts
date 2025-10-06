import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { QuoteStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class QuoteService {
  constructor(private prisma: PrismaService) {}

  // User sends quote request to provider
  async createQuote(userId: string, dto: any) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id: dto.providerId },
    });
    if (!provider) throw new NotFoundException('Provider not found');
    if (!provider.isApproved)
      throw new BadRequestException('Provider is not approved');

    const quote = await this.prisma.quote.create({
      data: {
        userId,
        providerId: dto.providerId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        date: new Date(dto.date),
        time: new Date(dto.time),
        numberOfGuest: dto.numberOfGuest,
        partyTheme: dto.partyTheme,
        partyLocation: dto.partyLocation,
        description: dto.description,
        price: dto.price,
        status: QuoteStatus.PENDING,
      },
    });

    return quote;
  }

  // Provider updates (BOOKED or CANCELLED)
  async updateQuoteStatus(providerId: string, quoteId: string, status: QuoteStatus) {
    const quote = await this.prisma.quote.findUnique({ where: { id: quoteId } });
    if (!quote) throw new NotFoundException('Quote not found');
    if (quote.providerId !== providerId)
      throw new ForbiddenException('Not your quote request'); 

    const updated = await this.prisma.quote.update({
      where: { id: quoteId },
      data: { status },
    });

    return updated;
  }

  // User cancels their own quote
  async cancelQuote(userId: string, quoteId: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id: quoteId } });
    if (!quote) throw new NotFoundException('Quote not found');
    if (quote.userId !== userId)
      throw new ForbiddenException('Not your quote request');

    if (quote.status === QuoteStatus.BOOKED) {
      throw new BadRequestException('Cannot cancel a booked quote');
    }

    return this.prisma.quote.update({
      where: { id: quoteId },
      data: { status: QuoteStatus.CANCELLED },
    });
  }
// User’s quote history with pagination
async getUserQuotes(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.quote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { provider: true },
      skip,
      take: limit,
    }),
    this.prisma.quote.count({ where: { userId } }),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
}

// Provider’s quote history with pagination
async getProviderQuotes(providerId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.quote.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
      skip,
      take: limit,
    }),
    this.prisma.quote.count({ where: { providerId } }),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
}

}
