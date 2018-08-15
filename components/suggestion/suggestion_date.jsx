// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Popover} from 'react-bootstrap';
import ReactDOM from 'react-dom';

import SuggestionStore from 'stores/suggestion_store.jsx';

export default class SuggestionDate extends React.Component {
    static propTypes = {
        suggestionId: PropTypes.string.isRequired,
        location: PropTypes.string,
        renderDividers: PropTypes.bool,
        onCompleteWord: PropTypes.func.isRequired,
    };

    static defaultProps = {
        renderDividers: false,
    };

    constructor(props) {
        super(props);

        this.getStateFromStores = this.getStateFromStores.bind(this);

        this.getContent = this.getContent.bind(this);

        this.handleSuggestionsChanged = this.handleSuggestionsChanged.bind(this);

        this.state = this.getStateFromStores(props.suggestionId);
    }

    getStateFromStores(suggestionId) {
        const suggestions = SuggestionStore.getSuggestions(suggestionId || this.props.suggestionId);

        return {
            matchedPretext: suggestions.matchedPretext,
            items: suggestions.items,
            terms: suggestions.terms,
            components: suggestions.components,
            selection: suggestions.selection,
        };
    }

    componentDidMount() {
        SuggestionStore.addSuggestionsChangedListener(this.props.suggestionId, this.handleSuggestionsChanged);
    }

    componentWillUnmount() {
        SuggestionStore.removeSuggestionsChangedListener(this.props.suggestionId, this.handleSuggestionsChanged);
    }

    getContent() {
        return $(ReactDOM.findDOMNode(this.refs.content));
    }

    handleSuggestionsChanged() {
        this.setState(this.getStateFromStores());
    }

    handleOnBlur(event) {
        event.preventDefault();
    }

    render() {
        if (this.state.items.length === 0) {
            return null;
        }

        const item = this.state.items[0];
        const term = this.state.terms[0];

        // ReactComponent names need to be upper case when used in JSX
        const Component = this.state.components[0];

        const itemComponent = (
            <Component
                key={term}
                ref={term}
                item={item}
                term={term}
                matchedPretext={this.state.matchedPretext[0]}
                isSelection={false}
                onClick={this.props.onCompleteWord}
            />
        );

        return (
            <Popover
                ref='popover'
                id='search-autocomplete__popover'
                className='search-help-popover autocomplete visible'
                placement='bottom'
            >
                {itemComponent}
            </Popover>
        );
    }
}
