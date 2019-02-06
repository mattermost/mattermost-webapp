// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

export default class EditIcon extends React.PureComponent {
    render() {
        return (
            <FormattedMessage
                id='generic_icons.edit'
                defaultMessage='Edit Icon'
            >
                {(title) => (
                    <i
                        className='fa fa-pencil'
                        title={title}
                    />
                )}
            </FormattedMessage>
        );
    }
}
