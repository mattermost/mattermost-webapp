// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {getYoutubeVideoInfo} from 'actions/integration_actions';

import YoutubeVideo from './youtube_video';

jest.mock('actions/integration_actions');

describe('YoutubeVideo', () => {
    const baseProps = {
        channelId: 'channelid',
        currentChannelId: 'currentchannelid',
        googleDeveloperKey: 'googledevkey',
        hasImageProxy: false,
        link: 'https://www.youtube.com/watch?v=xqCoNej8Zxo',
        show: true,
    };

    test('should correctly parse youtube start time formats', () => {
        for (const youtube of [
            {
                link: 'https://www.youtube.com/watch?time_continue=490&v=xqCoNej8Zxo',
                time: '&start=490',
            },
            {
                link: 'https://www.youtube.com/watch?start=490&v=xqCoNej8Zxo',
                time: '&start=490',
            },
            {
                link: 'https://www.youtube.com/watch?t=490&v=xqCoNej8Zxo',
                time: '&start=490',
            },
        ]) {
            const wrapper = shallow(<YoutubeVideo {...baseProps}/>);

            expect(wrapper.instance().handleYoutubeTime(youtube.link)).toEqual(youtube.time);
        }
    });

    describe('thumbnail image', () => {
        test('should load thumbnail without image proxy', () => {
            const props = {
                ...baseProps,
                hasImageProxy: false,
            };

            getYoutubeVideoInfo.mockImplementation((key, videoId, success) => {
                success({
                    items: [{
                        snippet: {},
                    }],
                });
            });

            const wrapper = shallow(<YoutubeVideo {...props}/>);

            expect(wrapper.find('img').prop('src')).not.toContain('/api/v4/image');
            expect(wrapper.find('img').prop('src')).toContain('hqdefault.jpg');
        });

        test('should load thumbnail through image proxy', () => {
            const props = {
                ...baseProps,
                hasImageProxy: true,
            };

            getYoutubeVideoInfo.mockImplementation((key, videoId, success) => {
                success({
                    items: [{
                        snippet: {},
                    }],
                });
            });

            const wrapper = shallow(<YoutubeVideo {...props}/>);

            expect(wrapper.find('img').prop('src')).toContain('/api/v4/image');
            expect(wrapper.find('img').prop('src')).toContain('hqdefault.jpg');
        });

        test('should load thumbnail through image proxy without a developer key', () => {
            const props = {
                ...baseProps,
                googleDeveloperKey: '',
                hasImageProxy: true,
            };

            const wrapper = shallow(<YoutubeVideo {...props}/>);

            expect(wrapper.find('img').prop('src')).toContain('/api/v4/image');
            expect(wrapper.find('img').prop('src')).toContain('hqdefault.jpg');
        });

        test('should load thumbnail through image proxy with a live stream', () => {
            const props = {
                ...baseProps,
                hasImageProxy: true,
            };

            getYoutubeVideoInfo.mockImplementation((key, videoId, success) => {
                success({
                    items: [{
                        snippet: {
                            liveBroadcastContent: 'live',
                        },
                    }],
                });
            });

            const wrapper = shallow(<YoutubeVideo {...props}/>);

            expect(wrapper.find('img').prop('src')).toContain('/api/v4/image');
            expect(wrapper.find('img').prop('src')).toContain('hqdefault_live.jpg');
        });
    });
});
