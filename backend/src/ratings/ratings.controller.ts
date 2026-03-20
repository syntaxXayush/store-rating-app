import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
import { RatingsService } from './ratings.service';

type AuthenticatedRequest = ExpressRequest & {
  user: {
    userId: string;
  };
};

@Controller('ratings')
@UseGuards(AuthGuard('jwt'))
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post(':storeId')
  rate(
    @Request() req: AuthenticatedRequest,
    @Param('storeId') storeId: string,
    @Body('value') value: number,
  ) {
    return this.ratingsService.submitOrUpdate(req.user.userId, storeId, value);
  }

  @Get(':storeId/my')
  myRating(
    @Request() req: AuthenticatedRequest,
    @Param('storeId') storeId: string,
  ) {
    return this.ratingsService.getUserRating(req.user.userId, storeId);
  }
}
