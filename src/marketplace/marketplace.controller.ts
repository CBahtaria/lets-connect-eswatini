import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import { MarketplaceService } from './marketplace.service'
import { CreateListingDto } from './dto/create-listing.dto'
import { CreateRfqDto } from './dto/create-rfq.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

interface JwtRequest {
  user: { userId: string }
}

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  @Get()
  findAll(
    @Query()
    query: { category?: string; location?: string; page?: string; limit?: string },
  ) {
    return this.service.findAll({
      category: query.category,
      location: query.location,
      page: query.page !== undefined ? parseInt(query.page, 10) : undefined,
      limit: query.limit !== undefined ? parseInt(query.limit, 10) : undefined,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  adminStats() {
    return this.service.adminStats()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: JwtRequest, @Body() dto: CreateListingDto) {
    return this.service.create(req.user.userId, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('rfq')
  createRfq(@Request() req: JwtRequest, @Body() dto: CreateRfqDto) {
    return this.service.createRfq(req.user.userId, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: JwtRequest) {
    return this.service.remove(id, req.user.userId)
  }
}
