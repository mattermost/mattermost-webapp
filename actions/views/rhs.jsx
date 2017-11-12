import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {ActionTypes, RHSStates} from 'utils/constants';

export function updateRhsState(rhsState) {
    return (dispatch, getState) => {
        const action = {
            type: ActionTypes.UPDATE_RHS_STATE,
            state: rhsState
        };

        if (rhsState === RHSStates.PIN) {
            action.channelId = getCurrentChannelId(getState());
        }

        dispatch(action);
    };
}