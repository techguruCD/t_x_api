import devicesModel from '../models/devices.model';
import usersModel from '../models/users.model';
import cryptoUtils from '../utils/crypto.utils';
import { ExpressError } from '../utils/error.utils';
import jwtUtils from '../utils/jwt.utils';

async function tokenCreateService(params: {
  userId: string;
  deviceId: string;
  emailId?: string;
  username?: string;
  photoUrl?: string;
}) {
  try {
    const [user, device] = await Promise.all([
      usersModel.findOne({ userId: params.userId }).lean(),
      devicesModel
        .findOne({ userId: params.userId, deviceId: params.deviceId })
        .lean(),
    ]);

    if (!params.emailId) {
      console.log(`2.1`);
      throw new ExpressError('TSC00001', 'emailId is missing', 400);
    }
    if (!params.username) {
      console.log(`2.2`);
      throw new ExpressError('TSC00002', 'username is missing', 400);
    }

    if (!user) {
      await new usersModel({
        userId: params.userId,
        emailId: params.emailId,
        username: params.username,
        photoUrl: params.photoUrl ?? null,
      }).save();
    }

    if (user) {
      await usersModel.findOneAndUpdate(
        { userId: params.userId },
        {
          $set: {
            emailId: params.emailId,
            username: params.username,
            photoUrl: params.photoUrl ?? null,
          },
        }
      );
    }

    const accessToken = jwtUtils.generateToken({
      userId: params.userId,
      deviceId: params.deviceId,
      tokenType: 'ACCESS',
    });
    const refreshToken = jwtUtils.generateToken({
      userId: params.userId,
      deviceId: params.deviceId,
      tokenType: 'REFRESH',
    });
    const encryptedRefreshToken = cryptoUtils.encrypt(refreshToken);

    if (device) {
      await devicesModel.updateOne(
        { userId: params.userId, deviceId: params.deviceId },
        { $set: { refreshToken: btoa(JSON.stringify(encryptedRefreshToken)) } }
      );
    } else {
      await new devicesModel({
        userId: params.userId,
        deviceId: params.deviceId,
        refreshToken: btoa(JSON.stringify(encryptedRefreshToken)),
      }).save();
    }

    return {
      accessToken,
      refreshToken,
    };
  } catch (error: any) {
    console.log(`2.3`, error);
    throw new ExpressError(
      error.code ?? 'EIS00001',
      error.message ?? 'Something Went Wrong',
      error.statusCode ?? 500
    );
  }
}

export default tokenCreateService;
