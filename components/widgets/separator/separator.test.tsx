// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Separator from './separator';

describe('components/widgets/separator', () => {
    test('with text', () => {
        const wrapper = shallow(
            <Separator className='test'>
                {'Some text'}
            </Separator>
        );
        expect(wrapper).toMatchSnapshot();
    });
    test('without text', () => {
        const wrapper = shallow(<Separator className={'test'}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
