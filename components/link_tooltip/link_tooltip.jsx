// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import Popper from 'popper.js';
import ReactDOM from 'react-dom';

import {Constants} from 'utils/constants';
import Pluggable from 'plugins/pluggable';

const tooltipContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: '10',
};

export default class LinkTooltip extends React.PureComponent {
    static propTypes = {
        href: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.tooltipContainerRef = React.createRef();
    }

    showTooltip = (e) => {
        const target = $(e.target);
        const tooltipContainer = $(this.tooltipContainerRef.current);

        this.timeout = setTimeout(() => {
            tooltipContainer.show();

            this.popper = new Popper(target, tooltipContainer, {
                placement: 'bottom',
                modifiers: {
                    preventOverflow: {enabled: false},
                    hide: {enabled: false},
                },
            });
        }, Constants.OVERLAY_TIME_DELAY);
    };

    hideTooltip = () => {
        clearTimeout(this.timeout);
        $(this.tooltipContainerRef.current).hide();
    };

    render() {
        const {href, title} = this.props;
        return (
            <React.Fragment>
                {ReactDOM.createPortal(
                    <div
                        style={tooltipContainerStyles}
                        ref={this.tooltipContainerRef}
                    >
                        <Pluggable
                            href={href}
                            pluggableName='LinkTooltip'
                        />
                    </div>,
                    document.getElementById('root')
                )}
                <span
                    onMouseOver={this.showTooltip}
                    onMouseLeave={this.hideTooltip}
                >
                    {title}
                </span>
            </React.Fragment>
        );
    }
}

