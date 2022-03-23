// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {ActionTypes} from 'utils/constants';
import * as Actions from 'actions/views/root';
import * as i18nSelectors from 'selectors/i18n';

const mockStore = configureStore([thunk]);

describe('root view actions', () => {
    describe('registerPluginTranslationsSource', () => {
        test('Should not dispatch action when getTranslation is empty', () => {
            const testStore = mockStore({});

            jest.spyOn(i18nSelectors, 'getTranslations').mockReturnValue(undefined);
            jest.spyOn(i18nSelectors, 'getCurrentLocale').mockReturnValue('en');

            testStore.dispatch(Actions.registerPluginTranslationsSource('plugin_id', jest.fn()));
            expect(testStore.getActions()).toEqual([]);
        });

        test('Should dispatch action when getTranslation is not empty', () => {
            const testStore = mockStore({});

            jest.spyOn(i18nSelectors, 'getTranslations').mockReturnValue({});
            jest.spyOn(i18nSelectors, 'getCurrentLocale').mockReturnValue('en');

            testStore.dispatch(Actions.registerPluginTranslationsSource('plugin_id', jest.fn()));
            expect(testStore.getActions()).toEqual([{
                data: {
                    locale: 'en',
                    translations: {},
                },
                type: ActionTypes.RECEIVED_TRANSLATIONS,
            }]);
        });
    });
});
