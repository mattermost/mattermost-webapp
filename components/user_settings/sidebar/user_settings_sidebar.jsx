// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, intlShape} from 'react-intl';

import {trackEvent} from 'actions/diagnostics_actions.jsx';

import Constants from 'utils/constants.jsx';
import {isMac} from 'utils/utils.jsx';
import {t} from 'utils/i18n';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

export default class UserSettingsSidebar extends React.Component {
    static propTypes = {
        actions: PropTypes.shape({

            /*
             * Function to save the user's preferences
             */
            savePreferences: PropTypes.func.isRequired,
        }).isRequired,

        /**
         * Current user object
         */
        user: PropTypes.object,

        /**
         * The preferences for closing the unused direct messages channels
         */
        closeUnusedDirectMessages: PropTypes.string.isRequired,

        /**
         * Display the close unused direct messages channels options
         */
        showUnusedOption: PropTypes.bool.isRequired,

        /**
         * Display the channel grouping and sorting sections options
         */
        showChannelOrganization: PropTypes.bool.isRequired,

        /**
         * The preferences to show the channel switcher in the sidebar
         */
        channelSwitcherOption: PropTypes.string.isRequired,

        /**
         * Display the unread channels sections options
         * The preferences to display channels in sidebar
         */
        sidebarPreference: PropTypes.shape({

            /**
             * Group channels by type or none
             */
            grouping: PropTypes.string.isRequired,

            /**
             * Sort channels by recency or alphabetical order
             */
            sorting: PropTypes.string.isRequired,
        }).isRequired,

        /**
         * Option for including unread channels at top
         */
        unreadsAtTop: PropTypes.string.isRequired,

        /**
         * Option for including favorite channels at top
         */
        favoriteAtTop: PropTypes.string.isRequired,

        updateSection: PropTypes.func,
        activeSection: PropTypes.string,
        closeModal: PropTypes.func.isRequired,
        collapseModal: PropTypes.func.isRequired,

        prevActiveSection: PropTypes.string.isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = this.getStateFromProps();
    }

