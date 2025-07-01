import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardSchema } from './entities/dashboard.entity';
import { DashboardController } from 'src/infrastructure/controllers/dashboard/dashboard.controller';
import { DashboardRepository } from './repositories/dashboard.repository';
import { DashboardService } from 'src/usecase/services/dashboard/dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Dashboard', schema: DashboardSchema, collection: 'dashboards' }]),
  ],
  controllers: [DashboardController],
  providers: [DashboardRepository, DashboardService],
})
export class DashboardsModule {}