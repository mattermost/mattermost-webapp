// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as Utils from 'utils/utils.jsx';

import SearchSuggestionInput from './search_suggestion_input';
const exampleTags = ['from:', 'in:', 'on:', 'before:', 'after:'];

const includesTags = (str) => {
    const lcStr = str.toLowerCase();
    return exampleTags.some((tag) => lcStr.includes(tag));
};

const isTag = (str) => {
    const lcStr = str.toLowerCase();
    return exampleTags.some((tag) => lcStr.startsWith(tag));
};

const determinePairs = (value = this.props.value) => {
    const pairIncludesTags = includesTags(value);
    let remainder;
    let pairs = [];

    if (pairIncludesTags) {
        const split = value.split(/\s(?=\w+:)/);
        let lastEntry = split[split.length - 1];
        const lastEntryIsTag = isTag(lastEntry);

        lastEntry = lastEntry.split(':');

        remainder = lastEntry[lastEntryIsTag ? 1 : 0];
        pairs = split.slice(0, split.length - 1).map((x) => {
            if (isTag(x)) {
                const [tag, val] = x.split(':');
                return {
                    tag,
                    value: val,
                };
            }

            return {
                tag: '',
                value: x,
            };
        });

        if (lastEntryIsTag) {
            pairs.push({tag: lastEntry[0], value: ''});
        }

        pairs = pairs.filter((pair) => Boolean(pair.tag || pair.value));
    } else {
        remainder = value;
    }

    return {
        pairs, remainder,
    };
};

export default class SearchSuggestionTaggedInput extends SearchSuggestionInput {
    static propTypes = {
        onClear: PropTypes.func,
        onInput: PropTypes.func,
        onCompositionStart: PropTypes.func,
        onCompositionUpdate: PropTypes.func,
        onCompositionEnd: PropTypes.func,
        pretext: PropTypes.string,
        onKeyDown: PropTypes.func,
        value: PropTypes.string,
        onFocus: PropTypes.func,
    }
    constructor(props) {
        super(props);
        this.state = {
            value: props.value, pairs: [], remainder: '',
        };
    }

    onKeyDown = (e) => {
        const value = this.getInput().value;

        if (e.key === 'Backspace' && !value) {
            const lastPair = this.state.pairs[this.state.pairs.length - 1];

            let pairs;
            let remainder = this.state.remainder;

            if (lastPair.value) {
                pairs = [...this.state.pairs.slice(0, this.state.pairs.length - 1), {
                    tag: lastPair.tag, value: '',
                }];
                remainder = lastPair.value;
            } else {
                pairs = this.state.pairs.slice(0, this.state.pairs.length - 1);
            }

            this.setState({
                pairs,
                remainder,
            }, () => {
                this.handleChange();
            });
        }

        if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    }

    getPretext = () => {
        const input = this.getInput();
        let inputValue = '';
        if (input) {
            inputValue = input.value.substring(0, input.selectionEnd);
        }

        return (this.getPairsText() + inputValue).toLowerCase();
    }

    getPairsText = () => {
        const {pairs} = this.state;
        let pairsText = pairs.map(({tag, value = ''}) => {
            if (tag) {
                return `${tag}:${value}`;
            }

            return value;
        }).join(' ');

        if (pairs.length > 0 && Boolean(pairs[pairs.length - 1].value)) {
            pairsText += ' ';
        }

        return pairsText;
    }

    static getDerivedStateFromProps(nextProps, state) {
        if (state.value !== nextProps.value) {
            return {
                value: nextProps.value,
                ...determinePairs(nextProps.value),
            };
        }
        return null;
    }

    handleChange = () => {
        const change = this.getInput().value;
        const pairsText = this.getPairsText();
        this.props.onInput(pairsText + change);
    }

    getValue = () => {
        return this.getPairsText() + this.state.remainder;
    }

    getSelectionEnd = () => {
        return this.getPairsText().length + this.getInput().selectionEnd;
    }

    onClear = (e) => {
        e.stopPropagation();

        if (this.props.onClear) {
            this.props.onClear();
        }
    }

    render() {
        const {pairs, remainder} = this.state;

        return (
            <div
                className='search-suggestion__tagged-input'
                onClick={this.props.onFocus}
            >

                {this.props.value && this.props.onClear &&
                <div
                    className='input-clear visible'
                    onClick={(e) => this.onClear(e)}
                >
                    <span
                        className='input-clear-x'
                        aria-hidden='true'
                    >
                        <i className='icon icon-close-circle'/>
                    </span>
                </div>}
                <ul className='search-suggestion__tagged-input__tags'>
                    { pairs.map(({tag, value}) => (
                        <li
                            className='pair'
                            key={tag}
                        >
                            {Boolean(tag) && (
                                <span
                                    className='tag'
                                >
                                    {tag}{':'}
                                </span>
                            )}
                            {value && (
                                <span
                                    className='value'
                                >
                                    {value}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
                <input
                    ref={this.inputRef}
                    type='text'
                    autoComplete='off'
                    className='search-suggestion__tagged-input'
                    placeholder={this.props.value ? '' : Utils.localizeMessage('search_bar.search', 'Search')}
                    onChange={this.handleChange}
                    onKeyDown={this.onKeyDown}
                    value={remainder}
                />
            </div>
        );
    }
}

