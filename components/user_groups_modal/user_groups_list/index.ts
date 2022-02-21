// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {ActionFunc, ActionResult, GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {archiveGroup} from 'mattermost-redux/actions/groups';
import {Group, GroupPermissions} from 'mattermost-redux/types/groups';
import {ModalData} from 'types/actions';
import {Permissions} from 'mattermost-redux/constants';
import {openModal} from 'actions/views/modals';
import {haveIGroupPermission} from 'mattermost-redux/selectors/entities/roles';

import UserGroupsList from './user_groups_list';

type Actions = {
    openModal: <P>(modalData: ModalData<P>) => void;
    archiveGroup: (groupId: string) => Promise<ActionResult>;
};

type Props = {
    groups: Group[];
};

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const groupPermissionsMap: Record<string, GroupPermissions> = {};
    [...ownProps.groups].forEach((g) => {
        groupPermissionsMap[g.id] = {
            can_delete: haveIGroupPermission(state, g.id, Permissions.DELETE_CUSTOM_GROUP),
            can_manage_members: haveIGroupPermission(state, g.id, Permissions.MANAGE_CUSTOM_GROUP_MEMBERS),
        };
    });

    return {
        groupPermissionsMap,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            openModal,
            archiveGroup,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(UserGroupsList);
