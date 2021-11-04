// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {deleteScheme} from 'mattermost-redux/actions/schemes';

import {makeGetSchemeTeams} from 'mattermost-redux/selectors/entities/schemes';

import {GlobalState} from 'types/store';

import PermissionsSchemeSummary, {Props} from './permissions_scheme_summary';

function makeMapStateToProps() {
    const getSchemeTeams = makeGetSchemeTeams();

    return function mapStateToProps(state: GlobalState, ownProps: Props) {
        return {
            teams: getSchemeTeams(state, {schemeId: ownProps.scheme.id}),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            deleteScheme,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PermissionsSchemeSummary as any);
