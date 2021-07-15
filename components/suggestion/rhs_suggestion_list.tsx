// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';

import AutosizeTextarea from 'components/autosize_textarea';
import QuickInput from 'components/quick_input';

import Constants from 'utils/constants';

import SuggestionList from './suggestion_list';

type Props = React.ComponentProps<SuggestionList> & {
    target: React.Ref<QuickInput>;
}

export default function RhsSuggestionList(props: Props): JSX.Element {
    const [position, setPosition] = useState('top');

    const {target, ...otherProps} = props;

    useEffect(() => {
        const input = target.current;

        if (otherProps.open) {
            const inputTop = (input?.getInput() as AutosizeTextarea).getDOMNode()?.getBoundingClientRect().top || 0;
            const newPosition = (inputTop < Constants.SUGGESTION_LIST_SPACE_RHS) ? 'bottom' : 'top';

            if (newPosition !== position) {
                // This potentially causes a second render when the list position changes, but that's better
                // than checking the bounding rectangle while rendering.
                setPosition(newPosition);
            }
        }
    }, [target, otherProps.open]);

    return (
        <SuggestionList
            {...otherProps}
            location={position}
        />
    );
}
