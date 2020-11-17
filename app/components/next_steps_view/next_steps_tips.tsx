// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {PreferenceType} from 'mattermost-redux/types/preferences';

import {trackEvent} from 'actions/telemetry_actions';
import {toggleShortcutsModal} from 'actions/global_actions';
import {openModal, closeModal} from 'actions/views/modals';
import Card from 'components/card/card';
import MoreChannels from 'components/more_channels';
import TeamMembersModal from 'components/team_members_modal';
import MarketplaceModal from 'components/plugin_marketplace';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import RemoveNextStepsModal from 'components/sidebar/sidebar_next_steps/remove_next_steps_modal';
import Menu from 'components/widgets/menu/menu';
import downloadApps from 'images/download-app.svg';
import {browserHistory} from 'utils/browser_history';
import * as UserAgent from 'utils/user_agent';
import NewChannelFlow from 'components/new_channel_flow';
import {
    ModalIdentifiers,
    RecommendedNextSteps,
    Preferences,
} from 'utils/constants';
import CloseIcon from 'components/widgets/icons/close_icon';
import * as Utils from 'utils/utils';

import {getAnalyticsCategory} from './step_helpers';

const seeAllApps = (isAdmin: boolean) => {
    trackEvent(getAnalyticsCategory(isAdmin), 'cloud_see_all_apps');
    window.open('https://mattermost.com/download/#mattermostApps', '_blank');
};

const downloadLatest = (isAdmin: boolean) => {
    const baseLatestURL = 'https://latest.mattermost.com/mattermost-desktop-';

    if (UserAgent.isWindows()) {
        trackEvent(getAnalyticsCategory(isAdmin), 'click_download_app', {app: 'windows'});
        window.open(`${baseLatestURL}exe`, '_blank');
        return;
    }

    if (UserAgent.isMac()) {
        trackEvent(getAnalyticsCategory(isAdmin), 'click_download_app', {app: 'mac'});
        window.open(`${baseLatestURL}dmg`, '_blank');
        return;
    }

    // TODO: isLinux?

    seeAllApps(isAdmin);
};

const getDownloadButtonString = () => {
    if (UserAgent.isWindows()) {
        return (
            <FormattedMessage
                id='next_steps_view.tips.downloadForWindows'
                defaultMessage='Download Mattermost for Windows'
            />
        );
    }

    if (UserAgent.isMac()) {
        return (
            <FormattedMessage
                id='next_steps_view.tips.downloadForMac'
                defaultMessage='Download Mattermost for Mac'
            />
        );
    }

    // TODO: isLinux?

    return (
        <FormattedMessage
            id='next_steps_view.tips.downloadForDefault'
            defaultMessage='Download Mattermost'
        />
    );
};

const openAuthPage = (page: string, isAdmin: boolean) => {
    trackEvent(getAnalyticsCategory(isAdmin), 'click_configure_login', {method: page});
    browserHistory.push(`/admin_console/authentication/${page}`);
};

type Props = {
    showFinalScreen: boolean;
    animating: boolean;
    currentUserId: string;
    isFirstAdmin: boolean,
    stopAnimating: () => void;
    savePreferences: (userId: string, preferences: PreferenceType[]) => void;
    setShowNextStepsView: (show: boolean) => void;
}

