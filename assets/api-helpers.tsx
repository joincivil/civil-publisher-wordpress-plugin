const { apiRequest } = window.wp;
const { dispatch } = window.wp.data;
import { EthAddress } from "@joincivil/core";
import { apiNamespace, userMetaKeys } from "./constants";

export async function saveAddressToProfile(address: EthAddress): Promise<void> {
  await apiRequest({
    method: "POST",
    path: apiNamespace + "users/me",
    data: {
      [userMetaKeys.WALLET_ADDRESS]: address,
    },
  });

  const civilDispatch = dispatch("civil/blockchain");
  if (civilDispatch) {
    civilDispatch.setWpUserAddress(address);
  }
}

export async function saveNewsroomRoleToProfile(id: number, role: string | null): Promise<void> {
  await apiRequest({
    method: "POST",
    path: apiNamespace + "users/" + id,
    data: {
      [userMetaKeys.NEWSROOM_ROLE]: role,
    },
  });
}
