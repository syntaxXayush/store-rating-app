import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';
import { Store } from '../stores/store.entity';
import { Rating } from '../ratings/rating.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Store) private storeRepo: Repository<Store>,
    @InjectRepository(Rating) private ratingRepo: Repository<Rating>,
  ) {}

  async findAll(filters?: {
    name?: string;
    email?: string;
    address?: string;
    role?: string;
  }) {
    const where: FindOptionsWhere<User> = {};
    if (filters?.name) where.name = Like(`%${filters.name}%`);
    if (filters?.email) where.email = Like(`%${filters.email}%`);
    if (filters?.address) where.address = Like(`%${filters.address}%`);
    if (filters?.role) where.role = filters.role as UserRole;
    return this.repo.find({
      where,
      select: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const sanitized = { ...user };
    delete (sanitized as Partial<User>).password;

    if (user.role !== UserRole.STORE_OWNER) {
      return sanitized;
    }

    const ownerStore = await this.storeRepo.findOne({
      where: { owner_id: user.id },
    });
    if (!ownerStore) {
      return {
        ...sanitized,
        ownerRating: null,
        ownerRatingCount: 0,
      };
    }

    const stats = await this.ratingRepo
      .createQueryBuilder('rating')
      .select('AVG(rating.value)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('rating.store_id = :storeId', { storeId: ownerStore.id })
      .getRawOne<{ avg: string | null; count: string }>();

    const average = stats?.avg ? Number.parseFloat(stats.avg) : null;
    return {
      ...sanitized,
      ownerStore: {
        id: ownerStore.id,
        name: ownerStore.name,
        email: ownerStore.email,
        address: ownerStore.address,
      },
      ownerRating:
        average === null ? null : Number.parseFloat(average.toFixed(1)),
      ownerRatingCount: Number(stats?.count ?? 0),
    };
  }

  async create(dto: {
    name: string;
    email: string;
    password: string;
    address: string;
    role: UserRole;
  }) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({ ...dto, password: hashed });
    return this.repo.save(user);
  }

  async updatePassword(id: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.repo.update(id, { password: hashed });
    return { message: 'Password updated' };
  }

  async counts() {
    return this.repo.count();
  }
}
