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
        hasMention: false,
    };

    static propTypes = {
        src: PropTypes.string.isRequired,
        status: PropTypes.string,
        width: PropTypes.string,
        height: PropTypes.string,
        userId: PropTypes.string,
        username: PropTypes.string,
        isBusy: PropTypes.bool,
        isRHS: PropTypes.bool,
        hasMention: PropTypes.bool,
        helperClass: PropTypes.string,
    };

    hideProfilePopover = () => {
        this.refs.overlay.hide();
    }

    render() {
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
                            src={this.props.src}
                            isBusy={this.props.isBusy}
                            hide={this.hideProfilePopover}
                            isRHS={this.props.isRHS}
                            hasMention={this.props.hasMention}
                        />
                    }
                >
                    <span className={`status-wrapper ${this.props.helperClass}`}>
                        <img
                            className='more-modal__image rounded'
                            alt={`${this.props.username || 'user'} profile image`}
                            width={this.props.width}
                            height={this.props.width}
                            src={this.props.src}
                        />
                        <StatusIcon status={this.props.status}/>
                    </span>
                </OverlayTrigger>
            );
        }
        return (
            <span className='status-wrapper'>
                <img
                    className='more-modal__image rounded'
                    alt=''
                    width={this.props.width}
                    height={this.props.width}
                    src={this.props.src}
                />
                <StatusIcon status={this.props.status}/>
            </span>
        );
    }
}
