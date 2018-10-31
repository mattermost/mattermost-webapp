// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {render, shallow} from 'enzyme';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import IntlProvider from 'components/intl_provider/intl_provider';

import {getLanguageInfo} from 'i18n/i18n';

describe('components/IntlProvider', () => {
    const baseProps = {
        locale: 'en',
        translations: {
            'test.hello_world': 'Hello, World!',
        },
        actions: {
            loadTranslations: () => {}, // eslint-disable-line
        },
        children: (
            <FormattedMessage
                id='test.hello_world'
                defaultMessage='Hello, World!'
            />
        ),
    };

    test('should render children when passed translation strings', () => {
        const wrapper = render(<IntlProvider {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should render children when passed translation strings for a non-default locale', () => {
        const props = {
            ...baseProps,
            locale: 'fr',
            translations: {
                'test.hello_world': 'Bonjour tout le monde!',
            },
        };

        const wrapper = render(<IntlProvider {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should render null when missing translation strings', () => {
        const props = {
            ...baseProps,
            translations: null,
        };

        const wrapper = render(<IntlProvider {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('on mount, should attempt to load missing translations', () => {
        const props = {
            ...baseProps,
            locale: 'fr',
            translations: null,
            actions: {
                loadTranslations: jest.fn(),
            },
        };

        shallow(<IntlProvider {...props}/>);

        expect(props.actions.loadTranslations).toBeCalledWith('fr', getLanguageInfo('fr').url);
    });

    test('on mount, should not attempt to load when given translations', () => {
        const props = {
            ...baseProps,
            locale: 'fr',
            translations: {},
            actions: {
                loadTranslations: jest.fn(),
            },
        };

        shallow(<IntlProvider {...props}/>);

        expect(props.actions.loadTranslations).not.toBeCalled();
    });

    test('on locale change, should attempt to load missing translations', () => {
        const props = {
            ...baseProps,
            actions: {
                loadTranslations: jest.fn(),
            },
        };

        const wrapper = shallow(<IntlProvider {...props}/>);

        expect(props.actions.loadTranslations).not.toBeCalled();

        wrapper.setProps({
            locale: 'fr',
            translations: null,
        });

        expect(props.actions.loadTranslations).toBeCalledWith('fr', getLanguageInfo('fr').url);
    });

    test('on locale change, should not attempt to load when given translations', () => {
        const props = {
            ...baseProps,
            actions: {
                loadTranslations: jest.fn(),
            },
        };

        const wrapper = shallow(<IntlProvider {...props}/>);

        expect(props.actions.loadTranslations).not.toBeCalled();

        wrapper.setProps({
            locale: 'fr',
            translations: {},
        });

        expect(props.actions.loadTranslations).not.toBeCalled();
    });
});
