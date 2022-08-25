// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {archivedChannel, boardComponent, defaultChannel} from './test_utils';

import DefaultIntroMessage from './default';

describe('components/post_view/ChannelIntroMessages', () => {
    describe('test DEFAULT Channel', () => {
        const component = (otherProps: any) => {
            return (
                <DefaultIntroMessage
                    enableUserCreation={false}
                    teamIsGroupConstrained={false}
                    stats={{}}
                    usersLimit={10}
                    channel={defaultChannel}
                    {...otherProps}
                />
            );
        };

        test('should match snapshot, readonly', () => {
            expect(shallow(component({
                isReadOnly: true,
            }))).toMatchSnapshot();
        });

        test('should match snapshot, no boards', () => {
            expect(shallow(component({
                teamIsGroupConstrained: true,
            }))).toMatchSnapshot();
        });

        test('should match snapshot, with boards', () => {
            expect(shallow(component({
                teamIsGroupConstrained: true,
                boardComponent,
            }))).toMatchSnapshot();
        });

        test('should match snapshot, with boards. enableUserCreation', () => {
            expect(shallow(component({
                enableUserCreation: true,
                boardComponent,
            }))).toMatchSnapshot();
        });

        test('should match snapshot, with boards, enable, group constrained', () => {
            expect(shallow(component({
                enableUserCreation: true,
                teamIsGroupConstrained: true,
                boardComponent,
            }))).toMatchSnapshot();
        });
        test('should match snapshot, no boards, archived channel', () => {
            expect(shallow(component({
                channel: archivedChannel,
            }))).toMatchSnapshot();
        });
    });
});
