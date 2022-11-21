// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';

import classNames from 'classnames';

import ActionsMenu from './actions_menu';
import {CommonProps} from './common_props';
import Icon from './icon';
import {AppBinding} from '@mattermost/types/apps';

export default function Select(props: CommonProps) {
    let variantComponent;

    const variants: Record<string, React.ElementType> = {
        'categories': CategoriesSelect,
        'button_select': ButtonSelect,
        'select': NormalSelect,
    };

    let variant = props.binding.subtype;
    if (!variant) {
        variant = 'select';
    }

    const Variant = variants[variant];
    if (!Variant) {
        return <span>{'unknown variant ' + variant}</span>
    }

    return (
        <div className='mm-app-bar-rhs-binding-select'>
            <Variant {...props}/>
        </div>
    );
}

export function SelectOption(props: CommonProps) {
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

function CategoriesSelect(props: CommonProps) {
    const [selected, setSelected] = useState<AppBinding | null>(null);

    const options = props.binding.bindings;

    useEffect(() => {
        const options = props.binding.bindings;

        if (!options) {
            return;
        }

        for (const option of options) {
            if (option.selected) {
                setSelected(option);
                return;
            }
        }

        setSelected(options[0]);
    }, [options]);

    const onSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const optionValue = e.target.value;
        const option = options?.find((opt) => opt.location === optionValue);

        if (!option) {
            return;
        }
        setSelected(option);

        props.handleBindingClick(option);
    }, [options, props.handleBindingClick]);


    if (!options?.length) {
        return <span>{'No select options provided'}</span>;
    }

    if (!selected) {
        return <span>{'No option selected'}</span>;
    }

    const label = selected.label;

    const optionComponents = options.map((option) => (
        <option
            key={option.location}
            value={option.location} // need to make sure we have generated ids for these
        >
            {option.icon}
            {option.label}
        </option>
    ));

    return (
        <div>
            <p>
                {label}
            </p>
            <div>
                <select
                    onChange={onSelect}
                    value={selected.location}
                >
                    {optionComponents}
                </select>
            </div>
        </div>
    )
}

function ButtonSelect(props: {}) {
    return <div/>;
}

function NormalSelect(props: {}) {
    return <div/>;
}
