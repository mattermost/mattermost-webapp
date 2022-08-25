// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import StandardIntroMessage from './standard';
import {boardComponent, channel} from './test_utils';

describe('components/post_view/ChannelIntroMessages', () => {
    describe('test Open Channel', () => {
        const component = (otherProps: any) => {
            return (
                <StandardIntroMessage
                    channel={channel}
                    locale={'en'}
                    creatorName={'creatorName'}
                    stats={{}}
                    usersLimit={10}
                    {...otherProps}
                />
            );
        };

        test('should match snapshot, without boards', () => {
            expect(shallow(component({ }))).toMatchSnapshot();
        });

        test('should match snapshot, with boards', () => {
            expect(shallow(component({
                boardComponent,
            }))).toMatchSnapshot();
        });
    });
});
