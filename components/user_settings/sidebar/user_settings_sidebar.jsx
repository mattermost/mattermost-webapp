// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

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
         * The preferences to show the unread channels section in the sidebar
         */
        displayUnreadSection: PropTypes.string.isRequired,

        /**
         * Display the close unused direct messages channels options
         */
        showUnusedOption: PropTypes.bool.isRequired,

        /**
         * Display the unread channels sections options
         */
        showUnreadOption: PropTypes.bool.isRequired,
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
        const {closeUnusedDirectMessages, displayUnreadSection, displayRecentSection, displayDefaultSection} = this.props;
        return {
            settings: {
                close_unused_direct_messages: closeUnusedDirectMessages,
                show_unread_section: displayUnreadSection,
                show_recent_section: displayRecentSection,
                show_default_section: displayDefaultSection,
            },
            isSaving: false,
        };
    };

    updateSetting = (setting, value) => {

        console.log('updateSetting', setting, value);

        let settings = this.state.settings;
        settings[setting] = value;

        const defaultSettings = {
            show_recent_section: 'false',
            show_unread_section: 'false',
            show_default_section: 'false',
        };

        switch (setting) {
        case 'show_recent_section':
            defaultSettings[setting] = 'true';
            settings = {...settings, ...defaultSettings};
            break;
        case 'show_unread_section':
            defaultSettings[setting] = 'true';
            settings = {...settings, ...defaultSettings};
            break;
        case 'show_default_section':
            defaultSettings[setting] = 'true';
            settings = {...settings, ...defaultSettings};
            break;
        }

        console.log('settings', settings);

        this.setState({settings});
    };

    handleSubmit = (setting) => {
        const {actions, user} = this.props;
        const preferences = [];

        if (setting === 'channel_grouping') {
            // TODO: depending on design requiremenets use channel_grouping = [show_recent_section, show_unread_section, show_default_section]
            const channelGroupingSettings = ['show_recent_section', 'show_unread_section', 'show_default_section'];

            channelGroupingSettings.map((group) => (
                preferences.push({
                    user_id: user.id,
                    category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
                    name: group,
                    value: this.state.settings[group],
                })
            ));
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
        if (this.props.activeSection === 'autoCloseDM') {
            return (
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
        }

        return (
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

    renderChannelGroupSection = () => {
        // TODO: add in en.json for _new
        console.log('this.state.settings.show_recent_section', this.state.settings.show_recent_section);
        console.log('this.state.settings.show_unread_section', this.state.settings.show_unread_section);
        console.log('this.state.settings.show_default_section', this.state.settings.show_default_section);
        if (this.props.activeSection === 'unreadChannels') {
            return (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.groupChannelsSectionTitle'
                            defaultMessage='Group channels'
                        />
                    }
                    inputs={[
                        <div key='unreadSectionSetting'>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='recentSectionEnabled'
                                        type='radio'
                                        name='groupChannels'
                                        checked={this.state.settings.show_recent_section === 'true'}
                                        onChange={this.updateSetting.bind(this, 'show_recent_section', 'true')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.showRecentSection'
                                        defaultMessage='By recent order'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='unreadSectionEnabled'
                                        type='radio'
                                        name='groupChannels'
                                        checked={this.state.settings.show_unread_section === 'true'}
                                        onChange={this.updateSetting.bind(this, 'show_unread_section', 'true')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.showUnreadSection_new'
                                        defaultMessage='By unread, at the top of the channel sidebar'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='unreadSectionNever'
                                        type='radio'
                                        name='groupChannels'
                                        checked={this.state.settings.show_default_section === 'true'}
                                        onChange={this.updateSetting.bind(this, 'show_default_section', 'true')}
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
                                    id='user.settings.sidebar.recentSectionDesc'
                                    defaultMessage='Recent channels will be sorted by last post.'
                                />
                                <br/>
                                <br/>
                                <FormattedMessage
                                    id='user.settings.sidebar.unreadSectionDesc'
                                    defaultMessage='Unread channels will be sorted at the top of the channel sidebar until read.'
                                />
                            </div>
                        </div>,
                    ]}
                    setting={'channel_grouping'}
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
                        id='user.settings.sidebar.unreadSectionTitle_new'
                        defaultMessage='Group channels'
                    />
                }
                describe={this.renderUnreadLabel(this.state.settings.show_unread_section)}
                section={'unreadChannels'}
                updateSection={this.updateSection}
            />
        );
    };

    renderUnreadSection = () => {
        if (this.props.activeSection === 'unreadChannels') {
            return (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.unreadSectionTitle'
                            defaultMessage='Group unread channels'
                        />
                    }
                    inputs={[
                        <div key='unreadSectionSetting'>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='unreadSectionEnabled'
                                        type='radio'
                                        name='unreadChannels'
                                        checked={this.state.settings.show_unread_section === 'true'}
                                        onChange={this.updateSetting.bind(this, 'show_unread_section', 'true')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.showUnreadSection'
                                        defaultMessage='At the top of the channel sidebar'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='unreadSectionNever'
                                        type='radio'
                                        name='unreadChannels'
                                        checked={this.state.settings.show_unread_section === 'false'}
                                        onChange={this.updateSetting.bind(this, 'show_unread_section', 'false')}
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
                                    id='user.settings.sidebar.unreadSectionDesc'
                                    defaultMessage='Unread channels will be sorted at the top of the channel sidebar until read.'
                                />
                            </div>
                        </div>,
                    ]}
                    setting={'show_unread_section'}
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
                        id='user.settings.sidebar.unreadSectionTitle'
                        defaultMessage='Group unread channels'
                    />
                }
                describe={this.renderUnreadLabel(this.state.settings.show_unread_section)}
                section={'unreadChannels'}
                updateSection={this.updateSection}
            />
        );
    };

    render() {
        const {showUnusedOption, showUnreadOption} = this.props;
        const autoCloseDMSection = showUnusedOption ? this.renderAutoCloseDMSection() : null;

        // const unreadSection = showUnreadOption ? this.renderUnreadSection() : null;
        const channelGroupSection = showUnreadOption ? this.renderChannelGroupSection() : null;

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
                    {/*{unreadSection}*/}
                    {channelGroupSection}
                    {showUnreadOption && <div className='divider-light'/>}
                    {autoCloseDMSection}
                    <div className='divider-dark'/>
                </div>
            </div>
        );
    }
}
