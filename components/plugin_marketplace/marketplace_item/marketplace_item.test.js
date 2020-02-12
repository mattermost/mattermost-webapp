// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ConfirmModal from 'components/confirm_modal';
import {mountWithIntl as mount} from 'tests/helpers/intl-test-helper';

import MarketplaceItem, {UpdateDetails, UpdateConfirmationModal} from './marketplace_item';

describe('components/MarketplaceItem', () => {
    describe('UpdateDetails', () => {
        const baseProps = {
            version: '0.0.2',
            releaseNotesUrl: 'http://example.com/release',
            installedVersion: '0.0.1',
            isInstalling: false,
            isDefaultMarketplace: true,
            onUpdate: () => {},
        };

        describe('should render nothing', () => {
            it('when no installed version', () => {
                const props = {
                    ...baseProps,
                    installedVersion: '',
                };
                const wrapper = mount(
                    <UpdateDetails {...props}/>
                );

                expect(wrapper.isEmptyRender()).toBe(true);
            });

            it('when installed version matches available version', () => {
                const props = {
                    ...baseProps,
                    installedVersion: baseProps.availableVersion,
                };
                const wrapper = mount(
                    <UpdateDetails {...props}/>
                );

                expect(wrapper.isEmptyRender()).toBe(true);
            });

            it('when installed version is newer than available version', () => {
                const props = {
                    ...baseProps,
                    installedVersion: '0.0.3',
                };
                const wrapper = mount(
                    <UpdateDetails {...props}/>
                );

                expect(wrapper.isEmptyRender()).toBe(true);
            });

            it('when installing', () => {
                const props = {
                    ...baseProps,
                    isInstalling: true,
                };
                const wrapper = mount(
                    <UpdateDetails {...props}/>
                );

                expect(wrapper.isEmptyRender()).toBe(true);
            });
        });

        it('should render without release notes url', () => {
            const props = {
                ...baseProps,
                releaseNotesUrl: '',
            };

            const wrapper = mount(
                <UpdateDetails {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        it('should render with release notes url', () => {
            const wrapper = mount(
                <UpdateDetails {...baseProps}/>
            );

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('UpdateConfirmationModal', () => {
        const baseProps = {
            show: true,
            name: 'pluginName',
            version: '0.0.2',
            releaseNotesUrl: 'http://example.com/release',
            installedVersion: '0.0.1',
            onUpdate: () => {},
            onCancel: () => {},
        };

        describe('should render nothing', () => {
            it('if not installed', () => {
                const props = {
                    ...baseProps,
                };
                delete props.installedVersion;

                const wrapper = shallow(
                    <UpdateConfirmationModal {...props}/>
                );
                expect(wrapper.isEmptyRender()).toBe(true);
            });

            it('when installed version is newer than available version', () => {
                const props = {
                    ...baseProps,
                    installedVersion: '0.0.3',
                };

                const wrapper = shallow(
                    <UpdateConfirmationModal {...props}/>
                );
                expect(wrapper.isEmptyRender()).toBe(true);
            });
        });

        it('should propogate show to ConfirmModal', () => {
            const props = {
                ...baseProps,
                show: false,
            };
            const wrapper = shallow(
                <UpdateConfirmationModal {...props}/>
            );

            const modal = wrapper.find(ConfirmModal);
            expect(modal.exists()).toBe(true);
            expect(modal.props().show).toBe(false);
        });

        it('should render without release notes url', () => {
            const props = {
                ...baseProps,
            };
            delete props.releaseNotesUrl;

            const wrapper = shallow(
                <UpdateConfirmationModal {...props}/>
            );

            expect(wrapper.find(ConfirmModal)).toMatchSnapshot();
        });

        it('should add extra warning for major version change', () => {
            const props = {
                ...baseProps,
                version: '1.0.0',
            };

            const wrapper = shallow(
                <UpdateConfirmationModal {...props}/>
            );
            expect(wrapper.find(ConfirmModal)).toMatchSnapshot();
        });

        it('should add extra warning for major version change, even without release notes', () => {
            const props = {
                ...baseProps,
                version: '1.0.0',
            };
            delete props.releaseNotesUrl;

            const wrapper = shallow(
                <UpdateConfirmationModal {...props}/>
            );
            expect(wrapper.find(ConfirmModal)).toMatchSnapshot();
        });

        it('should avoid exception on invalid semver', () => {
            const props = {
                ...baseProps,
                version: 'not-a-version',
            };

            const wrapper = shallow(
                <UpdateConfirmationModal {...props}/>
            );
            expect(wrapper.find(ConfirmModal)).toMatchSnapshot();
        });
    });

    describe('MarketplaceItem', () => {
        const baseProps = {
            id: 'id',
            name: 'name',
            description: 'test plugin',
            version: '1.0.0',
            downloadUrl: 'http://example.com/download',
            signatureUrl: 'http://example.com/signature',
            homepageUrl: 'http://example.com',
            installedVersion: '',
            iconUrl: '',
            iconData: 'icon',
            installing: false,
            isDefaultMarketplace: true,
            trackEvent: jest.fn(() => {}), // eslint-disable-line no-empty-function
            actions: {
                installPlugin: jest.fn(() => {}), // eslint-disable-line no-empty-function
                closeMarketplaceModal: jest.fn(() => {}), // eslint-disable-line no-empty-function
            },
        };

        test('should render', () => {
            const wrapper = shallow(
                <MarketplaceItem {...baseProps}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with no plugin icon', () => {
            const props = {...baseProps};
            delete props.iconData;

            const wrapper = shallow(
                <MarketplaceItem {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render wtih no homepage url', () => {
            const props = {...baseProps};
            delete props.homepageUrl;

            const wrapper = shallow(
                <MarketplaceItem {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with server error', () => {
            const props = {
                ...baseProps,
                error: 'An error occurred.',
            };

            const wrapper = shallow(
                <MarketplaceItem {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render installed plugin', () => {
            const props = {
                ...baseProps,
                installedVersion: '1.0.0',
            };

            const wrapper = shallow(
                <MarketplaceItem {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with update available', () => {
            const props = {
                ...baseProps,
                installedVersion: '0.9.9',
            };

            const wrapper = shallow(
                <MarketplaceItem {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with update and release notes available', () => {
            const props = {
                ...baseProps,
                installedVersion: '0.9.9',
                releaseNotesUrl: 'http://example.com/release',
            };

            const wrapper = shallow(
                <MarketplaceItem {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with empty list of labels', () => {
            const props = {
                ...baseProps,
                labels: [],
            };

            const wrapper = shallow(
                <MarketplaceItem {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with one labels', () => {
            const props = {
                ...baseProps,
                labels: [
                    {
                        name: 'someName',
                        description: 'some description',
                        url: 'http://example.com/info',
                    }
                ],
            };

            const wrapper = shallow(
                <MarketplaceItem {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render with two labels', () => {
            const props = {
                ...baseProps,
                labels: [
                    {
                        name: 'someName',
                        description: 'some description',
                        url: 'http://example.com/info',
                    }, {
                        name: 'someName2',
                        description: 'some description2',
                        url: 'http://example.com/info2',
                    }
                ],
            };

            const wrapper = shallow(
                <MarketplaceItem {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render when not from the marketplace', () => {
            const props = {
                ...baseProps,
                downloadUrl: '',
            };

            const wrapper = shallow(
                <MarketplaceItem {...props}/>
            );

            expect(wrapper).toMatchSnapshot();
        });

        describe('should track detailed event with default marketplace', () => {
            test('on install', () => {
                const props = {
                    ...baseProps,
                    isDefaultMarketplace: true,
                };

                const wrapper = shallow(
                    <MarketplaceItem {...props}/>
                );

                wrapper.instance().onInstall();
                expect(props.trackEvent).toBeCalledWith('plugins', 'ui_marketplace_download', {
                    plugin_id: 'id',
                    version: '1.0.0',
                    installed_version: '',
                });
            });

            test('on update', () => {
                const props = {
                    ...baseProps,
                    version: '2.0.0',
                    installedVersion: '1.0.0',
                    isDefaultMarketplace: true,
                };

                const wrapper = shallow(
                    <MarketplaceItem {...props}/>
                );

                wrapper.instance().onUpdate();
                expect(props.trackEvent).toBeCalledWith('plugins', 'ui_marketplace_download_update', {
                    plugin_id: 'id',
                    version: '2.0.0',
                    installed_version: '1.0.0',
                });
            });

            test('but not configure', () => {
                const props = {
                    ...baseProps,
                    version: '2.0.0',
                    installedVersion: '1.0.0',
                    isDefaultMarketplace: true,
                };

                const wrapper = shallow(
                    <MarketplaceItem {...props}/>
                );

                wrapper.instance().onConfigure();
                expect(props.trackEvent).toBeCalledWith('plugins', 'ui_marketplace_configure');
            });
        });

        describe('should track limited event with non-default marketplace', () => {
            test('on install', () => {
                const props = {
                    ...baseProps,
                    isDefaultMarketplace: false,
                };

                const wrapper = shallow(
                    <MarketplaceItem {...props}/>
                );

                wrapper.instance().onInstall();
                expect(props.trackEvent).toBeCalledWith('plugins', 'ui_marketplace_download');
            });

            test('on update', () => {
                const props = {
                    ...baseProps,
                    version: '2.0.0',
                    installedVersion: '1.0.0',
                    isDefaultMarketplace: false,
                };

                const wrapper = shallow(
                    <MarketplaceItem {...props}/>
                );

                wrapper.instance().onUpdate();
                expect(props.trackEvent).toBeCalledWith('plugins', 'ui_marketplace_download_update');
            });

            test('on configure', () => {
                const props = {
                    ...baseProps,
                    version: '2.0.0',
                    installedVersion: '1.0.0',
                    isDefaultMarketplace: false,
                };

                const wrapper = shallow(
                    <MarketplaceItem {...props}/>
                );

                wrapper.instance().onConfigure();
                expect(props.trackEvent).toBeCalledWith('plugins', 'ui_marketplace_configure');
            });
        });
    });
});
