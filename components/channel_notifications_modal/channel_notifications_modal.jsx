// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {updateChannelNotifyProps} from 'actions/channel_actions.jsx';

import {NotificationLevels, NotificationSections} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import NotificationSection from 'components/channel_notifications_modal/components/notification_section.jsx';

export default class ChannelNotificationsModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeSection: NotificationSections.NONE,
            notifyLevel: props.channelMember.notify_props.desktop,
            unreadLevel: props.channelMember.notify_props.mark_unread,
            pushLevel: props.channelMember.notify_props.push || NotificationLevels.DEFAULT,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!Utils.areObjectsEqual(this.props.channelMember.notify_props, nextProps.channelMember.notify_props)) {
            this.setState({
                notifyLevel: nextProps.channelMember.notify_props.desktop,
                unreadLevel: nextProps.channelMember.notify_props.mark_unread,
                pushLevel: nextProps.channelMember.notify_props.push || NotificationLevels.DEFAULT,
            });
        }
    }

    handleOnHide = () => {
        this.setState({
            activeSection: NotificationSections.NONE,
        });

        this.props.onHide();
    }

    updateSection = (section) => {
        if ($('.section-max').length) {
            $('.settings-modal .modal-body').scrollTop(0).perfectScrollbar('update');
        }
        this.setState({activeSection: section});
    }

    handleSubmitDesktopNotifyLevel = () => {
        const channelId = this.props.channel.id;
        const notifyLevel = this.state.notifyLevel;
        const currentUserId = this.props.currentUser.id;

        if (this.props.channelMember.notify_props.desktop === notifyLevel) {
            this.updateSection('');
            return;
        }

        const options = {desktop: notifyLevel};
        const data = {
            channel_id: channelId,
            user_id: currentUserId,
        };

        updateChannelNotifyProps(data, options,
            () => {
                this.updateSection('');
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleUpdateDesktopNotifyLevel = (notifyLevel) => {
        this.setState({notifyLevel});
    }

    handleUpdateDesktopSection = (section = NotificationSections.NONE) => {
        this.updateSection(section);
        this.setState({
            notifyLevel: this.props.channelMember.notify_props.desktop,
        });
    }

    handleSubmitMarkUnreadLevel = () => {
        const channelId = this.props.channel.id;
        const markUnreadLevel = this.state.unreadLevel;

        if (this.props.channelMember.notify_props.mark_unread === markUnreadLevel) {
            this.updateSection('');
            return;
        }

        const options = {mark_unread: markUnreadLevel};
        const data = {
            channel_id: channelId,
            user_id: this.props.currentUser.id,
        };

        updateChannelNotifyProps(data, options,
            () => {
                this.updateSection('');
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleUpdateMarkUnreadLevel = (unreadLevel) => {
        this.setState({unreadLevel});
    }

    handleUpdateMarkUnreadSection = (section = NotificationSections.NONE) => {
        this.updateSection(section);
        this.setState({
            unreadLevel: this.props.channelMember.notify_props.mark_unread,
        });
    }

    handleSubmitPushNotificationLevel = () => {
        const channelId = this.props.channel.id;
        const notifyLevel = this.state.pushLevel;
        const currentUserId = this.props.currentUser.id;

        if (this.props.channelMember.notify_props.push === notifyLevel) {
            this.updateSection('');
            return;
        }

        const options = {push: notifyLevel};
        const data = {
            channel_id: channelId,
            user_id: currentUserId,
        };

        updateChannelNotifyProps(data, options,
            () => {
                this.updateSection('');
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleUpdatePushNotificationLevel = (pushLevel) => {
        this.setState({pushLevel});
    }

    handleUpdatePushSection = (section = NotificationSections.NONE) => {
        this.updateSection(section);
        this.setState({
            pushLevel: this.props.channelMember.notify_props.push,
        });
    }

    render() {
        let serverError = null;
        if (this.state.serverError) {
            serverError = <div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div>;
        }

        return (
            <Modal
                show={this.props.show}
                dialogClassName='settings-modal settings-modal--tabless'
                onHide={this.handleOnHide}
                onExited={this.handleOnHide}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='channel_notifications.preferences'
                            defaultMessage='Notification Preferences for '
                        />
                        <span className='name'>{this.props.channel.display_name}</span>
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
                                    section={NotificationSections.DESKTOP}
                                    expand={this.state.activeSection === NotificationSections.DESKTOP}
                                    memberNotificationLevel={this.state.notifyLevel}
                                    globalNotificationLevel={this.props.currentUser.notify_props ?
                                        this.props.currentUser.notify_props.desktop :
                                        NotificationLevels.ALL
                                    }
                                    onChange={this.handleUpdateDesktopNotifyLevel}
                                    onSubmit={this.handleSubmitDesktopNotifyLevel}
                                    onUpdateSection={this.handleUpdateDesktopSection}
                                    serverError={this.state.serverError}
                                />
                                <div className='divider-light'/>
                                {this.props.sendPushNotifications &&
                                <NotificationSection
                                    section={NotificationSections.PUSH}
                                    expand={this.state.activeSection === NotificationSections.PUSH}
                                    memberNotificationLevel={this.state.pushLevel}
                                    globalNotificationLevel={this.props.currentUser.notify_props ?
                                        this.props.currentUser.notify_props.push :
                                        NotificationLevels.ALL
                                    }
                                    onChange={this.handleUpdatePushNotificationLevel}
                                    onSubmit={this.handleSubmitPushNotificationLevel}
                                    onUpdateSection={this.handleUpdatePushSection}
                                    serverError={this.state.serverError}
                                />
                                }
                                <div className='divider-light'/>
                                <NotificationSection
                                    section={NotificationSections.MARK_UNREAD}
                                    expand={this.state.activeSection === NotificationSections.MARK_UNREAD}
                                    memberNotificationLevel={this.state.unreadLevel}
                                    onChange={this.handleUpdateMarkUnreadLevel}
                                    onSubmit={this.handleSubmitMarkUnreadLevel}
                                    onUpdateSection={this.handleUpdateMarkUnreadSection}
                                    serverError={this.state.serverError}
                                />
                                <div className='divider-dark'/>
                            </div>
                        </div>
                    </div>
                    {serverError}
                </Modal.Body>
            </Modal>
        );
    }
}

ChannelNotificationsModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    channel: PropTypes.object.isRequired,
    channelMember: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    sendPushNotifications: PropTypes.bool.isRequired,
};
