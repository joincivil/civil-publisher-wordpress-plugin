/** What we're really trying to do is add middleware to listen for certain actions being dispatched in gutenberg stores, but I'm not sure if that's possible, so subscribing andd checking state will have to be close enough. */

const { apiRequest } = window.wp;
const { select, dispatch, subscribe } = window.wp.data;
import { apiNamespace } from "../../constants";
import { getLastRevisionId } from "./resolvers";

let wasSavingPost = select('core/editor').isSavingPost();
let wasSavingMeta = select('core/edit-post').isSavingMetaBoxes();

const unsub = subscribe(async () => {
  const isSavingPost = select('core/editor').isSavingPost();
  const isSavingMeta = select('core/edit-post').isSavingMetaBoxes();

  if ((wasSavingMeta && ! isSavingMeta) || (wasSavingPost && ! isSavingPost)) {
    dispatch(await getLastRevisionId());
  }

  wasSavingPost = isSavingPost;
  wasSavingMeta = isSavingMeta;
});

