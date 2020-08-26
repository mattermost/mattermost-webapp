// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {openModal, closeModal} from 'actions/views/modals';
import Card from 'components/card/card';
import MarketplaceModal from 'components/plugin_marketplace';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import downloadApps from 'images/download-app.svg';
import {browserHistory} from 'utils/browser_history';
import * as UserAgent from 'utils/user_agent';
import Constants, {ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils';
import TeamMembersModal from 'components/team_members_modal';
import {toggleShortcutsModal} from 'actions/global_actions.jsx';
import NewChannelFlow from 'components/new_channel_flow';
import MoreChannels from 'components/more_channels';
const seeAllApps = () => {
    window.open('https://mattermost.com/download/#mattermostApps', '_blank');
};

const downloadLatest = () => {
    const baseLatestURL = 'https://latest.mattermost.com/mattermost-desktop-';

    if (UserAgent.isWindows()) {
        window.open(`${baseLatestURL}exe`, '_blank');
        return;
    }

    if (UserAgent.isMac()) {
        window.open(`${baseLatestURL}dmg`, '_blank');
        return;
    }

    // TODO: isLinux?

    seeAllApps();
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

const openAuthPage = (page: string) => {
    browserHistory.push(`/admin_console/authentication/${page}`);
};

export default function NextStepsTips(props: {
    showFinalScreen: boolean;
    animating: boolean;
    stopAnimating: () => void;
    isAdmin: boolean;
}) {
    const dispatch = useDispatch();
    const openPluginMarketplace = openModal({
        modalId: ModalIdentifiers.PLUGIN_MARKETPLACE,
        dialogType: MarketplaceModal,
    });
    const openViewMembersModal = openModal({
        modalId: ModalIdentifiers.TEAM_MEMBERS,
        dialogType: TeamMembersModal,
    });

    const handleCloseModal = (modalId: string) => {
        dispatch(closeModal(modalId));
    };

    const handleNewChannelClick = () => {
        handleCloseModal(ModalIdentifiers.MORE_CHANNELS);
        dispatch(
            openModal({
                modalId: ModalIdentifiers.CREATE_CHANNEL,
                dialogProps: {
                    onModalDismissed: () =>
                        handleCloseModal(ModalIdentifiers.CREATE_CHANNEL),
                    canCreatePrivateChannel: false,
                    canCreatePublicChannel: false,
                    channelType: Constants.OPEN_CHANNEL,
                    show: true,
                },
                dialogType: NewChannelFlow,
            })
        );
    };

    const showMoreChannelsModal = () => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.MORE_CHANNELS,
                dialogProps: {
                    onModalDismissed: () =>
                        dispatch(closeModal(ModalIdentifiers.MORE_CHANNELS)),
                    morePublicChannelsModalType: 'public',
                    handleNewChannel: handleNewChannelClick,
                },
                dialogType: MoreChannels,
            })
        );
    };

    let nonMobileTips;
    if (!Utils.isMobile() && props.isAdmin) {
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
                            <button className='NextStepsView__button NextStepsView__finishButton primary'>
                                <FormattedMessage
                                    id='next_steps_view.tips.configureLogin.button'
                                    defaultMessage='Configure'
                                />
                                <i className='icon icon-chevron-down'/>
                            </button>
                            <Menu
                                ariaLabel={Utils.localizeMessage(
                                    'next_steps_view.tips.auth.menuAriaLabel',
                                    'Configure Authentication Menu'
                                )}
                            >
                                <Menu.ItemAction
                                    onClick={() => openAuthPage('oauth')}
                                    text={Utils.localizeMessage(
                                        'next_steps_view.tips.auth.oauth',
                                        'OAuth'
                                    )}
                                />
                                <Menu.ItemAction
                                    onClick={() => openAuthPage('saml')}
                                    text={Utils.localizeMessage(
                                        'next_steps_view.tips.auth.saml',
                                        'SAML'
                                    )}
                                />
                                <Menu.ItemAction
                                    onClick={() => openAuthPage('ldap')}
                                    text={Utils.localizeMessage(
                                        'next_steps_view.tips.auth.ldap',
                                        'AD/LDAP'
                                    )}
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
                            onClick={() => openPluginMarketplace(dispatch)}
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
    } else if (!Utils.isMobile() && !props.isAdmin) {
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
                                id='next_steps_view.tips.addPlugins.buttons'
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
                            onClick={downloadLatest}
                        >
                            {getDownloadButtonString()}
                        </button>
                        <button
                            className='NextStepsView__button NextStepsView__downloadAnyButton tertiary'
                            onClick={seeAllApps}
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

    return (
        <div
            className={classNames(
                'NextStepsView__viewWrapper NextStepsView__completedView',
                {
                    completed: props.showFinalScreen,
                    animating: props.animating,
                }
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
            </header>
            <div className='NextStepsView__body'>
                <div className='NextStepsView__nextStepsCards'>
                    {/* This remains commented until the tour exists
                    <Card expanded={true}>
              <div className="Card__body">
                <h3>
                  <FormattedMessage
                    id="next_steps_view.tips.takeATour"
                    defaultMessage="Take a tour"
                  />
                </h3>
                <FormattedMessage
                  id="next_steps_view.tips.takeATour.text"
                  defaultMessage="Let us show you around with a guided tour of the interface."
                />
                <button
                  className="NextStepsView__button NextStepsView__finishButton primary"
                  onClick={() => {}}
                >
                  <FormattedMessage
                    id="next_steps_view.tips.takeATour.button"
                    defaultMessage="Take the tour"
                  />
                </button>
              </div>
            </Card> */}
                    <Card expanded={true}>
                        <div className='Card__body'>
                            <h3>
                                <FormattedMessage
                                    id='next_steps_view.tips.takeATours'
                                    defaultMessage='Explore Channels'
                                />
                            </h3>
                            <FormattedMessage
                                id='next_steps_view.tips.takeATour.texts'
                                defaultMessage='See the channels in your workspace or create a new channel.'
                            />
                            <button
                                className='NextStepsView__button NextStepsView__finishButton primary'
                                onClick={showMoreChannelsModal}
                            >
                                <FormattedMessage
                                    id='next_steps_view.tips.takeATour.buttons'
                                    defaultMessage='Browse Channels'
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
