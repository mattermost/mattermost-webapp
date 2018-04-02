// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';

import {displayEntireNameForUser} from 'utils/utils.jsx';

import ProfilePicture from 'components/profile_picture.jsx';

export default class Option extends PureComponent {
    static propTypes = {

        /**
         * Current user's ID
         */
        currentUserId: PropTypes.string,

        /**
         * True if the option (user) is already selected
         */
        isSelected: PropTypes.bool.isRequired,

        /**
         * Function to add the option (user)
         */
        onAdd: PropTypes.func.isRequired,

        /**
         * Profile picture of option (user)
         */
        profilePicture: PropTypes.string.isRequired,

        /**
         * Show email of option (user)
         */
        showEmail: PropTypes.bool,

        /**
         * Status of option (user); null if user is deactivated
         */
        status: PropTypes.string,

        /**
         * Option is typically a user object
         */
        option: PropTypes.object.isRequired,
    };

    static defaultProps = {
        showEmail: false,
    };

    handleOnClick = () => {
        this.props.onAdd(this.props.option);
    }

    render() {
        const {
            currentUserId,
            isSelected,
            option,
            profilePicture,
            showEmail,
            status,
        } = this.props;

        const displayName = displayEntireNameForUser(option);

        let modalName = displayName;
        if (option.id === currentUserId) {
            modalName = (
                <FormattedMessage
                    id='more_direct_channels.directchannel.you'
                    defaultMessage='{displayname} (you)'
                    values={{
                        displayname: displayName,
                    }}
                />
            );
        } else if (option.delete_at) {
            modalName = (
                <FormattedMessage
                    id='more_direct_channels.directchannel.deactivated'
                    defaultMessage='{displayname} - Deactivated'
                    values={{
                        displayname: displayName,
                    }}
                />
            );
        }

        var rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        return (
            <div
                key={option.id}
                ref={isSelected ? 'selected' : option.id}
                className={'more-modal__row clickable ' + rowSelected}
                onClick={this.handleOnClick}
            >
                <ProfilePicture
                    src={profilePicture}
                    status={status}
                    width='32'
                    height='32'
                />
                <div
                    className='more-modal__details'
                >
                    <div className='more-modal__name'>
                        {modalName}
                    </div>
                    {showEmail &&
                        <div className='more-modal__description'>
                            {option.email}
                        </div>
                    }
                </div>
                <div className='more-modal__actions'>
                    <div className='more-modal__actions--round'>
                        <i className='fa fa-plus'/>
                    </div>
                </div>
            </div>
        );
    }
}
