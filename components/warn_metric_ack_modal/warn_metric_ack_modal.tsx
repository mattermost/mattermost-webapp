// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/src/types/users';
import {Dictionary} from 'mattermost-redux/src/types/utilities';
import {AnalyticsRow} from 'mattermost-redux/types/admin';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import {trackEvent} from 'actions/diagnostics_actions';
import * as AdminActions from 'actions/admin_actions.jsx';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

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
        requestTrialLicenseAndAckWarnMetric: (arg0: string) => ActionFunc & Partial<{error?: string}>;
        getLicenseConfig: () => void;
    };
}

type State = {
    gettingTrial: boolean;
    gettingTrialError: string | null;
}

export default class WarnMetricAckModal extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            gettingTrial: false,
            gettingTrialError: null,
        };
    }

    componentDidMount() {
        AdminActions.getStandardAnalytics();
    }

    requestLicenseAndAckWarnMetric = async (e: React.MouseEvent) => {
        trackEvent('admin', 'click_warn_metric_ack_start_trial', {metric: this.props.warnMetricStatus.id});

        e.preventDefault();
        if (this.state.gettingTrial) {
            return;
        }
        this.setState({gettingTrial: true, gettingTrialError: null});
        const {error} = await this.props.actions.requestTrialLicenseAndAckWarnMetric(this.props.warnMetricStatus.id);
        if (error) {
            this.setState({gettingTrialError: error});
        } else {
            this.onHideWithParent();
        }
        this.setState({gettingTrial: false});
        this.props.actions.getLicenseConfig();
    }

    onHide = () => {
        this.setState({gettingTrialError: null, gettingTrial: false});
        this.props.actions.closeModal(ModalIdentifiers.WARN_METRIC_ACK);
    }

    onHideWithParent = () => {
        this.onHide();
        if (this.props.closeParentComponent) {
            this.props.closeParentComponent();
        }
    }

    renderError = () => {
        const {gettingTrialError} = this.state;
        if (!gettingTrialError) {
            return '';
        }

        return (
            <div className='form-group has-error'>
                <br/>
                <label className='control-label'>
                    <FormattedMessage
                        id='warn_metric_ack_modal.error.body'
                        defaultMessage='The license could not be retrieved. Please try again or visit https://mattermost.com/trial/ to request a license.'
                    />
                </label>
            </div>
        );
    }

    render() {
        const headerTitle = (
            <FormattedMessage
                id='warn_metric_ack_modal.header.title'
                defaultMessage='Upgrade to Mattermost Enterprise Edition'
            />
        );
        const descriptionText = (
            <FormattedMessage
                id='warn_metric_ack_modal.number_of_active_users.description'
                defaultMessage='Mattermost strongly recommends that deployments of over {limit} users upgrade to Mattermost Enterprise E20, which offers features such as user management, server clustering, and performance monitoring'
                values={{
                    limit: this.props.warnMetricStatus.limit,
                }}
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
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className='btn btn-primary'
                        data-testid='featureDiscovery_primaryCallToAction'
                        onClick={this.requestLicenseAndAckWarnMetric}
                    >
                        <LoadingWrapper
                            loading={this.state.gettingTrial}
                            text={Utils.localizeMessage('admin.license.trial-request.loading', 'Getting trial')}
                        >
                            <FormattedMessage
                                id='warn_metric_ack_modal.start_trial'
                                defaultMessage='Start trial'
                            />
                        </LoadingWrapper>
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}