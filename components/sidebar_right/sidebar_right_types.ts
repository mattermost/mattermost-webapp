// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ActionTypes} from 'react-select';

export type ReturnSetRhsExpanded = {

    type: ActionTypes;
    expanded: boolean;

}

export type ReturnUpdateSearchTerms = {
    type: ActionTypes;
    terms: string;
}
