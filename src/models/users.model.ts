import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: String,
    photoUrl: String,
    emailId: {
      type: String,
      required: true,
    },
    twitterUsername: String,
    discordUsername: String,
    walletAddress: String,
    refCode: {
      type: String,
      unique: true,
    },
    referrer: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {
      updatedAt: true,
      createdAt: true,
    },
  }
);

const usersModel = model('Users', userSchema, 'Users');

export default usersModel;
