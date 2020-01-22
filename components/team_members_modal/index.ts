// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {openModal} from 'actions/views/modals';

import TeamMembersModal from './team_members_modal';

type Actions = {
    openModal: (modalData: {modalId: string; dialogType: React.Component }) => Promise<{
        data: boolean;
    }>;
}

function mapStateToProps(state: GlobalState) {
    const modalId = ModalIdentifiers.TEAM_MEMBERS;
    return {
        currentTeam: getCurrentTeam(state),
        show: isModalOpen(state, modalId),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamMembersModal);
