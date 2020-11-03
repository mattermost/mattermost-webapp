// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import {IgnoreChannelMentions, NotificationLevels, NotificationSections} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import NotificationSection from 'components/channel_notifications_modal/components/notification_section.jsx';

export default class ChannelNotificationsModal extends React.PureComponent {
    static propTypes = {

        /**
         * Function that is called when modal is hidden
         */
        onHide: PropTypes.func.isRequired,

        /**
         * Object with info about current channel
         */
        channel: PropTypes.object.isRequired,

        /**
         * Object with info about current channel membership
         */
        channelMember: PropTypes.object.isRequired,

        /**
         * Object with info about current user
         */
        currentUser: PropTypes.object.isRequired,

        /**
         * Boolean whether server sends push notifications
         */
        sendPushNotifications: PropTypes.bool.isRequired,

        /*
         * Object with redux action creators
         */
        actions: PropTypes.shape({

            /*
             * Action creator to update channel notify props
             */
            updateChannelNotifyProps: PropTypes.func.isRequired,
        }),
    };

    constructor(props) {
        super(props);

        const channelNotifyProps = props.channelMember && props.channelMember.notify_props;

        this.state = {
            show: true,
            activeSection: NotificationSections.NONE,
            serverError: null,
            ...this.getStateFromNotifyProps(channelNotifyProps, props.currentUser.notify_props),
        };
    }

    componentDidUpdate(prevProps) {
        const prevChannelNotifyProps = prevProps.channelMember && prevProps.channelMember.notify_props;
        const channelNotifyProps = this.props.channelMember && this.props.channelMember.notify_props;

        if (!Utils.areObjectsEqual(channelNotifyProps, prevChannelNotifyProps)) {
            this.resetStateFromNotifyProps(channelNotifyProps, this.props.currentUser.notify_props);
        }
    }

    resetStateFromNotifyProps(channelMemberNotifyProps, currentUserNotifyProps) {
        this.setState(this.getStateFromNotifyProps(channelMemberNotifyProps, currentUserNotifyProps));
    }

    getStateFromNotifyProps(channelMemberNotifyProps, currentUserNotifyProps) {
        let ignoreChannelMentionsDefault = IgnoreChannelMentions.OFF;

        if (channelMemberNotifyProps.mark_unread === NotificationLevels.MENTION || (currentUserNotifyProps.channel && currentUserNotifyProps.channel === 'false')) {
            ignoreChannelMentionsDefault = IgnoreChannelMentions.ON;
        }

        let ignoreChannelMentions = channelMemberNotifyProps.ignore_channel_mentions;
        if (!ignoreChannelMentions || ignoreChannelMentions === IgnoreChannelMentions.DEFAULT) {
            ignoreChannelMentions = ignoreChannelMentionsDefault;
        }

        return {
            desktopNotifyLevel: channelMemberNotifyProps.desktop || NotificationLevels.DEFAULT,
            markUnreadNotifyLevel: channelMemberNotifyProps.mark_unread || NotificationLevels.ALL,
            pushNotifyLevel: channelMemberNotifyProps.push || NotificationLevels.DEFAULT,
            ignoreChannelMentions,
        };
    }

    handleHide = () => {
        this.setState({
            show: false,
        });
    }

    handleExit = () => {
        this.updateSection(NotificationSections.NONE);
        this.props.onHide();
    }

    updateSection = (section = NotificationSections.NONE) => {
        this.setState({activeSection: section});

        if (section === NotificationSections.NONE) {
            const channelNotifyProps = this.props.channelMember && this.props.channelMember.notify_props;
            this.resetStateFromNotifyProps(channelNotifyProps, this.props.currentUser.notify_props);
        }
    }

    handleUpdateChannelNotifyProps = async (props) => {
        const {
            actions,
            channel,
            currentUser,
        } = this.props;

        const {error} = await actions.updateChannelNotifyProps(currentUser.id, channel.id, props);
        if (error) {
            this.setState({serverError: error.message});
        } else {
            this.updateSection(NotificationSections.NONE);
        }
    }

    handleSubmitDesktopNotifyLevel = () => {
        const channelNotifyProps = this.props.channelMember && this.props.channelMember.notify_props;
        const {desktopNotifyLevel} = this.state;

        if (channelNotifyProps.desktop === desktopNotifyLevel) {
            this.updateSection(NotificationSections.NONE);
            return;
        }

        const props = {desktop: desktopNotifyLevel};
        this.handleUpdateChannelNotifyProps(props);
    }

    handleUpdateDesktopNotifyLevel = (desktopNotifyLevel) => {
        this.setState({desktopNotifyLevel});
    }

    handleSubmitMarkUnreadLevel = () => {
        const channelNotifyProps = this.props.channelMember && this.props.channelMember.notify_props;
        const {markUnreadNotifyLevel} = this.state;

        if (channelNotifyProps.mark_unread === markUnreadNotifyLevel) {
            this.updateSection(NotificationSections.NONE);
            return;
        }

        const props = {mark_unread: markUnreadNotifyLevel};
        this.handleUpdateChannelNotifyProps(props);
    }

