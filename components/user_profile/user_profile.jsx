// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {OverlayTrigger} from 'react-bootstrap';

import {imageURLForUser, isMobile, isGuest} from 'utils/utils.jsx';

import ProfilePopover from 'components/profile_popover';
import BotBadge from 'components/widgets/badges/bot_badge.jsx';
import GuestBadge from 'components/widgets/badges/guest_badge.jsx';

export default class UserProfile extends PureComponent {
    static propTypes = {
        disablePopover: PropTypes.bool,
        displayName: PropTypes.string,
        hasMention: PropTypes.bool,
        hideStatus: PropTypes.bool,
        isBusy: PropTypes.bool,
        isRHS: PropTypes.bool,
        overwriteName: PropTypes.node,
        user: PropTypes.object,
        userId: PropTypes.string,
    };

    static defaultProps = {
        disablePopover: false,
        hasMention: false,
        hideStatus: false,
        isRHS: false,
        overwriteImage: '',
        overwriteName: '',
    };

    hideProfilePopover = () => {
        this.refs.overlay.hide();
    }

    render() {
        const {
            disablePopover,
            displayName,
            isBusy,
            isRHS,
            hasMention,
            hideStatus,
            overwriteName,
            user,
            userId,
        } = this.props;

        const name = overwriteName || displayName || '...';
        if (disablePopover) {
            return <div className='user-popover'>{name}</div>;
        }

        let placement = 'right';
        if (isRHS && !isMobile()) {
            placement = 'left';
        }

        let profileImg = '';
        if (user) {
            profileImg = imageURLForUser(user);
        }

        return (
            <React.Fragment>
                <OverlayTrigger
                    ref='overlay'
                    trigger='click'
                    placement={placement}
                    rootClose={true}
                    overlay={
                        <ProfilePopover
                            userId={userId}
                            src={profileImg}
                            isBusy={isBusy}
                            hide={this.hideProfilePopover}
                            hideStatus={hideStatus}
                            isRHS={isRHS}
                            hasMention={hasMention}
                        />
                    }
                >
                    <button
                        aria-label={name.toLowerCase()}
                        className='user-popover style--none'
                    >
                        {name}
                    </button>
                </OverlayTrigger>
                <BotBadge
                    show={Boolean(user && user.is_bot)}
                    className='badge-popoverlist'
                />
                <GuestBadge
                    show={Boolean(user && isGuest(user))}
                    className='badge-popoverlist'
                />
            </React.Fragment>
        );
    }
}
