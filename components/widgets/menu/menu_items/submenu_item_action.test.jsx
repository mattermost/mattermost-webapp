// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import SubMenuItemAction from './submenu_item_action';

describe('components/SubMenuItemAction', () => {
    test('empty subMenu should match snapshot', () => {
        const wrapper = mount(
            <SubMenuItemAction
                key={'_pluginmenuitem'}
                id={'1'}
                text={'test'}
                subMenu={[]}
                action={jest.fn()}
                openModal={jest.fn()}
                width={10}
                root={true}
            />
        );
        expect(wrapper.html()).toEqual('<li class="MenuItem" role="menuitem" id="1_menuitem"><div id="1"><span id="channelHeaderDropdownIcon_1" class="fa fa-angle-left SubMenu__icon-empty" aria-label="submenu icon"></span>test<ul class="a11y__popup Menu dropdown-menu SubMenu" style="visibility: hidden;"></ul></div></li>');
    });
    test('present subMenu should match snapshot with submenu', () => {
        const wrapper = mount(
            <SubMenuItemAction
                key={'_pluginmenuitem'}
                id={'1'}
                text={'test'}
                subMenu={[
                    {
                        id: 'A',
                        text: 'A',
                    },
                    {
                        id: 'B',
                        text: 'B',
                    },
                ]}
                action={jest.fn()}
                openModal={jest.fn()}
                width={10}
                root={true}
            />
        );
        expect(wrapper.html()).toEqual('<li class="MenuItem" role="menuitem" id="1_menuitem"><div id="1"><span id="channelHeaderDropdownIcon_1" class="fa fa-angle-left SubMenu__icon" aria-label="submenu icon"></span>test<ul class="a11y__popup Menu dropdown-menu SubMenu" style="visibility: hidden;"><li class="MenuItem" role="menuitem" id="A_menuitem"><div id="A"><span id="channelHeaderDropdownIcon_A" class="fa fa-angle-left SubMenu__icon-empty" aria-label="submenu icon"></span>A<ul class="a11y__popup Menu dropdown-menu SubMenu" style="visibility: hidden; right: -1px;"></ul></div></li><li class="MenuItem" role="menuitem" id="B_menuitem"><div id="B"><span id="channelHeaderDropdownIcon_B" class="fa fa-angle-left SubMenu__icon-empty" aria-label="submenu icon"></span>B<ul class="a11y__popup Menu dropdown-menu SubMenu" style="visibility: hidden; right: -1px;"></ul></div></li></ul></div></li>');
    });
    test('test subMenu click triggers action', async () => {
        const action = jest.fn().mockReturnValueOnce();
        const wrapper = mount(
            <SubMenuItemAction
                key={'_pluginmenuitem'}
                id={'1'}
                text={'test'}
                subMenu={[
                    {
                        id: 'A',
                        text: 'A',
                    },
                    {
                        id: 'B',
                        text: 'B',
                    },
                ]}
                action={action}
                openModal={jest.fn()}
                width={10}
                root={true}
            />
        );
        wrapper.setState({show: true});
        wrapper.find('#A').at(0).simulate('click');
        await expect(action).toHaveBeenCalledTimes(1);
    });
});
