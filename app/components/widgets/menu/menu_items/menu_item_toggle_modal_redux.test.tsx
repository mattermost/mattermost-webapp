// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {MenuItemToggleModalReduxImpl} from './menu_item_toggle_modal_redux';

describe('components/MenuItemToggleModalRedux', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <MenuItemToggleModalReduxImpl
                modalId='test'
                dialogType={jest.fn()}
                dialogProps={{test: 'test'}}
                text='Whatever'
            />,
        );

        expect(wrapper).toMatchInlineSnapshot(`
      <Connect(injectIntl(ModalToggleButtonRedux))
        accessibilityLabel="Whatever"
        dialogProps={
          Object {
            "test": "test",
          }
        }
        dialogType={[MockFunction]}
        modalId="test"
      >
        <span
          className="MenuItem__primary-text"
        >
          Whatever
        </span>
      </Connect(injectIntl(ModalToggleButtonRedux))>
    `);
    });

    test('should match snapshot with extra text', () => {
        const wrapper = shallow(
            <MenuItemToggleModalReduxImpl
                modalId='test'
                dialogType={jest.fn()}
                dialogProps={{test: 'test'}}
                text='Whatever'
                extraText='Extra text'
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
