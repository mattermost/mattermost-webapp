// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getSchemeTeams as loadSchemeTeams, getSchemes as loadSchemes} from 'mattermost-redux/actions/schemes';
import {getSchemes} from 'mattermost-redux/selectors/entities/schemes';

import PermissionSchemesSettings from './permission_schemes_settings.jsx';

function mapStateToProps(state) {
    return {
        schemes: getSchemes(state),
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
