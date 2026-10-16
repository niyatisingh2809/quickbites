import mongoose from "mongoose";

const componentItemSchema = new mongoose.Schema(
  {
    componentId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    isIncluded: { type: Boolean, default: true },
    extraPriceRupees: { type: Number, default: 0, min: 0 },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    portion: { type: String, default: "" }, // e.g. "4 pcs", "1 Bowl (250ml)", "1 Cup (100g)"
    image: { type: String, default: "" }, // filename in /images/ or URL
    description: { type: String, default: "" }
  },
  { _id: false }
);

const componentGroupSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true },
    name: { type: String, required: true, trim: true }, // e.g. "Breads", "Rice", "Dal", "Sabzi", "Paneer", "Sides", "Desserts"
    isRequired: { type: Boolean, default: true },
    minSelections: { type: Number, default: 1, min: 0 },
    maxSelections: { type: Number, default: 1, min: 1 },
    maxQuantityPerSelection: { type: Number, default: 4, min: 1 },
    components: [componentItemSchema]
  },
  { _id: false }
);

const thaliTemplateSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "default_thali.png" },
    basePriceRupees: { type: Number, required: true, min: 0 },
    isVeg: { type: Boolean, default: true, index: true },
    isAvailable: { type: Boolean, default: true, index: true },
    isSample: { type: Boolean, default: true, index: true }, // Marks sample/pilot offerings until officially restaurant-approved
    allowedPreparationNotes: {
      type: [String],
      default: ["Less Spicy", "Medium Spicy", "Extra Spicy", "No Onion & Garlic", "Extra Butter on Breads", "Pack Dal Separately"]
    },
    componentGroups: [componentGroupSchema]
  },
  { timestamps: true }
);

thaliTemplateSchema.index({ restaurantId: 1, isAvailable: 1 });

const thaliTemplateModel =
  mongoose.models.thali_template || mongoose.model("thali_template", thaliTemplateSchema);

export default thaliTemplateModel;
