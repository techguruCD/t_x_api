import { JsonWebTokenError } from 'jsonwebtoken';
import { ExpressError } from '../utils/error.utils';
import jwtUtils from '../utils/jwt.utils';
import devicesModel from '../models/devices.model';
import cryptoUtils from '../utils/crypto.utils';

async function tokenRefreshService(params: { refreshToken: string }) {
  try {
    const decodedToken = jwtUtils.verifyToken(params.refreshToken, 'REFRESH');
    const { userId, deviceId } = decodedToken;

    const token = await devicesModel.findOne({ userId, deviceId }).lean();

    if (!token) {
      throw new ExpressError('EUA00002', 'Unauthorized', 401);
    }

    const tokenInDb = cryptoUtils.decrypt(JSON.parse(atob(token.refreshToken)));

    if (tokenInDb !== params.refreshToken) {
      throw new ExpressError('EUA00003', 'Unauthorized', 401);
    }

    const newAccessToken = jwtUtils.generateToken({
      userId,
      deviceId,
      tokenType: 'ACCESS',
    });

    return { accessToken: newAccessToken };
  } catch (error: any) {
    if (error instanceof JsonWebTokenError) {
      throw new ExpressError('EUA00004', 'Invalid refresh token', 401);
    }
    throw new ExpressError(
      error.code ?? 'EIS00001',
      error.message ?? 'Something Went Wrong',
      error.statusCode ?? 500
    );
  }
}

export default tokenRefreshService;
