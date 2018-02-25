// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {flagPost, unflagPost} from 'actions/post_actions.jsx';
import FlagIcon from 'components/svg/flag_icon';
import FlagIconFilled from 'components/svg/flag_icon_filled';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

export default class PostFlagIcon extends React.PureComponent {
    static propTypes = {
        idPrefix: PropTypes.string.isRequired,
        idCount: PropTypes.number,
        postId: PropTypes.string.isRequired,
        isFlagged: PropTypes.bool.isRequired,
        isEphemeral: PropTypes.bool,
    };

    static defaultProps = {
        idCount: -1,
        isEphemeral: false,
    };

    handlePress = (e) => {
        e.preventDefault();

        if (this.props.isFlagged) {
            unflagPost(this.props.postId);
        } else {
            flagPost(this.props.postId);
        }
    }

    render() {
        if (this.props.isEphemeral) {
            return null;
        }

        const isFlagged = this.props.isFlagged;

        const flagVisible = isFlagged ? 'visible' : '';

        let flagIconId = null;
        if (this.props.idCount > -1) {
            flagIconId = Utils.createSafeId(this.props.idPrefix + this.props.idCount);
        }

        let flagIcon;
        if (isFlagged) {
            flagIcon = <FlagIconFilled className='icon'/>;
        } else {
            flagIcon = <FlagIcon className='icon'/>;
        }

        return (
            <OverlayTrigger
                trigger={['hover', 'focus']}
                key={'flagtooltipkey' + flagVisible}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={
                    <Tooltip id='flagTooltip'>
                        <FormattedMessage
                            id={isFlagged ? 'flag_post.unflag' : 'flag_post.flag'}
                            defaultMessage={isFlagged ? 'Unflag' : 'Flag for follow up'}
                        />
                    </Tooltip>
                }
            >
                <button
                    id={flagIconId}
                    className={'style--none flag-icon__container ' + flagVisible}
                    onClick={this.handlePress}
                >
                    {flagIcon}
                </button>
            </OverlayTrigger>
        );
    }
}
