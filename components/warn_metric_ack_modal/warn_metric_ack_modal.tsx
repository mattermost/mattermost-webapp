// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/src/types/users';
import {Dictionary} from 'mattermost-redux/src/types/utilities';
import {AnalyticsRow} from 'mattermost-redux/types/admin';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {getSiteURL} from 'utils/url';
import {Constants, ModalIdentifiers} from 'utils/constants';
import {t} from 'utils/i18n';

import {trackEvent} from 'actions/diagnostics_actions';
import * as AdminActions from 'actions/admin_actions.jsx';

import ErrorLink from 'components/error_page/error_link';

const StatTypes = Constants.StatTypes;

type Props = {
    user: UserProfile;
    license?: Record<string, any>;
    diagnosticId?: string;
    show: boolean;
    closeParentComponent?: () => Promise<void>;
    stats?: Dictionary<number | AnalyticsRow[]>;
    warnMetricStatus: any;
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

    onContactSupportClick = async () => {
        trackEvent('admin', 'click_warn_metric_ack_contact_support', {metric: this.props.warnMetricStatus.id});

        this.setState({saving: true});
        const {error} = await this.props.actions.sendWarnMetricAck(this.props.warnMetricStatus.id, this.state.forceAck);
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

        const mailRecipient = 'support@mattermost.com';
        const mailSubject = 'Mattermost support request:' + this.props.warnMetricStatus.aae_id;
        let mailBody = 'Mattermost support request for ' + this.props.warnMetricStatus.aae_id + ': Team exceeds ' + this.props.warnMetricStatus.limit + ' users. Consider activating user management access controls to ensure compliance.';
        mailBody += '\r\n';
        mailBody += 'Contact ' + this.props.user.first_name + ' ' + this.props.user.last_name;
        mailBody += '\r\n';
        mailBody += 'Email ' + this.props.user.email;
        mailBody += '\r\n';

        if (this.props.stats && this.props.stats[StatTypes.TOTAL_USERS]) {
            mailBody += 'Registered Users ' + this.props.stats[StatTypes.TOTAL_USERS];
            mailBody += '\r\n';
        }
        mailBody += 'Site URL ' + getSiteURL();
        mailBody += '\r\n';

        mailBody += 'Diagnostic Id ' + this.props.diagnosticId;
        mailBody += '\r\n';

        mailBody += 'If you have any additional inquiries, please contact support@mattermost.com';

        const mailToLinkText = 'mailto:' + mailRecipient + '?cc=' + this.props.user.email + '&subject=' + encodeURIComponent(mailSubject) + '&body=' + encodeURIComponent(mailBody);

        this.setState({forceAck: true});
        return (
            <div className='form-group has-error'>
                <br/>
                <label className='control-label'>
                    <FormattedMessage
                        id='warn_metric_ack_modal.mailto.message'
                        defaultMessage='We were unable to reach support. {link} instead to contact support'
                        values={{
                            link: (
                                <WarnMetricAckErrorLink
                                    url={mailToLinkText}
                                    messageId={t('warn_metric_ack_modal.mailto.link')}
                                    defaultMessage={'Email us'}
                                    onClickHandler={this.onContactSupportClick}
                                />
                            ),
                        }}
                    />
                </label>
            </div>
        );
    }

    render() {
        const learnMoreLink = 'https://mattermost.com/pl/default-aae-faq';
        const aaeLink = 'https://mattermost.com/pl/default-aae-faq';

        const headerTitle = (
            <FormattedMessage
                id='warn_metric_ack_modal.header.title'
                defaultMessage='Warning'
            />
        );
        const descriptionText = (
            <FormattedMessage
                id='warn_metric_ack_modal.number_of_active_users.description'
                defaultMessage='"Team exceeds {limit} users. Consider activating user management controls to ensure compliance. {link}"'
                values={{
                    limit: this.props.warnMetricStatus.limit,
                    link: (
                        <ErrorLink
                            url={aaeLink}
                            messageId={this.props.warnMetricStatus.aae_id}
                            defaultMessage={this.props.warnMetricStatus.aae_id}
                        />
                    ),
                }}
            />
        );
        const buttonText = (
            <FormattedMessage
                id='warn_metric_ack_modal.contact_support'
                defaultMessage='Contact Support'
            />
        );
        const subText = (
            <div
                style={{opacity: '0.45'}}
                className='help__format-text'
            >
                <FormattedMessage
                    id='warn_metric_ack_modal.mailto.body.sub_text'
                    defaultMessage='Contacting support sends your contact information to Mattermost, Inc. {link}'
                    values={{
                        link: (
                            <ErrorLink
                                url={learnMoreLink}
                                messageId={t('warn_metric_ack_modal.learn_more.link')}
                                defaultMessage={'Learn More'}
                            />
                        ),
                    }}
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
                        onClick={this.onContactSupportClick}
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