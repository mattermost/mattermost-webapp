// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {AppBinding, AppContext} from '@mattermost/types/apps';

export type CommonProps = {
    app_id: string;
    binding: AppBinding;
    context: AppContext;
    viewComponent: React.ElementType;
    handleBindingClick: (binding: AppBinding) => void;
};
