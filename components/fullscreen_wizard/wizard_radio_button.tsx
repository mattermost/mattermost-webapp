// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './wizard_radio_button.scss';

type Props = {
    onClick: () => void;
    icon: JSX.Element;
    msg: JSX.Element;
    checked: boolean;
    tooltip?: string;
}
const WizardRadioButton = (props: Props) => {
    const buttonProps: {
        className: string;
        onClick: () => void;
        tooltip?: string;
    } = {
        className: 'WizardRadioButton',
        onClick: props.onClick,
    };
    if (props.tooltip) {
        buttonProps.tooltip = props.tooltip;
    }
    return (
        <li
            {...buttonProps}
        >
            {props.icon}
            {props.msg}
            {props.checked && 'checked'}
        </li>
    );
};

export default WizardRadioButton;
