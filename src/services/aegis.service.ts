import { isAxiosError } from "axios";
import aegisModel from "../models/aegis.model";
import aegisRequests from "../aegisWeb3/requests";

enum ChainlistIds {
  Ethereum = 1,
  Optimism = 10,
  BSC = 56,
  Polygon = 137,
  Fantom = 250,
  Arbitrum = 42161,
  Avalanche = 43114
}

const ChainlistMappings: Record<string, number> = {
  "bq:ethereum": ChainlistIds.Ethereum,
  "cg:ethereum": ChainlistIds.Ethereum,

  "bq:bsc": ChainlistIds.BSC,
  "cg:binance-smart-chain": ChainlistIds.BSC,
  
  "bq:matic": ChainlistIds.Polygon,
  "cg:polygon-pos": ChainlistIds.Polygon,
  
  "bq:fantom": ChainlistIds.Fantom,
  "cg:fantom": ChainlistIds.Fantom
}

async function getTokenQuickCheckData(params: { network: string, contract_address: string, platform: string }) {
  const { contract_address, network, platform } = params;
  let data: Record<string, any> = { scanData: null };
  
  try {
    const scanData = await aegisModel.AegisTokenQuickCheckModel.findOne({ contract_address }).lean();

    if (scanData) {
      data['scanData'] = scanData;
      return data;
    }

    const aegisChainId = ChainlistMappings[`${platform}:${network}`];

    if (!aegisChainId) {
      return data;
    }

    const isChainActive = await aegisModel.AegisChainlistModel.exists({ chainId: aegisChainId, status: 1 });

    if (!isChainActive) {
      return data;
    }

    const quickCheckData = await aegisRequests.getTokenQuickCheckData(aegisChainId, contract_address);

    if (!quickCheckData) {
      return data;
    }

    data['scanData'] = quickCheckData;
    
    await aegisModel.AegisTokenQuickCheckModel.updateOne({ contract_address }, { $set: quickCheckData });
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.log(`aegis.helper.ts error > `, error.response?.data);
    } else {
      console.log(`aegis.helper.ts error > `, error);
    }
    return data;
  }
}

const aegisService = {
  getTokenQuickCheckData
}

export default aegisService;