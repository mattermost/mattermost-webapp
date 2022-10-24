// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CRTBroadcastThreadReplyCheckbox from './crt_broadcast_thread_reply';

describe('components/AdvancedTextEditor/CRTBroadcastThreadReplyCheckbox', () => {
    const baseProps = {
        channelName: 'channel_name',
        isBroadcastThreadReply: true,
        handleBroadcastThreadReply: jest.fn(),
    };

    test('should render broadcast thread reply checkbox', () => {
        const wrapper = shallow(<CRTBroadcastThreadReplyCheckbox {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
