// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React, {ReactNode} from 'react';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import {Stripe, StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {loadStripe} from '@stripe/stripe-js/pure'; // https://github.com/stripe/stripe-js#importing-loadstripe-without-side-effects
import {Elements} from '@stripe/react-stripe-js';

import {isEmpty} from 'lodash';

import {CloudCustomer, Product} from '@mattermost/types/cloud';

import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {
    Constants,
    TELEMETRY_CATEGORIES,
    CloudLinks,
    CloudProducts,
    BillingSchemes,
    ModalIdentifiers,
} from 'utils/constants';
import {areBillingDetailsValid, BillingDetails} from '../../types/cloud/sku';

import PaymentDetails from 'components/admin_console/billing/payment_details';
import {STRIPE_CSS_SRC, STRIPE_PUBLIC_KEY} from 'components/payment_form/stripe';
import RootPortal from 'components/root_portal';
import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import UpgradeSvg from 'components/common/svg_images_components/upgrade_svg';
import BackgroundSvg from 'components/common/svg_images_components/background_svg';
import StarMarkSvg from 'components/widgets/icons/star_mark_icon';
import PricingModal from 'components/pricing_modal';
import PlanLabel from 'components/common/plan_label';
import {ModalData} from 'types/actions';
import {Theme} from 'mattermost-redux/types/themes';

import {getNextBillingDate} from 'utils/utils';

import PaymentForm from '../payment_form/payment_form';

import ProcessPaymentSetup from './process_payment_setup';

import 'components/payment_form/payment_form.scss';

import './purchase.scss';

let stripePromise: Promise<Stripe | null>;

enum ButtonCustomiserClasses {
    grayed = 'grayed',
    active = 'active',
    special = 'special',
}

type ButtonDetails = {
    action: () => void;
    text: string;
    disabled?: boolean;
    customClass?: ButtonCustomiserClasses;
}

type CardProps = {
    topColor: string;
    plan: string;
    price: string;
    rate?: string;
    buttonDetails: ButtonDetails;
    planBriefing: JSX.Element;
    planLabel?: JSX.Element;
}

type Props = {
    customer: CloudCustomer | undefined;
    show: boolean;
    isDevMode: boolean;
    products: Record<string, Product> | undefined;
    contactSupportLink: string;
    contactSalesLink: string;
    isFreeTrial: boolean;
    productId: string | undefined;
    intl: IntlShape;
    theme: Theme;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
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
    isUpgradeFromTrial: boolean;
}

/**
 *
 * @param products  Record<string, Product> | undefined - the list of current cloud products
 * @param productId String - a valid product id used to find a particular product in the dictionary
 * @param productSku String - the sku value of the product of type either cloud-starter | cloud-professional | cloud-enterprise
 * @returns Product
 */
function findProductInDictionary(products: Record<string, Product> | undefined, productId?: string | null, productSku?: string): Product | null {
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

function getSelectedProduct(products: Record<string, Product> | undefined, productId?: string | null) {
    const currentProduct = findProductInDictionary(products, productId);

    let nextSku = CloudProducts.PROFESSIONAL;
    if (currentProduct?.sku === CloudProducts.PROFESSIONAL) {
        nextSku = CloudProducts.ENTERPRISE;
    }
    return findProductInDictionary(products, null, nextSku);
}

function Card(props: CardProps) {
    const seeHowBillingWorks = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        trackEvent(TELEMETRY_CATEGORIES.CLOUD_ADMIN, 'click_see_how_billing_works');
        window.open(CloudLinks.BILLING_DOCS, '_blank');
    };
    return (
        <div className='PlanCard'>
            {props.planLabel && props.planLabel}
            <div
                className='top'
                style={{backgroundColor: props.topColor}}
            />
            <div className='bottom'>
                <div className='plan_price_rate_section'>
                    <h4>{props.plan}</h4>
                    <h1 className={props.plan === 'Enterprise' ? 'enterprise_price' : ''}>{props.price}</h1>
                    <p>{props.rate}</p>
                </div>
                {props.planBriefing}
                <div>
                    <button
                        className={'plan_action_btn ' + props.buttonDetails.customClass}
                        disabled={props.buttonDetails.disabled}
                        onClick={props.buttonDetails.action}
                    >{props.buttonDetails.text}</button>
                </div>
                <div className='plan_billing_cycle'>
                    <FormattedMessage
                        defaultMessage={
                            'Your bill is calculated at the end of the billing cycle based on the number of enabled users. '
                        }
                        id={'admin.billing.subscription.freeTrialDisclaimer'}
                    />
                    <a
                        onClick={seeHowBillingWorks}
                    >
                        <FormattedMessage
                            defaultMessage={'See how billing works.'}
                            id={'admin.billing.subscription.howItWorks'}
                        />
                    </a>
                </div>
            </div>
        </div>
    );
}

