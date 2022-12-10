// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import classNames from 'classnames';

import ActionsMenu from './actions_menu';
import {CommonProps} from './common_props';
import Icon from './icon';

export default function ListBlock(props: CommonProps) {
    return (
        <div className='mm-app-bar-rhs-binding-list-block'>
            <h3>{props.binding.label}</h3>
            <ul className='mm-app-bar-rhs-binding-list'>
                {props.binding.bindings?.map((b) => (
                    <ListItem
                        {...props}
                        key={b.label}
                        binding={b}
                    />
                ))}
            </ul>
        </div>
    );
}

export function ListItem(props: CommonProps) {
    let actionsMenu;
    const actions = props.binding.bindings?.find((b) => b.type === 'actions');
    if (actions) {
        actionsMenu = (
            <ActionsMenu
                {...props}
                binding={actions}
            />
        );
    }

    let iconComponent;
    if (props.binding.icon) {
        iconComponent = (
            <div className='mm-app-bar-rhs-binding-list-item__icon-ctr'>
                <Icon
                    width={'18px'}
                    src={props.binding.icon}
                />
            </div>
        );
    }

    const View = props.viewComponent;
    const childBindings = (
        <div>
            {props.binding.bindings?.filter((b) => b.type !== 'actions').map((b) => (
                <View
                    {...props}
                    key={b.label}
                    binding={b}
                />
            ))}
        </div>
    );

    const title = (
        <h4 className='mm-app-bar-rhs-binding-list-item__title'>
            {props.binding.label}
        </h4>
    );

    const description = props.binding.description && (
        <p className='mm-app-bar-rhs-binding-list-item__sub-text'>
            {props.binding.description}
        </p>
    );

    const textContent = (
        <div className='mm-app-bar-rhs-binding-list-item__content-ctr'>
            {title}
            {description}
        </div>
    );

    const handleItemClick = () => {
        if (props.binding.submit) {
            props.handleBindingClick(props.binding);
        }
    };

    return (
        <li
            className={classNames('mm-app-bar-rhs-binding-list-item', {'cursor-pointer': props.binding.submit})}
            onClick={handleItemClick}
        >
            {iconComponent}
            {textContent}
            {actionsMenu}
            <div>
                {childBindings}
            </div>
        </li>
    );
}
