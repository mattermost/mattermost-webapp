// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Provider, {ResultCallbackParams} from './provider';
import SearchDateSuggestion from './search_date_suggestion';

type Item = {label: string; date: string};
type Callback = (callbackParams: Omit<ResultCallbackParams, 'items'> & {items: Item[]}) => void;

export default class SearchDateProvider extends Provider {
    handlePretextChanged(pretext: string, resultsCallback: Callback): boolean {
        const captured = (/\b(?:on|before|after):\s*(\S*)$/i).exec(pretext.toLowerCase());
        if (captured) {
            const datePrefix = captured[1];

            this.startNewRequest(datePrefix);

            const dates: Item[] = Object.assign([], [{label: 'Selected Date', date: datePrefix}]);
            const terms = dates.map((date) => date.date);

            resultsCallback({
                matchedPretext: datePrefix,
                terms,
                items: dates,
                component: SearchDateSuggestion,
            });
        }

        return Boolean(captured);
    }

    allowDividers(): boolean {
        return false;
    }

    presentationType(): string {
        return 'date';
    }
}
