// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useReducer, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';

import {StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';

import {SelfHostedSignupProgress} from '@mattermost/types/hosted_customer';
import {ValueOf} from '@mattermost/types/utilities';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getAdminAnalytics} from 'mattermost-redux/selectors/entities/admin';
import {getSelfHostedSignupProgress} from 'mattermost-redux/selectors/entities/hosted_customer';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {Client4} from 'mattermost-redux/client';
import {HostedCustomerTypes} from 'mattermost-redux/action_types';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {closeModal} from 'actions/views/modals';
import {confirmSelfHostedSignup} from 'actions/hosted_customer';

import {GlobalState} from 'types/store';

import {isModalOpen} from 'selectors/views/modals';

import {t} from 'utils/i18n';
import {COUNTRIES} from 'utils/countries';

import {STRIPE_CSS_SRC} from 'components/payment_form/stripe';
import CardInput, {CardInputType} from 'components/payment_form/card_input';
import StateSelector from 'components/payment_form/state_selector';
import DropdownInput from 'components/dropdown_input';
import BackgroundSvg from 'components/common/svg_images_components/background_svg';
import CreditCardSvg from 'components/common/svg_images_components/credit_card_svg';

import Input from 'components/widgets/inputs/input/input';

import IconMessage from 'components/purchase_modal/icon_message';
import 'components/purchase_modal/purchase.scss';

import {
    ModalIdentifiers,
    StatTypes,
    TELEMETRY_CATEGORIES,
} from 'utils/constants';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';
import useLoadStripe from 'components/common/hooks/useLoadStripe';
import useFetchStandardAnalytics from 'components/common/hooks/useFetchStandardAnalytics';

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
    seats: number;
    submitting: boolean;
    succeeded: boolean;
    progressBar: number;
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
    data: number;
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
}

interface UpdateProgressBar {
    type: 'update_progress_bar';
    data: number;
}
interface UpdateProgressBarFake {
    type: 'update_progress_bar_fake';
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
    seats: 0,
    submitting: false,
    succeeded: false,
    progressBar: 0,
};

const maxFakeProgress = 90;
const maxFakeProgressIncrement = 5;

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
    case 'start_over':
        return initialState;
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
            state.seats &&
            state.organization &&

            // legal
            state.agreedTerms,
        );
    }

    if (progress === SelfHostedSignupProgress.START) {
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
            state.seats &&
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

interface FakeProgress {
    intervalId?: NodeJS.Timeout;
}

export default function SelfHostedPurchaseModal(props: Props) {
    useFetchStandardAnalytics();
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.SELF_HOSTED_PURCHASE));
    const progress = useSelector(getSelfHostedSignupProgress);
    const user = useSelector(getCurrentUser);
    const theme = useSelector(getTheme);
    const analytics = useSelector(getAdminAnalytics) || {};
    const totalUsers = analytics[StatTypes.TOTAL_USERS];

    const intl = useIntl();
    const fakeProgressRef = useRef<FakeProgress>({
    });

    const [state, dispatch] = useReducer(reducer, initialState);
    const reduxDispatch = useDispatch<DispatchFunc>();

    const cardRef = useRef<CardInputType | null>(null);
    const modalRef = useRef();
    const [stripeLoadHint, setStripeLoadHint] = useState(Math.random());

    const stripeRef = useLoadStripe(stripeLoadHint);
    const showForm = progress !== SelfHostedSignupProgress.PAID && progress !== SelfHostedSignupProgress.CREATED_LICENSE;

    useEffect(() => {
        if (typeof totalUsers === 'number' && totalUsers > state.seats) {
            dispatch({type: 'update_seats', data: totalUsers});
        }
    }, [totalUsers])
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
            });
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
        const signupCustomerResult = await Client4.createCustomerSelfHostedSignup({
            first_name: user.first_name,
            last_name: user.last_name,
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
                    seats: Math.max(state.seats, 200),
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

    let buttonStep = 'Signup';
    let buttonAction: () => void = submit;
    if (progress === SelfHostedSignupProgress.CREATED_LICENSE) {
        buttonStep = 'Done';
        buttonAction = function done() {
            reduxDispatch(closeModal(ModalIdentifiers.SELF_HOSTED_PURCHASE));
        };
    }

    const progressBar: JSX.Element | null = (
        <div className='ProcessPayment-progress'>
            <div
                className='ProcessPayment-progress-fill'
                style={{width: `${state.progressBar}%`}}
            />
        </div>
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
                    <div className='PurchaseModal PurchaseModal--self-hosted'>
                        <div>
                            {progress === SelfHostedSignupProgress.CREATED_LICENSE && 'enjoy your license'}

                            {state.submitting &&
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
                                className={'processing'}
                            />

                            }
                            {showForm && <div style={{margin: '30px'}}>
                                <div>
                                    <CardInput
                                        forwardedRef={cardRef}
                                        required={true}
                                        onCardInputChange={handleCardInputChange}
                                        theme={theme}
                                    />
                                </div>
                                <div>
                                    <Input
                                        name='company'
                                        type='text'
                                        value={state.organization}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            dispatch({type: 'update_organization', data: e.target.value});
                                        }}
                                        placeholder={intl.formatMessage({
                                            id: 'payment_form.organization',
                                            defaultMessage: 'Company Name',
                                        })}
                                        required={true}
                                    />
                                </div>
                                <div>
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
                                <div>
                                    <input
                                        type='number'
                                        value={state.seats}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            dispatch({type: 'update_seats', data: parseInt(e.target.value, 10) || 42});
                                        }}
                                        min={1}
                                        max={9999999999999}
                                    />
                                </div>
                                <div>

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
                                </div>
                                <div>
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
                                <div>
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
                                <div>
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
                                <div>
                                    <StateSelector
                                        country={state.country}
                                        state={state.state}
                                        onChange={(state: string) => {
                                            dispatch({type: 'update_state', data: state});
                                        }}
                                    />
                                </div>
                                <div>
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
                            </div>}

                            {progress !== SelfHostedSignupProgress.PAID && (
                                <button
                                    onClick={() => {
                                        Client4.bootstrapSelfHostedSignup(true).
                                            then(() => {
                                                dispatch({type: 'start_over'});
                                            });
                                    }}
                                >
                                    {'start over'}
                                </button>
                            )}
                        </div>
                        <button
                            className=''
                            disabled={!canSubmitForm}
                            onClick={buttonAction}
                        >
                            {buttonStep}
                        </button>
                        <div className='background-svg'>
                            <BackgroundSvg/>
                        </div>
                    </div>
                </FullScreenModal>
            </RootPortal>
        </Elements>
    );
}
