// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/src/types/users';

import {PreferenceType} from 'mattermost-redux/types/preferences';

import {SidebarPreferences} from 'mattermost-redux/selectors/entities/preferences';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import LocalizedIcon from 'components/localized_icon';

import Constants from 'utils/constants';
import {isMac} from 'utils/utils.jsx';
import {t} from 'utils/i18n';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export interface UserSettingsSidebarProps {
    actions: {

        /**
     * Function to save the user's preferences
     */
        savePreferences: (userId: string, preferences: PreferenceType[]) => any;
    };

    /**
   * Current user object
   */
    user: UserProfile;

    /**
   * The preferences for closing the unused direct messages channels
   */
    closeUnusedDirectMessages: string;

    /**
   * Display the close unused direct messages channels options
   */
    showUnusedOption: boolean;

    /**
   * Display the channel grouping and sorting sections options
   */
    showChannelOrganization: boolean;

    /**
   * Display the setting to toggle the new sidebar
   */
    showChannelSidebarOrganization: boolean;

    /**
   * The preferences to show the channel switcher in the sidebar
   */
    channelSwitcherOption: string;

    /**
   * The preferences to show the channel sidebar organization setting
   */
    channelSidebarOrganizationOption: string;

    /**
   * Display the unread channels sections options
   * The preferences to display channels in sidebar
   */
    sidebarPreference: SidebarPreferences;

    /**
   * Option for including unread channels at top
   */
    unreadsAtTop: string;

    /**
   * Option for including favorite channels at top
   */
    favoriteAtTop: string;

    updateSection?: (section: string) => void;
    activeSection?: string;
    closeModal: () => void;
    collapseModal: () => void;
}

enum Settings {
    CloseUnusedDirectMessages = 'close_unused_direct_messages',
    ChannelSwitcherSection = 'channel_switcher_section',
    ChannelSidebarOrganization = 'channel_sidebar_organization',
    Grouping = 'grouping',
    UnreadsAtTop = 'unreadsAtTop',
    FavoriteAtTop = 'favoriteAtTop',
    Sorting = 'sorting',
    NewSidebar = 'newSidebar',
    ChannelGrouping= 'channel_grouping',
    ChannelSorting= 'channel_sorting',
}

interface GroupingSorting {

    /**
   * Group channels by type or none
   */
    [Settings.Grouping]: string;

    /**
   * Sort channels by recency or alphabetical order
   */
    [Settings.Sorting]: string;
}

interface SettingType extends GroupingSorting {
    [Settings.CloseUnusedDirectMessages]: string;
    [Settings.ChannelSwitcherSection]: string;
    [Settings.ChannelSidebarOrganization]: string;
    [Settings.UnreadsAtTop]: string;
    [Settings.FavoriteAtTop]: string;
    [Settings.NewSidebar]?: string;
}

interface UserSettingsSidebarState {
    settings: SettingType;
    isSaving: boolean;
    serverError?: string;
}

export default class UserSettingsSidebar extends React.PureComponent<UserSettingsSidebarProps, UserSettingsSidebarState> {
    constructor(props: UserSettingsSidebarProps) {
        super(props);

        this.state = this.getStateFromProps();
    }

    getStateFromProps = (): UserSettingsSidebarState => {
        const {
            closeUnusedDirectMessages,
            channelSwitcherOption,
            channelSidebarOrganizationOption,
            sidebarPreference: {
                grouping,
                sorting,
            },
            unreadsAtTop,
            favoriteAtTop,
        } = this.props;

        return {
            settings: {
                close_unused_direct_messages: closeUnusedDirectMessages,
                channel_switcher_section: channelSwitcherOption,
                channel_sidebar_organization: channelSidebarOrganizationOption,
                grouping,
                unreadsAtTop,
                favoriteAtTop,
                sorting,
            },
            isSaving: false,
        };
    };

    trackSettingChangeIfNecessary(setting: keyof SettingType) {
        if (this.state.settings[setting] !== this.props.sidebarPreference[setting as keyof GroupingSorting]) {
            trackEvent('settings', 'user_settings_update', {field: 'sidebar.' + setting, value: this.state.settings[setting]});
        }
    }

