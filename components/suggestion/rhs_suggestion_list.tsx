// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';

import QuickInput from 'components/quick_input';

import Constants from 'utils/constants';

import SuggestionList from './suggestion_list';

type Props = React.ComponentProps<typeof SuggestionList> & {
    inputRef: React.RefObject<QuickInput>;
}

export default function RhsSuggestionList(props: Props): JSX.Element {
    const [position, setPosition] = useState<Props['location']>('top');

    useEffect(() => {
        const input = props.inputRef.current;

        if (props.open) {
            const inputTop = (input?.getInput() as HTMLTextAreaElement).getBoundingClientRect().top || 0;
            const newPosition = (inputTop < Constants.SUGGESTION_LIST_SPACE_RHS) ? 'bottom' : 'top';

            if (newPosition !== position) {
                // This potentially causes a second render when the list position changes, but that's better
                // than checking the bounding rectangle while rendering.
                setPosition(newPosition);
            }
        }
    }, [props.inputRef, props.open]);

    return (
        <SuggestionList
            {...props}
            location={position}
        />
    );
}
