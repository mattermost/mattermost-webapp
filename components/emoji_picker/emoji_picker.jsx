// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import throttle from 'lodash/throttle';

import EmojiStore from 'stores/emoji_store.jsx';
import * as Emoji from 'utils/emoji.jsx';
import * as Utils from 'utils/utils.jsx';

import EmojiPickerCategory from './components/emoji_picker_category';
import EmojiPickerItem from './components/emoji_picker_item';
import EmojiPickerCategorySection from './emoji_picker_category_section';
import EmojiPickerPreview from './components/emoji_picker_preview';

const CATEGORY_SEARCH_RESULTS = 'searchResults';
const EMOJI_HEIGHT = 27;
const EMOJI_CONTAINER_HEIGHT = 300;
const EMOJI_CONTAINER_STYLE = {
    height: EMOJI_CONTAINER_HEIGHT
};
const EMOJI_LAZY_LOAD_BUFFER = 75;
const EMOJI_PER_ROW = 9;
const EMOJI_TO_LOAD_PER_UPDATE = 135;
const EMOJI_LAZY_LOAD_SCROLL_THROTTLE = 100;

const CATEGORIES = {
    recent: {
        name: 'recent',
        className: 'fa fa-clock-o',
        id: 'emoji_picker.recent',
        message: 'Recently Used',
        offset: 0
    },
    people: {
        name: 'people',
        className: 'fa fa-smile-o',
        id: 'emoji_picker.people',
        message: 'People',
        offset: 0
    },
    nature: {
        name: 'nature',
        className: 'fa fa-leaf',
        id: 'emoji_picker.nature',
        message: 'Nature',
        offset: 0
    },
    foods: {
        name: 'foods',
        className: 'fa fa-cutlery',
        id: 'emoji_picker.foods',
        message: 'Foods',
        offset: 0
    },
    activity: {
        name: 'activity',
        className: 'fa fa-futbol-o',
        id: 'emoji_picker.activity',
        message: 'Activity',
        offset: 0
    },
    places: {
        name: 'places',
        className: 'fa fa-plane',
        id: 'emoji_picker.places',
        message: 'Places',
        offset: 0
    },
    objects: {
        name: 'objects',
        className: 'fa fa-lightbulb-o',
        id: 'emoji_picker.objects',
        message: 'Objects',
        offset: 0
    },
    symbols: {
        name: 'symbols',
        className: 'fa fa-heart-o',
        id: 'emoji_picker.symbols',
        message: 'Symbols',
        offset: 0
    },
    flags: {
        name: 'flags',
        className: 'fa fa-flag-o',
        id: 'emoji_picker.flags',
        message: 'Flags',
        offset: 0
    },
    custom: {
        name: 'custom',
        className: 'fa fa-at',
        id: 'emoji_picker.custom',
        message: 'Custom',
        offset: 0
    }
};

function getEmojiFilename(emoji) {
    return emoji.filename || emoji.id;
}

const EMOJIS_PER_PAGE = 200;

export default class EmojiPicker extends React.PureComponent {
    static propTypes = {
        style: PropTypes.object,
        rightOffset: PropTypes.number,
        topOffset: PropTypes.number,
        placement: PropTypes.oneOf(['top', 'bottom', 'left']),
        onEmojiClick: PropTypes.func.isRequired,
        customEmojisEnabled: PropTypes.bool,
        emojiMap: PropTypes.object.isRequired,
        customEmojiPage: PropTypes.number.isRequired,
        actions: PropTypes.shape({
            getCustomEmojis: PropTypes.func.isRequired,
            searchCustomEmojis: PropTypes.func.isRequired,
            incrementEmojiPickerPage: PropTypes.func.isRequired
        }).isRequired
    };

    static defaultProps = {
        rightOffset: 0,
        topOffset: 0,
        customEmojiPage: 0,
        customEmojisEnabled: false
    };

    constructor(props) {
        super(props);

        this.handleCategoryClick = this.handleCategoryClick.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleItemOver = this.handleItemOver.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleScrollThrottle = throttle(this.handleScroll, EMOJI_LAZY_LOAD_SCROLL_THROTTLE, {leading: false, trailing: true});
        this.updateCategoryOffset = this.updateCategoryOffset.bind(this);

        this.divHeight = 0;
        this.missingPages = true;
        this.state = {
            allEmojis: {},
            categories: CATEGORIES,
            filter: '',
            cursor: [0, 0], // categoryIndex, emojiIndex
            divTopOffset: 0,
            emojisToShow: EMOJI_TO_LOAD_PER_UPDATE
        };
    }

