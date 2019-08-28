// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import AdminPanel from './admin_panel';

type Props = {
    children?: React.ReactNode;
    className: string;
    id?: string;
    titleId: string;
    titleDefault: string;
    subtitleId: string;
    subtitleDefault: string;
    url: string;
    disabled: boolean;
    linkTextId: string;
    linkTextDefault: string;
}

const AdminPanelWithLink = (props: Props) => {
    const button = (
        <Link
            className='btn btn-primary'
            to={props.url}
            onClick={props.disabled ? (e) => e.preventDefault() : () => null}
        >
            <FormattedMessage
                id={props.linkTextId}
                defaultMessage={props.linkTextDefault}
            />
        </Link>
    );

    return (
        <AdminPanel
            className={'AdminPanelWithLink ' + props.className}
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

AdminPanelWithLink.defaultProps = {
    className: '',
};

export default AdminPanelWithLink;
