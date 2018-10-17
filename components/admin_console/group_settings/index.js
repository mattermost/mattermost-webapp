// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';

import {linkLdapGroup, unlinkLdapGroup, getLdapGroups as fetchLdapGroups} from 'mattermost-redux/actions/admin';
import {getLdapGroups} from 'mattermost-redux/selectors/entities/admin';

import GroupSettings from './group_settings.jsx';

const getSortedListOfLdapGroups = createSelector(
    getLdapGroups,
    (ldapGroups) => {
        const groups = Object.values(ldapGroups);
        groups.sort((a, b) => a.name.localeCompare(b.name));
        return groups;
    }
);

function mapStateToProps(state) {
    return {
        ldapGroups: getSortedListOfLdapGroups(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getLdapGroups: fetchLdapGroups,
            link: linkLdapGroup,
            unlink: unlinkLdapGroup,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupSettings);
