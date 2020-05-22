// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {createSelector} from 'reselect';

import {linkLdapGroup, unlinkLdapGroup, getLdapGroups as fetchLdapGroups} from 'mattermost-redux/actions/admin';
import {getLdapGroups, getLdapGroupsCount} from 'mattermost-redux/selectors/entities/admin';

import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';

import GroupsList from './groups_list';

const getSortedListOfLdapGroups = createSelector(
    getLdapGroups,
    (ldapGroups) => {
        const groups = Object.values<any>(ldapGroups);
        groups.sort((a, b) => a.name.localeCompare(b.name));
        return groups;
    },
);

function mapStateToProps(state: GlobalState) {
    return {
        groups: getSortedListOfLdapGroups(state),
        total: getLdapGroupsCount(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, any>({
            getLdapGroups: fetchLdapGroups,
            link: linkLdapGroup,
            unlink: unlinkLdapGroup,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupsList);
