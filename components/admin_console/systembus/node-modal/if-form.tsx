// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';

import ReactSelect, {ValueType} from 'react-select';

import Input from 'components/widgets/inputs/input/input';

type Props = {
    handleChange: (data: Record<string, any>) => void;
}

type SelectedOption = {
    value: string;
    label: string;
}

const selectOptions = [
    {value: 'eq', label: 'eq'},
    {value: 'gt', label: 'gt'},
    {value: 'lt', label: 'lt'},
    {value: 'gte', label: 'gte'},
    {value: 'lte', label: 'lte'},
    {value: 'contains', label: 'contains'},
    {value: 'prefix', label: 'prefix'},
    {value: 'suffix', label: 'suffix'},
];

const WebhookForm = ({handleChange}: Props): JSX.Element => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const [openMenu, setOpenMenu] = useState(false);
    const [data, setData] = useState<{ifValue: string;ifComparison: SelectedOption}>({ifValue: '', ifComparison: selectOptions[0]});

    const handleIfValueOnChange = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        setData({
            ...data,
            ifValue: value,
        });
        handleChange(data);
    };

    const handleIfComparisonOnChange = (selectedOption: ValueType<SelectedOption>) => {
        if (selectedOption && 'value' in selectedOption) {
            setData({
                ...data,
                ifComparison: selectedOption,
            });
            handleChange({ifComparison: data.ifComparison.value, ifValue: data.ifValue});
        }
    };

    const handleMenuClose = () => {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.classList.remove('no-scroll');
        }
        setOpenMenu(false);
    };

    const handleMenuOpen = () => {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.classList.add('no-scroll');
        }
        setOpenMenu(true);
    };

    const reactStyles = {
        menuPortal: (provided: React.CSSProperties) => ({
            ...provided,
            zIndex: 9999,
        }),
    };

    return (
        <div className='node-modal__column'>
            <Input
                type='text'
                name='node-modal-name'
                containerClassName='node-modal-name-container'
                inputClassName='node-modal-name-input'
                label={formatMessage({id: 'node_modal.name.label', defaultMessage: 'ifValue'})}
                placeholder={formatMessage({id: 'node_modal.name.placeholder', defaultMessage: 'ifValue'})}
                onChange={handleIfValueOnChange}
                value={data.ifValue}
                data-testid='nameInput'
                maxLength={64}
                autoFocus={true}
            />
            <ReactSelect
                className='react-select'
                classNamePrefix='react-select'
                id='selectComparison'
                options={selectOptions}
                clearable={false}
                menuIsOpen={openMenu}
                styles={reactStyles}
                menuPortalTarget={document.body}
                onChange={handleIfComparisonOnChange}
                value={data.ifComparison}
                isSearchable={false}
                onMenuClose={handleMenuClose}
                onMenuOpen={handleMenuOpen}
            />
        </div>
    );
};

export default WebhookForm;
