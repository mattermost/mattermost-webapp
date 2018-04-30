// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

function formatMessage(isFlagged) {
    return (
        <FormattedMessage
            id={isFlagged ? 'rhs_root.mobile.unflag' : 'rhs_root.mobile.flag'}
            defaultMessage={isFlagged ? 'Unflag' : 'Flag'}
        />
    );
}

export default function DotMenuFlag(props) {
    function onFlagPost(e) {
        e.preventDefault();
        props.actions.flagPost(props.postId);
    }

    function onUnflagPost(e) {
        e.preventDefault();
        props.actions.unflagPost(props.postId);
    }

    const flagFunc = props.isFlagged ? onUnflagPost : onFlagPost;

    let flagId = null;
    if (props.idCount > -1) {
        flagId = Utils.createSafeId(props.idPrefix + props.idCount);
    }

    if (props.idPrefix.indexOf(Constants.RHS_ROOT) === 0) {
        flagId = props.idPrefix;
    }

    return (
        <li
            key={props.idPrefix}
            role='presentation'
        >
            <button
                id={flagId}
                className='style--none'
                onClick={flagFunc}
            >
                {formatMessage(props.isFlagged)}
            </button>
        </li>
    );
}

DotMenuFlag.propTypes = {
    idCount: PropTypes.number,
    idPrefix: PropTypes.string.isRequired,
    postId: PropTypes.string.isRequired,
    isFlagged: PropTypes.bool.isRequired,

    actions: PropTypes.shape({

        /*
         * Function flag the post
         */
        flagPost: PropTypes.func.isRequired,

        /*
         * Function to unflag the post
         */
        unflagPost: PropTypes.func.isRequired,

    }).isRequired,
};

DotMenuFlag.defaultProps = {
    idCount: -1,
    postId: '',
    isFlagged: false,
};
