// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable max-lines */

import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import * as Emoji from 'utils/emoji.jsx';
import {compareEmojis} from 'utils/emoji_utils';
import {getSkin} from 'utils/emoticons';

import EmojiPickerPreview from './components/emoji_picker_preview';
import EmojiPickerSearch from './components/emoji_picker_search';
import EmojiPickerSkin from './components/emoji_picker_skin';
import EmojiPickerCategories from './components/emoji_picker_categories';
import EmojiPickerCustomEmojiButton from './components/emoji_picker_custom_emoji_button';
import EmojiPickerCurrentResults from './components/emoji_picker_current_results';

import {CATEGORIES, SEARCH_EMOJI_CATEGORY, RECENT_EMOJI_CATEGORY} from './constants';

const EMOJI_LAZY_LOAD_BUFFER = 75;
const EMOJI_PER_ROW = 9; // needs to match variable `$emoji-per-row` in _variables.scss
const EMOJI_TO_LOAD_PER_UPDATE = 135;
const SYSTEM_EMOJIS_COUNT = 1476;

function getEmojiFilename(emoji) {
    return emoji.image || emoji.filename || emoji.id;
}

const EMOJIS_PER_PAGE = 200;

export default class EmojiPicker extends React.PureComponent {
    static propTypes = {
        onEmojiClick: PropTypes.func.isRequired,
        customEmojisEnabled: PropTypes.bool,
        emojiMap: PropTypes.object.isRequired,
        recentEmojis: PropTypes.array.isRequired,
        userSkinTone: PropTypes.string.isRequired,
        customEmojiPage: PropTypes.number.isRequired,
        visible: PropTypes.bool,
        actions: PropTypes.shape({
            getCustomEmojis: PropTypes.func.isRequired,
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
            updatedState = {...updatedState, allEmojis, categories};
        }

        return updatedState;
    }

    constructor(props) {
        super(props);

        this.missingPages = true;
        this.loadingMoreEmojis = false;

        const categories = props.recentEmojis.length ? {...RECENT_EMOJI_CATEGORY, ...CATEGORIES} : CATEGORIES;
        this.state = {
            allEmojis: {},
            categories,
            cursor: [-1, -1], // categoryIndex, emojiIndex
            divTopOffset: 0,
            emojisToShow: SYSTEM_EMOJIS_COUNT,
        };

        this.searchInputRef = createRef();
    }

    componentDidMount() {
        if (this.props.customEmojiPage === 0) {
            this.loadMoreCustomEmojis();
        }

        // Delay taking focus because this briefly renders offscreen when using an Overlay
        // so focusing it immediately on mount can cause weird scrolling
        window.requestAnimationFrame(() => {
            this.searchInputRef?.current?.focus();
        });

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
            this.searchInputRef?.current?.focus();
        }
    }

    handleCategoryClick = (categoryName) => {
        this.setState({
            cursor: [Object.keys(this.state.categories).indexOf(categoryName), 0],
        });
        if (this.state.categories[categoryName]) {
            this.updateEmojisToShow(this.state.categories[categoryName].offset);
        }
    }

    resetCursorPosition = () => {
        this.setState(() => ({
            cursor: [-1, -1],
        }));
    }

    selectNextEmoji = (offset = 1) => {
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

    selectPrevEmoji = (offset = 1) => {
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
        return this.props.filter ? SEARCH_EMOJI_CATEGORY.searchResults : this.state.categories[key];
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

    convertEmojiToUserSkinTone = (emoji, emojiSkin, userSkinTone) => {
        if (emojiSkin === userSkinTone) {
            return emoji;
        }

        let newEmojiId = '';

        // If its a default (yellow) emoji, get the skin variation from its property
        if (emojiSkin === 'default') {
            newEmojiId = emoji.skin_variations[userSkinTone].unified;
        } else if (userSkinTone === 'default') {
            // If default (yellow) skin is selected, remove the skin code from emoji id
            newEmojiId = emoji.unified.replace(`-${emojiSkin}`, '');
        } else {
            // If non default skin is selected, add the new skin selected code to emoji id
            newEmojiId = emoji.unified.replace(emojiSkin, userSkinTone);
        }

        const emojiIndex = Emoji.EmojiIndicesByUnicode.get(newEmojiId.toLowerCase());
        return Emoji.Emojis[emojiIndex];
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

        if (category.name === 'recent') {
            const recentEmojiIds = this.state.categories?.recent?.emojiIds ?? [];
            if (recentEmojiIds.length === 0) {
                return [];
            }

            const recentEmojis = new Map();

            recentEmojiIds.forEach((emojiId) => {
                const emoji = this.state.allEmojis[emojiId];
                const emojiSkin = getSkin(emoji);

                if (emojiSkin) {
                    const emojiWithUserSkin = this.convertEmojiToUserSkinTone(emoji, emojiSkin, this.props.userSkinTone);
                    recentEmojis.set(emojiWithUserSkin.unified, emojiWithUserSkin);
                } else {
                    recentEmojis.set(emojiId, emoji);
                }
            });

            return Array.from(recentEmojis.values());
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
                <div className='emoji-picker__search-container'>
                    <EmojiPickerSearch
                        ref={this.searchInputRef}
                        filter={this.props.filter}
                        customEmojisEnabled={this.props.customEmojisEnabled}
                        cursor={this.state.cursor}
                        handleFilterChange={this.props.handleFilterChange}
                        resetCursorPosition={this.resetCursorPosition}
                        selectNextEmoji={this.selectNextEmoji}
                        selectPrevEmoji={this.selectPrevEmoji}
                    />
                    <EmojiPickerSkin
                        userSkinTone={this.props.userSkinTone}
                        onSkinSelected={this.props.actions.setUserSkinTone}
                    />
                </div>
                <EmojiPickerCategories
                    recentEmojis={this.props.recentEmojis}
                    filter={this.props.filter}
                    onClick={this.handleCategoryClick}
                    selectNextEmoji={this.selectNextEmoji}
                    selectPrevEmoji={this.selectPrevEmoji}
                />
                <EmojiPickerCurrentResults
                    filter={this.props.filter}
                    categories={this.state.categories}
                    allEmojis={this.state.allEmojis}
                    recentEmojis={this.props.recentEmojis}
                />
                <div className='emoji-picker__footer'>
                    <EmojiPickerPreview
                        emoji={this.getCurrentEmojiByCursor(this.state.cursor)}
                    />
                    <EmojiPickerCustomEmojiButton
                        customEmojisEnabled={this.props.customEmojisEnabled}
                    />
                </div>
            </div>
        );
    }
}
