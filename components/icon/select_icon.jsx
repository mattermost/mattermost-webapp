// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

export default class SelectIcon extends React.PureComponent {
    render() {
        return (
            <FormattedMessage
                id='generic_icons.select'
                defaultMessage='Select Icon'
            >
                {(title) => (
                    <i
                        className='fa fa fa-plus-square'
                        title={title}
                    />
                )}
            </FormattedMessage>
        );
    }
}
