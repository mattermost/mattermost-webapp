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
        const wrapper = shallow(<Menu>{'text'}</Menu>);

        expect(wrapper).toMatchInlineSnapshot(`
<ul
  aria-labelledby="channel_header_dropdown"
  className="Menu dropdown-menu"
  role="menu"
  style={Object {}}
>
  text
</ul>
`);
    });

    test('should match snapshot with id', () => {
        const wrapper = shallow(<Menu id='test-id'>{'text'}</Menu>);

        expect(wrapper).toMatchInlineSnapshot(`
<ul
  aria-labelledby="channel_header_dropdown"
  className="Menu dropdown-menu"
  id="test-id"
  role="menu"
  style={Object {}}
>
  text
</ul>
`);
    });

    test('should match snapshot with openLeft and openUp when is mobile', () => {
        const utils = require('utils/utils'); //eslint-disable-line global-require
        utils.isMobile.mockReturnValue(true);

        const wrapper = shallow(
            <Menu
                openLeft={true}
                openUp={true}
            >
                {'text'}
            </Menu>
        );

        expect(wrapper).toMatchInlineSnapshot(`
<ul
  aria-labelledby="channel_header_dropdown"
  className="Menu dropdown-menu"
  role="menu"
  style={Object {}}
>
  text
</ul>
`);
    });

    test('should match snapshot with openLeft and openUp', () => {
        const utils = require('utils/utils'); //eslint-disable-line global-require
        utils.isMobile.mockReturnValue(false);

        const wrapper = shallow(
            <Menu
                openLeft={true}
                openUp={true}
            >
                {'text'}
            </Menu>
        );

        expect(wrapper).toMatchInlineSnapshot(`
<ul
  aria-labelledby="channel_header_dropdown"
  className="Menu dropdown-menu"
  role="menu"
  style={
    Object {
      "bottom": "100%",
      "left": "inherit",
      "right": 0,
      "top": "auto",
    }
  }
>
  text
</ul>
`);
    });
});
