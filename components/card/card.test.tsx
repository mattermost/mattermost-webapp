// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, ReactWrapper} from 'enzyme';

import Card from './card';
import CardBody from './card_body';

describe('components/card/card', () => {
    const baseProps = {
        expanded: false,
    };

    test('should match snapshot', () => {
        const wrapper = mount(
            <Card {...baseProps}>
                <Card.Header {...baseProps}>{'Header Test'}</Card.Header>
                <Card.Body {...baseProps}>{'Body Test'}</Card.Body>
            </Card>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have a height based on content when expanded', () => {
        const wrapper = mount(
            <Card.Body {...baseProps}>
                {'Body Test'}
                {'Slightly Larger Body Text'}
            </Card.Body>
        );

        expect(wrapper.find('.Card__body').prop('style')).toHaveProperty('height', '');

        wrapper.setProps({expanded: true});
        expect(wrapper.find('.Card__body').prop('style')).not.toHaveProperty('height', '');

        wrapper.setProps({expanded: false});
        expect(wrapper.find('.Card__body').prop('style')).toHaveProperty('height', '');
    });
});
