// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useIntl} from 'react-intl';

import Icon from '@mattermost/compass-components/foundations/icon';

import {Permissions} from 'mattermost-redux/constants';

import AboutBuildModal from 'components/about_build_modal';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import MarketplaceModal from 'components/plugin_marketplace';
import Menu from 'components/widgets/menu/menu';
import RestrictedIndicator from 'components/widgets/menu/menu_items/restricted_indicator';
import {VisitSystemConsoleTour} from 'components/onboarding_tasks';
import UserGroupsModal from 'components/user_groups_modal';
import {FREEMIUM_TO_ENTERPRISE_TRIAL_LENGTH_DAYS} from 'utils/cloud_utils';
import {LicenseSkus, ModalIdentifiers, MattermostFeatures} from 'utils/constants';
import {makeUrlSafe} from 'utils/url';
import * as UserAgent from 'utils/user_agent';
import {ModalData} from 'types/actions';
import {UserProfile} from '@mattermost/types/users';

import './product_menu_list.scss';

export type Props = {
    isMobile: boolean;
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
    showVisitSystemConsoleTour: boolean;
    isStarterFree: boolean;
    isFreeTrial: boolean;
    onClick?: React.MouseEventHandler<HTMLElement>;
    handleVisitConsoleClick: React.MouseEventHandler<HTMLElement>;
    enableCustomUserGroups?: boolean;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        getPrevTrialLicense: () => void;
    };
};

const ProductMenuList = (props: Props): JSX.Element | null => {
    const {
        teamId,
        teamName,
        siteName,
        currentUser,
        appDownloadLink,
        isMessaging,
        enableCommands,
        enableIncomingWebhooks,
        enableOAuthServiceProvider,
        enableOutgoingWebhooks,
        canManageSystemBots,
        canManageIntegrations,
        enablePluginMarketplace,
        showVisitSystemConsoleTour,
        isStarterFree,
        isFreeTrial,
        onClick,
        handleVisitConsoleClick,
        isMobile = false,
        enableCustomUserGroups,
    } = props;
    const {formatMessage} = useIntl();

    useEffect(() => {
        props.actions.getPrevTrialLicense();
    }, []);

    if (!currentUser) {
        return null;
    }

    const openGroupsModal = () => {
        props.actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS,
            dialogType: UserGroupsModal,
            dialogProps: {
                backButtonAction: openGroupsModal,
            },
        });
    };

    const someIntegrationEnabled = enableIncomingWebhooks || enableOutgoingWebhooks || enableCommands || enableOAuthServiceProvider || canManageSystemBots;
    const showIntegrations = !isMobile && someIntegrationEnabled && canManageIntegrations;

    return (
        <Menu.Group>
            <div onClick={onClick}>
                <Menu.CloudTrial id='menuCloudTrial'/>
                <Menu.ItemCloudLimit id='menuItemCloudLimit'/>
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
                        text={(
                            <>
                                {formatMessage({id: 'navbar_dropdown.console', defaultMessage: 'System Console'})}
                                {showVisitSystemConsoleTour && (
                                    <div
                                        onClick={handleVisitConsoleClick}
                                        className={'system-console-visit'}
                                    >
                                        <VisitSystemConsoleTour/>
                                    </div>
                                )}
                            </>
                        )}
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
                    to={'/' + teamName + '/integrations'}
                    text={formatMessage({id: 'navbar_dropdown.integrations', defaultMessage: 'Integrations'})}
                    icon={
                        <Icon
                            size={16}
                            glyph={'webhook-incoming'}
                        />
                    }
                />
                <Menu.ItemToggleModalRedux
                    id='userGroups'
                    modalId={ModalIdentifiers.USER_GROUPS}
                    show={enableCustomUserGroups || isStarterFree || isFreeTrial}
                    dialogType={UserGroupsModal}
                    dialogProps={{
                        backButtonAction: openGroupsModal,
                    }}
                    text={formatMessage({id: 'navbar_dropdown.userGroups', defaultMessage: 'User Groups'})}
                    icon={
                        <Icon
                            size={16}
                            glyph={'account-multiple-outline'}
                        />
                    }
                    disabled={isStarterFree}
                    sibling={(isStarterFree || isFreeTrial) && (
                        <RestrictedIndicator
                            blocked={isStarterFree}
                            feature={MattermostFeatures.CUSTOM_USER_GROUPS}
                            minimumPlanRequiredForFeature={LicenseSkus.Professional}
                            tooltipMessage={formatMessage({
                                id: 'navbar_dropdown.userGroups.tooltip.cloudFreeTrial',
                                defaultMessage: 'During your trial you are able to create user groups. These user groups will be archived after your trial.',
                            })}
                            titleAdminPreTrial={formatMessage({
                                id: 'navbar_dropdown.userGroups.modal.titleAdminPreTrial',
                                defaultMessage: 'Try unlimited user groups with a free trial',
                            })}
                            messageAdminPreTrial={formatMessage({
                                id: 'navbar_dropdown.userGroups.modal.messageAdminPreTrial',
                                defaultMessage: 'Create unlimited user groups with one of our paid plans. Get the full experience of Enterprise when you start a free, {trialLength} day trial.',
                            },
                            {
                                trialLength: FREEMIUM_TO_ENTERPRISE_TRIAL_LENGTH_DAYS,
                            },
                            )}
                            titleAdminPostTrial={formatMessage({
                                id: 'navbar_dropdown.userGroups.modal.titleAdminPostTrial',
                                defaultMessage: 'Upgrade to create unlimited user groups',
                            })}
                            messageAdminPostTrial={formatMessage({
                                id: 'navbar_dropdown.userGroups.modal.messageAdminPostTrial',
                                defaultMessage: 'User groups are a way to organize users and apply actions to all users within that group. Upgrade to the Professional plan to create unlimited user groups.',
                            })}
                            titleEndUser={formatMessage({
                                id: 'navbar_dropdown.userGroups.modal.titleEndUser',
                                defaultMessage: 'User groups available in paid plans',
                            })}
                            messageEndUser={formatMessage({
                                id: 'navbar_dropdown.userGroups.modal.messageEndUser',
                                defaultMessage: 'User groups are a way to organize users and apply actions to all users within that group.',
                            })}
                        />
                    )}
                />
                <TeamPermissionGate
                    teamId={teamId}
                    permissions={[Permissions.SYSCONSOLE_WRITE_PLUGINS]}
                >
                    <Menu.ItemToggleModalRedux
                        id='marketplaceModal'
                        modalId={ModalIdentifiers.PLUGIN_MARKETPLACE}
                        show={isMessaging && !isMobile && enablePluginMarketplace}
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
                    show={appDownloadLink && !UserAgent.isMobileApp()}
                    url={makeUrlSafe(appDownloadLink)}
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
                    text={formatMessage({id: 'navbar_dropdown.about', defaultMessage: 'About {appTitle}'}, {appTitle: siteName})}
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
};

export default ProductMenuList;
