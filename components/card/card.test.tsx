// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import Card from './card';

describe('components/card/card', () => {
    const baseProps = {
        expanded: false,
    };

    test('should match snapshot', () => {
        const wrapper = mount(
            <Card {...baseProps}>
                <Card.Header>{'Header Test'}</Card.Header>
                <Card.Body>{'Body Test'}</Card.Body>
            </Card>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when expanded', () => {
        const props = {
            ...baseProps,
            expanded: true,
        };

        const wrapper = mount(
            <Card {...props}>
                <Card.Header>{'Header Test'}</Card.Header>
                <Card.Body>{'Body Test'}</Card.Body>
            </Card>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
