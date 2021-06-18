// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Stripe, StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {loadStripe} from '@stripe/stripe-js/pure'; // https://github.com/stripe/stripe-js#importing-loadstripe-without-side-effects
import {Elements} from '@stripe/react-stripe-js';

import {isEmpty} from 'lodash';

import {CloudCustomer, Product} from 'mattermost-redux/types/cloud';
import {Dictionary} from 'mattermost-redux/types/utilities';

import upgradeImage from 'images/cloud/upgrade.svg';
import wavesBackground from 'images/cloud/waves.svg';
import blueDots from 'images/cloud/blue.svg';
import LowerBlueDots from 'images/cloud/blue-lower.svg';
import cloudLogo from 'images/cloud/mattermost-cloud.svg';
import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {TELEMETRY_CATEGORIES, CloudLinks, CloudProducts} from 'utils/constants';

import PaymentDetails from 'components/admin_console/billing/payment_details';
import {STRIPE_CSS_SRC, STRIPE_PUBLIC_KEY} from 'components/payment_form/stripe';
import RootPortal from 'components/root_portal';
import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RadioButtonGroup from 'components/common/radio_group';

import {areBillingDetailsValid, BillingDetails} from 'types/cloud/sku';

import {getNextBillingDate} from 'utils/utils';

import PaymentForm from '../payment_form/payment_form';

import ProcessPaymentSetup from './process_payment_setup';

import './purchase.scss';
import 'components/payment_form/payment_form.scss';

let stripePromise: Promise<Stripe | null>;

type Props = {
    customer: CloudCustomer | undefined;
    show: boolean;
    isDevMode: boolean;
    products: Dictionary<Product> | undefined;
    contactSupportLink: string;
    contactSalesLink: string;
    isFreeTrial: boolean;
    productId: string | undefined;
    actions: {
        closeModal: () => void;
        getCloudProducts: () => void;
        completeStripeAddPaymentMethod: (stripe: Stripe, billingDetails: BillingDetails, isDevMode: boolean) => Promise<boolean | null>;
        subscribeCloudSubscription: (productId: string) => Promise<boolean | null>;
        getClientConfig: () => void;
        getCloudSubscription: () => void;
    };
}

type State = {
    paymentInfoIsValid: boolean;
    billingDetails: BillingDetails | null;
    cardInputComplete: boolean;
    processing: boolean;
    editPaymentInfo: boolean;
    currentProduct: Product | null | undefined;
    selectedProduct: Product | null | undefined;
}

/**
 *
 * @param products  Dictionary<Product> | undefined - the list of current cloud products
 * @param productId String - a valid product id used to find a particular product in the dictionary
 * @param productSku String - the sku value of the product of type either cloud-starter | cloud-professional | cloud-enterprise
 * @returns Product
 */
function findProductInDictionary(products: Dictionary<Product> | undefined, productId?: string | null, productSku?: string): Product | null {
    if (!products) {
        return null;
    }
    const keys = Object.keys(products);
    if (!keys.length) {
        return null;
    }
    if (!productId && !productSku) {
        return products[keys[0]];
    }
    let currentProduct = products[keys[0]];
    if (keys.length > 1) {
        // here find the product by the provided id or name, otherwise return the one with Professional in the name
        keys.forEach((key) => {
            if (productId && products[key].id === productId) {
                currentProduct = products[key];
            } else if (productSku && products[key].sku === productSku) {
                currentProduct = products[key];
            }
        });
    }

    return currentProduct;
}

function getSelectedProduct(products: Dictionary<Product> | undefined, productId?: string | null) {
    const currentProduct = findProductInDictionary(products, productId);
    let nextSku = CloudProducts.PROFESSIONAL;
    if (currentProduct?.sku === CloudProducts.PROFESSIONAL) {
        nextSku = CloudProducts.ENTERPRISE;
    }
    return findProductInDictionary(products, null, nextSku);
}
export default class PurchaseModal extends React.PureComponent<Props, State> {
    modal = React.createRef();

