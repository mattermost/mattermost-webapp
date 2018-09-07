// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

export default class DataRetentionHint extends PureComponent {
    static propTypes = {
        dataRetentionMessageRetentionDays: PropTypes.string,
    }

    render() {
        return (
            <li>
                <FormattedMessage
                    id='search_results.usage.dataRetention'
                    defaultMessage='Only messages posted in the last {days} days are returned. Contact your System Administrator for more detail.'
                    values={{
                        days: this.props.dataRetentionMessageRetentionDays,
                    }}
                />
            </li>
        );
    }
}
