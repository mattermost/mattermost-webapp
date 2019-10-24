// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import SaveButton from 'components/save_button.jsx';

describe('components/SaveButton', () => {
    const baseProps = {
        saving: false,
    };

    test('should match snapshot, on defaultMessage', () => {
        const wrapper = shallowWithIntl(
            <SaveButton {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('button').first().props().disabled).toBe(false);

        wrapper.setProps({defaultMessage: 'Go'});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on savingMessage', () => {
        const props = {...baseProps, saving: true, disabled: true};
        const wrapper = shallowWithIntl(
            <SaveButton {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('button').first().props().disabled).toBe(true);

        wrapper.setProps({savingMessage: 'Saving Config...'});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, extraClasses', () => {
        const props = {...baseProps, extraClasses: 'some-class'};
        const wrapper = shallowWithIntl(
            <SaveButton {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
