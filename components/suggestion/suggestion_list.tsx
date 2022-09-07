// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes, {instanceOf} from 'prop-types';
import React, {ComponentType, PropsWithRef, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage, useIntl} from 'react-intl';
import {cloneDeep} from 'lodash';

import {Channel} from '@mattermost/types/channels';

import {Constants} from 'utils/constants';

import {isEmptyObject} from 'utils/utils';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';

// When this file is migrated to TypeScript, type definitions for its props already exist in ./suggestion_list.d.ts.

// Since SuggestionLists contain items of different types without any common properties, I don't know of any good way
// to define a shared type for them. Confirming that a SuggestionItem matches what its component expects will be left
// up to the component.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
type SuggestionItem = {
    type: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    nickname?: string;
    channel?: Channel;
    [key: string]: unknown;
}

interface Props {
    ariaLiveRef?: React.RefObject<HTMLDivElement>;
    inputRef?: React.RefObject<HTMLElement>;
    open: boolean;
    position?: 'top' | 'bottom';
    renderDividers?: string[];
    renderNoResults?: boolean;
    onCompleteWord: (term: string, matchedPretext: string, event?: React.MouseEvent<HTMLDivElement>) => boolean;
    preventClose?: () => void;
    onItemHover: (term: string) => void;
    pretext: string;
    cleared: boolean;
    matchedPretext: string[];
    items: SuggestionItem[];
    terms: string[];
    selection: string;
    components: Array<ComponentType<PropsWithRef<{item: SuggestionItem; [key: string]: unknown}>>>;

    // components: Array<ElementRef<ComponentType<{item: SuggestionItem}>>>;
    wrapperHeight?: number;

    // suggestionBoxAlgn is an optional object that can be passed to align the SuggestionList with the keyboard caret
    // as the user is typing.
    suggestionBoxAlgn?: {
        lineHeight: number;
        pixelsToMoveX: number;
        pixelsToMoveY: number;
    };
}

