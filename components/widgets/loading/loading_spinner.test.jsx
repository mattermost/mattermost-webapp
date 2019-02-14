// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import LoadingSpinner from './loading_spinner.jsx';

describe('components/widgets/loadingLoadingSpinner', () => {
    test('showing spinner with text', () => {
        const wrapper = shallowWithIntl(<LoadingSpinner text='test'/>);
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className="LoadingSpinner with-text"
  id="loadingSpinner"
>
  <span
    className="fa fa-spinner fa-fw fa-pulse spinner"
    title="Loading Icon"
  />
  test
</span>
`);
    });
    test('showing spinner without text', () => {
        const wrapper = shallowWithIntl(<LoadingSpinner/>);
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className="LoadingSpinner"
  id="loadingSpinner"
>
  <span
    className="fa fa-spinner fa-fw fa-pulse spinner"
    title="Loading Icon"
  />
</span>
`);
    });
});
