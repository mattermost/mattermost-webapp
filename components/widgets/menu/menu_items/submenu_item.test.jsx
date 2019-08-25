// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import SubMenuItem from './submenu_item';

describe('components/widgets/menu/menu_items/submenu_item.jsx', () => {
    test('empty subMenu should match snapshot', () => {
        const wrapper = mount(
            <SubMenuItem
                key={'_pluginmenuitem'}
                id={'1'}
                text={'test'}
                subMenu={[]}
                action={jest.fn()}
                width={10}
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
                width={10}
                root={true}
            />
        );
        expect(wrapper.html()).toEqual('<li class="SubMenuItem MenuItem" role="menuitem" id="1_menuitem"><div id="1"><span id="channelHeaderDropdownIconLeft_1" class="fa fa-angle-left SubMenu__icon-left" aria-label="submenu icon"></span>test<span id="channelHeaderDropdownIconRight_1" class="fa fa-angle-right SubMenu__icon-right-empty" aria-label="submenu icon"></span><ul class="a11y__popup Menu dropdown-menu SubMenu" style="visibility: hidden;"><li class="SubMenuItem MenuItem" role="menuitem" id="A_menuitem"><div id="A"><span id="channelHeaderDropdownIconLeft_A" class="fa fa-angle-left SubMenu__icon-left-empty" aria-label="submenu icon"></span>Test A<span id="channelHeaderDropdownIconRight_A" class="fa fa-angle-right SubMenu__icon-right-empty" aria-label="submenu icon"></span><ul class="a11y__popup Menu dropdown-menu SubMenu" style="visibility: hidden; right: -1px;"></ul></div></li><li class="SubMenuItem MenuItem" role="menuitem" id="B_menuitem"><div id="B"><span id="channelHeaderDropdownIconLeft_B" class="fa fa-angle-left SubMenu__icon-left-empty" aria-label="submenu icon"></span>Test B<span id="channelHeaderDropdownIconRight_B" class="fa fa-angle-right SubMenu__icon-right-empty" aria-label="submenu icon"></span><ul class="a11y__popup Menu dropdown-menu SubMenu" style="visibility: hidden; right: -1px;"></ul></div></li></ul></div></li>');
    });
    test('test subMenu click triggers action', async () => {
        const action = jest.fn().mockReturnValueOnce();
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
                action={action}
                width={10}
                root={true}
            />
        );
        wrapper.setState({show: true});
        wrapper.find('#A').at(0).simulate('click');
        await expect(action).toHaveBeenCalledTimes(1);
    });
});
