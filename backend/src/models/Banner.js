import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    buttonText: {
      type: String,
      trim: true,
      default: '',
    },
    buttonLink: {
      type: String,
      trim: true,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    // Desktop-specific banner image URL
    desktopImage: {
      type: String,
      default: '',
    },
    // Mobile-specific banner image URL
    mobileImage: {
      type: String,
      default: '',
    },
    // Legacy single image field for full backward compatibility
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;

