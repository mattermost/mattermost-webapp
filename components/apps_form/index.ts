// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {DoAppCall, PostEphemeralCallResponseForContext} from 'types/apps';

import {doAppCall, postEphemeralCallResponseForContext} from 'actions/apps';

import AppsFormContainer from './apps_form_container';

type Actions = {
    doAppCall: DoAppCall<any>;
    postEphemeralCallResponseForContext: PostEphemeralCallResponseForContext;
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            doAppCall,
            postEphemeralCallResponseForContext,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(AppsFormContainer);
