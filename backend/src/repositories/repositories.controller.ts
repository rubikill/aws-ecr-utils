import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ECRService } from '../services/ecr.service';
import { RepositoryService } from '../services/repository.service';
import { Repository } from '../models/repository.entity';
import { Scan } from '../models/scan.entity';

@Controller('repositories')
export class RepositoriesController {
  constructor(
    private readonly ecrService: ECRService,
    private readonly repositoryService: RepositoryService,
  ) {}

  @Get()
  async getAllRepositories(): Promise<Repository[]> {
    return await this.repositoryService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.repositoryService.getStats();
  }

  @Get(':name')
  async getRepository(@Param('name') name: string): Promise<Repository | null> {
    return this.repositoryService.getRepository(name);
  }

  @Post('scan')
  async scanRepositories(
    @Body('profile') profile: string,
    @Body('region') region: string,
  ): Promise<Repository[]> {
    const repositories = await this.ecrService.scanRepositories(
      profile,
      region,
    );
    return await this.repositoryService.saveAll(repositories);
  }

  // --- Scan history endpoints ---
  @Get('/scans')
  async getAllScans(): Promise<Scan[]> {
    return this.repositoryService.getAllScans();
  }

  @Get('/scans/:id')
  async getScanById(@Param('id') id: number): Promise<Scan | null> {
    return this.repositoryService.getScanById(id);
  }
}
