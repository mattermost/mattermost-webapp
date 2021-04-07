// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {DoAppCall} from 'mattermost-redux/types/apps';

import {doAppCall} from 'actions/apps';

import AppsFormContainer from './apps_form_container';

type Actions = {
    doAppCall: DoAppCall;
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            doAppCall,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(AppsFormContainer);
