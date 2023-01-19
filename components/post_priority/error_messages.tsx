// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

function getFirstSpecialMention(specialMentions: {[key: string]: boolean}): string {
    switch (true) {
    case specialMentions.all:
        return 'all';
    case specialMentions.here:
        return 'here';
    case specialMentions.channel:
        return 'channel';
    default:
        return '';
    }
}

export function HasSpecialMentions({specialMentions}: {specialMentions: {[key: string]: boolean}}) {
    return (
        <FormattedMessage
            id={'post_priority.error.special_mentions'}
            defaultMessage={'Cannot use @{mention} to mention recipients of persistent notifications'}
            values={{
                mention: getFirstSpecialMention(specialMentions),
            }}
        />
    );
}

export function HasNoMentions() {
    return (
        <FormattedMessage
            id={'post_priority.error.no_mentions'}
            defaultMessage={'Recipients must be @mentioned'}
        />
    );
}
