// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Overlay} from 'react-bootstrap';
import {Client4} from 'mattermost-redux/client';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import ProfilePopover from 'components/profile_popover';

import {popOverOverlayPosition} from 'utils/position_utils.jsx';
const spaceRequiredForPopOver = 300;

export default class AtMention extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        currentUserId: PropTypes.string.isRequired,
        hasMention: PropTypes.bool,
        isRHS: PropTypes.bool,
        mentionName: PropTypes.string.isRequired,
        teammateNameDisplay: PropTypes.string.isRequired,
        usersByUsername: PropTypes.object.isRequired,
    };

    static defaultProps = {
        isRHS: false,
        hasMention: false,
    }

    constructor(props) {
        super(props);

        this.state = {
            user: this.getUserFromMentionName(props),
            show: false,
        };

        this.overlayRef = React.createRef();
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.mentionName !== this.props.mentionName || nextProps.usersByUsername !== this.props.usersByUsername) {
            this.setState({
                user: this.getUserFromMentionName(nextProps),
            });
        }
    }

    handleClick = (e) => {
        const targetBounds = this.overlayRef.current.getBoundingClientRect();
        const placement = popOverOverlayPosition(targetBounds, window.innerHeight, {above: spaceRequiredForPopOver});

        this.setState({target: e.target, show: !this.state.show, placement});
    }

    hideOverlay = () => {
        this.setState({show: false});
    }

    getUserFromMentionName(props) {
        const usersByUsername = props.usersByUsername;
        let mentionName = props.mentionName.toLowerCase();

        while (mentionName.length > 0) {
            if (usersByUsername.hasOwnProperty(mentionName)) {
                return usersByUsername[mentionName];
            }

            // Repeatedly trim off trailing punctuation in case this is at the end of a sentence
            if ((/[._-]$/).test(mentionName)) {
                mentionName = mentionName.substring(0, mentionName.length - 1);
            } else {
                break;
            }
        }

        return '';
    }

    render() {
        if (!this.state.user) {
            return <React.Fragment>{this.props.children}</React.Fragment>;
        }

        const user = this.state.user;
        const suffix = this.props.mentionName.substring(user.username.length);

        let className = 'mention-link';
        if (user.id === this.props.currentUserId) {
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
