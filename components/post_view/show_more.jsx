// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {localizeMessage} from 'utils/utils.jsx';

export default class ShowMore extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        checkOverflow: PropTypes.bool,
        isAttachmentText: PropTypes.bool,
        maxHeight: PropTypes.number.isRequired,
        text: PropTypes.string,
    }

    state = {
        isCollapsed: true,
        isOverflow: false,
    };

    componentDidMount() {
        this.checkTextOverflow();

        window.addEventListener('resize', this.handleResize);
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.text !== prevProps.text ||
            this.props.checkOverflow
        ) {
            this.checkTextOverflow();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
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
        const textContainer = this.refs.textContainer;
        let isOverflow = false;

        if (textContainer && textContainer.scrollHeight > this.props.maxHeight) {
            isOverflow = true;
        }

        if (isOverflow !== this.state.isOverflow) {
            this.setState({
                isOverflow,
            });
        }
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
            maxHeight,
        } = this.props;

        let className = 'post-message';
        let collapsedMaxHeightStyle;
        if (isCollapsed) {
            collapsedMaxHeightStyle = isAttachmentText ? {maxHeight} : null;
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
            let showIcon = 'fa fa-angle-up';
            let showText = localizeMessage('post_info.message.show_less', 'Show Less');
            if (isCollapsed) {
                showIcon = 'fa fa-angle-down';
                showText = localizeMessage('post_info.message.show_more', 'Show More');
            }

            attachmentTextOverflow = (
                <div className='post-collapse'>
                    <div className={collapseGradientClass}/>
                    <div className={collapseShowMoreClass}>
                        <div className='post-collapse__show-more-line'/>
                        <button
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
                    style={collapsedMaxHeightStyle}
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
