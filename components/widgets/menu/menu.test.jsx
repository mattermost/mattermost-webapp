// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Menu from './menu.jsx';

jest.mock('utils/utils', () => {
    const original = require.requireActual('utils/utils');
    return {
        ...original,
        isMobile: jest.fn(() => false),
    };
});

describe('components/Menu', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(<Menu ariaLabel='test-label'>{'text'}</Menu>);

        expect(wrapper).toMatchInlineSnapshot(`
<FocusTrap
  _createFocusTrap={[Function]}
  active={true}
  focusTrapOptions={
    Object {
      "clickOutsideDeactivates": true,
      "initialFocus": [Function],
    }
  }
  paused={false}
>
  <div>
    <ul
      aria-label="test-label"
      className="a11y__popup Menu dropdown-menu"
      onClick={[Function]}
      onMouseOver={[Function]}
      role="menu"
      style={Object {}}
      tabIndex="-1"
    >
      text
    </ul>
  </div>
</FocusTrap>
`);
    });

    test('should match snapshot with id', () => {
        const wrapper = shallow(
            <Menu
                id='test-id'
                ariaLabel='test-label'
            >
                {'text'}
            </Menu>
        );

        expect(wrapper).toMatchInlineSnapshot(`
<FocusTrap
  _createFocusTrap={[Function]}
  active={true}
  focusTrapOptions={
    Object {
      "clickOutsideDeactivates": true,
      "initialFocus": [Function],
    }
  }
  paused={false}
>
  <div>
    <ul
      aria-label="test-label"
      className="a11y__popup Menu dropdown-menu"
      id="test-id"
      onClick={[Function]}
      onMouseOver={[Function]}
      role="menu"
      style={Object {}}
      tabIndex="-1"
    >
      text
    </ul>
  </div>
</FocusTrap>
`);
    });

    test('should match snapshot with openLeft and openUp when is mobile', () => {
        const utils = require('utils/utils'); //eslint-disable-line global-require
        utils.isMobile.mockReturnValue(true);

        const wrapper = shallow(
            <Menu
                openLeft={true}
                openUp={true}
                ariaLabel='test-label'
            >
                {'text'}
            </Menu>
        );

        expect(wrapper).toMatchInlineSnapshot(`
<FocusTrap
  _createFocusTrap={[Function]}
  active={true}
  focusTrapOptions={
    Object {
      "clickOutsideDeactivates": true,
      "initialFocus": [Function],
    }
  }
  paused={false}
>
  <div>
    <ul
      aria-label="test-label"
      className="a11y__popup Menu dropdown-menu"
      onClick={[Function]}
      onMouseOver={[Function]}
      role="menu"
      style={Object {}}
      tabIndex="-1"
    >
      text
    </ul>
  </div>
</FocusTrap>
`);
    });

    test('should match snapshot with openLeft and openUp', () => {
        const utils = require('utils/utils'); //eslint-disable-line global-require
        utils.isMobile.mockReturnValue(false);

        const wrapper = shallow(
            <Menu
                openLeft={true}
                openUp={true}
                ariaLabel='test-label'
            >
                {'text'}
            </Menu>
        );

        expect(wrapper).toMatchInlineSnapshot(`
<FocusTrap
  _createFocusTrap={[Function]}
  active={true}
  focusTrapOptions={
    Object {
      "clickOutsideDeactivates": true,
      "initialFocus": [Function],
    }
  }
  paused={false}
>
  <div>
    <ul
      aria-label="test-label"
      className="a11y__popup Menu dropdown-menu"
      onClick={[Function]}
      onMouseOver={[Function]}
      role="menu"
      style={
        Object {
          "bottom": "100%",
          "left": "inherit",
          "right": 0,
          "top": "auto",
        }
      }
      tabIndex="-1"
    >
      text
    </ul>
  </div>
</FocusTrap>
`);
    });
});
