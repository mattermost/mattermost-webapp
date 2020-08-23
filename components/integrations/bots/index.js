// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getExternalBotAccounts} from 'mattermost-redux/selectors/entities/bots';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {loadBots, disableBot, enableBot} from 'mattermost-redux/actions/bots';
import {createUserAccessToken, revokeUserAccessToken, enableUserAccessToken, disableUserAccessToken, getUserAccessTokensForUser, getUser} from 'mattermost-redux/actions/users';
import * as UserSelectors from 'mattermost-redux/selectors/entities/users';

import Bots from './bots.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const createBots = config.EnableBotAccountCreation === 'true';
    const bots = getExternalBotAccounts(state);
    const botValues = Object.values(bots);
    const owners = botValues.
        reduce((result, bot) => {
            result[bot.user_id] = UserSelectors.getUser(state, bot.owner_id);
            return result;
        }, {});
    const users = botValues.
        reduce((result, bot) => {
            result[bot.user_id] = UserSelectors.getUser(state, bot.user_id);
            return result;
        }, {});

    return {
        createBots,
        bots,
        accessTokens: state.entities.admin.userAccessTokensByUser,
        owners,
        users,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadBots,
            getUserAccessTokensForUser,
            createUserAccessToken,
            revokeUserAccessToken,
            enableUserAccessToken,
            disableUserAccessToken,
            getUser,
            disableBot,
            enableBot,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Bots);