    updateSetting<T extends keyof SettingType>(setting: T, value: SettingType[T]): void {
        const settings: SettingType = {
            ...this.state.settings,
            [setting]: value,
        };

        this.setState({
            ...this.state,
            settings,
        });
    }

    handleSubmit = (setting: Settings | keyof SettingType): void => {
        const {actions, user} = this.props;
        const preferences: PreferenceType[] = [];

        if (setting === Settings.ChannelGrouping || setting === Settings.ChannelSorting) {
            const updatedSidebarSettings = {
                grouping: this.state.settings.grouping,
                unreads_at_top: this.state.settings.unreadsAtTop,
                favorite_at_top: this.state.settings.favoriteAtTop,
                sorting: this.state.settings.sorting,
            };

            preferences.push({
                user_id: user.id,
                category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
                name: '',
                value: JSON.stringify(updatedSidebarSettings),
            });

            this.trackSettingChangeIfNecessary(Settings.Grouping);
            this.trackSettingChangeIfNecessary(Settings.Sorting);
            this.trackSettingChangeIfNecessary(Settings.UnreadsAtTop);
            this.trackSettingChangeIfNecessary(Settings.FavoriteAtTop);
            this.trackSettingChangeIfNecessary(Settings.NewSidebar);
        } else {
            preferences.push({
                user_id: user.id,
                category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
                name: setting,
                value: this.state.settings[setting],
            });

            trackEvent('settings', 'user_settings_update', {field: 'sidebar.' + setting, value: this.state.settings[setting]});
        }

        this.setState({isSaving: true});

        actions.savePreferences(user.id, preferences).then(() => {
            this.updateSection('');
        });
    };

    getPreviousSection = (sectionName: string): string | null => {
        const {showChannelOrganization, channelSidebarOrganizationOption} = this.props;
        switch (sectionName) {
        case 'autoCloseDM':
            return channelSidebarOrganizationOption === 'true' ? 'channelSidebarOrganization' : 'channelSwitcher';
        case 'groupChannels':
            return 'dummySectionName';
        case 'channelSidebarOrganization':
            return 'dummySectionName';
        case 'channelSwitcher':
            return showChannelOrganization ? 'groupChannels' : 'dummySectionName';
        default:
            return null;
        }
    };

    updateSection = (section: string): void => {
        if (this.props.updateSection) {
            this.setState(this.getStateFromProps());
            this.setState({isSaving: false});
            this.props.updateSection(section);
        }
    };

    renderAutoCloseDMLabel = (value: string): JSX.Element => {
        if (value === 'after_seven_days') {
            return (
                <FormattedMessage
                    id='user.settings.sidebar.after_seven_days'
                    defaultMessage='After 7 days with no new messages'
                />
            );
        }

        return (
            <FormattedMessage
                id='user.settings.sidebar.never'
                defaultMessage='Never'
            />
        );
    };

    renderAutoCloseDMSection = (): JSX.Element => {
        let contents;

        if (this.props.activeSection === 'autoCloseDM') {
            contents = (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.autoCloseDMTitle'
                            defaultMessage='Automatically Close Direct Messages'
                        />
                    }
                    inputs={[
                        <fieldset key='autoCloseDMSetting'>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='autoCloseDMAfterSevenDays'
                                        type='radio'
                                        name='autoCloseDM'
                                        checked={this.state.settings.close_unused_direct_messages === 'after_seven_days'}
                                        onChange={this.updateSetting.bind(this, Settings.CloseUnusedDirectMessages, 'after_seven_days')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.after_seven_days'
                                        defaultMessage='After 7 days with no new messages'
                                    />
                                </label>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='autoCloseDMNever'
                                        type='radio'
                                        name='autoCloseDM'
                                        checked={this.state.settings.close_unused_direct_messages === 'never'}
                                        onChange={this.updateSetting.bind(this, Settings.CloseUnusedDirectMessages, 'never')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.never'
                                        defaultMessage='Never'
                                    />
                                </label>
                            </div>
                            <div className='mt-5'>
                                <FormattedMessage
                                    id='user.settings.sidebar.autoCloseDMDesc'
                                    defaultMessage='Direct Message conversations can be reopened with the “+” button in the sidebar or using the Channel Switcher (CTRL+K).'
                                />
                            </div>
                        </fieldset>,
                    ]}
                    setting={'close_unused_direct_messages'}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={this.state.serverError}
                    updateSection={this.updateSection}
                />
            );
        } else {
            contents = (
                <SettingItemMin
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.autoCloseDMTitle'
                            defaultMessage='Automatically Close Direct Messages'
                        />
                    }
                    describe={this.renderAutoCloseDMLabel(this.state.settings.close_unused_direct_messages)}
                    section={'autoCloseDM'}
                    updateSection={this.updateSection}
                />
            );
        }

        return (
            <React.Fragment>
                {contents}
                <div className='divider-dark'/>
            </React.Fragment>
        );
    };

