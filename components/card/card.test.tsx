// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {mount, shallow} from 'enzyme';

import Card from './card';

describe('components/card/card', () => {
    const baseProps = {
        expanded: false,
    };

    const headerProps = {
        title:
    <FormattedMessage
        id='admin.data_retention.customPolicies.title'
        defaultMessage='Custom retention policies'
    />,
        subtitle:
    <FormattedMessage
        id='admin.data_retention.customPolicies.subTitle'
        defaultMessage='Customize how long specific teams and channels will keep messages.'
    />,
        body:
    <div>
        {'Hello!'}
    </div>,
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

    test('should match snapshot when using alternate header and no button', () => {
        const props = {
            ...baseProps,
            expanded: true,
            className: 'console',
        };

        const wrapper = shallow(
            <Card {...props}>
                <Card.Header {...headerProps}>{''}</Card.Header>
                <Card.Body>{'Body Test'}</Card.Body>
            </Card>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when using alternate header and a button', () => {
        const props = {
            ...baseProps,
            expanded: true,
            className: 'console',
        };

        const buttonProps = {
            buttonText:
    <FormattedMessage
        id='admin.data_retention.customPolicies.addPolicy'
        defaultMessage='Add policy'
    />,
            onClick:
                () => {}
            ,
        };

        const wrapper = shallow(
            <Card {...props}>
                <Card.Header
                    {...headerProps}
                    {...buttonProps}
                >{''}</Card.Header>
                <Card.Body>{'Body Test'}</Card.Body>
            </Card>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
