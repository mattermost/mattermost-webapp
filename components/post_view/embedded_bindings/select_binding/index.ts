// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {ActionFunc, ActionResult, GenericAction} from 'mattermost-redux/types/actions';

import {AppCallRequest, AppCallType} from 'mattermost-redux/types/apps';

import {getChannel} from 'mattermost-redux/actions/channels';

import {doAppCall} from 'actions/apps';
import {sendEphemeralPost} from 'actions/global_actions';

import SelectBinding from './select_binding';

type Actions = {
    doAppCall: (call: AppCallRequest, type: AppCallType) => Promise<ActionResult>;
    getChannel: (channelId: string) => Promise<ActionResult>;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            doAppCall,
            getChannel,
        }, dispatch),
        sendEphemeralPost,
    };
}

export default connect(null, mapDispatchToProps)(SelectBinding);
