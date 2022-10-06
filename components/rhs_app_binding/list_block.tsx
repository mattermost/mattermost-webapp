// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AppBinding} from '@mattermost/types/apps';

import {handleBindingClick} from 'actions/apps';

import ActionsMenu from './actions_menu';
import {CommonProps} from './common_props';
import Icon from './icon';

export default function ListBlock(props: CommonProps) {
    return (
        <div>
            <h3>{props.binding.label}</h3>
            <div>
                {props.binding.bindings?.map((b) => (
                    <ListItem
                        {...props}
                        key={b.label}
                        binding={b}
                    />
                ))}
            </div>
        </div>
    );
}

export function ListItem(props: CommonProps) {
    const dispatch = useDispatch();

    const choseAction = (b: AppBinding) => {

    };

    let actionsMenu;
    const actions = props.binding.bindings?.find((b) => b.type === 'actions');
    if (actions) {
        const centerActionsButton = props.binding.bindings?.length === 1;
        actionsMenu = (
            <div
                style={{
                    position: 'absolute',
                    right: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                }}
            >
                <ActionsMenu
                    {...props}
                    binding={actions}
                    centerButton={centerActionsButton}
                />
            </div>
        );
    }

    let iconComponent;
    if (props.binding.icon) {
        iconComponent = (
            <div style={{display: 'inline-block'}}>
                <Icon
                    width={'24px'}
                    src={props.binding.icon}
                />
            </div>
        )
    }

    const childBindings = props.binding.bindings?.filter((b) => b.type !== 'actions').map((b) => {
        return (
            <span
                key={b.label}
                style={styles.border}
            >
                {b.label}
            </span>
        );
    });

    const title = (
        <h4>
            {props.binding.label}
        </h4>
    );

    const description = props.binding.description && (
        <p>
            {props.binding.description}
        </p>
    );

    const textContent = (
        <div style={{display: 'inline-block'}}>
            {title}
            {description}
        </div>
    );

    const listItemStyle: CSSProperties = {
        ...styles.border,
        position: 'relative',
        minHeight: '65px',
    }

    if (props.binding.submit) {
        listItemStyle.cursor = 'pointer';
    }

    return (
        <div
            style={listItemStyle}
            onClick={() => {
                if (props.binding.submit) {
                    props.handleBindingClick(props.binding);
                }
            }}
        >
            {actionsMenu}
            {iconComponent}
            {textContent}
            {childBindings}
        </div>
    );
}

const styles = {
    border: {
        border: '1px solid',
    },
};
