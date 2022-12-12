// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useState} from 'react';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import {Stripe, StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {loadStripe} from '@stripe/stripe-js/pure'; // https://github.com/stripe/stripe-js#importing-loadstripe-without-side-effects
import {Elements} from '@stripe/react-stripe-js';

import {isEmpty} from 'lodash';
import classNames from 'classnames';

import {CloudCustomer, Product, Invoice} from '@mattermost/types/cloud';

import {localizeMessage, getNextBillingDate} from 'utils/utils';

import BillingHistoryModal from 'components/admin_console/billing/billing_history_modal';
import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {
    Constants,
    TELEMETRY_CATEGORIES,
    CloudLinks,
    CloudProducts,
    BillingSchemes,
    ModalIdentifiers,
    ItemStatus,
    RecurringIntervals,
} from 'utils/constants';
import {findProductByID} from 'utils/products';
import {areBillingDetailsValid, BillingDetails} from '../../types/cloud/sku';

import Input from 'components/widgets/inputs/input/input';
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
import YearlyMonthlyToggle from 'components/yearly_monthly_toggle';
import {ModalData} from 'types/actions';
import {Team} from '@mattermost/types/teams';
import {Theme} from 'mattermost-redux/selectors/entities/preferences';

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

type DelinquencyCardProps = {
    topColor: string;
    price: string;
    buttonDetails: ButtonDetails;
    onViewBreakdownClick: () => void;
};

type CardProps = {
    topColor: string;
    plan: string;
    price: string;
    rate?: string;
    buttonDetails: ButtonDetails;
    planBriefing: JSX.Element | null; // can be removed once Yearly Subscriptions are available
    planLabel?: JSX.Element;
    annualSubscription: boolean;
    usersCount: number;
    monthlyPrice: number;
    yearlyPrice: number;
    intl: IntlShape;
    isInitialPlanMonthly: boolean;
    updateIsMonthly: (isMonthly: boolean) => void;
    updateInputUserCount: (userCount: number) => void;
    setUserCountError: (hasError: boolean) => void;
    isCurrentPlanMonthlyProfessional: boolean;
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
    currentTeam: Team;
    intl: IntlShape;
    theme: Theme;
    isDelinquencyModal?: boolean;
    invoices?: Invoice[];
    isCloudDelinquencyGreaterThan90Days: boolean;
    annualSubscription: boolean;
    usersCount: number;
    isInitialPlanMonthly: boolean;

    // callerCTA is information about the cta that opened this modal. This helps us provide a telemetry path
    // showing information about how the modal was opened all the way to more CTAs within the modal itself
    callerCTA?: string;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        closeModal: () => void;
        getCloudProducts: () => void;
        completeStripeAddPaymentMethod: (
            stripe: Stripe,
            billingDetails: BillingDetails,
            isDevMode: boolean
        ) => Promise<boolean | null>;
        subscribeCloudSubscription: (
            productId: string,
            seats?: number,
        ) => Promise<boolean | null>;
        getClientConfig: () => void;
        getCloudSubscription: () => void;
        getInvoices: () => void;
    };
};

type State = {
    paymentInfoIsValid: boolean;
    billingDetails: BillingDetails | null;
    cardInputComplete: boolean;
    processing: boolean;
    editPaymentInfo: boolean;
    currentProduct: Product | null | undefined;
    selectedProduct: Product | null | undefined;
    isUpgradeFromTrial: boolean;
    buttonClickedInfo: string;
    selectedProductPrice: string | null;
    userCountError: boolean;
    isMonthly: boolean;
    usersCount: number;
    inputUserCount: number;
}

/**
 *
 * @param products  Record<string, Product> | undefined - the list of current cloud products
 * @param productId String - a valid product id used to find a particular product in the dictionary
 * @param productSku String - the sku value of the product of type either cloud-starter | cloud-professional | cloud-enterprise
 * @returns Product
 */
function findProductInDictionary(products: Record<string, Product> | undefined, productId?: string | null, productSku?: string, productRecurringInterval?: string): Product | null {
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
            } else if (productSku && products[key].sku === productSku && products[key].recurring_interval === productRecurringInterval) {
                currentProduct = products[key];
            }
        });
    }
    return currentProduct;
}

