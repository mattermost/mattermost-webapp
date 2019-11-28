// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import FlagIcon from 'components/widgets/icons/flag_icon';

import DataRetentionHint from './data_retention_hint';

export default class FlagPostSearchHint extends PureComponent {
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
                            id='search_results.usageFlag1'
                            defaultMessage="You haven't flagged any messages yet."
                        />
                    </li>
                    <li>
                        <FormattedMessage
                            id='search_results.usageFlag2'
                            defaultMessage='You can add a flag to messages and comments by clicking the {flagIcon} icon next to the timestamp.'
                            values={{
                                flagIcon: <FlagIcon className='usage__icon'/>,
                            }}
                        />
                    </li>
                    <li>
                        <FormattedMessage
                            id='search_results.usageFlag4'
                            defaultMessage='Flags are a way to mark messages for follow up. Your flags are personal, and cannot be seen by other users.'
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