const SuggestionList = ({renderDividers = [], renderNoResults = false, ...props}: Props) => {
    const currentItem = useRef<SuggestionItem>();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

    const {formatMessage} = useIntl();

    const getComputedNumericalCssProperty = (element: Element, property: string) => {
        return parseInt(getComputedStyle(element).getPropertyValue(property), 10);
    };

    useEffect(() => {
        const content = contentRef.current;
        console.log('##### content', content);
        if (!content) {
            return;
        }

        const visibleContentHeight = content.clientHeight;
        const actualContentHeight = content.scrollHeight;

        if (visibleContentHeight < actualContentHeight) {
            const contentTop = content.scrollTop;
            console.log('##### here?');
            const contentTopPadding = getComputedNumericalCssProperty(content, 'paddingTop');
            const contentBottomPadding = getComputedNumericalCssProperty(content, 'paddingTop');

            console.log('##### here2?');
            const item = ReactDOM.findDOMNode(itemRefs.current.get(props.selection));
            if (!item || !(item instanceof HTMLElement)) {
                return;
            }

            console.log('##### here3?', item);
            const itemTop = item.offsetTop - getComputedNumericalCssProperty(item, 'marginTop');
            const itemBottomMargin = getComputedNumericalCssProperty(item, 'marginBottom') + getComputedNumericalCssProperty(item, 'paddingBottom');
            const itemBottom = item.offsetTop + getComputedNumericalCssProperty(item, 'height') + itemBottomMargin;

            if (itemTop - contentTopPadding < contentTop) {
                // the item is off the top of the visible space
                content.scrollTop = itemTop - contentTopPadding;
            } else if (itemBottom + contentTopPadding + contentBottomPadding > contentTop + visibleContentHeight) {
                // the item has gone off the bottom of the visible space
                content.scrollTop = (itemBottom - visibleContentHeight) + contentTopPadding + contentBottomPadding;
            }
        }
    }, [props.selection]);

    useEffect(() => {
        const item = currentItem.current;

        if (!item || isEmptyObject(item)) {
            return;
        }

        const labelParts = [];
        if (item.username) {
            labelParts.push(item.username);
            labelParts.push(item.first_name);
            labelParts.push(item.last_name);
            labelParts.push(item.nickname);
        } else if (item.type === 'mention.channels') {
            labelParts.push(item.channel?.display_name ?? '');
        }

        const label = labelParts.filter(Boolean).join(' ').toLowerCase();

        const suggestionReadOut = props.ariaLiveRef?.current;
        if (suggestionReadOut) {
            suggestionReadOut.innerHTML = label;
        }
    }, [props.ariaLiveRef]);

    const getTransform = () => {
        if (!props.suggestionBoxAlgn) {
            return {};
        }

        const {lineHeight, pixelsToMoveX} = props.suggestionBoxAlgn;
        let pixelsToMoveY = props.suggestionBoxAlgn.pixelsToMoveY;

        if (props.position === 'bottom') {
            // Add the line height and 4 extra px so it looks less tight
            pixelsToMoveY += props.suggestionBoxAlgn.lineHeight + 4;
        }

        // If the suggestion box was invoked from the first line in the post box, stick to the top of the post box
        pixelsToMoveY = pixelsToMoveY > lineHeight ? pixelsToMoveY : 0;

        return {
            transform: `translate(${pixelsToMoveX}px, ${pixelsToMoveY}px)`,
        };
    };

    type DividerProps = {
        type: string;
    }

    const Divider = ({type}: DividerProps) => {
        return (
            <div
                key={type + '-divider'}
                className='suggestion-list__divider'
            >
                <FormattedMessage id={`suggestion.${type}`}/>
            </div>
        );
    };

    const noResults = (
        <div
            key='list-no-results'
            className='suggestion-list__no-results'
            ref={contentRef}
        >
            <FormattedMessage
                id='suggestion_list.no_matches'
                defaultMessage='No items match <strong>{value}</strong>'
                values={{
                    strong: (x: string) => <strong>{x}</strong>,
                    value: props.pretext || '""',
                }}
            />
        </div>
    );

    if (!props.open || props.cleared) {
        return null;
    }

    const inputHeight = props.inputRef?.current?.clientHeight ?? 0;

    const maxHeight = Math.min(
        window.innerHeight - (inputHeight + Constants.POST_MODAL_PADDING),
        Constants.SUGGESTION_LIST_MAXHEIGHT,
    );

    const clonedItems = cloneDeep(props.items);

    const items = [];
    if (clonedItems.length === 0) {
        if (!renderNoResults) {
            return null;
        }

        items.push(noResults);
    }

    let prevItemType = null;
    for (let i = 0; i < props.items.length; i++) {
        const item = props.items[i];
        const term = props.terms[i];
        const isSelection = term === props.selection;

        // ReactComponent names need to be upper case when used in JSX
        const Component = props.components[i];
        if ((renderDividers.includes('all') || renderDividers.includes(item.type)) && prevItemType !== item.type) {
            items.push(<Divider type={item.type}/>);
            prevItemType = item.type;
        }

        if (item.loading) {
            items.push(<LoadingSpinner key={item.type}/>);
            continue;
        }

        if (isSelection) {
            currentItem.current = item;
        }

        items.push(
            <Component
                key={term}
                ref={(ref: HTMLElement) => {
                    console.log('####### ref', ref);
                    itemRefs.current.set(term, ref);
                }}
                item={props.items[i]}
                term={term}
                matchedPretext={props.matchedPretext[i]}
                isSelection={isSelection}
                onClick={props.onCompleteWord}
                onMouseMove={props.onItemHover}
            />,
        );
    }
    const mainClass = 'suggestion-list suggestion-list--' + props.position;
    const contentClass = 'suggestion-list__content suggestion-list__content--' + props.position;

    return (
        <div
            ref={wrapperRef}
            className={mainClass}
        >
            <div
                id='suggestionList'
                role='list'
                ref={contentRef}
                style={{
                    maxHeight,
                    ...getTransform(),
                }}
                className={contentClass}
                onMouseDown={props.preventClose}
            >
                {items}
            </div>
        </div>
    );
};

