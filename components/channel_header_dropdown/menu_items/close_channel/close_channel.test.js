// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import MenuItemAction from 'components/widgets/menu/menu_items/menu_item_action.jsx';

import CloseChannel from './close_channel';

describe('components/ChannelHeaderDropdown/MenuItem.CloseChannel', () => {
    const baseProps = {
        isArchived: true,
        actions: {
            goToLastViewedChannel: jest.fn(),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<CloseChannel {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('shoud be hidden if the channel is not archived', () => {
        const props = {
            ...baseProps,
            isArchived: false,
        };
        const wrapper = shallow(<CloseChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should runs goToLastViewedChannel function on click', () => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                goToLastViewedChannel: jest.fn(),
            },
        };
        const wrapper = shallow(<CloseChannel {...props}/>);
        wrapper.find(MenuItemAction).simulate('click');
        expect(props.actions.goToLastViewedChannel).toHaveBeenCalled();
    });
});
