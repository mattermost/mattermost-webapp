// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {getTimezoneRegion} from 'mattermost-redux/utils/timezone_utils';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {getBrowserTimezone} from 'utils/timezone.jsx';

import * as I18n from 'i18n/i18n.jsx';
import {t} from 'utils/i18n';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';
import ThemeSetting from 'components/user_settings/display/user_settings_theme';
import BackIcon from 'components/widgets/icons/fa_back_icon';

import ManageTimezones from './manage_timezones';
import ManageLanguages from './manage_languages';

const Preferences = Constants.Preferences;

function getDisplayStateFromProps(props) {
    return {
        militaryTime: props.militaryTime,
        teammateNameDisplay: props.teammateNameDisplay,
        channelDisplayMode: props.channelDisplayMode,
        messageDisplay: props.messageDisplay,
        collapseDisplay: props.collapseDisplay,
        linkPreviewDisplay: props.linkPreviewDisplay,
    };
}

export default class UserSettingsDisplay extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        updateSection: PropTypes.func,
        activeSection: PropTypes.string,
        prevActiveSection: PropTypes.string,
        closeModal: PropTypes.func.isRequired,
        collapseModal: PropTypes.func.isRequired,
        setRequireConfirm: PropTypes.func.isRequired,
        setEnforceFocus: PropTypes.func.isRequired,
        timezones: PropTypes.array.isRequired,
        userTimezone: PropTypes.object.isRequired,
        allowCustomThemes: PropTypes.bool,
        enableLinkPreviews: PropTypes.bool,
        defaultClientLocale: PropTypes.string,
        enableThemeSelection: PropTypes.bool,
        configTeammateNameDisplay: PropTypes.string,
        currentUserTimezone: PropTypes.string,
        enableTimezone: PropTypes.bool,
        shouldAutoUpdateTimezone: PropTypes.bool,
        militaryTime: PropTypes.string,
        teammateNameDisplay: PropTypes.string,
        channelDisplayMode: PropTypes.string,
        messageDisplay: PropTypes.string,
        collapseDisplay: PropTypes.string,
        linkPreviewDisplay: PropTypes.string,
        actions: PropTypes.shape({
            getSupportedTimezones: PropTypes.func.isRequired,
            autoUpdateTimezone: PropTypes.func.isRequired,
            savePreferences: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            ...getDisplayStateFromProps(props),
            isSaving: false,
        };

        if (props.timezones.length === 0) {
            props.actions.getSupportedTimezones();
        }

        this.prevSections = {
            theme: 'dummySectionName', // dummy value that should never match any section name
            clock: 'theme',
            linkpreview: 'clock',
            message_display: 'linkpreview',
            channel_display_mode: 'message_display',
            languages: 'channel_display_mode',
        };
    }

    componentDidMount() {
        const {actions, enableTimezone, shouldAutoUpdateTimezone} = this.props;

        if (enableTimezone && shouldAutoUpdateTimezone) {
            actions.autoUpdateTimezone(getBrowserTimezone());
        }
    }

    handleSubmit = async () => {
        const userId = this.props.user.id;

        const timePreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.USE_MILITARY_TIME,
            value: this.state.militaryTime,
        };
        const teammateNameDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.NAME_NAME_FORMAT,
            value: this.state.teammateNameDisplay,
        };
        const channelDisplayModePreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.CHANNEL_DISPLAY_MODE,
            value: this.state.channelDisplayMode,
        };
        const messageDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.MESSAGE_DISPLAY,
            value: this.state.messageDisplay,
        };
        const collapseDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.COLLAPSE_DISPLAY,
            value: this.state.collapseDisplay,
        };
        const linkPreviewDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.LINK_PREVIEW_DISPLAY,
            value: this.state.linkPreviewDisplay,
        };

        this.setState({isSaving: true});

        const preferences = [
            timePreference,
            channelDisplayModePreference,
            messageDisplayPreference,
            collapseDisplayPreference,
            linkPreviewDisplayPreference,
            teammateNameDisplayPreference,
        ];

        await this.props.actions.savePreferences(userId, preferences);

        this.updateSection('');
    }

    handleClockRadio = (militaryTime) => {
        this.setState({militaryTime});
    }

    handleTeammateNameDisplayRadio = (teammateNameDisplay) => {
        this.setState({teammateNameDisplay});
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
        const newState = getDisplayStateFromProps(this.props);
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
            thirdOption,
            description,
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

        const secondMessage = (
            <FormattedMessage
                id={secondOption.radionButtonText.id}
                defaultMessage={secondOption.radionButtonText.message}
            />
        );

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

        let thirdMessage;
        if (thirdOption) {
            thirdMessage = (
                <FormattedMessage
                    id={thirdOption.radionButtonText.id}
                    defaultMessage={thirdOption.radionButtonText.message}
                />
            );
        }

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
            const format = [false, false, false];
            if (value === firstOption.value) {
                format[0] = true;
            } else if (value === secondOption.value) {
                format[1] = true;
            } else {
                format[2] = true;
            }

            const name = section + 'Format';
            const key = section + 'UserDisplay';

            const firstDisplay = {};
            firstDisplay[display] = firstOption.value;

            const secondDisplay = {};
            secondDisplay[display] = secondOption.value;

            const thirdDisplay = {};
            if (thirdOption) {
                thirdDisplay[display] = thirdOption.value;
            }

            let thirdSection;
            if (thirdMessage) {
                thirdSection = (
                    <div className='radio'>
                        <label>
                            <input
                                id={name + 'C'}
                                type='radio'
                                name={name}
                                checked={format[2]}
                                onChange={() => this.handleOnChange(thirdDisplay)}
                            />
                            {thirdMessage}
                        </label>
                        <br/>
                    </div>
                );
            }

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
                    {thirdSection}
                    <div>
                        <br/>
                        {messageDesc}
                    </div>
                </div>,
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
        } else if (value === secondOption.value) {
            describe = secondMessage;
        } else {
            describe = thirdMessage;
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
                id: t('user.settings.display.collapseDisplay'),
                message: 'Default appearance of image previews',
            },
            firstOption: {
                value: 'false',
                radionButtonText: {
                    id: t('user.settings.display.collapseOn'),
                    message: 'On',
                },
            },
            secondOption: {
                value: 'true',
                radionButtonText: {
                    id: t('user.settings.display.collapseOff'),
                    message: 'Off',
                },
            },
            description: {
                id: t('user.settings.display.collapseDesc'),
                message: 'Set whether previews of image links and image attachment thumbnails show as expanded or collapsed by default. This setting can also be controlled using the slash commands /expand and /collapse.',
            },
        });

        let linkPreviewSection = null;

        if (this.props.enableLinkPreviews) {
            linkPreviewSection = this.createSection({
                section: 'linkpreview',
                display: 'linkPreviewDisplay',
                value: this.state.linkPreviewDisplay,
                defaultDisplay: 'true',
                title: {
                    id: t('user.settings.display.linkPreviewDisplay'),
                    message: 'Website Link Previews',
                },
                firstOption: {
                    value: 'true',
                    radionButtonText: {
                        id: t('user.settings.display.linkPreviewOn'),
                        message: 'On',
                    },
                },
                secondOption: {
                    value: 'false',
                    radionButtonText: {
                        id: t('user.settings.display.linkPreviewOff'),
                        message: 'Off',
                    },
                },
                description: {
                    id: t('user.settings.display.linkPreviewDesc'),
                    message: 'When available, the first web link in a message will show a preview of the website content below the message.',
                },
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
                id: t('user.settings.display.clockDisplay'),
                message: 'Clock Display',
            },
            firstOption: {
                value: 'false',
                radionButtonText: {
                    id: t('user.settings.display.normalClock'),
                    message: '12-hour clock (example: 4:00 PM)',
                },
            },
            secondOption: {
                value: 'true',
                radionButtonText: {
                    id: t('user.settings.display.militaryClock'),
                    message: '24-hour clock (example: 16:00)',
                },
            },
            description: {
                id: t('user.settings.display.preferTime'),
                message: 'Select how you prefer time displayed.',
            },
        });

        const teammateNameDisplaySection = this.createSection({
            section: Preferences.NAME_NAME_FORMAT,
            display: 'teammateNameDisplay',
            value: this.state.teammateNameDisplay,
            defaultDisplay: this.props.configTeammateNameDisplay,
            title: {
                id: t('user.settings.display.teammateNameDisplayTitle'),
                message: 'Teammate Name Display',
            },
            firstOption: {
                value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME,
                radionButtonText: {
                    id: t('user.settings.display.teammateNameDisplayUsername'),
                    message: 'Show username',
                },
            },
            secondOption: {
                value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_NICKNAME_FULLNAME,
                radionButtonText: {
                    id: t('user.settings.display.teammateNameDisplayNicknameFullname'),
                    message: 'Show nickname if one exists, otherwise show first and last name',
                },
            },
            thirdOption: {
                value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_FULLNAME,
                radionButtonText: {
                    id: t('user.settings.display.teammateNameDisplayFullname'),
                    message: 'Show first and last name',
                },
            },
            description: {
                id: t('user.settings.display.teammateNameDisplayDescription'),
                message: 'Set how to display other user\'s names in posts and the Direct Messages list.',
            },
        });

        let timezoneSelection;
        if (this.props.enableTimezone && !this.props.shouldAutoUpdateTimezone) {
            const userTimezone = this.props.userTimezone;
            if (this.props.activeSection === 'timezone') {
                timezoneSelection = (
                    <div>
                        <ManageTimezones
                            user={this.props.user}
                            timezones={this.props.timezones}
                            useAutomaticTimezone={userTimezone.useAutomaticTimezone}
                            automaticTimezone={userTimezone.automaticTimezone}
                            manualTimezone={userTimezone.manualTimezone}
                            updateSection={this.updateSection}
                        />
                        <div className='divider-dark'/>
                    </div>
                );
            } else {
                timezoneSelection = (
                    <div>
                        <SettingItemMin
                            title={
                                <FormattedMessage
                                    id='user.settings.display.timezone'
                                    defaultMessage='Timezone'
                                />
                            }
                            width='medium'
                            describe={getTimezoneRegion(this.props.currentUserTimezone)}
                            section={'timezone'}
                            updateSection={this.updateSection}
                        />
                        <div className='divider-dark'/>
                    </div>
                );
            }
        }

        const messageDisplaySection = this.createSection({
            section: Preferences.MESSAGE_DISPLAY,
            display: 'messageDisplay',
            value: this.state.messageDisplay,
            defaultDisplay: Preferences.MESSAGE_DISPLAY_CLEAN,
            title: {
                id: t('user.settings.display.messageDisplayTitle'),
                message: 'Message Display',
            },
            firstOption: {
                value: Preferences.MESSAGE_DISPLAY_CLEAN,
                radionButtonText: {
                    id: t('user.settings.display.messageDisplayClean'),
                    message: 'Standard',
                    moreId: t('user.settings.display.messageDisplayCleanDes'),
                    moreMessage: 'Easy to scan and read.',
                },
            },
            secondOption: {
                value: Preferences.MESSAGE_DISPLAY_COMPACT,
                radionButtonText: {
                    id: t('user.settings.display.messageDisplayCompact'),
                    message: 'Compact',
                    moreId: t('user.settings.display.messageDisplayCompactDes'),
                    moreMessage: 'Fit as many messages on the screen as we can.',
                },
            },
            description: {
                id: t('user.settings.display.messageDisplayDescription'),
                message: 'Select how messages in a channel should be displayed.',
            },
        });

        const channelDisplayModeSection = this.createSection({
            section: Preferences.CHANNEL_DISPLAY_MODE,
            display: 'channelDisplayMode',
            value: this.state.channelDisplayMode,
            defaultDisplay: Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
            title: {
                id: t('user.settings.display.channelDisplayTitle'),
                message: 'Channel Display',
            },
            firstOption: {
                value: Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
                radionButtonText: {
                    id: t('user.settings.display.fullScreen'),
                    message: 'Full width',
                },
            },
            secondOption: {
                value: Preferences.CHANNEL_DISPLAY_MODE_CENTERED,
                radionButtonText: {
                    id: t('user.settings.display.fixedWidthCentered'),
                    message: 'Fixed width, centered',
                },
            },
            description: {
                id: t('user.settings.display.channeldisplaymode'),
                message: 'Select the width of the center channel.',
            },
        });

        let languagesSection;
        let userLocale = this.props.user.locale;
        if (this.props.activeSection === 'languages') {
            if (!I18n.isLanguageAvailable(userLocale)) {
                userLocale = this.props.defaultClientLocale;
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
                locale = I18n.getLanguageInfo(this.props.defaultClientLocale).name;
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
        if (this.props.enableThemeSelection) {
            themeSection = (
                <div>
                    <ThemeSetting
                        selected={this.props.activeSection === 'theme'}
                        updateSection={this.updateSection}
                        setRequireConfirm={this.props.setRequireConfirm}
                        setEnforceFocus={this.props.setEnforceFocus}
                        allowCustomThemes={this.props.allowCustomThemes}
                        focused={this.props.prevActiveSection === this.prevSections.theme}
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
                            <span onClick={this.props.collapseModal}>
                                <BackIcon/>
                            </span>
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
                    {teammateNameDisplaySection}
                    {timezoneSelection}
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
