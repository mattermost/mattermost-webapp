// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';

import {UserProfile as UserProfileType} from 'mattermost-redux/types/users';

import {imageURLForUser, isMobile, isGuest} from 'utils/utils.jsx';

import OverlayTrigger, {BaseOverlayTrigger} from 'components/overlay_trigger';
import ProfilePopover from 'components/profile_popover';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';

export type UserProfileProps = {
    userId: string;
    displayName?: string;
    isBusy?: boolean;
    overwriteName?: React.ReactNode;
    overwriteIcon?: React.ReactNode;
    user?: UserProfileType;
    disablePopover?: boolean;
    displayUsername?: boolean;
    hasMention?: boolean;
    hideStatus?: boolean;
    isRHS?: boolean;
    overwriteImage?: React.ReactNode;
}

export default class UserProfile extends PureComponent<UserProfileProps> {
    private overlay?: BaseOverlayTrigger;

    static defaultProps: Partial<UserProfileProps> = {
        disablePopover: false,
        displayUsername: false,
        hasMention: false,
        hideStatus: false,
        isRHS: false,
        overwriteImage: '',
        overwriteName: '',
    }

    hideProfilePopover = (): void => {
        if (this.overlay) {
            this.overlay.hide();
        }
    }

    setOverlaynRef = (ref: BaseOverlayTrigger): void => {
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
