// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactPortal} from 'react';
import ReactDOM from 'react-dom';
import {shallow, ShallowWrapper} from 'enzyme';

import LinkTooltip from 'components/link_tooltip/link_tooltip';

describe('components/link_tooltip/link_tooltip', () => {
    test('should match snapshot', () => {
        ReactDOM.createPortal = (node) => node as ReactPortal;
        const wrapper: ShallowWrapper<{}, {}, LinkTooltip> = shallow(
            <LinkTooltip
                href={'www.test.com'}
                title={'test title'}
                attribs={{
                    'class': 'someclass',
                    'data-hashtag': '#somehashtag',
                    'data-link': 'somelink',
                    'data-channel-mention': 'somechannel',
                }}
            />
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('span').text()).toBe('test title');
    });
});
