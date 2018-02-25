// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import * as Utils from 'utils/utils.jsx';

import EmojiList from './emoji_list';

export default class EmojiPage extends React.Component {
    static propTypes = {

        /**
         * Non-UI team name for the current team.
         */
        teamName: PropTypes.string.isRequired,

        /**
         * UI team name for the current team.
         */
        teamDisplayName: PropTypes.string.isRequired,

        /**
         * Title of the app or site.
         */
        siteName: PropTypes.string,

        /**
         * Function to scroll list to top.
         */
        scrollToTop: PropTypes.func.isRequired,
    }

    static defaultProps = {
        teamName: '',
        teamDisplayName: '',
        siteName: '',
    }

    componentDidMount() {
        this.updateTitle();
    }

    updateTitle = (props = this.props) => {
        document.title = Utils.localizeMessage('custom_emoji.header', 'Custom Emoji') + ' - ' + props.teamDisplayName + ' ' + props.siteName;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.siteName !== nextProps.siteName) {
            this.updateTitle(nextProps);
        }
    }

    render() {
        return (
            <div className='backstage-content emoji-list'>
                <div className='backstage-header'>
                    <h1>
                        <FormattedMessage
                            id='emoji_list.header'
                            defaultMessage='Custom Emoji'
                        />
                    </h1>
                    <Link
                        className='add-link'
                        to={'/' + this.props.teamName + '/emoji/add'}
                    >
                        <button
                            type='button'
                            className='btn btn-primary'
                        >
                            <FormattedMessage
                                id='emoji_list.add'
                                defaultMessage='Add Custom Emoji'
                            />
                        </button>
                    </Link>
                    <EmojiList scrollToTop={this.props.scrollToTop}/>
                </div>
            </div>
        );
    }
}
