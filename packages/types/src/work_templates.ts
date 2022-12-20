// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {RequireOnlyOne} from './utilities';

export type WorkTemplatesState = {
    categories: Category[];
    templatesInCategory: Record<string, WorkTemplate[]>;
    playbookTemplates: [];
}

export interface WorkTemplate {
    id: string;
    category: string;
    useCase: string;
    description: Description;
    illustration: string;
    visibility: Visibility;
    content: ValidContent[];
}

export const categories = ['product', 'devops', 'company_wide', 'leadership', 'design'];
export interface Category {
    id: typeof categories[number];
    name: string;
}

export interface Channel {
    id: string;
    name: string;
    illustration: string;
}
export interface Board {
    id: string;
    name: string;
    illustration: string;
}
export interface Playbook {
    id: string;
    name: string;
    illustration: string;
}
export interface Integration {
    id: string;
    name?: string;
    icon?: string;
    installed?: boolean;
}

interface Content {
    channel?: Channel;
    board?: Board;
    playbook?: Playbook;
    integration?: Integration;
}

type ValidContent = RequireOnlyOne<Content, 'channel' | 'board' | 'playbook' | 'integration'>;

export interface MessageWithIllustration {
    message: string;
    illustration?: string;
}
type MessageWithMandatoryIllustration = Partial<MessageWithIllustration> & Required<Pick<MessageWithIllustration, 'illustration'>>;

interface Description {
    channel: MessageWithIllustration;
    board: MessageWithIllustration;
    playbook: MessageWithIllustration;
    integration: MessageWithMandatoryIllustration;
}

export enum Visibility {
    Public = 'public',
    Private = 'private',
}
