// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import ColorHash from 'color-hash';
import ColorContrastChecker from 'color-contrast-checker';

import {UserProfile as UserProfileType} from '@mattermost/types/users';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import {imageURLForUser, isMobile} from 'utils/utils';
import LocalStorageStore from 'stores/local_storage_store';

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
    colorize?: boolean;
    hasMention?: boolean;
    hideStatus?: boolean;
    isRHS?: boolean;
    overwriteImage?: React.ReactNode;
    channelId?: string;
    theme?: Theme;
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
        colorize: false,
    }

    hideProfilePopover = (): void => {
        if (this.overlay) {
            this.overlay.hide();
        }
    }

    setOverlaynRef = (ref: BaseOverlayTrigger): void => {
        this.overlay = ref;
    }

    generateColor = (username: string, background: string): string => {
        const cacheKey = `${username}-${background}`;
        const cachedColor = LocalStorageStore.getItem(cacheKey);
        if (cachedColor !== null) {
            return cachedColor;
        }

        let userColor = background;
        let userAndSalt = username;
        const checker = new ColorContrastChecker();
        const colorHash = new ColorHash();

        let tries = 3;
        while (!checker.isLevelCustom(userColor, background, 4.5) && tries > 0) {
            userColor = colorHash.hex(userAndSalt);
            userAndSalt += 'salt';
            tries--;
        }

        LocalStorageStore.setItem(cacheKey, userColor);
        return userColor;
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
            colorize,
            theme,
        } = this.props;

        let name: React.ReactNode;
        if (user && displayUsername) {
            name = `@${(user.username)}`;
        } else {
            name = overwriteName || displayName || '...';
        }

        const ariaName: string = typeof name === 'string' ? name.toLowerCase() : '';

        let userColor = '#000000';
        if (user && theme) {
            userColor = this.generateColor(user.username, theme.centerChannelBg);
        }

        let userStyle;
        if (colorize) {
            userStyle = {color: userColor};
        }

        if (disablePopover) {
            return (
                <div
                    className='user-popover'
                    style={userStyle}
                >{name}</div>
            );
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
                        style={userStyle}
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
