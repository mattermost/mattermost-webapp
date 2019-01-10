// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LoadingSpinner from './loading_spinner.jsx';

describe('components/widgets/loadingLoadingSpinner', () => {
    test('showing spinner with text', () => {
        const wrapper = shallow(<LoadingSpinner text='test'/>);
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className="LoadingSpinner with-text"
>
  <span
    className="fa fa-spinner fa-pulse spinner"
    title="Loading Icon"
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
>
  <span
    className="fa fa-spinner fa-pulse spinner"
    title="Loading Icon"
  />
</span>
`);
    });
});
