// nuclear option to fix all module import type issues:
// declare module '*';

interface Window {
  wp: any;
  web3: any;
  _wpGutenbergPost: any;
  civilNamespace: { newsroomAddress: string; newsroomTxHash: string };
}

declare module "refx";
declare module "redux-multi";
