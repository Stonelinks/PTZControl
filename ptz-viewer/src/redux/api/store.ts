import produce from "immer";
import { APIRequest, APIRequestState, APIStoreState } from "./types";
import { APIActions, API_REQUEST, API_RESPONSE } from "./actions";
import { nothing } from "../../common/nothing";

const makeRequestInitialState = (url: string): APIRequest => ({
  url,
  state: APIRequestState.none,
  value: nothing,
});

const InitialAPIReducerState: APIStoreState = {
  devices: makeRequestInitialState("video-device/list"),
  deviceFormats: makeRequestInitialState("video-device/:deviceId/formats"),
  deviceControls: makeRequestInitialState("video-device/:deviceId/controls"),
};

const APIStore = (
  state = InitialAPIReducerState,
  action: APIActions,
): APIStoreState => {
  switch (action.type) {
    case API_REQUEST:
      return produce(state, draft => {
        draft[action.payload.resource].state = APIRequestState.loading;
      });
    case API_RESPONSE:
      return produce(state, draft => {
        draft[action.payload.resource].state = APIRequestState.done;
        draft[action.payload.resource].value = action.payload.response;
      });
    default:
      return state;
  }
};

export default APIStore;
