import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Dashboard } from '../entities/dashboard.entity';
import { DashboardDto } from '../dto/dashboard.dto';
import { AggregationRequestDto } from '../dto/aggregation-request.dto'; 

import { MongoClient } from 'mongodb';

// const util = require('util');

@Injectable()
export class DashboardRepository {
  constructor(@InjectModel('Dashboard') private readonly dashboardModel: Model<any>) {}

  async create(dto: DashboardDto): Promise<Dashboard> {
    const createdDashboard = new this.dashboardModel(dto);
    return createdDashboard.save();
  }

  async findAll(): Promise<Dashboard[]> {
    
    return this.dashboardModel.find().exec();
  }

  async findById(id: string): Promise<Dashboard | null> {
    return this.dashboardModel.findById(id).exec();
  }

  async findUniqueNames(tags: string[]): Promise<string[] | null> {
    return this.dashboardModel
    .find({ active: true, tag: { $in : tags } }) // Filter to only get documents with active: true
    .distinct('name') // Perform distinct operation on the 'name' field
    .exec();
  }

  async find(query: Record<string, any>): Promise<Dashboard[] | null> {
    return this.dashboardModel.find({ active: true, ...query }).exec();
  }

  async aggregate(aggregationRequestDto: AggregationRequestDto): Promise<any[]> {
    const { aggregation, tableName } = aggregationRequestDto;

    if(aggregationRequestDto.timeRange) {
      aggregation.unshift({
        '$match': {
          'createdAt': {
            '$gte': new Date(aggregationRequestDto.timeRange.startDate),
            '$lte': new Date(aggregationRequestDto.timeRange.endDate)
          }
        }
      })
    }
    
    if(aggregationRequestDto.pre_arg) {
      aggregation.unshift(...aggregationRequestDto.pre_arg);
    }

    if(aggregationRequestDto.managerOus) {
      aggregation.unshift({
        '$match': {
          'ou': { '$in': aggregationRequestDto.managerOus.map(id => new Types.ObjectId(id)) }
        }
      })
    }

    

    if(aggregationRequestDto.match) {
      aggregation.unshift(aggregationRequestDto.match);
    }

    if(aggregationRequestDto.limit) {
      aggregation.push({ '$limit': aggregationRequestDto.limit })
    }

    //// console.log(util.inspect(aggregation, false, null, true /* enable colors */))
    // console.log("working");

    const client = await MongoClient.connect(
      process.env.currentDB,
    );
    const coll = client.db('kGateEnhancement').collection(tableName);
    const cursor = coll.aggregate(aggregation);
    const result = await cursor.toArray();
    await client.close();

    return result;
  }

  // Update the dashboard by its ID
  async update(id: string, dto: DashboardDto): Promise<Dashboard | null> {
    const updatedDashboard = await this.dashboardModel.findByIdAndUpdate(id, dto, { new: true });
    return updatedDashboard;
  }
}
