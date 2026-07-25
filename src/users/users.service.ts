import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findOrCreateByPhone(phone: string): Promise<User> {
    let user = await this.userRepo.findOne({ where: { phone } });
    if (!user) {
      user = this.userRepo.create({ phone, verified: true });
      user = await this.userRepo.save(user);
    } else if (!user.verified) {
      user.verified = true;
      user = await this.userRepo.save(user);
    }
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }
}
