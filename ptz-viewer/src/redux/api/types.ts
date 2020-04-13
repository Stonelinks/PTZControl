export enum APIRequestState {
  none = "none",
  loading = "loading",
  done = "done",
}

export interface APIRequest {
  url: string;
  state: APIRequestState;
  value: any;
}

export interface APIStoreState {
  devices: APIRequest;
  deviceFormats: APIRequest;
  deviceControls: APIRequest;
}

export type APIResource = keyof APIStoreState;
