// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Stripe} from '@stripe/stripe-js';
import {loadStripe} from '@stripe/stripe-js/pure'; // https://github.com/stripe/stripe-js#importing-loadstripe-without-side-effects
import {Elements} from '@stripe/react-stripe-js';

import {Product} from 'mattermost-redux/types/cloud';
import {Dictionary} from 'mattermost-redux/types/utilities';

import upgradeImage from 'images/cloud/upgrade.svg';
import wavesBackground from 'images/cloud/waves.svg';
import blueDotes from 'images/cloud/blue.svg';
import LowerBlueDots from 'images/cloud/blue-lower.svg';
import cloudLogo from 'images/cloud/mattermost-cloud.svg';
import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {TELEMETRY_CATEGORIES, CloudLinks} from 'utils/constants';

import {STRIPE_CSS_SRC, STRIPE_PUBLIC_KEY} from 'components/payment_form/stripe';
import RootPortal from 'components/root_portal';
import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import {areBillingDetailsValid, BillingDetails} from 'types/cloud/sku';
import {getNextBillingDate} from 'utils/utils';

import PaymentForm from '../payment_form/payment_form';

import ProcessPaymentSetup from './process_payment_setup';

import './purchase.scss';
import 'components/payment_form/payment_form.scss';

let stripePromise: Promise<Stripe | null>;

type Props = {
    show: boolean;
    isDevMode: boolean;
    products?: Dictionary<Product>;
    contactSupportLink: string;
    contactSalesLink: string;
    actions: {
        closeModal: () => void;
        getCloudProducts: () => void;
        completeStripeAddPaymentMethod: (stripe: Stripe, billingDetails: BillingDetails, isDevMode: boolean) => Promise<boolean | null>;
        getClientConfig: () => void;
        getCloudSubscription: () => void;
    };
}

type State = {
    paymentInfoIsValid: boolean;
    productPrice: number;
    billingDetails: BillingDetails | null;
    processing: boolean;
}
export default class PurchaseModal extends React.PureComponent<Props, State> {
    modal = React.createRef();

    public constructor(props: Props) {
        super(props);

        this.state = {
            paymentInfoIsValid: false,
            productPrice: 0,
            billingDetails: null,
            processing: false,
        };
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        let productPrice = 0;
        if (props.products) {
            const keys = Object.keys(props.products);
            if (keys.length > 0) {
                // Assuming the first and only one for now.
                productPrice = props.products[keys[0]].price_per_seat;
            }
        }

        return {...state, productPrice};
    }

    componentDidMount() {
        pageVisited(TELEMETRY_CATEGORIES.CLOUD_PURCHASING, 'pageview_purchase');
        this.props.actions.getCloudProducts();

        // this.fetchProductPrice();
        this.props.actions.getClientConfig();
    }

    onPaymentInput = (billing: BillingDetails) => {
        this.setState({paymentInfoIsValid: areBillingDetailsValid(billing)});
        this.setState({billingDetails: billing});
    }

    handleSubmitClick = async () => {
        this.setState({processing: true, paymentInfoIsValid: false});
    }

