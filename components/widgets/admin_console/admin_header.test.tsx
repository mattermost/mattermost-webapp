// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint no-console: 0 */

import React from 'react';
import {shallow} from 'enzyme';

import AdminHeader from './admin_header';

describe('components/widgets/admin_console/AdminHeader', () => {
    test('render component with child', () => {
        const wrapper = shallow(<AdminHeader>{'Test'}</AdminHeader>);
        expect(wrapper).toMatchInlineSnapshot(`
<div
  className="admin-console__header"
>
  Test
</div>
`
        );
    });

    test('children prop is mandatory', () => {
        const originalError = console.error;
        console.error = jest.fn();

        shallow(<AdminHeader/>);

        expect(console.error).toBeCalledTimes(1);
        expect(console.error).toBeCalledWith('Warning: Failed prop type: The prop `children` is marked as required in `AdminHeader`, but its value is `undefined`.\n    in AdminHeader');

        console.error = originalError;
    });
});
