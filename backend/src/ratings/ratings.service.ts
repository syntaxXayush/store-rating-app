import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';

@Injectable()
export class RatingsService {
  constructor(@InjectRepository(Rating) private repo: Repository<Rating>) {}

  async submitOrUpdate(userId: string, storeId: string, value: number) {
    if (value < 1 || value > 5)
      throw new BadRequestException('Rating must be between 1 and 5');
    const existing = await this.repo.findOne({
      where: { user_id: userId, store_id: storeId },
    });
    if (existing) {
      existing.value = value;
      return this.repo.save(existing);
    }
    const rating = this.repo.create({
      user_id: userId,
      store_id: storeId,
      value,
    });
    return this.repo.save(rating);
  }

  async getUserRating(userId: string, storeId: string) {
    return this.repo.findOne({ where: { user_id: userId, store_id: storeId } });
  }

  async count() {
    return this.repo.count();
  }
}
