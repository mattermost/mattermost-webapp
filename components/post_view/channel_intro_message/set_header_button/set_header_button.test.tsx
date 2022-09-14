// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {archivedChannel, defaultChannel} from '../messages/test_utils';

import SetHeaderButton from './set_header_button';

const component = (otherProps: any) => (
    <SetHeaderButton
        channel={defaultChannel}
        {...otherProps}
    />
);

describe('components/post_view/ChannelIntroMessages', () => {
    describe('test Set Header Button', () => {
        test('should match snapshot', () => {
            expect(shallow(component({}))).toMatchSnapshot();
        });

        test('should match snapshot, has board, archived channel', () => {
            expect(shallow(component({
                channel: archivedChannel,
            }))).toMatchSnapshot();
        });
    });
});
