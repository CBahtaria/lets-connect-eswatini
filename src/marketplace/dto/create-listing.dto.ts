import { IsString, IsInt, IsEnum, IsNotEmpty, Min } from 'class-validator'

export enum ListingCategory {
  SERVICES = 'services',
  GOODS = 'goods',
  SKILLS = 'skills',
  EVENTS = 'events',
}

export class CreateListingDto {
  @IsString() @IsNotEmpty()
  title: string

  @IsString() @IsNotEmpty()
  description: string

  @IsEnum(ListingCategory)
  category: ListingCategory

  @IsInt() @Min(0)
  priceCents: number

  @IsString()
  currency: 'SZL' | 'ZAR' = 'SZL'

  @IsString()
  location: string
}
