// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import RhsCommentBroadcastedHeader from './rhs_comment_broadcasted_header';

describe('components/RhsComment/RhsCommentBroadcastedHeader', () => {
    const baseProps = {
        channelName: 'channel_name',
        isBroadcastThreadReply: true,
        handleBroadcastThreadReply: jest.fn(),
    };

    test('should render broadcast thread reply checkbox', () => {
        const wrapper = shallow(<RhsCommentBroadcastedHeader {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
