// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Constants, {ActionTypes, SidebarSize} from 'utils/constants';

export const toggle = () => (dispatch) => dispatch({
    type: ActionTypes.TOGGLE_LHS,
});

export const open = () => (dispatch) => dispatch({
    type: ActionTypes.OPEN_LHS,
});

export const close = () => (dispatch) => dispatch({
    type: ActionTypes.CLOSE_LHS,
});

export const setLhsSize = (sidebarSize) => (dispatch) => {
    let newSidebarSize = sidebarSize;
    if (!sidebarSize) {
        const width = window.innerWidth;

        switch (true) {
        case width <= Constants.SMALL_SIDEBAR_BREAKPOINT: {
            newSidebarSize = SidebarSize.SMALL;
            break;
        }
        case width > Constants.SMALL_SIDEBAR_BREAKPOINT && width <= Constants.MEDIUM_SIDEBAR_BREAKPOINT: {
            newSidebarSize = SidebarSize.MEDIUM;
            break;
        }
        case width > Constants.MEDIUM_SIDEBAR_BREAKPOINT && width <= Constants.LARGE_SIDEBAR_BREAKPOINT: {
            newSidebarSize = SidebarSize.LARGE;
            break;
        }
        default: {
            newSidebarSize = SidebarSize.XLARGE;
        }
        }
    }
    return dispatch({
        type: ActionTypes.SET_LHS_SIZE,
        size: newSidebarSize,
    });
};
