// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Team_icon from './badge';

describe('components/widgets/badges/Badge', () => {
    test('should match the snapshot on show', () => {
        const wrapper = shallow(
            <Team_icon className={'test'}>{'Test text'}</Team_icon>
        );
        expect(wrapper).toMatchInlineSnapshot(`
<div
  className="Badge"
>
  <div
    className="Badge__box test"
  >
    Test text
  </div>
</div>
`);
    });

    test('should match the snapshot on hide', () => {
        const wrapper = shallow(
            <Team_icon show={false}>{'Test text'}</Team_icon>
        );
        expect(wrapper).toMatchInlineSnapshot('""');
    });
});