    renderOrganizationLabel = (): JSX.Element[] => {
        const {
            sidebarPreference: {
                sorting,
                grouping,
            },
            unreadsAtTop,
            favoriteAtTop,
        } = this.props;

        const messages: JSX.Element[] = [];

        if (grouping === 'by_type') {
            messages.push(
                <FormattedMessage
                    key='by_type'
                    id='user.settings.sidebar.groupByTypeShort'
                    defaultMessage='Group by channel type'
                />,
            );
        } else {
            messages.push(
                <FormattedMessage
                    key='none'
                    id='user.settings.sidebar.groupByNoneShort'
                    defaultMessage='No grouping'
                />,
            );
        }

        let sortingId;
        let sortingDefaultMessage;
        if (sorting === 'alpha') {
            sortingId = t('user.settings.sidebar.sortAlphaShort');
            sortingDefaultMessage = 'sorted alphabetically';
        } else {
            sortingId = t('user.settings.sidebar.sortRecentShort');
            sortingDefaultMessage = 'sorted by recency';
        }

        messages.push(
            <span key='comma'>{', '}</span>,
        );

        messages.push(
            <FormattedMessage
                key='sorting'
                id={sortingId}
                defaultMessage={sortingDefaultMessage}
            />,
        );

        let atTopId: string | null = null;
        let atTopDefaultMessage: string | null = null;
        if (unreadsAtTop === 'true' && favoriteAtTop === 'false') {
            atTopId = t('user.settings.sidebar.unreadsShort');
            atTopDefaultMessage = 'Unreads grouped separately';
        } else if (unreadsAtTop === 'false' && favoriteAtTop === 'true') {
            atTopId = t('user.settings.sidebar.favoritesShort');
            atTopDefaultMessage = 'Favorites grouped separately';
        } else if (unreadsAtTop === 'true' && favoriteAtTop === 'true') {
            atTopId = t('user.settings.sidebar.unreadsFavoritesShort');
            atTopDefaultMessage = 'Unreads and favorites grouped separately';
        }

        if (atTopId) {
            messages.push(
                <br key='break'/>,
            );

            messages.push(
                <FormattedMessage
                    key='atTop'
                    id={atTopId}
                    defaultMessage={atTopDefaultMessage as any}
                />,
            );
        }

        return messages;
    };

    renderChannelSwitcherLabel = (value: string): JSX.Element => {
        if (value === 'true') {
            return (
                <FormattedMessage
                    id='user.settings.sidebar.on'
                    defaultMessage='On'
                />
            );
        }

        return (
            <FormattedMessage
                id='user.settings.sidebar.off'
                defaultMessage='Off'
            />
        );
    };

