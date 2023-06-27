import usersModel from '../models/users.model';

async function updateUserService(params: {
  userId: string;
  name?: string;
  twitterUsername?: string;
  discordUsername?: string;
  walletAddress?: string;
}) {
  const updateObject: Record<string, string> = {};

  if (params.name) {
    updateObject['name'] = params.name;
  }

  if (params.twitterUsername) {
    updateObject['twitterUsername'] = params.twitterUsername;
  }

  if (params.discordUsername) {
    updateObject['discordUsername'] = params.discordUsername;
  }

  if (params.walletAddress) {
    updateObject['walletAddress'] = params.walletAddress;
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
