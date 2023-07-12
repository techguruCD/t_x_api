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
    twitterUsername: {
      type: String,
      unique: true,
    },
    discordUsername: {
      type: String,
      unique: true,
    },
    walletAddress: {
      type: String,
      unique: true,
    },
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
