// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import * as hooks from './hooks';

import ProductSwitcher from './product_switcher';
import ProductSwitcherTip from './product_switcher_tip';

describe('components/product_switcher/product_switcher', () => {
    test('shows tutorial tip when it should', () => {
        jest.spyOn(hooks, 'useProducts').mockReturnValue([]);
        jest.spyOn(hooks, 'useCurrentProductId').mockReturnValue('asdf');
        jest.spyOn(hooks, 'useShowTutorialStep').mockReturnValue(true);

        const wrapper = shallow(<ProductSwitcher/>);

        expect(wrapper.find(ProductSwitcherTip)).toHaveLength(1);
    });

    test('does not show tutorial tip when it should not', () => {
        jest.spyOn(hooks, 'useProducts').mockReturnValue([]);
        jest.spyOn(hooks, 'useCurrentProductId').mockReturnValue('asdf');
        jest.spyOn(hooks, 'useShowTutorialStep').mockReturnValue(false);

        const wrapper = shallow(<ProductSwitcher/>);

        expect(wrapper.find(ProductSwitcherTip)).toHaveLength(0);
    });
});