class PurchaseModal extends React.PureComponent<Props, State> {
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
            isUpgradeFromTrial: props.isFreeTrial,
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

    setIsUpgradeFromTrialToFalse = () => {
        this.setState({isUpgradeFromTrial: false});
    }

    openPricingModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.PRICING_MODAL,
            dialogType: PricingModal,
        });
    };

    comparePlan = (
        <button
            className='ml-1'
            onClick={() => {
                trackEvent('cloud_pricing', 'click_compare_plans');
                this.openPricingModal();
            }}
        >
            <FormattedMessage
                id='cloud_subscribe.contact_support'
                defaultMessage='Compare plans'
            />
        </button>
    );

    contactSalesLink = (text: ReactNode) => {
        return (
            <a
                className='footer-text'
                onClick={() => {
                    trackEvent(
                        TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                        'click_contact_sales',
                    );
                }}
                href={this.props.contactSalesLink}
                target='_blank'
                rel='noopener noreferrer'
            >
                {text}
            </a>
        );
    }

    learnMoreLink = () => {
        return (
            <a
                className='footer-text'
                onClick={() => {
                    trackEvent(
                        TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                        'learn_more_prorated_payment',
                    );
                }}
                href={CloudLinks.PRORATED_PAYMENT}
                target='_blank'
                rel='noopener noreferrer'
            >
                <FormattedMessage
                    defaultMessage={'Learn more'}
                    id={'admin.billing.subscription.LearnMore'}
                />
            </a>
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

    paymentFooterText = () => {
        const normalPaymentText = (
            <div className='plan_payment_commencement'>
                <FormattedMessage
                    defaultMessage={'Payment begins: {beginDate}'}
                    id={'admin.billing.subscription.paymentBegins'}
                    values={{
                        beginDate: getNextBillingDate(),
                    }}
                />
            </div>
        );

        let payment = normalPaymentText;
        if (!this.props.isFreeTrial && this.state.currentProduct?.billing_scheme === BillingSchemes.FLAT_FEE &&
            this.state.selectedProduct?.billing_scheme === BillingSchemes.PER_SEAT) {
            const announcementTooltip = (
                <Tooltip
                    id='proratedPayment__tooltip'
                    className='proratedTooltip'
                >
                    <div className='tooltipTitle'>
                        <FormattedMessage
                            defaultMessage={'Prorated Payments'}
                            id={'admin.billing.subscription.proratedPayment.tooltipTitle'}
                        />
                    </div>
                    <div className='tooltipText'>
                        <FormattedMessage
                            defaultMessage={'If you upgrade to {selectedProductName} from {currentProductName} mid-month, you will be charged a prorated amount for both plans.'}
                            id={'admin.billing.subscription.proratedPayment.tooltipText'}
                            values={{
                                beginDate: getNextBillingDate(),
                                selectedProductName: this.state.selectedProduct?.name,
                                currentProductName: this.state.currentProduct?.name,
                            }}
                        />
                    </div>
                </Tooltip>
            );

            const announcementIcon = (
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    overlay={announcementTooltip}
                >
                    <div className='content__icon'>{'\uF5D6'}</div>
                </OverlayTrigger>

            );
            const prorratedPaymentText = (
                <div className='prorrated-payment-text'>
                    {announcementIcon}
                    <FormattedMessage
                        defaultMessage={'Prorated payment begins: {beginDate}. '}
                        id={'admin.billing.subscription.proratedPaymentBegins'}
                        values={{
                            beginDate: getNextBillingDate(),
                        }}
                    />
                    {this.learnMoreLink()}
                </div>
            );
            payment = prorratedPaymentText;
        }
        return payment;
    }

    getPlanNameFromProductName = (productName: string): string => {
        if (productName.length > 0) {
            const [name] = productName.split(' ').slice(-1);
            return name;
        }

        return productName;
    }

    purchaseScreen = () => {
        const title = (
            <FormattedMessage
                defaultMessage={'Provide your payment details'}
                id={'admin.billing.subscription.providePaymentDetails'}
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

        const showPlanLabel = this.state.selectedProduct?.sku === CloudProducts.PROFESSIONAL;
        const {formatMessage} = this.props.intl;

        return (
            <div className={this.state.processing ? 'processing' : ''}>
                <div className='LHS'>
                    <h2 className='title'>
                        {title}
                    </h2>
                    <UpgradeSvg
                        width={267}
                        height={227}
                    />
                    <div className='footer-text'>
                        {'Questions?'}
                    </div>
                    {this.contactSalesLink('Contact Sales')}
                </div>
                <div className='central-panel'>
                    {(this.state.editPaymentInfo || !validBillingDetails) ? (<PaymentForm
                        className='normal-text'
                        onInputChange={this.onPaymentInput}
                        onCardInputChange={this.handleCardInputChange}
                        initialBillingDetails={initialBillingDetails}
                        theme={this.props.theme}
                    // eslint-disable-next-line react/jsx-closing-bracket-location
                    />
                    ) : (<div className='PaymentDetails'>
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
                    </div>)
                    }
                </div>
                <div className='RHS'>
                    <div
                        className='plan_comparison'
                        style={{marginBottom: `${showPlanLabel ? '51' : '0'}px`}}//remove bottom pace when not taken up by PlanLabel
                    >
                        {this.comparePlan}
                    </div>
                    <Card
                        topColor='#4A69AC'
                        plan={this.getPlanNameFromProductName(this.state.selectedProduct ? this.state.selectedProduct.name : '')}
                        price={`$${this.state.selectedProduct?.price_per_seat?.toString()}`}
                        rate='/user/month'
                        planBriefing={this.paymentFooterText()}
                        buttonDetails={{
                            action: this.handleSubmitClick,
                            text: 'Upgrade',
                            customClass: (!this.state.paymentInfoIsValid || this.state.selectedProduct?.billing_scheme === BillingSchemes.SALES_SERVE) ? ButtonCustomiserClasses.grayed : ButtonCustomiserClasses.special,
                            disabled: !this.state.paymentInfoIsValid || this.state.selectedProduct?.billing_scheme === BillingSchemes.SALES_SERVE,
                        }}
                        planLabel={showPlanLabel ? (
                            <PlanLabel
                                text={formatMessage({id: 'pricing_modal.planLabel.mostPopular', defaultMessage: 'MOST POPULAR'})}
                                bgColor='var(--title-color-indigo-500)'
                                color='var(--button-color)'
                                firstSvg={<StarMarkSvg/>}
                                secondSvg={<StarMarkSvg/>}
                            />) : undefined}
                    />
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
                                            this.props.actions.subscribeCloudSubscription
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
                                        currentProduct={this.state.currentProduct}
                                        isProratedPayment={(!this.props.isFreeTrial && this.state.currentProduct?.billing_scheme === BillingSchemes.FLAT_FEE) &&
                                        this.state.selectedProduct?.billing_scheme === BillingSchemes.PER_SEAT}
                                        setIsUpgradeFromTrialToFalse={this.setIsUpgradeFromTrialToFalse}
                                        isUpgradeFromTrial={this.state.isUpgradeFromTrial}
                                    />
                                </div>
                            ) : null}
                            {this.purchaseScreen()}
                            <div className='background-svg'>
                                <BackgroundSvg/>
                            </div>
                        </div>
                    </FullScreenModal>
                </RootPortal>
            </Elements>
        );
    }
}

export default injectIntl(PurchaseModal);
