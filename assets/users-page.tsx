import * as $ from "jquery";
const { apiRequest } = window.wp;
import { getCivil, saveNewsroomRoleToProfile } from "./util";
import { userMetaKeys } from "./constants";

async function init(): Promise<void> {
  const civil = getCivil();
  if (!civil) {
    $(`.column-${userMetaKeys.NEWSROOM_ROLE} .spinner`).hide();
    return;
  }

  const newsroom = await civil.newsroomAtUntrusted(window.civilNamespace.newsroomAddress);
  const currentUserInfo = await apiRequest({ path: "/wp/v2/users/me?context=edit" });

  $("table.users tbody tr").each(
    async (i: number, el: Element): Promise<void> => {
      const id = parseInt(
        $(el)
          .attr("id")
          .replace("user-", ""),
        10,
      );
      const addr = $(el)
        .find(`.column-${userMetaKeys.WALLET_ADDRESS} code`)
        .text();
      const $role = $(el).find(`.column-${userMetaKeys.NEWSROOM_ROLE}`);
      const currentRole = $role.text();

      if (isNaN(id) || !addr || !$role) {
        return;
      }

      let role;
      if (await newsroom.isOwner(addr)) {
        role = "Civil Officer";
      } else if (await newsroom.isEditor(addr)) {
        role = "Civil Member";
      } else {
        role = "";
      }

      if (role !== currentRole) {
        $role.text(role);

        if (currentUserInfo.id === id || currentUserInfo.capabilities.manage_options) {
          // Should be `edit_users` instead of `manage_options`, but Editors seem to erroneously have `edit_users` set, even though they are not in fact able to edit users in admin dashboard. Any role with `manage_options` should be able to edit users.
          await saveNewsroomRoleToProfile(id, role);
        }
      }
    },
  );
}

window.onload = init;
