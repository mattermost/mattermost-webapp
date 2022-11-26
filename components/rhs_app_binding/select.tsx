// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ReactSelect from 'react-select';

import classNames from 'classnames';

import {AppBinding} from '@mattermost/types/apps';

import ActionsMenu from './actions_menu';
import {CommonProps} from './common_props';
import Icon from './icon';

export default function Select(props: CommonProps) {
    const variants: Record<string, React.ElementType> = {
        categories: CategoriesSelect,
        button_select: ButtonSelect,
        select: NormalSelect,
    };

    let variant = props.binding.subtype;
    if (!variant) {
        variant = 'select';
    }

    const SelectVariant = variants[variant];
    if (!SelectVariant) {
        return <span>{'unknown variant ' + variant}</span>;
    }

    return (
        <div className='mm-app-bar-rhs-binding-select'>
            <SelectVariant {...props}/>
        </div>
    );
}

export function SelectOption(props: CommonProps) {
    let actionsMenu;
    const actionsBinding = props.binding.bindings?.find((b) => b.type === 'actions');
    if (actionsBinding) {
        actionsMenu = (
            <ActionsMenu
                {...props}
                binding={actionsBinding}
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
    }, [options, selected]);

    const onSelect = useCallback((value) => {
        const option = options?.find((opt) => opt.location === value.value);
        if (!option) {
            return;
        }

        setSelected(option);

        props.handleBindingClick(option);
    }, [options, props.handleBindingClick]);

    const selectOptions = useMemo(() => {
        if (!options) {
            return [];
        }

        return options.map((b) => ({
            value: b.location,
            label: b.label,
        }));
    }, [options]);

    if (!options?.length) {
        return <span>{'No select options provided'}</span>;
    }

    const selectedOption = selectOptions.find((opt) => opt.value === selected?.location);

    return (
        <div>
            <div>
                <ReactSelect
                    className='react-select react-select-top'
                    classNamePrefix='react-select'
                    id='displayTimezone'
                    menuPortalTarget={document.body}
                    styles={reactStyles}
                    options={selectOptions}
                    clearable={false}
                    onChange={onSelect}
                    value={selectedOption}
                />
            </div>
        </div>
    );
}

function ButtonSelect() {
    return <div/>;
}

function NormalSelect() {
    return <div/>;
}

const reactStyles = {
    menuPortal: (provided: React.CSSProperties) => ({
        ...provided,
        zIndex: 9999,
    }),

};
