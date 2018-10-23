// nuclear option to fix all module import type issues:
// declare module '*';

interface Window {
  wp: {
    apiRequest: (conf: any) => Promise<any>;
    data: {
      withSelect: any;
      withDispatch: any;
      select: import("./gutenberg").SelectType;
      dispatch: import("./gutenberg").DispatchType;
      subscribe: (listener: (...args: any[]) => any) => any;
      registerStore: (reducerKey: string, conf: any) => any;
      combineReducers: (reducers: any) => any;
    };
    components: any;
    compose: {
      compose: any;
    };
    date: any;
    editPost: any;
    plugins: any;
  };
  _wpGutenbergPost: any;

  web3: any;
  civilNamespace: {
    newsroomAddress: string;
    newsroomTxHash: string;
    wpSiteUrl: string;
    wpAdminUrl: string;
    logoUrl?: string;
    adminEmail?: boolean;
    networkName?: string;
  };
  civilImages: {
    metamask_confim_modal: string;
    metamask_logo: string;
  };
}

declare module "refx";
declare module "redux-multi";
declare module "moment"; // included via Gutenberg
declare module "jquery"; // included on all WordPress pages
declare module "*.png";
declare module "ipfs-api";
declare module "bs58";
