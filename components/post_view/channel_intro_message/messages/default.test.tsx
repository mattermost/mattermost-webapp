// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import {ChannelType} from '@mattermost/types/channels';

import {channel, boardComponent} from './utils.test';

import DefaultIntroMessage from './default';

describe('components/post_view/ChannelIntroMessages', () => {
    const baseProps = {
        channel,
        enableUserCreation: false,
        teamIsGroupConstrained: false,
        stats: {},
        usersLimit: 10,
    };

    describe('test DEFAULT Channel', () => {
        const directChannel = {
            ...channel,
            name: Constants.DEFAULT_CHANNEL,
            type: Constants.OPEN_CHANNEL as ChannelType,
        };
        const archivedChannel = {
            ...channel,
            name: Constants.DEFAULT_CHANNEL,
            type: Constants.OPEN_CHANNEL as ChannelType,
            delete_at: 111111,
        };
        const props = {
            ...baseProps,
            channel: directChannel,
        };

        test('should match snapshot, readonly', () => {
            const wrapper = shallow(
                <DefaultIntroMessage
                    {...props}
                    isReadOnly={true}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, no boards', () => {
            const wrapper = shallow(
                <DefaultIntroMessage
                    {...props}
                    teamIsGroupConstrained={true}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with boards', () => {
            const wrapper = shallow(
                <DefaultIntroMessage
                    {...props}
                    teamIsGroupConstrained={true}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with boards. enableUserCreation', () => {
            const wrapper = shallow(
                <DefaultIntroMessage
                    {...props}
                    enableUserCreation={true}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with boards, enable, group constrained', () => {
            const wrapper = shallow(
                <DefaultIntroMessage
                    {...props}
                    enableUserCreation={true}
                    teamIsGroupConstrained={true}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot, no boards, archived channel', () => {
            const wrapper = shallow(
                <DefaultIntroMessage
                    {...baseProps}
                    channel={archivedChannel}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
