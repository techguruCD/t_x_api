import { Schema, model } from 'mongoose';

const deviceSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: 'Users',
    },
    deviceId: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const devicesModel = model('Devices', deviceSchema, 'Devices');

export default devicesModel;
