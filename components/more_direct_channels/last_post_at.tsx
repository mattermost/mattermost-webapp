// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FunctionComponent} from 'react';

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
            style='long' //eslint-disable-line react/style-prop-object
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
