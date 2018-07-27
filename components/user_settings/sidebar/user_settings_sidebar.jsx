// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

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

            /**
             * Option for including unread channels at top
             */
            unreadsAtTop: PropTypes.string.isRequired,

            /**
             * Option for including favorite channels at top
             */
            favoriteAtTop: PropTypes.string.isRequired,
        }).isRequired,

        updateSection: PropTypes.func,
        activeSection: PropTypes.string,
        closeModal: PropTypes.func.isRequired,
        collapseModal: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = this.getStateFromStores();
    }

    getStateFromStores = () => {
        const {
            closeUnusedDirectMessages,
            sidebarPreference: {
                grouping,
                sorting,
                unreadsAtTop,
                favoriteAtTop,
            },
        } = this.props;

        return {
            settings: {
                close_unused_direct_messages: closeUnusedDirectMessages,
                grouping,
                unreads_at_top: unreadsAtTop,
                favorite_at_top: favoriteAtTop,
                sorting,
            },
            isSaving: false,
        };
    };

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
                unreads_at_top: this.state.settings.unreads_at_top,
                favorite_at_top: this.state.settings.favorite_at_top,
                sorting: this.state.settings.sorting,
            };

            if (updatedSidebarSettings.grouping === 'by_type') {
                updatedSidebarSettings.sorting = 'alpha';
            }

            preferences.push({
                user_id: user.id,
                category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
                name: '',
                value: JSON.stringify(updatedSidebarSettings),
            });
        } else {
            preferences.push({
                user_id: user.id,
                category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
                name: setting,
                value: this.state.settings[setting],
            });
        }

        this.setState({isSaving: true});

        actions.savePreferences(user.id, preferences).then(() => {
            this.updateSection('');
        });
    };

    updateSection = (section) => {
        if (!section) {
            this.setState(this.getStateFromStores());
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
                        <div key='autoCloseDMSetting'>
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
                                <br/>
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
                                <br/>
                            </div>
                            <div>
                                <br/>
                                <FormattedMessage
                                    id='user.settings.sidebar.autoCloseDMDesc'
                                    defaultMessage='Direct Message conversations can be reopened with the “+” button in the sidebar or using the Channel Switcher (CTRL+K).'
                                />
                            </div>
                        </div>,
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

    renderUnreadLabel = (value) => {
        if (value === 'true') {
            return (
                <FormattedMessage
                    id='user.settings.sidebar.showUnreadSection'
                    defaultMessage='At the top of the channel sidebar'
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

    renderOrganizationLabel = () => {
        const {
            grouping,
            unreadsAtTop,
            favoriteAtTop,
            sorting,
        } = this.props.sidebarPreference;

        const messages = [];

        if (grouping === 'by_type') {
            messages.push(
                <FormattedMessage
                    key='by_type'
                    id='user.settings.sidebar.channel_type'
                    defaultMessage='By Channel Type'
                />
            );

            let id = null;
            let defaultMessage = null;
            if (unreadsAtTop === 'true' && favoriteAtTop === 'false') {
                id = 'user.settings.sidebar.unreads';
                defaultMessage = 'Unreads at the top';
            } else if (unreadsAtTop === 'false' && favoriteAtTop === 'true') {
                id = 'user.settings.sidebar.favorites';
                defaultMessage = 'Favorites at the top';
            } else if (unreadsAtTop === 'true' && favoriteAtTop === 'true') {
                id = 'user.settings.sidebar.unreadsFavorites';
                defaultMessage = 'Unreads and Favorites at the top';
            }

            if (id) {
                messages.push(
                    <span key='comma'>{', '}</span>
                );

                messages.push(
                    <FormattedMessage
                        key='atTop'
                        id={id}
                        defaultMessage={defaultMessage}
                    />
                );
            }
        } else {
            messages.push(
                <FormattedMessage
                    key='none'
                    id='user.settings.sidebar.no_grouping'
                    defaultMessage='No Grouping'
                />
            );

            let id;
            let defaultMessage;
            if (sorting === 'alpha') {
                id = 'user.settings.sidebar.inAlphaOrder';
                defaultMessage = 'In Alphabetical Order';
            } else {
                id = 'user.settings.sidebar.inRecentOrder';
                defaultMessage = 'In Recent Order';
            }

            messages.push(
                <span key='comma'>{', '}</span>
            );

            messages.push(
                <FormattedMessage
                    key='sorting'
                    id={id}
                    defaultMessage={defaultMessage}
                />
            );
        }

        return messages;
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
                <div key='groupingSectionSetting'>
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
                                id='user.settings.sidebar.channel_type'
                                defaultMessage='By Channel Type'
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='noGroupingOption'
                                type='radio'
                                name='groupChannels'
                                checked={grouping === 'none'}
                                onChange={this.updateSetting.bind(this, 'grouping', 'none')}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.no grouping'
                                defaultMessage='No Grouping'
                            />
                        </label>
                        <br/>
                    </div>
                    <div>
                        <br/>
                        <FormattedMessage
                            id='user.settings.sidebar.groupingByTypeHint'
                            defaultMessage='By Channel Type: Group Public, Private and Direct Message channels separately, plus include Unreads and/or Favorites at top'
                        />
                        <br/>
                        <FormattedMessage
                            id='user.settings.sidebar.groupingNoneHint'
                            defaultMessage='No Grouping: Combine all channel types'
                        />
                    </div>
                </div>
            );

            inputs.push(<hr key='divider'/>);

            // When grouping by type, display Favorite and Unread options. Otherwise, display sorting options.
            if (grouping === 'by_type') {
                inputs.push(
                    <div key='atTopOptions'>
                        <div key='unreadOption'>
                            <div className='checkbox'>
                                <label>
                                    <input
                                        id='unreadAtTopOption'
                                        type='checkbox'
                                        checked={this.state.settings.unreads_at_top === 'true'}
                                        onChange={(e) => this.updateSetting('unreads_at_top', (e.target.checked).toString())}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.unreads'
                                        defaultMessage='Unreads at the top'
                                    />
                                </label>
                            </div>
                        </div>
                        <div key='favoriteOption'>
                            <div className='checkbox'>
                                <label>
                                    <input
                                        id='favoriteAtTopOption'
                                        type='checkbox'
                                        checked={this.state.settings.favorite_at_top === 'true'}
                                        onChange={(e) => this.updateSetting('favorite_at_top', (e.target.checked).toString())}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.favorites'
                                        defaultMessage='Favorite at the top'
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                );
            } else {
                inputs.push(
                    <div key='sortingOptions'>
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
                                    id='user.settings.sidebar.recent'
                                    defaultMessage='Recent'
                                />
                            </label>
                            <br/>
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
                                    id='user.settings.sidebar.alpha'
                                    defaultMessage='Alphabetically'
                                />
                            </label>
                            <br/>
                        </div>
                        <div>
                            <br/>
                            <FormattedMessage
                                id='user.settings.sidebar.sortChannelsHint'
                                defaultMessage='Recent channels will be sorted by last post.  Otherwise, posts will be sorted alphabetically'
                            />
                        </div>
                    </div>
                );
            }

            contents = (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.groupChannelsTitle'
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
                            id='user.settings.sidebar.groupChannelsTitle'
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

    render() {
        const {showUnusedOption, showChannelOrganization} = this.props;

        const channelOrganizationSection = showChannelOrganization ? this.renderChannelOrganizationSection() : null;
        const autoCloseDMSection = showUnusedOption ? this.renderAutoCloseDMSection() : null;

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
                                title={localizeMessage('generic_icons.collapse', 'Collapse Icon')}
                                onClick={this.props.collapseModal}
                            />
                        </div>
                        <FormattedMessage
                            id='user.settings.sidebar.title'
                            defaultMessage='Sidebar Settings'
                        />
                    </h4>
                </div>
                <div className='user-settings'>
                    <h3 className='tab-header'>
                        <FormattedMessage
                            id='user.settings.sidebar.title'
                            defaultMessage='Sidebar Settings'
                        />
                    </h3>
                    <div className='divider-dark first'/>
                    {channelOrganizationSection}
                    {autoCloseDMSection}
                </div>
            </div>
        );
    }
}
