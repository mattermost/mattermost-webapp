// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import ActivityLog from 'components/activity_log_modal/components/activity_log.jsx';
import LoadingScreen from 'components/loading_screen';

export default class ActivityLogModal extends React.PureComponent {
    static propTypes = {

        /**
         * The current user id
         */
        currentUserId: PropTypes.string.isRequired,

        /**
         * Current user's sessions
         */
        sessions: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object,
        ]).isRequired,

        /**
         * Current user's locale
         */
        locale: PropTypes.string.isRequired,

        /**
         * Function that's called when user closes the modal
         */
        onHide: PropTypes.func.isRequired,
        actions: PropTypes.shape({

            /**
             * Function to refresh sessions from server
             */
            getSessions: PropTypes.func.isRequired,

            /**
             * Function to revoke a particular session
             */
            revokeSession: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            show: true,
        };
    }

    submitRevoke = (altId, e) => {
        e.preventDefault();
        var modalContent = $(e.target).closest('.modal-content'); // eslint-disable-line jquery/no-closest
        modalContent.addClass('animation--highlight');
        setTimeout(() => {
            modalContent.removeClass('animation--highlight');
        }, 1500);
        this.props.actions.revokeSession(this.props.currentUserId, altId).then(() => {
            this.props.actions.getSessions(this.props.currentUserId);
        });
    }

    onShow = () => {
        this.props.actions.getSessions(this.props.currentUserId);
    }

    onHide = () => {
        this.setState({show: false});
    }

    componentDidMount() {
        this.onShow();
    }

    render() {
        let content;
        if (this.props.sessions.loading) {
            content = <LoadingScreen/>;
        } else {
            const activityList = this.props.sessions.reduce((array, currentSession, index) => {
                if (currentSession.props.type === 'UserAccessToken') {
                    return array;
                }

                array.push(
                    <ActivityLog
                        key={currentSession.id}
                        index={index}
                        locale={this.props.locale}
                        currentSession={currentSession}
                        submitRevoke={this.submitRevoke}
                    />,
                );
                return array;
            }, []);

            content = <form role='form'>{activityList}</form>;
        }

        return (
            <Modal
                dialogClassName='a11y__modal modal--scroll'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                bsSize='large'
                role='dialog'
                aria-labelledby='activityLogModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='activityLogModalLabel'
                    >
                        <FormattedMessage
                            id='activity_log.activeSessions'
                            defaultMessage='Active Sessions'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className='session-help-text'>
                        <FormattedMessage
                            id='activity_log.sessionsDescription'
                            defaultMessage="Sessions are created when you log in through a new browser on a device. Sessions let you use Mattermost without having to log in again for a time period specified by the system administrator. To end the session sooner, use the 'Log Out' button."
                        />
                    </p>
                    {content}
                </Modal.Body>
                <Modal.Footer className='modal-footer--invisible'>
                    <button
                        id='closeModalButton'
                        type='button'
                        className='btn btn-link'
                    >
                        <FormattedMessage
                            id='general_button.close'
                            defaultMessage='Close'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
