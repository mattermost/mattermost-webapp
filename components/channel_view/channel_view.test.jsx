// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelView from './channel_view.jsx';

describe('components/channel_view', () => {
    const baseProps = {
        channelId: 'channelId',
        channelRolesLoading: false,
        deactivatedChannel: false,
        match: {
            url: '/team/channel/channelId',
            params: {},
        },
        showTutorial: false,
        channelIsArchived: false,
        viewArchivedChannels: false,
        actions: {
            goToLastViewedChannel: jest.fn(),
        },
    };

    it('Should match snapshot with base props', () => {
        const wrapper = shallow(<ChannelView {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('Should match snapshot if channel roles loading', () => {
        const wrapper = shallow(
            <ChannelView
                {...baseProps}
                channelRolesLoading={true}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('Should match snapshot if channel is archived with roles loading', () => {
        const wrapper = shallow(
            <ChannelView
                {...baseProps}
                channelRolesLoading={true}
                channelIsArchived={true}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('Should have prevChannelId based on prev props', () => {
        const wrapper = shallow(<ChannelView {...baseProps}/>);
        expect(wrapper.state('prevChannelId')).toEqual('');

        wrapper.setProps({channelId: 'newChannelId'});
        expect(wrapper.state('prevChannelId')).toEqual('channelId');

        wrapper.setProps({channelIsArchived: true});
        expect(wrapper.state('prevChannelId')).toEqual('channelId'); //should still be the same value as there no change in channelId
    });

    it('Should have focusedPostId state based on props', () => {
        const wrapper = shallow(<ChannelView {...baseProps}/>);
        expect(wrapper.state('focusedPostId')).toEqual(undefined);

        wrapper.setProps({channelId: 'newChannelId', match: {url: '/team/channel/channelId/postId', params: {postid: 'postid'}}});
        expect(wrapper.state('focusedPostId')).toEqual('postid');
        wrapper.setProps({channelId: 'newChannelId', match: {url: '/team/channel/channelId/postId1', params: {postid: 'postid1'}}});
        expect(wrapper.state('focusedPostId')).toEqual('postid1');
    });
});
