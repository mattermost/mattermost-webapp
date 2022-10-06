// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {getGroupsAssociatedToTeam, unlinkGroupSyncable, patchGroupSyncable} from 'mattermost-redux/actions/groups';
import {getMyTeamMembers} from 'mattermost-redux/actions/teams';

import {closeModal, openModal} from 'actions/views/modals';

import {GlobalState} from '@mattermost/types/store';
import {Action} from 'mattermost-redux/types/actions';
import {Group, SyncablePatch, SyncableType} from '@mattermost/types/groups';
import {TeamMembership} from '@mattermost/types/teams';

import {ModalData} from 'types/actions';

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
    closeModal: (modalId: string) => void;
    openModal: <P>(modalData: ModalData<P>) => void;
    unlinkGroupSyncable: (groupID: string, syncableID: string, syncableType: SyncableType) => Promise<{
        data: boolean;
    }>;
    patchGroupSyncable: (groupID: string, syncableID: string, syncableType: SyncableType, patch: Partial<SyncablePatch>) => Promise<{
        data: boolean;
    }>;
    getMyTeamMembers: () => Promise<{
        data: TeamMembership[];
    }>;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
        getGroupsAssociatedToTeam,
        closeModal,
        openModal,
        unlinkGroupSyncable,
        patchGroupSyncable,
        getMyTeamMembers,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TeamGroupsManageModal);
