// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

type Props = {
    withTitle?: boolean;
}

export default class SearchHint extends PureComponent<Props> {
    public render() {
        return (
            <React.Fragment>
                {this.props.withTitle &&
                <h4>
                    <FormattedMessage
                        id='search_bar.usage.title'
                        defaultMessage='Search Options'
                    />
                </h4>
                }
                <FormattedMarkdownMessage
                    id='search_bar.usage.tips'
                    defaultMessage='* Use **"quotation marks"** to search for phrases\n* Use **from:** to find posts from specific users\n * Use **in:** to find posts in specific channels\n* Use **on:** to find posts on a specific date\n* Use **before:** to find posts before a specific date\n* Use **after:** to find posts after a specific date\n* Use **dash** "-" to exclude search terms and modifiers'
                />
            </React.Fragment>
        );
    }
}
