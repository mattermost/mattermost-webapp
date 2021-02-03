// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {shallow} from 'enzyme';

import Card, {Props} from './card';

describe('components/admin_console/card', () => {
    const defaultProps: Props = {
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
        const wrapper = shallow(<Card {...defaultProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should show button in card header', () => {
        const wrapper = shallow(<Card {...defaultProps}/>);
        wrapper.setProps({
            buttonText:
    <FormattedMessage
        id='admin.data_retention.customPolicies.addPolicy'
        defaultMessage='Add policy'
    />,
            onClick:
                () => {}
            ,
        });
        expect(wrapper).toMatchSnapshot();
    });
});
