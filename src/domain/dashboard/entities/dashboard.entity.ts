import { Schema, Document } from 'mongoose';

export const DashboardSchema = new Schema(
  {
    aggregation: [Object],
    name: String,
    table: String,
    graphname: String,
    graphtype: String,
    active: Boolean,
    sort: Number
  },
);

export interface Dashboard extends Document {
  aggregation: object[];
  name: string;
  table: string;
  graphname: string;
  graphtype: string;
  active: boolean;
  sort: number;
}
