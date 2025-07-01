import { Schema, model, Model } from 'mongoose';

export const SearchHistorySchema = new Schema({
    query: {
        type: String,
    },
    type: {
        type: Array<String>,
    },
    category_id: {
        type: String,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    keywords: {
        type: String,
    },
},
    { strict: false, timestamps: true, collection: 'search_history', maxTimeMS: 30000 });

const SearchHistoryModel: Model<any> = model('search_history', SearchHistorySchema);
