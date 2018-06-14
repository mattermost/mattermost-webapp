// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Posts} from 'mattermost-redux/constants';

import * as GlobalActions from 'actions/global_actions';
import PostMarkdown from 'components/post_markdown';
import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils';

// This must match the max-height defined in CSS for the collapsed content div
const MAX_POST_HEIGHT = 600;

export default class PostMessageView extends React.PureComponent {
    static propTypes = {

        /*
         * The post to render the message for
         */
        post: PropTypes.object.isRequired,

        /*
         * Set to enable Markdown formatting
         */
        enableFormatting: PropTypes.bool,

        /*
         * Options specific to text formatting
         */
        options: PropTypes.object,

        /*
         * Post identifiers for selenium tests
         */
        lastPostCount: PropTypes.number,

        /**
         * Set to render post body compactly
         */
        compactDisplay: PropTypes.bool,

        /**
         * Flags if the post_message_view is for the RHS (Reply).
         */
        isRHS: PropTypes.bool,

        /**
         * Whether or not the RHS is visible
         */
        isRHSOpen: PropTypes.bool,

        /**
         * Whether or not the RHS is expanded
         */
        isRHSExpanded: PropTypes.bool,

        /*
         * Logged in user's theme
         */
        theme: PropTypes.object.isRequired,

        /*
         * Post type components from plugins
         */
        pluginPostTypes: PropTypes.object,
    };

    static defaultProps = {
        options: {},
        isRHS: false,
        pluginPostTypes: {},
    };

    constructor(props) {
        super(props);

        this.state = {
            collapse: true,
            hasOverflow: false,
        };

        this.imageProps = {
            onHeightReceived: this.handleImageHeightReceived,
        };
    }

    componentDidMount() {
        this.checkOverflow();

        window.addEventListener('resize', this.handleResize);
    }

    componentWillUpdate(nextProps) {
        if (this.props.post.id !== nextProps.post.id) {
            this.setState({
                collapse: true,
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.post !== prevProps.post ||
            this.props.isRHSOpen !== prevProps.isRHSOpen ||
            this.props.isRHSExpanded !== prevProps.isRHSExpanded) {
            this.checkOverflow();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleImageHeightReceived = () => {
        GlobalActions.postListScrollChange();

        this.checkOverflow();
    };

    handleResize = () => {
        this.checkOverflow();
    };

    checkOverflow = () => {
        const content = this.refs.content;

        let hasOverflow = false;
        if (content && content.scrollHeight > MAX_POST_HEIGHT) {
            hasOverflow = true;
        }

        if (hasOverflow !== this.state.hasOverflow) {
            this.setState({
                hasOverflow,
            });
        }
    };

    toggleCollapse = () => {
        this.setState((state) => {
            return {
                collapse: !state.collapse,
            };
        });
    };

    renderDeletedPost() {
        return (
            <p>
                <FormattedMessage
                    id='post_body.deleted'
                    defaultMessage='(message deleted)'
                />
            </p>
        );
    }

    renderEditedIndicator() {
        if (!PostUtils.isEdited(this.props.post)) {
            return null;
        }

        return (
            <span className='post-edited__indicator'>
                <FormattedMessage
                    id='post_message_view.edited'
                    defaultMessage='(edited)'
                />
            </span>
        );
    }

    render() {
        const {
            post,
            enableFormatting,
            options,
            pluginPostTypes,
            compactDisplay,
            isRHS,
            theme,
            lastPostCount,
        } = this.props;

        if (post.state === Posts.POST_DELETED) {
            return this.renderDeletedPost();
        }

        if (!enableFormatting) {
            return <span>{post.message}</span>;
        }

        const postType = post.type;
        if (pluginPostTypes.hasOwnProperty(postType)) {
            const PluginComponent = pluginPostTypes[postType].component;
            return (
                <PluginComponent
                    post={post}
                    compactDisplay={compactDisplay}
                    isRHS={isRHS}
                    theme={theme}
                />
            );
        }

        let postId = null;
        if (lastPostCount >= 0) {
            postId = Utils.createSafeId('lastPostMessageText' + lastPostCount);
        }

        let message = post.message;
        const isEphemeral = Utils.isPostEphemeral(post);
        if (compactDisplay && isEphemeral) {
            const visibleMessage = Utils.localizeMessage('post_info.message.visible.compact', ' (Only visible to you)');
            message = message.concat(visibleMessage);
        }

        let className = 'post-message';
        if (this.state.collapse) {
            className += ' post-message--collapsed';
        } else {
            className += ' post-message--expanded';
        }

        let overflow = null;
        if (this.state.hasOverflow) {
            let icon = 'fa fa-angle-up';
            let text = 'Show Less';
            if (this.state.collapse) {
                icon = 'fa fa-angle-down';
                text = 'Show More';
            }

            overflow = (
                <div className='post-collapse'>
                    <div className='post-collapse__gradient'/>
                    <div className='post-collapse__show-more'>
                        <div className='post-collapse__show-more-line'/>
                        <button
                            className='post-collapse__show-more-button'
                            onClick={this.toggleCollapse}
                        >
                            <span className={icon}/>
                            {text}
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
                    className='post-message__text-container'
                    ref='content'
                >
                    <div
                        id={postId}
                        className='post-message__text'
                        onClick={Utils.handleFormattedTextClick}
                    >
                        <PostMarkdown
                            message={message}
                            imageProps={this.imageProps}
                            isRHS={isRHS}
                            options={options}
                            post={post}
                        />
                    </div>
                    {this.renderEditedIndicator()}
                </div>
                {overflow}
            </div>
        );
    }
}
