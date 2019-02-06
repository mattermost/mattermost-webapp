// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

export default class ReloadIcon extends React.PureComponent {
    render() {
        return (
            <FormattedMessage
                id='generic_icons.reload'
                defaultMessage='Reload Icon'
            >
                {(title) => (
                    <i
                        className='fa fa-refresh'
                        title={title}
                    />
                )}
            </FormattedMessage>
        );
    }
}
