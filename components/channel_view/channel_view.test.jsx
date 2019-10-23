// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelView from './channel_view.jsx';

describe('components/channel_view', () => {
    const baseProps = {
        channelId: 'channelId',
        deactivatedChannel: false,
        match: {
            url: '/team/channel/channelId',
        },
        showTutorial: false,
        channelIsArchived: false,
        viewArchivedChannels: false,
        actions: {
            goToLastViewedChannel: jest.fn(),
        },
    };

    it('Should have prevChannelId based on prev props', () => {
        const wrapper = shallow(<ChannelView {...baseProps}/>);
        expect(wrapper.state('prevChannelId')).toEqual('');

        wrapper.setProps({channelId: 'newChannelId'});
        expect(wrapper.state('prevChannelId')).toEqual('channelId');

        wrapper.setProps({channelIsArchived: true});
        expect(wrapper.state('prevChannelId')).toEqual('channelId'); //should still be the same value as there no change in channelId
    });
});
