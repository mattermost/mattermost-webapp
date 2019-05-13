// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FormattedAdminHeader from './formatted_admin_header.jsx';

describe('components/widgets/admin_console/FormattedAdminHeader', () => {
    test('render component with required props', () => {
        const wrapper = shallow(
            <FormattedAdminHeader
                id='string.id'
                defaultMessage='default message'
            />
        );
        expect(wrapper).toMatchInlineSnapshot(`
<AdminHeader>
  <InjectIntl(FormattedMarkdownMessage)
    defaultMessage="default message"
    id="string.id"
    values={Object {}}
  />
</AdminHeader>
`
        );
    });

    test('render component with all props', () => {
        const wrapper = shallow(
            <FormattedAdminHeader
                id='string.id'
                defaultMessage='default message'
                values={{
                    a_key: 'a_value',
                }}
            />
        );
        expect(wrapper).toMatchInlineSnapshot(`
<AdminHeader>
  <InjectIntl(FormattedMarkdownMessage)
    defaultMessage="default message"
    id="string.id"
    values={
      Object {
        "a_key": "a_value",
      }
    }
  />
</AdminHeader>
`
        );
    });

    test('id prop is mandatory', () => {
        console.originalError = console.error;
        console.error = jest.fn();

        shallow(
            <FormattedAdminHeader
                defaultMessage='default message'
            />
        );

        expect(console.error).toBeCalledTimes(1);
        expect(console.error).toBeCalledWith('Warning: Failed prop type: The prop `id` is marked as required in `FormattedAdminHeader`, but its value is `undefined`.\n    in FormattedAdminHeader');

        console.error = console.originalError;
    });

    test('defaultMessage prop is mandatory', () => {
        console.originalError = console.error;
        console.error = jest.fn();

        shallow(
            <FormattedAdminHeader
                id='string.id'
            />
        );

        expect(console.error).toBeCalledTimes(1);
        expect(console.error).toBeCalledWith('Warning: Failed prop type: The prop `defaultMessage` is marked as required in `FormattedAdminHeader`, but its value is `undefined`.\n    in FormattedAdminHeader');

        console.error = console.originalError;
    });
});
