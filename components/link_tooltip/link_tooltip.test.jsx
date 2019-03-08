// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';
import {shallow} from 'enzyme';

import LinkTooltip from 'components/link_tooltip/link_tooltip';

describe('components/link_tooltip/link_tooltip', () => {
    test('should match snapshot', () => {
        ReactDOM.createPortal = (node) => node;
        const wrapper = shallow(
            <LinkTooltip
                href={'www.test.com'}
                title={'test title'}
            />
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('span').text()).toBe('test title');
    });
});
