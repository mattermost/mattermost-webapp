// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {DoAppSubmit, DoAppFetchForm, DoAppLookup, PostEphemeralCallResponseForContext} from 'types/apps';

import {doAppSubmit, doAppFetchForm, doAppLookup, postEphemeralCallResponseForContext} from 'actions/apps';

import AppsFormContainer from './apps_form_container';

type Actions = {
    doAppSubmit: DoAppSubmit<any>;
    doAppFetchForm: DoAppFetchForm<any>;
    doAppLookup: DoAppLookup<any>;
    postEphemeralCallResponseForContext: PostEphemeralCallResponseForContext;
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            doAppSubmit,
            doAppFetchForm,
            doAppLookup,
            postEphemeralCallResponseForContext,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(AppsFormContainer);
