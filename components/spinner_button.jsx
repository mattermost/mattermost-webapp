// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import LoadingWrapper from 'components/widgets/loading_wrapper.jsx';

export default class SpinnerButton extends PureComponent {
    static defaultProps = {
        spinning: false,
    }

    static propTypes = {

        /**
         * Children to show when not spinning
         */
        children: PropTypes.node,

        /**
         * Set to true to spin
         */
        spinning: PropTypes.bool.isRequired,

        /**
         * Callback function when button is clicked
         */
        onClick: PropTypes.func,
    }

    render() {
        const {spinning, children, ...props} = this.props; // eslint-disable-line no-use-before-define

        return (
            <LoadingWrapper
                loading={spinning}
                type='bars'
            >
                <button
                    className='btn btn-primary'
                    {...props}
                >
                    {children}
                </button>
            </LoadingWrapper>
        );
    }
}
