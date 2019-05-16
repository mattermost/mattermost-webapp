// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LoadingBars from './loading_bars.jsx';

describe('components/widgets/loading/LoadingBars', () => {
    test('showing bars with text', () => {
        const wrapper = shallow(<LoadingBars text='test'/>);
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className="LoadingBars with-text"
>
  <img
    alt="spinner icon"
    className="spinner"
    src={null}
  />
  test
</span>
`);
    });
    test('showing bars without text', () => {
        const wrapper = shallow(<LoadingBars/>);
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className="LoadingBars"
>
  <img
    alt="spinner icon"
    className="spinner"
    src={null}
  />
</span>
`);
    });
});
