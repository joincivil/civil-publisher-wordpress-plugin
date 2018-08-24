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

  $("table.users tbody tr").each(async function() {
    const id = parseInt(
      $(this)
        .attr("id")
        .replace("user-", ""),
      10,
    );
    const addr = $(this)
      .find(`.column-${userMetaKeys.WALLET_ADDRESS} code`)
      .html();
    const $role = $(this).find(`.column-${userMetaKeys.NEWSROOM_ROLE}`);
    const currentRole = $role.html();

    if (isNaN(id) || !addr || !$role) {
      return;
    }

    let role;
    if (await newsroom.isEditor(addr)) {
      role = "Civil Member";
    } else if (await newsroom.isOwner(addr)) {
      role = "Civil Officer";
    } else {
      role = "";
    }

    if (role !== currentRole) {
      $role.html(role);

      if (currentUserInfo.id === id || currentUserInfo.capabilities.manage_options) {
        // Should be `edit_users` instead of `manage_options`, but Editors seem to erroneously have `edit_users` set, even though they are not in fact able to edit users in admin dashboard. Any role with `manage_options` should be able to edit users.
        saveNewsroomRoleToProfile(id, role);
      }
    }
  });
}

window.onload = init;
