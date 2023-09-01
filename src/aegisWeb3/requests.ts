import { isAxiosError } from "axios";
import aegisAxios from "./aegisAxios";

async function getTokenQuickCheckData(chainid: number, address: string) {
  try {
    const response = await aegisAxios.get("/api/User/TokenSecurity", { params: { chainid, address } });

    console.log(response.data, response.status);

    if (response.data.errorCode !== 0) {
      return undefined
    }
    return response.data.result;
  } catch (error) {
    if (isAxiosError(error)) {
      console.log(`aegisError status: ${error.response?.status}, chainid: ${chainid}, address: ${address}`);
    } else {
      console.log('aegisError', error);
    }
    return undefined;
  }
}

const aegisRequests = {
  getTokenQuickCheckData
}

export default aegisRequests;