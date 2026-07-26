import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common'
import { MarketplaceService } from './marketplace.service'
import { CreateListingDto } from './dto/create-listing.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('location') location?: string,
  ) {
    return this.service.findAll(category, location)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() dto: CreateListingDto) {
    return this.service.create(req.user?.userId ?? 'anonymous', dto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    this.service.remove(id)
    return { deleted: true }
  }
}