function getSelectedProduct(
    products: Record<string, Product> | undefined,
    productId?: string | null,
    isMonthly?: boolean | null,
    isDelinquencyModal?: boolean,
    isCloudDelinquencyGreaterThan90Days?: boolean) {
    const currentProduct = findProductInDictionary(products, productId);
    if (isDelinquencyModal && !isCloudDelinquencyGreaterThan90Days) {
        return currentProduct;
    }
    let nextSku = CloudProducts.PROFESSIONAL;

    // Don't switch the product to enterprise if the recurring interval of the selected product is yearly. This means that it can only be the yearly professional product.
    if (currentProduct?.sku === CloudProducts.PROFESSIONAL && isMonthly) {
        nextSku = CloudProducts.ENTERPRISE;
    }
    return findProductInDictionary(products, null, nextSku, RecurringIntervals.MONTH);
}

function Card(props: CardProps) {
    const seeHowBillingWorks = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        trackEvent(TELEMETRY_CATEGORIES.CLOUD_ADMIN, 'click_see_how_billing_works');
        window.open(CloudLinks.BILLING_DOCS, '_blank');
    };

    const [usersCount, setUsersCount] = useState(props.usersCount.toString());
    const [monthlyPrice, setMonthlyPrice] = useState(props.monthlyPrice * props.usersCount);
    const [yearlyPrice, setYearlyPrice] = useState(props.yearlyPrice * props.usersCount);
    const [priceDifference, setPriceDifference] = useState((props.monthlyPrice - props.yearlyPrice) * props.usersCount);
    const [isMonthly, setIsMonthly] = useState(props.isInitialPlanMonthly);
    const [displayPrice, setDisplayPrice] = useState(props.isInitialPlanMonthly ? props.monthlyPrice : props.yearlyPrice);
    const [errorMessage, setErrorMessage] = useState('');

    const {formatMessage} = props.intl;

    const checkValidNumber = (value: number) => {
        return value > 0 && value % 1 === 0;
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const numValue = Number(value);
        if (value === '' || (numValue && checkValidNumber(numValue))) {
            if (value === '') {
                setUsersCount('');
            } else {
                setUsersCount(numValue.toString());
            }
            setMonthlyPrice(numValue * props.monthlyPrice);
            setYearlyPrice(numValue * props.yearlyPrice);
            setPriceDifference((props.monthlyPrice - props.yearlyPrice) * numValue);
            props.updateInputUserCount(numValue);
        }
    };

    const updateDisplayPage = (isMonthly: boolean) => {
        setIsMonthly(isMonthly);
        props.updateIsMonthly(isMonthly);

        if (isMonthly) {
            // Reset userCount to the number of users in the workspace
            setUsersCount(props.usersCount.toString());
            props.updateInputUserCount(props.usersCount);

            // Update display prices
            setDisplayPrice(props.monthlyPrice);
            setMonthlyPrice(props.usersCount * props.monthlyPrice);
            setYearlyPrice(props.usersCount * props.yearlyPrice);
            setPriceDifference((props.monthlyPrice - props.yearlyPrice) * props.usersCount);
        } else {
            setDisplayPrice(props.yearlyPrice);
        }
    };

    const userCountTooltip = (
        <Tooltip
            id='userCount__tooltip'
            className='userCountTooltip'
        >
            <div className='tooltipTitle'>
                <FormattedMessage
                    defaultMessage={'Current User Count'}
                    id={'admin.billing.subscription.userCount.tooltipTitle'}
                />
            </div>
            <div className='tooltipText'>
                <FormattedMessage
                    defaultMessage={'You must purchase at least the current number of active users.'}
                    id={'admin.billing.subscription.userCount.tooltipText'}
                />
            </div>
        </Tooltip>
    );

    const monthlyPlan = (
        <>
            <div className='enable_annual_sub'>
                <button
                    className={'plan_action_btn ' + props.buttonDetails.customClass}
                    disabled={props.buttonDetails.disabled}
                    onClick={props.buttonDetails.action}
                >{props.buttonDetails.text}</button>
            </div>
            <div className='plan_billing_cycle'>
                <FormattedMessage
                    defaultMessage={'Payment begins: {beginDate}. '}
                    id={'admin.billing.subscription.paymentBegins'}
                    values={{
                        beginDate: getNextBillingDate(),
                    }}
                />
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
        </>
    );

    const tooFewUsersErrorMessage = formatMessage({
        id: 'admin.billing.subscription.userCount.minError',
        defaultMessage: 'Your workspace currently has {num} users',
    }, {num: props.usersCount});

    const tooManyUsersErrorMessage = formatMessage({
        id: 'admin.billing.subscription.userCount.maxError',
        defaultMessage: 'Your workspace only supports up to {num} users',
    }, {num: Constants.MAX_PURCHASE_SEATS});

    const isValid = () => {
        const numUsersCount = Number(usersCount) ?? 0;
        let isValidInput = true;

        if (numUsersCount < props.usersCount) {
            if (errorMessage !== tooFewUsersErrorMessage) {
                setErrorMessage(tooFewUsersErrorMessage);
            }
            isValidInput = false;
        }

        if (numUsersCount > Constants.MAX_PURCHASE_SEATS) {
            if (errorMessage !== tooManyUsersErrorMessage) {
                setErrorMessage(tooManyUsersErrorMessage);
            }
            isValidInput = false;
        }

        props.setUserCountError(!isValidInput);
        return isValidInput;
    };

    const yearlyPlan = (
        <>
            <div className='flex-grid'>
                <div
                    className={
                        classNames({
                            user_seats_container: true,
                            error: !isValid(),
                        })
                    }
                >
                    <Input
                        name='UserSeats'
                        type='text'
                        value={usersCount}
                        onChange={onChange}
                        placeholder={'Seats'}
                        wrapperClassName='user_seats'
                        inputClassName='user_seats'
                        maxLength={String(Constants.MAX_PURCHASE_SEATS).length + 1}
                        customMessage={isValid() ? null : {
                            type: ItemStatus.ERROR,
                            value: errorMessage,
                        }}
                        autoComplete='off'
                    />
                </div>
                <div className='icon'>
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='right'
                        overlay={userCountTooltip}
                    >
                        <i className='icon-information-outline'/>
                    </OverlayTrigger>
                </div>
            </div>
            <table>
                <tbody>
                    <tr>
                        <td className='monthly_price'>
                            <FormattedMessage
                                defaultMessage={`${usersCount} seats x 12 months`}
                                id={'admin.billing.subscription.yearlyPlanEquation'}
                                values={{
                                    numSeats: usersCount,
                                }}
                            />
                        </td>
                        <td className='monthly_price'>{`$${monthlyPrice * 12}`}</td>
                    </tr>

                    <tr>
                        <td className='yearly_savings'>
                            <FormattedMessage
                                defaultMessage={'Yearly Savings'}
                                id={'admin.billing.subscription.yearlySavings'}
                            />
                        </td>
                        <td className='yearly_savings'>{`-$${priceDifference * 12}`}</td>
                    </tr>
                    <tr>
                        <td>
                            <FormattedMessage
                                defaultMessage={'Total'}
                                id={'admin.billing.subscription.total'}
                            />
                        </td>
                        <td className='total_price'>{`$${yearlyPrice * 12}`}</td>
                    </tr>
                </tbody>
            </table>
            <div className='enable_annual_sub'>
                <button
                    className={'plan_action_btn ' + props.buttonDetails.customClass}
                    disabled={props.buttonDetails.disabled}
                    onClick={props.buttonDetails.action}
                >{props.buttonDetails.text}</button>
            </div>
            <div className='plan_billing_cycle'>
                <FormattedMessage
                    defaultMessage={'Your credit card will be charged today.'}
                    id={'admin.billing.subscription.creditCardCharge'}
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
        </>
    );

    const originalPlan = (
        <div className='PlanCard'>
            {props.planLabel && props.planLabel}
            <div
                className='top'
                style={{backgroundColor: props.topColor}}
            />
            <div className='bottom'>
                <div className='plan_price_rate_section'>
                    <h4>{props.plan}</h4>
                    <h1 className={props.plan === 'Enterprise' ? 'enterprise_price' : ''}>{`$${props.price}`}</h1>
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

    const getPlanCardMessage = () => {
        if (props.isCurrentPlanMonthlyProfessional && isMonthly) {
            return (
                <FormattedMessage
                    id='admin.billing.subscription.planDetails.currentPlan'
                    defaultMessage='Current Plan'
                />
            );
        }

        return (
            <FormattedMessage
                defaultMessage={'Save 20% with Yearly.'}
                id={'pricing_modal.saveWithYearly'}
            />
        );
    };

    const monthlyYearlyPlan = (
        <div className='PlanCard'>
            <div className='bottom bottom-monthly-yearly'>
                <div className='save_text'>
                    {getPlanCardMessage()}
                </div>
                <YearlyMonthlyToggle
                    updatePrice={updateDisplayPage}
                    isPurchases={true}
                    isInitialPlanMonthly={props.isInitialPlanMonthly}
                />
                {/* the style below will eventually be added to the plan_price_rate_section once the annualSubscription feature flag is removed*/}
                <div
                    className='plan_price_rate_section'
                    style={{height: '125px'}}
                >
                    <h4 className='plan_name'>{props.plan}</h4>
                    <h1 className={props.plan === 'Enterprise' ? 'enterprise_price' : ''}>{`$${displayPrice}`}</h1>
                    <p className='plan_text'>{isMonthly ? '/user' : '/user/month'}</p>
                </div>
                {isMonthly ? monthlyPlan : yearlyPlan}
            </div>
        </div>
    );

    return (
        props.annualSubscription ? monthlyYearlyPlan : originalPlan
    );
}

