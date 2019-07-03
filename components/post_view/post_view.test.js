// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PostList from './post_list';
import PostView from './post_view.jsx';

describe('components/post_view/post_view', () => {
    const baseProps = {
        lastViewedAt: 12345678,
        isFirstLoad: false,
        channelLoading: false,
        channelId: '1234',
        focusedPostId: '12345',
    };
    jest.useFakeTimers();

    beforeEach(() => {
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => setTimeout(cb, 16));
    });

    afterEach(() => {
        window.requestAnimationFrame.mockRestore();
    });

    test('should match snapshot for channel loading', () => {
        const wrapper = shallow(<PostView {...{...baseProps, channelLoading: true}}/>);
        expect(wrapper.state('timeStampToShowPosts')).toEqual(null);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for loaderForChangeOfPostsChunk', () => {
        const wrapper = shallow(<PostView {...baseProps}/>);
        wrapper.setState({loaderForChangeOfPostsChunk: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('timeStampToShowPosts should be set for first load of channel', () => {
        const wrapper = shallow(<PostView {...{...baseProps, isFirstLoad: true}}/>);
        expect(wrapper.state('timeStampToShowPosts')).toEqual(baseProps.lastViewedAt);
    });

    test('changeTimeStampToShowPosts', () => {
        const wrapper = shallow(<PostView {...{...baseProps, isFirstLoad: true}}/>);
        expect(wrapper.state('timeStampToShowPosts')).toEqual(baseProps.lastViewedAt);
        wrapper.find(PostList).prop('changeTimeStampToShowPosts')(1234678);
        expect(wrapper.state('timeStampToShowPosts')).toEqual(1234678);
        expect(wrapper.state('loaderForChangeOfPostsChunk')).toEqual(true);
        jest.runOnlyPendingTimers();
        expect(wrapper.state('loaderForChangeOfPostsChunk')).toEqual(false);
    });
});
