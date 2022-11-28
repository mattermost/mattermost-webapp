// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useReducer, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';

import classNames from 'classnames';
import {StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';

import {
    SelfHostedSignupProgress,
    SelfHostedSignupCustomerResponse,
} from '@mattermost/types/hosted_customer';
import {UserProfile} from '@mattermost/types/users';
import {ValueOf} from '@mattermost/types/utilities';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getAdminAnalytics} from 'mattermost-redux/selectors/entities/admin';
import {getSelfHostedProducts, getSelfHostedSignupProgress} from 'mattermost-redux/selectors/entities/hosted_customer';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {Client4} from 'mattermost-redux/client';
import {HostedCustomerTypes} from 'mattermost-redux/action_types';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {closeModal} from 'actions/views/modals';
import {confirmSelfHostedSignup} from 'actions/hosted_customer';

import {GlobalState} from 'types/store';

import {isModalOpen} from 'selectors/views/modals';
import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

import {t} from 'utils/i18n';
import {getToday} from 'utils/utils';
import {COUNTRIES} from 'utils/countries';

import {
    ModalIdentifiers,
    SelfHostedProducts,
    StatTypes,
    TELEMETRY_CATEGORIES,
    HostedCustomerLinks,
} from 'utils/constants';

import {STRIPE_CSS_SRC} from 'components/payment_form/stripe';
import CardInput, {CardInputType} from 'components/payment_form/card_input';
import StateSelector from 'components/payment_form/state_selector';
import DropdownInput from 'components/dropdown_input';
import PlanLabel from 'components/common/plan_label';
import BackgroundSvg from 'components/common/svg_images_components/background_svg';
import CreditCardSvg from 'components/common/svg_images_components/credit_card_svg';
import UpgradeSvg from 'components/common/svg_images_components/upgrade_svg';
import StarMarkSvg from 'components/widgets/icons/star_mark_icon';
import PaymentFailedSvg from 'components/common/svg_images_components/payment_failed_svg';

import Input from 'components/widgets/inputs/input/input';

import IconMessage from 'components/purchase_modal/icon_message';
import {Card, ButtonCustomiserClasses} from 'components/purchase_modal/purchase_modal';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';
import useLoadStripe from 'components/common/hooks/useLoadStripe';
import useFetchStandardAnalytics from 'components/common/hooks/useFetchStandardAnalytics';
import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';

import SuccessPage from './success_page';
import SeatsCalculator, {Seats, errorInvalidNumber} from './seats_calculator';

import './self_hosted_purchase_modal.scss';

interface State {
    address: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    cardName: string;
    organization: string;
    waitingOnNetwork: boolean;
    agreedTerms: boolean;
    cardFilled: boolean;
    seats: Seats;
    submitting: boolean;
    succeeded: boolean;
    progressBar: number;
    error: string;
}

interface UpdateAddress {
    type: 'update_address';
    data: string;
}

interface UpdateAddress2 {
    type: 'update_address2';
    data: string;
}

interface UpdateCity {
    type: 'update_city';
    data: string;
}

interface UpdateState {
    type: 'update_state';
    data: string;
}

interface UpdateCountry {
    type: 'update_country';
    data: string;
}

interface UpdatePostalCode {
    type: 'update_postal_code';
    data: string;
}

interface UpdateOrganization {
    type: 'update_organization';
    data: string;
}

interface UpdateCardName {
    type: 'update_card_name';
    data: string;
}

interface UpdateWaitingOnNetwork {
    type: 'update_waiting_on_network';
    data: boolean;
}

interface UpdateAgreedTerms {
    type: 'update_agreed_terms';
    data: boolean;
}

interface UpdateCardFilled {
    type: 'card_filled';
    data: boolean;
}

interface UpdateSeats {
    type: 'update_seats';
    data: Seats;
}

interface UpdateSubmitting {
    type: 'update_submitting';
    data: boolean;
}

interface UpdateSucceeded {
    type: 'succeeded';
}

