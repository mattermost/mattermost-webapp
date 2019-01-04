// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import AdminPanel from './admin_panel.jsx';

const AdminPanelWithButton = (props) => {
    let button = null;
    if (props.url) {
        button = (
            <Link
                className='btn btn-primary'
                to={props.url}
                disabled={props.disabled}
            >
                <FormattedMessage
                    id={props.buttonTextId}
                    defaultMessage={props.buttonTextDefault}
                />
            </Link>
        );
    } else if (props.onButtonClick) {
        button = (
            <a
                className='btn btn-primary'
                onClick={props.onButtonClick}
                disabled={props.disabled}
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
    url: PropTypes.string,
    onButtonClick: PropTypes.func,
    disabled: PropTypes.bool,
    buttonTextId: PropTypes.string,
    buttonTextDefault: PropTypes.string,
};

AdminPanelWithButton.defaultProps = {
    className: '',
};

export default AdminPanelWithButton;
