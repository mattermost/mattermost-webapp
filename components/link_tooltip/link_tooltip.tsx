// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {RefObject, CSSProperties} from 'react';
import Popper from 'popper.js';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import {Constants} from 'utils/constants';
import Pluggable from 'plugins/pluggable';

import './link_tooltip.scss';

const tooltipContainerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1070,
    position: 'absolute',
    top: -1000,
    left: -1000,
};

type Props = {
    href: string;
    attributes: {[attribute: string]: string};
}

type State = {
    show: boolean;
}

export default class LinkTooltip extends React.PureComponent<Props, State> {
    private tooltipContainerRef: RefObject<HTMLDivElement>;
    private tooltipContainer: Element | null = null;
    private targetRef: RefObject<HTMLSpanElement>;
    private target: Element | null = null;
    private hideTimeout: number;
    private showTimeout: number;
    private popper?: Popper;

    public constructor(props: Props) {
        super(props);

        this.tooltipContainerRef = React.createRef();
        this.targetRef = React.createRef();
        this.showTimeout = -1;
        this.hideTimeout = -1;

        this.state = {
            show: false,
        };
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.show && !prevState.show) {
            //clear the hideTimeout in the case when the cursor is moved from a tooltipContainer child to the link
            window.clearTimeout(this.hideTimeout);

            //clear the old this.showTimeout if there is any before overriding
            window.clearTimeout(this.showTimeout);

            this.tooltipContainer = this.tooltipContainerRef.current;
            this.target = this.targetRef.current;

            this.showTimeout = window.setTimeout(() => {
                if (!this.tooltipContainer || !this.target) {
                    return;
                }

                const addChildEventListeners = (node: Node) => {
                    node.addEventListener('mouseover', () => clearTimeout(this.hideTimeout));
                    (node as HTMLElement).addEventListener('mouseleave', (event) => {
                        if (event.relatedTarget !== null) {
                            this.hideTooltip();
                        }
                    });
                };
                this.tooltipContainer.childNodes.forEach(addChildEventListeners);
                // this.tooltipContainer.firstChild.addEventListener('mouseover', () => clearTimeout(this.hideTimeout))
                // this.tooltipContainer.firstChild.addEventListener('mouseleave', (event) => {
                //     console.log('child event listener');
                //     console.log('child event listener: related target: ', event.target);
                //     if (event.target !== null) {
                //         this.hideTooltip();
                //     }
                // });

                this.popper = new Popper(this.target, this.tooltipContainer, {
                    placement: 'auto',
                    modifiers: {
                        preventOverflow: {enabled: false},
                        hide: {enabled: false},
                    },
                });
            }, Constants.OVERLAY_TIME_DELAY);
        }
    }

    public showTooltip = (): void => {
        if (this.state.show) {
            return;
        }
        this.setState({show: true});
    };

    public hideTooltip = (): void => {
        //clear the old this.hideTimeout if there is any before overriding
        window.clearTimeout(this.hideTimeout);

        this.hideTimeout = window.setTimeout(() => {
            if (this.state.show) {
                this.setState({show: false});
            }

            //prevent executing the showTimeout after the hideTooltip
            clearTimeout(this.showTimeout);
        }, Constants.OVERLAY_TIME_DELAY_SMALL);
    };

    public render() {
        const {href, children, attributes} = this.props;

        const dataAttributes = {
            'data-hashtag': attributes['data-hashtag'],
            'data-link': attributes['data-link'],
            'data-channel-mention': attributes['data-channel-mention'],
        };
        return (
            <React.Fragment>
                {this.state.show && ReactDOM.createPortal(
                    <div
                        style={tooltipContainerStyles}
                        ref={this.tooltipContainerRef}
                        className={classNames('tooltip-container', {visible: this.state.show})}
                    >
                        <Pluggable
                            href={href}
                            show={this.state.show}
                            pluggableName='LinkTooltip'
                        />
                    </div>,
                    document.getElementById('root') as HTMLElement,
                )}
                <span
                    ref={this.targetRef}
                    onMouseOver={this.showTooltip}
                    onMouseLeave={this.hideTooltip}
                    {...dataAttributes}
                >
                    {children}
                </span>
            </React.Fragment>
        );
    }
}
