// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AdminPanelWithButton from './admin_panel_with_button.jsx';

describe('components/widgets/admin_console/AdminPanelWithButton', () => {
    const defaultProps = {
        className: 'test-class-name',
        id: 'test-id',
        titleId: 'test-title-id',
        titleDefault: 'test-title-default',
        subtitleId: 'test-subtitle-id',
        subtitleDefault: 'test-subtitle-default',
        url: null,
        onButtonClick: null,
        buttonTextId: 'test-button-text-id',
        buttonTextDefault: 'test-button-text-default',
        disabled: false,
    };

    test('should match snapshot with url', () => {
        const wrapper = shallow(
            <AdminPanelWithButton
                {...defaultProps}
                url='/path'
            >
                {'Test'}
            </AdminPanelWithButton>
        );
        expect(wrapper).toMatchInlineSnapshot(`
<AdminPanel
  button={
    <Link
      className="btn btn-primary"
      disabled={false}
      replace={false}
      to="/path"
    >
      <FormattedMessage
        defaultMessage="test-button-text-default"
        id="test-button-text-id"
        values={Object {}}
      />
    </Link>
  }
  className="AdminPanelWithButton test-class-name"
  id="test-id"
  subtitleDefault="test-subtitle-default"
  subtitleId="test-subtitle-id"
  titleDefault="test-title-default"
  titleId="test-title-id"
>
  Test
</AdminPanel>
`
        );
    });

    test('should match snapshot with url and disabled', () => {
        const wrapper = shallow(
            <AdminPanelWithButton
                {...defaultProps}
                url='/path'
                disabled={true}
            >
                {'Test'}
            </AdminPanelWithButton>
        );
        expect(wrapper).toMatchInlineSnapshot(`
<AdminPanel
  button={
    <Link
      className="btn btn-primary"
      disabled={true}
      replace={false}
      to="/path"
    >
      <FormattedMessage
        defaultMessage="test-button-text-default"
        id="test-button-text-id"
        values={Object {}}
      />
    </Link>
  }
  className="AdminPanelWithButton test-class-name"
  id="test-id"
  subtitleDefault="test-subtitle-default"
  subtitleId="test-subtitle-id"
  titleDefault="test-title-default"
  titleId="test-title-id"
>
  Test
</AdminPanel>
`
        );
    });

    test('should match snapshot with onButtonClick', () => {
        const wrapper = shallow(
            <AdminPanelWithButton
                {...defaultProps}
                onButtonClick={jest.fn()}
            >
                {'Test'}
            </AdminPanelWithButton>
        );
        expect(wrapper).toMatchInlineSnapshot(`
<AdminPanel
  button={
    <a
      className="btn btn-primary"
      disabled={false}
      onClick={[MockFunction]}
    >
      <FormattedMessage
        defaultMessage="test-button-text-default"
        id="test-button-text-id"
        values={Object {}}
      />
    </a>
  }
  className="AdminPanelWithButton test-class-name"
  id="test-id"
  subtitleDefault="test-subtitle-default"
  subtitleId="test-subtitle-id"
  titleDefault="test-title-default"
  titleId="test-title-id"
>
  Test
</AdminPanel>
`
        );
    });

    test('should match snapshot with onButtonClick and disabled', () => {
        const wrapper = shallow(
            <AdminPanelWithButton
                {...defaultProps}
                onButtonClick={jest.fn()}
                disabled={true}
            >
                {'Test'}
            </AdminPanelWithButton>
        );
        expect(wrapper).toMatchInlineSnapshot(`
<AdminPanel
  button={
    <a
      className="btn btn-primary"
      disabled={true}
      onClick={[MockFunction]}
    >
      <FormattedMessage
        defaultMessage="test-button-text-default"
        id="test-button-text-id"
        values={Object {}}
      />
    </a>
  }
  className="AdminPanelWithButton test-class-name"
  id="test-id"
  subtitleDefault="test-subtitle-default"
  subtitleId="test-subtitle-id"
  titleDefault="test-title-default"
  titleId="test-title-id"
>
  Test
</AdminPanel>
`
        );
    });
});
