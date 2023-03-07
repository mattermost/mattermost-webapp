// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage, MessageDescriptor, useIntl} from 'react-intl';

import {Address} from '@mattermost/types/cloud';
import DropdownInput from 'components/dropdown_input';
import {COUNTRIES} from 'utils/countries';
import Input from 'components/widgets/inputs/input/input';

import StateSelector from './state_selector';

import './payment_form.scss';

type AddressFormProps = {
    onAddressChange: (address: Address) => void;
    onBlur: () => void;
    title: MessageDescriptor;
    formId: string;
    address: Address;
}

const AddressForm = (props: AddressFormProps) => {
    const {formatMessage} = useIntl();
    const handleCountryChange = (option: any) => {
        props.onAddressChange({...props.address, country: option.value});
    };

    const handleStateChange = (option: any) => {
        props.onAddressChange({...props.address, state: option});
    };

    const handleInputChange = (key: keyof Address) => (
        event:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const target = event.target;
        const value = target.value;

        const newStateValue = {
            [key]: value,
        } as unknown as Pick<Address, keyof Address>;

        const {onAddressChange} = props;
        onAddressChange({
            ...props.address,
            ...newStateValue,
        });
    };

    return (
        <div
            id={props.formId}
            className='PaymentForm'
        >
            <div className='section-title'>
                <FormattedMessage
                    {...props.title}
                />
            </div>
            <DropdownInput
                onChange={handleCountryChange}
                value={
                    props.address.country ? {value: props.address.country, label: props.address.country} : undefined
                }
                options={COUNTRIES.map((country) => ({
                    value: country.name,
                    label: country.name,
                }))}
                legend={formatMessage({
                    id: 'payment_form.country',
                    defaultMessage: 'Country',
                })}
                placeholder={formatMessage({
                    id: 'payment_form.country',
                    defaultMessage: 'Country',
                })}
                name={'billing_dropdown'}
            />
            <div className='form-row'>
                <Input
                    name='address'
                    type='text'
                    value={props.address.line1}
                    onChange={handleInputChange('line1')}
                    onBlur={props.onBlur}
                    placeholder={formatMessage({
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
                    value={props.address.line2}
                    onChange={handleInputChange('line2')}
                    onBlur={props.onBlur}
                    placeholder={formatMessage({
                        id: 'payment_form.address_2',
                        defaultMessage: 'Address 2',
                    })}
                />
            </div>
            <div className='form-row'>
                <Input
                    name='city'
                    type='text'
                    value={props.address.city}
                    onChange={handleInputChange('city')}
                    onBlur={props.onBlur}
                    placeholder={formatMessage({
                        id: 'payment_form.city',
                        defaultMessage: 'City',
                    })}
                    required={true}
                />
            </div>
            <div className='form-row'>
                <div className='form-row-third-1 selector'>
                    <StateSelector
                        country={props.address.country}
                        state={props.address.state}
                        onChange={handleStateChange}
                        onBlur={props.onBlur}
                    />
                </div>
                <div className='form-row-third-2'>
                    <Input
                        name='postalCode'
                        type='text'
                        value={props.address.postal_code}
                        onChange={handleInputChange('postal_code')}
                        onBlur={props.onBlur}
                        placeholder={formatMessage({
                            id: 'payment_form.zipcode',
                            defaultMessage: 'Zip/Postal Code',
                        })}
                        required={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddressForm;
