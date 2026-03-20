import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { StoresService } from './stores.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

type FindStoresQuery = {
  name?: string;
  address?: string;
};

class CreateStoreDto {
  @IsString() @MinLength(20) @MaxLength(60) name: string;
  @IsEmail() email: string;
  @IsString() @MaxLength(400) address: string;
  @IsOptional() @IsString() owner_id?: string;
}

type AuthenticatedRequest = ExpressRequest & {
  user: {
    userId: string;
  };
};

@Controller('stores')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  findAll(@Query() query: FindStoresQuery) {
    return this.storesService.findAll(query);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateStoreDto) {
    return this.storesService.create(dto);
  }

  @Get('owner/dashboard')
  @Roles('store_owner')
  ownerDashboard(@Request() req: AuthenticatedRequest) {
    return this.storesService.getOwnerDashboard(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }
}
