// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {deleteScheme} from 'mattermost-redux/actions/schemes';

import {makeGetSchemeTeams} from 'mattermost-redux/selectors/entities/schemes';

import PermissionsSchemeSummary from './permissions_scheme_summary.jsx';

function makeMapStateToProps() {
    const getSchemeTeams = makeGetSchemeTeams();

    return function mapStateToProps(state, ownProps) {
        return {
            teams: getSchemeTeams(state, {schemeId: ownProps.scheme.id}),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            deleteScheme,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PermissionsSchemeSummary);
