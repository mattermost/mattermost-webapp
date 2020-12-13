// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';

import {UserProfile as UserProfileType} from 'mattermost-redux/types/users';

import {imageURLForUser, isMobile, isGuest} from 'utils/utils.jsx';

import OverlayTrigger, {HideableOverlayTrigger} from 'components/overlay_trigger';
import ProfilePopover from 'components/profile_popover';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';

export type UserProfileProps = {
    displayName?: string,
    isBusy?: boolean,
    overwriteName?: React.ReactNode,
    overwriteIcon?: React.ReactNode,
    userId: string,
    user?:UserProfileType,
} & Partial<UserProfileDefaultProps>

type UserProfileDefaultProps = {
    disablePopover: boolean,
    displayUsername: boolean,
    hasMention: boolean,
    hideStatus: boolean,
    isRHS: boolean,
    overwriteImage: React.ReactNode,
    overwriteName: React.ReactNode,
    userId: string,
}

export default class UserProfile extends PureComponent<UserProfileProps> {
    private overlay?: HideableOverlayTrigger;

    static defaultProps: UserProfileDefaultProps = {
        disablePopover: false,
        displayUsername: false,
        hasMention: false,
        hideStatus: false,
        isRHS: false,
        overwriteImage: '',
        overwriteName: '',
        userId: '',
    }

    hideProfilePopover = (): void => {
        if (this.overlay) {
            this.overlay.hide();
        }
    }

    setOverlaynRef = (ref: HideableOverlayTrigger): void => {
        this.overlay = ref;
    }

    render(): React.ReactNode {
        const {
            disablePopover,
            displayName,
            displayUsername,
            isBusy,
            isRHS,
            hasMention,
            hideStatus,
            overwriteName,
            overwriteIcon,
            user,
            userId,
        } = this.props;

        let name: React.ReactNode;
        if (user && displayUsername) {
            name = `@${(user.username)}`;
        } else {
            name = overwriteName || displayName || '...';
        }

        const ariaName: string = typeof name === 'string' ? name.toLowerCase() : '';

        if (disablePopover) {
            return <div className='user-popover'>{name}</div>;
        }

        let placement = 'right';
        if (isRHS && !isMobile()) {
            placement = 'left';
        }

        let profileImg = '';
        if (user) {
            profileImg = imageURLForUser(user.id, user.last_picture_update);
        }

        return (
            <React.Fragment>
                <OverlayTrigger
                    ref={this.setOverlaynRef}
                    trigger='click'
                    placement={placement}
                    rootClose={true}
                    overlay={
                        <ProfilePopover
                            className='user-profile-popover'
                            userId={userId}
                            src={profileImg}
                            isBusy={isBusy}
                            hide={this.hideProfilePopover}
                            hideStatus={hideStatus}
                            isRHS={isRHS}
                            hasMention={hasMention}
                            overwriteName={overwriteName}
                            overwriteIcon={overwriteIcon}
                        />
                    }
                >
                    <button
                        aria-label={ariaName}
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
