import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    mrpPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    benefit: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    whyChooseDermfix: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String], // Array of Cloudinary Image URLs
      default: [],
    },
    sizes: [{
      size: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Size',
      },
      mrpPrice: {
        type: Number,
        required: true,
      },
      salePrice: {
        type: Number,
        required: true,
      }
    }],
    qty: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tabConfig: {
      descriptionEnabled: {
        type: Boolean,
        default: true,
      },
      ingredientsEnabled: {
        type: Boolean,
        default: true,
      },
      reviewsEnabled: {
        type: Boolean,
        default: true,
      },
    },
    ingredients: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        percentage: {
          type: String,
          trim: true,
          default: '',
        },
        description: {
          type: String,
          trim: true,
          default: '',
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    keyIngredients: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        percentage: {
          type: String,
          trim: true,
          default: '',
        },
        description: {
          type: String,
          trim: true,
          default: '',
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    howToUseImage: {
      type: String,
      default: '',
    },
    whatItDoesImage: {
      type: String,
      default: '',
    },
    ingredientsImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isShippingPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
