import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await mongoose.connection.collection('users').updateOne(
      { email: 'admin@dermix.com' },
      { $set: { password: hashedPassword } }
    );
    console.log("Password reset to admin123");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
checkDB();
