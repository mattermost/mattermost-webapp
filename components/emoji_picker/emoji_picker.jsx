// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable max-lines */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import throttle from 'lodash/throttle';

import * as Emoji from 'utils/emoji.jsx';
import {compareEmojis} from 'utils/emoji_utils';
import {t} from 'utils/i18n';
import imgTrans from 'images/img_trans.gif';

import LocalizedInput from 'components/localized_input/localized_input';

import NoResultsIndicator from 'components/no_results_indicator/no_results_indicator.tsx';

import {NoResultsVariant} from 'components/no_results_indicator/types';

import EmojiPickerCategory from './components/emoji_picker_category';
import EmojiPickerItem from './components/emoji_picker_item';
import EmojiPickerCategorySection from './emoji_picker_category_section';
import EmojiPickerPreview from './components/emoji_picker_preview';
import EmojiPickerSkin from './components/emoji_picker_skin';

const CATEGORY_SEARCH_RESULTS = 'searchResults';

const EMOJI_HEIGHT = 27;

// If this changes, the spaceRequiredAbove and spaceRequiredBelow props passed to the EmojiPickerOverlay must be updated
const EMOJI_CONTAINER_HEIGHT = 290;
const EMOJI_CONTAINER_STYLE = {
    height: EMOJI_CONTAINER_HEIGHT,
};

const EMOJI_LAZY_LOAD_BUFFER = 75;
const EMOJI_PER_ROW = 9; // needs to match variable `$emoji-per-row` in _variables.scss
const EMOJI_TO_LOAD_PER_UPDATE = 135;
const SYSTEM_EMOJIS_COUNT = 1476;
const EMOJI_LAZY_LOAD_SCROLL_THROTTLE = 100;

// we know some categories, but there might be new ones in an upgrade
const categoryClass = new Map([
    ['recent', 'icon-clock-outline'],
    ['searchResults', ''],
    ['smileys-emotion', 'icon-emoticon-happy-outline'],
    ['people-body', 'icon-account-outline'],
    ['animals-nature', 'icon-leaf-outline'],
    ['food-drink', 'icon-food-apple'],
    ['activities', 'icon-basketball'],
    ['travel-places', 'icon-airplane-variant'],
    ['objects', 'icon-lightbulb-outline'],
    ['symbols', 'icon-heart-outline'],
    ['flags', 'icon-flag-outline'],
    ['custom', 'icon-emoticon-custom-outline'],
]);

const DEFAULT_CLASS = categoryClass.get('smileys-emotion');

function createCategory(name) {
    return {
        name,
        id: Emoji.CategoryTranslations.get(name, `emoji_picker.${name}`),
        className: categoryClass.get(name, DEFAULT_CLASS),
        message: Emoji.CategoryMessage.get(name, name),
        offset: 0,
    };
}

const CATEGORIES = {};

for (const cat of Emoji.CategoryNames) {
    if (cat === 'recent' || cat === 'searchResults') {
        continue;
    }
    CATEGORIES[cat] = createCategory(cat);
}

const smileysCategory = {'smileys-emotion': CATEGORIES['smileys-emotion']};
const recentEmojiCategory = {recent: createCategory('recent')};

const searchResultsCategory = createCategory(CATEGORY_SEARCH_RESULTS);

function getEmojiFilename(emoji) {
    return emoji.image || emoji.filename || emoji.id;
}

export function filterEmojiSearchInput(input) {
    return input.toLowerCase().replace(/^:|:$/g, '');
}

const EMOJIS_PER_PAGE = 200;
const LOAD_MORE_AT_PIXELS_FROM_BOTTOM = 500;