    public constructor(props: Props) {
        super(props);
        this.state = {
            paymentInfoIsValid: false,
            billingDetails: null,
            cardInputComplete: false,
            processing: false,
            editPaymentInfo: isEmpty(props.customer?.payment_method && props.customer?.billing_address),
            currentProduct: findProductInDictionary(props.products, props.productId),
            selectedProduct: getSelectedProduct(props.products, props.productId),
        };
    }

    async componentDidMount() {
        pageVisited(TELEMETRY_CATEGORIES.CLOUD_PURCHASING, 'pageview_purchase');
        if (isEmpty(this.state.currentProduct || this.state.selectedProduct)) {
            await this.props.actions.getCloudProducts();
            // eslint-disable-next-line react/no-did-mount-set-state
            this.setState({
                currentProduct: findProductInDictionary(this.props.products, this.props.productId),
                selectedProduct: getSelectedProduct(this.props.products, this.props.productId),
            });
        }

        // this.fetchProductPrice();
        this.props.actions.getClientConfig();
    }

    onPaymentInput = (billing: BillingDetails) => {
        this.setState({
            paymentInfoIsValid:
            areBillingDetailsValid(billing) && this.state.cardInputComplete,
        });
        this.setState({billingDetails: billing});
    }

    handleCardInputChange = (event: StripeCardElementChangeEvent) => {
        this.setState({
            paymentInfoIsValid:
            areBillingDetailsValid(this.state.billingDetails) && event.complete,
        });
        this.setState({cardInputComplete: event.complete});
    }

    handleSubmitClick = async () => {
        this.setState({processing: true, paymentInfoIsValid: false});
    }

    comparePlan = (
        <a
            className='ml-1'
            href={CloudLinks.COMPARE_PLANS}
            target='_blank'
            rel='noreferrer'
            onMouseDown={(e) => {
                e.preventDefault();

                // MouseDown to track regular + middle clicks
                trackEvent(
                    TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                    'click_compare_plans',
                );
            }}
        >
            <FormattedMessage
                id='cloud_subscribe.contact_support'
                defaultMessage='Compare plans'
            />
        </a>
    );

    onPlanSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedPlan = findProductInDictionary(this.props.products, e.target.value);

