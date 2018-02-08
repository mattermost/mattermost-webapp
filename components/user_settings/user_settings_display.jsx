// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {savePreferences} from 'actions/user_actions.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import UserStore from 'stores/user_store.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import * as I18n from 'i18n/i18n.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

import ManageLanguages from './manage_languages.jsx';
import ThemeSetting from './user_settings_theme.jsx';

const Preferences = Constants.Preferences;

function getDisplayStateFromStores() {
    return {
        militaryTime: PreferenceStore.get(Preferences.CATEGORY_DISPLAY_SETTINGS, 'use_military_time', 'false'),
        channelDisplayMode: PreferenceStore.get(Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT),
        messageDisplay: PreferenceStore.get(Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT),
        collapseDisplay: PreferenceStore.get(Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLLAPSE_DISPLAY, Preferences.COLLAPSE_DISPLAY_DEFAULT),
        linkPreviewDisplay: PreferenceStore.get(Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.LINK_PREVIEW_DISPLAY, Preferences.LINK_PREVIEW_DISPLAY_DEFAULT)
    };
}

export default class UserSettingsDisplay extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ...getDisplayStateFromStores(),
            isSaving: false
        };

        this.prevSections = {
            theme: 'dummySectionName', // dummy value that should never match any section name
            clock: 'theme',
            linkpreview: 'clock',
            message_display: 'linkpreview',
            channel_display_mode: 'message_display',
            languages: 'channel_display_mode'
        };
    }

    handleSubmit = () => {
        const userId = UserStore.getCurrentId();

        const timePreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: 'use_military_time',
            value: this.state.militaryTime
        };

        const channelDisplayModePreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.CHANNEL_DISPLAY_MODE,
            value: this.state.channelDisplayMode
        };
        const messageDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.MESSAGE_DISPLAY,
            value: this.state.messageDisplay
        };
        const collapseDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.COLLAPSE_DISPLAY,
            value: this.state.collapseDisplay
        };
        const linkPreviewDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.LINK_PREVIEW_DISPLAY,
            value: this.state.linkPreviewDisplay
        };

        this.setState({isSaving: true});

        savePreferences(
            [
                timePreference,
                channelDisplayModePreference,
                messageDisplayPreference,
                collapseDisplayPreference,
                linkPreviewDisplayPreference
            ],
            () => {
                this.updateSection('');
            }
        );
    }

    handleClockRadio = (militaryTime) => {
        this.setState({militaryTime});
    }

    handleChannelDisplayModeRadio(channelDisplayMode) {
        this.setState({channelDisplayMode});
    }

    handlemessageDisplayRadio(messageDisplay) {
        this.setState({messageDisplay});
    }

    handleCollapseRadio(collapseDisplay) {
        this.setState({collapseDisplay});
    }

    handleLinkPreviewRadio(linkPreviewDisplay) {
        this.setState({linkPreviewDisplay});
    }

    handleOnChange(display) {
        this.setState({...display});
    }

    updateSection = (section) => {
        this.updateState();
        this.props.updateSection(section);
    }

    updateState = () => {
        const newState = getDisplayStateFromStores();
        if (!Utils.areObjectsEqual(newState, this.state)) {
            this.setState(newState);
        }

        this.setState({isSaving: false});
    }

    createSection(props) {
        const {
            section,
            display,
            value,
            title,
            firstOption,
            secondOption,
            description
        } = props;

        const firstMessage = (
            <FormattedMessage
                id={firstOption.radionButtonText.id}
                defaultMessage={firstOption.radionButtonText.message}
            />
        );

        let moreColon;
        let firstMessageMore;
        if (firstOption.radionButtonText.moreId) {
            moreColon = ': ';
            firstMessageMore = (
                <span className='font-weight--normal'>
                    <FormattedMessage
                        id={firstOption.radionButtonText.moreId}
                        defaultMessage={firstOption.radionButtonText.moreMessage}
                    />
                </span>
            );
        }

        let secondMessageMore;
        if (secondOption.radionButtonText.moreId) {
            secondMessageMore = (
                <span className='font-weight--normal'>
                    <FormattedMessage
                        id={secondOption.radionButtonText.moreId}
                        defaultMessage={secondOption.radionButtonText.moreMessage}
                    />
                </span>
            );
        }

        const secondMessage = (
            <FormattedMessage
                id={secondOption.radionButtonText.id}
                defaultMessage={secondOption.radionButtonText.message}
            />
        );

        const messageTitle = (
            <FormattedMessage
                id={title.id}
                defaultMessage={title.message}
            />
        );

        const messageDesc = (
            <FormattedMessage
                id={description.id}
                defaultMessage={description.message}
            />
        );

        if (this.props.activeSection === section) {
            const format = [false, false];
            if (value === firstOption.value) {
                format[0] = true;
            } else {
                format[1] = true;
            }

            const name = section + 'Format';
            const key = section + 'UserDisplay';

            const firstDisplay = {};
            firstDisplay[display] = firstOption.value;

            const secondDisplay = {};
            secondDisplay[display] = secondOption.value;

            const inputs = [
                <div key={key}>
                    <div className='radio'>
                        <label>
                            <input
                                id={name + 'A'}
                                type='radio'
                                name={name}
                                checked={format[0]}
                                onChange={() => this.handleOnChange(firstDisplay)}
                            />
                            {firstMessage}
                            {moreColon}
                            {firstMessageMore}
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id={name + 'B'}
                                type='radio'
                                name={name}
                                checked={format[1]}
                                onChange={() => this.handleOnChange(secondDisplay)}
                            />
                            {secondMessage}
                            {moreColon}
                            {secondMessageMore}
                        </label>
                        <br/>
                    </div>
                    <div>
                        <br/>
                        {messageDesc}
                    </div>
                </div>
            ];

            return (
                <div>
                    <SettingItemMax
                        title={messageTitle}
                        inputs={inputs}
                        submit={this.handleSubmit}
                        saving={this.state.isSaving}
                        server_error={this.state.serverError}
                        updateSection={this.updateSection}
                    />
                    <div className='divider-dark'/>
                </div>
            );
        }

        let describe;
        if (value === firstOption.value) {
            describe = firstMessage;
        } else {
            describe = secondMessage;
        }

        return (
            <div>
                <SettingItemMin
                    title={messageTitle}
                    describe={describe}
                    focused={this.props.prevActiveSection === this.prevSections[section]}
                    section={section}
                    updateSection={this.updateSection}
                />
                <div className='divider-dark'/>
            </div>
        );
    }

    render() {
        const collapseSection = this.createSection({
            section: 'collapse',
            display: 'collapseDisplay',
            value: this.state.collapseDisplay,
            defaultDisplay: 'false',
            title: {
                id: 'user.settings.display.collapseDisplay',
                message: 'Default appearance of image link previews'
            },
            firstOption: {
                value: 'false',
                radionButtonText: {
                    id: 'user.settings.display.collapseOn',
                    message: 'On'
                }
            },
            secondOption: {
                value: 'true',
                radionButtonText: {
                    id: 'user.settings.display.collapseOff',
                    message: 'Off'
                }
            },
            description: {
                id: 'user.settings.display.collapseDesc',
                message: 'Set whether previews of image links show as expanded or collapsed by default. This setting can also be controlled using the slash commands /expand and /collapse.'
            }
        });

        const isEnableLinkPreviews = global.window.mm_config.EnableLinkPreviews === 'true';
        let linkPreviewSection = null;

        if (isEnableLinkPreviews) {
            linkPreviewSection = this.createSection({
                section: 'linkpreview',
                display: 'linkPreviewDisplay',
                value: this.state.linkPreviewDisplay,
                defaultDisplay: 'true',
                title: {
                    id: 'user.settings.display.linkPreviewDisplay',
                    message: 'Website Link Previews'
                },
                firstOption: {
                    value: 'true',
                    radionButtonText: {
                        id: 'user.settings.display.linkPreviewOn',
                        message: 'On'
                    }
                },
                secondOption: {
                    value: 'false',
                    radionButtonText: {
                        id: 'user.settings.display.linkPreviewOff',
                        message: 'Off'
                    }
                },
                description: {
                    id: 'user.settings.display.linkPreviewDesc',
                    message: 'When available, the first web link in a message will show a preview of the website content below the message.'
                }
            });
            this.prevSections.message_display = 'linkpreview';
        } else {
            this.prevSections.message_display = this.prevSections.linkpreview;
        }

        const clockSection = this.createSection({
            section: 'clock',
            display: 'militaryTime',
            value: this.state.militaryTime,
            defaultDisplay: 'false',
            title: {
                id: 'user.settings.display.clockDisplay',
                message: 'Clock Display'
            },
            firstOption: {
                value: 'false',
                radionButtonText: {
                    id: 'user.settings.display.normalClock',
                    message: '12-hour clock (example: 4:00 PM)'
                }
            },
            secondOption: {
                value: 'true',
                radionButtonText: {
                    id: 'user.settings.display.militaryClock',
                    message: '24-hour clock (example: 16:00)'
                }
            },
            description: {
                id: 'user.settings.display.preferTime',
                message: 'Select how you prefer time displayed.'
            }
        });

        const messageDisplaySection = this.createSection({
            section: Preferences.MESSAGE_DISPLAY,
            display: 'messageDisplay',
            value: this.state.messageDisplay,
            defaultDisplay: Preferences.MESSAGE_DISPLAY_CLEAN,
            title: {
                id: 'user.settings.display.messageDisplayTitle',
                message: 'Message Display'
            },
            firstOption: {
                value: Preferences.MESSAGE_DISPLAY_CLEAN,
                radionButtonText: {
                    id: 'user.settings.display.messageDisplayClean',
                    message: 'Standard',
                    moreId: 'user.settings.display.messageDisplayCleanDes',
                    moreMessage: 'Easy to scan and read.'
                }
            },
            secondOption: {
                value: Preferences.MESSAGE_DISPLAY_COMPACT,
                radionButtonText: {
                    id: 'user.settings.display.messageDisplayCompact',
                    message: 'Compact',
                    moreId: 'user.settings.display.messageDisplayCompactDes',
                    moreMessage: 'Fit as many messages on the screen as we can.'
                }
            },
            description: {
                id: 'user.settings.display.messageDisplayDescription',
                message: 'Select how messages in a channel should be displayed.'
            }
        });

        const channelDisplayModeSection = this.createSection({
            section: Preferences.CHANNEL_DISPLAY_MODE,
            display: 'channelDisplayMode',
            value: this.state.channelDisplayMode,
            defaultDisplay: Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
            title: {
                id: 'user.settings.display.channelDisplayTitle',
                message: 'Channel Display Mode'
            },
            firstOption: {
                value: Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
                radionButtonText: {
                    id: 'user.settings.display.fullScreen',
                    message: 'Full width'
                }
            },
            secondOption: {
                value: Preferences.CHANNEL_DISPLAY_MODE_CENTERED,
                radionButtonText: {
                    id: 'user.settings.display.fixedWidthCentered',
                    message: 'Fixed width, centered'
                }
            },
            description: {
                id: 'user.settings.display.channeldisplaymode',
                message: 'Select the width of the center channel.'
            }
        });

        let languagesSection;
        let userLocale = this.props.user.locale;
        if (this.props.activeSection === 'languages') {
            if (!I18n.isLanguageAvailable(userLocale)) {
                userLocale = global.window.mm_config.DefaultClientLocale;
            }
            languagesSection = (
                <div>
                    <ManageLanguages
                        user={this.props.user}
                        locale={userLocale}
                        updateSection={this.updateSection}
                    />
                    <div className='divider-dark'/>
                </div>
            );
        } else {
            let locale;
            if (I18n.isLanguageAvailable(userLocale)) {
                locale = I18n.getLanguageInfo(userLocale).name;
            } else {
                locale = I18n.getLanguageInfo(global.window.mm_config.DefaultClientLocale).name;
            }

            languagesSection = (
                <div>
                    <SettingItemMin
                        title={
                            <FormattedMessage
                                id='user.settings.display.language'
                                defaultMessage='Language'
                            />
                        }
                        width='medium'
                        describe={locale}
                        focused={this.props.prevActiveSection === this.prevSections.languages}
                        section={'languages'}
                        updateSection={this.updateSection}
                    />
                    <div className='divider-dark'/>
                </div>
            );
        }

        if (Object.keys(I18n.getLanguages()).length === 1) {
            languagesSection = null;
        }

        let themeSection;
        if (global.mm_config.EnableThemeSelection !== 'false') {
            themeSection = (
                <div>
                    <ThemeSetting
                        selected={this.props.activeSection === 'theme'}
                        updateSection={this.updateSection}
                        setRequireConfirm={this.props.setRequireConfirm}
                        setEnforceFocus={this.props.setEnforceFocus}
                    />
                    <div className='divider-dark'/>
                </div>
            );
        }

        return (
            <div id='displaySettings'>
                <div className='modal-header'>
                    <button
                        id='closeButton'
                        type='button'
                        className='close'
                        data-dismiss='modal'
                        aria-label='Close'
                        onClick={this.props.closeModal}
                    >
                        <span aria-hidden='true'>{'×'}</span>
                    </button>
                    <h4
                        className='modal-title'
                        ref='title'
                    >
                        <div className='modal-back'>
                            <i
                                className='fa fa-angle-left'
                                onClick={this.props.collapseModal}
                            />
                        </div>
                        <FormattedMessage
                            id='user.settings.display.title'
                            defaultMessage='Display Settings'
                        />
                    </h4>
                </div>
                <div className='user-settings'>
                    <h3
                        id='displaySettingsTitle'
                        className='tab-header'
                    >
                        <FormattedMessage
                            id='user.settings.display.title'
                            defaultMessage='Display Settings'
                        />
                    </h3>
                    <div className='divider-dark first'/>
                    {themeSection}
                    {clockSection}
                    {linkPreviewSection}
                    {collapseSection}
                    {messageDisplaySection}
                    {channelDisplayModeSection}
                    {languagesSection}
                </div>
            </div>
        );
    }
}

UserSettingsDisplay.propTypes = {
    user: PropTypes.object,
    updateSection: PropTypes.func,
    activeSection: PropTypes.string,
    prevActiveSection: PropTypes.string,
    closeModal: PropTypes.func.isRequired,
    collapseModal: PropTypes.func.isRequired,
    setRequireConfirm: PropTypes.func.isRequired,
    setEnforceFocus: PropTypes.func.isRequired
};
