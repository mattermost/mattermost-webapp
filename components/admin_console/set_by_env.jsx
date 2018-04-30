// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default function() {
    return (
        <div className='alert alert-warning'>
            <FormattedMessage
                id='admin.set_by_env'
                defaultMessage='This setting has been set through an environment variable and cannot be changed. It cannot be changed through the System Console.'
            />
        </div>
    );
}
