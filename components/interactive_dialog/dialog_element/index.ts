// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {autocompleteChannels} from 'actions/channel_actions';
import {autocompleteUsers} from 'actions/user_actions';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {UserProfile} from 'mattermost-redux/types/users';

import {Channel} from 'mattermost-redux/types/channels';

import DialogElement from './dialog_element';

type Actions = {
    autocompleteChannels: (term: string, success: (channels: Channel[]) => void, error: () => void) => Promise<void>;
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

export default connect(null, mapDispatchToProps)(DialogElement);
