// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

export default class GroupProfile extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string.isRequired,
        mention: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    };

    render = () => {
        const {name, mention, description} = this.props;

        return (
            <div className='group-profile'>
                <div className='group-profile-field'>
                    <label>
                        <FormattedMessage
                            id='admin.group_settings.group_details.group_profile.name'
                            defaultMessage='Name:'
                        />
                    </label>
                    <input
                        type='text'
                        className='form-control'
                        value={name}
                        disabled={true}
                    />
                </div>

                <div className='group-profile-field'>
                    <label>
                        <FormattedMessage
                            id='admin.group_settings.group_details.group_profile.mention'
                            defaultMessage='Mention:'
                        />
                    </label>
                    <input
                        type='text'
                        className='form-control'
                        value={'@' + mention}
                        disabled={true}
                    />
                </div>

                <div className='group-profile-field'>
                    <label>
                        <FormattedMessage
                            id='admin.group_settings.group_details.group_profile.description'
                            defaultMessage='Description:'
                        />
                    </label>
                    <textarea
                        className='form-control'
                        disabled={true}
                        value={description}
                    />
                </div>
            </div>
        );
    };
}
