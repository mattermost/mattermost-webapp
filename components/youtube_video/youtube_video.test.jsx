// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import YoutubeVideo from 'components/youtube_video/youtube_video.jsx';

describe('components/YoutubeVideo', () => {
    function shallowYoutubeVideo() {
        const allProps = {
            channelId: 'channelid',
            currentChannelId: 'currentchannelid',
            link: 'https://www.youtube.com/watch?v=xqCoNej8Zxo',
            show: true,
            googleDeveloperKey: 'googledevkey',
        };

        return shallow(<YoutubeVideo {...allProps}/>);
    }

    test('should correctly parse youtube start time formats', () => {
        const wrapper = shallowYoutubeVideo();
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
            expect(wrapper.instance().handleYoutubeTime(youtube.link)).toEqual(youtube.time);
        }
    });
});