    purchaseScreen = () => {
        return (
            <div className={this.state.processing ? 'processing' : ''}>
                <div className='LHS'>
                    <div className='title'>
                        <FormattedMessage
                            defaultMessage={'Upgrade your Mattermost Cloud Susbcription'}
                            id={'admin.billing.subscription.upgradeCloudSubscription'}
                        />
                    </div>
                    <img
                        className='image'
                        alt='upgrade'
                        src={upgradeImage}
                    />
                    <div className='footer-text'>
                        <FormattedMessage
                            defaultMessage={'Questions?'}
                            id={'admin.billing.subscription.questions'}
                        />
                    </div>
                    <a
                        className='footer-text'
                        onClick={() =>
                            trackEvent(
                                TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                                'click_contact_support',
                            )
                        }
                        href={this.props.contactSupportLink}
                        rel='noopener noreferrer'
                        target='_new'
                    >
                        <FormattedMessage
                            defaultMessage={'Contact Support'}
                            id={
                                'admin.billing.subscription.privateCloudCard.contactSupport'
                            }
                        />
                    </a>
                </div>
                <div className='central-panel'>
                    <PaymentForm
                        className='normal-text'
                        onInputChange={this.onPaymentInput}
                    />
                </div>
                <div className='RHS'>
                    <div className='price-container'>
                        <div className='bold-text'>
                            <FormattedMessage
                                defaultMessage={'Mattermost Cloud'}
                                id={'admin.billing.subscription.mattermostCloud'}
                            />
                        </div>
                        <div className='price-text'>
                            {`$${this.state.productPrice || 0}`}
                            <span className='monthly-text'>
                                <FormattedMessage
                                    defaultMessage={' /user/month'}
                                    id={'admin.billing.subscription.perUserPerMonth'}
                                />
                            </span>
                        </div>
                        <div className='footer-text'>{`Payment begins: ${getNextBillingDate()}`}</div>
                        <button
                            disabled={!this.state.paymentInfoIsValid}
                            onClick={this.handleSubmitClick}
                        >
                            <FormattedMessage
                                defaultMessage={'Upgrade'}
                                id={'admin.billing.subscription.upgrade'}
                            />
                        </button>
                        <div className='fineprint-text'>
                            <span>
                                <FormattedMessage
                                    defaultMessage={
                                        'Your total is calculated at the end of the billing cycle based on the number of enabled users. You’ll only be charged if you exceed the free tier limits. '
                                    }
                                    id={'admin.billing.subscription.disclaimer'}
                                />
                            </span>
                            {'\u00A0'}
                            <a
                                href={CloudLinks.BILLING_DOCS}
                                target='_new'
                                rel='noopener noreferrer'
                            >
                                <FormattedMessage
                                    defaultMessage={'See how billing works.'}
                                    id={'admin.billing.subscription.howItWorks'}
                                />
                            </a>
                        </div>
                    </div>
                    <div className='footer-text'>{'Need other billing options?'}</div>
                    <a
                        className='footer-text'
                        onClick={() => {
                            trackEvent(
                                TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                                'click_contact_sales',
                            );
                        }}
                        href={this.props.contactSalesLink}
                        target='_new'
                        rel='noopener noreferrer'
                    >
                        <FormattedMessage
                            defaultMessage={'Contact Sales'}
                            id={
                                'admin.billing.subscription.privateCloudCard.contactSales'
                            }
                        />
                    </a>

                    <div className='logo'>
                        <img src={cloudLogo}/>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        if (!stripePromise) {
            stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
        }
        return (
            <Elements
                options={{fonts: [{cssSrc: STRIPE_CSS_SRC}]}}
                stripe={stripePromise}
            >
                <RootPortal>
                    <FullScreenModal
                        show={Boolean(this.props.show)}
                        onClose={() => {
                            trackEvent(
                                TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                                'click_close_purchasing_screen',
                            );
                            this.props.actions.getCloudSubscription();
                            this.props.actions.closeModal();
                        }}
                        ref={this.modal}
                        ariaLabelledBy='purchase_modal_title'
                    >
                        <div className='PurchaseModal'>
                            {this.state.processing ? (
                                <div>
                                    <ProcessPaymentSetup
                                        stripe={stripePromise}
                                        billingDetails={this.state.billingDetails}
                                        addPaymentMethod={
                                            this.props.actions.completeStripeAddPaymentMethod
                                        }
                                        isDevMode={this.props.isDevMode}
                                        onClose={() => {
                                            this.props.actions.getCloudSubscription();
                                            this.props.actions.closeModal();
                                        }}
                                        onBack={() => {
                                            this.setState({processing: false});
                                        }}
                                    />
                                </div>
                            ) : null}
                            {this.purchaseScreen()}
                            <div>
                                <img
                                    className='waves'
                                    src={wavesBackground}
                                />
                                <img
                                    className='blue-dots'
                                    src={blueDotes}
                                />
                                <img
                                    className='lower-blue-dots'
                                    src={LowerBlueDots}
                                />
                            </div>
                        </div>
                    </FullScreenModal>
                </RootPortal>
            </Elements>
        );
    }
}
