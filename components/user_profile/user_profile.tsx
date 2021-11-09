// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';

import {UserProfile as UserProfileType} from 'mattermost-redux/types/users';

import {imageURLForUser, isMobile} from 'utils/utils.jsx';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import OverlayTrigger, {BaseOverlayTrigger} from 'components/overlay_trigger';
import ProfilePopover from 'components/profile_popover';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';
import SharedUserIndicator from 'components/shared_user_indicator';

export type UserProfileProps = {
    userId: string;
    displayName?: string;
    isBusy?: boolean;
    isShared?: boolean;
    overwriteName?: React.ReactNode;
    overwriteIcon?: string;
    user?: UserProfileType;
    disablePopover?: boolean;
    displayUsername?: boolean;
    hasMention?: boolean;
    hideStatus?: boolean;
    isRHS?: boolean;
    overwriteImage?: React.ReactNode;
    channelId?: string;
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
            isShared,
            hasMention,
            hideStatus,
            overwriteName,
            overwriteIcon,
            user,
            userId,
            channelId,
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

        let sharedIcon;
        if (isShared) {
            sharedIcon = (
                <SharedUserIndicator
                    className='shared-user-icon'
                    withTooltip={true}
                />
            );
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
                            channelId={channelId}
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
                {sharedIcon}
                <BotBadge
                    show={Boolean(user && user.is_bot)}
                    className='badge-popoverlist'
                />
                <GuestBadge
                    show={Boolean(user && isGuest(user.roles))}
                    className='badge-popoverlist'
                />
            </React.Fragment>
        );
    }
}
