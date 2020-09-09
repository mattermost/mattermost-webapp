// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {History} from 'history';
import {Stripe, StripeElements} from '@stripe/stripe-js';
import {ElementsConsumer} from '@stripe/react-stripe-js';

import IconMessage from '../../icon_message';
import {BillingDetails} from 'types/sku';

import processSvg from 'images/payment-processing.svg';
import successSvg from 'images/payment-success.svg';
import failedSvg from 'images/payment-failed.svg';

import './process_payment.css';
import {injectIntl} from 'react-intl';
import {IntlProps} from 'types/ui';

type OwnProps = IntlProps & {
    history: History;
    billingDetails: BillingDetails | null;
    completeStripePayment: Function;
    back: Function;
}

type Props = {
    elements: StripeElements | null | undefined;
    stripe: Stripe | null | undefined;
} & OwnProps;

type State = {
    progress: number;
    error: string;
    state: ProcessState;
}

enum ProcessState {
    PROCESSING = 0,
    SUCCESS,
    FAILED
}

const MIN_PROCESSING_MILLISECONDS = 5000;
const MAX_FAKE_PROGRESS = 95;

class ProcessPayment extends React.PureComponent<Props, State> {
    intervalId: NodeJS.Timeout;

    public constructor(props: Props) {
        super(props);

        this.intervalId = {} as NodeJS.Timeout;

        this.state = {
            progress: 0,
            error: '',
            state: ProcessState.PROCESSING,
        };
    }

    public componentDidMount() {
        const {billingDetails} = this.props;
        if (billingDetails == null) {
            this.handleGoBack();
            return;
        }

        this.makePayment();

        this.intervalId = setInterval(this.updateProgress, MIN_PROCESSING_MILLISECONDS / MAX_FAKE_PROGRESS);

        document.getElementsByTagName('body')[0].classList.add('ProcessPayment-body');
    }

    public componentWillUnmount() {
        clearInterval(this.intervalId);
        document.getElementsByTagName('body')[0].classList.remove('ProcessPayment-body');
    }

    private updateProgress = () => {
        let {progress} = this.state;

        if (progress >= MAX_FAKE_PROGRESS) {
            clearInterval(this.intervalId);
            return;
        }

        progress += 1;
        this.setState({progress: progress > MAX_FAKE_PROGRESS ? MAX_FAKE_PROGRESS : progress});
    }

    private makePayment = async () => {
        const start = new Date();
        const {stripe, completeStripePayment} = this.props;

        const {error} = await completeStripePayment(stripe);
        if (error) {
            this.setState({error, state: ProcessState.FAILED});
            return;
        }

        const end = new Date();
        const millisecondsElapsed = end.valueOf() - start.valueOf();
        if (millisecondsElapsed < MIN_PROCESSING_MILLISECONDS) {
            setTimeout(this.completePayment, MIN_PROCESSING_MILLISECONDS - millisecondsElapsed);
            return;
        }

        this.completePayment();
    }

    private completePayment = () => {
        clearInterval(this.intervalId);
        this.setState({state: ProcessState.SUCCESS, progress: 100});
    }

    private handleViewLicense = () => {
        this.props.history.push('/console');
    }

    private handleGoBack = () => {
        clearInterval(this.intervalId);
        this.setState({
            progress: 0,
            error: '',
            state: ProcessState.PROCESSING,
        });
        this.props.back();
    }

    public render() {
        const {state, progress, error} = this.state;
        const {formatMessage} = this.props.intl;
        const progressBar: JSX.Element | null = (
            <div className='ProcessPayment-progress'>
                <div
                    className='ProcessPayment-progress-fill'
                    style={{width: `${progress}%`}}
                />
            </div>
        );

        switch (state) {
        case ProcessState.PROCESSING:
            return (
                <IconMessage
                    title={formatMessage({id: 'process_payment.processing'})}
                    subtitle={formatMessage({id: 'process_payment.please_wait'})}
                    icon={processSvg}
                    footer={progressBar}
                />
            );
        case ProcessState.SUCCESS:
            return (
                <IconMessage
                    title={formatMessage({id: 'process_payment.congratulations'})}
                    subtitle={formatMessage({id: 'process_payment.processed'})}
                    icon={successSvg}
                    buttonText={formatMessage({id: 'process_payment.view_your_license'})}
                    buttonHandler={this.handleViewLicense}
                />
            );
        case ProcessState.FAILED:
            return (
                <IconMessage
                    title={formatMessage({id: 'process_payment.sorry_the_payment_failed'})}
                    subtitle={formatMessage({id: 'process_payment.problem_processing'})}
                    icon={failedSvg}
                    error={error}
                    buttonText={formatMessage({id: 'process_payment.try_again'})}
                    buttonHandler={this.handleGoBack}
                    linkText={formatMessage({id: 'need_help.contact_support'})}
                    linkURL='https://support.mattermost.com/hc/en-us/requests/new?ticket_form_id=360000640492'
                />
            );
        default:
            return null;
        }
    }
}

const InjectedProcessPayment = (props: OwnProps) => {
    return (
        <ElementsConsumer>
            {({stripe, elements}) => (
                <ProcessPayment
                    elements={elements}
                    stripe={stripe}
                    {...props}
                />
            )}
        </ElementsConsumer>
    );
};

export default injectIntl(InjectedProcessPayment);
