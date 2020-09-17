// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Role} from 'mattermost-redux/types/roles';
import {UserProfile} from 'mattermost-redux/types/users';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {getProfiles, searchProfiles} from 'mattermost-redux/actions/users';

import {getProfiles as selectProfiles} from 'mattermost-redux/selectors/entities/users';

import AddUsersToRoleModal from './add_users_to_role_modal';

type Props = {
    role: Role;
};

type Actions = {
    getProfiles: (page: number, perPage?: number, options?: {[key: string]: any}) => Promise<{ data: UserProfile[] }>;
    searchProfiles: (term: string, options?: any) => Promise<{ data: UserProfile[] }>;
};

function mapStateToProps(state: GlobalState, props: Props) {
    const filterOptions: {[key: string]: any} = {active: true, roles: ['system_user'], exclude_roles: [props.role.name]};

    const users: UserProfile[] = selectProfiles(state, filterOptions);

    return {
        users,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getProfiles,
            searchProfiles,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddUsersToRoleModal);
