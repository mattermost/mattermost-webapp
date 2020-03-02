// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import {EmojiCategory} from 'mattermost-redux/types/emojis';

// eslint-disable-next-line consistent-return
export const useEmojiCategoryIconComponent = (category: EmojiCategory) => useMemo(() => {
    switch (category) {
    case 'activity': return Activity;
    case 'custom': return Custom;
    case 'flags': return Flags;
    case 'foods': return Foods;
    case 'nature': return Nature;
    case 'objects': return Objects;
    case 'people': return People;
    case 'places': return Places;
    case 'recent': return Recent;
    case 'symbols': return Symbols;
    }
}, [category]);

const Recent = () => (
    <FormattedMessage
        id='emoji_picker.recent'
        defaultMessage='Recently Used'
    >
        {(title: string) => (
            <i
                title={title}
                className='fa fa-clock-o'
            />
        )}
    </FormattedMessage>
);

const People = () => (
    <FormattedMessage
        id='emoji_picker.people'
        defaultMessage='People'
    >
        {(title: string) => (
            <i
                title={title}
                className='fa fa-smile-o'
            />
        )}
    </FormattedMessage>
);

const Nature = () => (
    <FormattedMessage
        id='emoji_picker.nature'
        defaultMessage='Nature'
    >
        {(title: string) => (
            <i
                title={title}
                className='fa fa-leaf'
            />
        )}
    </FormattedMessage>
);

const Foods = () => (
    <FormattedMessage
        id='emoji_picker.foods'
        defaultMessage='Foods'
    >
        {(title: string) => (
            <i
                title={title}
                className='fa fa-cutlery'
            />
        )}
    </FormattedMessage>
);

const Activity = () => (
    <FormattedMessage
        id='emoji_picker.activity'
        defaultMessage='Activity'
    >
        {(title: string) => (
            <i
                title={title}
                className='fa fa-futbol-o'
            />
        )}
    </FormattedMessage>
);

const Places = () => (
    <FormattedMessage
        id='emoji_picker.places'
        defaultMessage='Places'
    >
        {(title: string) => (
            <i
                title={title}
                className='fa fa-plane'
            />
        )}
    </FormattedMessage>
);

const Objects = () => (
    <FormattedMessage
        id='emoji_picker.objects'
        defaultMessage='Objects'
    >
        {(title: string) => (
            <i
                title={title}
                className='fa fa-lightbulb-o'
            />
        )}
    </FormattedMessage>
);

const Symbols = () => (
    <FormattedMessage
        id='emoji_picker.symbols'
        defaultMessage='Symbols'
    >
        {(title: string) => (
            <i
                title={title}
                className='fa fa-heart-o'
            />
        )}
    </FormattedMessage>
);

const Flags = () => (
    <FormattedMessage
        id='emoji_picker.flags'
        defaultMessage='Flags'
    >
        {(title: string) => (
            <i
                title={title}
                className='fa fa-flag-o'
            />
        )}
    </FormattedMessage>
);

const Custom = () => (
    <FormattedMessage
        id='emoji_picker.custom'
        defaultMessage='Custom'
    >
        {(title: string) => (
            <i
                title={title}
                className='fa fa-at'
            />
        )}
    </FormattedMessage>
);
