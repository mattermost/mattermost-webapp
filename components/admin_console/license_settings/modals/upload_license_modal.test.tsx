// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import thunk from 'redux-thunk';

import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {General} from 'mattermost-redux/constants';

import * as i18Selectors from 'selectors/i18n';

import UploadLicenseModal from './upload_license_modal';

jest.mock('selectors/i18n');

describe('components/admin_console/license_settings/modals/upload_license_modal', () => {
    (i18Selectors.getCurrentLocale as jest.Mock).mockReturnValue(General.DEFAULT_LOCALE);

    // required state to mount using the provider
    const license = {
        IsLicensed: 'true',
        IssuedAt: '1517714643650',
        StartsAt: '1517714643650',
        ExpiresAt: '1620335443650',
        SkuShortName: 'Enterprise',
        Name: 'LicenseName',
        Company: 'Mattermost Inc.',
        Users: '100',
    };

    const state = {
        entities: {
            general: {
                license: {
                    IsLicensed: 'false',
                },
            },
        },
        views: {
            modals: {
                modalState: {
                    upload_license: {
                        open: 'true',
                    },
                },
            },
        },
    };

    const mockOnExited = jest.fn();

    const props = {
        onExited: mockOnExited,
    };

    const mockStore = configureStore([thunk]);
    const store = mockStore(state);

    test('should match snapshot when is not licensed', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <UploadLicenseModal {...props}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when is licensed', () => {
        const licensedState = {
            general: {
                license: {...license},
            },
        };
        const localStore = {...state, entities: licensedState};
        const mockStore = configureStore([thunk]);
        const store = mockStore(localStore);
        const wrapper = shallow(
            <Provider store={store}>
                <UploadLicenseModal {...props}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should display upload btn disabled on initial load', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <UploadLicenseModal {...props}/>
            </Provider>,
        );
        const uploadButton = wrapper.find('UploadLicenseModal').find('button#upload-button');
        expect(uploadButton.prop('disabled')).toBe(true);
    });

    test('should show success image when open and there is a license (successful license upload)', () => {
        const licensedState = {
            general: {
                license: {...license},
            },
        };
        const localStore = {...state, entities: licensedState};
        const mockStore = configureStore([thunk]);
        const store = mockStore(localStore);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <UploadLicenseModal {...props}/>
            </Provider>,
        );
        expect(wrapper.find('UploadLicenseModal').find('.hands-svg')).toHaveLength(1);
        expect(wrapper.find('UploadLicenseModal').find('#done-button')).toHaveLength(1);
    });

    test('should hide the upload modal', () => {
        const UploadLicenseModalHidden = {
            modals: {
                modalState: {},
            },
        };
        const localStore = {...state, views: UploadLicenseModalHidden};
        const mockStore = configureStore([thunk]);
        const store = mockStore(localStore);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <UploadLicenseModal {...props}/>
            </Provider>,
        );

        expect(wrapper.find('UploadLicenseModal').find('content-body')).toHaveLength(0);
    });
});
