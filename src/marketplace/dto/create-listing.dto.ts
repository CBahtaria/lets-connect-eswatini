import { IsString, IsNumber, IsEnum, IsNotEmpty, Min } from 'class-validator'

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

  @IsNumber() @Min(0)
  price: number

  @IsString()
  currency: 'SZL' | 'ZAR' = 'SZL'

  @IsString()
  location: string
}
