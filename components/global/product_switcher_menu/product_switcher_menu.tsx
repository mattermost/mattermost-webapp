// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';

import Icon from '@mattermost/compass-components/foundations/icon';

import {Permissions} from 'mattermost-redux/constants';
import {UserProfile} from 'mattermost-redux/types/users';

import * as GlobalActions from 'actions/global_actions';
import AboutBuildModal from 'components/about_build_modal';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import MarketplaceModal from 'components/plugin_marketplace';
import Menu from 'components/widgets/menu/menu';

import {ModalIdentifiers} from 'utils/constants';
import {useSafeUrl} from 'utils/url';
import * as UserAgent from 'utils/user_agent';

type Props = {
    isMobile: boolean;
    id: string;
    teamId: string;
    teamName: string;
    siteName: string;
    currentUser: UserProfile;
    appDownloadLink: string;
    isMessaging: boolean;
    enableCommands: boolean;
    enableIncomingWebhooks: boolean;
    enableOAuthServiceProvider: boolean;
    enableOutgoingWebhooks: boolean;
    canManageSystemBots: boolean;
    canManageIntegrations: boolean;
    enablePluginMarketplace: boolean;
    pluginMenuItems: any;
    intl: IntlShape;
    firstAdminVisitMarketplaceStatus: boolean;
    onClick?: React.MouseEventHandler<HTMLElement>;
};

// TODO: rewrite this to a functional component
class ProductSwitcherMenu extends React.PureComponent<Props> {
    static defaultProps = {
        teamType: '',
        isMobile: false,
        pluginMenuItems: [],
    };

    handleEmitUserLoggedOutEvent = () => {
        GlobalActions.emitUserLoggedOutEvent();
    }

    render() {
        const {currentUser, isMessaging, isMobile, onClick} = this.props;

        if (!currentUser) {
            return null;
        }

        const someIntegrationEnabled = this.props.enableIncomingWebhooks || this.props.enableOutgoingWebhooks || this.props.enableCommands || this.props.enableOAuthServiceProvider || this.props.canManageSystemBots;
        const showIntegrations = !isMobile && someIntegrationEnabled && this.props.canManageIntegrations;

        const {formatMessage} = this.props.intl;

        return (
            <Menu.Group>
                <div onClick={onClick}>
                    <SystemPermissionGate
                        permissions={[Permissions.SYSCONSOLE_WRITE_ABOUT_EDITION_AND_LICENSE]}
                    >
                        <Menu.StartTrial
                            id='startTrial'
                        />
                    </SystemPermissionGate>
                    <SystemPermissionGate permissions={Permissions.SYSCONSOLE_READ_PERMISSIONS}>
                        <Menu.ItemLink
                            id='systemConsole'
                            show={!isMobile}
                            to='/admin_console'
                            text={formatMessage({id: 'navbar_dropdown.console', defaultMessage: 'System Console'})}
                            icon={
                                <Icon
                                    size={16}
                                    glyph={'application-cog'}
                                />
                            }
                        />
                    </SystemPermissionGate>
                    <Menu.ItemLink
                        id='integrations'
                        show={isMessaging && showIntegrations}
                        to={'/' + this.props.teamName + '/integrations'}
                        text={formatMessage({id: 'navbar_dropdown.integrations', defaultMessage: 'Integrations'})}
                        icon={
                            <Icon
                                size={16}
                                glyph={'webhook-incoming'}
                            />
                        }
                    />
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.SYSCONSOLE_WRITE_PLUGINS]}
                    >
                        <Menu.ItemToggleModalRedux
                            id='marketplaceModal'
                            modalId={ModalIdentifiers.PLUGIN_MARKETPLACE}
                            show={isMessaging && !isMobile && this.props.enablePluginMarketplace}
                            dialogType={MarketplaceModal}
                            text={formatMessage({id: 'navbar_dropdown.marketplace', defaultMessage: 'Marketplace'})}
                            icon={
                                <Icon
                                    size={16}
                                    glyph={'apps'}
                                />
                            }
                        />
                    </TeamPermissionGate>
                    <Menu.ItemExternalLink
                        id='nativeAppLink'
                        show={this.props.appDownloadLink && !UserAgent.isMobileApp()}
                        url={useSafeUrl(this.props.appDownloadLink)}
                        text={formatMessage({id: 'navbar_dropdown.nativeApps', defaultMessage: 'Download Apps'})}
                        icon={
                            <Icon
                                size={16}
                                glyph={'download-outline'}
                            />
                        }
                    />
                    <Menu.ItemToggleModalRedux
                        id='about'
                        modalId={ModalIdentifiers.ABOUT}
                        dialogType={AboutBuildModal}
                        text={formatMessage({id: 'navbar_dropdown.about', defaultMessage: 'About {appTitle}'}, {appTitle: this.props.siteName})}
                        icon={
                            <Icon
                                size={16}
                                glyph={'information-outline'}
                            />
                        }
                    />
                </div>
            </Menu.Group>
        );
    }
}

export default injectIntl(ProductSwitcherMenu);
