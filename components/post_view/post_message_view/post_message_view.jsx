// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Posts} from 'mattermost-redux/constants';

import PostMarkdown from 'components/post_markdown';
import * as PostUtils from 'utils/post_utils.jsx';
import * as Utils from 'utils/utils.jsx';

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
    }

    componentDidMount() {
        this.checkOverflow();
    }

    componentWillUpdate(nextProps) {
        if (this.props.post.id !== nextProps.post.id) {
            this.setState({
                collapse: true,
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.post !== prevProps.post) {
            this.checkOverflow();
        }
    }

    checkOverflow = () => {
        const content = this.refs.content;

        let hasOverflow = false;
        if (content && content.scrollHeight > content.clientHeight) {
            hasOverflow = true;
        }

        if (hasOverflow !== this.state.hasOverflow) {
            this.setState({
                hasOverflow,
            });
        }
    }

    toggleCollapse = () => {
        this.setState((state) => ({
            collapse: !state.collapse,
        }));
    }

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
        if (postType) {
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

        let blur = null;
        let showMore = null;
        if (this.state.hasOverflow) {
            blur = (
                <div className='post-collapse__gradient-container'>
                    <div className='post-collapse__gradient'/>
                </div>
            );

            // TODO move showMore below text when expanded
            // TODO position showMore properly around date lines and such

            let icon = 'fa fa-angle-up';
            let text = 'Show Less';
            if (this.state.collapse) {
                icon = 'fa fa-angle-down';
                text = 'Show More';
            }

            showMore = (
                <div className='post-collapse__show-more-container'>
                    <div className='post-collapse__line'/>
                    <button
                        className='post-collapse__show-more'
                        onClick={this.toggleCollapse}
                    >
                        <span className={icon}/>
                        {text}
                    </button>
                    <div className='post-collapse__line'/>
                </div>
            );
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
                            isRHS={isRHS}
                            options={options}
                            post={post}
                        />
                    </div>
                    {this.renderEditedIndicator()}
                </div>
                {blur}
                {showMore}
            </div>
        );
    }
}
