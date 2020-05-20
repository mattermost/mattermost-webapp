// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/src/types/users';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {getSiteURL} from 'utils/url';
import {Constants, ModalIdentifiers} from 'utils/constants';
import {t} from 'utils/i18n';

import {trackEvent} from 'actions/diagnostics_actions';
import * as AdminActions from 'actions/admin_actions.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

const StatTypes = Constants.StatTypes;

type Props = {
    user: UserProfile;
    license?: Record<string, any>;
    show: boolean;
    closeParentComponent?: () => Promise<void>;
    stats: Record<string, any>;
    warnMetricId: string;
    actions: {
        closeModal: (arg: string) => void;
        getStandardAnalytics: () => any;
        sendWarnMetricAck: (arg0: string, arg1: boolean) => ActionFunc & Partial<{error: Error}>;
    };
}

type State = {
    forceAck: boolean;
    serverError: string | null;
    saving: boolean;
}

export default class WarnMetricAckModal extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            forceAck: false,
            saving: false,
            serverError: null,
        };
    }

    componentDidMount() {
        AdminActions.getStandardAnalytics();
    }

    onAcknowledgeClick = async () => {
        trackEvent('admin', 'click_warn_metric_ack_acknowledge', {metric: this.props.warnMetricId});

        this.setState({saving: true});
        const {error} = await this.props.actions.sendWarnMetricAck(this.props.warnMetricId, this.state.forceAck);
        if (error) {
            this.setState({serverError: error.message, saving: false});
        } else {
            this.onHideWithParent();
        }
    }

    onHide = () => {
        this.setState({serverError: null, saving: false, forceAck: false});
        this.props.actions.closeModal(ModalIdentifiers.WARN_METRIC_ACK);
    }

    onHideWithParent = () => {
        this.onHide();
        if (this.props.closeParentComponent) {
            this.props.closeParentComponent();
        }
    }

    renderError = () => {
        const {serverError} = this.state;
        if (!serverError) {
            return null;
        }

        const mailRecipient = 'acknowledge@mattermost.com';
        const mailSubject = encodeURIComponent('Acknowledgement of User Limit');

        let mailBody = 'This is a receipt of acknowledgement for the number of active users exceeding the limit for the following site.';
        mailBody += '\r\n';
        mailBody += 'Contact Email ' + this.props.user.email;
        mailBody += '\r\n';
        mailBody += 'Site URL ' + getSiteURL();
        mailBody += '\r\n';

        if (this.props.license && this.props.license.IsLicensed === 'true') {
            mailBody += 'License ID ' + this.props.license.Id;
            mailBody += '\r\n';
        }
        if (this.props.stats[StatTypes.TOTAL_USERS]) {
            mailBody += 'Registered Users ' + this.props.stats[StatTypes.TOTAL_USERS];
            mailBody += '\r\n';
        }
        mailBody += 'If you have any additional inquiries, please contact support@mattermost.com';
        mailBody = encodeURIComponent(mailBody);

        const mailToLinkText = 'mailto:' + mailRecipient + '?cc=' + this.props.user.email + '&subject=' + mailSubject + '&body=' + mailBody;

        this.setState({forceAck: true});
        return (
            <div className='form-group has-error'>
                <br/>
                <label className='control-label'>
                    <FormattedMessage
                        id='warn_metric_ack_modal.mailto.message'
                        defaultMessage='We were unable to send acknowledgement. Please {link} to acknowledge the warning!'
                        values={{
                            link: (
                                <WarnMetricAckErrorLink
                                    url={mailToLinkText}
                                    messageId={t('warn_metric_ack_modal.mailto.link')}
                                    defaultMessage={'Email Us'}
                                    onClickHandler={this.onAcknowledgeClick}
                                    warnMetricId={this.props.warnMetricId}
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
                id='warn_metric_ack_modal.header.title'
                defaultMessage='Warning'
            />
        );
        const descriptionText = (
            <FormattedMessage
                id='warn_metric_ack_modal.description'
                defaultMessage='The number of active users is greater than the supported limit. Please acknowledge the issue by clicking below.'
            />
        );
        const buttonText = (
            <FormattedMessage
                id='warn_metric_ack_modal.acknowledge'
                defaultMessage='Acknowledge'
            />
        );
        const subText = (
            <div
                style={{opacity: '0.45'}}
                className='help__format-text'
            >
                <FormattedMarkdownMessage
                    id='warn_metric_ack_modal.mailto.body.sub_text'
                    defaultMessage='Acknowledgement will be sent to Mattermost, Inc.'
                />
            </div>
        );
        return (
            <Modal
                dialogClassName='a11y__modal'
                show={this.props.show}
                keyboard={false}
                onHide={this.onHide}
                onExited={this.onHide}
                role='dialog'
                aria-labelledby='warnMetricAckHeaderModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='warnMetricAckHeaderModalLabel'
                    >
                        {headerTitle}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {descriptionText}
                        <br/>
                        {this.renderError()}
                        <br/>
                        {subText}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link cancel-button'
                        onClick={this.onHide}
                    >
                        <FormattedMessage
                            id='warn_metric_ack_modal.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary save-button'
                        data-dismiss='modal'
                        disabled={this.state.saving}
                        autoFocus={true}
                        onClick={this.onAcknowledgeClick}
                    >
                        {buttonText}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

type ErrorLinkProps = {
    defaultMessage: string;
    messageId: string;
    onClickHandler: () => Promise<void>;
    url: string;
    warnMetricId: string;
}

const WarnMetricAckErrorLink: React.FC<ErrorLinkProps> = ({defaultMessage, messageId, onClickHandler, url}: ErrorLinkProps) => {
    return (
        <a
            href={url}
            rel='noopener noreferrer'
            target='_blank'
            onClick={
                () => {
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