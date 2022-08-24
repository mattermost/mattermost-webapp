// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {archivedChannel, boardComponent, channel, defaultChannel} from './utils';

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
        const props = {
            ...baseProps,
            channel: defaultChannel,
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
