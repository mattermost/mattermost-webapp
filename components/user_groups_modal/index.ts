// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import UserGroupsModal, {Props} from './user_groups_modal';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getAllAssociatedGroupsForReference, getMyAllowReferencedGroups} from 'mattermost-redux/selectors/entities/groups';
import {getGroups, getGroupsByUserId} from 'mattermost-redux/actions/groups';
import {Group} from 'mattermost-redux/types/groups';
import {ModalData} from 'types/actions';
import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {openModal} from 'actions/views/modals';
import {setModalSearchTerm} from 'actions/views/search';

type Actions = {
    getGroups: (
        filterAllowReference?: boolean, 
        page?: number, 
        perPage?:number, 
        includeMemberCount?: boolean
    ) => Promise<{data: Group[]}>;
    setModalSearchTerm: (term: string) => void;
    getGroupsByUserId: (userId: string) => Promise<{data: Group[]}>;
    openModal: <P>(modalData: ModalData<P>) => void;
};

function mapStateToProps(state: GlobalState) {
    const searchTerm = state.views.search.modalSearch;

    let groups, myGroups: Group[] = [];
    if (searchTerm) {
        // Do some redux search
        // groups = searchProfilesInCurrentChannel(state, searchTerm);
        groups = getAllAssociatedGroupsForReference(state);
        myGroups = getMyAllowReferencedGroups(state);
    } else {
        groups = getAllAssociatedGroupsForReference(state);
        myGroups = getMyAllowReferencedGroups(state);
    }

    return {
        showModal: isModalOpen(state, ModalIdentifiers.USER_GROUPS),
        groups,
        searchTerm,
        myGroups,
        currentUserId: getCurrentUserId(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            getGroups,
            setModalSearchTerm,
            getGroupsByUserId,
            openModal,
            // closeModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserGroupsModal);
