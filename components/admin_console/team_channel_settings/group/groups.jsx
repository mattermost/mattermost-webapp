// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getGroupsAssociatedToTeam as fetchAssociatedGroups} from 'mattermost-redux/actions/groups';
import {getGroupsAssociatedToTeam, getAllGroups} from 'mattermost-redux/selectors/entities/groups';

import {createSelector} from 'reselect';

import {t} from 'utils/i18n';

import List from './group_list.jsx';

const getSortedListOfGroups = createSelector(
    getGroupsAssociatedToTeam,
    getAllGroups,
    (result, allGroups) => {
        const groups = Object.values(allGroups).filter((g) => result.indexOf(g.id) !== -1);
        groups.sort((a, b) => a.name.localeCompare(b.name));
        return {groups, total: 100};
    }
);

function mapStateToProps(state, {team, isModeSync}) {
    const data = getSortedListOfGroups(state, team.id);

    return {
        data: data.groups,
        emptyListTextId: isModeSync ? t('admin.team_settings.group_list.no-synced-groups') : t('admin.team_settings.group_list.no-groups'),
        emptyListTextDefaultMessage: isModeSync ? 'At least one group must be specified' : 'No groups specified yet',
        total: data.total,
    };
}

function mapDispatchToProps(dispatch, {team}) {
    return {
        actions: bindActionCreators({
            getData: (page, pageSize) => {
                // eslint-disable-next-line no-undefined
                return fetchAssociatedGroups(team.id, undefined, page, pageSize);
            },
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(List);

