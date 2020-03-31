// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {localizeMessage} from 'utils/utils.jsx';

const MAX_POST_HEIGHT = 600;
const MAX_ATTACHMENT_TEXT_HEIGHT = 200;
const MARGIN_CHANGE_FOR_COMPACT_POST = 22;

export default class ShowMore extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        checkOverflow: PropTypes.number,
        isAttachmentText: PropTypes.bool,
        isRHSExpanded: PropTypes.bool.isRequired,
        isRHSOpen: PropTypes.bool.isRequired,
        text: PropTypes.string,
        compactDisplay: PropTypes.bool.isRequired,
    }
    constructor(props) {
        super(props);
        this.maxHeight = this.props.isAttachmentText ? MAX_ATTACHMENT_TEXT_HEIGHT : MAX_POST_HEIGHT;
        this.state = {
            isCollapsed: true,
            isOverflow: false,
        };
    }

    componentDidMount() {
        this.checkTextOverflow();

        window.addEventListener('resize', this.handleResize);
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.text !== prevProps.text ||
            this.props.isRHSExpanded !== prevProps.isRHSExpanded ||
            this.props.isRHSOpen !== prevProps.isRHSOpen ||
            this.props.checkOverflow !== prevProps.checkOverflow
        ) {
            this.checkTextOverflow();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        if (this.overflowRef) {
            window.cancelAnimationFrame(this.overflowRef);
        }
    }

    toggleCollapse = (e) => {
        e.preventDefault();
        this.setState((prevState) => {
            return {
                isCollapsed: !prevState.isCollapsed,
            };
        });
    };

    checkTextOverflow = () => {
        if (this.overflowRef) {
            window.cancelAnimationFrame(this.overflowRef);
        }
        this.overflowRef = window.requestAnimationFrame(() => {
            const textContainer = this.refs.textContainer;
            let isOverflow = false;

            if (textContainer && textContainer.scrollHeight > this.maxHeight) {
                isOverflow = true;
            }

            if (isOverflow !== this.state.isOverflow) {
                this.setState({
                    isOverflow,
                });
            }
        });
    };

    handleResize = () => {
        this.checkTextOverflow();
    };

    render() {
        const {
            isCollapsed,
            isOverflow,
        } = this.state;

        const {
            children,
            isAttachmentText,
            compactDisplay,
        } = this.props;

        let className = 'post-message';
        let collapsedMaxHeightStyle;
        if (isCollapsed) {
            collapsedMaxHeightStyle = this.maxHeight;
            className += ' post-message--collapsed';
        } else {
            className += ' post-message--expanded';
        }

        let collapseGradientClass = 'post-collapse__gradient';
        let collapseShowMoreClass = 'post-collapse__show-more';
        if (isAttachmentText) {
            collapseGradientClass = 'post-attachment-collapse__gradient';
            collapseShowMoreClass = 'post-attachment-collapse__show-more';
        }

        let attachmentTextOverflow = null;
        if (isOverflow) {
            if (!isAttachmentText && isCollapsed && compactDisplay) {
                collapsedMaxHeightStyle -= MARGIN_CHANGE_FOR_COMPACT_POST;
            }

            let showIcon = 'fa fa-angle-up';
            let showText = localizeMessage('post_info.message.show_less', 'Show less');
            if (isCollapsed) {
                showIcon = 'fa fa-angle-down';
                showText = localizeMessage('post_info.message.show_more', 'Show more');
            }

            attachmentTextOverflow = (
                <div className='post-collapse'>
                    <div
                        id='collapseGradient'
                        className={collapseGradientClass}
                    />
                    <div className={collapseShowMoreClass}>
                        <div className='post-collapse__show-more-line'/>
                        <button
                            id='showMoreButton'
                            className='post-collapse__show-more-button'
                            onClick={this.toggleCollapse}
                        >
                            <span className={showIcon}/>
                            {showText}
                        </button>
                        <div className='post-collapse__show-more-line'/>
                    </div>
                </div>
            );

            className += ' post-message--overflow';
        }

        return (
            <div className={className}>
                <div
                    style={{maxHeight: collapsedMaxHeightStyle}}
                    className='post-message__text-container'
                    ref='textContainer'
                >
                    {children}
                </div>
                {attachmentTextOverflow}
            </div>
        );
    }
}
