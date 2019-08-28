// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Badge from './badge';

type Props = {
    className?: string;
    show?: boolean;
}

const BotBadge: React.FC<Props> = (props: Props) => (
    <Badge
        className={'BotBadge ' + props.className}
        show={props.show}
    >
        <FormattedMessage
            id='post_info.bot'
            defaultMessage='BOT'
        />
    </Badge>
);

BotBadge.defaultProps = {
    show: true,
    className: '',
};

export default BotBadge;
