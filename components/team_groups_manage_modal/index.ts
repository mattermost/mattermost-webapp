// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {getGroupsAssociatedToTeam, unlinkGroupSyncable, patchGroupSyncable} from 'mattermost-redux/actions/groups';
import {getMyTeamMembers} from 'mattermost-redux/actions/teams';

import {closeModal, openModal} from 'actions/views/modals';

import {GlobalState} from 'mattermost-redux/types/store';
import {Action, GenericAction} from 'mattermost-redux/types/actions';
import {Group, SyncablePatch, SyncableType} from 'mattermost-redux/types/groups';
import {Team, TeamMembership} from 'mattermost-redux/types/teams';

import {ModalData} from 'types/actions';

import TeamGroupsManageModal from './team_groups_manage_modal';

type OwnProps = {
    teamID: string;
};

type StateProps = {
    team: Team;
};

type DispatchProps = {
    actions: {
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
    };
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    return {
        team: state.entities.teams.teams[ownProps.teamID],
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GenericAction>) => ({
    actions: bindActionCreators<ActionCreatorsMapObject<Action>, DispatchProps['actions']>({
        getGroupsAssociatedToTeam,
        closeModal,
        openModal,
        unlinkGroupSyncable,
        patchGroupSyncable,
        getMyTeamMembers,
    }, dispatch),
});

export type Props = OwnProps & StateProps & DispatchProps;

export default connect<StateProps, DispatchProps, OwnProps, GlobalState>(mapStateToProps, mapDispatchToProps)(TeamGroupsManageModal);
