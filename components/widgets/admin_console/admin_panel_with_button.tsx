// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
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

AdminPanelWithButton.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string.isRequired,
    id: PropTypes.string,
    titleId: PropTypes.string.isRequired,
    titleDefault: PropTypes.string.isRequired,
    subtitleId: PropTypes.string.isRequired,
    subtitleDefault: PropTypes.string.isRequired,
    onButtonClick: PropTypes.func,
    disabled: PropTypes.bool,
    buttonTextId: PropTypes.string,
    buttonTextDefault: PropTypes.string,
};

AdminPanelWithButton.defaultProps = {
    className: '',
};

export default AdminPanelWithButton;
