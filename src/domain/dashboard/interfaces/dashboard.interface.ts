import { DashboardDto } from '../dto/dashboard.dto';
import { Dashboard as DashboardInterface } from '../entities/dashboard.entity'; // Import as an interface

export interface DashboardRepository {
  create(dto: DashboardDto): Promise<DashboardInterface>;
  findAll(): Promise<DashboardInterface[]>;
  findById(id: string): Promise<DashboardInterface | null>;
  // Add other methods as needed
}
