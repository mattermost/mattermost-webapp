// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {ActionResult, GenericAction} from 'mattermost-redux/types/actions';

import {getChannel} from 'mattermost-redux/actions/channels';

import {DoAppCall, PostEphemeralCallResponseForPost} from 'types/apps';

import {doAppCall, openAppsModal, postEphemeralCallResponseForPost} from 'actions/apps';

import {AppCallRequest, AppForm} from 'mattermost-redux/types/apps';

import SelectBinding from './select_binding';

type Actions = {
    doAppCall: DoAppCall;
    getChannel: (channelId: string) => Promise<ActionResult>;
    postEphemeralCallResponseForPost: PostEphemeralCallResponseForPost;
    openAppsModal: (form: AppForm, call: AppCallRequest) => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, Actions>({
            doAppCall,
            getChannel,
            postEphemeralCallResponseForPost,
            openAppsModal,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(SelectBinding);
