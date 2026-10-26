import mongoose from "mongoose";

const shiprocketCatalogIdSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["product", "collection", "variant"],
      required: true,
    },
    sourceId: {
      type: String,
      required: true,
    },
    numericId: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

shiprocketCatalogIdSchema.index(
  { entityType: 1, sourceId: 1 },
  { unique: true }
);

shiprocketCatalogIdSchema.index(
  { entityType: 1, numericId: 1 },
  { unique: true }
);

export default mongoose.model(
  "ShiprocketCatalogId",
  shiprocketCatalogIdSchema
);