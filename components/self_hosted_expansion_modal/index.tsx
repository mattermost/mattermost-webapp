// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';

import {FormattedMessage, useIntl} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import UpgradeSvg from 'components/common/svg_images_components/upgrade_svg';
import RootPortal from 'components/root_portal';
import ContactSalesLink from 'components/self_hosted_purchase_modal/contact_sales_link';

import useLoadStripe from 'components/common/hooks/useLoadStripe';
import CardInput, {CardInputType} from 'components/payment_form/card_input';
import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import Input from 'components/widgets/inputs/input/input';

import BackgroundSvg from 'components/common/svg_images_components/background_svg';
import {COUNTRIES} from 'utils/countries';
import StateSelector from 'components/payment_form/state_selector';
import Terms from 'components/self_hosted_purchase_modal/terms';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import DropdownInput from 'components/dropdown_input';
import StripeProvider from '../self_hosted_purchase_modal/stripe_provider';
import SelfHostedExpansionCard from './expansion_card';
import './self_hosted_expansion_modal.scss';
import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {getFilteredUsersStats} from 'mattermost-redux/selectors/entities/users';

export interface FormState {
    address: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    cardName: string;
    organization: string;
    agreedTerms: boolean;
    cardFilled: boolean;
    seats: number;
    submitting: boolean;
    succeeded: boolean;
    progressBar: number;
    error: string;
}

export function makeInitialState(): FormState {
    return {
        address: '',
        address2: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        cardName: '',
        organization: '',
        agreedTerms: false,
        cardFilled: false,
        seats: 0,
        submitting: false,
        succeeded: false,
        progressBar: 0,
        error: '',
    };
}
const initialState = makeInitialState();

export default function SelfHostedExpansionModal() {
    const dispatch = useDispatch();
    const intl = useIntl();
    const cardRef = useRef<CardInputType | null>(null);
    const theme = useSelector(getTheme);

    const license = useSelector(getLicense)
    const licensedSeats = parseInt(license.Users);
    const activeUsers = useSelector(getFilteredUsersStats)?.total_users_count || 0;
    const [additionalSeats, setAdditionalSeats] = useState(activeUsers <= licensedSeats ? 1 : activeUsers - licensedSeats);
    
    const [stripeLoadHint, setStripeLoadHint] = useState(Math.random());
    const stripeRef = useLoadStripe(stripeLoadHint);

    const [formState, setFormState] = useState<FormState>(initialState);
    const [show] = useState(true);

    const title = intl.formatMessage({
        id: 'self_hosted_expansion.expansion_modal.title',
        defaultMessage: 'Provide your payment details',
    });

    const canSubmit = () => {
        if (formState.submitting) {
            return false;
        }
    
        const validAddress = Boolean(
            formState.organization &&
            formState.address &&
            formState.city &&
            formState.state &&
            formState.postalCode &&
            formState.country,
        );
        const validCard = Boolean(
            formState.cardName &&
            formState.cardFilled,
        );
        const validSeats = formState.seats > 0

        return Boolean(
            validCard &&
            validAddress &&
            validSeats &&
            formState.agreedTerms,
        );
    }

    const submit = () => {
        
    }

    return (
        <StripeProvider
            stripeRef={stripeRef}
        >
            <RootPortal>
                <FullScreenModal
                    show={show}
                    ariaLabelledBy='self_hosted_expansion_modal_title'
                    onClose={() => {
                        dispatch(closeModal(ModalIdentifiers.SELF_HOSTED_EXPANSION))
                    }}
                >
                    <div className='SelfHostedExpansionModal'>
                        <div className='form-view'>
                        <div className='lhs'>
                            <h2 className='title'>{title}</h2>
                            <UpgradeSvg
                                width={267}
                                height={227}
                            />
                            <div className='footer-text'>{'Questions?'}</div>
                            <ContactSalesLink/>
                        </div>
                        <div className='center'>
                            <div
                                className='form'
                                data-testid='shpm-form'
                            >
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
                                        onCardInputChange={(event: StripeCardElementChangeEvent) => {
                                            setFormState({...formState, cardFilled: event.complete})
                                        }}
                                        theme={theme}
                                    />
                                </div>
                                <div className='form-row'>
                                    <Input
                                        name='organization'
                                        type='text'
                                        value={formState.organization}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setFormState({...formState, organization: e.target.value});
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
                                        value={formState.cardName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setFormState({...formState, cardName: e.target.value})
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
                                    testId='selfHostedExpansionCountrySelector'
                                    onChange={(option: {value: string}) => {
                                        setFormState({...formState, country: option.value});
                                    }}
                                    value={
                                        formState.country ? {value: formState.country, label: formState.country} : undefined
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
                                        value={formState.address}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setFormState({...formState, address: e.target.value});
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
                                        value={formState.address2}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setFormState({...formState, address2: e.target.value});
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
                                        value={formState.city}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setFormState({...formState, city: e.target.value});
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
                                            testId='selfHostedExpansionStateSelector'
                                            country={formState.country}
                                            state={formState.state}
                                            onChange={(state: string) => {
                                                setFormState({...formState, state: state});
                                            }}
                                        />
                                    </div>
                                    <div className='form-row-third-2'>
                                        <Input
                                            name='postalCode'
                                            type='text'
                                            value={formState.postalCode}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setFormState({...formState, postalCode: e.target.value});
                                            }}
                                            placeholder={intl.formatMessage({
                                                id: 'payment_form.zipcode',
                                                defaultMessage: 'Zip/Postal Code',
                                            })}
                                            required={true}
                                        />
                                    </div>
                                </div>
                                <Terms
                                    agreed={formState.agreedTerms}
                                    setAgreed={(data: boolean) => {
                                        setFormState({...formState, agreedTerms: data});
                                    }}
                                />
                            </div>
                        </div>
                        <div className='rhs'>
                            <SelfHostedExpansionCard
                                updateSeats={(seats: number) => {
                                    setFormState({...formState, seats})
                                }}
                                canSubmit={canSubmit()}
                                submit={submit}
                                initialSeats={additionalSeats}
                            />
                        </div>
                        </div>
                        {/* {((formState.succeeded || progress === SelfHostedSignupProgress.CREATED_LICENSE) && hasLicense) && !formState.error && !formState.submitting && (
                            <SuccessPage
                                onClose={controlModal.close}
                                planName={desiredPlanName}
                            />
                        )}
                        {formState.submitting && (
                            <Submitting
                                desiredPlanName={desiredPlanName}
                                progressBar={formState.progressBar}
                            />
                        )}
                        {formState.error && (
                            <ErrorPage
                                nextAction={errorAction}
                                canRetry={canRetry}
                                errorType={canRetry ? 'generic' : 'failed_export'}
                            />
                        )} */}
                        <div className='background-svg'>
                            <BackgroundSvg/>
                        </div>
                    </div>
                </FullScreenModal>
            </RootPortal>
        </StripeProvider>
    );
}
