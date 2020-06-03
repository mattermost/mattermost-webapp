// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {RefObject, CSSProperties} from 'react';
import Popper from 'popper.js';
import ReactDOM from 'react-dom';

import {Constants} from 'utils/constants';
import Pluggable from 'plugins/pluggable';

const tooltipContainerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
};

type Props = {
    href: string;
    title: string;
    attributes: {[attribute: string]: string};
}

export default class LinkTooltip extends React.PureComponent<Props> {
    private tooltipContainerRef: RefObject<any>;
    private show: boolean;
    private hideTimeout: number;
    private showTimeout: number;
    private popper?: Popper;

    public constructor(props: Props) {
        super(props);

        this.tooltipContainerRef = React.createRef();
        this.show = false;
        this.showTimeout = -1;
        this.hideTimeout = -1;
    }

    public showTooltip = (e: any): void => {
        //clear the hideTimeout in the case when the cursor is moved from a tooltipContainer child to the link
        window.clearTimeout(this.hideTimeout);

        if (!this.show) {
            const $target: JQuery = $(e.target);
            const target: Element = $target.get(0);
            const $tooltipContainer: JQuery = $(this.tooltipContainerRef.current);
            const tooltipContainer: Element = $tooltipContainer.get(0);

            //clear the old this.showTimeout if there is any before overriding
            window.clearTimeout(this.showTimeout);

            this.showTimeout = window.setTimeout(() => {
                this.show = true;

                $tooltipContainer.show();
                $tooltipContainer.children().on('mouseover', () => clearTimeout(this.hideTimeout));
                $tooltipContainer.children().on('mouseleave', (event: JQueryEventObject) => {
                    if (event.relatedTarget !== null) {
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

    public hideTooltip = (): void => {
        //clear the old this.hideTimeout if there is any before overriding
        window.clearTimeout(this.hideTimeout);

        this.hideTimeout = window.setTimeout(() => {
            this.show = false;

            //prevent executing the showTimeout after the hideTooltip
            clearTimeout(this.showTimeout);

            $(this.tooltipContainerRef.current).hide();
        }, Constants.OVERLAY_TIME_DELAY_SMALL);
    };

    public render() {
        const {href, title, attributes} = this.props;

        const dataAttributes = {
            'data-hashtag': attributes['data-hashtag'],
            'data-link': attributes['data-link'],
            'data-channel-mention': attributes['data-channel-mention'],
        };
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
                    document.getElementById('root') as HTMLElement,
                )}
                <span
                    onMouseOver={this.showTooltip}
                    onMouseLeave={this.hideTooltip}
                    {...dataAttributes}
                >
                    {title}
                </span>
            </React.Fragment>
        );
    }
}
