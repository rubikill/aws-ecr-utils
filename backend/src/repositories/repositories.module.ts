import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from '../models/repository.entity';
import { Image } from '../models/image.entity';
import { Scan } from '../models/scan.entity';
import { ECRService } from '../services/ecr.service';
import { RepositoryService } from '../services/repository.service';
import { RepositoriesController } from './repositories.controller';
import { ScanGateway } from '../gateways/scan.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Repository, Image, Scan])],
  controllers: [RepositoriesController],
  providers: [ECRService, RepositoryService, ScanGateway],
  exports: [ECRService, RepositoryService],
})
export class RepositoriesModule {}
