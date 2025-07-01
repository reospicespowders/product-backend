import mongoose from 'mongoose';
import { SurveyDisplayMode, SurveySettings } from 'src/domain/survey/dto/survey.dto';
import { QuestionSchema } from 'src/domain/survey/entities/survey.entity';

export const AssessmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Closed', 'Pending'],
            default: 'Pending',
        },
        attendees: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],
        headerImage: {
            type: String,
            default: '',
        },
        footerText: {
            type: String,
            default: '',
        },
        thankyouPageText: {
            type: String,
            default: '',
        },
        attempts: {
            type: Number,
            default: 0,
        },
        tag: {
            type: mongoose.Types.ObjectId,
            ref: 'survey-tags'
        },
        questionBankId: {
            type: mongoose.Types.ObjectId,
            ref: 'question-bank'
        },
        percentageCriteria: [{
            title: {
                type: String
            },
            from: {
                type: Number,
                default: 0
            },
            to: {
                type: Number,
                default: 0
            },
            icon: {
                type: String
            },
            certificateText: {
                type: Object,
            },
        },],
        certificateMinistry: {
            type: Object,
        },
        startDate: {
            type: String,
        },
        endDate: {
            type: String,
        },
        comments: {
            type: String,
            default: '',
        },
        settings: {
            type: {
                displayMode: {
                    type: String,
                    enum: [...Object.values(SurveyDisplayMode)],
                    default: SurveyDisplayMode.Focus
                }
            },
            default: {
                displayMode: SurveyDisplayMode.Focus
            }
        },
        accessType: {
            type: String,
            enum: ['BY_ACCOUNT', 'BY_URL','POPUP'],
            default: 'BY_ACCOUNT',
        },
        externals: {
            type: Array<String>,
            default: [],
        },
        active: {
            type: Boolean,
            default: true,
        },
        questions: [QuestionSchema],
        externalQuestions: [QuestionSchema],
        trainingTypeId: {
            type: mongoose.Types.ObjectId,
            ref: 'training-type'
        },
        allowedAttempts: {
            type: Number,
            default: 0,
        },
        totalMarks: {
            type: Number,
            default: 100
        },
        defaultScore: {
            type: Number,
            default: 10
        },
        cloneParentId: {
            type: mongoose.Types.ObjectId,
            ref: 'assessments'
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        showResult: {
            type: Boolean,
            default: false,
        },
        showCert: {
            type: Boolean,
            default: false,
        },
        topics: {
            type: Array<String>,
            default: [],
        },
        externalFields: {
            type: Array<String>,
            default: [],
        },
        attemptStartDate: {
            type: String,
        },
        attemptEndDate: {
            type: String,
        },
        attemptTime: {
            type: String,
        },
        totalParticipant: {
            type: String,
        },
    },
    { strict: true, timestamps: true },
);
