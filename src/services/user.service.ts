import usersModel from '../models/users.model';
import { ExpressError } from '../utils/error.utils';

async function updateUserService(params: {
  userId: string;
  twitterUsername?: string;
  discordUsername?: string;
  walletAddress?: string;
  referrer?: string;
}) {
  const updateObject: Record<string, string> = {};

  if (params.twitterUsername) {
    updateObject['twitterUsername'] = params.twitterUsername;
  }

  if (params.discordUsername) {
    updateObject['discordUsername'] = params.discordUsername;
  }

  if (params.walletAddress) {
    updateObject['walletAddress'] = params.walletAddress;
  }

  if (params.referrer) {
    const [referrerExists, selfRef] = await Promise.all([
      usersModel.exists({ referrer: params.referrer }).lean(),
      usersModel
        .findOne({ userId: params.userId, refCode: params.referrer })
        .lean(),
    ]);

    if (!referrerExists) {
      throw new ExpressError('REF00001', 'Invalid Referrer code', 404);
    }

    if (selfRef) {
      throw new ExpressError('REF00002', 'Can not refer self', 400);
    }

    updateObject['referrer'] = params.referrer;
  }

  const updatedResult = await usersModel.updateOne(
    { userId: params.userId },
    { $set: updateObject },
    { new: true }
  );

  return { success: updatedResult.modifiedCount === 1 };
}

async function getUserService(params: { userId: string }) {
  const user = await usersModel.findOne({ userId: params.userId });
  return user;
}

const userService = {
  getUserService,
  updateUserService,
};

export default userService;
