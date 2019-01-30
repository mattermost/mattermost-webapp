// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

export default class SearchIcon extends React.PureComponent {
    render() {
        return (
            <FormattedMessage
                id='generic_icons.search'
                defaultMessage='Search Icon'
            >
                {(title) => (
                    <i
                        className='fa fa-search'
                        title={title}
                    />
                )}
            </FormattedMessage>
        );
    }
}
