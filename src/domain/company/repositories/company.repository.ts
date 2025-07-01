import { Injectable } from "@nestjs/common";
import { CompanyRepository } from "../interfaces/company-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types, UpdateWriteOpResult } from "mongoose";
import { Company, UpdateCompany } from "../dto/company.dto";


@Injectable()
export class CompanyRepositoryImpl implements CompanyRepository {

  constructor(@InjectModel('Company') private readonly CompanyModal: Model<Company>) { }

  public async create(Company: Company): Promise<Company> {
    let res = await this.CompanyModal.create(Company);
    return res
  }

//   public getSpecificCompany(id): Promise<Company[]> {


//     let pipe = [
//       {
//         $match:
//         {
//           request_id: new Types.ObjectId(id)
//         },
//       },
//       {
//         $lookup: {
//           from: "session",
//           localField: "session",
//           foreignField: "_id",
//           as: "session",
//           pipeline: [
//             {
//               $addFields: {
//                 typeId: {
//                   $cond: {
//                     if: {
//                       $eq: [
//                         {
//                           $type: "$typeId",
//                         },
//                         "objectId",
//                       ],
//                     },
//                     then: "$typeId",
//                     else: {
//                       //$toObjectId: "$typeId",
//                       $convert: { input: '$typeId', to: 'objectId', onError: '', onNull: '' }
//                     },
//                   },
//                 },
//               },
//             },
//             {
//               $addFields: {
//                 assessmentId: {
//                   $cond: {
//                     if: {
//                       $eq: ["$type", "ASSESSMENT"],
//                     },
//                     then: "$typeId",
//                     else: null,
//                   },
//                 },
//                 surveyId: {
//                   $cond: {
//                     if: {
//                       $eq: ["$type", "SURVEY"],
//                     },
//                     then: "$typeId",
//                     else: null,
//                   },
//                 },
//                 sessionId: {
//                   $cond: {
//                     if: {
//                       $eq: ["$type", "SESSION"],
//                     },
//                     then: "$typeId",
//                     else: null,
//                   },
//                 },
//               },
//             },
//             {
//               $lookup: {
//                 from: "program",
//                 localField: "sessionId",
//                 foreignField: "_id",
//                 as: "sessionId",
//               },
//             },
//             {
//               $lookup: {
//                 from: "surveys",
//                 localField: "surveyId",
//                 foreignField: "_id",
//                 as: "surveyId",
//               },
//             },
//             {
//               $lookup: {
//                 from: "assessments",
//                 localField: "assessmentId",
//                 foreignField: "_id",
//                 as: "assessmentId",
//               },
//             },
//             {
//               $addFields: {
//                 sessionId: {
//                   $first: "$sessionId",
//                 },
//                 assessmentId: {
//                   $first: "$assessmentId",
//                 },
//                 surveyId: {
//                   $first: "$surveyId",
//                 },
//               },
//             },
//             {
//               $addFields: {
//                 typeId: {
//                   $ifNull: [
//                     "$assessmentId",
//                     {
//                       $ifNull: [
//                         "$surveyId",
//                         "$sessionId",
//                       ],
//                     },
//                   ],
//                 },
//               },
//             },
//           ],
//         },
//       },
//     ]
//     return this.CompanyModal.aggregate(pipe);
//   }

//   public getSpecificCompanyById(id): Promise<Company[]> {


//     let pipe = [
//       {
//         $match:
//         {
//           _id: new Types.ObjectId(id)
//         },
//       },
//       {
//         $lookup: {
//           from: "session",
//           localField: "session",
//           foreignField: "_id",
//           as: "session",
//           pipeline: [
//             {
//               $addFields: {
//                 typeId: {
//                   $cond: {
//                     if: {
//                       $eq: [
//                         {
//                           $type: "$typeId",
//                         },
//                         "objectId",
//                       ],
//                     },
//                     then: "$typeId",
//                     else: {
//                       //$toObjectId: "$typeId",
//                       $convert: { input: '$typeId', to: 'objectId', onError: '', onNull: '' }
//                     },
//                   },
//                 },
//               },
//             },
//             {
//               $addFields: {
//                 assessmentId: {
//                   $cond: {
//                     if: {
//                       $eq: ["$type", "ASSESSMENT"],
//                     },
//                     then: "$typeId",
//                     else: null,
//                   },
//                 },
//                 surveyId: {
//                   $cond: {
//                     if: {
//                       $eq: ["$type", "SURVEY"],
//                     },
//                     then: "$typeId",
//                     else: null,
//                   },
//                 },
//                 sessionId: {
//                   $cond: {
//                     if: {
//                       $eq: ["$type", "SESSION"],
//                     },
//                     then: "$typeId",
//                     else: null,
//                   },
//                 },
//               },
//             },
//             {
//               $lookup: {
//                 from: "program",
//                 localField: "sessionId",
//                 foreignField: "_id",
//                 as: "sessionId",
//               },
//             },
//             {
//               $lookup: {
//                 from: "surveys",
//                 localField: "surveyId",
//                 foreignField: "_id",
//                 as: "surveyId",
//               },
//             },
//             {
//               $lookup: {
//                 from: "assessments",
//                 localField: "assessmentId",
//                 foreignField: "_id",
//                 as: "assessmentId",
//               },
//             },
//             {
//               $addFields: {
//                 sessionId: {
//                   $first: "$sessionId",
//                 },
//                 assessmentId: {
//                   $first: "$assessmentId",
//                 },
//                 surveyId: {
//                   $first: "$surveyId",
//                 },
//               },
//             },
//             {
//               $addFields: {
//                 typeId: {
//                   $ifNull: [
//                     "$assessmentId",
//                     {
//                       $ifNull: [
//                         "$surveyId",
//                         "$sessionId",
//                       ],
//                     },
//                   ],
//                 },
//               },
//             },
//           ],
//         },
//       },
//     ]
//     return this.CompanyModal.aggregate(pipe);
//   }   
                          

  public getUserCompany(id): Promise<Company[]> {
    return this.CompanyModal.find({_id : new Types.ObjectId(id)}).populate('trainers');
  }


  public getAll(page:number,size:number): Promise<Company[]> {
    return this.CompanyModal.find({}).populate('allowed_trainings');
  }
  public update(Company: UpdateCompany): Promise<UpdateWriteOpResult> {
    let _id = Company._id;
    delete Company._id;
    return this.CompanyModal.updateOne({ _id }, { $set: Company })
  }
  public activateRequested(Company: any): Promise<UpdateWriteOpResult> {
    let _id = Company._id;
    delete Company._id;
    return this.CompanyModal.updateOne({ request_id: _id }, { $set: Company })
  }
  public delete(_id: string): Promise<any> {
    return this.CompanyModal.deleteOne({ _id });
  }
  public insertTrainer(_id : string , userId : string){
    return this.CompanyModal.updateOne(  { _id: _id }, { $push: { trainers: userId } })
  }
}