interface StartOver {
    type: 'start_over';
    data?: Partial<State>;
}

interface UpdateProgressBar {
    type: 'update_progress_bar';
    data: number;
}
interface UpdateProgressBarFake {
    type: 'update_progress_bar_fake';
}
interface SetError {
    type: 'set_error';
    data: string;
}

type Action =
    | UpdateAddress
    | UpdateAddress2
    | UpdateCity
    | UpdateState
    | UpdateCountry
    | UpdatePostalCode
    | UpdateOrganization
    | UpdateWaitingOnNetwork
    | UpdateAgreedTerms
    | UpdateCardFilled
    | UpdateCardName
    | UpdateProgressBar
    | UpdateProgressBarFake
    | UpdateSeats
    | UpdateSubmitting
    | UpdateSucceeded
    | StartOver
    | SetError

const initialState: State = {
    address: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    cardName: '',
    organization: '',
    waitingOnNetwork: false,
    agreedTerms: true,
    cardFilled: false,
    seats: {
        quantity: '0',
        error: errorInvalidNumber,
    },
    submitting: false,
    succeeded: false,
    progressBar: 0,
    error: '',
};

const maxFakeProgress = 90;
const maxFakeProgressIncrement = 5;
const fakeProgressInterval = 1500;

function getPlanNameFromProductName(productName: string): string {
    if (productName.length > 0) {
        const [name] = productName.split(' ').slice(-1);
        return name;
    }

    return productName;
}

function seeHowBillingWorks(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();
    trackEvent(TELEMETRY_CATEGORIES.SELF_HOSTED_PURCHASING, 'click_see_how_billing_works');
    window.open(HostedCustomerLinks.BILLING_DOCS, '_blank');
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
    case 'update_address':
        return {...state, address: action.data};
    case 'update_address2':
        return {...state, address2: action.data};
    case 'update_city':
        return {...state, city: action.data};
    case 'update_country':
        return {...state, country: action.data};
    case 'update_postal_code':
        return {...state, postalCode: action.data};
    case 'update_state':
        return {...state, state: action.data};
    case 'update_waiting_on_network':
        return {...state, waitingOnNetwork: action.data};
    case 'update_agreed_terms':
        return {...state, agreedTerms: action.data};
    case 'card_filled':
        return {...state, cardFilled: action.data};
    case 'update_card_name':
        return {...state, cardName: action.data};
    case 'update_organization':
        return {...state, organization: action.data};
    case 'update_progress_bar':
        return {...state, progressBar: action.data};
    case 'update_progress_bar_fake': {
        const firstLongStep = SelfHostedSignupProgress.CONFIRMED_INTENT;
        if (state.progressBar >= convertProgressToBar(firstLongStep) && state.progressBar <= maxFakeProgress - maxFakeProgressIncrement) {
            return {...state, progressBar: state.progressBar + maxFakeProgressIncrement};
        }
        return state;
    }
    case 'update_submitting':
        return {...state, submitting: action.data};
    case 'succeeded':
        return {...state, submitting: false, succeeded: true};
    case 'update_seats':
        return {...state, seats: action.data};
    case 'start_over': {
        let newState = {...initialState, seats: state.seats};
        if (action.data) {
            newState = {
                ...newState,
                ...action.data,
            };
        }
        return newState;
    }
    case 'set_error': {
        return {
            ...state,
            submitting: false,
            error: action.data,
        };
    }
    default:
        // eslint-disable-next-line
        console.error(`Exhaustiveness failure for self hosted purchase modal. action: ${JSON.stringify(action)}`)
        return state;
    }
}

