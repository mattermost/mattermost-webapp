// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';

import {Channel} from 'mattermost-redux/types/channels';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import ChannelInfoModal from 'components/channel_info_modal/channel_info_modal';
import {TestHelper} from 'utils/test_helper';

describe('components/ChannelInfoModal', () => {
    const mockChannel = TestHelper.getChannelMock({
        header: '',
        purpose: '',
    });
    const mockTeam = TestHelper.getTeamMock();
    it('should match snapshot', () => {
        const wrapper = shallow(
            <ChannelInfoModal
                channel={mockChannel}
                currentChannel={mockChannel}
                currentTeam={mockTeam}
                onHide={jest.fn()}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with channel props', () => {
        const channel: Channel = {
            ...mockChannel,
            header: 'See ~test',
            purpose: 'And ~test too',
            props: {
                channel_mentions: {
                    test: {
                        display_name: 'Test',
                    },
                },
            },
        };

        const wrapper = shallow(
            <ChannelInfoModal
                channel={channel}
                currentChannel={channel}
                currentTeam={mockTeam}
                onHide={jest.fn()}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should call onHide callback when modal is hidden', () => {
        const onHide = jest.fn();

        const wrapper = mountWithIntl(
            <ChannelInfoModal
                channel={mockChannel}
                currentChannel={mockChannel}
                currentTeam={mockTeam}
                onHide={onHide}
            />,
        );
        wrapper.find(Modal).first().props().onExited!(document.createElement('div'));
        expect(onHide).toHaveBeenCalled();
    });

    it('should call onHide when current channel changes', () => {
        const wrapper = mountWithIntl(
            <ChannelInfoModal
                channel={mockChannel}
                currentChannel={mockChannel}
                currentTeam={mockTeam}
                onHide={jest.fn()}
            />,
        );

        expect(wrapper.state('show')).toEqual(true);
        wrapper.setProps({currentChannel: {id: '2', name: 'testchannel2', displayName: 'testchannel', header: '', purpose: ''}});
        expect(wrapper.state('show')).toEqual(false);
    });

    it('should call hide when RHS opens', () => {
        const wrapper = mountWithIntl(
            <ChannelInfoModal
                channel={mockChannel}
                currentChannel={mockChannel}
                currentTeam={mockTeam}
                onHide={jest.fn()}
            />,
        );

        expect(wrapper.state('show')).toEqual(true);
        wrapper.setProps({isRHSOpen: true});
        expect(wrapper.state('show')).toEqual(false);
    });
});