    renderChannelSidebarOrganizationSection = (): JSX.Element => {
        const helpChannelSidebarOrganizationText = (
            <FormattedMarkdownMessage
                id={t('user.settings.sidebar.channelSidebarOrganizationSection.desc')}
                defaultMessage={'When enabled, access experimental channel sidebar features, including collapsible sections and unreads filtering. [Learn more](!https://about.mattermost.com/default-sidebar/) or [give us feedback](!https://about.mattermost.com/default-sidebar-survey/)'}
            />
        );

        let contents = (
            <SettingItemMin
                title={
                    <FormattedMessage
                        id={t('user.settings.sidebar.channelSidebarOrganizationSectionTitle')}
                        defaultMessage='Experimental Sidebar Features'
                    />
                }
                describe={this.renderChannelSwitcherLabel(this.props.channelSidebarOrganizationOption)}
                section={'channelSidebarOrganization'}
                updateSection={this.updateSection}
            />
        );

        if (this.props.activeSection === 'channelSidebarOrganization') {
            contents = (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id={t('user.settings.sidebar.channelSidebarOrganizationSectionTitle')}
                            defaultMessage='Experimental Sidebar Features'
                        />
                    }
                    inputs={[
                        <fieldset key='channelSidebarOrganizationSectionSetting'>
                            <legend className='form-legend hidden-label'>
                                <FormattedMessage
                                    id={t('user.settings.sidebar.channelSidebarOrganizationSectionTitle')}
                                    defaultMessage='Experimental Sidebar Features'
                                />
                            </legend>
                            <div
                                id='channelSidebarOrganizationRadioOn'
                                className='radio'
                            >
                                <label>
                                    <input
                                        id='channelSidebarOrganizationSectionEnabled'
                                        type='radio'
                                        name='channelSidebarOrganization'
                                        checked={this.state.settings.channel_sidebar_organization === 'true'}
                                        onChange={this.updateSetting.bind(this, Settings.ChannelSidebarOrganization, 'true')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.on'
                                        defaultMessage='On'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div
                                id='channelSidebarOrganizationRadioOff'
                                className='radio'
                            >
                                <label>
                                    <input
                                        id='channelSidebarOrganizationSectionOff'
                                        type='radio'
                                        name='channelSidebarOrganization'
                                        checked={this.state.settings.channel_sidebar_organization === 'false'}
                                        onChange={this.updateSetting.bind(this, Settings.ChannelSidebarOrganization, 'false')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.off'
                                        defaultMessage='Off'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div id='channelSidebarOrganizationelpText'>
                                <br/>
                                {helpChannelSidebarOrganizationText}
                            </div>
                        </fieldset>,
                    ]}
                    setting={'channel_sidebar_organization'}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={this.state.serverError}
                    updateSection={this.updateSection}
                />
            );
        }

        return (
            <React.Fragment>
                {contents}
                <div className='divider-light'/>
            </React.Fragment>
        );
    };

    renderChannelOrganizationSection = (): JSX.Element => {
        const {
            grouping,
            sorting,
        } = this.state.settings;

        let contents: JSX.Element;

        if (this.props.activeSection === 'groupChannels') {
            const inputs: JSX.Element[] = [];

            inputs.push(
                <fieldset key='groupingSectionSetting'>
                    <legend className='form-legend'>
                        <FormattedMessage
                            id='user.settings.sidebar.groupChannelsTitle'
                            defaultMessage='Channel grouping'
                        />
                    </legend>
                    <div className='radio'>
                        <label>
                            <input
                                id='byTypeOption'
                                type='radio'
                                name='groupChannels'
                                checked={grouping === 'by_type'}
                                onChange={this.updateSetting.bind(this, Settings.Grouping, 'by_type')}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.groupByType'
                                defaultMessage='Channels grouped by type'
                            />
                        </label>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='noneOption'
                                type='radio'
                                name='groupChannels'
                                checked={grouping === 'none'}
                                onChange={this.updateSetting.bind(this, Settings.Grouping, 'none')}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.groupByNone'
                                defaultMessage='Combine all channel types'
                            />
                        </label>
                    </div>
                    <div className='mt-5'>
                        <FormattedMessage
                            id='user.settings.sidebar.groupDesc'
                            defaultMessage='Group channels by type, or combine all types into a list.'
                        />
                    </div>
                </fieldset>,
            );

            inputs.push(<hr key='sortingDivider'/>);

            inputs.push(
                <fieldset key='sortingOptions'>
                    <legend className='form-legend'>
                        <FormattedMessage
                            id='user.settings.sidebar.sortChannelsTitle'
                            defaultMessage='Channel sorting'
                        />
                    </legend>
                    <div className='radio'>
                        <label>
                            <input
                                id='recentSectionEnabled'
                                type='radio'
                                name='sortChannels'
                                checked={sorting === 'recent'}
                                onChange={this.updateSetting.bind(this, Settings.Sorting, 'recent')}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.sortRecent'
                                defaultMessage='Recency'
                            />
                        </label>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='alphaSectionEnabled'
                                type='radio'
                                name='sortChannels'
                                checked={sorting === 'alpha'}
                                onChange={this.updateSetting.bind(this, Settings.Sorting, 'alpha')}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.sortAlpha'
                                defaultMessage='Alphabetically'
                            />
                        </label>
                    </div>
                    <div className='mt-5'>
                        <FormattedMessage
                            id='user.settings.sidebar.sortDesc'
                            defaultMessage='Sort channels alphabetically, or by most recent post.'
                        />
                    </div>
                </fieldset>,
            );

            inputs.push(<hr key='divider'/>);

            inputs.push(
                <fieldset key='unreadOption'>
                    <div className='checkbox'>
                        <label>
                            <input
                                id='unreadAtTopOption'
                                type='checkbox'
                                checked={this.state.settings.unreadsAtTop === 'true'}
                                onChange={(e) => this.updateSetting(Settings.UnreadsAtTop, (e.target.checked).toString())}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.unreads'
                                defaultMessage='Unreads grouped separately'
                            />
                        </label>
                    </div>
                    <div className='mt-5'>
                        <FormattedMessage
                            id='user.settings.sidebar.unreadsDesc'
                            defaultMessage='Group unread channels separately until read.'
                        />
                    </div>
                </fieldset>,
            );

            inputs.push(<hr key='groupingDivider'/>);

            inputs.push(
                <fieldset key='favoriteOption'>
                    <div className='checkbox'>
                        <label>
                            <input
                                id='favoriteAtTopOption'
                                type='checkbox'
                                checked={this.state.settings.favoriteAtTop === 'true'}
                                onChange={(e) => this.updateSetting(Settings.FavoriteAtTop, (e.target.checked).toString())}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.favorites'
                                defaultMessage='Favorites grouped separately'
                            />
                        </label>
                    </div>
                    <div>
                        <br/>
                        <FormattedMessage
                            id='user.settings.sidebar.favoritesDesc'
                            defaultMessage='Channels marked as favorites will be grouped separately.'
                        />
                    </div>
                </fieldset>,
            );

            contents = (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.groupAndSortChannelsTitle'
                            defaultMessage='Channel Grouping and Sorting'
                        />
                    }
                    inputs={inputs}
                    setting={'channel_grouping'}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={this.state.serverError}
                    updateSection={this.updateSection}
                />
            );
        } else {
            contents = (
                <SettingItemMin
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.groupAndSortChannelsTitle'
                            defaultMessage='Channel Grouping and Sorting'
                        />
                    }
                    describe={this.renderOrganizationLabel()}
                    section={'groupChannels'}
                    updateSection={this.updateSection}
                />
            );
        }

