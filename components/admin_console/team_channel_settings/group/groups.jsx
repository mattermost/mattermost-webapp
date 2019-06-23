// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getGroupsAssociatedToTeam as fetchAssociatedGroupsForTeam, getGroupsAssociatedToChannel as fetchAssociatedGroupsForChannel, unlinkGroupSyncable} from 'mattermost-redux/actions/groups';
import {getGroupsAssociatedToTeam, getAllGroups, getGroupsAssociatedToChannel} from 'mattermost-redux/selectors/entities/groups';

import {createSelector} from 'reselect';

import {Groups} from 'mattermost-redux/constants';

import {t} from 'utils/i18n';

import {setNavigationBlocked} from 'actions/admin_actions';

import List from './group_list.jsx';

const getSortedListOfGroupsForTeam = createSelector(
    getGroupsAssociatedToTeam,
    getAllGroups,
    (result) => ({groups: result.sort((a, b) => a.name.localeCompare(b.name)), total: 100})
);

const getSortedListOfGroupsForChannel = createSelector(
    getGroupsAssociatedToChannel,
    getAllGroups,
    (result) => ({groups: result.sort((a, b) => a.name.localeCompare(b.name)), total: 100})
);

function mapStateToProps(state, {team, channel, isModeSync}) {
    const data = team ? getSortedListOfGroupsForTeam(state, team.id) : getSortedListOfGroupsForChannel(state, channel.id);

    return {
        data: data.groups,
        emptyListTextId: isModeSync ? t('admin.team_settings.group_list.no-synced-groups') : t('admin.team_settings.group_list.no-groups'),
        emptyListTextDefaultMessage: isModeSync ? 'At least one group must be specified' : 'No groups specified yet',
        total: data.total,
    };
}

function mapDispatchToProps(dispatch, {team, channel}) {
    return {
        actions: bindActionCreators({
            getData: (page, pageSize) => {
                // eslint-disable-next-line no-undefined
                return team ? fetchAssociatedGroupsForTeam(team.id, undefined, page, pageSize) : fetchAssociatedGroupsForChannel(channel.id, undefined, page, pageSize);
            },
            removeGroup: (id) => {
                return unlinkGroupSyncable(id, team ? team.id : channel.id, team ? Groups.SYNCABLE_TYPE_TEAM : Groups.SYNCABLE_TYPE_CHANNEL);
            },
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(List);

