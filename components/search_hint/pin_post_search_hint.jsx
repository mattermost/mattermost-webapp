// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import DataRetentionHint from './data_retention_hint';

export default class PinPostSearchHint extends PureComponent {
    static propTypes = {
        dataRetentionEnableMessageDeletion: PropTypes.bool,
        dataRetentionMessageRetentionDays: PropTypes.string,
    }

    render() {
        return (
            <React.Fragment>
                <ul>
                    <li>
                        <FormattedMessage
                            id='search_results.usagePin1'
                            defaultMessage='There are no pinned messages yet.'
                        />
                    </li>
                    <li>
                        <FormattedMessage
                            id='search_results.usagePin2'
                            defaultMessage='All members of this channel can pin important or useful messages.'
                        />
                    </li>
                    <li>
                        <FormattedMessage
                            id='search_results.usagePin3'
                            defaultMessage='Pinned messages are visible to all channel members.'
                        />
                    </li>
                    <li>
                        <FormattedMessage
                            id='search_results.usagePin4'
                            defaultMessage={'To pin a message: Go to the message that you want to pin and click [...] > "Pin to channel".'}
                        />
                    </li>
                    {this.props.dataRetentionEnableMessageDeletion &&
                        <DataRetentionHint dataRetentionMessageRetentionDays={this.props.dataRetentionMessageRetentionDays}/>
                    }
                </ul>
            </React.Fragment>
        );
    }
}
