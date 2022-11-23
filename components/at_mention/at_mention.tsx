// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Overlay} from 'react-bootstrap';

import {Client4} from 'mattermost-redux/client';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {UserProfile} from '@mattermost/types/users';
import {Group} from '@mattermost/types/groups';

import ProfilePopover from 'components/profile_popover';

import {popOverOverlayPosition} from 'utils/position_utils';
import {getUserOrGroupFromMentionName} from 'utils/post_utils';

import AtMentionGroup from 'components/at_mention/at_mention_group';

const spaceRequiredForPopOver = 300;

type Props = {
    currentUserId: string;
    mentionName: string;
    teammateNameDisplay: string;
    usersByUsername: Record<string, UserProfile>;
    groupsByName: Record<string, Group>;
    children?: React.ReactNode;
    channelId?: string;
    hasMention?: boolean;
    disableHighlight?: boolean;
    disableGroupHighlight?: boolean;
    isRHS?: boolean;
}

type State = {
    show: boolean;
    target?: HTMLAnchorElement;
    placement?: string;
}

export default class AtMention extends React.PureComponent<Props, State> {
    overlayRef: React.RefObject<HTMLAnchorElement>;

    static defaultProps: Partial<Props> = {
        isRHS: false,
        hasMention: false,
        disableHighlight: false,
        disableGroupHighlight: false,
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            show: false,
        };

        this.overlayRef = React.createRef();
    }

    handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const targetBounds = this.overlayRef.current?.getBoundingClientRect();

        if (targetBounds) {
            const placement = popOverOverlayPosition(targetBounds, window.innerHeight, spaceRequiredForPopOver);
            this.setState({target: e.target as HTMLAnchorElement, show: !this.state.show, placement});
        }
    }

    hideOverlay = () => {
        this.setState({show: false});
    }

    render() {
        const user = getUserOrGroupFromMentionName(this.props.usersByUsername, this.props.mentionName) as UserProfile | '';

        if (!this.props.disableGroupHighlight && !user) {
            const group = getUserOrGroupFromMentionName(this.props.groupsByName, this.props.mentionName) as Group | '';
            if (group && group.allow_reference) {
                return (<span>
                    <AtMentionGroup group={group}/>
                </span>);
            }
        }

        if (!user) {
            return <React.Fragment>{this.props.children}</React.Fragment>;
        }

        const suffix = this.props.mentionName.substring(user.username.length);

        let className = 'mention-link';
        if (!this.props.disableHighlight && user.id === this.props.currentUserId) {
            className += ' mention--highlight';
        }

        return (
            <span>
                <Overlay
                    placement={this.state.placement}
                    show={this.state.show}
                    target={this.state.target}
                    rootClose={true}
                    onHide={this.hideOverlay}
                >
                    <ProfilePopover
                        className='user-profile-popover'
                        userId={user.id}
                        src={Client4.getProfilePictureUrl(user.id, user.last_picture_update)}
                        isRHS={this.props.isRHS}
                        hasMention={this.props.hasMention}
                        hide={this.hideOverlay}
                        channelId={this.props.channelId}
                    />
                </Overlay>
                <a
                    className={className}
                    onClick={this.handleClick}
                    ref={this.overlayRef}
                >
                    {'@' + displayUsername(user, this.props.teammateNameDisplay)}
                </a>
                {suffix}
            </span>
        );
    }
}
