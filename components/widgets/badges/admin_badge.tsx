// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Badge from './badge';

type Props = {
    className?: string;
    show?: boolean;
};

const AdminBadge = (props: Props) => (
    <Badge
        className={'AdminBadge ' + props.className}
        show={props.show}
    >
        <FormattedMessage
            id='post_info.admim'
            defaultMessage='ADMIN'
        />
    </Badge>
);

AdminBadge.defaultProps = {
    show: true,
    className: '',
};

export default AdminBadge;
