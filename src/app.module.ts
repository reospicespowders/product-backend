import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrganizationalUnitController } from './infrastructure/controllers/organizational-unit/organizational-unit.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserSchema } from './domain/user-auth/entities/User.entity';
import { UserAuthService } from './usecase/services/user-auth/user-auth.service';
import { APP_GUARD } from '@nestjs/core';
import { UserRepositoryImpl } from './domain/user-auth/repositories/user.repository';
import { AuthGuard } from './infrastructure/guards/auth.guard';
import { UserAuthController } from './infrastructure/controllers/user-auth/user-auth.controller';
import moment from 'moment';
import 'moment-timezone';
import { OrganizationUnitsSchema } from './domain/organizational-unit/entities/organizational-unit.entity';
import { OURepositoryImpl } from './domain/organizational-unit/repositories/ou.repository';
import { LocationRepositoryImpl } from './domain/location/repositories/location.repository';
import { AuditSchema } from './domain/audit/entities/audit.enitity';
import { LogMiddleware } from './infrastructure/middleware/log.middleware';
import { AuditRepositoryImpl } from './domain/audit/repositories/audit.repository';
import { AuditService } from './usecase/services/audit/audit.service';
import { AuditController } from './infrastructure/controllers/audit/audit.controller';
import { AuditMiddleware } from './infrastructure/middleware/audit.middleware';
import { OuLocationSchema } from './domain/location/entities/location.entity';
import { OuCategorySchema } from './domain/ou-category/entities/ou-category.entity';
import { OuTypeSchema } from './domain/ou-type/entities/ou-type.entity';
import { OUCategoryRepositoryImpl } from './domain/ou-category/repositories/ou-category.repository';
import { OUTypeRepositoryImpl } from './domain/ou-type/repositories/ou-type.repository';
import { LocationController } from './infrastructure/controllers/location/location.controller';
import { OuTypeController } from './infrastructure/controllers/ou-type/ou-type.controller';
import { OuCategoryController } from './infrastructure/controllers/ou-category/ou-category.controller';
import { LocationService } from './usecase/services/location/location.service';
import { MailService } from './usecase/services/mail/mail.service';
import { OrganizationalUnitService } from './usecase/services/organizational-unit/organizational-unit.service';
import { OuCategoryService } from './usecase/services/ou-category/ou-category.service';
import { OuTypeService } from './usecase/services/ou-type/ou-type.service';
import { DataSchema } from './domain/data/entities/data.entity';
import { DataTypeSchema } from './domain/data/entities/data-type.entity';
import { DataFieldSchema } from './domain/data/entities/data-fields.entity';
import { FieldTypeSchema } from './domain/data/entities/field-type.entity';
import { DataTemplatesSchema } from './domain/data/entities/data-templates.entity';
import { DataController } from './infrastructure/controllers/data/data.contoller';
import { DataFieldController } from './infrastructure/controllers/data/data-field.controller';
import { DataService } from './usecase/services/data/data.service';
import { DataFieldService } from './usecase/services/data/data-fields.service';
import { DataFieldRepositoryImpl } from './domain/data/repositories/data-field.repository';
import { FieldTypeService } from './usecase/services/data/field-type.service';
import { FieldTypeController } from './infrastructure/controllers/data/field-type.controller';
import { FieldTypeRepositoryImpl } from './domain/data/repositories/field-type.repository';
import { DataTypeRepositoryImpl } from './domain/data/repositories/data-type.repository';
import { DataTypeService } from './usecase/services/data/data-type.service';
import { DataTypeController } from './infrastructure/controllers/data/data-type.controller';
import { DataTemplateService } from './usecase/services/data/data.template.service';
import { DataTemplateController } from './infrastructure/controllers/data/data-template.controller';
import { DataTemplateRepositoryImpl } from './domain/data/repositories/data-template.repository';
import { DataRepositoryImpl } from './domain/data/repositories/data.repository';
import { ContentUpdateRepositoryImpl } from './domain/data/repositories/content-update.repository';
import { ContentUpdateService } from './usecase/services/data/content-update.service';
import { ContentUpdateController } from './infrastructure/controllers/data/content-update.controller';
import { KLibrarySchema } from './domain/knowledge_library/entities/klibrary.entity';
import { KLibraryCategorySchema } from './domain/knowledge_library/entities/klibrary-category.entity';
import { KLIbraryRepositoryImpl } from './domain/knowledge_library/repositories/klibrary.repository';
import { KLIbraryCategoryRepositoryImpl } from './domain/knowledge_library/repositories/klibrary-category.repository';
import { KnowledgeLibraryService } from './usecase/services/knowledge-library/knowledge-library.service';
import { KnowledgeLibraryCategoryService } from './usecase/services/knowledge-library/knowledge-library-category.service';
import { KnowledgeLibraryController } from './infrastructure/controllers/knowledge-library/knowledge-library.controller';
import { KnowledgeLibraryCategoryController } from './infrastructure/controllers/knowledge-library/knowledge-library-category.controller';
import { FileService } from './usecase/services/file/file.service';
import { FileController } from './infrastructure/controllers/file/file.controller';
import { InvestorSchema, PermissionSchema } from './domain/permission/entities/permission.entity';
import { PermissionService } from './usecase/services/permission/permission.service';
import { PermissionRepositoryImpl } from './domain/permission/repositories/permission.repository';
import { PermissionController } from './infrastructure/controllers/permission/permission.controller';
import { RoleSchema } from './domain/role/entities/role.entity';
import { RoleRepositoryImpl } from './domain/role/repositories/role.repository';
import { RoleService } from './usecase/services/role/role.service';
import { RoleController } from './infrastructure/controllers/role/role.controller';
import { AuthorizationGuard } from './infrastructure/guards/authorization.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ContentUpdate } from './domain/data/dto/content-update.dto';
import { contentUpdate } from './domain/data/entities/content-update.entity';
import { SearchHistorySchema } from './domain/organizational-unit/entities/search-history.entity';
import { CommentSchema } from './domain/comments/entities/comment.entity';
import { CommentRepositoryImpl } from './domain/comments/repositories/comment.repository';
import { CommentsService } from './usecase/services/comments/comments.service';
import { CommentsController } from './infrastructure/controllers/comments/comments.controller';
import { JsonService } from './usecase/services/json/json.service';
import { MailLogSchema } from './domain/mail-logs/entities/mail-log.entity';
import { MailLogRepositoryImpl } from './domain/mail-logs/repositories/mail-log.repository';
import { ActiveUserSocketGateway } from './infrastructure/gateway/active-user-socket.gateway';
import { QuestionSchema, SurveySchema } from './domain/survey/entities/survey.entity';
import { SurveyTagSchema, SurveyTypeSchema } from './domain/survey/entities/survey-type.entity';
import { SurveyRepositoryImpl } from './domain/survey/repositories/survey.repository';
import { SurveyTypeRepositoryImpl } from './domain/survey/repositories/survey-type.repository';
import { SurveyService } from './usecase/services/survey/survey.service';
import { SurveyTypeService } from './usecase/services/survey/survey-type.service';
import { SurveyController } from './infrastructure/controllers/survey/survey.controller';
import { SurveyTypeController } from './infrastructure/controllers/survey/survey-type.controller';
import { TrainingRequestRepositoryImpl } from './domain/training/repositories/training-request.repository';
import { TrainingRequestService } from './usecase/services/training/training-request.service';
import { TrainingRequestController } from './infrastructure/controllers/training/training-request.controller';
import { TrainingRequestSchema } from './domain/training/entities/training.request.entity';
import { TrainingProgramSchema } from './domain/training/entities/training.entity';
import { TrainingTypeSchema } from './domain/training/entities/trainingType.entity';
import { TrainingRepositoryImpl } from './domain/training/repositories/training.repository';
import { TrainingTypeRepositoryImpl } from './domain/training/repositories/training-type.repository';
import { TrainingProggramService } from './usecase/services/training/training.service';
import { TrainingTypeService } from './usecase/services/training/training-type.service';
import { TrainingProgramController } from './infrastructure/controllers/training/training.controller';
import { TrainingTypeController } from './infrastructure/controllers/training/training-type.controller';
import { AssessmentSchema } from './domain/assessment/entities/assessment.entity';
import { CourseSchema } from './domain/course/entities/course.entity';
import { AssessmentService } from './usecase/services/assessment/assessment.service';
import { CourseRepositoryImpl } from './domain/course/repositories/course.repository';
import { AssessmentRepositoryImpl } from './domain/assessment/repositories/assessment.repository';
import { CourseService } from './usecase/services/course/course.service';
import { CourseController } from './infrastructure/controllers/course/course.controller';
import { AssessmentController } from './infrastructure/controllers/assessment/assessment.controller';
import { SessionSchema } from './domain/course/entities/session.entity';
import { ProgramSchema } from './domain/course/entities/program.dto';
import { SessionRepositoryImpl } from './domain/course/repositories/session.repository';
import { ProgramRepositoryImpl } from './domain/course/repositories/program.repository';
import { SessionService } from './usecase/services/course/session.service';
import { ProgramService } from './usecase/services/course/program.service';
import { SessionController } from './infrastructure/controllers/course/session.controller';
import { ProgramController } from './infrastructure/controllers/course/program.controller';
import { DataDraftRepositoryImpl } from './domain/data/repositories/data-draft.repository';
import { StatesRepositoryImpl } from './domain/data/repositories/states-records.repository';
import { StatesService } from './usecase/services/data/states-record.service';
import { DataDraftService } from './usecase/services/data/data-draft.service';
import { StatesController } from './infrastructure/controllers/data/states-record.controller';
import { DataDraftController } from './infrastructure/controllers/data/data-draft.controller';
import { SurveyAttemptSchema } from './domain/survey/entities/survey-attempt.entity';
import { SurveyAttemptRepositoryImpl } from './domain/survey/repositories/survey-attempt.repository';
import { NotificationSchema } from './domain/notification/entities/notification.entity';
import { NotificationRepositoryImpl } from './domain/notification/repositories/notification.repository';
import { NotificationService } from './usecase/services/notification/notification.service';
import { NotificationController } from './infrastructure/controllers/notification/notification.controller';
import { QueryToPipeConverterService } from './usecase/services/query-to-pipe-converter/query-to-pipe-converter.service';
import { SettingsSchema } from './domain/data/entities/settings.entitt';
import { SettingsRepositoryImpl } from './domain/data/repositories/settings.repository';
import { SettingsService } from './usecase/services/data/settings.service';
import { SettingsController } from './infrastructure/controllers/data/settings.controller';
import { DashboardsModule } from './domain/dashboard/dashboard.module';
import { AdvanceSearchLogSchema } from './domain/advance-search-logs/entities/advance-search-log.entity';
import { AdvanceSearchLogsService } from './usecase/services/advance-search-logs/advance-search-logs.service';
import { AdvanceSearchLogsRepositoryImpl } from './domain/advance-search-logs/repositoies/advance-search-log-repository';
import { CronService } from './usecase/services/schedule-service/cron/cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SurveyAttemptService } from './usecase/services/survey/survey-attempt.service';
import { SurveyAttendanceSchema } from './domain/survey/entities/survey-attendance.entity';
import { SurveyAttemptController } from './infrastructure/controllers/survey/survey-attempt.controller';
import { SurveyAttendanceService } from './usecase/services/survey/survey-attendance.service';
import { SurveyAttendanceRepositoryImpl } from './domain/survey/repositories/survey-attendance.repository';
import { SurveyAttendanceController } from './infrastructure/controllers/survey/survey-attendance.controller';
import { QrCodeService } from './usecase/helpers/qr-code-helper';
import { CompanyRepositoryImpl } from './domain/company/repositories/company.repository';
import { CompanyService } from './usecase/services/company/company.service';
import { CompanyController } from './infrastructure/controllers/company/company.controller';
import { CompanySchema } from './domain/company/entities/company.entity';
import { SurveyTagsController } from './infrastructure/controllers/survey/survey-tags.controller';
import { AssessmentAttemptSchema } from './domain/assessment/entities/assessment-attempt.entity';
import { AssessmentAttemptRepositoryImpl } from './domain/assessment/repositories/assessment-attempt.repository';
import { AssessmentAttemptService } from './usecase/services/assessment/assessment-attempt.service';
import { AssessmentAttemptController } from './infrastructure/controllers/assessment/assessment-attempt.controller';
import { QuestionBankSchema } from './domain/question-bank/entities/question-bank.entity';
import { QuestionBankRepositoryImpl } from './domain/question-bank/repositories/question-bank.repository';
import { QuestionBankService } from './usecase/services/question-bank/question-bank.service';
import { QuestionBankController } from './infrastructure/controllers/question-bank/question-bank.controller';
import { QuestionBankTopicSchema } from './domain/question-bank/entities/question-bank-topic.entity';
import { QuestionBankTopicRepositoryImpl } from './domain/question-bank/repositories/question-bank-topic.repository';
import { QuestionBankTopicService } from './usecase/services/question-bank/question-bank-topic.service';
import { QuestionBankTopicController } from './infrastructure/controllers/question-bank/question-bank-topic.controller';
import { AssessmentResultSchema } from './domain/assessment/entities/assessment-result.entity';
import { AssessmentResultRepositoryImpl } from './domain/assessment/repositories/assessment-result.repository';
import { AssessmentResultService } from './usecase/services/assessment/assessment-result.service';
import { AssessmentResultController } from './infrastructure/controllers/assessment/assessment-result.controller';
import { MSProjectSchema } from './domain/mystory-shopper/entities/ms-project.entity';
import { MSProjectRepositoryImpl } from './domain/mystory-shopper/repositories/ms-project.repository';
import { MSProjectService } from './usecase/services/mystory-shopper/ms-project.service';
import { MSProjectController } from './infrastructure/controllers/mystory-shopper/ms-project.controller';
import { MSChannelSchema } from './domain/mystory-shopper/entities/ms-channel.entity';
import { MSChannelRepositoryImpl } from './domain/mystory-shopper/repositories/ms-channel.repository';
import { MSChannelService } from './usecase/services/mystory-shopper/ms-channel.service';
import { MSChannelController } from './infrastructure/controllers/mystory-shopper/ms-channel.controller';
import { MSEvaluationSchema } from './domain/mystory-shopper/entities/ms-evaluation.entity';
import { MSEvaluationRepositoryImpl } from './domain/mystory-shopper/repositories/ms-evaluation.repository';
import { MSEvaluationService } from './usecase/services/mystory-shopper/ms-evaluation.service';
import { MSEvaluationController } from './infrastructure/controllers/mystory-shopper/ms-evaluation.controller';
import { MSSessionSchema } from './domain/mystory-shopper/entities/ms-sessions.entity';
import { MSSessionRepositoryImpl } from './domain/mystory-shopper/repositories/ms-sessions.repository';
import { MSSessionService } from './usecase/services/mystory-shopper/ms-sessions.service';
import { MSSessionController } from './infrastructure/controllers/mystory-shopper/ms-sessions.controller';
import { MSCriteriaSchema } from './domain/mystory-shopper/entities/children/ms-criteria.entity';
import { MSCriteriaRepositoryImpl } from './domain/mystory-shopper/repositories/children/ms-criteria.repository';
import { MSCriteriaService } from './usecase/services/mystory-shopper/children/ms-criteria.service';
import { MSCriteriaController } from './infrastructure/controllers/mystory-shopper/children/ms-criteria.controller';
import { MSSubCriteriaSchema } from './domain/mystory-shopper/entities/children/ms-sub-criteria.entity';
import { MSSubCriteriaRepositoryImpl } from './domain/mystory-shopper/repositories/children/ms-sub-criteria.repository';
import { MSSubCriteriaService } from './usecase/services/mystory-shopper/children/ms-sub-criteria.service';
import { MSSubCriteriaController } from './infrastructure/controllers/mystory-shopper/children/ms-sub-criteria.controller';
import { MSFactorSchema } from './domain/mystory-shopper/entities/children/ms-factors.entity';
import { MSFactorRepositoryImpl } from './domain/mystory-shopper/repositories/children/ms-factors.repository';
import { MSFactorService } from './usecase/services/mystory-shopper/children/ms-factors.service';
import { MSFactorController } from './infrastructure/controllers/mystory-shopper/children/ms-factors.controller';
import { MSEnquirySchema } from './domain/mystory-shopper/entities/children/ms-enquiries.entity';
import { MSEnquiryRepositoryImpl } from './domain/mystory-shopper/repositories/children/ms-enquiries.repository';
import { MSEnquiryService } from './usecase/services/mystory-shopper/children/ms-enquiries.service';
import { MSEnquiryController } from './infrastructure/controllers/mystory-shopper/children/ms-enquiries.controller';
import { MSStepSchema } from './domain/mystory-shopper/entities/ms-step.entity';
import { MSStepRepositoryImpl } from './domain/mystory-shopper/repositories/ms-step.repository';
import { MSStepService } from './usecase/services/mystory-shopper/ms-step.service';
import { MSStepController } from './infrastructure/controllers/mystory-shopper/ms-step.controller';
import { MSFactorLogsSchema } from './domain/mystory-shopper/entities/ms-factor-logs.entity';
import { MSFactorLogsRepositoryImpl } from './domain/mystory-shopper/repositories/ms-factor-logs.repository';
import { MSFactorLogsService } from './usecase/services/mystory-shopper/ms-factor-logs.service';
import { MSFactorLogsController } from './infrastructure/controllers/mystory-shopper/ms-factor-logs.controller';
import { KLibraryLogRepositoryImpl } from './domain/knowledge_library/repositories/klibrary-log.repository';
import { KnowledgeLibraryLogController } from './infrastructure/controllers/knowledge-library/knowledge-logs.controller';
import { KnowledgeLibraryLogService } from './usecase/services/knowledge-library/knowledge-libraby-logs.service';
import { KLibraryLogSchema } from './domain/knowledge_library/entities/klibrary-log.entity';
import { MSFactorResponsibleSchema } from './domain/mystory-shopper/entities/children/ms-factor-responsible.entity';
import { SurveyResultSchema } from './domain/survey/entities/survey-result.entity';
import { SurveyResultRepositoryImpl } from './domain/survey/repositories/survey-result.repository';
import { SurveyResultService } from './usecase/services/survey/survey-result.service';
import { SurveyResultController } from './infrastructure/controllers/survey/survey-result.controller';
import { ImageService } from 'src/usecase/services/sharp-image/sharp-image-service';
import { SignHistorySchema } from './domain/data/entities/sign-history.entity';

