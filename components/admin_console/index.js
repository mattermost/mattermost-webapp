// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/actions/admin';
import * as Selectors from 'mattermost-redux/selectors/entities/admin';
import {withRouter} from 'react-router-dom';

import {setNavigationBlocked, deferNavigation, cancelNavigation, confirmNavigation} from 'actions/admin_actions.jsx';
import {getNavigationBlocked, showNavigationPrompt} from 'selectors/views/admin';

import AdminConsole from './admin_console.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        config: Selectors.getConfig(state),
        license: state.entities.general.license,
        navigationBlocked: getNavigationBlocked(state),
        showNavigationPrompt: showNavigationPrompt(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getConfig,
            setNavigationBlocked,
            deferNavigation,
            cancelNavigation,
            confirmNavigation
        }, dispatch)
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AdminConsole));
