// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {GlobalState} from 'mattermost-redux/types/store';

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {ActionFunc, ActionResult, GenericAction} from 'mattermost-redux/types/actions';
import {AppCall} from 'mattermost-redux/types/apps';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {doAppCall} from 'actions/apps';

import ButtonBinding from './button_binding';

function mapStateToProps(state: GlobalState) {
    return {
        userId: getCurrentUserId(state),
    };
}

type Actions = {
    doAppCall: (call: AppCall) => Promise<ActionResult>;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            doAppCall,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ButtonBinding);