class SuggestionListClass extends React.PureComponent {
    static propTypes = {
        ariaLiveRef: PropTypes.object,
        inputRef: PropTypes.object,
        open: PropTypes.bool.isRequired,
        position: PropTypes.oneOf(['top', 'bottom']),
        renderDividers: PropTypes.arrayOf(PropTypes.string),
        renderNoResults: PropTypes.bool,
        onCompleteWord: PropTypes.func.isRequired,
        preventClose: PropTypes.func,
        onItemHover: PropTypes.func.isRequired,
        pretext: PropTypes.string.isRequired,
        cleared: PropTypes.bool.isRequired,
        matchedPretext: PropTypes.array.isRequired,
        items: PropTypes.array.isRequired,
        terms: PropTypes.array.isRequired,
        selection: PropTypes.string.isRequired,
        components: PropTypes.array.isRequired,
        suggestionBoxAlgn: PropTypes.object,
    };

    static defaultProps = {
        renderDividers: [],
        renderNoResults: false,
    };

    constructor(props) {
        super(props);

        this.contentRef = React.createRef();
        this.wrapperRef = React.createRef();
        this.itemRefs = new Map();
        this.suggestionReadOut = React.createRef();
        this.currentLabel = '';
        this.currentItem = {};
    }

    componentDidMount() {
        this.updateMaxHeight();
    }

    componentDidUpdate(prevProps) {
        if (this.props.selection !== prevProps.selection && this.props.selection) {
            this.scrollToItem(this.props.selection);
        }

        if (!isEmptyObject(this.currentItem)) {
            this.generateLabel(this.currentItem);
        }

        if (this.props.items.length > 0 && prevProps.items.length === 0) {
            this.updateMaxHeight();
        }
    }

    componentWillUnmount() {
        this.removeLabel();
    }

    updateMaxHeight = () => {
        if (!this.props.inputRef?.current) {
            return;
        }

        const inputHeight = this.props.inputRef.current.clientHeight ?? 0;

        this.maxHeight = Math.min(
            window.innerHeight - (inputHeight + Constants.POST_MODAL_PADDING),
            Constants.SUGGESTION_LIST_MAXHEIGHT,
        );

        if (this.contentRef.current) {
            this.contentRef.current.style['max-height'] = this.maxHeight;
        }
    }

    announceLabel() {
        const suggestionReadOut = this.props.ariaLiveRef.current;
        if (suggestionReadOut) {
            suggestionReadOut.innerHTML = this.currentLabel;
        }
    }

    removeLabel() {
        const suggestionReadOut = this.props.ariaLiveRef.current;
        if (suggestionReadOut) {
            suggestionReadOut.innerHTML = '';
        }
    }

    generateLabel(item) {
        if (item.username) {
            this.currentLabel = item.username;
            if ((item.first_name || item.last_name) && item.nickname) {
                this.currentLabel += ` ${item.first_name} ${item.last_name} ${item.nickname}`;
            } else if (item.nickname) {
                this.currentLabel += ` ${item.nickname}`;
            } else if (item.first_name || item.last_name) {
                this.currentLabel += ` ${item.first_name} ${item.last_name}`;
            }
        } else if (item.type === 'mention.channels') {
            this.currentLabel = item.channel.display_name;
        }

        if (this.currentLabel) {
            this.currentLabel = this.currentLabel.toLowerCase();
        }
        this.announceLabel();
    }

    getContent = () => {
        return this.contentRef.current;
    }

    scrollToItem = (term) => {
        const content = this.getContent();
        if (!content) {
            return;
        }

        const visibleContentHeight = content.clientHeight;
        const actualContentHeight = content.scrollHeight;

        if (visibleContentHeight < actualContentHeight) {
            const contentTop = content.scrollTop;
            const contentTopPadding = this.getComputedCssProperty(content, 'paddingTop');
            const contentBottomPadding = this.getComputedCssProperty(content, 'paddingTop');

            const item = ReactDOM.findDOMNode(this.itemRefs.get(term));
            if (!item) {
                return;
            }

            const itemTop = item.offsetTop - this.getComputedCssProperty(item, 'marginTop');
            const itemBottomMargin = this.getComputedCssProperty(item, 'marginBottom') + this.getComputedCssProperty(item, 'paddingBottom');
            const itemBottom = item.offsetTop + this.getComputedCssProperty(item, 'height') + itemBottomMargin;

            if (itemTop - contentTopPadding < contentTop) {
                // the item is off the top of the visible space
                content.scrollTop = itemTop - contentTopPadding;
            } else if (itemBottom + contentTopPadding + contentBottomPadding > contentTop + visibleContentHeight) {
                // the item has gone off the bottom of the visible space
                content.scrollTop = (itemBottom - visibleContentHeight) + contentTopPadding + contentBottomPadding;
            }
        }
    }

