// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MsgTyping from 'components/msg_typing/msg_typing.jsx';

describe('components/MsgTyping', () => {
    const baseProps = {
        typingUsers: [],
        channelId: 'test',
        postId: null,
    };

    test('should match snapshot, on nobody typing', () => {
        const wrapper = shallow(<MsgTyping {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on one user typing', () => {
        const typingUsers = ['test.user'];
        const props = {...baseProps, typingUsers};

        const wrapper = shallow(<MsgTyping {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on multiple users typing', () => {
        const typingUsers = ['test.user', 'other.test.user', 'another.user'];
        const props = {...baseProps, typingUsers};

        const wrapper = shallow(<MsgTyping {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
