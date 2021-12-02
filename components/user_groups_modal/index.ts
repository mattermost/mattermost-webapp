// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {ActionFunc, ActionResult, GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getAllAssociatedGroupsForReference, getMyAllowReferencedGroups, searchAllowReferencedGroups, searchMyAllowReferencedGroups} from 'mattermost-redux/selectors/entities/groups';
import {addUsersToGroup, archiveGroup, getGroups, getGroupsByUserIdPaginated, removeUsersFromGroup, searchGroups} from 'mattermost-redux/actions/groups';
import {Group, GroupSearachParams} from 'mattermost-redux/types/groups';
import {ModalData} from 'types/actions';
import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {openModal} from 'actions/views/modals';
import {setModalSearchTerm} from 'actions/views/search';

import UserGroupsModal from './user_groups_modal';

type Actions = {
    getGroups: (
        filterAllowReference?: boolean,
        page?: number,
        perPage?: number,
        includeMemberCount?: boolean
    ) => Promise<{data: Group[]}>;
    setModalSearchTerm: (term: string) => void;
    getGroupsByUserIdPaginated: (
        userId: string,
        filterAllowReference?: boolean,
        page?: number,
        perPage?: number,
        includeMemberCount?: boolean
    ) => Promise<{data: Group[]}>;
    openModal: <P>(modalData: ModalData<P>) => void;
    searchGroups: (
        params: GroupSearachParams,
    ) => Promise<{data: Group[]}>;
    removeUsersFromGroup: (groupId: string, userIds: string[]) => Promise<ActionResult>;
    addUsersToGroup: (groupId: string, userIds: string[]) => Promise<ActionResult>;
    archiveGroup: (groupId: string) => Promise<ActionResult>;
};

function mapStateToProps(state: GlobalState) {
    const searchTerm = state.views.search.modalSearch;

    let groups: Group[] = [];
    let myGroups: Group[] = [];
    if (searchTerm) {
        groups = searchAllowReferencedGroups(state, searchTerm);
        myGroups = searchMyAllowReferencedGroups(state, searchTerm);
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
            getGroupsByUserIdPaginated,
            openModal,
            searchGroups,
            removeUsersFromGroup,
            addUsersToGroup,
            archiveGroup,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserGroupsModal);
