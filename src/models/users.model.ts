import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
});

const usersModel = model('Users', userSchema, 'Users');

export default usersModel;
