// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger} from 'react-bootstrap';
import {Client4} from 'mattermost-redux/client';

import Pluggable from 'plugins/pluggable';
import ProfilePopover from 'components/profile_popover';

import * as Utils from 'utils/utils.jsx';

export default class AtMention extends React.PureComponent {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        hasMention: PropTypes.bool,
        isRHS: PropTypes.bool,
        mentionName: PropTypes.string.isRequired,
        usersByUsername: PropTypes.object.isRequired,
    };

    static defaultProps = {
        isRHS: false,
        hasMention: false,
    }

    constructor(props) {
        super(props);

        this.hideProfilePopover = this.hideProfilePopover.bind(this);

        this.state = {
            user: this.getUserFromMentionName(props),
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.mentionName !== this.props.mentionName || nextProps.usersByUsername !== this.props.usersByUsername) {
            this.setState({
                user: this.getUserFromMentionName(nextProps),
            });
        }
    }

    hideProfilePopover() {
        this.refs.overlay.hide();
    }

    getUserFromMentionName(props) {
        const usersByUsername = props.usersByUsername;
        let mentionName = props.mentionName;

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
            return <span>{'@' + this.props.mentionName}</span>;
        }

        const user = this.state.user;
        const suffix = this.props.mentionName.substring(user.username.length);

        let className = 'mention-link';
        if (user.id === this.props.currentUserId) {
            className += ' mention--highlight';
        }

        return (
            <span>
                <OverlayTrigger
                    ref='overlay'
                    trigger='click'
                    placement='left'
                    rootClose={true}
                    overlay={
                        <Pluggable>
                            <ProfilePopover
                                user={user}
                                src={Client4.getProfilePictureUrl(user.id, user.last_picture_update)}
                                hide={this.hideProfilePopover}
                                isRHS={this.props.isRHS}
                                hasMention={this.props.hasMention}
                            />
                        </Pluggable>
                    }
                >
                    <a className={className}>{'@' + Utils.getDisplayNameByUser(user)}</a>
                </OverlayTrigger>
                {suffix}
            </span>
        );
    }
}