function canSubmit(state: State, progress: ValueOf<typeof SelfHostedSignupProgress>) {
    if (state.submitting) {
        return false;
    }

    if (progress === SelfHostedSignupProgress.PAID ||
         progress === SelfHostedSignupProgress.CREATED_LICENSE ||
         progress === SelfHostedSignupProgress.CREATED_SUBSCRIPTION
    ) {
        // in these cases, the server has all the data it needs, all it needs is resubmit.
        return true;
    }

    if (progress === SelfHostedSignupProgress.CONFIRMED_INTENT) {
        return Boolean(

            // address
            state.address &&
            state.city &&
            state.state &&
            state.postalCode &&
            state.country &&

            // product/license
            !state.seats.error &&
            state.organization &&

            // legal
            state.agreedTerms,
        );
    }

    if (progress === SelfHostedSignupProgress.START || progress === SelfHostedSignupProgress.CREATED_CUSTOMER) {
        return Boolean(

            // card
            state.cardName &&
            state.cardFilled &&

            // address
            state.address &&
            state.city &&
            state.state &&
            state.postalCode &&
            state.country &&

            // product/license
            !state.seats.error &&
            state.organization &&

            // legal
            state.agreedTerms,
        );
    }
    return true;
}

interface Props {
    productId: string;
}

function convertProgressToBar(progress: ValueOf<typeof SelfHostedSignupProgress>): number {
    switch (progress) {
    case SelfHostedSignupProgress.START:
        return 0;
    case SelfHostedSignupProgress.CREATED_CUSTOMER:
        return 10;
    case SelfHostedSignupProgress.CREATED_INTENT:
        return 20;
    case SelfHostedSignupProgress.CONFIRMED_INTENT:
        return 30;
    case SelfHostedSignupProgress.CREATED_SUBSCRIPTION:
        return 50;
    case SelfHostedSignupProgress.PAID:
        return 90;
    case SelfHostedSignupProgress.CREATED_LICENSE:
        return 100;
    default:
        return 0;
    }
}

function useConvertProgressToWaitingExplanation(progress: ValueOf<typeof SelfHostedSignupProgress>, planName: string): React.ReactNode {
    const intl = useIntl();
    switch (progress) {
    case SelfHostedSignupProgress.START:
    case SelfHostedSignupProgress.CREATED_CUSTOMER:
    case SelfHostedSignupProgress.CREATED_INTENT:
        return intl.formatMessage({
            id: 'self_hosted_signup.progress_step.submitting_payment',
            defaultMessage: 'Submitting payment information',
        });
    case SelfHostedSignupProgress.CONFIRMED_INTENT:
    case SelfHostedSignupProgress.CREATED_SUBSCRIPTION:
        return intl.formatMessage({
            id: 'self_hosted_signup.progress_step.verifying_payment',
            defaultMessage: 'Verifying payment details',
        });
    case SelfHostedSignupProgress.PAID:
    case SelfHostedSignupProgress.CREATED_LICENSE:
        return intl.formatMessage({
            id: 'self_hosted_signup.progress_step.applying_license',
            defaultMessage: 'Applying your {planName} license to your Mattermost instance',
        }, {planName});
    default:
        return intl.formatMessage({
            id: 'self_hosted_signup.progress_step.submitting_payment',
            defaultMessage: 'Submitting payment information',
        });
    }
}

interface FakeProgress {
    intervalId?: NodeJS.Timeout;
}

function inferNames(user: UserProfile, cardName: string): [string, string] {
    if (user.first_name) {
        return [user.first_name, user.last_name];
    }
    const names = cardName.split(' ');
    if (cardName.length === 2) {
        return [names[0], names[1]];
    }
    return [names[0], names.slice(1).join(' ')];
}

