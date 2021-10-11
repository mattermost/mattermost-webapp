// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Stripe} from '@stripe/stripe-js';

import {FormattedMessage} from 'react-intl';

import {PreferenceType} from 'mattermost-redux/types/preferences';
import {UserProfile} from 'mattermost-redux/types/users';

import {BillingDetails} from 'types/cloud/sku';
import {pageVisited} from 'actions/telemetry_actions';
import {Unique, Preferences, TELEMETRY_CATEGORIES} from 'utils/constants';

import {t} from 'utils/i18n';
import {getNextBillingDate} from 'utils/utils';

import CreditCardSvg from 'components/common/svg_images_components/credit_card.svg';
import PaymentSuccessStandardSvg from 'components/common/svg_images_components/payment_sucess_standard.svg';
import PaymentFailedSvg from 'components/common/svg_images_components/payment_failed.svg';

import {Product} from 'mattermost-redux/types/cloud';

import IconMessage from './icon_message';

import './process_payment.css';

type Props = {
    billingDetails: BillingDetails | null;
    stripe: Promise<Stripe | null>;
    isDevMode: boolean;
    contactSupportLink: string;
    addPaymentMethod: (stripe: Stripe, billingDetails: BillingDetails, isDevMode: boolean) => Promise<boolean | null>;
    subscribeCloudSubscription: ((productId: string) => Promise<boolean | null>) | null;
    onBack: () => void;
    onClose: () => void;
    selectedProduct?: Product | null | undefined;
    currentProduct?: Product | null | undefined;
    isProratedPayment?: boolean;
    currentUser: UserProfile;
    savePreferences: (userId: string, preferences: PreferenceType[]) => void;
    preferences: PreferenceType[];
}

type State = {
    progress: number;
    error: boolean;
    state: ProcessState;
}

enum ProcessState {
    PROCESSING = 0,
    SUCCESS,
    FAILED
}

const MIN_PROCESSING_MILLISECONDS = 5000;
const MAX_FAKE_PROGRESS = 95;

export default class ProcessPaymentSetup extends React.PureComponent<Props, State> {
    intervalId: NodeJS.Timeout;

    public constructor(props: Props) {
        super(props);

        this.intervalId = {} as NodeJS.Timeout;

        this.state = {
            progress: 0,
            error: false,
            state: ProcessState.PROCESSING,
        };
        this.saveIsPurchaseInPrefs = this.saveIsPurchaseInPrefs.bind(this);
    }

    public componentDidMount() {
        this.savePaymentMethod();

        this.intervalId = setInterval(this.updateProgress, MIN_PROCESSING_MILLISECONDS / MAX_FAKE_PROGRESS);
    }

    public componentWillUnmount() {
        clearInterval(this.intervalId);
        window.removeEventListener('onbeforeunload', this.saveIsPurchaseInPrefs, false);
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

    private savePaymentMethod = async () => {
        const start = new Date();
        const {
            stripe,
            addPaymentMethod,
            billingDetails,
            isDevMode,
            subscribeCloudSubscription,
        } = this.props;
        const success = await addPaymentMethod((await stripe)!, billingDetails!, isDevMode);

        if (!success) {
            this.setState({
                error: true,
                state: ProcessState.FAILED});
            return;
        }

        if (subscribeCloudSubscription) {
            const productUpdated = await subscribeCloudSubscription(this.props.selectedProduct?.id as string);

            if (!productUpdated) {
                this.setState({
                    error: true,
                    state: ProcessState.FAILED});
                return;
            }
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

    private saveIsPurchaseInPrefs = () => {
        this.props.savePreferences(this.props.currentUser.id, [{
            category: Preferences.UNIQUE,
            user_id: this.props.currentUser.id,
            name: Unique.HAS_CLOUD_PURCHASE,
            value: 'true',
        }]);
    };

    private handleGoBack = () => {
        clearInterval(this.intervalId);
        this.setState({
            progress: 0,
            error: false,
            state: ProcessState.PROCESSING,
        });
        this.props.onBack();
    }

    private sucessPage = () => {
        const {error} = this.state;
        if (this.props.isProratedPayment) {
            const formattedButonText = (
                <FormattedMessage
                    defaultMessage={'Lets go!'}
                    id={'admin.billing.subscription.letsGo'}
                />
            );
            const formattedTitle = (
                <FormattedMessage
                    defaultMessage={'You are now subscribed to {selectedProductName}'}
                    id={'admin.billing.subscription.proratedPayment.title'}
                    values={{selectedProductName: this.props.selectedProduct?.name}}
                />
            );
            const formattedSubtitle = (
                <FormattedMessage
                    defaultMessage={'Thank you for upgrading to {selectedProductName}. You will be charged a prorated amount for your {currentProductName} plan and {selectedProductName} plan based on the number of days and number of users.'}
                    id={'admin.billing.subscription.proratedPayment.substitle'}
                    values={{selectedProductName: this.props.selectedProduct?.name, currentProductName: this.props.currentProduct?.name}}
                />
            );
            return (
                <>
                    <IconMessage
                        formattedTitle={formattedTitle}
                        formattedSubtitle={formattedSubtitle}
                        date={getNextBillingDate()}
                        error={error}
                        icon={
                            <PaymentSuccessStandardSvg
                                width={444}
                                height={313}
                            />
                        }
                        formattedButonText={formattedButonText}
                        buttonHandler={this.props.onClose}
                        className={'success'}
                    />
                </>
            );
        }
        let title = t('admin.billing.subscription.upgradedSuccess');
        const isFirstPurchase = Boolean(!(this.props.preferences.some((pref: PreferenceType) =>
            pref.name === Unique.HAS_CLOUD_PURCHASE && pref.value === 'true')),
        );
        let handleClose = () => {
            this.props.onClose();
        };
        if (isFirstPurchase) {
            title = t('admin.billing.subscription.firstPurchaseSuccess');
            window.addEventListener('beforeunload', () => {
                this.saveIsPurchaseInPrefs();
            });
            handleClose = () => {
                this.saveIsPurchaseInPrefs();
                this.props.onClose();
            };
        }
        return (
            <IconMessage
                title={title}
                subtitle={t('admin.billing.subscription.nextBillingDate')}
                date={getNextBillingDate()}
                error={error}
                icon={
                    <PaymentSuccessStandardSvg
                        width={444}
                        height={313}
                    />
                }
                buttonText={t('admin.billing.subscription.letsGo')}
                buttonHandler={handleClose}
                className={'success'}
            />
        );
    }

    public render() {
        const {state, progress, error} = this.state;

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
                    title={t('admin.billing.subscription.verifyPaymentInformation')}
                    subtitle={''}
                    icon={
                        <CreditCardSvg
                            width={444}
                            height={313}
                        />
                    }
                    footer={progressBar}
                />
            );
        case ProcessState.SUCCESS:
            pageVisited(
                TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                'pageview_payment_success',
            );
            return this.sucessPage();
        case ProcessState.FAILED:
            pageVisited(
                TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                'pageview_payment_failed',
            );
            return (
                <IconMessage
                    title={t('admin.billing.subscription.paymentVerificationFailed')}
                    subtitle={t('admin.billing.subscription.paymentFailed')}
                    icon={
                        <PaymentFailedSvg
                            width={444}
                            height={313}
                        />
                    }
                    error={error}
                    buttonText={t('admin.billing.subscription.goBackTryAgain')}
                    buttonHandler={this.handleGoBack}
                    linkText={t('admin.billing.subscription.privateCloudCard.contactSupport')}
                    linkURL={this.props.contactSupportLink}
                />
            );
        default:
            return null;
        }
    }
}
