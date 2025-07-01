import { Types } from "mongoose";

export class AggregationRequestDto {
    aggregation: object[];
    tableName: string;
    match?: object;
    limit?: number
    timeRange?: {startDate: string, endDate: string};
    managerOus?: Array<Types.ObjectId>
    pre_arg?: object[];
  }