import { MSVendorCompanySchema } from './domain/mystory-shopper/entities/ms-vendor-company.entity';
import { MSVendorCompanyRepositoryImpl } from './domain/mystory-shopper/repositories/ms-vendor-company.repository';
import { MSVendorCompanyService } from './usecase/services/mystory-shopper/ms-vendor-company.service';
import { MSVendorCompanyController } from './infrastructure/controllers/mystory-shopper/ms-vendor-company.controller';
import { AssessmentSurveyCacheSchema } from './domain/assessment-survey-cache/entities/assessment-survey-cache.entity';
import { CacheRepositoryImpl } from './domain/assessment-survey-cache/repositories/cache.repository';
import { CacheService } from './usecase/services/cache-service/cache-service.service';
import { CacheController } from './infrastructure/controllers/cache-controller/cache-controller.controller';

import { AssessmentGroupSchema } from './domain/assessment/entities/assessment-group.entity';
import { AssessmentGroupRepositoryImpl } from './domain/assessment/repositories/assessment-group.repository';
import { AssessmentGroupService } from './usecase/services/assessment/assessment-group.service';
import { AssessmentGroupController } from './infrastructure/controllers/assessment/assessment-group.controller';


import { AnnouncementSchema } from './domain/announcement/entities/announcement.entity';
import { AnnouncementRepositoryImpl } from './domain/announcement/repositories/announcement.repository';
import { AnnouncementService } from './usecase/services/announcement/announcement.service';
import { AnnouncementController } from './infrastructure/controllers/announcement/announcement.controller';
import { ReminderSchema } from './domain/reminder/entities/reminder.entity';
import { ReminderRepositoryImpl } from './domain/reminder/repositories/reminder.repository';
import { ReminderController } from './infrastructure/controllers/reminder/reminder.controller';
import { ReminderService } from './usecase/services/reminder/reminder.service';

