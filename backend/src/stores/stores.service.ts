import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Store } from './store.entity';
import { Rating } from '../ratings/rating.entity';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private storeRepo: Repository<Store>,
    @InjectRepository(Rating) private ratingRepo: Repository<Rating>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findAll(filters?: { name?: string; address?: string }) {
    const where: FindOptionsWhere<Store> = {};
    if (filters?.name) where.name = Like(`%${filters.name}%`);
    if (filters?.address) where.address = Like(`%${filters.address}%`);
    const stores = await this.storeRepo.find({ where });

    return Promise.all(
      stores.map(async (store) => {
        const ratings = await this.ratingRepo.find({
          where: { store_id: store.id },
        });
        const avg = ratings.length
          ? (ratings.reduce((s, r) => s + r.value, 0) / ratings.length).toFixed(
              1,
            )
          : null;
        return {
          ...store,
          averageRating: avg ? parseFloat(avg) : null,
          totalRatings: ratings.length,
        };
      }),
    );
  }

  async findOne(id: string) {
    const store = await this.storeRepo.findOne({ where: { id } });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async create(dto: {
    name: string;
    email: string;
    address: string;
    owner_id?: string;
  }) {
    if (dto.owner_id) {
      const owner = await this.userRepo.findOne({
        where: { id: dto.owner_id },
      });
      if (!owner) {
        throw new BadRequestException('Selected owner does not exist');
      }
      if (owner.role !== UserRole.STORE_OWNER) {
        throw new BadRequestException('Selected user is not a store owner');
      }
      const existingStore = await this.storeRepo.findOne({
        where: { owner_id: dto.owner_id },
      });
      if (existingStore) {
        throw new ConflictException(
          'This store owner is already assigned to another store',
        );
      }
    }

    const store = this.storeRepo.create(dto);
    return this.storeRepo.save(store);
  }

  async count() {
    return this.storeRepo.count();
  }

  async getOwnerDashboard(ownerId: string) {
    const store = await this.storeRepo.findOne({
      where: { owner_id: ownerId },
    });
    if (!store) throw new NotFoundException('No store found for this owner');
    const ratings = await this.ratingRepo.find({
      where: { store_id: store.id },
      relations: ['user'],
    });
    const avg = ratings.length
      ? (ratings.reduce((s, r) => s + r.value, 0) / ratings.length).toFixed(1)
      : null;
    return {
      store,
      averageRating: avg ? parseFloat(avg) : null,
      ratings: ratings.map((r) => ({
        userName: r.user?.name,
        userEmail: r.user?.email,
        value: r.value,
        date: r.createdAt,
      })),
    };
  }
}
