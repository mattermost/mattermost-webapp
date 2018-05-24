// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getSchemeTeams as loadSchemeTeams, getSchemes as loadSchemes} from 'mattermost-redux/actions/schemes';
import {getSchemes} from 'mattermost-redux/selectors/entities/schemes';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import PermissionSchemesSettings from './permission_schemes_settings.jsx';

function mapStateToProps(state) {
    const schemes = getSchemes(state);
    const config = getConfig(state);

    return {
        schemes: typeof schemes === 'object' ? [] : schemes,
        jobsAreEnabled: config.RunJobs === 'true',
        clusterIsEnabled: config.EnableCluster === 'true',
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadSchemes,
            loadSchemeTeams,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PermissionSchemesSettings);
