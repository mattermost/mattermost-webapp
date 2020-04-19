// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

export default class GroupProfile extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string.isRequired,
    };

    render = () => {
        const {name} = this.props;

        return (
            <div className='group-profile form-horizontal'>
                <div className='group-profile-field form-group mb-0'>
                    <label className='control-label col-sm-4'>
                        <FormattedMessage
                            id='admin.group_settings.group_details.group_profile.name'
                            defaultMessage='Name:'
                        />
                    </label>
                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            value={name}
                            disabled={true}
                        />
                    </div>
                </div>
            </div>
        );
    };
}
