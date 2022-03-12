// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getSelectedChannelId} from 'selectors/rhs';
import {GlobalState} from 'types/store';

/**
* Invokes the callback functions when a channel is newly added or removed from view.
* @onChannelAdded is invoked when a channel is newly displayed in the center channel or RHS (right hand side).
* @onChannelRemoved is invoked when a channel is no longer visible in either the center channel or RHS.
*
* The previous center and previous RHS channels are compared between the two locations so that duplicate calls to `onChannelAdded` are not called if the channel
* was already visible in the other spot, and so that `onChannelRemoved` is not be invoked if the opposite location is still displaying that channel.
*
* For example, when changing channels via the LHS (left hand side) menu from channel 123 to channel 456,
* if the RHS still has a thread open for channel 123, `onChannelRemoved('123')` will not be invoked.
**/
export const channelViewObserver = (() => {
    // closure around old ids to persisted them across invocations.
    let oldCenterID = '';
    let oldRHSID = '';
    return (getState: () => GlobalState, onChannelAdded: (channelID: string) => void, onChannelRemoved: (channelID: string) => void) => {
        const newCenterID = getCurrentChannelId(getState());
        const newRHSID = getSelectedChannelId(getState());

        ['center', 'rhs'].forEach((subject) => {
            let oldID;
            let newID;
            let otherID;
            if (subject === 'center') {
                [oldID, newID, otherID] = [oldCenterID, newCenterID, newRHSID];
            } else {
                [oldID, newID, otherID] = [oldRHSID, newRHSID, newCenterID];
            }
            if (oldID === newID) {
                return;
            }
            if (newID !== otherID && oldID !== otherID) {
                if (newID !== '') {
                    onChannelAdded(newID);
                }
                if (oldID !== '') {
                    onChannelRemoved(oldID);
                }
            } else if (newID !== otherID && oldID === otherID && newID !== '') {
                onChannelAdded(newID);
            } else if (newID === otherID && oldID !== otherID && oldID !== '') {
                onChannelRemoved(oldID);
            }
        });

        oldCenterID = newCenterID;
        oldRHSID = newRHSID;
    };
})();
