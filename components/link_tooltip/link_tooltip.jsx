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
        this.show = false;
    }

    showTooltip = (e) => {
        //clear the hideTimeout in the case when the cursor is moved from a tooltipContainer child to the link
        clearTimeout(this.hideTimeout);

        if (!this.show) {
            const target = $(e.target);
            const tooltipContainer = $(this.tooltipContainerRef.current);

            //clear the old this.showTimeout if there is any before overriding
            clearTimeout(this.showTimeout);

            this.showTimeout = setTimeout(() => {
                this.show = true;

                tooltipContainer.show();
                tooltipContainer.children().on('mouseover', () => clearTimeout(this.hideTimeout));
                tooltipContainer.children().on('mouseleave', (event) => {
                    if (event.toElement !== null) {
                        this.hideTooltip();
                    }
                });

                this.popper = new Popper(target, tooltipContainer, {
                    placement: 'bottom',
                    modifiers: {
                        preventOverflow: {enabled: false},
                        hide: {enabled: false},
                    },
                });
            }, Constants.OVERLAY_TIME_DELAY);
        }
    };

    hideTooltip = () => {
        //clear the old this.hideTimeout if there is any before overriding
        clearTimeout(this.hideTimeout);

        this.hideTimeout = setTimeout(() => {
            this.show = false;

            //prevent executing the showTimeout after the hideTooltip
            clearTimeout(this.showTimeout);

            $(this.tooltipContainerRef.current).hide();
        }, Constants.OVERLAY_TIME_DELAY_SMALL);
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