        this.setState({selectedProduct: selectedPlan});
    }

    listPlans = () => {
        const products = this.props.products!;
        const options = Object.keys(products).map((key: string) => {
            return {key: products[key].name, value: products[key].id};
        });
        const badgeTitle = (
            <FormattedMessage
                defaultMessage={'Current Plan'}
                id={'admin.billing.subscription.purchaseModal.currentPlan'}
            />
        );

        return (
            <div className='plans-list'>
                <RadioButtonGroup
                    id='list-plans-radio-buttons'
                    values={options!}
                    value={this.state.selectedProduct?.id as string}
                    badge={{matchVal: this.state.currentProduct?.id as string, text: badgeTitle}}
                    onChange={(e: any) => this.onPlanSelected(e)}
                />
            </div>
        );
    }

    editPaymentInfoHandler = () => {
        this.setState((prevState: State) => {
            return {
                ...prevState,
                editPaymentInfo: !prevState.editPaymentInfo,
            };
        });
    }

    purchaseScreen = () => {
        let title;
        let buttonTitle;
        if (this.props.isFreeTrial) {
            title = (
                <FormattedMessage
                    defaultMessage={'Provide Your Payment Details'}
                    id={'admin.billing.subscription.providePaymentDetails'}
                />
            );
            buttonTitle = (
                <FormattedMessage
                    defaultMessage={'Subscribe'}
                    id={'admin.billing.subscription.cloudTrial.subscribe'}
                />
            );
        } else {
            title = (
                <FormattedMessage
                    defaultMessage={'Upgrade your Mattermost Cloud Susbcription'}
                    id={'admin.billing.subscription.upgradeCloudSubscription'}
                />
            );
            buttonTitle = (
                <FormattedMessage
                    defaultMessage={'Upgrade'}
                    id={'admin.billing.subscription.upgrade'}
                />
            );
        }

        const bottomInformationMsg = (
            <FormattedMessage
                defaultMessage={
                    'Your bill is calculated at the end of the billing cycle based on the number of enabled users. '
                }
                id={'admin.billing.subscription.freeTrialDisclaimer'}
            />
        );

        let initialBillingDetails;
        let validBillingDetails = false;

        if (this.props.customer?.billing_address && this.props.customer?.payment_method) {
            initialBillingDetails = {
                address: this.props.customer?.billing_address.line1,
                address2: this.props.customer?.billing_address.line2,
                city: this.props.customer?.billing_address.city,
                state: this.props.customer?.billing_address.state,
                country: this.props.customer?.billing_address.country,
                postalCode: this.props.customer?.billing_address.postal_code,
                name: this.props.customer?.payment_method.name,
            } as BillingDetails;

            validBillingDetails = areBillingDetailsValid(initialBillingDetails);
        }

        return (
            <div className={this.state.processing ? 'processing' : ''}>
                <div className='LHS'>
                    <div className='title'>
                        {title}
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
                    {(this.state.editPaymentInfo || !validBillingDetails) ?
                        <PaymentForm
                            className='normal-text'
                            onInputChange={this.onPaymentInput}
                            onCardInputChange={this.handleCardInputChange}
                            initialBillingDetails={initialBillingDetails}
                        /> :
                        <div className='PaymentDetails'>
                            <div className='title'>
                                <FormattedMessage
                                    defaultMessage='Your saved payment details'
                                    id='admin.billing.purchaseModal.savedPaymentDetailsTitle'
                                />
                            </div>
                            <PaymentDetails>
                                <button
                                    onClick={this.editPaymentInfoHandler}
                                    className='editPaymentButton'
                                >
                                    <FormattedMessage
                                        defaultMessage='Edit'
                                        id='admin.billing.purchaseModal.editPaymentInfoButton'
                                    />
                                </button>
                            </PaymentDetails>
                        </div>
                    }
                </div>
                <div className='RHS'>
                    <div className='price-container'>
                        {(this.props.isFreeTrial && this.props.products && Object.keys(this.props.products).length > 1) &&
                            <div className='select-plan'>
                                <div className='title'>
                                    <FormattedMessage
                                        id='cloud_subscribe.select_plan'
                                        defaultMessage='Select a plan'
                                    />
                                    {this.comparePlan}
                                </div>
                                {this.listPlans()}
                            </div>
                        }
                        <div className='bold-text'>
                            {this.state.selectedProduct?.name || ''}
                        </div>
                        <div className='price-text'>
                            {`$${this.state.selectedProduct?.price_per_seat || 0}`}
                            <span className='monthly-text'>
                                <FormattedMessage
                                    defaultMessage={' /user/month'}
                                    id={'admin.billing.subscription.perUserPerMonth'}
                                />
                            </span>
                        </div>
                        <div className='footer-text'>
                            <FormattedMessage
                                defaultMessage={'Payment begins: {beginDate}'}
                                id={'admin.billing.subscription.payamentBegins'}
                                values={{
                                    beginDate: getNextBillingDate(),
                                }}
                            />
                        </div>
                        <button
                            disabled={!this.state.paymentInfoIsValid}
                            onClick={this.handleSubmitClick}
                        >
                            {buttonTitle}
                        </button>
                        <div className='fineprint-text'>
                            <span>
                                {bottomInformationMsg}
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
                    <div className='footer-text'>
                        <FormattedMessage
                            defaultMessage={'Need other billing options?'}
                            id={'admin.billing.subscription.otherBillingOption'}
                        />
                    </div>
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
                                        subscribeCloudSubscription={
                                            this.props.isFreeTrial ? this.props.actions.subscribeCloudSubscription : null
                                        }
                                        isDevMode={this.props.isDevMode}
                                        onClose={() => {
                                            this.props.actions.getCloudSubscription();
                                            this.props.actions.closeModal();
                                        }}
                                        onBack={() => {
                                            this.setState({processing: false});
                                        }}
                                        contactSupportLink={this.props.contactSalesLink}
                                        selectedProduct={this.state.selectedProduct}
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
                                    src={blueDots}
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