function DelinquencyCard(props: DelinquencyCardProps) {
    const seeHowBillingWorks = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    ) => {
        e.preventDefault();
        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_ADMIN,
            'click_see_how_billing_works',
        );
        window.open(CloudLinks.DELINQUENCY_DOCS, '_blank');
    };
    return (
        <div className='PlanCard'>
            <div
                className='top'
                style={{backgroundColor: props.topColor}}
            />
            <div className='bottom delinquency'>
                <div className='delinquency_summary_section'>
                    <div className={'summary-section'}>
                        <div className='summary-title'>
                            <FormattedMessage
                                id={'cloud_delinquency.cc_modal.card.totalOwed'}
                                defaultMessage={'Total Owed'}
                            />
                            {':'}
                        </div>
                        <div className='summary-total'>{props.price}</div>
                        <div
                            onClick={props.onViewBreakdownClick}
                            className='view-breakdown'
                        >
                            <FormattedMessage
                                defaultMessage={'View Breakdown'}
                                id={
                                    'cloud_delinquency.cc_modal.card.viewBreakdown'
                                }
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <button
                        className={
                            'plan_action_btn ' + props.buttonDetails.customClass
                        }
                        disabled={props.buttonDetails.disabled}
                        onClick={props.buttonDetails.action}
                    >
                        {props.buttonDetails.text}
                    </button>
                </div>
                <div className='plan_billing_cycle delinquency'>
                    <FormattedMessage
                        defaultMessage={
                            'Upon reactivation you will be charged the total owed.  Your bill is calculated at the end of the billing cycle based on the number of enabled users.'
                        }
                        id={'cloud_delinquency.cc_modal.disclaimer'}
                    />
                    <a onClick={seeHowBillingWorks}>
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
            editPaymentInfo: isEmpty(
                props.customer?.payment_method &&
                    props.customer?.billing_address,
            ),
            currentProduct: findProductInDictionary(
                props.products,
                props.productId,
            ),
            selectedProduct: getSelectedProduct(
                props.products,
                props.productId,
                props.isInitialPlanMonthly,
                props.isDelinquencyModal,
                props.isCloudDelinquencyGreaterThan90Days,
            ),
            isUpgradeFromTrial: props.isFreeTrial,
            buttonClickedInfo: '',
            selectedProductPrice: getSelectedProduct(props.products, props.productId, props.isInitialPlanMonthly)?.price_per_seat.toString() || null,
            userCountError: false,
            isMonthly: this.props.isInitialPlanMonthly,
            usersCount: this.props.usersCount,
            inputUserCount: this.props.usersCount,
        };
    }

    async componentDidMount() {
        if (isEmpty(this.state.currentProduct || this.state.selectedProduct)) {
            await this.props.actions.getCloudProducts();
            // eslint-disable-next-line react/no-did-mount-set-state
            this.setState({
                currentProduct: findProductInDictionary(this.props.products, this.props.productId),
                selectedProduct: getSelectedProduct(this.props.products, this.props.productId, this.props.isInitialPlanMonthly, this.props.isDelinquencyModal, this.props.isCloudDelinquencyGreaterThan90Days),
                selectedProductPrice: getSelectedProduct(this.props.products, this.props.productId, this.props.isInitialPlanMonthly)?.price_per_seat.toString() ?? null,
            });
        }

        if (this.props.isDelinquencyModal) {
            pageVisited(
                TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                'pageview_delinquency_cc_update',
            );
            this.props.actions.getInvoices();
        } else {
            pageVisited(TELEMETRY_CATEGORIES.CLOUD_PURCHASING, 'pageview_purchase');
        }

        this.props.actions.getClientConfig();
    }

    getDelinquencyTotalString = () => {
        let totalOwed = 0;
        this.props.invoices?.forEach((invoice) => {
            totalOwed += invoice.total;
        });
        return `$${totalOwed / 100}`;
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
        const callerInfo = this.props.callerCTA + '> purchase_modal > upgrade_button_click';
        const update = {
            selectedProduct: this.state.selectedProduct,
            paymentInfoIsValid: false,
            buttonClickedInfo: callerInfo,
            processing: true,
        } as unknown as Pick<State, keyof State>;

        if (!this.state.isMonthly && this.state.selectedProduct?.recurring_interval === RecurringIntervals.MONTH) {
            const yearlyProduct = findProductByID(this.props.products || {}, this.state.selectedProduct.cross_sells_to);
            if (yearlyProduct) {
                update.selectedProduct = yearlyProduct;
            }
        } else if ((this.state.isMonthly && this.state.selectedProduct?.recurring_interval === RecurringIntervals.YEAR)) {
            const monthlyProduct = findProductByID(this.props.products || {}, this.state.selectedProduct.cross_sells_to);
            if (monthlyProduct) {
                update.selectedProduct = monthlyProduct;
            }
        }
        this.setState(update);
    }

    setIsUpgradeFromTrialToFalse = () => {
        this.setState({isUpgradeFromTrial: false});
    }

    openPricingModal = (callerInfo: string) => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.PRICING_MODAL,
            dialogType: PricingModal,
            dialogProps: {
                callerCTA: callerInfo,
            },
        });
    };

    comparePlan = (
        <button
            className='ml-1'
            onClick={() => {
                trackEvent(TELEMETRY_CATEGORIES.CLOUD_PRICING, 'click_compare_plans');
                this.openPricingModal('purchase_modal_compare_plans_click');
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
                    defaultMessage={'You\'ll be billed from: {beginDate}'}
                    id={'admin.billing.subscription.billedFrom'}
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

    handleViewBreakdownClick = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.BILLING_HISTORY,
            dialogType: BillingHistoryModal,
            dialogProps: {
                invoices: this.props.invoices,
            },
        });
    }

    purchaseScreenCard = () => {
        if (this.props.isDelinquencyModal) {
            return (
                <>
                    {this.props.isCloudDelinquencyGreaterThan90Days ? null : (
                        <div className='plan_comparison'>
                            {this.comparePlan}
                        </div>
                    )}
                    <DelinquencyCard
                        topColor='#4A69AC'
                        price={this.getDelinquencyTotalString()}
                        buttonDetails={{
                            action: this.handleSubmitClick,
                            text: localizeMessage(
                                'cloud_delinquency.cc_modal.card.reactivate',
                                'Re-active',
                            ),
                            customClass: this.state.paymentInfoIsValid ? ButtonCustomiserClasses.special : ButtonCustomiserClasses.grayed,
                            disabled: !this.state.paymentInfoIsValid,
                        }}
                        onViewBreakdownClick={this.handleViewBreakdownClick}
                    />
                </>
            );
        }

        const showPlanLabel =
                    this.state.selectedProduct?.sku ===
                    CloudProducts.PROFESSIONAL && !this.props.annualSubscription;
        const {formatMessage} = this.props.intl;

        const getYearlyPrice = () => {
            if (!this.state.selectedProduct) {
                return 0;
            }

            const crossSellsToProduct = findProductByID(this.props.products || {}, this.state.selectedProduct.cross_sells_to);
            return crossSellsToProduct ? crossSellsToProduct.price_per_seat / 12 : this.state.selectedProduct.price_per_seat;
        };

        const checkIsMonthlyProfessionalProduct = (product: Product | null | undefined) => {
            if (!product) {
                return false;
            }
            return product.recurring_interval === RecurringIntervals.MONTH && product.sku === CloudProducts.PROFESSIONAL;
        };

        return (
            <>
                <div
                    className={showPlanLabel ? 'plan_comparison show_label' : 'plan_comparison'}
                >
                    {this.comparePlan}
                </div>
                <Card
                    topColor='#4A69AC'
                    plan={this.getPlanNameFromProductName(
                        this.state.selectedProduct ? this.state.selectedProduct.name : '',
                    )}
                    price={this.state.selectedProductPrice ?? ''}
                    rate='/user/month'
                    planBriefing={this.props.annualSubscription ? null : this.paymentFooterText()}
                    buttonDetails={{
                        action: this.handleSubmitClick,
                        text: 'Upgrade',
                        customClass:
                            !this.state.paymentInfoIsValid ||
                            this.state.selectedProduct?.billing_scheme === BillingSchemes.SALES_SERVE || this.state.userCountError ||
                            (checkIsMonthlyProfessionalProduct(this.state.currentProduct) && this.state.isMonthly) ?
                                ButtonCustomiserClasses.grayed : ButtonCustomiserClasses.special,
                        disabled:
                            !this.state.paymentInfoIsValid ||
                            this.state.selectedProduct?.billing_scheme === BillingSchemes.SALES_SERVE ||
                            this.state.userCountError ||
                            (checkIsMonthlyProfessionalProduct(this.state.currentProduct) && this.state.isMonthly),
                    }}
                    planLabel={
                        showPlanLabel ? (
                            <PlanLabel
                                text={formatMessage({
                                    id: 'pricing_modal.planLabel.mostPopular',
                                    defaultMessage: 'MOST POPULAR',
                                })}
                                bgColor='var(--title-color-indigo-500)'
                                color='var(--button-color)'
                                firstSvg={<StarMarkSvg/>}
                                secondSvg={<StarMarkSvg/>}
                            />
                        ) : undefined
                    }
                    annualSubscription={this.props.annualSubscription}
                    usersCount={this.state.usersCount}
                    monthlyPrice={this.state.selectedProduct?.price_per_seat ?? 0}
                    yearlyPrice={getYearlyPrice()}
                    intl={this.props.intl}
                    isInitialPlanMonthly={this.props.isInitialPlanMonthly}
                    setUserCountError={(hasError: boolean) => this.setState({userCountError: hasError})}
                    updateIsMonthly={(newIsMonthly: boolean) => this.setState({isMonthly: newIsMonthly})}
                    updateInputUserCount={(newUsersCount: number) => this.setState({inputUserCount: newUsersCount})}
                    isCurrentPlanMonthlyProfessional={checkIsMonthlyProfessionalProduct(this.state.currentProduct)}
                />
            </>
        );
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

        return (
            <div className={this.state.processing ? 'processing' : ''}>
                <div className='LHS'>
                    <h2 className='title'>{title}</h2>
                    <UpgradeSvg
                        width={267}
                        height={227}
                    />
                    <div className='footer-text'>{'Questions?'}</div>
                    {this.contactSalesLink('Contact Sales')}
                </div>
                <div className='central-panel'>
                    {this.state.editPaymentInfo || !validBillingDetails ? (
                        <PaymentForm
                            className='normal-text'
                            onInputChange={this.onPaymentInput}
                            onCardInputChange={this.handleCardInputChange}
                            initialBillingDetails={initialBillingDetails}
                            theme={this.props.theme}
                            // eslint-disable-next-line react/jsx-closing-bracket-location
                        />
                    ) : (
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
                    )}
                </div>
                <div className='RHS'>
                    {this.purchaseScreenCard()}
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
                        overrideTargetEvent={false}
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
                                        currentTeam={this.props.currentTeam}
                                        onSuccess={() => {
                                            // Success only happens if all invoices have been paid.
                                            if (this.props.isDelinquencyModal) {
                                                trackEvent(TELEMETRY_CATEGORIES.CLOUD_DELINQUENCY, 'paid_arrears');
                                            }
                                        }}
                                        selectedProduct={this.state.selectedProduct}
                                        currentProduct={this.state.currentProduct}
                                        isProratedPayment={(!this.props.isFreeTrial && this.state.currentProduct?.billing_scheme === BillingSchemes.FLAT_FEE) &&
                                        this.state.selectedProduct?.billing_scheme === BillingSchemes.PER_SEAT}
                                        setIsUpgradeFromTrialToFalse={this.setIsUpgradeFromTrialToFalse}
                                        isUpgradeFromTrial={this.state.isUpgradeFromTrial}
                                        telemetryProps={{
                                            callerInfo: this.state.buttonClickedInfo,
                                        }}
                                        usersCount={this.state.inputUserCount}
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
