// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

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
    initialAddress: Address;
}

const AddressForm = (props: AddressFormProps) => {
    const {formatMessage} = useIntl();
    const [address, setAddress] = useState<Address>(props.initialAddress);
    const handleCountryChange = (option: any) => {
        setAddress({...address, country: option.value});
        props.onAddressChange({...address, country: option.value});
    };

    const handleStateChange = (option: any) => {
        console.log(option);
        setAddress({...address, state: option});
        props.onAddressChange({...address, state: option});
    };

    const handleInputChange = (
        event:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const target = event.target;
        const name = target.name;
        const value = target.value;

        const newStateValue = {
            [name]: value,
        } as unknown as Pick<Address, keyof Address>;

        setAddress({...address, ...newStateValue});

        const {onAddressChange} = props;
        if (onAddressChange) {
            onAddressChange({
                ...address,
                ...newStateValue,
            });
        }
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
                    address.country ? {value: address.country, label: address.country} : undefined
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
                    value={address.line1}
                    onChange={handleInputChange}
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
                    value={address.line2}
                    onChange={handleInputChange}
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
                    value={address.city}
                    onChange={handleInputChange}
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
                        country={address.country}
                        state={address.state}
                        onChange={handleStateChange}
                        onBlur={props.onBlur}
                    />
                </div>
                <div className='form-row-third-2'>
                    <Input
                        name='postalCode'
                        type='text'
                        value={address.postal_code}
                        onChange={handleInputChange}
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
