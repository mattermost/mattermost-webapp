// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import {Constants} from 'utils/constants';

import FaviconTitleHandler from 'components/favicon_title_handler/favicon_title_handler';

jest.mock('utils/user_agent', () => {
    const original = require.requireActual('utils/user_agent');
    return {
        ...original,
        isFirefox: () => true,
    };
});

describe('components/FaviconTitleHandler', () => {
    const defaultProps = {
        unreads: {
            messageCount: 0,
            mentionCount: 0,
        },
        siteName: 'Test site',
        currentChannel: {
            id: 'c1',
            display_name: 'Public test 1',
            name: 'public-test-1',
            type: Constants.OPEN_CHANNEL,
        },
        currentTeam: {
            id: 'team_id',
            name: 'test-team',
            display_name: 'Test team display name',
            description: 'Test team description',
            type: 'team-type',
        },
        currentTeammate: null,
    };

    test('set correctly the title when needed', () => {
        const wrapper = shallowWithIntl(
            <FaviconTitleHandler {...defaultProps}/>
        );
        const instance = wrapper.instance();
        instance.updateTitle();
        instance.componentDidUpdate = jest.fn();
        instance.render = jest.fn();
        expect(document.title).toBe('Public test 1 - Test team display name Test site');
        wrapper.setProps({siteName: null});
        instance.updateTitle();
        expect(document.title).toBe('Public test 1 - Test team display name');
        wrapper.setProps({currentChannel: {id: 1, type: Constants.DM_CHANNEL}, currentTeammate: {display_name: 'teammate'}});
        instance.updateTitle();
        expect(document.title).toBe('teammate - Test team display name');
        wrapper.setProps({unreads: {mentionCount: 3, messageCount: 4}});
        instance.updateTitle();
        expect(document.title).toBe('(3) * teammate - Test team display name');
        wrapper.setProps({currentChannel: {}, currentTeammate: {}});
        instance.updateTitle();
        expect(document.title).toBe('Mattermost - Join a team');
    });

    test('should display correct favicon', () => {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.sizes = '16x16';
        document.head.appendChild(link);

        const wrapper = shallowWithIntl(
            <FaviconTitleHandler {...defaultProps}/>
        );
        const instance = wrapper.instance();
        instance.updateFavicon = jest.fn();

        wrapper.setProps({unreads: {mentionCount: 3, messageCount: 4}});
        expect(instance.updateFavicon).lastCalledWith(true);

        wrapper.setProps({unreads: {mentionCount: 0, messageCount: 4}});
        expect(instance.updateFavicon).lastCalledWith(false);
    });
});
