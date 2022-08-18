// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {AlertOutlineIcon, AlertCircleOutlineIcon} from '@mattermost/compass-icons/components';

import {PostPriority} from '@mattermost/types/posts';

import Label, {LabelType} from 'components/label/label';

type Props = {
    priority?: PostPriority;
}

export default function PriorityLabel({priority}: Props) {
    const {formatMessage} = useIntl();

    if (priority === PostPriority.URGENT) {
        return (
            <Label
                variant={LabelType.Danger}
                icon={(
                    <AlertOutlineIcon
                        color={'currentColor'}
                        size={12}
                    />
                )}
            >
                {formatMessage({id: 'post_priority.priority.urgent', defaultMessage: 'URGENT'})}
            </Label>
        );
    }

    if (priority === PostPriority.IMPORTANT) {
        return (
            <Label
                variant={LabelType.PrimaryFaded}
                icon={(
                    <AlertCircleOutlineIcon
                        color={'currentColor'}
                        size={12}
                    />
                )}
            >
                {formatMessage({id: 'post_priority.priority.important', defaultMessage: 'IMPORTANT'})}
            </Label>
        );
    }

    return null;
}
