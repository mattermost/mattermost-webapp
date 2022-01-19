// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {combineReducers} from 'redux';

import {BotTypes, UserTypes} from 'mattermost-redux/action_types';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Bot} from 'mattermost-redux/types/bots';

function accounts(state: Record<string, Bot> = {}, action: GenericAction) {
    switch (action.type) {
    case BotTypes.RECEIVED_BOT_ACCOUNTS: {
        const newBots = action.data;
        const nextState = {...state};
        for (const bot of newBots) {
            nextState[bot.user_id] = bot;
        }
        return nextState;
    }
    case BotTypes.RECEIVED_BOT_ACCOUNT: {
        const bot = action.data;
        const nextState = {...state};
        nextState[bot.user_id] = bot;
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({
    accounts,
});
