import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateListingDto } from './dto/create-listing.dto'

export interface MarketplaceListing {
  id: string
  sellerId: string
  title: string
  description: string
  category: string
  price: number
  currency: string
  location: string
  verified: boolean
  createdAt: Date
}

@Injectable()
export class MarketplaceService {
  private listings: MarketplaceListing[] = []

  findAll(category?: string, location?: string): MarketplaceListing[] {
    return this.listings.filter(l =>
      (!category || l.category === category) &&
      (!location || l.location.toLowerCase().includes(location.toLowerCase()))
    )
  }

  findOne(id: string): MarketplaceListing {
    const listing = this.listings.find(l => l.id === id)
    if (!listing) throw new NotFoundException(`Listing ${id} not found`)
    return listing
  }

  create(sellerId: string, dto: CreateListingDto): MarketplaceListing {
    const listing: MarketplaceListing = {
      id: crypto.randomUUID(),
      sellerId,
      ...dto,
      verified: false,
      createdAt: new Date(),
    }
    this.listings.push(listing)
    return listing
  }

  remove(id: string): void {
    const idx = this.listings.findIndex(l => l.id === id)
    if (idx === -1) throw new NotFoundException(`Listing ${id} not found`)
    this.listings.splice(idx, 1)
  }
}
