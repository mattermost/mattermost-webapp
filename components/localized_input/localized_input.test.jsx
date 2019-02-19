// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import LocalizedInput from 'components/localized_input/localized_input';

describe('components/localized_input/localized_input', () => {
    const baseProps = {
        className: 'test-class',
        value: 'test value',
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <LocalizedInput
                {...baseProps}
                placeholder={{id: 'test.placeholder', defaultMessage: 'placeholder to test'}}
            />
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('input').length).toBe(1);
        expect(wrapper.find('input').get(0).props.value).toBe('test value');
        expect(wrapper.find('input').get(0).props.className).toBe('test-class');
        expect(wrapper.find('input').get(0).props.placeholder).toBe('placeholder to test');
    });
});
