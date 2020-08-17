// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FunctionComponent} from 'react';
import moment from 'moment-timezone';
import {Unit} from '@formatjs/intl-relativetimeformat';

import Timestamp from 'components/timestamp/timestamp';
type Props = {
    lastPostAt?: number;
}

export const LastPostAt: FunctionComponent<Props> = ({lastPostAt}: Props): JSX.Element | null => {
    if (!lastPostAt) {
        return null;
    }

    return (
        <Timestamp
            value={lastPostAt}
            useTime={false}
            style={'long'}
            ranges={[
                {within: ['minute', -1], display: ['second', 0]},
                {within: ['hour', -1], display: ['minute']},
                {within: ['hour', -24], display: ['hour']},
                {within: ['day', -30], display: ['day']},
                {within: ['month', -11], display: ['month']},
                {within: ['year', -1000], display: ['year']},
            ]}
        />

    );
};