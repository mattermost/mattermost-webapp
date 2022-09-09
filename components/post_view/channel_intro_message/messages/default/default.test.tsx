// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {archivedChannel, defaultChannel} from '../test_utils';

import DefaultIntroMessage from './default';

const component = (otherProps: any) => {
    return (
        <DefaultIntroMessage
            channel={defaultChannel}
            enableUserCreation={false}
            teamIsGroupConstrained={false}
            usersLimit={10}
            {...otherProps}
        />
    );
};

describe('components/post_view/ChannelIntroMessages', () => {
    describe('test DEFAULT Channel', () => {
        test('should match snapshot, readonly', () => {
            expect(shallow(component({
                isReadOnly: true,
            }))).toMatchSnapshot();
        });

        test('should match snapshot, group constrained', () => {
            expect(shallow(component({
                teamIsGroupConstrained: true,
            }))).toMatchSnapshot();
        });

        test('should match snapshot, enableUserCreation', () => {
            expect(shallow(component({
                enableUserCreation: true,
            }))).toMatchSnapshot();
        });

        test('should match snapshot, enable, group constrained', () => {
            expect(shallow(component({
                enableUserCreation: true,
                teamIsGroupConstrained: true,
            }))).toMatchSnapshot();
        });
        test('should match snapshot, archived channel', () => {
            expect(shallow(component({
                channel: archivedChannel,
            }))).toMatchSnapshot();
        });
    });
});
