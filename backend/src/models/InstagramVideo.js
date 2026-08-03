import mongoose from 'mongoose';

const instagramVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videoLink: {
      type: String, // Embeddable/public link
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const InstagramVideo = mongoose.model('InstagramVideo', instagramVideoSchema);
export default InstagramVideo;
