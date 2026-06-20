import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';
import { RatingsService } from '../ratings/ratings.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private usersService: UsersService,
    private storesService: StoresService,
    private ratingsService: RatingsService,
  ) {}

  @Get('dashboard')
  async dashboard() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.usersService.counts(),
      this.storesService.count(),
      this.ratingsService.count(),
    ]);
    return { totalUsers, totalStores, totalRatings };
  }
}
