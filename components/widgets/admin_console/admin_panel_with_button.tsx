// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import AdminPanel from './admin_panel';

type Props = {
    children?: React.ReactNode;
    className: string;
    id?: string;
    titleId: string;
    titleDefault: string;
    subtitleId: string;
    subtitleDefault: string;
    onButtonClick?: React.EventHandler<React.MouseEvent>;
    disabled?: boolean;
    buttonTextId?: string;
    buttonTextDefault?: string;
}

const AdminPanelWithButton: React.FC<Props> = (props: Props) => {
    let button;
    if (props.onButtonClick && props.buttonTextId) {
        button = (
            <a
                className='btn btn-primary'
                onClick={props.disabled ? (e) => e.preventDefault() : props.onButtonClick}
            >
                <FormattedMessage
                    id={props.buttonTextId}
                    defaultMessage={props.buttonTextDefault}
                />
            </a>
        );
    }

    return (
        <AdminPanel
            className={'AdminPanelWithButton ' + props.className}
            id={props.id}
            titleId={props.titleId}
            titleDefault={props.titleDefault}
            subtitleId={props.subtitleId}
            subtitleDefault={props.subtitleDefault}
            button={button}
        >
            {props.children}
        </AdminPanel>
    );
};

AdminPanelWithButton.defaultProps = {
    className: '',
};

export default AdminPanelWithButton;
