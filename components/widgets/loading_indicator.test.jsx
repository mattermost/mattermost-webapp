// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LoadingIndicator from './loading_indicator.jsx';

describe('components/widgets/LoadingIndicator', () => {
    test('showing spinner with text', () => {
        const wrapper = shallow(
            <LoadingIndicator
                text='test'
                type='spinner'
            />
        );
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className="loading-indicator with-text"
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
        const wrapper = shallow(
            <LoadingIndicator type='spinner'/>
        );
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className="loading-indicator"
>
  <span
    className="fa fa-spinner fa-pulse spinner"
    title="Loading Icon"
  />
</span>
`);
    });
    test('showing bars with text', () => {
        const wrapper = shallow(
            <LoadingIndicator
                text='test'
                type='bars'
            />
        );
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className="loading-indicator with-text"
>
  <img
    className="spinner"
    src={null}
  />
  test
</span>
`);
    });
    test('showing bars without text', () => {
        const wrapper = shallow(
            <LoadingIndicator type='bars'/>
        );
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className="loading-indicator"
>
  <img
    className="spinner"
    src={null}
  />
</span>
`);
    });
});
