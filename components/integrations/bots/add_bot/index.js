// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {updateUserRoles, uploadProfileImage, setDefaultProfileImage, createUserAccessToken} from 'mattermost-redux/actions/users';
import {createBot, patchBot} from 'mattermost-redux/actions/bots';
import {getBotAccounts} from 'mattermost-redux/selectors/entities/bots';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getUsers} from 'mattermost-redux/selectors/entities/common';
import {haveISystemPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

import AddBot from './add_bot.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const botId = (new URLSearchParams(ownProps.location.search)).get('id');
    const bots = getBotAccounts(state);
    const bot = bots ? bots[botId] : null;
    const user = bot ? getUsers(state)[bot.user_id] : null;
    const roles = user ? user.roles : null;
    return {
        maxFileSize: parseInt(config.MaxFileSize, 10),
        bot,
        roles,
        editingUserHasManageSystem: haveISystemPermission(state, {permission: Permissions.MANAGE_SYSTEM}),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            createBot,
            patchBot,
            uploadProfileImage,
            setDefaultProfileImage,
            createUserAccessToken,
            updateUserRoles,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddBot);
