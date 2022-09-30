// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {autocompleteUsersInTeam} from 'actions/user_actions';

import {GenericAction} from 'mattermost-redux/types/actions';

import CommandPaletteModal from './command_palette_modal';

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            autocompleteUsersInTeam,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(CommandPaletteModal);