export default class EmojiPicker extends React.PureComponent {
    static propTypes = {
        onEmojiClick: PropTypes.func.isRequired,
        customEmojisEnabled: PropTypes.bool,
        emojiMap: PropTypes.object.isRequired,
        recentEmojis: PropTypes.array.isRequired,
        userSkinTone: PropTypes.string.isRequired,
        customEmojiPage: PropTypes.number.isRequired,
        visible: PropTypes.bool,
        currentTeamName: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            getCustomEmojis: PropTypes.func.isRequired,
            searchCustomEmojis: PropTypes.func.isRequired,
            incrementEmojiPickerPage: PropTypes.func.isRequired,
            setUserSkinTone: PropTypes.func.isRequired,
        }).isRequired,
        filter: PropTypes.string.isRequired,
        handleFilterChange: PropTypes.func.isRequired,
    };

    static defaultProps = {
        listHeight: 245,
        customEmojiPage: 0,
        customEmojisEnabled: false,
    };

    static getEmojis(props, state) {
        const {categories, allEmojis} = state;
        const emojiMap = props.emojiMap;
        const customEmojiMap = emojiMap.customEmojis;

        for (const category of Object.keys(categories)) {
            let categoryEmojis = [];
            if (category === 'recent' && props.recentEmojis.length) {
                const recentEmojis = [...props.recentEmojis].reverse();
                categoryEmojis = recentEmojis.filter((name) => {
                    return emojiMap.has(name);
                }).map((name) => {
                    return emojiMap.get(name);
                });
            } else {
                const indices = Emoji.EmojiIndicesByCategory.get(props.userSkinTone).get(category) || [];
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
                    offset: null,
                };
                if (!currentEmoji.image) {
                    // if custom emoji, set proper attributes
                    allEmojis[fileName] = {
                        ...allEmojis[fileName],
                        aliases: currentEmoji.short_names ? currentEmoji.short_names : [currentEmoji.name],
                        category: 'custom',
                        image: fileName,
                    };
                }
            }
        }

        return {categories, allEmojis};
    }

    static getDerivedStateFromProps(props, state) {
        let updatedState = {emojiMap: props.emojiMap, userSkinTone: props.userSkinTone};
        if (JSON.stringify(Object.keys(state.categories)) !== state.categoryKeys || props.emojiMap !== state.emojiMap || props.userSkinTone !== state.userSkinTone) {
            const {categories, allEmojis} = EmojiPicker.getEmojis(props, state);
            updatedState = {...updatedState, categories, allEmojis, categoryKeys: JSON.stringify(Object.keys(categories))};
        }

        return updatedState;
    }

    constructor(props) {
        super(props);

        this.handleScrollThrottle = throttle(this.handleScroll, EMOJI_LAZY_LOAD_SCROLL_THROTTLE, {leading: false, trailing: true});

        this.divHeight = 0;
        this.missingPages = true;
        this.loadingMoreEmojis = false;

        const categories = props.recentEmojis.length ? {...recentEmojiCategory, ...smileysCategory} : smileysCategory;
        this.state = {
            allEmojis: {},
            categories,
            cursor: [-1, -1], // categoryIndex, emojiIndex
            divTopOffset: 0,
            emojisToShow: SYSTEM_EMOJIS_COUNT,
            renderAllCategories: false,
        };
    }

    componentDidMount() {
        if (this.props.customEmojiPage === 0) {
            this.loadMoreCustomEmojis();
        }

        // Delay taking focus because this briefly renders offscreen when using an Overlay
        // so focusing it immediately on mount can cause weird scrolling
        window.requestAnimationFrame(() => {
            if (this.searchInput) {
                this.searchInput.focus();
            }
            this.renderAllCategoriesFrame = window.requestAnimationFrame(() => {
                this.renderAllCategories();
            });
        });

        if (this.emojiPickerContainer) {
            this.divHeight = this.emojiPickerContainer.offsetHeight;
        }

        const rootComponent = document.getElementById('root');
        if (rootComponent) {
            rootComponent.classList.add('emoji-picker--active');
        }
    }

    updateEmojisToShow(divTopOffset) {
        if (divTopOffset === this.state.divTopOffset) {
            return;
        }

        this.setState({divTopOffset});
        if (this.lastVisibleEmoji) {
            const difference = this.lastVisibleEmoji.offsetTop - (divTopOffset + EMOJI_CONTAINER_HEIGHT + EMOJI_LAZY_LOAD_BUFFER);
            if (difference <= 0) {
                const numToLoad = EMOJI_TO_LOAD_PER_UPDATE + Math.ceil((difference / EMOJI_HEIGHT) * EMOJI_PER_ROW * -1);
                this.setState((state) => ({
                    emojisToShow: state.emojisToShow + numToLoad,
                }));
            }
        }
    }

    componentWillUnmount() {
        if (this.renderAllCategoriesFrame) {
            window.cancelAnimationFrame(this.renderAllCategoriesFrame);
        }

        const rootComponent = document.getElementById('root');
        if (rootComponent) {
            rootComponent.classList.remove('emoji-picker--active');
        }
    }

    renderAllCategories = () => {
        const categories = this.props.recentEmojis.length ? {...recentEmojiCategory, ...CATEGORIES} : CATEGORIES;
        this.setState((state) => ({
            categories: {
                ...categories,
                ...state.categories,
            },
            renderAllCategories: true,
        }));
    }

    loadMoreCustomEmojis = async () => {
        if (!this.props.customEmojisEnabled || this.loadingMoreEmojis) {
            return;
        }

        this.loadingMoreEmojis = true;

        const {data} = await this.props.actions.getCustomEmojis(this.props.customEmojiPage, EMOJIS_PER_PAGE);
        if (!data) {
            this.loadingMoreEmojis = false;
            return;
        }

        if (data.length < EMOJIS_PER_PAGE) {
            this.missingPages = false;
            this.loadingMoreEmojis = false;
            return;
        }

        await this.props.actions.incrementEmojiPickerPage();

        this.loadingMoreEmojis = false;
    }

    componentDidUpdate(prevProps) {
        if (this.props.visible && !prevProps.visible) {
            this.searchInput.focus();
        }

        if (!this.missingPages || !this.emojiPickerContainer) {
            return;
        }

        const pixelsFromBottom = this.emojiPickerContainer.scrollHeight - this.state.divTopOffset - this.emojiPickerContainer.clientHeight;
        if (pixelsFromBottom <= LOAD_MORE_AT_PIXELS_FROM_BOTTOM) {
            this.loadMoreCustomEmojis();
        }
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

    handleCategoryClick = (categoryName) => {
        this.setState({
            cursor: [Object.keys(this.state.categories).indexOf(categoryName), 0],
        });
        if (this.state.categories[categoryName]) {
            this.updateEmojisToShow(this.state.categories[categoryName].offset);
            this.emojiPickerContainer.scrollTop = this.state.categories[categoryName].offset;
        }
    }

    handleFilterChange = (e) => {
        e.preventDefault();
        const filter = filterEmojiSearchInput(e.target.value);

        if (this.props.customEmojisEnabled && filter && filter.trim() !== '') {
            this.props.actions.searchCustomEmojis(filter);
        }

        this.props.handleFilterChange(filter);

        this.setState(() => ({
            cursor: [-1, -1],
        }));
    }

    handleItemOver = (categoryIndex, emojiIndex) => {
        this.setState({
            cursor: [categoryIndex, emojiIndex],
        });
    }

    handleItemClick = (emoji) => {
        this.props.onEmojiClick(emoji);
    }

    handleCategoryKeyDown = (e) => {
        switch (e.key) {
        case 'ArrowRight':
            e.preventDefault();
            this.selectNextEmoji();
            this.searchInput.focus();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            this.selectPrevEmoji();
            this.searchInput.focus();
            break;
        case 'ArrowUp':
            e.preventDefault();
            this.selectPrevEmoji(EMOJI_PER_ROW);
            this.searchInput.focus();
            break;
        case 'ArrowDown':
            e.preventDefault();
            this.selectNextEmoji(EMOJI_PER_ROW);
            this.searchInput.focus();
            break;
        }
    }

    handleKeyDown = (e) => {
        switch (e.key) {
        case 'ArrowRight':
            if ((this.state.cursor[0] !== -1 || this.state.cursor[1] !== -1) || e.target.selectionStart + 1 > this.props.filter.length) {
                e.preventDefault();
                this.selectNextEmoji();
            }
            break;
        case 'ArrowLeft':
            if (this.state.cursor[0] > 0 || this.state.cursor[1] > 0) {
                e.preventDefault();
                this.selectPrevEmoji();
            } else if (this.state.cursor[0] === 0 && this.state.cursor[1] === 0) {
                this.setState({
                    cursor: [-1, -1],
                });
                e.target.selectionStart = this.props.filter.length;
                e.target.selectionEnd = this.props.filter.length;
                e.preventDefault();
                this.searchInput.focus();
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (e.shiftKey) {
                // If Shift + Ctrl/Cmd + Up is pressed at any time,
                // select/highlight the string to the left of the cursor.
                e.target.selectionStart = 0;
            } else if (this.state.cursor[0] === -1) {
                // If cursor is on the textbox,
                // set the cursor to the beginning of the string.
                e.target.selectionStart = 0;
                e.target.selectionEnd = 0;
            } else if (this.state.cursor[0] === 0 && this.state.cursor[1] < EMOJI_PER_ROW) {
                // If the cursor is highlighting an emoji in the top row,
                // move the cursor back into the text box to the end of the string.
                this.setState({
                    cursor: [-1, -1],
                });
                e.target.selectionStart = this.props.filter.length;
                e.target.selectionEnd = this.props.filter.length;
                this.searchInput.focus();
            } else {
                // Otherwise, move the emoji selector up a row.
                this.selectPrevEmoji(EMOJI_PER_ROW);
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (e.shiftKey) {
                // If Shift + Ctrl/Cmd + Down is pressed at any time,
                // select/highlight the string to the right of the cursor.
                e.target.selectionEnd = this.props.filter.length;
            } else if (this.props.filter && e.target.selectionStart === 0) {
                // If the cursor is at the beginning of the string,
                // move the cursor to the end of the string.
                e.target.selectionStart = this.props.filter.length;
                e.target.selectionEnd = this.props.filter.length;
            } else {
                // Otherwise, move the selection down in the emoji picker.
                this.selectNextEmoji(EMOJI_PER_ROW);
            }
            break;
        case 'Enter':
            e.preventDefault();
            if (this.getCurrentEmojiByCursor(this.state.cursor)) {
                this.props.onEmojiClick(this.getCurrentEmojiByCursor(this.state.cursor));
            }
            break;
        }
    }

    handleScroll = () => {
        if (this.emojiPickerContainer) {
            this.updateEmojisToShow(this.emojiPickerContainer.scrollTop);
        }
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

    onSkinSelected = (skin) => {
        this.props.actions.setUserSkinTone(skin);
    }

    getCategoryByIndex = (index) => {
        if (this.props.filter && index !== 0) {
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
        return this.props.filter ? searchResultsCategory : this.state.categories[key];
    }

    sortEmojis(emojis) {
        const {recentEmojis: recentEmojisProps} = this.props;
        const recentEmojis = [];
        const emojisMinusRecent = [];

        Object.values(emojis).forEach((emoji) => {
            let emojiArray = emojisMinusRecent;
            const alias = 'short_names' in emoji ? emoji.short_names : [emoji.name];
            for (let i = 0; i < alias.length; i++) {
                if (recentEmojisProps.includes(alias[i].toLowerCase())) {
                    emojiArray = recentEmojis;
                }
            }

            emojiArray.push(emoji);
        });

        const sortEmojisHelper = (a, b) => {
            return compareEmojis(a, b, this.props.filter);
        };

        recentEmojis.sort(sortEmojisHelper);

        emojisMinusRecent.sort(sortEmojisHelper);

        return [
            ...recentEmojis,
            ...emojisMinusRecent,
        ];
    }

    getEmojisByCategory(category) {
        if (this.props.filter) {
            const emojis = Object.values(this.state.allEmojis).filter((emoji) => {
                const alias = 'short_names' in emoji ? emoji.short_names : [emoji.name];
                for (let i = 0; i < alias.length; i++) {
                    if (alias[i].toLowerCase().includes(this.props.filter)) {
                        return true;
                    }
                }

                return false;
            });

            return this.sortEmojis(emojis);
        }

        return this.state.categories[category.name].emojiIds.map((emojiId) =>
            this.state.allEmojis[emojiId]);
    }

    getCurrentEmojiName() {
        const emoji = this.getCurrentEmojiByCursor(this.state.cursor);
        if (!emoji) {
            return '';
        }
        const name = 'short_name' in emoji ? emoji.short_name : emoji.name;
        return name.replace(/_/g, ' ');
    }

    getCurrentEmojiCategoryName() {
        const categories = Object.keys(this.state.categories);
        let currentCategoryName = categories[0];

        for (let i = categories.length - 1; i >= 0; i--) {
            // go through in reverse so that you get the last category that matches
            const category = this.state.categories[categories[i]];
            if (category.offset && this.state.divTopOffset > category.offset - 20) {
                currentCategoryName = categories[i];
                break;
            }
        }
        return currentCategoryName;
    }

    emojiCategories() {
        const categories = this.props.recentEmojis.length ? {...recentEmojiCategory, ...CATEGORIES} : CATEGORIES;
        const categoryKeys = Object.keys(categories);
        const currentCategoryName = this.props.filter ? categoryKeys[0] : this.getCurrentEmojiCategoryName();
        const emojiPickerCategories = categoryKeys.map((categoryName) => {
            const category = categories[categoryName];

            return (
                <EmojiPickerCategory
                    key={'header-' + category.name}
                    category={category}
                    icon={
                        <i
                            className={category.className}
                        />
                    }
                    onCategoryClick={this.handleCategoryClick}
                    selected={currentCategoryName === category.name}
                    enable={!this.props.filter}
                />
            );
        });
        return (
            <div
                id='emojiPickerCategories'
                className='emoji-picker__categories'
                onKeyDown={this.handleCategoryKeyDown}
            >
                {emojiPickerCategories}
            </div>
        );
    }

    emojiSearch() {
        return (
            <div className='emoji-picker__search-container'>
                <div className='emoji-picker__text-container'>
                    <span className='icon-magnify icon emoji-picker__search-icon'/>
                    <FormattedMessage
                        id='emoji_picker.search_emoji'
                        defaultMessage='Search for an emoji'
                    >
                        {(ariaLabel) => (
                            <LocalizedInput
                                id='emojiPickerSearch'
                                aria-label={ariaLabel}
                                ref={this.emojiSearchInput}
                                className='emoji-picker__search'
                                data-testid='emojiInputSearch'
                                type='text'
                                onChange={this.handleFilterChange}
                                onKeyDown={this.handleKeyDown}
                                autoComplete='off'
                                placeholder={{id: t('emoji_picker.search'), defaultMessage: 'Search Emoji'}}
                                value={this.props.filter}
                            />
                        )}
                    </FormattedMessage>
                </div>
                <EmojiPickerSkin
                    userSkinTone={this.props.userSkinTone}
                    onSkinSelected={this.onSkinSelected}
                />
            </div>
        );
    }

    emojiCurrentResults() {
        const {filter} = this.props;
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
                    role='application'
                >
                    {items}
                </EmojiPickerCategorySection>
            )];

            if (items.length === 0) {
                return (
                    <NoResultsIndicator
                        variant={NoResultsVariant.ChannelSearch}
                        titleValues={{channelName: `"${this.props.filter}"`}}
                    />);
            }
        }

        return (
            <div
                ref={this.emojiPickerContainerRef}
                onScroll={this.handleScrollThrottle}
                className='emoji-picker__items'
                style={(EMOJI_CONTAINER_STYLE, {overflowY: this.state.renderAllCategories ? 'auto' : 'hidden'})}
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
                            alt={'emoji image'}
                            src={imgTrans}
                            className='emojisprite'
                        />
                    </div>
                );
            }
            return (
                <EmojiPickerItem
                    // eslint-disable-next-line react/no-array-index-key
                    key={emoji.image + ':' + emojiIndex}
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

    updateCategoryOffset = (categoryName, offset) => {
        if (categoryName !== CATEGORY_SEARCH_RESULTS) {
            this.setState((state) => ({
                categories: {
                    ...state.categories,
                    [categoryName]: {
                        ...state.categories[categoryName],
                        offset,
                    },
                },
            }));
        }
    }

    render() {
        return (
            <div
                className='emoji-picker__inner'
                role='application'
            >
                <div
                    aria-live='assertive'
                    className='sr-only'
                >
                    <FormattedMessage
                        id='emoji_picker_item.emoji_aria_label'
                        defaultMessage='{emojiName} emoji'
                        values={{
                            emojiName: this.getCurrentEmojiName(),
                        }}
                    />
                </div>
                {this.emojiSearch()}
                {this.emojiCategories()}
                {this.emojiCurrentResults()}
                <EmojiPickerPreview
                    emoji={this.getCurrentEmojiByCursor(this.state.cursor)}
                    customEmojisEnabled={this.props.customEmojisEnabled}
                    currentTeamName={this.props.currentTeamName}
                />
            </div>
        );
    }
}

/* eslint-enable max-lines */