    handleUpdateMarkUnreadLevel = (markUnreadNotifyLevel) => {
        this.setState({markUnreadNotifyLevel});
    }

    handleSubmitPushNotificationLevel = () => {
        const channelNotifyProps = this.props.channelMember && this.props.channelMember.notify_props;
        const {pushNotifyLevel} = this.state;

        if (channelNotifyProps.push === pushNotifyLevel) {
            this.updateSection(NotificationSections.NONE);
            return;
        }

        const props = {push: pushNotifyLevel};
        this.handleUpdateChannelNotifyProps(props);
    }

    handleUpdatePushNotificationLevel = (pushNotifyLevel) => {
        this.setState({pushNotifyLevel});
    }

    handleUpdateIgnoreChannelMentions = (ignoreChannelMentions) => {
        this.setState({ignoreChannelMentions});
    }

    handleSubmitIgnoreChannelMentions = () => {
        const channelNotifyProps = this.props.channelMember && this.props.channelMember.notify_props;
        const {ignoreChannelMentions} = this.state;

        if (channelNotifyProps.ignore_channel_mentions === ignoreChannelMentions) {
            this.updateSection('');
            return;
        }

        const props = {ignore_channel_mentions: ignoreChannelMentions};
        this.handleUpdateChannelNotifyProps(props);
    }

    render() {
        const {
            activeSection,
            desktopNotifyLevel,
            markUnreadNotifyLevel,
            pushNotifyLevel,
            ignoreChannelMentions,
            serverError,
        } = this.state;

        const {
            channel,
            channelMember,
            currentUser,
            sendPushNotifications,
        } = this.props;

        let serverErrorTag = null;
        if (serverError) {
            serverErrorTag = <div className='form-group has-error'><label className='control-label'>{serverError}</label></div>;
        }

        return (
            <Modal
                dialogClassName='a11y__modal settings-modal settings-modal--tabless'
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
                role='dialog'
                aria-labelledby='channelNotificationModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='channelNotificationModalLabel'
                    >
                        <FormattedMessage
                            id='channel_notifications.preferences'
                            defaultMessage='Notification Preferences for '
                        />
                        <span className='name'>{channel.display_name}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='settings-table'>
                        <div className='settings-content'>
                            <div
                                ref='wrapper'
                                className='user-settings'
                            >
                                <br/>
                                <div className='divider-dark first'/>
                                <NotificationSection
                                    section={NotificationSections.MARK_UNREAD}
                                    expand={activeSection === NotificationSections.MARK_UNREAD}
                                    memberNotificationLevel={markUnreadNotifyLevel}
                                    onChange={this.handleUpdateMarkUnreadLevel}
                                    onSubmit={this.handleSubmitMarkUnreadLevel}
                                    onUpdateSection={this.updateSection}
                                    serverError={serverError}
                                />
                                <div className='divider-light'/>
                                <NotificationSection
                                    section={NotificationSections.IGNORE_CHANNEL_MENTIONS}
                                    expand={activeSection === NotificationSections.IGNORE_CHANNEL_MENTIONS}
                                    memberNotificationLevel={markUnreadNotifyLevel}
                                    ignoreChannelMentions={ignoreChannelMentions}
                                    onChange={this.handleUpdateIgnoreChannelMentions}
                                    onSubmit={this.handleSubmitIgnoreChannelMentions}
                                    onUpdateSection={this.updateSection}
                                    serverError={serverError}
                                />
                                {!isChannelMuted(channelMember) &&
                                <div>
                                    <div className='divider-light'/>
                                    <NotificationSection
                                        section={NotificationSections.DESKTOP}
                                        expand={activeSection === NotificationSections.DESKTOP}
                                        memberNotificationLevel={desktopNotifyLevel}
                                        globalNotificationLevel={currentUser.notify_props ? currentUser.notify_props.desktop : NotificationLevels.ALL}
                                        onChange={this.handleUpdateDesktopNotifyLevel}
                                        onSubmit={this.handleSubmitDesktopNotifyLevel}
                                        onUpdateSection={this.updateSection}
                                        serverError={serverError}
                                    />
                                    <div className='divider-light'/>
                                    {sendPushNotifications &&
                                    <NotificationSection
                                        section={NotificationSections.PUSH}
                                        expand={activeSection === NotificationSections.PUSH}
                                        memberNotificationLevel={pushNotifyLevel}
                                        globalNotificationLevel={currentUser.notify_props ? currentUser.notify_props.push : NotificationLevels.ALL}
                                        onChange={this.handleUpdatePushNotificationLevel}
                                        onSubmit={this.handleSubmitPushNotificationLevel}
                                        onUpdateSection={this.updateSection}
                                        serverError={serverError}
                                    />
                                    }
                                </div>
                                }
                                <div className='divider-dark'/>
                            </div>
                        </div>
                    </div>
                    {serverErrorTag}
                </Modal.Body>
            </Modal>
        );
    }
}
/* eslint-enable react/no-string-refs */
