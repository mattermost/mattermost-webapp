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
  className="with-text"
>
  <LoadingSpinner
    text={null}
  />
  test
</span>
`);
    });
    test('showing bars without text', () => {
        const wrapper = shallow(<LoadingBars/>);
        expect(wrapper).toMatchInlineSnapshot(`
<span
  className=""
>
  <LoadingSpinner
    text={null}
  />
</span>
`);
    });
});
