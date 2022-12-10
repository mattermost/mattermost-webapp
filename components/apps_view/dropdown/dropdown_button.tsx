// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {CommonProps} from '../common_props';

import Dropdown from './dropdown';

export function SelectVariantButton(props: CommonProps) {
    return (
        <Dropdown
            {...props}
            onSelect={props.handleBindingClick}
            Button={Button}
            hint={props.binding.hint || (
                <FormattedMessage
                    id={'the.id'}
                    defaultMessage={'Actions'}
                />
            )}
        />
    );
}

function Button(props: CommonProps) {
    return (
        <button
            type='button'
            className='save-button btn btn-primary'
        >
            {props.binding.label}
        </button>
    );
}
