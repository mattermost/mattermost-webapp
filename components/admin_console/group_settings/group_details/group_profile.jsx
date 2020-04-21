// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

export default class GroupProfile extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        titleDefault: PropTypes.string.isRequired,
        customID: PropTypes.string,
        isDisabled: PropTypes.bool.isRequired,
        showAtMention: PropTypes.bool.isRequired,
        onChange: PropTypes.func,
    };

    render = () => {
        const {name, title, titleDefault, customID, isDisabled, showAtMention, onChange} = this.props;

        return (
            <div
                className='group-profile form-horizontal'
                id={customID}
            >
                <div className='group-profile-field form-group mb-0'>
                    <label className='control-label col-sm-4'>
                        <FormattedMessage
                            id={title}
                            defaultMessage={titleDefault}
                        />
                    </label>
                    <div className='col-sm-8'>
                        <div className='input-icons'>
                            {showAtMention && <i className='fa icon'>{'@'}</i>}
                            <input
                                type='text'
                                id={customID}
                                className='form-control group_at_mention_input'
                                value={name}
                                disabled={isDisabled}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}
