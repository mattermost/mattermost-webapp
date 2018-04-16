// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import {NotificationLevels, NotificationSections} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import NotificationSection from 'components/channel_notifications_modal/components/notification_section.jsx';

export default class ChannelNotificationsModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired,
        channel: PropTypes.object.isRequired,
        channelMember: PropTypes.object.isRequired,
        currentUser: PropTypes.object.isRequired,
        sendPushNotifications: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            updateChannelNotifyProps: PropTypes.func.isRequired,
        }),
    };

    constructor(props) {
        super(props);

        this.state = {
            activeSection: NotificationSections.NONE,
            desktopNotifyLevel: props.channelMember.notify_props.desktop,
            markUnreadNotifyLevel: props.channelMember.notify_props.mark_unread,
            pushNotifyLevel: props.channelMember.notify_props.push || NotificationLevels.DEFAULT,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!Utils.areObjectsEqual(this.props.channelMember.notify_props, nextProps.channelMember.notify_props)) {
            this.setState({
                desktopNotifyLevel: nextProps.channelMember.notify_props.desktop,
                markUnreadNotifyLevel: nextProps.channelMember.notify_props.mark_unread,
                pushNotifyLevel: nextProps.channelMember.notify_props.push || NotificationLevels.DEFAULT,
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
            this.updateSection('');
        }
    }

    handleSubmitDesktopNotifyLevel = () => {
        const {channelMember} = this.props;
        const {desktopNotifyLevel} = this.state;

        if (channelMember.notify_props.desktop === desktopNotifyLevel) {
            this.updateSection('');
            return;
        }

        const props = {desktop: desktopNotifyLevel};
        this.handleUpdateChannelNotifyProps(props);
    }

    handleUpdateDesktopNotifyLevel = (desktopNotifyLevel) => {
        this.setState({desktopNotifyLevel});
    }

    handleUpdateDesktopSection = (section = NotificationSections.NONE) => {
        this.updateSection(section);
        this.setState({
            desktopNotifyLevel: this.props.channelMember.notify_props.desktop,
        });
    }

    handleSubmitMarkUnreadLevel = () => {
        const {channelMember} = this.props;
        const {markUnreadNotifyLevel} = this.state;

        if (channelMember.notify_props.mark_unread === markUnreadNotifyLevel) {
            this.updateSection('');
            return;
        }

        const props = {mark_unread: markUnreadNotifyLevel};
        this.handleUpdateChannelNotifyProps(props);
    }

    handleUpdateMarkUnreadLevel = (markUnreadNotifyLevel) => {
        this.setState({markUnreadNotifyLevel});
    }

    handleUpdateMarkUnreadSection = (section = NotificationSections.NONE) => {
        this.updateSection(section);
        this.setState({
            markUnreadNotifyLevel: this.props.channelMember.notify_props.mark_unread,
        });
    }

    handleSubmitPushNotificationLevel = () => {
        const {pushNotifyLevel} = this.state;

        if (this.props.channelMember.notify_props.push === pushNotifyLevel) {
            this.updateSection('');
            return;
        }

        const props = {push: pushNotifyLevel};
        this.handleUpdateChannelNotifyProps(props);
    }

    handleUpdatePushNotificationLevel = (pushNotifyLevel) => {
        this.setState({pushNotifyLevel});
    }

    handleUpdatePushSection = (section = NotificationSections.NONE) => {
        this.updateSection(section);
        this.setState({
            pushNotifyLevel: this.props.channelMember.notify_props.push,
        });
    }

    render() {
        const {
            activeSection,
            desktopNotifyLevel,
            markUnreadNotifyLevel,
            pushNotifyLevel,
            serverError,
        } = this.state;

        const {
            channel,
            channelMember,
            currentUser,
            sendPushNotifications,
            show,
        } = this.props;

        let serverErrorTag = null;
        if (serverError) {
            serverErrorTag = <div className='form-group has-error'><label className='control-label'>{serverError}</label></div>;
        }

        return (
            <Modal
                show={show}
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
                                    onUpdateSection={this.handleUpdateMarkUnreadSection}
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
                                        onUpdateSection={this.handleUpdateDesktopSection}
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
                                        onUpdateSection={this.handleUpdatePushSection}
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
