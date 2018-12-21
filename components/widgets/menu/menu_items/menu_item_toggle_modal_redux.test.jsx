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
                dialogType='type'
                dialogProps={{test: 'test'}}
                text='Whatever'
            />
        );

        expect(wrapper).toMatchInlineSnapshot(`
<Connect(ModalToggleButtonRedux)
  dialogProps={
    Object {
      "test": "test",
    }
  }
  dialogType="type"
  modalId="test"
>
  Whatever
</Connect(ModalToggleButtonRedux)>
`);
    });
});
