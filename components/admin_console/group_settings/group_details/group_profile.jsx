// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import MentionsIcon from 'components/widgets/icons/mentions_icon';

export default class GroupProfile extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string,
        title: PropTypes.string.isRequired,
        titleDefault: PropTypes.string.isRequired,
        customID: PropTypes.string,
        isDisabled: PropTypes.bool,
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
                        <div className='icon-over-input'>
                            {showAtMention &&
                                <MentionsIcon
                                    className='icon icon__mentions'
                                    aria-hidden='true'
                                />
                            }
                        </div>
                        <input
                            type='text'
                            className='form-control group-at-mention-input'
                            value={name}
                            disabled={isDisabled}
                            onChange={onChange}
                        />
                    </div>
                </div>
            </div>
        );
    };
}