export default function SelfHostedPurchaseModal(props: Props) {
    useFetchStandardAnalytics();
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.SELF_HOSTED_PURCHASE));
    const progress = useSelector(getSelfHostedSignupProgress);
    const user = useSelector(getCurrentUser);
    const theme = useSelector(getTheme);
    const contactSupportLink = useSelector((state: GlobalState) => getCloudContactUsLink(state)(InquiryType.Technical));
    const analytics = useSelector(getAdminAnalytics) || {};
    const desiredProduct = useSelector(getSelfHostedProducts)[props.productId];
    const desiredProductName = desiredProduct?.name || '';
    const desiredPlanName = getPlanNameFromProductName(desiredProductName);
    const currentUsers = analytics[StatTypes.TOTAL_USERS] as number;
    const openPricingModal = useOpenPricingModal();
    const waitingExplanation = useConvertProgressToWaitingExplanation(progress, desiredPlanName);

    const intl = useIntl();
    const fakeProgressRef = useRef<FakeProgress>({
    });

    const [state, dispatch] = useReducer(reducer, initialState);
    const reduxDispatch = useDispatch<DispatchFunc>();

    const cardRef = useRef<CardInputType | null>(null);
    const modalRef = useRef();
    const [stripeLoadHint, setStripeLoadHint] = useState(Math.random());

    const stripeRef = useLoadStripe(stripeLoadHint);
    const showForm = progress !== SelfHostedSignupProgress.PAID && progress !== SelfHostedSignupProgress.CREATED_LICENSE && !state.submitting && !state.error;

    useEffect(() => {
        if (typeof currentUsers === 'number' && (currentUsers > parseInt(state.seats.quantity, 10) || !parseInt(state.seats.quantity, 10))) {
            dispatch({type: 'update_seats',
                data: {
                    quantity: currentUsers.toString(),
                    error: null,
                }});
        }
    }, [currentUsers]);
    useEffect(() => {
        pageVisited(
            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
            'pageview_self_hosted_purchase',
        );
    }, []);

    useEffect(() => {
        const progressBar = convertProgressToBar(progress);
        if (progressBar > state.progressBar) {
            dispatch({type: 'update_progress_bar', data: progressBar});
        }
    }, [progress]);

    useEffect(() => {
        if (state.submitting) {
            if (fakeProgressRef.current && fakeProgressRef.current.intervalId) {
                clearInterval(fakeProgressRef.current.intervalId);
            }
            fakeProgressRef.current.intervalId = setInterval(() => {
                dispatch({type: 'update_progress_bar_fake'});
            }, fakeProgressInterval);
        } else if (fakeProgressRef.current && fakeProgressRef.current.intervalId) {
            clearInterval(fakeProgressRef.current.intervalId);
        }
        return () => {
            if (fakeProgressRef.current && fakeProgressRef.current.intervalId) {
                clearInterval(fakeProgressRef.current.intervalId);
            }
        };
    }, [state.submitting]);

    const handleCardInputChange = (event: StripeCardElementChangeEvent) => {
        dispatch({type: 'card_filled', data: event.complete});
    };

    async function submit() {
        let submitProgress = progress;
        dispatch({type: 'update_submitting', data: true});
        let signupCustomerResult: SelfHostedSignupCustomerResponse | null = null;
        try {
            const [firstName, lastName] = inferNames(user, state.cardName);

            signupCustomerResult = await Client4.createCustomerSelfHostedSignup({
                first_name: firstName,
                last_name: lastName,
                billing_address: {
                    city: state.city,
                    country: state.country,
                    line1: state.address,
                    line2: state.address2,
                    postal_code: state.postalCode,
                    state: state.state,
                },
                organization: state.organization,
            });
        } catch (e) {
            dispatch({type: 'update_submitting', data: false});
            dispatch({type: 'set_error', data: 'Failed to submit payment information'});
            return;
        }

        if (signupCustomerResult === null || !signupCustomerResult.progress) {
            dispatch({type: 'update_submitting', data: false});
            dispatch({type: 'set_error', data: 'Failed to submit payment information'});
            return;
        }
        if (progress === SelfHostedSignupProgress.START || progress === SelfHostedSignupProgress.CREATED_CUSTOMER) {
            reduxDispatch({
                type: HostedCustomerTypes.RECEIVED_SELF_HOSTED_SIGNUP_PROGRESS,
                data: signupCustomerResult.progress,
            });
            submitProgress = signupCustomerResult.progress;
        }
        const isDevMode = false;
        if (stripeRef.current === null) {
            setStripeLoadHint(Math.random());
            dispatch({type: 'update_submitting', data: false});
            return;
        }
        try {
            const card = cardRef.current?.getCard();
            if (!card) {
                const message = 'Failed to get card when it was expected';
                // eslint-disable-next-line no-console
                console.error(message);
                throw new Error(message);
            }
            const finished = await reduxDispatch(confirmSelfHostedSignup(
                stripeRef.current,
                {
                    id: signupCustomerResult.setup_intent_id,
                    client_secret: signupCustomerResult.setup_intent_secret,
                },
                isDevMode,
                {
                    address: state.address,
                    address2: state.address2,
                    city: state.city,
                    state: state.state,
                    country: state.country,
                    postalCode: state.postalCode,
                    name: state.cardName,
                    card,
                },
                submitProgress,
                {
                    product_id: props.productId,
                    add_ons: [],
                    seats: parseInt(state.seats.quantity, 10),
                },
            ));
            if (finished.data) {
                // eslint-disable-next-line
                console.log('redirect to license page or something. data:', finished.data);
                dispatch({type: 'succeeded'});
                reduxDispatch({
                    type: HostedCustomerTypes.RECEIVED_SELF_HOSTED_SIGNUP_PROGRESS,
                    data: SelfHostedSignupProgress.CREATED_LICENSE,
                });
            } else if (finished.error) {
                dispatch({type: 'update_submitting', data: false});
            }
            dispatch({type: 'update_submitting', data: false});
        } catch {
            dispatch({type: 'update_submitting', data: false});
        }
    }
    const canSubmitForm = canSubmit(state, progress);
    const closeModalSuccess = () => {
        reduxDispatch(closeModal(ModalIdentifiers.SELF_HOSTED_PURCHASE));
    };

    let buttonAction: () => void = submit;
    if (progress === SelfHostedSignupProgress.CREATED_LICENSE) {
        buttonAction = closeModalSuccess;
    }

    const progressBar: JSX.Element | null = (
        <div className='ProcessPayment-progress'>
            <div
                className='ProcessPayment-progress-fill'
                style={{width: `${state.progressBar}%`}}
            />
        </div>
    );

    const comparePlan = (
        <button
            className='ml-1'
            onClick={() => {
                trackEvent('self_hosted_pricing', 'click_compare_plans');
                openPricingModal({trackingLocation: 'purchase_modal_compare_plans_click'});
            }}
        >
            <FormattedMessage
                id='cloud_subscribe.contact_support'
                defaultMessage='Compare plans'
            />
        </button>
    );

    const showPlanLabel = desiredProduct.sku === SelfHostedProducts.PROFESSIONAL;
    const comparePlanWrapper = (
        <div
            className={showPlanLabel ? 'plan_comparison show_label' : 'plan_comparison'}
        >
            {comparePlan}
        </div>
    );

    const title = (
        <FormattedMessage
            defaultMessage={'Provide your payment details'}
            id={'admin.billing.subscription.providePaymentDetails'}
        />
    );

    const contactSalesLink = (
        <a
            className='footer-text'
            onClick={() => {
                trackEvent(
                    TELEMETRY_CATEGORIES.SELF_HOSTED_PURCHASING,
                    'click_contact_sales',
                );
            }}
            href={contactSupportLink}
            target='_blank'
            rel='noopener noreferrer'
        >
            {intl.formatMessage({id: 'self_hosted_signup.contact_sales', defaultMessage: 'Contact Sales'})}
        </a>
    );

    return (
        <Elements
            options={{fonts: [{cssSrc: STRIPE_CSS_SRC}]}}
            stripe={stripeRef.current}
        >
            <RootPortal>
                <FullScreenModal
                    show={show}
                    ref={modalRef}
                    ariaLabelledBy='self_hosted_purchase_modal_title'
                    onClose={() => {
                        trackEvent(
                            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                            'click_close_purchasing_screen',
                        );
                        reduxDispatch(closeModal(ModalIdentifiers.SELF_HOSTED_PURCHASE));
                    }}
                >
                    <div className='SelfHostedPurchaseModal'>
                        {<div className={classNames('form-view', {'form-view--hide': !showForm})}>
                            <div className='lhs'>
                                <h2 className='title'>{title}</h2>
                                <UpgradeSvg
                                    width={267}
                                    height={227}
                                />
                                <div className='footer-text'>{'Questions?'}</div>
                                {contactSalesLink}
                            </div>
                            <div className='center'>
                                <div className='form'>
                                    <div className='section-title'>
                                        <FormattedMessage
                                            id='payment_form.credit_card'
                                            defaultMessage='Credit Card'
                                        />
                                    </div>
                                    <div className='form-row'>
                                        <CardInput
                                            forwardedRef={cardRef}
                                            required={true}
                                            onCardInputChange={handleCardInputChange}
                                            theme={theme}
                                        />
                                    </div>
                                    <div className='form-row'>
                                        <Input
                                            name='company'
                                            type='text'
                                            value={state.organization}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                dispatch({type: 'update_organization', data: e.target.value});
                                            }}
                                            placeholder={intl.formatMessage({
                                                id: 'self_hosted_signup.organization',
                                                defaultMessage: 'Organization Name',
                                            })}
                                            required={true}
                                        />
                                    </div>
                                    <div className='form-row'>
                                        <Input
                                            name='name'
                                            type='text'
                                            value={state.cardName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                dispatch({type: 'update_card_name', data: e.target.value});
                                            }}
                                            placeholder={intl.formatMessage({
                                                id: 'payment_form.name_on_card',
                                                defaultMessage: 'Name on Card',
                                            })}
                                            required={true}
                                        />
                                    </div>
                                    <div className='section-title'>
                                        <FormattedMessage
                                            id='payment_form.billing_address'
                                            defaultMessage='Billing address'
                                        />
                                    </div>
                                    <DropdownInput
                                        onChange={(option: {value: string}) => {
                                            dispatch({type: 'update_country', data: option.value});
                                        }}
                                        value={
                                            state.country ? {value: state.country, label: state.country} : undefined
                                        }
                                        options={COUNTRIES.map((country) => ({
                                            value: country.name,
                                            label: country.name,
                                        }))}
                                        legend={intl.formatMessage({
                                            id: 'payment_form.country',
                                            defaultMessage: 'Country',
                                        })}
                                        placeholder={intl.formatMessage({
                                            id: 'payment_form.country',
                                            defaultMessage: 'Country',
                                        })}
                                        name={'billing_dropdown'}
                                    />
                                    <div className='form-row'>
                                        <Input
                                            name='address'
                                            type='text'
                                            value={state.address}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                dispatch({type: 'update_address', data: e.target.value});
                                            }}
                                            placeholder={intl.formatMessage({
                                                id: 'payment_form.address',
                                                defaultMessage: 'Address',
                                            })}
                                            required={true}
                                        />
                                    </div>
                                    <div className='form-row'>
                                        <Input
                                            name='address2'
                                            type='text'
                                            value={state.address2}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                dispatch({type: 'update_address2', data: e.target.value});
                                            }}
                                            placeholder={intl.formatMessage({
                                                id: 'payment_form.address_2',
                                                defaultMessage: 'Address 2',
                                            })}
                                        />
                                    </div>
                                    <div className='form-row'>
                                        <Input
                                            name='city'
                                            type='text'
                                            value={state.city}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                dispatch({type: 'update_city', data: e.target.value});
                                            }}
                                            placeholder={intl.formatMessage({
                                                id: 'payment_form.city',
                                                defaultMessage: 'City',
                                            })}
                                            required={true}
                                        />
                                    </div>
                                    <div className='form-row'>
                                        <div className='form-row-third-1'>
                                            <StateSelector
                                                country={state.country}
                                                state={state.state}
                                                onChange={(state: string) => {
                                                    dispatch({type: 'update_state', data: state});
                                                }}
                                            />
                                        </div>
                                        <div className='form-row-third-2'>
                                            <Input
                                                name='postalCode'
                                                type='text'
                                                value={state.postalCode}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    dispatch({type: 'update_postal_code', data: e.target.value});
                                                }}
                                                placeholder={intl.formatMessage({
                                                    id: 'payment_form.zipcode',
                                                    defaultMessage: 'Zip/Postal Code',
                                                })}
                                                required={true}
                                            />
                                        </div>
                                    </div>
                                </div >
                            </div>
                            <div className='rhs'>
                                {comparePlanWrapper}
                                <Card
                                    topColor='#4A69AC'
                                    plan={desiredPlanName}
                                    price={`$${desiredProduct?.price_per_seat?.toString()}`}
                                    seeHowBillingWorks={seeHowBillingWorks}
                                    rate='/user/month'
                                    planBriefing={<></>}
                                    preButtonContent={(
                                        <SeatsCalculator
                                            price={desiredProduct?.price_per_seat}
                                            seats={state.seats}
                                            existingUsers={currentUsers}
                                            onChange={(seats: Seats) => {
                                                dispatch({type: 'update_seats', data: seats});
                                            }}
                                        />
                                    )}
                                    afterButtonContent={
                                        <div className='signup-consequences'>
                                            <FormattedMessage
                                                defaultMessage={'You will be billed {today}. Your license will be applied automatically. <a>See how billing works.</a>'}
                                                id={'self_hosted_signup.signup_consequences'}
                                                values={{
                                                    today: getToday(),
                                                    a: (chunks: React.ReactNode) => (
                                                        <a
                                                            onClick={seeHowBillingWorks}
                                                        >
                                                            {chunks}
                                                        </a>
                                                    ),
                                                }}
                                            />
                                        </div>
                                    }
                                    buttonDetails={{
                                        action: buttonAction,
                                        disabled: !canSubmitForm,
                                        text: intl.formatMessage({id: 'self_hosted_signup.cta', defaultMessage: 'Upgrade'}),
                                        customClass: canSubmitForm ? ButtonCustomiserClasses.special : ButtonCustomiserClasses.grayed,
                                    }}
                                    planLabel={
                                        showPlanLabel ? (
                                            <PlanLabel
                                                text={intl.formatMessage({
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
                                    hideBillingCycle={true}
                                />
                            </div>
                        </div>}
                        {progress === SelfHostedSignupProgress.CREATED_LICENSE && (
                            <SuccessPage
                                onClose={closeModalSuccess}
                                planName={desiredPlanName}
                            />
                        )}
                        {state.submitting && (
                            <div className='submitting'>
                                <IconMessage
                                    title={t('admin.billing.subscription.verifyPaymentInformation')}
                                    formattedSubtitle={waitingExplanation}
                                    icon={
                                        <CreditCardSvg
                                            width={444}
                                            height={313}
                                        />
                                    }
                                    footer={progressBar}
                                    className={'processing'}
                                />
                            </div>
                        )}
                        {state.error && (
                            <div className='failed'>
                                <IconMessage
                                    title={t('admin.billing.subscription.paymentVerificationFailed')}
                                    subtitle={t('admin.billing.subscription.paymentFailed')}
                                    icon={
                                        <PaymentFailedSvg
                                            width={444}
                                            height={313}
                                        />
                                    }
                                    error={true}
                                    buttonText={t('self_hosted_signup.retry')}
                                    buttonHandler={() => {
                                        Client4.bootstrapSelfHostedSignup(true).
                                            then((data) => {
                                                reduxDispatch({type: HostedCustomerTypes.RECEIVED_SELF_HOSTED_SIGNUP_PROGRESS, data: data.progress});
                                                dispatch({type: 'set_error', data: ''});
                                            });
                                    }}
                                    linkText={t('admin.billing.subscription.privateCloudCard.contactSupport')}
                                    linkURL={contactSupportLink}
                                />
                            </div>
                        )}
                        <div className='background-svg'>
                            <BackgroundSvg/>
                        </div>
                    </div>
                </FullScreenModal>
            </RootPortal>
        </Elements>
    );
}
