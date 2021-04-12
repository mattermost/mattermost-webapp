// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'mattermost-redux/types/store';

import {autocompleteChannels} from 'actions/channel_actions';
import {autocompleteUsers} from 'actions/user_actions';

import AppsFormField from './apps_form_field';

function mapStateToProps(state: GlobalState) {
    return {
        teammateNameDisplay: getTeammateNameDisplaySetting(state),
    };
}
type Actions = {
    autocompleteChannels: (term: string, success: (channels: Channel[]) => void, error: () => void) => (dispatch: any, getState: any) => Promise<void>;
    autocompleteUsers: (search: string) => Promise<UserProfile[]>;
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            autocompleteChannels,
            autocompleteUsers,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppsFormField);
