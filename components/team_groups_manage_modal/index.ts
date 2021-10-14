// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {getGroupsAssociatedToTeam, unlinkGroupSyncable, patchGroupSyncable} from 'mattermost-redux/actions/groups';
import {getMyTeamMembers} from 'mattermost-redux/actions/teams';

import {closeModal, openModal} from 'actions/views/modals';

import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {Group, SyncablePatch, SyncableType} from 'mattermost-redux/types/groups';
import {TeamMembership} from 'mattermost-redux/types/teams';

import TeamGroupsManageModal from './team_groups_manage_modal';

type OwnProps = {
    teamID: string;
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    return {
        team: state.entities.teams.teams[ownProps.teamID],
    };
};

type Actions = {
    getGroupsAssociatedToTeam: (teamID: string, q: string, page: number, perPage: number, filterAllowReference: boolean) => Promise<{
        data: {
            groups: Group[];
            totalGroupCount: number;
            teamID: string;
        };
    }>;
    closeModal: (modalId: string) => Promise<{
        data: boolean;
    }>;
    openModal: (params: {modalId: any; dialogType: any}) => Promise<{
        data: boolean;
    }>;
    unlinkGroupSyncable: (groupID: string, syncableID: string, syncableType: SyncableType) => Promise<{
        data: boolean;
    }>;
    patchGroupSyncable: (groupID: string, syncableID: string, syncableType: SyncableType, patch: SyncablePatch) => Promise<{
        data: boolean;
    }>;
    getMyTeamMembers: () => Promise<{
        data: TeamMembership[];
    }>;
}

const mapDispatchToProps = (dispatch: Dispatch<GenericAction>) => ({
    actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
        getGroupsAssociatedToTeam,
        closeModal,
        openModal,
        unlinkGroupSyncable,
        patchGroupSyncable,
        getMyTeamMembers,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TeamGroupsManageModal);
