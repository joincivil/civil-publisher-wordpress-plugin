import { AnyAction } from "redux";

export type SelectType = (namespace: string) => { [key: string]: (...args: any[]) => any };
export type DispatchType = (namespace: string) => { [key: string]: (...args: any[]) => AnyAction };
