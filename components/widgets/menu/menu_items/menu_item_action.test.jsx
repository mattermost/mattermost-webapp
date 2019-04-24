// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {MenuItemActionImpl} from './menu_item_action.jsx';

describe('components/MenuItemAction', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <MenuItemActionImpl
                onClick={jest.fn()}
                text='Whatever'
            />
        );

        expect(wrapper).toMatchInlineSnapshot(`
<button
  className="style--none"
  onClick={[MockFunction]}
>
  Whatever
</button>
`);
    });
    test('should match snapshot with extra text', () => {
        const wrapper = shallow(
            <MenuItemActionImpl
                onClick={jest.fn()}
                text='Whatever'
                extraText='Extra Text'
            />
        );

        expect(wrapper).toMatchInlineSnapshot(`
<button
  className="style--none MenuItem__help"
  onClick={[MockFunction]}
>
  Whatever
  <span
    className="extra-text"
  >
    Extra Text
  </span>
</button>
`);
    });
});
