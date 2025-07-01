import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from 'src/usecase/services/dashboard/dashboard.service';
import { DashboardDto } from 'src/domain/dashboard/dto/dashboard.dto';
import { QueryDto } from 'src/domain/dashboard/dto/query.dto';
import { AggregationRequestDto } from 'src/domain/dashboard/dto/aggregation-request.dto';
import { Secured } from 'src/domain/user-auth/decorators/authorization.decorator';

@Controller('dashboards')
@ApiTags('Dashboards')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  @Secured()
  create(@Body() dashboardDto: DashboardDto) {
    return this.dashboardService.create(dashboardDto);
  }

  @Get()
  @Secured()
  findAll() {
    return this.dashboardService.findAll();
  }

  // Add a new GET endpoint for unique names
  @Post('unique-names')
  @Secured()
  findUniqueNames(@Body() tags: { data: string[] }) {
    //// console.log('Calling findUniqueNames');
    return this.dashboardService.findUniqueNames(tags.data);
  }

  @Get(':id')
  @Secured()
  findById(@Param('id') id: string) {
    return this.dashboardService.findById(id);
  }

  // Add a new POST endpoint for querying
  @Post('query')
  @Secured()
  query(@Body() queryDto: QueryDto) {
    return this.dashboardService.query(queryDto.query);
  }



  // Add a new POST endpoint for running aggregations dynamically
  @Post('dynamic-aggregation')
  @Secured()
  async runDynamicAggregation(@Body() aggregationRequestDto: AggregationRequestDto) {
    return this.dashboardService.runDynamicAggregation(aggregationRequestDto);
  }

  // Add a new PUT endpoint to update a dashboard by ID
  @Put(':id')
  @Secured()
  update(@Param('id') id: string, @Body() dashboardDto: DashboardDto) {
    return this.dashboardService.update(id, dashboardDto);
  }

}
