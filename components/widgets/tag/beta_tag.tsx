// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {useIntl} from 'react-intl';

import Tag from './tag';

type Props = {
    className?: string;
}

const BetaTag = ({className = ''}: Props) => {
    const {formatMessage} = useIntl();
    return (
        <Tag
            uppercase={true}
            variant='info'
            className={classNames('BetaTag', className)}
            text={formatMessage({
                id: 'tag.default.beta',
                defaultMessage: 'BETA',
            })}
        />
    );
};

export default BetaTag;
