// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {FormattedMessage} from 'react-intl';

import Markdown from 'components/markdown';

import TestHelper from 'tests/helpers/client-test-helper';

import Bot from './bot.jsx';

describe('components/integrations/bots/Bot', () => {
    const team = TestHelper.fakeTeam();

    it('regular bot', () => {
        const bot = TestHelper.fakeBot();
        const user = {
            id: bot.user_id,
        };
        const wrapper = shallow(
            <Bot
                bot={bot}
                user={user}
                owner={null}
                accessTokens={{}}
                team={team}
            />,
        );

        expect(wrapper.contains(bot.display_name + ' (@' + bot.username + ')')).toEqual(true);
        expect(wrapper.contains(<Markdown message={bot.description}/>)).toEqual(true);
        expect(wrapper.contains('plugin')).toEqual(true);

        // if bot managed by plugin, remove ability to edit from UI
        expect(wrapper.contains(
            <FormattedMessage
                id='bot.manage.create_token'
                defaultMessage='Create New Token'
            />,
        )).toEqual(false);
        expect(wrapper.contains(
            <FormattedMessage
                id='bots.manage.edit'
                defaultMessage='Edit'
            />,
        )).toEqual(false);
        expect(wrapper.contains(
            <FormattedMessage
                id='bot.manage.disable'
                defaultMessage='Disable'
            />,
        )).toEqual(false);
        expect(wrapper.contains(
            <FormattedMessage
                id='bot.manage.enable'
                defaultMessage='Enable'
            />,
        )).toEqual(false);
    });

    it('disabled bot', () => {
        const bot = TestHelper.fakeBot();
        bot.delete_at = 100; // disabled
        const user = {
            id: bot.user_id,
        };
        const wrapper = shallow(
            <Bot
                bot={bot}
                user={user}
                owner={null}
                accessTokens={{}}
                team={team}
            />,
        );
        expect(wrapper.contains(bot.display_name + ' (@' + bot.username + ')')).toEqual(true);
        expect(wrapper.contains(<Markdown message={bot.description}/>)).toEqual(true);
        expect(wrapper.contains('plugin')).toEqual(true);
        expect(wrapper.contains(
            <FormattedMessage
                id='bot.manage.create_token'
                defaultMessage='Create New Token'
            />,
        )).toEqual(false);
        expect(wrapper.contains(
            <FormattedMessage
                id='bots.manage.edit'
                defaultMessage='Edit'
            />,
        )).toEqual(false);
        expect(wrapper.contains(
            <FormattedMessage
                id='bot.manage.disable'
                defaultMessage='Disable'
            />,
        )).toEqual(false);
        expect(wrapper.contains(
            <FormattedMessage
                id='bot.manage.enable'
                defaultMessage='Enable'
            />,
        )).toEqual(true);
    });

    it('bot with owner', () => {
        const bot = TestHelper.fakeBot();
        const owner = TestHelper.fakeUser();
        const user = {
            id: bot.user_id,
        };
        const wrapper = shallow(
            <Bot
                bot={bot}
                owner={owner}
                user={user}
                accessTokens={{}}
                team={team}
            />,
        );
        expect(wrapper.contains(owner.username)).toEqual(true);
        expect(wrapper.contains('plugin')).toEqual(false);

        // if bot is not managed by plugin, ability to edit from UI is retained
        expect(wrapper.contains(
            <FormattedMessage
                id='bot.manage.create_token'
                defaultMessage='Create New Token'
            />,
        )).toEqual(true);
        expect(wrapper.contains(
            <FormattedMessage
                id='bots.manage.edit'
                defaultMessage='Edit'
            />,
        )).toEqual(true);
        expect(wrapper.contains(
            <FormattedMessage
                id='bot.manage.disable'
                defaultMessage='Disable'
            />,
        )).toEqual(true);
    });

    it('bot with access tokens', () => {
        const bot = TestHelper.fakeBot();
        const tokenId = TestHelper.generateId();
        const user = {
            id: bot.user_id,
        };
        const accessTokens = {
            tokenId: {
                id: tokenId,
                user_id: bot.user_id,
                description: 'tokendesc1',
                is_active: true,
            },
        };

        const wrapper = shallow(
            <Bot
                bot={bot}
                owner={null}
                user={user}
                accessTokens={accessTokens}
                team={team}
            />,
        );

        expect(wrapper.contains(tokenId)).toEqual(true);
        expect(wrapper.contains(
            <FormattedMessage
                id='user.settings.tokens.deactivate'
                defaultMessage='Disable'
            />,
        )).toEqual(true);
        expect(wrapper.contains(
            <FormattedMessage
                id='user.settings.tokens.activate'
                defaultMessage='Enable'
            />,
        )).toEqual(false);
    });

    it('bot with disabled access tokens', () => {
        const bot = TestHelper.fakeBot();
        const tokenId = TestHelper.generateId();
        const user = {
            id: bot.user_id,
        };

        const accessTokens = {
            tokenId: {
                id: tokenId,
                user_id: bot.user_id,
                description: 'tokendesc1',
                is_active: false,
            },
        };

        const wrapper = shallow(
            <Bot
                bot={bot}
                owner={null}
                user={user}
                accessTokens={accessTokens}
                team={team}
            />,
        );

        expect(wrapper.contains(tokenId)).toEqual(true);
        expect(wrapper.contains(
            <FormattedMessage
                id='user.settings.tokens.deactivate'
                defaultMessage='Disable'
            />,
        )).toEqual(false);
        expect(wrapper.contains(
            <FormattedMessage
                id='user.settings.tokens.activate'
                defaultMessage='Enable'
            />,
        )).toEqual(true);
    });
});
