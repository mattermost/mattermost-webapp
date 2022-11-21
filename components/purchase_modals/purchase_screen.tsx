import React, {useState} from 'react';
import {Invoice, Product} from '@mattermost/types/cloud';
import {StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import BillingHistoryModal from 'components/admin_console/billing/billing_history_modal';
import PaymentDetails from 'components/admin_console/billing/payment_details';
import PlanLabel from 'components/common/plan_label';
import UpgradeSvg from 'components/common/svg_images_components/upgrade_svg';
import OverlayTrigger from 'components/overlay_trigger';
import PaymentForm from 'components/payment_form/payment_form';
import PricingModal from 'components/pricing_modal';
import Tooltip from 'components/tooltip';
import StarMarkSvg from 'components/widgets/icons/star_mark_icon';
import {getCloudCustomer, getCloudSubscription, isDelinquent} from 'mattermost-redux/selectors/entities/cloud';
import {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';
import {useSelector} from 'react-redux';
import {getCloudContactUsLink, InquiryType, isCloudDelinquencyGreaterThan90Days as isDelinquentMoreThan90Days} from 'selectors/cloud';
import {areBillingDetailsValid, BillingDetails} from 'types/cloud/sku';
import Constants, {BillingSchemes, CloudLinks, CloudProducts, ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import {getNextBillingDate, localizeMessage} from 'utils/utils';
import './purchase.scss';

enum ButtonCustomiserClasses {
    grayed = 'grayed',
    active = 'active',
    special = 'special',
}

type ButtonDetails = {
    text: string;
    disabled?: boolean;
    customClass?: ButtonCustomiserClasses;
    action: () => void;
}

type DelinquencyCardProps = {
    price: string;
    topColor: string;
    buttonDetails: ButtonDetails;
    onViewBreakdownClick: () => void;
};

type CardProps = {
    plan: string;
    price: string;
    rate?: string;
    topColor: string;
    planLabel?: JSX.Element;
    planBriefing: JSX.Element;
    buttonDetails: ButtonDetails;
}

type PurchaseScreenCardProps = {
    intl: IntlShape;
    invoices?: Invoice[];
    isFreeTrial: boolean;
    showPlanLabel: boolean;
    currentProduct: Product | null | undefined;
    selectedProduct: Product | null | undefined;
    paymentInfoIsValid: boolean;
    isDelinquencyModal: boolean | undefined;
    isCloudDelinquencyGreaterThan90Days: boolean;
    handleSubmitClick: () => void;
};

type PurchaseScreenProps = {
    theme: Theme
    intl: IntlShape;
    callerCTA?: string
    currentProduct?: Product | null;
    selectedProduct?: Product | null;
    setBillingDetauls: (billing: BillingDetails) => void
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

function PurchaseScreenCard(props: PurchaseScreenCardProps) {

    const openPricingModal = (callerInfo: string) => {
        openModal({
            modalId: ModalIdentifiers.PRICING_MODAL,
            dialogType: PricingModal,
            dialogProps: {
                callerCTA: callerInfo,
            },
        });
    };

    const handleViewBreakdownClick = () => {
        openModal({
            modalId: ModalIdentifiers.BILLING_HISTORY,
            dialogType: BillingHistoryModal,
            dialogProps: {
                invoices: props.invoices,
            },
        });
    }

    const getDelinquencyTotalString = () => {
        let totalOwed = 0;
        props.invoices?.forEach((invoice) => {
            totalOwed += invoice.total;
        });
        return `$${totalOwed / 100}`;
    }

    const getPlanNameFromProductName = (productName: string): string => {
        if (productName.length > 0) {
            const [name] = productName.split(' ').slice(-1);
            return name;
        }

        return productName;
    }

    const comparePlan = (
        <button
            className='ml-1'
            onClick={() => {
                trackEvent('cloud_pricing', 'click_compare_plans');
                openPricingModal('purchase_modal_compare_plans_click');
            }}
        >
            <FormattedMessage
                id='cloud_subscribe.contact_support'
                defaultMessage='Compare plans'
            />
        </button>
    );

    const learnMoreLink = () => {
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

    const paymentFooterText = () => {
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
        if (!props.isFreeTrial && props.currentProduct?.billing_scheme === BillingSchemes.FLAT_FEE &&
            props.selectedProduct?.billing_scheme === BillingSchemes.PER_SEAT) {
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
                                selectedProductName: props.selectedProduct?.name,
                                currentProductName: props.currentProduct?.name,
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
                    {learnMoreLink()}
                </div>
            );
            payment = prorratedPaymentText;
        }
        return payment;
    }

    if (props.isDelinquencyModal) {
        return (
            <>
                {props.isCloudDelinquencyGreaterThan90Days ? null : (
                    <div className='plan_comparison'>
                        {comparePlan}
                    </div>
                )}
                <DelinquencyCard
                    topColor='#4A69AC'
                    price={getDelinquencyTotalString()}
                    buttonDetails={{
                        action: props.handleSubmitClick,
                        text: localizeMessage(
                            'cloud_delinquency.cc_modal.card.reactivate',
                            'Re-active',
                        ),
                        customClass: props.paymentInfoIsValid ? ButtonCustomiserClasses.special : ButtonCustomiserClasses.grayed,
                        disabled: !props.paymentInfoIsValid,
                    }}
                    onViewBreakdownClick={handleViewBreakdownClick}
                />
            </>
        );
    }

    const {formatMessage} = props.intl;

    return (
        <>
            <div
                className={props.showPlanLabel ? 'plan_comparison show_label' : 'plan_comparison'}
            >
                {comparePlan}
            </div>
            <Card
                topColor='#4A69AC'
                plan={getPlanNameFromProductName(
                    props.selectedProduct ? props.selectedProduct.name : '',
                )}
                price={`$${props.selectedProduct?.price_per_seat?.toString()}`}
                rate='/user/month'
                planBriefing={paymentFooterText()}
                buttonDetails={{
                    action: props.handleSubmitClick,
                    text: 'Upgrade',
                    customClass:
                        !props.paymentInfoIsValid ||
                        props.selectedProduct?.billing_scheme ===
                            BillingSchemes.SALES_SERVE ? ButtonCustomiserClasses.grayed : ButtonCustomiserClasses.special,
                    disabled:
                        !props.paymentInfoIsValid ||
                        props.selectedProduct?.billing_scheme ===
                            BillingSchemes.SALES_SERVE,
                }}
                planLabel={
                    props.showPlanLabel ? (
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
            />
        </>
    );
}

function PurchaseScreen(props: PurchaseScreenProps) {

    const subscription = useSelector(getCloudSubscription);
    const isFreeTrial = subscription?.is_free_trial === 'true';
    const contactSalesLink = useSelector(getCloudContactUsLink)(InquiryType.Sales);
    const isDelinquencyModal = useSelector(isDelinquent);
    const isCloudDelinquencyGreaterThan90Days = useSelector(isDelinquentMoreThan90Days);

    const customer = useSelector(getCloudCustomer)
    const [processing, setProcessing] = useState(false);
    const [paymentInfoIsValid, setPaymentInfoIsValid] = useState(false);
    const [buttonClickedInfo, setButtonClickedInfo] = useState('');
    const [cardInputComplete, setCardInputComplete] = useState(false);
    const [billingDetails, setBillingDetauls] = useState<BillingDetails>();

    const handleSubmitClick = async () => {
        const callerInfo = props.callerCTA + '> purchase_modal > upgrade_button_click';
        setProcessing(true);
        setPaymentInfoIsValid(false);
        setButtonClickedInfo(callerInfo);
    }

    const onPaymentInput = (billing: BillingDetails) => {
        setPaymentInfoIsValid(areBillingDetailsValid(billing) && cardInputComplete);
        setBillingDetauls(billing);
        props.setBillingDetauls(billing);
    }
    
    const handleCardInputChange = (event: StripeCardElementChangeEvent) => {
        setPaymentInfoIsValid(areBillingDetailsValid(billingDetails) && event.complete)
        setCardInputComplete(event.complete);
    }
    

    const [editPaymentInfo, setEditPaymentInfo] = useState<boolean>(false);

    const title = (
        <FormattedMessage
            defaultMessage={'Provide your payment details'}
            id={'admin.billing.subscription.providePaymentDetails'}
        />
    );

    const showPlanLabel =
                props.selectedProduct?.sku ===
                CloudProducts.PROFESSIONAL;

    let initialBillingDetails;
    let validBillingDetails = false;

    if (customer?.billing_address && customer?.payment_method) {
        initialBillingDetails = {
            address: customer?.billing_address.line1,
            address2: customer?.billing_address.line2,
            city: customer?.billing_address.city,
            state: customer?.billing_address.state,
            country: customer?.billing_address.country,
            postalCode: customer?.billing_address.postal_code,
            name: customer?.payment_method.name,
        } as BillingDetails;

        validBillingDetails = areBillingDetailsValid(initialBillingDetails);
    }

    return (
        <div className={processing ? 'processing' : ''}>
            <div className='LHS'>
                <h2 className='title'>{title}</h2>
                <UpgradeSvg
                    width={267}
                    height={227}
                />
                <div className='footer-text'>{'Questions?'}</div>
                {contactSalesLink}
            </div>
            <div className='central-panel'>
                {editPaymentInfo || !validBillingDetails ? (
                    <PaymentForm
                        className='normal-text'
                        onInputChange={onPaymentInput}
                        onCardInputChange={handleCardInputChange}
                        initialBillingDetails={initialBillingDetails}
                        theme={props.theme}
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
                                onClick={() => setEditPaymentInfo(!editPaymentInfo)}
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
                <PurchaseScreenCard
                    paymentInfoIsValid={paymentInfoIsValid}
                    isDelinquencyModal={isDelinquencyModal}
                    isCloudDelinquencyGreaterThan90Days={isCloudDelinquencyGreaterThan90Days}
                    handleSubmitClick={handleSubmitClick}
                    showPlanLabel={showPlanLabel}
                    isFreeTrial={isFreeTrial}
                    intl={props.intl}
                    currentProduct={props.currentProduct}
                    selectedProduct={props.currentProduct}
                />
            </div>
        </div>
    );
}

export default injectIntl(PurchaseScreen)
