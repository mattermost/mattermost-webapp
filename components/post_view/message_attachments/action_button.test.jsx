// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ActionButton from 'components/post_view/message_attachments/action_button';

describe('components/post_view/message_attachments/action_button.jsx', () => {
    const baseProps = {
        action: {id: 'action_id_1', name: 'action_name_1', cookie: 'cookie-contents'},
        handleAction: jest.fn(),

    };

    test('should match snapshot', () => {
        const wrapper = shallow(<ActionButton {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call handleAction on click', () => {
        const wrapper = shallow(<ActionButton {...baseProps}/>);

        wrapper.find('button').simulate('click');

        expect(baseProps.handleAction).toHaveBeenCalledTimes(1);
    });
});