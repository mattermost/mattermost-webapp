// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {loadStripe} from '@stripe/stripe-js/pure';
import {Elements} from '@stripe/react-stripe-js';

import {Client4} from 'mattermost-redux/client';

import upgradeImage from 'images/cloud/upgrade.svg';
import wavesBackground from 'images/cloud/waves.svg';
import professionalLogo from 'images/cloud-logos/professional.svg';

import RootPortal from 'components/root_portal';
import FullScreenModal from 'components/widgets/modals/full_screen_modal';

import {areBillingDetailsValid, BillingDetails} from 'components/cloud/types/sku';

import PaymentForm from './payment_form';

import './purchase.scss';
import './payment_form.scss';
import {comparePostTypes} from 'mattermost-redux/utils/post_list';

const STRIPE_CSS_SRC = 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,400i,600,600i&display=swap';
const STRIPE_PUBLIC_KEY = 'pk_test_ttEpW6dCHksKyfAFzh6MvgBj';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

type Props = {
    show: boolean;
    actions: {
        closeModal: () => void;
        getProductPrice: () => Promise<number>;
        completeStripeAddPaymentMethod: (stripe: Stripe, billingDetails: BillingDetails) => Promise<null>;
    };
}

type State = {
    paymentInfoIsValid: boolean;
    productPrice: number;
    billingDetails: BillingDetails | null;
}

export default class PurchaseModal extends React.PureComponent<Props, State> {
    modal = React.createRef();

    public constructor(props: Props) {
        super(props);

        this.state = {
            paymentInfoIsValid: false,
            productPrice: 0,
            billingDetails: null,
        };
    }

    componentDidMount() {
        this.fetchProductPrice();
    }

    async fetchProductPrice() {
        const productPrice = await this.props.actions.getProductPrice();
        this.setState({productPrice});
    }

    onPaymentInput = (billing: BillingDetails) => {
        this.setState({paymentInfoIsValid: areBillingDetailsValid(billing)});
        this.setState({billingDetails: billing});
    }

    handleSubmitClick = async () => {
        console.log('CALLING TO SUBMIT');
        await this.props.actions.completeStripeAddPaymentMethod(stripePromise, this.state.billingDetails);
        console.log('COMPLETED');
    }

    render() {
        // Calculate starting subscription date
        //const upgradeDisable = payment

        return (
            <Elements
                options={{fonts: [{cssSrc: STRIPE_CSS_SRC}]}}
                stripe={stripePromise}
            >
                <RootPortal>
                    <FullScreenModal
                        show={Boolean(this.props.show)}
                        onClose={this.props.actions.closeModal}
                        ref={this.modal}

                        ariaLabelledBy='purchase_modal_title'
                    >
                        <div className='PurchaseModal'>
                            <div className='LHS'>
                                <div className='title'>{'Upgrade your Mattermost Cloud Susbcription'}</div>
                                <img
                                    className='image'
                                    alt='upgrade'
                                    src={upgradeImage}
                                />
                                <div className='footer-text'>{'Questions?'}</div>
                                <a
                                    className='footer-text'
                                    href='https://support.mattermost.com/hc/en-us/requests/new?ticket_form_id=360000640492'

                                >{'Contact Support'}</a>
                            </div>
                            <div className='central-panel'>
                                <PaymentForm
                                    className='normal-text'
                                    onInputChange={this.onPaymentInput}
                                />
                            </div>
                            <div className='RHS'>
                                <div className='price-container'>
                                    <div className='bold-text'>{'Mattermost Cloud'}</div>
                                    <div className='price-text'>{`$${this.state.productPrice}`}<span className='monthly-text'>{' /user/month'}</span></div>
                                    <div className='footer-text'>{'Payment begins: Aug 8, 2020'}</div>
                                    <button
                                        disabled={!this.state.paymentInfoIsValid}
                                        onClick={this.handleSubmitClick}
                                    >{'Upgrade'}</button>
                                    <div className='fineprint-text'>
                                        <span>{'Your total is calculated at the end of the billing cycle based on the number of enabled users. You’ll only be charged if you exceed the free tier limits. '}</span>
                                        <a
                                            href='https://support.mattermost.com/hc/en-us/requests/new?ticket_form_id=360000640492'

                                        >{'See how billing works.'}</a>
                                    </div>
                                </div>
                                <div className='footer-text'>{'Need other billing options?'}</div>
                                <a
                                    className='footer-text'
                                    href='https://support.mattermost.com/hc/en-us/requests/new?ticket_form_id=360000640492'

                                >{'Contact Sales'}</a>

                                <div className='logo'>
                                    <img src={professionalLogo}/>
                                </div>
                            </div>
                            <div>
                                <img
                                    className='waves'
                                    src={wavesBackground}
                                />
                            </div>
                        </div>
                    </FullScreenModal>
                </RootPortal>
            </Elements>
        );
    }
}