    componentWillMount() {
        if (this.props.customEmojiPage === 0) {
            this.loadMoreCustomEmojis();
        }
        this.getEmojis();
    }

    componentDidMount() {
        // Delay taking focus because this briefly renders offscreen when using an Overlay
        // so focusing it immediately on mount can cause weird scrolling
        requestAnimationFrame(() => {
            this.searchInput.focus();
        });
        this.divHeight = this.emojiPickerContainer.offsetHeight;
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.state.divTopOffset === nextState.divTopOffset) {
            return;
        }

        if (this.lastVisibleEmoji) {
            const difference = this.lastVisibleEmoji.offsetTop - (nextState.divTopOffset + EMOJI_CONTAINER_HEIGHT + EMOJI_LAZY_LOAD_BUFFER);
            if (difference <= 0) {
                const numToLoad = EMOJI_TO_LOAD_PER_UPDATE + Math.ceil((difference / EMOJI_HEIGHT) * EMOJI_PER_ROW * -1);
                this.setState((state) => ({
                    emojisToShow: state.emojisToShow + numToLoad
                }));
            }
        }

        if (!this.missingPages || !this.emojiPickerContainer) {
            return;
        }

        if (this.emojiPickerContainer.scrollHeight - nextState.divTopOffset === this.emojiPickerContainer.clientHeight) {
            this.loadMoreCustomEmojis();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.emojiMap !== nextProps.emojiMap) {
            this.getEmojis(nextProps);
        }
    }

    loadMoreCustomEmojis = async () => {
        if (!this.props.customEmojisEnabled) {
            return;
        }

        const {data} = await this.props.actions.getCustomEmojis(this.props.customEmojiPage, EMOJIS_PER_PAGE);
        if (!data) {
            return;
        }

        if (data.length < EMOJIS_PER_PAGE) {
            this.missingPages = false;
            return;
        }

        this.props.actions.incrementEmojiPickerPage();
    }

    lastVisibleEmojiRef = (lastVisibleEmoji) => {
        this.lastVisibleEmoji = lastVisibleEmoji;
    };
    emojiPickerContainerRef = (emojiPickerContainer) => {
        this.emojiPickerContainer = emojiPickerContainer;
    };
    emojiSearchInput = (input) => {
        this.searchInput = input;
    };

    handleCategoryClick(categoryName) {
        this.emojiPickerContainer.scrollTop = this.state.categories[categoryName].offset;
    }

    handleFilterChange(e) {
        e.preventDefault();
        const filter = e.target.value.toLowerCase();

        if (this.props.customEmojisEnabled && filter && filter.trim() !== '') {
            this.props.actions.searchCustomEmojis(filter);
        }

        this.setState(() => ({
            filter,
            cursor: [0, 0]
        }));
    }

    handleItemOver(categoryIndex, emojiIndex) {
        this.setState({
            cursor: [categoryIndex, emojiIndex]
        });
    }

    handleItemClick(emoji) {
        this.props.onEmojiClick(emoji);
    }

    handleKeyDown(e) {
        switch (e.key) {
        case 'ArrowRight':
            e.preventDefault();
            this.selectNextEmoji();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            this.selectPrevEmoji();
            break;
        case 'ArrowUp':
            e.preventDefault();
            this.selectPrevEmoji(EMOJI_PER_ROW);
            break;
        case 'ArrowDown':
            e.preventDefault();
            this.selectNextEmoji(EMOJI_PER_ROW);
            break;
        case 'Enter':
            e.preventDefault();
            if (this.getCurrentEmojiByCursor(this.state.cursor)) {
                this.props.onEmojiClick(this.getCurrentEmojiByCursor(this.state.cursor));
            }
            break;
        }
    }

    handleScroll() {
        this.setState({divTopOffset: this.emojiPickerContainer.scrollTop});
    }

    selectNextEmoji(offset = 1) {
        const {cursor} = this.state;

        // try moving to next emoji in index
        let newCursor = [cursor[0], cursor[1] + offset];
        if (this.getCurrentEmojiByCursor(newCursor)) {
            this.setState({cursor: newCursor});
            return;
        }

        // try moving to next category
        newCursor = [cursor[0] + 1, 0];
        if (this.getCurrentEmojiByCursor(newCursor)) {
            this.setState({cursor: newCursor});
        }
    }

    selectPrevEmoji(offset = 1) {
        const {cursor} = this.state;

        // try moving to prev emoji in index
        let newCursor = [cursor[0], cursor[1] - offset];
        if (this.getCurrentEmojiByCursor(newCursor)) {
            this.setState({cursor: newCursor});
            return;
        }

        // try moving to end of prev category
        if (cursor[0] !== 0) {
            const newCategory = this.getCategoryByIndex(cursor[0] - 1);
            const lastVisibleEmojiInNewCategory = this.state.categories[newCategory.name].emojiIds.length - 1;
            newCursor = [cursor[0] - 1, lastVisibleEmojiInNewCategory];
            if (this.getCurrentEmojiByCursor(newCursor)) {
                this.setState({cursor: newCursor});
            }
        }
    }

    getCategoryByIndex(index) {
        if (this.state.filter && index !== 0) {
            return null;
        }
        return this.getCategoriesByKey(Object.keys(this.state.categories)[index]);
    }

    getCurrentEmojiByCursor(cursor) {
        const category = this.getCategoryByIndex(cursor[0]);
        if (!category) {
            return null;
        }
        return this.getEmojisByCategory(category)[cursor[1]];
    }

    getCategoriesByKey(key) {
        return this.state.filter ? {
            id: CATEGORY_SEARCH_RESULTS,
            name: CATEGORY_SEARCH_RESULTS
        } : this.state.categories[key];
    }

    getEmojisByCategory(category) {
        if (this.state.filter) {
            return Object.values(this.state.allEmojis).filter((emoji) => {
                for (let i = 0; i < emoji.aliases.length; i++) {
                    if (emoji.aliases[i].toLowerCase().includes(this.state.filter)) {
                        return true;
                    }
                }
                return false;
            });
        }
        return this.state.categories[category.name].emojiIds.map((emojiId) =>
            this.state.allEmojis[emojiId]);
    }

    getEmojis(props = this.props) {
        const {categories, allEmojis} = this.state;
        const emojiMap = props.emojiMap;
        const customEmojiMap = emojiMap.customEmojis;

        for (const category of Object.keys(categories)) {
            let categoryEmojis = [];
            if (category === 'recent') {
                const recentEmojis = [...EmojiStore.getRecentEmojis()].reverse();
                categoryEmojis = recentEmojis.filter((name) => {
                    return emojiMap.has(name);
                }).map((name) => {
                    return emojiMap.get(name);
                });
            } else {
                const indices = Emoji.EmojiIndicesByCategory.get(category) || [];
                categoryEmojis = indices.map((index) => Emoji.Emojis[index]);
                if (category === 'custom') {
                    categoryEmojis = categoryEmojis.concat([...customEmojiMap.values()]);
                }
            }
            categories[category].emojiIds = categoryEmojis.map((emoji) => getEmojiFilename(emoji));
            for (let i = 0; i < categoryEmojis.length; i++) {
                const currentEmoji = categoryEmojis[i];
                const fileName = getEmojiFilename(currentEmoji);
                allEmojis[fileName] = {
                    ...currentEmoji,
                    visible: false,
                    offset: null
                };
                if (!currentEmoji.filename) {
                    // if custom emoji, set proper attributes
                    allEmojis[fileName] = {
                        ...allEmojis[fileName],
                        aliases: [currentEmoji.name],
                        category: 'custom',
                        filename: fileName
                    };
                }
            }
        }
        this.setState({
            categories,
            allEmojis
        });
    }

    getCurrentEmojiCategoryName() {
        const categories = Object.keys(this.state.categories);
        let currentCategoryName = '';
        for (let i = categories.length - 1; i >= 0; i--) {
            // go through in reverse so that you get the last category that matches
            const category = this.state.categories[categories[i]];
            if (this.state.divTopOffset > category.offset - 20) {
                currentCategoryName = categories[i];
                break;
            }
        }
        return currentCategoryName;
    }

    emojiCategories() {
        const categories = this.state.categories;
        const categoryKeys = Object.keys(categories);
        const currentCategoryName = this.state.filter ? categoryKeys[0] : this.getCurrentEmojiCategoryName();
        const emojiPickerCategories = categoryKeys.map((categoryName) => {
            const category = categories[categoryName];
            return (
                <EmojiPickerCategory
                    key={'header-' + category.name}
                    category={category.name}
                    icon={
                        <i
                            className={category.className}
                            title={Utils.localizeMessage(category.id, category.message)}
                        />
                    }
                    onCategoryClick={this.handleCategoryClick}
                    selected={currentCategoryName === category.name}
                    enable={!this.state.filter}
                />
            );
        });
        return <div className='emoji-picker__categories'>{emojiPickerCategories}</div>;
    }

    emojiSearch() {
        return (
            <div className='emoji-picker__search-container'>
                <span className='fa fa-search emoji-picker__search-icon'/>
                <input
                    ref={this.emojiSearchInput}
                    className='emoji-picker__search'
                    type='text'
                    onChange={this.handleFilterChange}
                    onKeyDown={this.handleKeyDown}
                    placeholder={Utils.localizeMessage('emoji_picker.search', 'search')}
                />
            </div>
        );
    }

    emojiCurrentResults() {
        const {filter} = this.state;
        const categories = filter ? [CATEGORY_SEARCH_RESULTS] : Object.keys(this.state.categories);
        let numEmojisLoaded = 0;

        let categoryComponents = [];

        for (let i = 0; i < categories.length; i++) {
            const category = this.getCategoriesByKey(categories[i]);
            const emojis = this.getEmojisByCategory(category);
            const items = this.emojiCurrentResultsItems(i, emojis, numEmojisLoaded);
            numEmojisLoaded += items.length;
            categoryComponents = [...categoryComponents, (
                <EmojiPickerCategorySection
                    key={category.id}
                    categoryName={category.name}
                    updateCategoryOffset={this.updateCategoryOffset}
                >
                    {items}
                </EmojiPickerCategorySection>
            )];
        }

        return (
            <div
                ref={this.emojiPickerContainerRef}
                onScroll={this.handleScrollThrottle}
                className='emoji-picker__items'
                style={EMOJI_CONTAINER_STYLE}
            >
                <div className='emoji-picker__container'>
                    {categoryComponents}
                </div>
            </div>
        );
    }
    emojiCurrentResultsItems = (categoryIndex, emojis, currentEmojiLoadedCount) => {
        const {cursor, emojisToShow} = this.state;
        let numEmojisLoaded = currentEmojiLoadedCount;

        return emojis.map((emoji, emojiIndex) => {
            numEmojisLoaded++;

            // set ref on first unloaded emoji
            let ref;
            if (numEmojisLoaded === emojisToShow) {
                ref = this.lastVisibleEmojiRef;
            }
            if (numEmojisLoaded >= emojisToShow) {
                return (
                    <div
                        key={numEmojisLoaded}
                        className='emoji-picker__item'
                        ref={ref}
                    >
                        <img
                            src='/static/images/img_trans.gif'
                            className='emojisprite'
                        />
                    </div>
                );
            }
            return (
                <EmojiPickerItem
                    key={emoji.filename + ':' + emoji.id}
                    emoji={emoji}
                    onItemOver={this.handleItemOver}
                    onItemClick={this.handleItemClick}
                    onItemUnmount={emoji}
                    category={emoji.category}
                    isSelected={cursor[0] === (categoryIndex) && cursor[1] === emojiIndex}
                    categoryIndex={categoryIndex}
                    emojiIndex={emojiIndex}
                    containerRef={this.emojiPickerContainer}
                    containerTop={this.state.divTopOffset}
                    containerBottom={this.state.divTopOffset + this.divHeight}
                />
            );
        });
    };

    updateCategoryOffset(categoryName, offset) {
        if (categoryName !== CATEGORY_SEARCH_RESULTS) {
            this.setState((state) => ({
                categories: {
                    ...state.categories,
                    [categoryName]: {
                        ...state.categories[categoryName],
                        offset
                    }
                }}));
        }
    }

    render() {
        let pickerStyle;
        if (this.props.style && !(this.props.style.left === 0 || this.props.style.top === 0)) {
            if (this.props.placement === 'top' || this.props.placement === 'bottom') {
                // Only take the top/bottom position passed by React Bootstrap since we want to be right-aligned
                pickerStyle = {
                    top: this.props.style.top,
                    bottom: this.props.style.bottom,
                    right: this.props.rightOffset
                };
            } else {
                pickerStyle = {...this.props.style};
            }
        }
        if (pickerStyle && pickerStyle.top) {
            pickerStyle.top += this.props.topOffset;
        }
        return (
            <div
                className='emoji-picker'
                style={pickerStyle}
            >
                {this.emojiCategories()}
                {this.emojiSearch()}
                {this.emojiCurrentResults()}
                <EmojiPickerPreview emoji={this.getCurrentEmojiByCursor(this.state.cursor)}/>
            </div>
        );
    }
}
