import mongoose from "mongoose";


export const RoleSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        description: {
            type: String
        },
        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Permission",
            }
        ],
        active: {
            type: Boolean
        }
    },
    { strict: false, timestamps: true }
);