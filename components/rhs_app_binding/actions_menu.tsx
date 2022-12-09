// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {DotsVerticalIcon} from '@mattermost/compass-icons/components';

import classNames from 'classnames';

import {CommonProps} from './common_props';
import Dropdown from './dropdown';

export default function ActionsMenu(props: CommonProps) {
    return (
        <Dropdown
            {...props}
            onSelect={props.handleBindingClick}
            Button={ActionsButton}
            hint={props.binding.hint || (
                <FormattedMessage
                    id={'the.id'}
                    defaultMessage={'Actions'}
                />
            )}
        />
    );
}

type ActionsButtonProps = {
    isMenuOpen: boolean;
}

function ActionsButton(props: ActionsButtonProps) {
    return (
        <button
            className={classNames(
                'mm-app-bar-rhs-binding-list-item__more-btn',
                {'more-btn-menu-active': props.isMenuOpen},
            )}
        >
            <DotsVerticalIcon
                size={18}
                color={'currentColor'}
            />
        </button>
    );
}
