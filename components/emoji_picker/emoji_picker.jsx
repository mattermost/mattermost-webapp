// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import throttle from 'lodash/throttle';

import EmojiStore from 'stores/emoji_store.jsx';

import * as Emoji from 'utils/emoji.jsx';
import * as Utils from 'utils/utils.jsx';

import EmojiPickerCategory from './components/emoji_picker_category';
import EmojiPickerItem from './components/emoji_picker_item';
import EmojiPickerSection from './emoji_picker_section';
import EmojiPickerPreview from './components/emoji_picker_preview';

// const ROW_SIZE = 30;
// const EMOJI_PER_ROW = 9;
// const CATEGORY_SEARCH_RESULTS = 'searchResults';

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

export default class EmojiPicker extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        rightOffset: PropTypes.number,
        topOffset: PropTypes.number,
        placement: PropTypes.oneOf(['top', 'bottom', 'left']),
        customEmojis: PropTypes.object,
        onEmojiClick: PropTypes.func.isRequired
    };

    static defaultProps = {
        rightOffset: 0,
        topOffset: 0
    };

    constructor(props) {
        super(props);

        // All props are primitives or treated as immutable
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

        this.handleCategoryClick = this.handleCategoryClick.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleItemOver = this.handleItemOver.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleScrollThrottle = throttle(this.handleScroll, 300);
        this.updateCategoryOffset = this.updateCategoryOffset.bind(this);

        this.divHeight = 0;
        this.state = {
            allEmojis: {},
            categories: CATEGORIES,
            filter: '',
            cursor: [0, 0], // categoryIndex, emojiIndex
            divTopOffset: 0
        };
    }
    componentWillMount() {
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
    handleCategoryClick(categoryName) {
        this.emojiPickerContainer.scrollTop = this.state.categories[categoryName].offset;
    }
    handleFilterChange(e) {
        e.preventDefault();
        const filter = e.target.value;
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
            this.selectNextEmoji(1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            this.selectPrevEmoji(1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            this.selectPrevEmoji(9);
            break;
        case 'ArrowDown':
            e.preventDefault();
            this.selectNextEmoji(9);
            break;
        case 'Enter':
            e.preventDefault();
            this.props.onEmojiClick(this.getCurrentEmojiByCursor(this.state.cursor));
            break;
        }
    }
    handleScroll() {
        console.log('scrolled')
        this.setState({divTopOffset: this.emojiPickerContainer.scrollTop});
    }
    selectNextEmoji(offset) {
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
    selectPrevEmoji(offset) {
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
            const lastEmojiInNewCategory = this.state.categories[newCategory.name].emojiIds.length - 1;
            newCursor = [cursor[0] - 1, lastEmojiInNewCategory];
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
        const emoji = category && this.getEmojiesByCategory(category)[cursor[1]];
        return emoji || null;
    }
    getCategoriesByKey(key) {
        return this.state.filter ? {
            id: 'searchResults',
            name: 'searchResults'
        } : this.state.categories[key];
    }
    getEmojiesByCategory(category) {
        return this.state.filter ? Object.values(this.state.allEmojis).filter((emoji) => {
            for (let i = 0; i < emoji.aliases.length; i++) {
                if (emoji.aliases[i].includes(this.state.filter)) {
                    return true;
                }
            }
            return false;
        }) : this.state.categories[category.name].emojiIds.map((emojiId) => this.state.allEmojis[emojiId]);
    }
    getEmojis() {
        const {categories, allEmojis} = this.state;
        for (const category of Object.keys(categories)) {
            let categoryEmojis = [];
            if (category === 'recent') {
                const recentEmojis = [...EmojiStore.getRecentEmojis()].reverse();
                categoryEmojis = recentEmojis.filter((name) => {
                    return EmojiStore.has(name);
                }).map((name) => {
                    return EmojiStore.get(name);
                });
            } else {
                const indices = Emoji.EmojiIndicesByCategory.get(category) || [];
                categoryEmojis = indices.map((index) => Emoji.Emojis[index]);
                if (category === 'custom') {
                    categoryEmojis = categoryEmojis.concat([...EmojiStore.getCustomEmojiMap().values()]);
                }
            }
            categories[category].emojiIds = categoryEmojis.map((emoji) => emoji.filename);
            for (let i = 0; i < categoryEmojis.length; i++) {
                const currentEmoji = categoryEmojis[i];
                allEmojis[currentEmoji.filename] = {
                    ...currentEmoji,
                    visible: false,
                    offset: null
                };
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
        const currentCategoryName = this.getCurrentEmojiCategoryName();
        const emojiPickerCategories = Object.keys(categories).map((categoryName) => {
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
                    ref={(input) => {
                        this.searchInput = input;
                    }}
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
        const {cursor, filter} = this.state;
        const categories = filter ? ['searchResults'] : Object.keys(this.state.categories);
        let categoryIndex = 0;
        return (
            <div
                ref={(emojiPickerContainer) => {
                    this.emojiPickerContainer = emojiPickerContainer;
                }}
                onScroll={this.handleScrollThrottle}
                className='emoji-picker__items'
            >
                <div className='emoji-picker__container'>
                    {categories.map((key) => {
                        const cIndex = categoryIndex++;
                        const category = this.getCategoriesByKey(key);
                        const emojis = this.getEmojiesByCategory(category);

                        let emojiIndex = 0;
                        return (
                            <EmojiPickerSection
                                key={category.id}
                                categoryName={category.name}
                                updateCategoryOffset={this.updateCategoryOffset}
                            >
                                {emojis.map((emoji) => {
                                    return (
                                        <EmojiPickerItem
                                            key={emoji.filename}
                                            emoji={emoji}
                                            onItemOver={this.handleItemOver}
                                            onItemClick={this.handleItemClick}
                                            onItemUnmount={emoji}
                                            category={emoji.category}
                                            isSelected={cursor[0] === cIndex && cursor[1] === emojiIndex}
                                            categoryIndex={cIndex}
                                            emojiIndex={emojiIndex++}
                                            containerTop={this.state.divTopOffset}
                                            containerBottom={this.state.divTopOffset + this.divHeight}
                                        />
                                    );
                                })}
                            </EmojiPickerSection>
                        );
                    })}
                </div>
            </div>
        );
    }
    updateCategoryOffset(categoryName, offset) {
        if (categoryName !== 'searchResults') {
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
