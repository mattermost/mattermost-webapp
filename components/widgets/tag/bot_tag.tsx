// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {useIntl} from 'react-intl';

import Tag from './tag';

type Props = {
    className?: string;
}

const BotTag = ({className = ''}: Props) => {
    const {formatMessage} = useIntl();
    return (
        <Tag
            className={classNames('BotTag', className)}
            text={formatMessage({
                id: 'post_info.bot',
                defaultMessage: 'BOT',
            })}
        />
    );
};

export default BotTag;