export default function NextStepsTips(props: Props) {
    const dispatch = useDispatch();
    const openPluginMarketplace = () => {
        trackEvent(getAnalyticsCategory(props.isFirstAdmin), 'click_add_plugins');
        openModal({modalId: ModalIdentifiers.PLUGIN_MARKETPLACE, dialogType: MarketplaceModal})(dispatch);
    };
    const openMoreChannels = openModal({modalId: ModalIdentifiers.MORE_CHANNELS, dialogType: MoreChannels});
    const openNewChannels = openModal({
        modalId: ModalIdentifiers.NEW_CHANNEL_FLOW,
        dialogType: NewChannelFlow,
    });
    const openViewMembersModal = openModal({
        modalId: ModalIdentifiers.TEAM_MEMBERS,
        dialogType: TeamMembersModal,
    });

    const closeCloseNextStepsModal = closeModal(ModalIdentifiers.REMOVE_NEXT_STEPS_MODAL);

    const onCloseModal = () => closeCloseNextStepsModal(dispatch);

    const closeNextSteps = openModal({
        modalId: ModalIdentifiers.REMOVE_NEXT_STEPS_MODAL,
        dialogType: RemoveNextStepsModal,
        dialogProps: {
            screenTitle: Utils.localizeMessage(
                'sidebar_next_steps.tipsAndNextSteps',
                'Tips & Next Steps',
            ),
            onConfirm: () => {
                props.savePreferences(props.currentUserId, [
                    {
                        user_id: props.currentUserId,
                        category: Preferences.RECOMMENDED_NEXT_STEPS,
                        name: RecommendedNextSteps.HIDE,
                        value: 'true',
                    },
                ]);
                props.setShowNextStepsView(false);
                onCloseModal();
            },
            onCancel: onCloseModal,
        },
    });

    let nonMobileTips;
    if (!Utils.isMobile() && props.isFirstAdmin) {
        nonMobileTips = (
            <>
                <Card expanded={true}>
                    <div className='Card__body'>
                        <h3>
                            <FormattedMessage
                                id='next_steps_view.tips.configureLogin'
                                defaultMessage='Configure your login method'
                            />
                        </h3>
                        <FormattedMessage
                            id='next_steps_view.tips.configureLogin.text'
                            defaultMessage='Set up OAuth, SAML or AD/LDAP authentication.'
                        />
                        <MenuWrapper>
                            <button
                                className='NextStepsView__button NextStepsView__finishButton primary'
                            >
                                <FormattedMessage
                                    id='next_steps_view.tips.configureLogin.button'
                                    defaultMessage='Configure'
                                />
                                <i className='icon icon-chevron-down'/>
                            </button>
                            <Menu ariaLabel={Utils.localizeMessage('next_steps_view.tips.auth.menuAriaLabel', 'Configure Authentication Menu')}>
                                <Menu.ItemAction
                                    onClick={() => openAuthPage('oauth', props.isFirstAdmin)}
                                    text={Utils.localizeMessage('next_steps_view.tips.auth.oauth', 'OAuth')}
                                />
                                <Menu.ItemAction
                                    onClick={() => openAuthPage('saml', props.isFirstAdmin)}
                                    text={Utils.localizeMessage('next_steps_view.tips.auth.saml', 'SAML')}
                                />
                                <Menu.ItemAction
                                    onClick={() => openAuthPage('ldap', props.isFirstAdmin)}
                                    text={Utils.localizeMessage('next_steps_view.tips.auth.ldap', 'AD/LDAP')}
                                />
                            </Menu>
                        </MenuWrapper>
                    </div>
                </Card>
                <Card expanded={true}>
                    <div className='Card__body'>
                        <h3>
                            <FormattedMessage
                                id='next_steps_view.tips.addPlugins'
                                defaultMessage='Add plugins to Mattermost'
                            />
                        </h3>
                        <FormattedMessage
                            id='next_steps_view.tips.addPlugins.text'
                            defaultMessage='Visit the Plugins Marketplace to install and configure plugins.'
                        />
                        <button
                            className='NextStepsView__button NextStepsView__finishButton primary'
                            onClick={openPluginMarketplace}
                        >
                            <FormattedMessage
                                id='next_steps_view.tips.addPlugins.button'
                                defaultMessage='Add plugins'
                            />
                        </button>
                    </div>
                </Card>
            </>
        );
    } else if (!Utils.isMobile() && !props.isFirstAdmin) {
        nonMobileTips = (
            <>
                <Card expanded={true}>
                    <div className='Card__body'>
                        <h3>
                            <FormattedMessage
                                id='next_steps_view.tips.configureLogins'
                                defaultMessage='See who else is here'
                            />
                        </h3>
                        <FormattedMessage
                            id='next_steps_view.tips.configureLogin.texts'
                            defaultMessage='Browse or search through the team members directory'
                        />
                        <button
                            className='NextStepsView__button NextStepsView__finishButton primary'
                            onClick={() => openViewMembersModal(dispatch)}
                        >
                            <FormattedMessage
                                id='next_steps_view.tips.viewMembers'
                                defaultMessage='View team members'
                            />
                        </button>
                    </div>
                </Card>
                <Card expanded={true}>
                    <div className='Card__body'>
                        <h3>
                            <FormattedMessage
                                id='next_steps_view.tips.addPluginss'
                                defaultMessage='Learn Keyboard Shortcuts'
                            />
                        </h3>
                        <FormattedMessage
                            id='next_steps_view.tips.addPlugins.texts'
                            defaultMessage='Work more efficiently with Keyboard Shortcuts in Mattermost.'
                        />
                        <button
                            className='NextStepsView__button NextStepsView__finishButton primary'
                            onClick={toggleShortcutsModal}
                        >
                            <FormattedMessage
                                id='next_steps_view.tips.addPlugins.buttons'
                                defaultMessage='See shortcuts'
                            />
                        </button>
                    </div>
                </Card>
            </>
        );
    }

    let downloadSection;
    if (Utils.isMobile()) {
        downloadSection = (
            <div className='NextStepsView__tipsMobileMessage'>
                <Card expanded={true}>
                    <div className='Card__body'>
                        <i className='icon icon-laptop'/>
                        <FormattedMessage
                            id='next_steps_view.mobile_tips_message'
                            defaultMessage='To configure your workspace, continue on a desktop computer.'
                        />
                    </div>
                </Card>
            </div>
        );
    } else if (!UserAgent.isDesktopApp()) {
        downloadSection = (
            <div className='NextStepsView__download'>
                <img src={downloadApps}/>
                <div className='NextStepsView__downloadText'>
                    <h3>
                        <FormattedMessage
                            id='next_steps_view.downloadDesktopAndMobile'
                            defaultMessage='Download the Desktop and Mobile apps'
                        />
                    </h3>
                    <div className='NextStepsView__downloadButtons'>
                        <button
                            className='NextStepsView__button NextStepsView__downloadForPlatformButton secondary'
                            onClick={() => downloadLatest(props.isFirstAdmin)}
                        >
                            {getDownloadButtonString()}
                        </button>
                        <button
                            className='NextStepsView__button NextStepsView__downloadAnyButton tertiary'
                            onClick={() => seeAllApps(props.isFirstAdmin)}
                        >
                            <FormattedMessage
                                id='next_steps_view.seeAllTheApps'
                                defaultMessage='See all the apps'
                            />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    let channelSection = {
        titleId: 'next_steps_view.tips.exploreChannels',
        titleDefault: 'Explore channels',
        bodyId: 'next_steps_view.tips.exploreChannels.text',
        bodyDefault:
            'See the channels in your workspace or create a new channel.',
        buttonId: 'next_steps_view.tips.exploreChannels.button',
        buttonDefault: 'Browse channels',
        buttonAction: () => openMoreChannels(dispatch),
    };

    if (props.isFirstAdmin) {
        channelSection = {
            titleId: 'next_steps_view.tips.createChannels',
            titleDefault: 'Create a new channel',
            bodyId: 'next_steps_view.tips.createChannels.text',
            bodyDefault:
            "Think of a topic you'd like to organize a conversation around.",
            buttonId: 'next_steps_view.tips.createChannels.button',
            buttonDefault: 'Create a channel',
            buttonAction: () => openNewChannels(dispatch),
        };
    }

    return (
        <div
            className={classNames(
                'NextStepsView__viewWrapper NextStepsView__completedView',
                {
                    completed: props.showFinalScreen,
                    animating: props.animating,
                },
            )}
            onTransitionEnd={props.stopAnimating}
        >
            <header className='NextStepsView__header'>
                <div className='NextStepsView__header-headerText'>
                    <h1 className='NextStepsView__header-headerTopText'>
                        <FormattedMessage
                            id='next_steps_view.tipsAndNextSteps'
                            defaultMessage='Tips & Next Steps'
                        />
                    </h1>
                    <h2 className='NextStepsView__header-headerBottomText'>
                        <FormattedMessage
                            id='next_steps_view.otherAreasToExplore'
                            defaultMessage='A few other areas to explore'
                        />
                    </h2>
                </div>
                <CloseIcon
                    id='closeIcon'
                    className='close-icon'
                    onClick={() => closeNextSteps(dispatch)}
                />
            </header>
            <div className='NextStepsView__body'>
                <div className='NextStepsView__nextStepsCards'>
                    <Card expanded={true}>
                        <div className='Card__body'>
                            <h3>
                                <FormattedMessage
                                    id={channelSection.titleId}
                                    defaultMessage={channelSection.titleDefault}
                                />
                            </h3>
                            <FormattedMessage
                                id={channelSection.bodyId}
                                defaultMessage={channelSection.bodyDefault}
                            />
                            <button
                                className='NextStepsView__button NextStepsView__finishButton primary'
                                onClick={channelSection.buttonAction}
                            >
                                <FormattedMessage
                                    id={channelSection.buttonId}
                                    defaultMessage={channelSection.buttonDefault}
                                />
                            </button>
                        </div>
                    </Card>
                    {nonMobileTips}
                </div>
                {downloadSection}
            </div>
        </div>
    );
}
