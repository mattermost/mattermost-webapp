// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getUserIdsInChannels} from 'mattermost-redux/selectors/entities/users';
import {Constants} from 'utils/constants';

import {Channel} from 'mattermost-redux/types/channels';
import {GlobalState} from 'types/store';

import DraftTitle from './draft_title';

type OwnProps = {
    channel: Channel;
    userId: string;
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const {channel, userId} = ownProps;

    const channelName = channel.display_name;
    let teammateId;
    let teammate;
    let membersCount;

    if (channel.type === Constants.GM_CHANNEL) {
        const memberIds = getUserIdsInChannels(state);

        membersCount = 0;
        if (memberIds && memberIds[channel.id]) {
            const groupMemberIds: Set<string> = memberIds[channel.id] as unknown as Set<string>;
            membersCount = groupMemberIds.size;
            if (groupMemberIds.has(userId)) {
                membersCount--;
            }
        }

        if (membersCount === 0) {
            membersCount = channelName.split(',').length;
        }
    }

    return {
        channelName,
        membersCount,
        selfDraft: teammateId === userId,
        teammate,
        teammateId,
    };
}
export default connect(mapStateToProps)(DraftTitle);