import { ContentUpdateReportsSchema } from './domain/data/entities/content-update-entity';
import { ContentUpdateReportsRepositoryImpl } from './domain/data/repositories/content-update-reports.repository';
import { ContentUpdateReportsService } from './usecase/services/data/content-update-report.service';
import { ContentUpdateReportsController } from './infrastructure/controllers/data/content-update-reports.controller';
import { LoginAuditRepositoryImpl } from './domain/login-audit/repositories/login-audit.repository';
import { LoginAuditSchema } from './domain/login-audit/entities/login-audit.entity';
import { LoginAuditService } from './usecase/services/login-audit/login-audit.service';
import { PermissionRequestSchema } from './domain/user-auth/entities/permission-request.entity';
import { PermissionRequestRepositoryImpl } from './domain/user-auth/repositories/permission-request.repository';
import { PermissionRequestController } from './infrastructure/controllers/user-auth/permission-request.controller';
import { PermissionRequestService } from './usecase/services/user-auth/permission-request.service';
import { DefaultTheme } from './domain/organizational-unit/entities/default-theme.entity';


@Module({
  /**
   * Imports from other modules
   */
  imports: [

    /**
     * Config Module Registration to use process.env
     */
    ConfigModule.forRoot({
      envFilePath: 'config.env',
      isGlobal: true,
    }),

    /**
     * Database Integration with
     * Database Schema declarations 
     */
    MongooseModule.forRoot(process.env.DB_DEV), //Server causing an issue with reading .env
    DashboardsModule,
    MongooseModule.forFeature([{ name: 'OU-Location', schema: OuLocationSchema, collection: 'locations' }]),
    MongooseModule.forFeature([{ name: 'OU-Category', schema: OuCategorySchema, collection: 'org-categories' }]),
    MongooseModule.forFeature([{ name: 'OU-Type', schema: OuTypeSchema, collection: 'org-types' }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema, collection: 'users' }]),
    MongooseModule.forFeature([{ name: 'Organizational-Unit', schema: OrganizationUnitsSchema, collection: 'organization-units' }]),
    MongooseModule.forFeature([{ name: 'Audit', schema: AuditSchema, collection: 'audit' }]),
    MongooseModule.forFeature([{ name: 'Data', schema: DataSchema, collection: 'data' }]),
    MongooseModule.forFeature([{ name: 'Data-Fields', schema: DataFieldSchema, collection: 'data-fields' }]),
    MongooseModule.forFeature([{ name: 'Field-Types', schema: FieldTypeSchema, collection: 'field-types' }]),
    MongooseModule.forFeature([{ name: 'Data-Templates', schema: DataTemplatesSchema, collection: 'data-templates' }]),
    MongooseModule.forFeature([{ name: 'Data-Type', schema: DataTypeSchema, collection: 'data-types' }]),
    MongooseModule.forFeature([{ name: 'view_data', schema: {}, collection: 'view_data' }]),
    MongooseModule.forFeature([{ name: 'view_content_updates', schema: {}, collection: 'view_content_updates' }]),
    MongooseModule.forFeature([{ name: 'content-updates', schema: contentUpdate, collection: 'content-updates' }]),
    MongooseModule.forFeature([{ name: 'knowledge-library', schema: KLibrarySchema, collection: 'knowledgeLibrary' }]),
    MongooseModule.forFeature([{ name: 'knowledge-library-category', schema: KLibraryCategorySchema, collection: 'knowledgeLibrary_categories' }]),
    MongooseModule.forFeature([{ name: 'Permission', schema: PermissionSchema, collection: 'permissions' }]),
    MongooseModule.forFeature([{ name: 'Role', schema: RoleSchema, collection: 'roles' }]),
    MongooseModule.forFeature([{ name: 'search-history', schema: SearchHistorySchema, collection: 'search_history' }]),
    MongooseModule.forFeature([{ name: 'comments', schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: 'mail_logs', schema: MailLogSchema }]),
    MongooseModule.forFeature([{ name: 'survey', schema: SurveySchema }]),
    MongooseModule.forFeature([{ name: 'survey-type', schema: SurveyTypeSchema }]),
    MongooseModule.forFeature([{ name: 'survey-attempts', schema: SurveyAttemptSchema }]),
    MongooseModule.forFeature([{ name: 'survey-attendance', schema: SurveyAttendanceSchema }]),
    MongooseModule.forFeature([{ name: 'survey-tags', schema: SurveyTagSchema }]),
    MongooseModule.forFeature([{ name: 'questions', schema: QuestionSchema }]),
    MongooseModule.forFeature([{ name: 'Training_Request', schema: TrainingRequestSchema, collection: 'training_request' }]),
    MongooseModule.forFeature([{ name: 'TrainingProgram', schema: TrainingProgramSchema, collection: 'training-program' }]),
    MongooseModule.forFeature([{ name: 'Training_Type', schema: TrainingTypeSchema, collection: 'training-type' }]),
    MongooseModule.forFeature([{ name: 'Kl-Logs', schema: KLibraryLogSchema, collection: 'kl-logs' }]),

    MongooseModule.forFeature([{ name: 'assessment', schema: AssessmentSchema }]),
    MongooseModule.forFeature([{ name: 'assessment-attempts', schema: AssessmentAttemptSchema }]),
    MongooseModule.forFeature([{ name: 'course', schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema, collection: 'session' }]),
    MongooseModule.forFeature([{ name: 'Program', schema: ProgramSchema, collection: 'program' }]),
    MongooseModule.forFeature([{ name: 'Data_States', schema: ProgramSchema, collection: 'data_states' }]),
    MongooseModule.forFeature([{ name: 'Data_Draft', schema: ProgramSchema, collection: 'data_draft' }]),
    MongooseModule.forFeature([{ name: 'notification', schema: NotificationSchema }]),
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema, collection: 'settings' }]),
    MongooseModule.forFeature([{ name: 'AdvanceSearchLogs', schema: AdvanceSearchLogSchema, collection: 'advance-search-logs' }]),
    MongooseModule.forFeature([{ name: 'Company', schema: CompanySchema, collection: 'company' }]),
    MongooseModule.forFeature([{ name: 'question-bank', schema: QuestionBankSchema }]),
    MongooseModule.forFeature([{ name: 'question-bank-topic', schema: QuestionBankTopicSchema }]),
    MongooseModule.forFeature([{ name: 'assessment-results', schema: AssessmentResultSchema }]),
    MongooseModule.forFeature([{ name: 'survey-results', schema: SurveyResultSchema }]),

    //Mystory Shopper Schemas
    MongooseModule.forFeature([{ name: 'ms-project', schema: MSProjectSchema }]),
    MongooseModule.forFeature([{ name: 'ms-channel', schema: MSChannelSchema }]),
    MongooseModule.forFeature([{ name: 'ms-evaluation', schema: MSEvaluationSchema }]),
    MongooseModule.forFeature([{ name: 'ms-session', schema: MSSessionSchema }]),
    MongooseModule.forFeature([{ name: 'ms-criteria', schema: MSCriteriaSchema }]),
    MongooseModule.forFeature([{ name: 'ms-sub-criteria', schema: MSSubCriteriaSchema }]),
    MongooseModule.forFeature([{ name: 'ms-factor', schema: MSFactorSchema }]),
    MongooseModule.forFeature([{ name: 'ms-enquiry', schema: MSEnquirySchema }]),
    MongooseModule.forFeature([{ name: 'ms-step', schema: MSStepSchema }]),
    MongooseModule.forFeature([{ name: 'ms-factor-logs', schema: MSFactorLogsSchema }]),
    MongooseModule.forFeature([{ name: 'ms-factor-responsible', schema: MSFactorResponsibleSchema }]),

    MongooseModule.forFeature([{ name: 'investor-permissions', schema: InvestorSchema }]),

    MongooseModule.forFeature([{ name: 'sign-history', schema: SignHistorySchema }]),

    MongooseModule.forFeature([{ name: 'ms-vendor-company', schema: MSVendorCompanySchema }]),

    MongooseModule.forFeature([{ name: 'assessment-survey-cache', schema: AssessmentSurveyCacheSchema }]),

    MongooseModule.forFeature([{ name: 'assessment-groups', schema: AssessmentGroupSchema }]),

    MongooseModule.forFeature([{ name: 'announcement', schema: AnnouncementSchema }]),
    MongooseModule.forFeature([{ name: 'reminder', schema: ReminderSchema }]),

    MongooseModule.forFeature([{ name: 'content-update-reports', schema: ContentUpdateReportsSchema }]),
    MongooseModule.forFeature([{ name: 'login-audit', schema: LoginAuditSchema }]),
    MongooseModule.forFeature([{ name: 'permission-requests', schema: PermissionRequestSchema , collection: 'permission-requests'}]),
    MongooseModule.forFeature([{ name: 'default-theme', schema: DefaultTheme , collection: 'default-theme'}]),

    /** 
     * Schedular
     */
    ScheduleModule.forRoot(),

    /**
     * JWT Module registration to work with JWT tokens
     */
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET
    }),
  ],

  /**
   * Global functionality providers
   */
  providers: [
    /**
     * Abstract Interface repositories registration
     */
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    {
      provide: 'MomentWrapper',
      useValue: moment
    },
    {
      provide: 'OURepository',
      useClass: OURepositoryImpl
    },
    {
      provide: 'AuthRepository',
      useClass: UserRepositoryImpl
    },
    {
      provide: 'LocationRepository',
      useClass: LocationRepositoryImpl
    },
    {
      provide: 'AuditRepository',
      useClass: AuditRepositoryImpl
    },

    {
      provide: 'LocationRepository',
      useClass: LocationRepositoryImpl
    },
    {
      provide: 'OUCategoryRepository',
      useClass: OUCategoryRepositoryImpl
    },
    {
      provide: 'OUTypeRepository',
      useClass: OUTypeRepositoryImpl
    },
    {
      provide: 'DataFieldRepository',
      useClass: DataFieldRepositoryImpl
    },
    {
      provide: 'FieldTypeRepository',
      useClass: FieldTypeRepositoryImpl
    },
    {
      provide: 'DataTypeRepository',
      useClass: DataTypeRepositoryImpl
    },
    {
      provide: 'DataTemplateRepository',
      useClass: DataTemplateRepositoryImpl
    },
    {
      provide: 'DataRepository',
      useClass: DataRepositoryImpl
    },
    {
      provide: 'ContentUpdateRepository',
      useClass: ContentUpdateRepositoryImpl
    },
    {
      provide: 'KLibraryRepository',
      useClass: KLIbraryRepositoryImpl
    },
    {
      provide: 'KLibraryCategoryRepository',
      useClass: KLIbraryCategoryRepositoryImpl
    },
    {
      provide: 'PermissionRepository',
      useClass: PermissionRepositoryImpl
    },
    {
      provide: 'RoleRepository',
      useClass: RoleRepositoryImpl
    },
    {
      provide: 'CommentRepository',
      useClass: CommentRepositoryImpl
    },
    {
      provide: 'MailLogRepository',
      useClass: MailLogRepositoryImpl
    },
    {
      provide: 'SurveyRepository',
      useClass: SurveyRepositoryImpl
    },
    {
      provide: 'SurveyTypeRepository',
      useClass: SurveyTypeRepositoryImpl
    },
    {
      provide: 'TrainingRequestRepository',
      useClass: TrainingRequestRepositoryImpl
    },
    {
      provide: 'TrainingRepository',
      useClass: TrainingRepositoryImpl
    },
    {
      provide: 'TrainingTypeRepository',
      useClass: TrainingTypeRepositoryImpl
    },
    {
      provide: 'KLibraryLogRepository',
      useClass: KLibraryLogRepositoryImpl
    },
    {
      provide: 'CourseRepository',
      useClass: CourseRepositoryImpl
    },
    {
      provide: 'AssessmentRepository',
      useClass: AssessmentRepositoryImpl
    },
    {
      provide: 'AssessmentAttemptRepository',
      useClass: AssessmentAttemptRepositoryImpl
    },
    {
      provide: 'SessionRepository',
      useClass: SessionRepositoryImpl
    },
    {
      provide: 'ProgramRepository',
      useClass: ProgramRepositoryImpl
    },
    {
      provide: 'DataDraftRepository',
      useClass: DataDraftRepositoryImpl
    },
    {
      provide: 'StatesRepository',
      useClass: StatesRepositoryImpl
    },
    {
      provide: 'SurveyAttemptRepository',
      useClass: SurveyAttemptRepositoryImpl
    },
    {
      provide: 'NotificationRepository',
      useClass: NotificationRepositoryImpl
    },
    {
      provide: 'SettingsRepository',
      useClass: SettingsRepositoryImpl
    },
    {
      provide: 'AdvanceSearchLogsRepository',
      useClass: AdvanceSearchLogsRepositoryImpl
    },
    {
      provide: 'SurveyAttendanceRepository',
      useClass: SurveyAttendanceRepositoryImpl
    },
    {
      provide: 'CompanyRepository',
      useClass: CompanyRepositoryImpl
    },
    {
      provide: 'QuestionBankRepository',
      useClass: QuestionBankRepositoryImpl
    },
    {
      provide: 'QuestionBankTopicRepository',
      useClass: QuestionBankTopicRepositoryImpl
    },
    {
      provide: 'AssessmentResultRepository',
      useClass: AssessmentResultRepositoryImpl
    },
    {
      provide: 'MSProjectRepository',
      useClass: MSProjectRepositoryImpl
    },
    {
      provide: 'MSChannelRepository',
      useClass: MSChannelRepositoryImpl
    },
    {
      provide: 'MSEvaluationRepository',
      useClass: MSEvaluationRepositoryImpl
    },
    {
      provide: 'MSSessionRepository',
      useClass: MSSessionRepositoryImpl
    },
    {
      provide: 'MSCriteriaRepository',
      useClass: MSCriteriaRepositoryImpl
    },
    {
      provide: 'MSSubCriteriaRepository',
      useClass: MSSubCriteriaRepositoryImpl
    },
    {
      provide: 'MSFactorRepository',
      useClass: MSFactorRepositoryImpl
    },
    {
      provide: 'MSEnquiryRepository',
      useClass: MSEnquiryRepositoryImpl
    },
    {
      provide: 'MSStepRepository',
      useClass: MSStepRepositoryImpl
    },
    {
      provide: 'MSFactorLogsRepository',
      useClass: MSFactorLogsRepositoryImpl
    },
    {
      provide: 'SurveyResultRepository',
      useClass: SurveyResultRepositoryImpl
    },
    {
      provide: 'MSVendorCompanyRepository',
      useClass: MSVendorCompanyRepositoryImpl
    },
    {
      provide: 'CacheRepository',
      useClass: CacheRepositoryImpl
    },
    {
      provide: 'AssessmentGroupRepository',
      useClass: AssessmentGroupRepositoryImpl
    },
    {
      provide: 'AnnouncementRepository',
      useClass: AnnouncementRepositoryImpl
    },
    {
      provide: 'ReminderRepository',
      useClass: ReminderRepositoryImpl
    },
    {
      provide: 'ContentUpdateReportsRepository',
      useClass: ContentUpdateReportsRepositoryImpl
    },
    {
      provide: 'PermissionRequestRepository',
      useClass: PermissionRequestRepositoryImpl
    },
    {
      provide: 'LoginAuditRepository',
      useClass: LoginAuditRepositoryImpl
    },


    /**
     * Directly injectable services without interface abstraction
     */

    MailService,
    OrganizationalUnitService,
    UserAuthService,
    OrganizationalUnitService,
    LocationService,
    LogMiddleware,
    AuditService,
    OuTypeService,
    OuCategoryService,
    DataService,
    DataFieldService,
    FieldTypeService,
    DataTypeService,
    DataTemplateService,
    ContentUpdateService,
    KnowledgeLibraryService,
    KnowledgeLibraryCategoryService,
    FileService,
    PermissionService,
    RoleService,
    CommentsService,
    JsonService,
    ActiveUserSocketGateway,
    SurveyService,
    SurveyTypeService,
    TrainingRequestService,
    TrainingProggramService,
    TrainingTypeService,
    AssessmentService,
    CourseService,
    SessionService,
    ProgramService,
    NotificationService,
    StatesService,
    DataDraftService,
    QueryToPipeConverterService,
    SettingsService,
    AdvanceSearchLogsService,
    CronService,
    SurveyAttemptService,
    SurveyAttendanceService,
    QrCodeService,
    CompanyService,
    AssessmentAttemptService,
    QuestionBankService,
    QuestionBankTopicService,
    AssessmentResultService,
    MSProjectService,
    MSChannelService,
    MSEvaluationService,
    MSSessionService,
    MSCriteriaService,
    MSSubCriteriaService,
    MSFactorService,
    MSEnquiryService,
    MSStepService,
    MSFactorLogsService,
    KnowledgeLibraryLogService,
    SurveyResultService,
    ImageService,
    MSVendorCompanyService,
    CacheService,
    AssessmentGroupService,
    AnnouncementService,
    ReminderService,
    ContentUpdateReportsService,
    LoginAuditService,
    PermissionRequestService
  ],

  /**
   * API endpoint controllers
   */
  controllers: [
    OrganizationalUnitController,
    UserAuthController,
    AuditController,
    LocationController,
    OuTypeController,
    OuCategoryController,
    DataController,
    DataFieldController,
    FieldTypeController,
    DataTypeController,
    DataTemplateController,
    ContentUpdateController,
    KnowledgeLibraryController,
    KnowledgeLibraryCategoryController,
    FileController,
    PermissionController,
    RoleController,
    CommentsController,
    SurveyController,
    SurveyTypeController,
    TrainingRequestController,
    TrainingProgramController,
    TrainingTypeController,
    CourseController,
    AssessmentController,
    SessionController,
    ProgramController,
    NotificationController,
    StatesController,
    DataDraftController,
    SettingsController,
    SurveyAttemptController,
    SurveyAttendanceController,
    CompanyController,
    SurveyTagsController,
    AssessmentAttemptController,
    QuestionBankController,
    QuestionBankTopicController,
    AssessmentResultController,
    MSProjectController,
    MSChannelController,
    MSEvaluationController,
    MSSessionController,
    MSCriteriaController,
    MSSubCriteriaController,
    MSFactorController,
    MSEnquiryController,
    MSStepController,
    MSFactorLogsController,
    KnowledgeLibraryLogController,
    SurveyResultController,
    MSVendorCompanyController,
    CacheController,
    AssessmentGroupController,
    AnnouncementController,
    ReminderController,
    ContentUpdateReportsController,
    PermissionRequestController
  ],
})
export class AppModule implements NestModule {
  /**
   *
   * 
   * @param {MiddlewareConsumer} consumer
   * @memberof AppModule
   */
  configure(consumer: MiddlewareConsumer) {

    consumer.apply(LogMiddleware)
      .exclude("user/login")
      .forRoutes('*');

    consumer.apply(AuditMiddleware)
      .forRoutes('*')
  }
}