    getComputedCssProperty(element, property) {
        return parseInt(getComputedStyle(element)[property], 10);
    }

    getTransform() {
        if (!this.props.suggestionBoxAlgn) {
            return {};
        }

        const {lineHeight, pixelsToMoveX} = this.props.suggestionBoxAlgn;
        let pixelsToMoveY = this.props.suggestionBoxAlgn.pixelsToMoveY;

        if (this.props.position === 'bottom') {
            // Add the line height and 4 extra px so it looks less tight
            pixelsToMoveY += this.props.suggestionBoxAlgn.lineHeight + 4;
        }

        // If the suggestion box was invoked from the first line in the post box, stick to the top of the post box
        pixelsToMoveY = pixelsToMoveY > lineHeight ? pixelsToMoveY : 0;

        return {
            transform: `translate(${pixelsToMoveX}px, ${pixelsToMoveY}px)`,
        };
    }

    renderDivider(type) {
        return (
            <div
                key={type + '-divider'}
                className='suggestion-list__divider'
            >
                <span>
                    <FormattedMessage id={'suggestion.' + type}/>
                </span>
            </div>
        );
    }

    renderNoResults() {
        return (
            <div
                key='list-no-results'
                className='suggestion-list__no-results'
                ref={this.contentRef}
            >
                <FormattedMarkdownMessage
                    id='suggestion_list.no_matches'
                    defaultMessage='No items match __{value}__'
                    values={{
                        value: this.props.pretext || '""',
                    }}
                />
            </div>
        );
    }

    render() {
        const {renderDividers} = this.props;

        if (!this.props.open || this.props.cleared) {
            return null;
        }

        const clonedItems = cloneDeep(this.props.items);

        const items = [];
        if (clonedItems.length === 0) {
            if (!this.props.renderNoResults) {
                return null;
            }
            items.push(this.renderNoResults());
        }

        let prevItemType = null;
        for (let i = 0; i < this.props.items.length; i++) {
            const item = this.props.items[i];
            const term = this.props.terms[i];
            const isSelection = term === this.props.selection;

            // ReactComponent names need to be upper case when used in JSX
            const Component = this.props.components[i];
            if ((renderDividers.includes('all') || renderDividers.includes(item.type)) && prevItemType !== item.type) {
                items.push(this.renderDivider(item.type));
                prevItemType = item.type;
            }

            if (item.loading) {
                items.push(<LoadingSpinner key={item.type}/>);
                continue;
            }

            if (isSelection) {
                this.currentItem = item;
            }

            items.push(
                <Component
                    key={term}
                    ref={(ref) => {
                        console.log('###### ref from class: ', ref);
                        this.itemRefs.set(term, ref);
                    }}
                    item={this.props.items[i]}
                    term={term}
                    matchedPretext={this.props.matchedPretext[i]}
                    isSelection={isSelection}
                    onClick={this.props.onCompleteWord}
                    onMouseMove={this.props.onItemHover}
                />,
            );
        }
        const mainClass = 'suggestion-list suggestion-list--' + this.props.position;
        const contentClass = 'suggestion-list__content suggestion-list__content--' + this.props.position;

        return (
            <div
                ref={this.wrapperRef}
                className={mainClass}
            >
                <div
                    id='suggestionList'
                    role='list'
                    ref={this.contentRef}
                    style={{
                        maxHeight: this.maxHeight,
                        ...this.getTransform(),
                    }}
                    className={contentClass}
                    onMouseDown={this.props.preventClose}
                >
                    {items}
                </div>
            </div>
        );
    }
}

export {SuggestionListClass};

export default SuggestionList;
