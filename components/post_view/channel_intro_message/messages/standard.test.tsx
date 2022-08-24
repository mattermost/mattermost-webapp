// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import StandardIntroMessage from './standard';
import {boardComponent, channel} from './utils';

describe('components/post_view/ChannelIntroMessages', () => {
    const baseProps = {
        channel,
        locale: 'en',
        creatorName: 'creatorName',
        stats: {},
        usersLimit: 10,
    };

    describe('test Open Channel', () => {
        test('should match snapshot, without boards', () => {
            const wrapper = shallow(
                <StandardIntroMessage{...baseProps}/>,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with boards', () => {
            const wrapper = shallow(
                <StandardIntroMessage
                    {...baseProps}
                    boardComponent={boardComponent}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
