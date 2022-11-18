// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {CheckCircleOutlineIcon} from '@mattermost/compass-icons/components';

import './post_acknowledgement_button.scss';

type Props = {
    count: number;
    hasAcknowledged: boolean;
}

function AcknowledgementButton({count, hasAcknowledged}: Props) {
    return (
        <button
            className={classNames({
                AcknowledgementButton: true,
                'AcknowledgementButton--acked': hasAcknowledged,
            })}
        >
            <>
                <CheckCircleOutlineIcon size={16}/>
                {count > 0 ? count : (
                    <FormattedMessage
                        id={'post_priority.button.acknowledge'}
                        defaultMessage={'Acknowledge'}
                    />
                )}
            </>
        </button>
    );
}

export default memo(AcknowledgementButton);
