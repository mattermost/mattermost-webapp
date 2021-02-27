// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import ChannelInfoModal from 'components/channel_info_modal/channel_info_modal';
import { Channel } from 'mattermost-redux/src/types/channels';
import { Team } from 'mattermost-redux/types/teams';

describe('components/ChannelInfoModal', () => {
    let mockChannel: Channel;
    let mockTeam: Team;
    beforeEach(() => {
        mockChannel = {
            id: 'testchannel',
            name: 'testchannel', 
            display_name: 'testchannel',
            header: '',
            purpose: '',
            create_at: 12345,
            update_at: 12345,
            delete_at: 0,
            team_id: 'testid',
            last_post_at: 12345,
            total_msg_count: 0,
            type: 'O',
            extra_update_at: 0,
            creator_id: 'testchannel',
            scheme_id: 'testchannel',
            group_constrained: false,
        };
        mockTeam = {
            id: 'testid', 
            name: 'testteam',
            create_at: 1234,
            update_at: 1234,
            delete_at: 0,
            display_name: 'testteam',
            description: 'testteam',
            email: 'testteam@team.com',
            company_name: 'testcompany',
            type: 'O',
            allowed_domains: 'testdomain',
            invite_id: 'testinviteid',
            allow_open_invite: true,
            scheme_id: 'testteam',
            group_constrained: false,
        }
    })
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
            } ,
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
