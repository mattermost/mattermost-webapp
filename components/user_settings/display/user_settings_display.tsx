// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import {getTimezoneRegion} from 'mattermost-redux/utils/timezone_utils';
import {FormattedMessage} from 'react-intl';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {UserProfile, UserTimezone} from 'mattermost-redux/types/users';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import {getBrowserTimezone} from 'utils/timezone.jsx';

import * as I18n from 'i18n/i18n.jsx';
import {t} from 'utils/i18n';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min';
import ThemeSetting from 'components/user_settings/display/user_settings_theme';
import BackIcon from 'components/widgets/icons/fa_back_icon';

import ManageTimezones from './manage_timezones';
import ManageLanguages from './manage_languages';

const Preferences = Constants.Preferences;

function getDisplayStateFromProps(props: Props) {
    return {
        militaryTime: props.militaryTime,
        teammateNameDisplay: props.teammateNameDisplay,
        channelDisplayMode: props.channelDisplayMode,
        messageDisplay: props.messageDisplay,
        collapseDisplay: props.collapseDisplay,
        linkPreviewDisplay: props.linkPreviewDisplay,
    };
}

type Option = {
    value: string;
    radionButtonText: {
        id: string;
        message: string;
        moreId?: string;
        moreMessage?: string;
    };
}

type SectionProps ={
    section: string;
    display: string;
    defaultDisplay: string;
    value: string;
    title: {
        id: string;
        message: string;
    };
    firstOption: Option;
    secondOption: Option;
    thirdOption?: Option;
    description: {
        id: string;
        message: string;
    };
    disabled?: boolean;
}

type Props = {
    user: UserProfile;
    updateSection: (section: string) => void;
    activeSection?: string;
    closeModal?: () => void;
    collapseModal?: () => void;
    setRequireConfirm?: () => void;
    setEnforceFocus?: () => void;
    timezones: string[];
    userTimezone: UserTimezone;
    allowCustomThemes: boolean;
    enableLinkPreviews: boolean;
    defaultClientLocale: string;
    enableThemeSelection: boolean;
    configTeammateNameDisplay: string;
    currentUserTimezone: string;
    enableTimezone: boolean;
    shouldAutoUpdateTimezone: boolean;
    lockTeammateNameDisplay: boolean;
    militaryTime: string;
    teammateNameDisplay: string;
    channelDisplayMode: string;
    messageDisplay: string;
    collapseDisplay: string;
    linkPreviewDisplay: string;
    actions: {
        savePreferences: (userId: string, preferences: Array<PreferenceType>) => void;
        getSupportedTimezones: () => void;
        autoUpdateTimezone: (deviceTimezone: string) => void;
    };
}

type State = {
    [key: string]: any;
    isSaving: boolean;
    militaryTime: string;
    teammateNameDisplay: string;
    channelDisplayMode: string;
    messageDisplay: string;
    collapseDisplay: string;
    linkPreviewDisplay: string;
    handleSubmit?: () => void;
    serverError?: string;
}

export default class UserSettingsDisplay extends React.PureComponent<Props, State> {
    public prevSections: {
        theme: string;

        clock: string;
        linkpreview: string;
        message_display: string;
        channel_display_mode: string;
        languages: string;
    };

    constructor(props: Props) {
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

    componentDidUpdate(prevProps: Props) {
        if (this.props.teammateNameDisplay !== prevProps.teammateNameDisplay) {
            this.updateState();
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

    handleClockRadio = (militaryTime: string) => {
        this.setState({militaryTime});
    }

    handleTeammateNameDisplayRadio = (teammateNameDisplay: string) => {
        this.setState({teammateNameDisplay});
    }

    handleChannelDisplayModeRadio(channelDisplayMode: string) {
        this.setState({channelDisplayMode});
    }

    handlemessageDisplayRadio(messageDisplay: string) {
        this.setState({messageDisplay});
    }

    handleCollapseRadio(collapseDisplay: string) {
        this.setState({collapseDisplay});
    }

    handleLinkPreviewRadio(linkPreviewDisplay: string) {
        this.setState({linkPreviewDisplay});
    }

    handleOnChange(display: {[key: string]: any}) {
        this.setState({...display});
    }

    updateSection = (section: string) => {
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

    createSection(props: SectionProps) {
        const {
            section,
            display,
            value,
            title,
            firstOption,
            secondOption,
            thirdOption,
            description,
            disabled,
        } = props;
        let extraInfo = null;
        let submit: (() => Promise<void>) | null = this.handleSubmit;

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

            const firstDisplay = {
                [display]: firstOption.value,
            };

            const secondDisplay = {
                [display]: secondOption.value,
            };

            let thirdSection;
            if (thirdOption && thirdMessage) {
                const thirdDisplay = {
                    [display]: thirdOption.value,
                };

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

            let inputs = [
                <fieldset key={key}>
                    <legend className='form-legend hidden-label'>
                        {messageTitle}
                    </legend>
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
                </fieldset>,
            ];

            if (display === 'teammateNameDisplay' && disabled) {
                extraInfo = (
                    <span>
                        <FormattedMessage
                            id='user.settings.display.teammateNameDisplay'
                            defaultMessage='This field is handled through your System Administrator. If you want to change it, you need to do so through your System Administrator.'
                        />
                    </span>
                );
                submit = null;
                inputs = [];
            }
            return (
                <div>
                    <SettingItemMax
                        title={messageTitle}
                        inputs={inputs}
                        submit={submit}
                        saving={this.state.isSaving}
                        server_error={this.state.serverError}
                        updateSection={this.updateSection}
                        extraInfo={extraInfo}
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
                message: 'Default Appearance of Image Previews',
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
            value: this.props.lockTeammateNameDisplay ? this.props.configTeammateNameDisplay : this.state.teammateNameDisplay,
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
            disabled: this.props.lockTeammateNameDisplay,
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
                            useAutomaticTimezone={Boolean(userTimezone.useAutomaticTimezone)}
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
                        describe={locale}
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
/* eslint-enable react/no-string-refs */
