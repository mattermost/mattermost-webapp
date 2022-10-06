// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';

import {autocompleteChannels} from 'actions/channel_actions';

import {autocompleteUsers} from 'actions/user_actions';

import {Channel} from '@mattermost/types/channels';
import {UserProfile} from '@mattermost/types/users';

import {GlobalState} from '@mattermost/types/store';

import {ServerError} from '@mattermost/types/errors';

import AppsFormField from './apps_form_field';

function mapStateToProps(state: GlobalState) {
    return {
        teammateNameDisplay: getTeammateNameDisplaySetting(state),
    };
}
type Actions = {
    autocompleteChannels: (term: string, success: (channels: Channel[]) => void, error: (err: ServerError) => void) => ActionFunc;
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
