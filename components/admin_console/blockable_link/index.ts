// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {GenericAction} from 'mattermost-redux/types/actions';

import {deferNavigation} from 'actions/admin_actions';
import {getNavigationBlocked} from 'selectors/views/admin';

import BlockableLink from './blockable_link';

function mapStateToProps(state: object) {
    return {
        blocked: getNavigationBlocked(state)
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            deferNavigation
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BlockableLink);
