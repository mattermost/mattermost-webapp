// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {TemplateIllustration, TemplateType, WorkTemplate} from '@mattermost/types/worktemplates';

export function getTemplateDefaultIllustration(template: WorkTemplate): TemplateIllustration | null {
    const channels = template.content.filter((c) => c.channel).map((c) => c.channel!);
    if (channels.length) {
        return {
            type: TemplateType.CHANNELS,
            illustration: channels[0].illustration,
        };
    }
    if (template.description.channel.illustration) {
        return {
            type: TemplateType.CHANNELS,
            illustration: template.description.channel.illustration,
        };
    }

    const boards = template.content.filter((c) => c.board).map((c) => c.board!);
    if (boards.length) {
        return {
            type: TemplateType.BOARDS,
            illustration: boards[0].illustration,
        };
    }
    if (template.description.board.illustration) {
        return {
            type: TemplateType.BOARDS,
            illustration: template.description.board.illustration,
        };
    }

    const playbooks = template.content.filter((c) => c.playbook).map((c) => c.playbook!);
    if (playbooks.length) {
        return {
            type: TemplateType.PLAYBOOKS,
            illustration: playbooks[0].illustration,
        };
    }
    if (template.description.playbook.illustration) {
        return {
            type: TemplateType.PLAYBOOKS,
            illustration: template.description.playbook.illustration,
        };
    }

    return null;
}