    getStateFromProps = () => {
        const {
            closeUnusedDirectMessages,
            channelSwitcherOption,
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
                grouping,
                unreadsAtTop,
                favoriteAtTop,
                sorting,
            },
            isSaving: false,
        };
    };

    trackSettingChangeIfNecessary = (setting) => {
        if (this.state.settings[setting] !== this.props.sidebarPreference[setting]) {
            trackEvent('settings', 'user_settings_update', {field: 'sidebar.' + setting, value: this.state.settings[setting]});
        }
    }

    updateSetting = (setting, value) => {
        const settings = this.state.settings;
        settings[setting] = value;

        this.setState(settings);
    };

    handleSubmit = (setting) => {
        const {actions, user} = this.props;
        const preferences = [];

        if (setting === 'channel_grouping' || setting === 'channel_sorting') {
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

            this.trackSettingChangeIfNecessary('grouping');
            this.trackSettingChangeIfNecessary('sorting');
            this.trackSettingChangeIfNecessary('unreadsAtTop');
            this.trackSettingChangeIfNecessary('favoriteAtTop');
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

    getPreviousSection = (sectionName) => {
        const {showChannelOrganization} = this.props;
        switch (sectionName) {
        case 'autoCloseDM':
            return 'channelSwitcher';
        case 'groupChannels':
            return 'dummySectionName';
        case 'channelSwitcher':
            return showChannelOrganization ? 'groupChannels' : 'dummySectionName';
        default:
            return null;
        }
    }

    updateSection = (section) => {
        if (!section) {
            this.setState(this.getStateFromProps());
        }
        this.setState({isSaving: false});
        this.props.updateSection(section);
    };

    renderAutoCloseDMLabel = (value) => {
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

    renderAutoCloseDMSection = () => {
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
                                        onChange={this.updateSetting.bind(this, 'close_unused_direct_messages', 'after_seven_days')}
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
                                        onChange={this.updateSetting.bind(this, 'close_unused_direct_messages', 'never')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.never'
                                        defaultMessage='Never'
                                    />
                                </label>
                            </div>
                            <div className='margin-top x3'>
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
                    focused={this.props.prevActiveSection === this.getPreviousSection('autoCloseDM')}
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

    renderOrganizationLabel = () => {
        const {
            sidebarPreference: {
                sorting,
                grouping,
            },
            unreadsAtTop,
            favoriteAtTop,
        } = this.props;

        const messages = [];

        if (grouping === 'by_type') {
            messages.push(
                <FormattedMessage
                    key='by_type'
                    id='user.settings.sidebar.groupByTypeShort'
                    defaultMessage='Group by channel type'
                />
            );
        } else {
            messages.push(
                <FormattedMessage
                    key='none'
                    id='user.settings.sidebar.groupByNoneShort'
                    defaultMessage='No grouping'
                />
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
            <span key='comma'>{', '}</span>
        );

        messages.push(
            <FormattedMessage
                key='sorting'
                id={sortingId}
                defaultMessage={sortingDefaultMessage}
            />
        );

        let atTopId = null;
        let atTopDefaultMessage = null;
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
                <br key='break'/>
            );

            messages.push(
                <FormattedMessage
                    key='atTop'
                    id={atTopId}
                    defaultMessage={atTopDefaultMessage}
                />
            );
        }

        return messages;
    };

    renderChannelSwitcherLabel = (value) => {
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

    renderChannelOrganizationSection = () => {
        const {
            grouping,
            sorting,
        } = this.state.settings;

        let contents;

        if (this.props.activeSection === 'groupChannels') {
            const inputs = [];

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
                                onChange={this.updateSetting.bind(this, 'grouping', 'by_type')}
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
                                onChange={this.updateSetting.bind(this, 'grouping', 'none')}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.groupByNone'
                                defaultMessage='Combine all channel types'
                            />
                        </label>
                    </div>
                    <div className='margin-top x3'>
                        <FormattedMessage
                            id='user.settings.sidebar.groupDesc'
                            defaultMessage='Group channels by type, or combine all types into a list.'
                        />
                    </div>
                </fieldset>
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
                                onChange={this.updateSetting.bind(this, 'sorting', 'recent')}
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
                                onChange={this.updateSetting.bind(this, 'sorting', 'alpha')}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.sortAlpha'
                                defaultMessage='Alphabetically'
                            />
                        </label>
                    </div>
                    <div className='margin-top x3'>
                        <FormattedMessage
                            id='user.settings.sidebar.sortDesc'
                            defaultMessage='Sort channels alphabetically, or by most recent post.'
                        />
                    </div>
                </fieldset>
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
                                onChange={(e) => this.updateSetting('unreadsAtTop', (e.target.checked).toString())}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.unreads'
                                defaultMessage='Unreads grouped separately'
                            />
                        </label>
                    </div>
                    <div className='margin-top x3'>
                        <FormattedMessage
                            id='user.settings.sidebar.unreadsDesc'
                            defaultMessage='Group unread channels separately until read.'
                        />
                    </div>
                </fieldset>
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
                                onChange={(e) => this.updateSetting('favoriteAtTop', (e.target.checked).toString())}
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
                </fieldset>
            );

            contents = (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.groupAndSortChannelsTitle'
                            defaultMessage='Channel grouping and sorting'
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
                            defaultMessage='Channel grouping and sorting'
                        />
                    }
                    describe={this.renderOrganizationLabel()}
                    section={'groupChannels'}
                    updateSection={this.updateSection}
                    focused={this.props.prevActiveSection === this.getPreviousSection('groupChannels')}
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

    renderChannelSwitcherSection = () => {
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
                        <div key='channelSwitcherSectionSetting'>
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
                                        onChange={this.updateSetting.bind(this, 'channel_switcher_section', 'true')}
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
                                        onChange={this.updateSetting.bind(this, 'channel_switcher_section', 'false')}
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
                        </div>,
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
                describe={this.renderChannelSwitcherLabel(this.state.settings.channel_switcher_section)}
                section={'channelSwitcher'}
                updateSection={this.updateSection}
                focused={this.props.prevActiveSection === this.getPreviousSection('channelSwitcher')}
            />
        );
    };

    render() {
        const {showUnusedOption, showChannelOrganization} = this.props;
        const {formatMessage} = this.context.intl;

        const channelOrganizationSection = showChannelOrganization ? this.renderChannelOrganizationSection() : null;
        const autoCloseDMSection = showUnusedOption ? this.renderAutoCloseDMSection() : null;
        const channelSwitcherSection = this.renderChannelSwitcherSection();

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
                        <div className='modal-back'>
                            <i
                                className='fa fa-angle-left'
                                title={formatMessage({id: 'generic_icons.collapse', defaultMessage: 'Collapse Icon'})}
                                onClick={this.props.collapseModal}
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
                    {channelOrganizationSection}
                    {channelSwitcherSection}
                    {showUnusedOption ? <div className='divider-light'/> : <div className='divider-dark'/>}
                    {autoCloseDMSection}
                </div>
            </div>
        );
    }
}
