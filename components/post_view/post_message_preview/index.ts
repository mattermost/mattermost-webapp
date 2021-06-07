// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';
import PostMessagePreview from './post_message_preview';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import { getChannel } from 'mattermost-redux/selectors/entities/channels';
import { PostPreviewMetadata } from 'mattermost-redux/types/posts';

type Props = {
    userId: string;
    metadata: PostPreviewMetadata;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const user = getUser(state, ownProps.userId);
    const channel = getChannel(state, ownProps.metadata.channel_id);

    return {
        user,
        channel,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostMessagePreview);