import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Listing } from './listing.entity'
import { Rfq } from './rfq.entity'
import { CreateListingDto } from './dto/create-listing.dto'
import { CreateRfqDto } from './dto/create-rfq.dto'

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Listing) private listingRepo: Repository<Listing>,
    @InjectRepository(Rfq) private rfqRepo: Repository<Rfq>,
  ) {}

  async findAll(opts: {
    category?: string
    location?: string
    page?: number
    limit?: number
  }): Promise<{ listings: Listing[]; total: number; page: number; pages: number }> {
    const page = Math.max(1, opts.page ?? 1)
    const limit = Math.min(100, Math.max(1, opts.limit ?? 20))
    const skip = (page - 1) * limit

    const qb = this.listingRepo
      .createQueryBuilder('listing')
      .where('listing.active = :active', { active: true })

    if (opts.category) {
      qb.andWhere('listing.category = :category', { category: opts.category })
    }

    if (opts.location) {
      qb.andWhere('LOWER(listing.location) LIKE :location', {
        location: `%${opts.location.toLowerCase()}%`,
      })
    }

    qb.orderBy('listing.createdAt', 'DESC').skip(skip).take(limit)

    const [listings, total] = await qb.getManyAndCount()

    return {
      listings,
      total,
      page,
      pages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string): Promise<Listing> {
    const listing = await this.listingRepo.findOne({ where: { id } })
    if (!listing) throw new NotFoundException(`Listing ${id} not found`)
    return listing
  }

  async create(sellerId: string, dto: CreateListingDto): Promise<Listing> {
    const listing = this.listingRepo.create({
      sellerId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      priceCents: dto.priceCents,
      currency: dto.currency ?? 'SZL',
      location: dto.location,
    })
    return this.listingRepo.save(listing)
  }

  async remove(id: string, sellerId: string): Promise<void> {
    const listing = await this.listingRepo.findOne({ where: { id } })
    if (!listing) throw new NotFoundException(`Listing ${id} not found`)
    if (listing.sellerId !== sellerId) {
      throw new ForbiddenException('You do not own this listing')
    }
    await this.listingRepo.remove(listing)
  }

  async createRfq(buyerId: string, dto: CreateRfqDto): Promise<Rfq> {
    const rfq = this.rfqRepo.create({
      listingId: dto.listingId,
      buyerId,
      message: dto.message,
      budgetCents: dto.budgetCents,
    })
    return this.rfqRepo.save(rfq)
  }

  async adminStats(): Promise<{
    totalListings: number
    activeListings: number
    totalRfqs: number
    pendingRfqs: number
    listingsByCategory: Record<string, number>
  }> {
    const [totalListings, activeListings, totalRfqs, pendingRfqs, categoryRows] =
      await Promise.all([
        this.listingRepo.count(),
        this.listingRepo.count({ where: { active: true } }),
        this.rfqRepo.count(),
        this.rfqRepo.count({ where: { status: 'pending' } }),
        this.listingRepo
          .createQueryBuilder('listing')
          .select('listing.category', 'category')
          .addSelect('COUNT(*)', 'count')
          .groupBy('listing.category')
          .getRawMany<{ category: string; count: string }>(),
      ])

    const listingsByCategory: Record<string, number> = {}
    for (const row of categoryRows) {
      listingsByCategory[row.category] = parseInt(row.count, 10)
    }

    return { totalListings, activeListings, totalRfqs, pendingRfqs, listingsByCategory }
  }
}
