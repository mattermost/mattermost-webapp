// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import SubMenuItem from './submenu_item';

describe('components/widgets/menu/menu_items/submenu_item', () => {
    test('empty subMenu should match snapshot', () => {
        const wrapper = mount(
            <SubMenuItem
                key={'_pluginmenuitem'}
                id={'1'}
                text={'test'}
                subMenu={[]}
                action={jest.fn()}
                root={true}
            />
        );
        expect(wrapper.html()).toEqual('<li class="SubMenuItem MenuItem" role="menuitem" id="1_menuitem"><div id="1"><span id="channelHeaderDropdownIconLeft_1" class="fa fa-angle-left SubMenu__icon-left-empty" aria-label="submenu icon"></span>test<span id="channelHeaderDropdownIconRight_1" class="fa fa-angle-right SubMenu__icon-right-empty" aria-label="submenu icon"></span><ul class="a11y__popup Menu dropdown-menu SubMenu" style="visibility: hidden;"></ul></div></li>');
    });
    test('present subMenu should match snapshot with submenu', () => {
        const wrapper = mount(
            <SubMenuItem
                key={'_pluginmenuitem'}
                id={'1'}
                text={'test'}
                subMenu={[
                    {
                        id: 'A',
                        text: 'Test A',
                    },
                    {
                        id: 'B',
                        text: 'Test B',
                    },
                ]}
                action={jest.fn()}
                root={true}
            />
        );
        expect(wrapper.html()).toEqual('<li class="SubMenuItem MenuItem" role="menuitem" id="1_menuitem"><div id="1"><span id="channelHeaderDropdownIconLeft_1" class="fa fa-angle-left SubMenu__icon-left" aria-label="submenu icon"></span>test<span id="channelHeaderDropdownIconRight_1" class="fa fa-angle-right SubMenu__icon-right-empty" aria-label="submenu icon"></span><ul class="a11y__popup Menu dropdown-menu SubMenu" style="visibility: hidden;"><li class="SubMenuItem MenuItem" role="menuitem" id="A_menuitem"><div id="A"><span id="channelHeaderDropdownIconLeft_A" class="fa fa-angle-left SubMenu__icon-left-empty" aria-label="submenu icon"></span>Test A<span id="channelHeaderDropdownIconRight_A" class="fa fa-angle-right SubMenu__icon-right-empty" aria-label="submenu icon"></span><ul class="a11y__popup Menu dropdown-menu SubMenu" style="visibility: hidden; right: 0px;"></ul></div></li><li class="SubMenuItem MenuItem" role="menuitem" id="B_menuitem"><div id="B"><span id="channelHeaderDropdownIconLeft_B" class="fa fa-angle-left SubMenu__icon-left-empty" aria-label="submenu icon"></span>Test B<span id="channelHeaderDropdownIconRight_B" class="fa fa-angle-right SubMenu__icon-right-empty" aria-label="submenu icon"></span><ul class="a11y__popup Menu dropdown-menu SubMenu" style="visibility: hidden; right: 0px;"></ul></div></li></ul></div></li>');
    });
    test('test subMenu click triggers action', async () => {
        const action1 = jest.fn().mockReturnValueOnce('default');
        const action2 = jest.fn().mockReturnValueOnce('default');
        const action3 = jest.fn().mockReturnValueOnce('default');
        const wrapper = mount(
            <SubMenuItem
                key={'_pluginmenuitem'}
                id={'Z'}
                text={'test'}
                subMenu={[
                    {
                        id: 'A',
                        text: 'Test A',
                        action: action2,
                    },
                    {
                        id: 'B',
                        text: 'Test B',
                        action: action3,
                    },
                ]}
                action={action1}
                root={true}
            />
        );
        wrapper.setState({show: true});
        wrapper.find('#Z').at(1).simulate('click');
        await expect(action1).toHaveBeenCalledTimes(1);
        wrapper.setState({show: true});
        wrapper.find('#A').at(1).simulate('click');
        await expect(action2).toHaveBeenCalledTimes(1);
        wrapper.setState({show: true});
        wrapper.find('#B').at(1).simulate('click');
        await expect(action3).toHaveBeenCalledTimes(1);
    });
});
