import { model, Schema } from "mongoose";
import { ITour, ITourType } from "./tour.interface";

const tourTypeSchema = new Schema<ITourType>(
    {
        name: { type: String, required: true, unique: true },
    },
    {
        timestamps: true,
    }
);

const TourType = model<ITourType>("TourType", tourTypeSchema);

const tourSchema = new Schema<ITour>(
    {
        title: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String },
        images: { type: [String], default: [] },
        location: { type: String, default: null },
        costFrom: { type: Number, default: null },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        included: { type: [String], default: [] },
        excluded: { type: [String], default: [] },
        amenities: { type: [String], default: [] },
        tourPlan: { type: [String], default: [] },
        maxGuest: { type: Number, default: null },
        minAge: { type: Number, default: null },
        division: {
            type: Schema.Types.ObjectId,
            ref: "Division",
            required: true,
        },
        tourType: {
            type: Schema.Types.ObjectId,
            ref: "TourType",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
export const Tour = model<ITour>("Tour", tourSchema);
