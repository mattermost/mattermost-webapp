// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelView from './channel_view.jsx';

describe('components/ChannelView', () => {
    const props = {
        channelId: 'channelId',
        deactivatedChannel: true,
        match: {
            url: '/team/channels/off-topic',
        },
        showTutorial: false,
        channelIsArchived: false,
        viewArchivedChannels: false,
        actions: {
            goToLastViewedChannel: jest.fn(),
        },
    };
    test('Should have app__body and channel-view classes on body after mount', () => {
        Object.defineProperty(window.navigator, 'platform', {
            value: 'Win32',
            writable: true,
        });
        shallow(<ChannelView {...props}/>);

        expect(document.body.classList.contains('app__body')).toBe(true);
        expect(document.body.classList.contains('channel-view')).toBe(true);
    });

    test('Should have os--windows class on body for windows 32', () => {
        Object.defineProperty(window.navigator, 'platform', {
            value: 'Win32',
            writable: true,
        });
        shallow(<ChannelView {...props}/>);

        expect(document.body.classList.contains('os--windows')).toBe(true);
    });

    test('Should have os--windows class on body for windows 64', () => {
        Object.defineProperty(window.navigator, 'platform', {
            value: 'Win32',
            writable: true,
        });
        shallow(<ChannelView {...props}/>);

        expect(document.body.classList.contains('os--windows')).toBe(true);
    });

    test('Should have os--mac class on body for MacIntel', () => {
        Object.defineProperty(window.navigator, 'platform', {
            value: 'MacIntel',
            writable: true,
        });
        shallow(<ChannelView {...props}/>);

        expect(document.body.classList.contains('os--mac')).toBe(true);
    });

    test('Should have os--mac class on body for MacPPC', () => {
        Object.defineProperty(window.navigator, 'platform', {
            value: 'MacPPC',
            writable: true,
        });
        shallow(<ChannelView {...props}/>);

        expect(document.body.classList.contains('os--mac')).toBe(true);
    });

    test('Should remove app__body and channel-view classes on body on unmount', () => {
        Object.defineProperty(window.navigator, 'platform', {
            value: 'MacPPC',
            writable: true,
        });
        const wrapper = shallow(<ChannelView {...props}/>);

        wrapper.unmount();
        expect(document.body.classList.contains('app__body')).toBe(false);
        expect(document.body.classList.contains('channel-view')).toBe(false);
    });
});
