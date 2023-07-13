import devicesModel from '../models/devices.model';
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
    const twitterUsernameExists = await usersModel
      .exists({ twitterUsername: params.twitterUsername })
      .lean();

    if (twitterUsernameExists) {
      throw new ExpressError(
        'UN00001',
        'Twitter username already connected',
        400
      );
    }
    updateObject['twitterUsername'] = params.twitterUsername;
  }

  if (params.discordUsername) {
    const discordUsernameExists = await usersModel
      .exists({ discordUsername: params.discordUsername })
      .lean();

    if (discordUsernameExists) {
      throw new ExpressError(
        'UN00001',
        'Discord username already connected',
        400
      );
    }
    updateObject['discordUsername'] = params.discordUsername;
  }

  if (params.walletAddress) {
    const walletAddressExists = await usersModel
      .exists({ walletAddress: params.walletAddress })
      .lean();

    if (walletAddressExists) {
      throw new ExpressError(
        'UN00001',
        'Wallet address already connected',
        400
      );
    }
    updateObject['walletAddress'] = params.walletAddress;
  }

  if (params.referrer) {
    const [referrerExists, selfRef] = await Promise.all([
      usersModel.exists({ refCode: params.referrer }).lean(),
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

async function logout(params: { userId: string, deviceId: string }) {
  const deviceRemoved = await devicesModel.findOneAndRemove({ userId: params.userId, deviceId: params.deviceId });

  return { loggedOut: Boolean(deviceRemoved) }
}

const userService = {
  getUserService,
  updateUserService,
  logout
};

export default userService;
