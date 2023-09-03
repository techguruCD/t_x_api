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

type ScoringValues = 'False' | 'True' | 'Unknown';

interface IScoringVariables {
  can_change_balance: ScoringValues;
  can_selfdestruct: ScoringValues;
  can_set_cooldown: ScoringValues;
  can_set_fee: ScoringValues;
  can_set_paused: ScoringValues;
  can_take_ownership: ScoringValues;
  is_anti_whale: ScoringValues;
  is_black_listed: ScoringValues;
  is_burnable: ScoringValues;
  is_hidden_owner: ScoringValues;
  is_honeypot: ScoringValues;
  is_mintable: ScoringValues;
  is_opensource: ScoringValues;
  is_proxy: ScoringValues;
  is_white_listed: ScoringValues;

}

async function getTokenQuickCheckData(params: { network: string, contract_address: string, platform: string }) {
  const { contract_address, network, platform } = params;
  let data: Record<string, any> = { scanData: null };
  
  try {
    const scanData = await aegisModel.AegisTokenQuickCheckModel.findOne({ contract_address }).lean();

    if (scanData) {
      data['scanData'] = scanData;
      data['scanData']['score'] = processScoreCalculation(scanData as any);
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
    data['scanData']['score'] = processScoreCalculation(quickCheckData);
    
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

function scoreCanChangeBalance(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') HighRisk += 1
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreCanSelfDestruct(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') HighRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreCanSetCooldown(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') MediumRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreCanSetFee(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') MediumRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreCanSetPaused(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') MediumRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreIsHiddenOwner(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') HighRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreCanTakeOwnership(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues, isHiddenOwnerValue: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True' && isHiddenOwnerValue === 'True') HighRisk += 1;
  if (value === 'True' && isHiddenOwnerValue === 'False') MediumRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreIsAntiWhale(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') HighRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreIsBlackListed(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') MediumRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreIsBurnable(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') MediumRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreIsHoneypot(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') HighRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreIsMintable(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') MediumRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreIsOpensource(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') MediumRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreIsProxy(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') MediumRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function scoreIsWhitelisted(LowRisk: number, MediumRisk: number, HighRisk: number, value: ScoringValues) {
  if (value === 'False') LowRisk += 1;
  if (value === 'True') MediumRisk += 1;
  return { LowRisk, MediumRisk, HighRisk };
}

function processScoreCalculation(scoringVariables: IScoringVariables) {
  let LowRisk = 0;
  let MediumRisk = 0;
  let HighRisk = 0;

  ({ LowRisk, MediumRisk, HighRisk } = scoreCanChangeBalance(LowRisk, MediumRisk, HighRisk, scoringVariables.can_change_balance));
  ({ LowRisk, MediumRisk, HighRisk } = scoreCanSelfDestruct(LowRisk, MediumRisk, HighRisk, scoringVariables.can_selfdestruct));
  ({ LowRisk, MediumRisk, HighRisk } = scoreCanSetCooldown(LowRisk, MediumRisk, HighRisk, scoringVariables.can_set_cooldown));
  ({ LowRisk, MediumRisk, HighRisk } = scoreCanSetFee(LowRisk, MediumRisk, HighRisk, scoringVariables.can_set_fee));
  ({ LowRisk, MediumRisk, HighRisk } = scoreCanSetPaused(LowRisk, MediumRisk, HighRisk, scoringVariables.can_set_paused));
  ({ LowRisk, MediumRisk, HighRisk } = scoreIsHiddenOwner(LowRisk, MediumRisk, HighRisk, scoringVariables.is_hidden_owner));
  ({ LowRisk, MediumRisk, HighRisk } = scoreCanTakeOwnership(LowRisk, MediumRisk, HighRisk, scoringVariables.can_take_ownership, scoringVariables.is_hidden_owner));
  ({ LowRisk, MediumRisk, HighRisk } = scoreIsAntiWhale(LowRisk, MediumRisk, HighRisk, scoringVariables.is_anti_whale));
  ({ LowRisk, MediumRisk, HighRisk } = scoreIsBlackListed(LowRisk, MediumRisk, HighRisk, scoringVariables.is_black_listed));
  ({ LowRisk, MediumRisk, HighRisk } = scoreIsBurnable(LowRisk, MediumRisk, HighRisk, scoringVariables.is_burnable));
  ({ LowRisk, MediumRisk, HighRisk } = scoreIsHoneypot(LowRisk, MediumRisk, HighRisk, scoringVariables.is_honeypot));
  ({ LowRisk, MediumRisk, HighRisk } = scoreIsMintable(LowRisk, MediumRisk, HighRisk, scoringVariables.is_mintable));
  ({ LowRisk, MediumRisk, HighRisk } = scoreIsOpensource(LowRisk, MediumRisk, HighRisk, scoringVariables.is_burnable));
  ({ LowRisk, MediumRisk, HighRisk } = scoreIsProxy(LowRisk, MediumRisk, HighRisk, scoringVariables.is_proxy));
  ({ LowRisk, MediumRisk, HighRisk } = scoreIsWhitelisted(LowRisk, MediumRisk, HighRisk, scoringVariables.is_white_listed));

  return { LowRisk, MediumRisk, HighRisk };
}

function calculateScore(results: any[]) {
  const totalResults = results.length;

  if (totalResults < 1) {
    return [];
  }

  for (let i = 0; i < totalResults; i++) {
    const result = results[i];

    if (result.AegisTokenQuickCheckFantom) {
      result.score = result.AegisTokenQuickCheckFantom.score
      result.AegisTokenQuickCheckFantom = undefined;
    }

    if (result.AegisTokenQuickCheckPolygon) {
      result.score = result.AegisTokenQuickCheckPolygon.score
      result.AegisTokenQuickCheckPolygon = undefined;
    }

    if (result.AegisTokenQuickCheckBSC) {
      result.score = result.AegisTokenQuickCheckBSC.score
      result.AegisTokenQuickCheckBSC = undefined;
    }

    if (result.AegisTokenQuickCheckEthereum) {
      result.score = result.AegisTokenQuickCheckEthereum.score
      result.AegisTokenQuickCheckEthereum = undefined;
    }
  }

  return results;
}

const aegisService = {
  getTokenQuickCheckData,
  calculateScore,
}

export default aegisService;