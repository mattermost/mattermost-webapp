// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import AboutBuildModal from 'components/about_build_modal/about_build_modal.jsx';

describe('components/AboutBuildModal', () => {
    let config = null;
    let license = null;

    afterEach(() => {
        config = null;
        license = null;
    });

    beforeEach(() => {
        config = {
            BuildEnterpriseReady: 'true',
            Version: '3.6.0',
            BuildNumber: '3.6.2',
            SQLDriverName: 'Postgres',
            BuildHash: 'abcdef1234567890',
            BuildHashEnterprise: '0123456789abcdef',
            BuildDate: '21 January 2017'
        };
        license = {
            IsLicensed: 'true',
            Company: 'Mattermost Inc'
        };
    });

    test('should match snapshot for enterprise edition', () => {
        const wrapper = shallowAboutBuildModal({config, license});
        expect(wrapper.find('#versionString').text()).toBe(' 3.6.0\u00a0 (3.6.2)');
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for team edition', () => {
        const teamConfig = {
            ...config,
            BuildEnterpriseReady: 'false',
            BuildHashEnterprise: ''
        };

        const wrapper = shallowAboutBuildModal({config: teamConfig, license: {}});
        expect(wrapper).toMatchSnapshot();
    });

    test('should hide the build number if it is the same as the version number', () => {
        const sameBuildConfig = {
            ...config,
            BuildEnterpriseReady: 'false',
            BuildHashEnterprise: '',
            Version: '3.6.0',
            BuildNumber: '3.6.0'
        };

        const wrapper = shallowAboutBuildModal({config: sameBuildConfig, license: {}});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#versionString').text()).toBe(' 3.6.0');
    });

    test('should show the build number if it is the different from the version number', () => {
        const differentBuildConfig = {
            ...config,
            BuildEnterpriseReady: 'false',
            BuildHashEnterprise: '',
            Version: '3.6.0',
            BuildNumber: '3.6.2'
        };

        const wrapper = shallowAboutBuildModal({config: differentBuildConfig, license: {}});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#versionString').text()).toBe(' 3.6.0\u00a0 (3.6.2)');
    });

    test('should call onModalDismissed callback when the modal is hidden', (done) => {
        function onHide() {
            done();
        }

        const wrapper = mountWithIntl(
            <AboutBuildModal
                config={config}
                license={license}
                show={true}
                onModalDismissed={onHide}
            />
        );

        wrapper.find(Modal).first().props().onHide();
    });

    function shallowAboutBuildModal(props = {}) {
        const onModalDismissed = jest.fn();
        const show = true;

        const allProps = {
            show,
            onModalDismissed,
            ...props
        };

        return shallow(<AboutBuildModal {...allProps}/>);
    }
});
