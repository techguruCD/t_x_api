import devicesModel from '../models/devices.model';
import usersModel from '../models/users.model';
import cryptoUtils from '../utils/crypto.utils';
import { ExpressError } from '../utils/error.utils';
import jwtUtils from '../utils/jwt.utils';

async function tokenCreateService(params: {
  userId: string;
  deviceId: string;
}) {
  try {
    const [user, device] = await Promise.all([
      usersModel.findOne({ userId: params.userId }).lean(),
      devicesModel
        .findOne({ userId: params.userId, deviceId: params.deviceId })
        .lean(),
    ]);

    if (!user) {
      await new usersModel({ userId: params.userId }).save();
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
    throw new ExpressError(
      'EIS00001',
      error.message ?? 'Something Went Wrong',
      500
    );
  }
}

export default tokenCreateService;
