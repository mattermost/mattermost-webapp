// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {createSelector} from 'reselect';

import {linkLdapGroup, unlinkLdapGroup, getLdapGroups as fetchLdapGroups} from 'mattermost-redux/actions/admin';
import {getLdapGroups, getLdapGroupsCount} from 'mattermost-redux/selectors/entities/admin';

import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {GroupSearchOpts} from 'mattermost-redux/types/groups';

import GroupsList from './groups_list';

type Actions = {
    getLdapGroups: (page?: number, perPage?: number, opts?: GroupSearchOpts) => Promise<{}>;
    linkLdapGroup: (key: string) => Promise<{}>;
    unlinkLdapGroup: (key: string) => Promise<{}>;
}

const getSortedListOfLdapGroups = createSelector(
    getLdapGroups,
    (ldapGroups) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const groups: any[] = Object.values(ldapGroups);
        groups.sort((a, b) => a.name.localeCompare(b.name));
        return groups;
    }
);

function mapStateToProps(state: GlobalState) {
    return {
        groups: getSortedListOfLdapGroups(state),
        total: getLdapGroupsCount(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getLdapGroups: fetchLdapGroups,
            link: linkLdapGroup,
            unlink: unlinkLdapGroup,
        }, dispatch),
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default connect(mapStateToProps, mapDispatchToProps)(GroupsList as any);
