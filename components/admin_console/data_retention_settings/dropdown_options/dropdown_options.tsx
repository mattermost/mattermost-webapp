// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import * as Utils from 'utils/utils.jsx';

export const FOREVER = 'FOREVER';
export const YEARS = 'YEARS';
export const DAYS = 'DAYS';
export const keepForeverOption = () => ({value: FOREVER, label: <div><i className='icon icon-infinity option-icon'/><span>{Utils.localizeMessage('admin.data_retention.form.keepForever', 'Keep forever')}</span></div>});
export const yearsOption = () => ({value: YEARS, label: Utils.localizeMessage('admin.data_retention.form.years', 'Years')});
export const daysOption = () => ({value: DAYS, label: Utils.localizeMessage('admin.data_retention.form.days', 'Days')});
