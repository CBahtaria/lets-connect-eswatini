import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator'

export class CreateRfqDto {
  @IsUUID()
  listingId: string

  @IsString() @IsNotEmpty()
  message: string

  @IsInt() @Min(0)
  budgetCents: number
}
