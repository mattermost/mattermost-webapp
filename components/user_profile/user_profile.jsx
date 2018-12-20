// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {OverlayTrigger} from 'react-bootstrap';

import {imageURLForUser, isMobile} from 'utils/utils.jsx';

import Pluggable from 'plugins/pluggable';
import ProfilePopover from 'components/profile_popover';

export default class UserProfile extends PureComponent {
    static propTypes = {
        disablePopover: PropTypes.bool,
        displayName: PropTypes.string,
        hasMention: PropTypes.bool,
        isBusy: PropTypes.bool,
        isRHS: PropTypes.bool,
        overwriteName: PropTypes.node,
        userId: PropTypes.string,
    };

    static defaultProps = {
        disablePopover: false,
        hasMention: false,
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
            overwriteName,
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
        if (userId) {
            profileImg = imageURLForUser(userId);
        }

        return (
            <OverlayTrigger
                ref='overlay'
                trigger='click'
                placement={placement}
                rootClose={true}
                overlay={
                    <Pluggable>
                        <ProfilePopover
                            userId={userId}
                            src={profileImg}
                            isBusy={isBusy}
                            hide={this.hideProfilePopover}
                            isRHS={isRHS}
                            hasMention={hasMention}
                        />
                    </Pluggable>
                }
            >
                <div className='user-popover'>
                    {name}
                </div>
            </OverlayTrigger>
        );
    }
}
