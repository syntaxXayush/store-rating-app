import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';
import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.entity';

type FindUsersQuery = {
  name?: string;
  email?: string;
  address?: string;
  role?: string;
};

class CreateUserDto {
  @IsString() @MinLength(20) @MaxLength(60) name: string;
  @IsEmail() email: string;
  @IsString() @MaxLength(400) address: string;
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
    message: 'Password must have 1 uppercase and 1 special character',
  })
  password: string;
  @IsEnum(UserRole) role: UserRole;
}

class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
    message: 'Password must have 1 uppercase and 1 special character',
  })
  password: string;
}

type AuthenticatedRequest = ExpressRequest & {
  user: {
    userId: string;
  };
};

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('admin')
  findAll(@Query() query: FindUsersQuery) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch('change-password')
  changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.updatePassword(req.user.userId, dto.password);
  }
}
