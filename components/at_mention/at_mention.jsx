// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Overlay} from 'react-bootstrap';
import {Client4} from 'mattermost-redux/client';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import ProfilePopover from 'components/profile_popover';

import {popOverOverlayPosition} from 'utils/position_utils.tsx';
const spaceRequiredForPopOver = 300;

export default class AtMention extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        currentUserId: PropTypes.string.isRequired,
        hasMention: PropTypes.bool,
        disableHighlight: PropTypes.bool,
        disableGroupHighlight: PropTypes.bool,
        isRHS: PropTypes.bool,
        mentionName: PropTypes.string.isRequired,
        teammateNameDisplay: PropTypes.string.isRequired,
        usersByUsername: PropTypes.object.isRequired,
        groupsByName: PropTypes.object.isRequired,
    };

    static defaultProps = {
        isRHS: false,
        hasMention: false,
        disableHighlight: false,
        disableGroupHighlight: false,
    }

    constructor(props) {
        super(props);

        this.state = {
            show: false,
        };

        this.overlayRef = React.createRef();
    }

    handleClick = (e) => {
        const targetBounds = this.overlayRef.current.getBoundingClientRect();
        const placement = popOverOverlayPosition(targetBounds, window.innerHeight, spaceRequiredForPopOver);

        this.setState({target: e.target, show: !this.state.show, placement});
    }

    hideOverlay = () => {
        this.setState({show: false});
    }

    getUserFromMentionName() {
        const {usersByUsername, mentionName} = this.props;
        let mentionNameToLowerCase = mentionName.toLowerCase();

        while (mentionNameToLowerCase.length > 0) {
            if (usersByUsername.hasOwnProperty(mentionNameToLowerCase)) {
                return usersByUsername[mentionNameToLowerCase];
            }

            // Repeatedly trim off trailing punctuation in case this is at the end of a sentence
            if ((/[._-]$/).test(mentionNameToLowerCase)) {
                mentionNameToLowerCase = mentionNameToLowerCase.substring(0, mentionNameToLowerCase.length - 1);
            } else {
                break;
            }
        }

        return '';
    }

    getGroupFromMentionName() {
        const {groupsByName, mentionName} = this.props;
        const mentionNameTrimmed = mentionName.toLowerCase().replace(/[._-]*$/, '');
        return groupsByName?.[mentionNameTrimmed] || {};
    }

    render() {
        const user = this.getUserFromMentionName();

        if (!this.props.disableGroupHighlight && !user) {
            const group = this.getGroupFromMentionName();
            if (group.allow_reference) {
                return <span className='group-mention-link'>{'@' + group.name}</span>;
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
