// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {MenuItemToggleModalReduxImpl} from './menu_item_toggle_modal_redux.jsx';

describe('components/MenuItemToggleModalRedux', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <MenuItemToggleModalReduxImpl
                modalId='test'
                dialogType={jest.fn}
                dialogProps={{test: 'test'}}
                text='Whatever'
            />
        );

        expect(wrapper).toMatchInlineSnapshot(`
<Connect(ModalToggleButtonRedux)
  accessibilityLabel="Whatever"
  dialogProps={
    Object {
      "test": "test",
    }
  }
  dialogType={[Function]}
  modalId="test"
>
  Whatever
</Connect(ModalToggleButtonRedux)>
`);
    });
});
