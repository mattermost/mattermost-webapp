// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import LoadingSpinner from './loading_spinner';

describe('components/widgets/loadingLoadingSpinner', () => {
    test('showing spinner with text', () => {
        const wrapper = shallow(<LoadingSpinner text='test'/>);
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className="LoadingSpinner with-text"
  id="loadingSpinner"
>
  <LocalizedIcon
    className="fa fa-spinner fa-fw fa-pulse spinner"
    component="span"
    title={
      Object {
        "defaultMessage": "Loading Icon",
        "id": "generic_icons.loading",
      }
    }
  />
  test
</span>
`);
    });
    test('showing spinner without text', () => {
        const wrapper = shallow(<LoadingSpinner/>);
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className="LoadingSpinner"
  id="loadingSpinner"
>
  <LocalizedIcon
    className="fa fa-spinner fa-fw fa-pulse spinner"
    component="span"
    title={
      Object {
        "defaultMessage": "Loading Icon",
        "id": "generic_icons.loading",
      }
    }
  />
</span>
`);
    });
});
