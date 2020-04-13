import { Action, AppThunk } from "../types";
import { APIResource } from "./types";
import { apiFetch } from "../../utils/api";

export const API_REQUEST = "API_REQUEST";
export const API_RESPONSE = "API_RESPONSE";

export interface APIRequestAction extends Action<typeof API_REQUEST> {
  type: typeof API_REQUEST;
  payload: {
    resource: APIResource;
  };
}
export const apiRequestAction = ({
  resource,
}: APIRequestAction["payload"]): APIRequestAction => ({
  type: API_REQUEST,
  payload: {
    resource,
  },
});

export interface APIResponseAction extends Action<typeof API_RESPONSE> {
  type: typeof API_RESPONSE;
  payload: {
    resource: APIResource;
    response: any;
  };
}
export const apiResponseAction = ({
  resource,
  response,
}: APIResponseAction["payload"]): APIResponseAction => ({
  type: API_RESPONSE,
  payload: {
    resource,
    response,
  },
});

export const apiCall = (resource: APIResource): AppThunk<void> => async (
  dispatch,
  getState,
) => {
  dispatch(apiRequestAction({ resource }));
  const state = getState();
  const apiState = state.api;
  const { url } = apiState[resource];
  const r = await apiFetch(url);
  dispatch(apiResponseAction({ resource, response: r }));
};

export type APIActions = APIRequestAction | APIResponseAction;
