// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {GenericAction, ActionFunc, ActionResult} from 'mattermost-redux/types/actions';
import {Role} from 'mattermost-redux/types/roles';
import {updateUserRoles} from 'mattermost-redux/actions/users';
import {editRole} from 'mattermost-redux/actions/roles';
import {getRolesById} from 'mattermost-redux/selectors/entities/roles';

import {GlobalState} from 'types/store';
import {setNavigationBlocked} from 'actions/admin_actions.jsx';

import SystemRole from './system_role';

type Props = {
    match: {
        params: {
            role_id: string;
        };
    };
}

type Actions = {
    editRole(role: Role): Promise<ActionResult>;
    updateUserRoles(userId: string, roles: string): Promise<ActionResult>;
    setNavigationBlocked: (blocked: boolean) => void,
}

function mapStateToProps(state: GlobalState, props: Props) {
    const role = getRolesById(state)[props.match.params.role_id];
    return {
        role,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            editRole,
            updateUserRoles,
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemRole);
