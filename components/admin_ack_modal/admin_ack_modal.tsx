// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/src/types/users';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {getSiteURL} from 'utils/url';
import {t} from 'utils/i18n';

import {ModalIdentifiers} from 'utils/constants';
import {trackEvent} from 'actions/diagnostics_actions';

type Props = {
    user: UserProfile;
    license?: Record<string, any>;
    show: boolean;
    closeParentComponent: () => Promise<void>;
    actions: {
        sendAdminAck: () => ActionFunc & Partial<{error: Error}>;
        closeModal: (arg0: string) => void;
    };
}

type State = {
    serverError: string | null;
    saving: boolean;
}

export default class AdminAckModal extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            saving: false,
            serverError: null,
        };
    }

    handleSave = async () => {
        trackEvent('admin', 'click_admin_ack_submit');

        this.setState({saving: true});
        const {error} = await this.props.actions.sendAdminAck();
        if (error) {
            this.setState({serverError: error.message, saving: false});
        } else {
            this.onHideWithParent();
        }
    }

    onHide = () => {
        this.setState({serverError: null, saving: false});
        this.props.actions.closeModal(ModalIdentifiers.ADMIN_ACK);
    }

    onHideWithParent = () => {
        this.onHide();
        this.props.closeParentComponent();
    }

    renderError = () => {
        const {serverError} = this.state;
        if (!serverError) {
            return null;
        }

        const mailRecipient = 'support@mattermost.com';
        const mailSubject = 'Warning: Number of active users exceeded the limit';
        let mailBody = 'Number of active users exceeded the limit for SiteURL: ' + getSiteURL() + ' Contact Email: ' + this.props.user.email;
        if (this.props.license && this.props.license.IsLicensed === 'true') {
            mailBody += ' License Id: ' + this.props.license.Id;
        }
        const mailToLinkText = 'mailto:' + mailRecipient + '?cc=' + this.props.user.email + '&subject=' + mailSubject + '&body=' + mailBody;

        return (
            <div className='form-group has-error'>
                <br/>
                <label className='control-label'>
                    <FormattedMessage
                        id='admin_ack_modal.mailto.message'
                        defaultMessage='Failed to send confirmation email, please click {link} to acknowledge the warning!'
                        values={{
                            link: (
                                <AdminAckErrorLink
                                    url={mailToLinkText}
                                    messageId={t('admin_ack_modal.mailto.message.link')}
                                    defaultMessage={'MailTo'}
                                    onClickHandler={this.handleSave}
                                />
                            ),
                        }}
                    />
                </label>
            </div>
        );
    }

    render() {
        const headerTitle = (
            <FormattedMessage
                id='admin_ack_modal.header.title'
                defaultMessage='Warning!'
            />
        );
        const descriptionText = (
            <FormattedMessage
                id='admin_ack_modal.description'
                defaultMessage='The number of active users is greater than the supported limit. Please acknowledge the issue by clicking the Acknowledge button!'
            />
        );
        const buttonText = (
            <FormattedMessage
                id='admin_ack_modal.submit'
                defaultMessage='Acknowledge'
            />
        );
        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.props.show}
                keyboard={false}
                onHide={this.onHide}
                onExited={this.onHide}
                role='dialog'
                aria-labelledby='adminAckHeaderModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='adminAckHeaderModalLabel'
                    >
                        {headerTitle}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='alert alert-danger'>
                        {descriptionText}
                        <br/>
                        {this.renderError()}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link cancel-button'
                        onClick={this.onHide}
                    >
                        <FormattedMessage
                            id='admin_ack_modal.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-danger save-button'
                        data-dismiss='modal'
                        disabled={this.state.saving}
                        autoFocus={true}
                        onClick={this.handleSave}
                    >
                        {buttonText}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

type ErrorLinkProps = {
    url: string;
    messageId: string;
    defaultMessage: string;
    onClickHandler: () => Promise<void>;
}

const AdminAckErrorLink: React.FC<ErrorLinkProps> = ({url, messageId, defaultMessage, onClickHandler}: ErrorLinkProps) => {
    return (
        <a
            href={url}
            rel='noopener noreferrer'
            target='_blank'
            onClick={
                () => {
                    trackEvent('admin', 'click_admin_ack_submit');
                    onClickHandler();
                }
            }
        >
            <FormattedMessage
                id={messageId}
                defaultMessage={defaultMessage}
            />
        </a>
    );
};