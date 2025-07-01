import mongoose from 'mongoose';
import { SurveyDisplayMode, SurveySettings } from '../dto/survey.dto';

export const QuestionSchema = new mongoose.Schema({
  questionCode: {
    type: String,
  },
  questionText: {
    type: String,
  },
  type: {
    type: String,
    default: null,
  },
  pageBreak: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  separator: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  meta: {
    type: Object,
  }
});

export const SurveySettingsSchema = new mongoose.Schema({
  displayMode: {
    type: String,
    enum: [...Object.values(SurveyDisplayMode)],
    default: 'Focus',
  },
});

export const SurveySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    type: {
      type: mongoose.Types.ObjectId,
      ref: 'survey-type',
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
      type: SurveySettingsSchema,
      default: () => new SurveySettings(),
    },
    accessType: {
      type: String,
      enum: ['BY_ACCOUNT', 'BY_URL', 'POPUP'],
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
    cloneParentId: {
      type: mongoose.Types.ObjectId,
      ref: 'surveys'
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
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
    multiAttemptAllow: {
      type: Boolean
    },
    anonymous:{
      type: Boolean,
      default: false
    },
  },
  { strict: true, timestamps: true },
);
