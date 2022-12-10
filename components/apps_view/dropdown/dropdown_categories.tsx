// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {AppBinding} from '@mattermost/types/apps';

import {CommonProps} from '../common_props';

import Dropdown from './dropdown';

export function SelectVariantCategories(props: CommonProps) {
    const [selected, setSelected] = useState<AppBinding | null>(null);

    const options = props.binding.bindings;
    const {handleBindingClick} = props;

    useEffect(() => {
        if (selected) {
            return;
        }

        const options = props.binding.bindings;
        if (!options?.length) {
            return;
        }

        for (const option of options) {
            if (option.selected) {
                setSelected(option);
                return;
            }
        }

        setSelected(options[0]);
    }, [options, selected, props.binding.bindings]);

    const onSelect = useCallback((value: AppBinding) => {
        const option = options?.find((opt) => opt.location === value.location);
        if (!option) {
            return;
        }

        setSelected(option);

        handleBindingClick(option);
    }, [options, handleBindingClick]);

    const label = selected?.label || 'No selected option';

    const CategoriesButton = () => (
        <h3 style={{cursor: 'pointer'}}>
            {label}
        </h3>
    );

    return (
        <div>
            <Dropdown
                {...props}
                Button={CategoriesButton}
                onSelect={onSelect}
                hint={props.binding.hint || (
                    <FormattedMessage
                        id={'the.id'}
                        defaultMessage={'Categories'}
                    />
                )}
            />
        </div>
    );
}
