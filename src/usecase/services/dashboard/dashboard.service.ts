// dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { DashboardDto } from 'src/domain/dashboard/dto/dashboard.dto';
import { DashboardRepository } from 'src/domain/dashboard/repositories/dashboard.repository';
import { Dashboard } from 'src/domain/dashboard/entities/dashboard.entity';
import { AggregationRequestDto } from 'src/domain/dashboard/dto/aggregation-request.dto';
import { GenericResponse } from 'src/domain/dto/generic';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async create(dashboardDto: DashboardDto): Promise<GenericResponse<Dashboard>> {
    let res = await this.dashboardRepository.create(dashboardDto);
    return {
        message: "Dashboard created successfully successfully",
        success: true,
        data: res,
    }
  }

  async findAll(): Promise<GenericResponse<Dashboard[]>> {
      let res = await this.dashboardRepository.findAll();
      return {
          message: "Dashboards fetched successfully successfully",
          success: true,
          data: res,
      }
  }

  async findById(id: string): Promise<GenericResponse<Dashboard | null>> {
    let res = await  this.dashboardRepository.findById(id);
    return {
      message: "Dashboard fetched successfully successfully",
      success: true,
      data: res,
    }
  }

  // Add a new method for querying
  async query(query: Record<string, any>): Promise<GenericResponse<Dashboard[]>> {
    let res = await  this.dashboardRepository.find(query); // Ensure the method name is "query"
    return {
      message: "Dashboards fetched successfully successfully",
      success: true,
      data: res,
    }
  }

  async findUniqueNames(tags: string[]): Promise<GenericResponse<any>> {
    let res = await this.dashboardRepository.findUniqueNames(tags);

    return {
        message: "Unique Names Fetched successfully",
        success: true,
        data: res,
    }
  }

  // Add a new POST endpoint for running aggregations dynamically
  //@Post('dynamic-aggregation')
  async runDynamicAggregation(aggregationRequestDto: AggregationRequestDto): Promise<GenericResponse<any>> {
    let res = await  this.dashboardRepository.aggregate(aggregationRequestDto);
    return {
      message: "Graph Data Fetched successfully",
      success: true,
      data: res,
    }
  }

  // Add a new method to update a dashboard by ID
  async update(id: string, dashboardDto: DashboardDto): Promise<GenericResponse<Dashboard>> | null {
    // Use Mongoose's findByIdAndUpdate to update the dashboard by its ID
    const res = await this.dashboardRepository.update(id,dashboardDto)

    return {
      message: "Graph Data Updated successfully",
      success: true,
      data: res,
    }
  }


}
