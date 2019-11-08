// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger} from 'react-bootstrap';

import ProfilePopover from 'components/profile_popover';
import StatusIcon from 'components/status_icon';
import Avatar from 'components/widgets/users/avatar';

export default class ProfilePicture extends React.PureComponent {
    static defaultProps = {
        size: 'md',
        isRHS: false,
        isEmoji: false,
        hasMention: false,
        wrapperClass: '',
    };

    static propTypes = {
        src: PropTypes.string.isRequired,
        profileSrc: PropTypes.string,
        status: PropTypes.string,
        size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'xxl']),
        userId: PropTypes.string,
        username: PropTypes.string,
        isBusy: PropTypes.bool,
        isRHS: PropTypes.bool,
        hasMention: PropTypes.bool,
        isEmoji: PropTypes.bool,
        wrapperClass: PropTypes.string,
    };

    hideProfilePopover = () => {
        if (this.overlay) {
            this.overlay.hide();
        }
    }

    setOverlayRef = (ref) => {
        this.overlay = ref;
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
                    ref={this.setOverlayRef}
                    trigger='click'
                    placement='right'
                    rootClose={true}
                    overlay={
                        <ProfilePopover
                            className='user-profile-popover'
                            userId={this.props.userId}
                            src={profileSrc}
                            isBusy={this.props.isBusy}
                            hide={this.hideProfilePopover}
                            isRHS={this.props.isRHS}
                            hasMention={this.props.hasMention}
                        />
                    }
                >
                    <button
                        className={`status-wrapper style--none ${this.props.wrapperClass}`}
                        tabIndex='-1'
                    >
                        <span className={profileIconClass}>
                            <Avatar
                                username={this.props.username}
                                size={this.props.size}
                                url={this.props.src}
                            />
                        </span>
                        <StatusIcon status={this.props.status}/>
                    </button>
                </OverlayTrigger>
            );
        }
        return (
            <span className='status-wrapper'>
                <span className={profileIconClass}>
                    <Avatar
                        size={this.props.size}
                        url={this.props.src}
                    />
                </span>
                <StatusIcon status={this.props.status}/>
            </span>
        );
    }
}
