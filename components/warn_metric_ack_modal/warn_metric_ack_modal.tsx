// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/src/types/users';
import {Dictionary} from 'mattermost-redux/src/types/utilities';
import {AnalyticsRow} from 'mattermost-redux/types/admin';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {getSiteURL} from 'utils/url';
import {t} from 'utils/i18n';
import {Constants, ModalIdentifiers, WarnMetricTypes} from 'utils/constants';

import {trackEvent} from 'actions/diagnostics_actions';
import * as AdminActions from 'actions/admin_actions.jsx';

const StatTypes = Constants.StatTypes;

import * as Utils from 'utils/utils.jsx';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import ErrorLink from 'components/error_page/error_link';

type Props = {
    user: UserProfile;
    license?: Record<string, any>;
    diagnosticId?: string;
    show: boolean;
    closeParentComponent?: () => Promise<void>;
    stats?: Dictionary<number | AnalyticsRow[]>;
    warnMetricStatus: any;
    enterpriseReady: boolean;
    actions: {
        closeModal: (arg: string) => void;
        getStandardAnalytics: () => any;
        sendWarnMetricAck: (arg0: string, arg1: boolean) => ActionFunc & Partial<{error?: string}>;
    };
}

type State = {
    serverError: string | null;
    gettingTrial: boolean;
    gettingTrialError: string | null;
    saving: boolean;
}

const containerStyles: CSSProperties = {
    display: 'flex',
    opacity: '0.56',
    flexWrap: 'wrap',
};

export default class WarnMetricAckModal extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            saving: false,
            serverError: null,
            gettingTrial: false,
            gettingTrialError: null,
        };
    }

    componentDidMount() {
        AdminActions.getStandardAnalytics();
    }

    onContactUsClick = async (e: any) => {
        if (this.state.saving) {
            return;
        }

        this.setState({saving: true, serverError: null});

        let forceAck = false;
        if (e && e.target && e.target.dataset && e.target.dataset.forceack) {
            forceAck = true;
            trackEvent('admin', 'click_warn_metric_mailto', {metric: this.props.warnMetricStatus.id});
        } else {
            trackEvent('admin', 'click_warn_metric_contact_us', {metric: this.props.warnMetricStatus.id});
        }

        const {error} = await this.props.actions.sendWarnMetricAck(this.props.warnMetricStatus.id, forceAck);
        if (error) {
            this.setState({serverError: error, saving: false});
        } else {
            this.onHide();
        }
    }

    onHide = () => {
        this.setState({serverError: null, saving: false});

        this.setState({gettingTrialError: null, gettingTrial: false});
        this.props.actions.closeModal(ModalIdentifiers.WARN_METRIC_ACK);
        if (this.props.closeParentComponent) {
            this.props.closeParentComponent();
        }
    }

    renderContactUsError = () => {
        const {serverError} = this.state;
        if (!serverError) {
            return '';
        }

        const mailRecipient = 'support@mattermost.com';
        const mailSubject = 'Mattermost Contact Us request';
        let mailBody = 'Mattermost Contact Us request. My team now has ' + this.props.warnMetricStatus.limit + ' users and I am considering Mattermost Enterprise Edition.';
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

        return (
            <div className='form-group has-error'>
                <br/>
                <label className='control-label'>
                    <FormattedMessage
                        id='warn_metric_ack_modal.mailto.message'
                        defaultMessage='Support could not be reached. Please {link}.'
                        values={{
                            link: (
                                <WarnMetricAckErrorLink
                                    url={mailToLinkText}
                                    messageId={t('warn_metric_ack_modal.mailto.link')}
                                    forceAck={true}
                                    defaultMessage='email us'
                                    onClickHandler={this.onContactUsClick}
                                />
                            ),
                        }}
                    />
                </label>
            </div>
        );
    }

    render() {
        let headerTitle;
        if (this.props.warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_ACTIVE_USERS_500) {
            headerTitle = (
                <FormattedMessage
                    id='warn_metric_ack_modal.number_of_users.header.title'
                    defaultMessage='Scaling with Mattermost'
                />
            );
        } else if (this.props.warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_POSTS_500K) {
            headerTitle = (
                <FormattedMessage
                    id='warn_metric_ack_modal.number_of_posts.header.title'
                    defaultMessage='Improve Performance'
                />
            );
        }

        let descriptionText;
        const learnMoreLink = 'https://mattermost.com/pl/default-admin-advisory';

        if (this.props.warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_ACTIVE_USERS_500) {
            descriptionText = (
                <FormattedMessage
                    id='warn_metric_ack_modal.number_of_active_users.description'
                    defaultMessage='Mattermost strongly recommends that deployments of over {limit}} users take advantage of features such as user management, server clustering, and performance monitoring. Contact us to learn more and let us know how we can help.'
                    values={{
                        limit: this.props.warnMetricStatus.limit,
                    }}
                />
            );
        } else if (this.props.warnMetricStatus.id === WarnMetricTypes.SYSTEM_WARN_METRIC_NUMBER_OF_POSTS_500K) {
            descriptionText = (
                <FormattedMessage
                    id='warn_metric_ack_modal.number_of_posts.description'
                    defaultMessage='Your Mattermost system has a very high number of posts. Mattermost strongly recommends that you implement Elasticsearch in order to optimize search performance and prevent performance degradation and timeouts. Contact us to learn more and let us know how we can help.'
                    values={{
                        limit: this.props.warnMetricStatus.limit,
                    }}
                />
            );
        }

        const subText = (
            <div
                style={containerStyles}
                className='help__format-text'
            >
                <FormattedMessage
                    id='warn_metric_ack_modal.subtext'
                    defaultMessage='By clicking Acknowledge, you will be sharing your information with Mattermost Inc., to learn more about upgrading. {link}'
                    values={{
                        link: (
                            <ErrorLink
                                url={learnMoreLink}
                                messageId={t('warn_metric_ack_modal.learn_more.link')}
                                defaultMessage='Learn more'
                            />
                        ),
                    }}
                />
            </div>
        );

        const error = this.renderContactUsError();
        const footer = (
            <Modal.Footer>
                <button
                    className='btn btn-primary save-button'
                    data-dismiss='modal'
                    disabled={this.state.saving}
                    autoFocus={true}
                    onClick={this.onContactUsClick}
                >
                    <LoadingWrapper
                        loading={this.state.saving}
                        text={Utils.localizeMessage('admin.warn_metric.sending-email', 'Sending email')}
                    >
                        <FormattedMessage
                            id='warn_metric_ack_modal.contact_support'
                            defaultMessage='Acknowledge'
                        />
                    </LoadingWrapper>
                </button>
            </Modal.Footer>
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
                        {error}
                        <br/>
                        {subText}
                    </div>
                </Modal.Body>
                {footer}
            </Modal>
        );
    }
}

type ErrorLinkProps = {
    defaultMessage: string;
    messageId: string;
    onClickHandler: (e: React.MouseEvent<HTMLAnchorElement>) => Promise<void>;
    url: string;
    forceAck: boolean;
}

const WarnMetricAckErrorLink: React.FC<ErrorLinkProps> = ({defaultMessage, messageId, onClickHandler, url, forceAck}: ErrorLinkProps) => {
    return (
        <a
            href={url}
            rel='noopener noreferrer'
            target='_blank'
            data-forceAck={forceAck}
            onClick={
                (e) => {
                    onClickHandler(e);
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
