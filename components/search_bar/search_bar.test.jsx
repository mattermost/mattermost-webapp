// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';

import SearchDateProvider from 'components/suggestion/search_date_provider';
import SearchChannelProvider from 'components/suggestion/search_channel_provider';
import SearchUserProvider from 'components/suggestion/search_user_provider';
import en from 'i18n/en.json';

import SearchBar from './search_bar.tsx';

const suggestionProviders = [
    new SearchDateProvider(),
    new SearchChannelProvider(jest.fn()),
    new SearchUserProvider(jest.fn()),
];

jest.mock('utils/utils', () => {
    const original = jest.requireActual('utils/utils');
    return {
        ...original,
        isMobile: jest.fn(() => false),
    };
});

const wrapIntl = (component) => (
    <IntlProvider
        locale={'en'}
        messages={en}
    >
        {component}
    </IntlProvider>
);

describe('components/search_bar/SearchBar', () => {
    const baseProps = {
        suggestionProviders,
        searchTerms: '',
        keepFocused: false,
        isFocused: false,
        isSideBarRight: false,
        isSearchingTerm: false,
        isFocus: false,
        children: null,
        updateHighlightedSearchHint: jest.fn(),
        handleChange: jest.fn(),
        handleSubmit: jest.fn(),
        handleEnterKey: jest.fn(),
        handleClear: jest.fn(),
        handleFocus: jest.fn(),
        handleBlur: jest.fn(),
    };

    it('should match snapshot without search', () => {
        const wrapper = shallow(
            wrapIntl(<SearchBar {...baseProps}/>),
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot without search on focus', () => {
        const wrapper = shallow(
            wrapIntl((
                <SearchBar
                    {...baseProps}
                    isFocussed={true}
                />
            )),
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot without search on focus in mobile', () => {
        const utils = require('utils/utils'); //eslint-disable-line global-require
        utils.isMobile.mockReturnValue(true);

        const wrapper = shallow(
            wrapIntl((
                <SearchBar
                    {...baseProps}
                    isFocussed={true}
                />
            )),
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with search', () => {
        const wrapper = shallow(
            wrapIntl((
                <SearchBar
                    {...baseProps}
                    searchTerms={'test'}
                />
            )),
        );
        expect(wrapper).toMatchSnapshot();
    });
});
