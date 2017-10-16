// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {flagPost, unflagPost} from 'actions/post_actions.jsx';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

function flagToolTip(isFlagged) {
    return (
        <Tooltip id='flagTooltip'>
            <FormattedMessage
                id={isFlagged ? 'flag_post.unflag' : 'flag_post.flag'}
                defaultMessage={isFlagged ? 'Unflag' : 'Flag for follow up'}
            />
        </Tooltip>
    );
}

function flagIcon(isFlagged) {
    let flagIconSvg = Constants.FLAG_ICON_SVG;

    if (isFlagged) {
        flagIconSvg = Constants.FLAG_FILLED_ICON_SVG;
    }

    return (
        <span
            className='icon'
            dangerouslySetInnerHTML={{__html: flagIconSvg}}
        />
    );
}

export default function PostFlagIcon(props) {
    function onFlagPost(e) {
        e.preventDefault();
        flagPost(props.postId);
    }

    function onUnflagPost(e) {
        e.preventDefault();
        unflagPost(props.postId);
    }

    const flagFunc = props.isFlagged ? onUnflagPost : onFlagPost;
    const flagVisible = props.isFlagged ? 'visible' : '';

    let flagIconId = null;
    if (props.idCount > -1) {
        flagIconId = Utils.createSafeId(props.idPrefix + props.idCount);
    }

    if (!props.isEphemeral) {
        return (
            <OverlayTrigger
                trigger={['hover', 'focus']}
                key={'flagtooltipkey' + flagVisible}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={flagToolTip(props.isFlagged)}
            >
                <button
                    id={flagIconId}
                    className={'style--none flag-icon__container ' + flagVisible}
                    onClick={flagFunc}
                >
                    {flagIcon(props.isFlagged)}
                </button>
            </OverlayTrigger>
        );
    }

    return null;
}

PostFlagIcon.propTypes = {
    idPrefix: PropTypes.string.isRequired,
    idCount: PropTypes.number,
    postId: PropTypes.string.isRequired,
    isFlagged: PropTypes.bool.isRequired,
    isEphemeral: PropTypes.bool
};

PostFlagIcon.defaultProps = {
    idCount: -1,
    postId: '',
    isFlagged: false,
    isEphemeral: false
};
