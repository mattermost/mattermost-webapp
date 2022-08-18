// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {AlertOutlineIcon, AlertCircleOutlineIcon} from '@mattermost/compass-icons/components';

import Label, {LabelType} from 'components/label/label';

type Props = {
    type?: ''|'urgent'|'important';
}
export default function PriorityLabel({type}: Props) {
    const {formatMessage} = useIntl();

    if (type === 'urgent') {
        return (
            <Label
                type={LabelType.Danger}
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

    if (type === 'important') {
        return (
            <Label
                type={LabelType.PrimaryFaded}
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
