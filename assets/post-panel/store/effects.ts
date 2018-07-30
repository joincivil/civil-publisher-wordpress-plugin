/** What we're really trying to do is add middleware to listen for certain actions being dispatched in gutenberg stores, but I'm not sure if that's possible, so subscribing andd checking state will have to be close enough. */

const { apiRequest } = window.wp;
const { select, dispatch, subscribe } = window.wp.data;
import { apiNamespace } from "../../constants";

// let wasSavingPost = select('core/editor').isSavingPost();
let wasSavingMeta = select('core/edit-post').isSavingMetaBoxes();

const unsub = subscribe(() => {
  // const isSavingPost = select('core/editor').isSavingPost();
  const isSavingMeta = select('core/edit-post').isSavingMetaBoxes();

  if (wasSavingMeta && ! isSavingMeta) {
    updateLastRevisionId();
  }

  // wasSavingPost = isSavingPost;
  wasSavingMeta = isSavingMeta;
});

async function updateLastRevisionId() {
  const { setLastRevisionId } = dispatch("civil/blockchain");
  const postId = select("core/editor").getCurrentPostId();

  try {
    const response = await apiRequest({ path: apiNamespace + "posts/" + postId + "/last-revision-id" });
    const revisionId = parseInt(response, 10);

    if (isNaN(revisionId)) {
      throw Error("Invalid response fetching last revision ID");
    }

    dispatch(setLastRevisionId(revisionId));
  } catch (err) {
    console.error("Failed to fetch last revision ID:", err);
    throw Error("Failed to fetch last revision ID");
  }
}