        return (
            <React.Fragment>
                {contents}
                <div className='divider-light'/>
            </React.Fragment>
        );
    };

    renderChannelSwitcherSection = (): JSX.Element => {
        let channelSwitcherSectionDescId = t('user.settings.sidebar.channelSwitcherSectionDesc.windows');
        let channelSwitcherSectionDescDefault = 'The channel switcher is shown at the bottom of the sidebar and is used to jump between channels quickly. It can also be accessed using CTRL + K.';
        if (isMac()) {
            channelSwitcherSectionDescId = t('user.settings.sidebar.channelSwitcherSectionDesc.mac');
            channelSwitcherSectionDescDefault = 'The channel switcher is shown at the bottom of the sidebar and is used to jump between channels quickly. It can also be accessed using CMD + K.';
        }

        const helpChannelSwitcherText = (
            <FormattedMessage
                id={channelSwitcherSectionDescId}
                defaultMessage={channelSwitcherSectionDescDefault}
            />
        );

        if (this.props.activeSection === 'channelSwitcher') {
            return (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.channelSwitcherSectionTitle'
                            defaultMessage='Channel Switcher'
                        />
                    }
                    inputs={[
                        <fieldset key='channelSwitcherSectionSetting'>
                            <legend className='form-legend hidden-label'>
                                <FormattedMessage
                                    id='user.settings.sidebar.channelSwitcherSectionTitle'
                                    defaultMessage='Channel Switcher'
                                />
                            </legend>
                            <div
                                id='channelSwitcherRadioOn'
                                className='radio'
                            >
                                <label>
                                    <input
                                        id='channelSwitcherSectionEnabled'
                                        type='radio'
                                        name='channelSwitcher'
                                        checked={this.state.settings.channel_switcher_section === 'true'}
                                        onChange={this.updateSetting.bind(this, Settings.ChannelSwitcherSection, 'true')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.on'
                                        defaultMessage='On'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div
                                id='channelSwitcherRadioOff'
                                className='radio'
                            >
                                <label>
                                    <input
                                        id='channelSwitcherSectionOff'
                                        type='radio'
                                        name='channelSwitcher'
                                        checked={this.state.settings.channel_switcher_section === 'false'}
                                        onChange={this.updateSetting.bind(this, Settings.ChannelSwitcherSection, 'false')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.off'
                                        defaultMessage='Off'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div id='channelSwitcherHelpText'>
                                <br/>
                                {helpChannelSwitcherText}
                            </div>
                        </fieldset>,
                    ]}
                    setting={'channel_switcher_section'}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={this.state.serverError}
                    updateSection={this.updateSection}
                />
            );
        }

        return (
            <SettingItemMin
                title={
                    <FormattedMessage
                        id='user.settings.sidebar.channelSwitcherSectionTitle'
                        defaultMessage='Channel Switcher'
                    />
                }
                describe={this.renderChannelSwitcherLabel(this.props.channelSwitcherOption)}
                section={'channelSwitcher'}
                updateSection={this.updateSection}
            />
        );
    };

    render(): JSX.Element {
        const {showUnusedOption, showChannelOrganization, showChannelSidebarOrganization, channelSidebarOrganizationOption} = this.props;

        const channelSidebarOrganizationDisabled = channelSidebarOrganizationOption === 'false';

        const channelOrganizationSection = (showChannelOrganization && channelSidebarOrganizationDisabled) ? this.renderChannelOrganizationSection() : null;
        const channelSidebarOrganizationSection = showChannelSidebarOrganization ? this.renderChannelSidebarOrganizationSection() : null;
        const autoCloseDMSection = showUnusedOption ? this.renderAutoCloseDMSection() : null;
        const channelSwitcherSection = channelSidebarOrganizationDisabled ? this.renderChannelSwitcherSection() : null;

        return (
            <div>
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
                        <div
                            className='modal-back'
                            onClick={this.props.collapseModal}
                        >
                            <LocalizedIcon
                                className='fa fa-angle-left'
                                title={{id: t('generic_icons.collapse'), defaultMessage: 'Collapse Icon'}}
                            />
                        </div>
                        <FormattedMessage
                            id='user.settings.sidebar.title'
                            defaultMessage='Sidebar Settings'
                        />
                    </h4>
                </div>
                <div
                    id='sidebarTitle'
                    className='user-settings'
                >
                    <h3 className='tab-header'>
                        <FormattedMessage
                            id='user.settings.sidebar.title'
                            defaultMessage='Sidebar Settings'
                        />
                    </h3>
                    <div className='divider-dark first'/>
                    {channelSidebarOrganizationSection}
                    {channelOrganizationSection}
                    {channelSwitcherSection}
                    {showUnusedOption ? <div className='divider-light'/> : <div className='divider-dark'/>}
                    {autoCloseDMSection}
                </div>
            </div>
        );
    }
}
/* eslint-disable react/no-string-refs */
