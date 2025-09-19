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
        partyType: dto.partyType,
        partyLocation: dto.partyLocation,
        description: dto.description,
        budgetRange: dto.budgetRange,
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

  // User’s quote history
  async getUserQuotes(userId: string) {
    return this.prisma.quote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { provider: true },
    });
  }

  // Provider’s quote history
  async getProviderQuotes(providerId: string) {
    return this.prisma.quote.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }
}
