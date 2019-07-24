// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger} from 'react-bootstrap';

import ProfilePopover from 'components/profile_popover';
import StatusIcon from 'components/status_icon';

export default class ProfilePicture extends React.PureComponent {
    static defaultProps = {
        width: '36',
        height: '36',
        isRHS: false,
        isEmoji: false,
        hasMention: false,
        wrapperClass: '',
    };

    static propTypes = {
        src: PropTypes.string.isRequired,
        profileSrc: PropTypes.string,
        status: PropTypes.string,
        width: PropTypes.string,
        height: PropTypes.string,
        userId: PropTypes.string,
        username: PropTypes.string,
        isBusy: PropTypes.bool,
        isRHS: PropTypes.bool,
        hasMention: PropTypes.bool,
        isEmoji: PropTypes.bool,
        wrapperClass: PropTypes.string,
    };

    hideProfilePopover = () => {
        this.refs.overlay.hide();
    }

    render() {
        // profileSrc will, if possible, be the original user profile picture even if the icon
        // for the post is overriden, so that the popup shows the user identity
        const profileSrc = (typeof this.props.profileSrc === 'string' && this.props.profileSrc !== '') ?
            this.props.profileSrc :
            this.props.src;

        const profileIconClass = `profile-icon ${this.props.isEmoji ? 'emoji' : ''}`;

        if (this.props.userId) {
            return (
                <OverlayTrigger
                    ref='overlay'
                    trigger='click'
                    placement='right'
                    rootClose={true}
                    overlay={
                        <ProfilePopover
                            userId={this.props.userId}
                            src={profileSrc}
                            isBusy={this.props.isBusy}
                            hide={this.hideProfilePopover}
                            isRHS={this.props.isRHS}
                            hasMention={this.props.hasMention}
                        />
                    }
                >
                    <span className={`status-wrapper ${this.props.wrapperClass}`}>
                        <span className={profileIconClass}>
                            <img
                                className='more-modal__image'
                                alt={`${this.props.username || 'user'} profile image`}
                                width={this.props.width}
                                height={this.props.width}
                                src={this.props.src}
                            />
                        </span>
                        <StatusIcon status={this.props.status}/>
                    </span>
                </OverlayTrigger>
            );
        }
        return (
            <span className='status-wrapper'>
                <span className={profileIconClass}>
                    <img
                        className='more-modal__image'
                        alt=''
                        height={this.props.width}
                        width={this.props.width}
                        src={this.props.src}
                    />
                </span>
                <StatusIcon status={this.props.status}/>
            </span>
        );
    }
}
