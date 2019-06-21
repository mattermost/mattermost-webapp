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
                <h4 id='noResultsMessage'>
                    <FormattedMessage
                        id='search_results.noResults'
                        defaultMessage='No results found. Try again?'
                    />
                </h4>
                <ul>
                    <li>
                        <FormattedMessage
                            id='search_results.noResults.partialPhraseSuggestion'
                            defaultMessage='If you&#39;re searching a partial phrase (ex. searching "rea", looking for "reach" or "reaction"), append a * to your search term.'
                        />
                    </li>
                    <li>
                        <FormattedMessage
                            id='search_results.noResults.stopWordsSuggestion'
                            defaultMessage='Two letter searches and common words like "this", "a" and "is" won&#39;t appear in search results due to the excessive results returned.'
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
