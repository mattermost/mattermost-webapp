// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';

import OverlayTrigger, {BaseOverlayTrigger} from 'components/overlay_trigger';
import ProfilePopover from 'components/profile_popover';
import StatusIcon from 'components/status_icon';
import Avatar from 'components/widgets/users/avatar';

import './profile_picture.scss';

interface MMOverlayTrigger extends BaseOverlayTrigger {
    hide: () => void;
}

type Props = {
    hasMention?: boolean;
    isBusy?: boolean;
    isEmoji?: boolean;
    isRHS?: boolean;
    profileSrc?: string;
    size?: ComponentProps<typeof Avatar>['size'];
    src: string;
    status?: string;
    userId?: string;
    username?: string;
    wrapperClass?: string;
    overwriteIcon?: string;
    overwriteName?: string;
}

export default class ProfilePicture extends React.PureComponent<Props> {
    public static defaultProps = {
        size: 'md',
        isRHS: false,
        isEmoji: false,
        hasMention: false,
        wrapperClass: '',
    };

    overlay = React.createRef<MMOverlayTrigger>();

    public hideProfilePopover = () => {
        if (this.overlay.current) {
            this.overlay.current.hide();
        }
    }

    public render() {
        // profileSrc will, if possible, be the original user profile picture even if the icon
        // for the post is overriden, so that the popup shows the user identity
        const profileSrc = (typeof this.props.profileSrc === 'string' && this.props.profileSrc !== '') ?
            this.props.profileSrc :
            this.props.src;

        const profileIconClass = `profile-icon ${this.props.isEmoji ? 'emoji' : ''}`;

        if (this.props.userId) {
            return (
                <OverlayTrigger
                    ref={this.overlay}
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
                            overwriteIcon={this.props.overwriteIcon}
                            overwriteName={this.props.overwriteName}
                        />
                    }
                >
                    <button
                        className={`status-wrapper style--none ${this.props.wrapperClass}`}
                        tabIndex={-1}
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
