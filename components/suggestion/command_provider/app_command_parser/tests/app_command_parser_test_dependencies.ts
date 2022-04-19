// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import thunk from 'redux-thunk';
export {thunk};

const configureStore = require('redux-mock-store').default;
export {configureStore};

export {Client4} from 'mattermost-redux/client';

export type {AppBinding, AppForm} from 'mattermost-redux/types/apps';
export {AppFieldTypes} from 'mattermost-redux/constants/apps';

export const checkForExecuteSuggestion = true;
