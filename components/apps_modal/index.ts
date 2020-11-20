// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {AppCall, AppCallResponse, AppModalState} from 'mattermost-redux/types/apps';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {doAppCall} from 'actions/apps';
import {getEmojiMap} from 'selectors/emojis';

import AppsModal from './apps_modal';

type Actions = {
    doAppCall: (call: AppCall) => Promise<{data: AppCallResponse}>
};

function mapStateToProps(state: GlobalState, ownProps: {modal?: AppModalState, postID?: string}) {
    let postID: string | undefined;
    let channelID: string | undefined;
    let teamID: string | undefined;

    if (ownProps.postID) {
        const post = getPost(state, ownProps.postID);
        postID = post.id;
        channelID = post.channel_id;
        teamID = getCurrentTeam(state).id;
    }

    const emojiMap = getEmojiMap(state);
    if (!ownProps.modal) {
        return {emojiMap};
    }

    return {
        modal: ownProps.modal,
        emojiMap,
        postID,
        channelID,
        teamID,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            doAppCall,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppsModal);
