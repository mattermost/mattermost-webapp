// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {Popover} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';

import SuggestionList from './suggestion_list.jsx';

export default class SearchSuggestionList extends SuggestionList {
    static propTypes = {
        ...SuggestionList.propTypes,
    };

    constructor(props) {
        super(props);
        this.suggestionReadOut = React.createRef();
        this.currentLabel = '';
    }

    announceLabel() {
        const suggestionReadOut = this.suggestionReadOut.current;
        if (suggestionReadOut) {
            suggestionReadOut.innerHTML = this.currentLabel;
        }
    }

    getContent() {
        return $(ReactDOM.findDOMNode(this.refs.popover)).find('.popover-content');
    }

    renderChannelDivider(type) {
        let text;
        if (type === Constants.OPEN_CHANNEL) {
            text = (
                <FormattedMessage
                    id='suggestion.search.public'
                    defaultMessage='Public Channels'
                />
            );
        } else if (type === Constants.PRIVATE_CHANNEL) {
            text = (
                <FormattedMessage
                    id='suggestion.search.private'
                    defaultMessage='Private Channels'
                />
            );
        } else {
            text = (
                <FormattedMessage
                    id='suggestion.search.direct'
                    defaultMessage='Direct Messages'
                />
            );
        }

        return (
            <div
                key={type + '-divider'}
                className='search-autocomplete__divider'
            >
                <span>{text}</span>
            </div>
        );
    }

    render() {
        if (this.props.items.length === 0) {
            return null;
        }

        const items = [];
        for (let i = 0; i < this.props.items.length; i++) {
            const item = this.props.items[i];
            const term = this.props.terms[i];
            const isSelection = term === this.props.selection;

            // ReactComponent names need to be upper case when used in JSX
            const Component = this.props.components[i];

            // temporary hack to add dividers between public and private channels in the search suggestion list
            if (this.props.renderDividers) {
                if (i === 0 || item.type !== this.props.items[i - 1].type) {
                    if (item.type === Constants.OPEN_CHANNEL) {
                        items.push(this.renderChannelDivider(Constants.OPEN_CHANNEL));
                    } else if (item.type === Constants.PRIVATE_CHANNEL) {
                        items.push(this.renderChannelDivider(Constants.PRIVATE_CHANNEL));
                    } else if (i === 0 || this.props.items[i - 1].type === Constants.OPEN_CHANNEL || this.props.items[i - 1].type === Constants.PRIVATE_CHANNEL) {
                        items.push(this.renderChannelDivider(Constants.DM_CHANNEL));
                    }
                }
            }

            if (isSelection) {
                if (item.type === Constants.DM_CHANNEL || item.type === Constants.GM_CHANNEL) {
                    this.currentLabel = item.display_name;
                } else if (item.username) {
                    this.currentLabel = item.username;
                } else {
                    this.currentLabel = item.name;
                }

                // Pause the event loop and Wait for the aria-live element to be up
                setTimeout(() => {
                    this.announceLabel();
                }, Constants.OVERLAY_TIME_DELAY_SMALL);
            }

            items.push(
                <Component
                    key={term}
                    ref={term}
                    item={item}
                    term={term}
                    matchedPretext={this.props.matchedPretext[i]}
                    isSelection={isSelection}
                    onClick={this.props.onCompleteWord}
                />
            );
        }

        return (
            <Popover
                ref='popover'
                id='search-autocomplete__popover'
                className='search-help-popover autocomplete visible'
                placement='bottom'
            >
                <div
                    ref={this.suggestionReadOut}
                    aria-live='polite'
                    className='hidden-label'
                />
                {items}
            </Popover>
        );
    }
}
