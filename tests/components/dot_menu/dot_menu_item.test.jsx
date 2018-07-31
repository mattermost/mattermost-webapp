// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import DotMenuItem from 'components/dot_menu/dot_menu_item.jsx';

jest.mock('actions/global_actions.jsx', () => {
    return {
        showGetPostLinkModal: jest.fn(),
    };
});

describe('components/dot_menu/DotMenuItem', () => {
    test('should match snapshot, ', () => {
        const text = (
            <p>{'MyItem'}</p>
        );
        const props = {
            handleMenuItemActivated: jest.fn(),
            menuItemText: text,
        };

        const wrapper = shallow(
            <DotMenuItem {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.find('button').first().simulate('click');
        expect(props.handleMenuItemActivated).toHaveBeenCalledTimes(1);
    });
});
