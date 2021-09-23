// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import {TestHelper} from 'utils/test_helper';

import ProductSwitcherMenu, {Props as ProductSwitcherMenuProps} from './product_switcher_menu';

describe('components/global/product_switcher_menu', () => {
    // Neccessary for components enhanced by HOCs due to issue with enzyme.
    // See https://github.com/enzymejs/enzyme/issues/539
    const getMenuWrapper = (props: ProductSwitcherMenuProps) => {
        const wrapper = shallowWithIntl(<ProductSwitcherMenu {...props}/>);
        return wrapper.find('MenuGroup').shallow();
    };

    const user = TestHelper.getUserMock({
        id: 'test-user-id',
        username: 'username',
    });

    const defaultProps: ProductSwitcherMenuProps = {
        isMobile: false,
        id: '',
        teamId: '',
        teamName: '',
        siteName: '',
        currentUser: user,
        appDownloadLink: 'test–link',
        isMessaging: true,
        enableCommands: false,
        enableIncomingWebhooks: false,
        enableOAuthServiceProvider: false,
        enableOutgoingWebhooks: false,
        canManageSystemBots: false,
        canManageIntegrations: true,
        enablePluginMarketplace: false,
        onClick: () => jest.fn,
    };

    test('should match snapshot with id', () => {
        const props = {...defaultProps, id: 'product-switcher-menu-test'};
        const wrapper = shallowWithIntl(<ProductSwitcherMenu {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should not render if the user is not logged in', () => {
        const props = {...defaultProps, currentUser: undefined as unknown as UserProfile};
        const wrapper = shallowWithIntl(<ProductSwitcherMenu {...props}/>);
        expect(wrapper.type()).toEqual(null);
    });

    test('should match snapshot with most of the thing enabled', () => {
        const props = {
            ...defaultProps,
            enableCommands: true,
            enableIncomingWebhooks: true,
            enableOAuthServiceProvider: true,
            enableOutgoingWebhooks: true,
            canManageSystemBots: true,
            canManageIntegrations: true,
            enablePluginMarketplace: true,
        };
        const wrapper = shallowWithIntl(<ProductSwitcherMenu {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    describe('should show integrations', () => {
        it('when incoming webhooks enabled', () => {
            const props = {...defaultProps, enableIncomingWebhooks: true};
            const wrapper = shallowWithIntl(<ProductSwitcherMenu {...props}/>);

            expect(wrapper.find('#integrations').prop('show')).toBe(true);
        });

        it('when outgoing webhooks enabled', () => {
            const props = {...defaultProps, enableOutgoingWebhooks: true};
            const wrapper = shallowWithIntl(<ProductSwitcherMenu {...props}/>);

            expect(wrapper.find('#integrations').prop('show')).toBe(true);
        });

        it('when slash commands enabled', () => {
            const props = {...defaultProps, enableCommands: true};
            const wrapper = getMenuWrapper(props);

            expect(wrapper.find('#integrations').prop('show')).toBe(true);
        });

        it('when oauth providers enabled', () => {
            const props = {...defaultProps, enableOAuthServiceProvider: true};
            const wrapper = getMenuWrapper(props);

            expect(wrapper.find('#integrations').prop('show')).toBe(true);
        });

        it('when can manage system bots', () => {
            const props = {...defaultProps, canManageSystemBots: true};
            const wrapper = getMenuWrapper(props);

            expect(wrapper.find('#integrations').prop('show')).toBe(true);
        });

        it('unless cannot manage integrations', () => {
            const props = {...defaultProps, canManageIntegrations: false, enableCommands: true};
            const wrapper = getMenuWrapper(props);

            expect(wrapper.find('#integrations').prop('show')).toBe(false);
        });

        it('should show integrations modal', () => {
            const props = {...defaultProps, enableIncomingWebhooks: true};
            const wrapper = getMenuWrapper(props);

            wrapper.find('#integrations').simulate('click');
            expect(wrapper).toMatchSnapshot();
        });
    });
});
