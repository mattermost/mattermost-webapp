// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import TestHelper from 'tests/helpers/client-test-helper';

import Bot from './bot.jsx';
import Bots from './bots.jsx';

describe('components/integrations/bots/Bots', () => {
    const team = TestHelper.fakeTeam();
    const actions = {
        loadBots: jest.fn().mockReturnValue(Promise.resolve({})),
        getUserAccessTokensForUser: jest.fn(),
        createUserAccessToken: jest.fn(),
        revokeUserAccessToken: jest.fn(),
        enableUserAccessToken: jest.fn(),
        disableUserAccessToken: jest.fn(),
        getUser: jest.fn(),
        disableBot: jest.fn(),
        enableBot: jest.fn(),
    };

    it('bots', () => {
        const bot1 = TestHelper.fakeBot();
        const bot2 = TestHelper.fakeBot();
        const bot3 = TestHelper.fakeBot();
        const bots = {
            [bot1.user_id]: bot1,
            [bot2.user_id]: bot2,
            [bot3.user_id]: bot3,
        };
        const users = {
            [bot1.user_id]: {id: bot1.user_id},
            [bot2.user_id]: {id: bot2.user_id},
            [bot3.user_id]: {id: bot3.user_id},
        };
        const wrapperFull = shallow(
            <Bots
                bots={bots}
                team={team}
                accessTokens={{}}
                owners={{}}
                users={users}
                actions={actions}
            />,
        );
        wrapperFull.instance().setState({loading: false});
        const wrapper = shallow(<div>{wrapperFull.instance().bots()[0]}</div>);

        expect(wrapper.find('EnabledSection').shallow().contains(
            <Bot
                key={bot1.user_id}
                bot={bot1}
                owner={undefined}
                user={users[bot1.user_id]}
                accessTokens={{}}
                team={team}
                actions={actions}
            />,
        )).toEqual(true);
        expect(wrapper.find('EnabledSection').shallow().contains(
            <Bot
                key={bot2.user_id}
                bot={bot2}
                owner={undefined}
                user={users[bot2.user_id]}
                accessTokens={{}}
                team={team}
                actions={actions}
            />,
        )).toEqual(true);
        expect(wrapper.find('EnabledSection').shallow().contains(
            <Bot
                key={bot3.user_id}
                bot={bot3}
                owner={undefined}
                user={users[bot3.user_id]}
                accessTokens={{}}
                team={team}
                actions={actions}
            />,
        )).toEqual(true);
    });

    it('bot owner tokens', () => {
        const bot1 = TestHelper.fakeBot();
        const bots = {
            [bot1.user_id]: bot1,
        };

        const owner = {
            user_id: 'owner',
        };

        const user = {
            id: bot1.user_id,
        };

        const passedTokens = {
            id: 'token',
        };

        const owners = {
            [bot1.user_id]: owner,
        };

        const users = {
            [bot1.user_id]: user,
        };

        const tokens = {
            [bot1.user_id]: passedTokens,
        };

        const wrapperFull = shallow(
            <Bots
                bots={bots}
                team={team}
                accessTokens={tokens}
                owners={owners}
                users={users}
                actions={actions}
            />,
        );
        wrapperFull.instance().setState({loading: false});
        const wrapper = shallow(<div>{wrapperFull.instance().bots()[0]}</div>);

        expect(wrapper.find('EnabledSection').shallow().contains(
            <Bot
                key={bot1.user_id}
                bot={bot1}
                owner={owner}
                user={user}
                accessTokens={passedTokens}
                team={team}
                actions={actions}
            />,
        )).toEqual(true);
    });
});
