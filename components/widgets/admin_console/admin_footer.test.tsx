// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint no-console: 0 */

import React from 'react';
import {shallow} from 'enzyme';

import AdminFooter from './admin_footer';

describe('components/widgets/admin_console/Adminfooter', () => {
    test('render component with child', () => {
        const wrapper = shallow(<AdminFooter>{'Test'}</AdminFooter>);
        expect(wrapper).toMatchInlineSnapshot(`
      <div
        className="admin-console__footer undefined"
      >
        Test
      </div>
    `);
    });
});
