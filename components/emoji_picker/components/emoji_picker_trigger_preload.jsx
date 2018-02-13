// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

export default class EmojiPickerTriggerPreload extends React.PureComponent {
    static propTypes = {
        allEmojis: PropTypes.object
    };
    render() {
        const sections = Object.values(this.props.allEmojis).
            reduce((result, currentEmoji) => ({
                ...result,
                [currentEmoji.category]: {
                    ...result[currentEmoji.category],
                    [currentEmoji.batch]: 1
                }
            }), {});
        const divs = [];
        Object.keys(sections).forEach((section) => {
            Object.keys(sections[section]).forEach((batch) => {
                const sectionBatch = `emoji-category-${section}-${batch}`;
                divs.push(
                    <div
                        key={sectionBatch}
                        className={sectionBatch}
                    />
                );
            });
        });
        return (
            <div className='preload-emojis'>
                {divs}
            </div>
        );
    }
}
