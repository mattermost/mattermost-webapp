// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import {AlertOutlineIcon, AlertCircleOutlineIcon} from '@mattermost/compass-icons/components';

import {PostPriority} from '@mattermost/types/posts';

import Badge, {BadgeSize} from 'components/widgets/badges/badge';

type Props = {
    priority?: PostPriority;
    size?: BadgeSize;
    uppercase?: boolean;
}

const NoSpaceBadge = styled(Badge)`
    margin-left: 0;
`;

export default function PriorityLabel({
    priority,
    size = 'xs',
}: Props) {
    const {formatMessage} = useIntl();

    const iconSize = useMemo(() => {
        switch (size) {
        case 'xs':
            return 10;
        case 'sm':
            return 12;
        case 'md':
            return 14;
        case 'lg':
            return 16;
        default:
            return 10;
        }
    }, [size]);

    if (priority === PostPriority.URGENT) {
        return (
            <NoSpaceBadge
                size={size}
                uppercase={true}
                variant='danger'
                icon={(
                    <AlertOutlineIcon
                        color={'currentColor'}
                        size={iconSize}
                    />
                )}
            >
                {formatMessage({id: 'post_priority.priority.urgent', defaultMessage: 'URGENT'})}
            </NoSpaceBadge>
        );
    }

    if (priority === PostPriority.IMPORTANT) {
        return (
            <NoSpaceBadge
                size={size}
                uppercase={true}
                variant='info'
                icon={(
                    <AlertCircleOutlineIcon
                        color={'currentColor'}
                        size={12}
                    />
                )}
            >
                {formatMessage({id: 'post_priority.priority.important', defaultMessage: 'IMPORTANT'})}
            </NoSpaceBadge>
        );
    }

    return null;
}
