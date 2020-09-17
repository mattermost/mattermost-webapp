// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getData} from 'country-list';

export const COUNTRIES = getData().sort((a, b) => (a.name > b.name ? 1 : -1));
