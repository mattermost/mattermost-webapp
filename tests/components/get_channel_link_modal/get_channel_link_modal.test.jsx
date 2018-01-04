// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GetChannelLinkModal from 'components/get_channel_link_modal/get_channel_link_modal.jsx';
import GetLinkModal from 'components/get_link_modal.jsx';

// mock the site URL, as it will be prefixed onto the link
jest.mock('utils/url', () => {
    return {
        getSiteURL: jest.fn(() => 'http://localhost:8065')
    };
});

describe('components/GetChannelLinkModal', () => {
    test('should match snapshot with currentTeamUrl passed in', () => {
        const wrapper = shallow(
            <GetChannelLinkModal
                link='/foo/bar'
            />
        );

        expect(wrapper).toMatchSnapshot();
        const helpText = 'Paste the link below into a web browser to view the channel.';
        expect(wrapper.find(GetLinkModal).prop('helpText')).toEqual(helpText);
        expect(wrapper.find(GetLinkModal).prop('show')).toEqual(false);
        expect(wrapper.find(GetLinkModal).prop('title')).toEqual('Channel Link');
        expect(wrapper.find(GetLinkModal).prop('link')).toEqual('http://localhost:8065/foo/bar');

        wrapper.setState({post: {id: 'post_id'}});
        expect(wrapper.find(GetLinkModal).prop('link')).toEqual('http://localhost:8065/foo/bar');
    });

    test('should call hide on GetLinkModal\'s onHide', () => {
        const wrapper = shallow(
            <GetChannelLinkModal/>
        );

        wrapper.find(GetLinkModal).first().props().onHide();
        expect(wrapper.state('show')).toBe(false);
    });
});
