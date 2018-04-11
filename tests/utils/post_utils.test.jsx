// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {Posts} from 'mattermost-redux/constants';

import * as PostUtils from 'utils/post_utils.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';

describe('PostUtils.containsAtChannel', function() {
    test('should return correct @all (same for @channel)', function() {
        for (const data of [
            {
                text: '',
                result: false,
            },
            {
                text: 'all',
                result: false,
            },
            {
                text: '@allison',
                result: false,
            },
            {
                text: '@ALLISON',
                result: false,
            },
            {
                text: '@all123',
                result: false,
            },
            {
                text: '123@all',
                result: false,
            },
            {
                text: 'hey@all',
                result: false,
            },
            {
                text: 'hey@all.com',
                result: false,
            },
            {
                text: '@all',
                result: true,
            },
            {
                text: '@ALL',
                result: true,
            },
            {
                text: '@all hey',
                result: true,
            },
            {
                text: 'hey @all',
                result: true,
            },
            {
                text: 'HEY @ALL',
                result: true,
            },
            {
                text: 'hey @all!',
                result: true,
            },
            {
                text: 'hey @all:+1:',
                result: true,
            },
            {
                text: 'hey @ALL:+1:',
                result: true,
            },
            {
                text: '`@all`',
                result: false,
            },
            {
                text: '@someone `@all`',
                result: false,
            },
            {
                text: '``@all``',
                result: false,
            },
            {
                text: '```@all```',
                result: false,
            },
            {
                text: '```\n@all\n```',
                result: false,
            },
            {
                text: '```````\n@all\n```````',
                result: false,
            },
            {
                text: '```code\n@all\n```',
                result: false,
            },
            {
                text: '~~~@all~~~',
                result: true,
            },
            {
                text: '~~~\n@all\n~~~',
                result: false,
            },
            {
                text: ' /not_cmd @all',
                result: true,
            },
            {
                text: '/cmd @all',
                result: false,
            },
            {
                text: '/cmd @all test',
                result: false,
            },
            {
                text: '/cmd test @all',
                result: false,
            },
            {
                text: '@channel',
                result: true,
            },
            {
                text: '@channel.',
                result: true,
            },
            {
                text: '@channel/test',
                result: true,
            },
            {
                text: 'test/@channel',
                result: true,
            },
            {
                text: '@all/@channel',
                result: true,
            },
            {
                text: '@cha*nnel*',
                result: false,
            },
            {
                text: '@cha**nnel**',
                result: false,
            },
            {
                text: '*@cha*nnel',
                result: false,
            },
            {
                text: '[@chan](https://google.com)nel',
                result: false,
            },
            {
                text: '@cha![](https://myimage)nnel',
                result: false,
            },
        ]) {
            const containsAtChannel = PostUtils.containsAtChannel(data.text);

            assert.equal(containsAtChannel, data.result, data.text);
        }
    });

    describe('messageHtmlToComponent', () => {
        test('plain text', () => {
            const input = 'Hello, world!';
            const html = TextFormatting.formatText(input);

            expect(PostUtils.messageHtmlToComponent(html)).toMatchSnapshot();
        });

        test('latex', () => {
            const input = `This is some latex!
\`\`\`latex
x^2 + y^2 = z^2
\`\`\`

\`\`\`latex
F_m - 2 = F_0 F_1 \\dots F_{m-1}
\`\`\`

That was some latex!`;
            const html = TextFormatting.formatText(input);

            expect(PostUtils.messageHtmlToComponent(html)).toMatchSnapshot();
        });
    });
});

describe('PostUtils.combineUserActivitySystemPost', () => {
    test('should return null', () => {
        expect(PostUtils.combineUserActivitySystemPost()).toBeNull();
        expect(PostUtils.combineUserActivitySystemPost([])).toBeNull();
    });

    const postAddToChannel1 = {type: Posts.POST_TYPES.ADD_TO_CHANNEL, user_id: 'user_id_1', props: {addedUserId: 'added_user_id_1'}};
    const postAddToChannel2 = {type: Posts.POST_TYPES.ADD_TO_CHANNEL, user_id: 'user_id_1', props: {addedUserId: 'added_user_id_2'}};
    const postAddToChannel3 = {type: Posts.POST_TYPES.ADD_TO_CHANNEL, user_id: 'user_id_1', props: {addedUserId: 'added_user_id_3'}};
    const postAddToChannel4 = {type: Posts.POST_TYPES.ADD_TO_CHANNEL, user_id: 'user_id_2', props: {addedUserId: 'added_user_id_4'}};
    test('should match return for ADD_TO_CHANNEL', () => {
        const out1 = {[Posts.POST_TYPES.ADD_TO_CHANNEL]: {user_id_1: ['added_user_id_1']}};
        expect(PostUtils.combineUserActivitySystemPost([postAddToChannel1])).toEqual(out1);

        const out2 = {[Posts.POST_TYPES.ADD_TO_CHANNEL]: {user_id_1: ['added_user_id_1', 'added_user_id_2']}};
        expect(PostUtils.combineUserActivitySystemPost([postAddToChannel1, postAddToChannel2])).toEqual(out2);

        const out3 = {[Posts.POST_TYPES.ADD_TO_CHANNEL]: {user_id_1: ['added_user_id_1', 'added_user_id_2', 'added_user_id_3']}};
        expect(PostUtils.combineUserActivitySystemPost([postAddToChannel1, postAddToChannel2, postAddToChannel3])).toEqual(out3);

        const out4 = {[Posts.POST_TYPES.ADD_TO_CHANNEL]: {user_id_1: ['added_user_id_1', 'added_user_id_2', 'added_user_id_3'], user_id_2: ['added_user_id_4']}};
        expect(PostUtils.combineUserActivitySystemPost([postAddToChannel1, postAddToChannel2, postAddToChannel3, postAddToChannel4])).toEqual(out4);
    });

    const postAddToTeam1 = {type: Posts.POST_TYPES.ADD_TO_TEAM, user_id: 'user_id_1', props: {addedUserId: 'added_user_id_1'}};
    const postAddToTeam2 = {type: Posts.POST_TYPES.ADD_TO_TEAM, user_id: 'user_id_1', props: {addedUserId: 'added_user_id_2'}};
    const postAddToTeam3 = {type: Posts.POST_TYPES.ADD_TO_TEAM, user_id: 'user_id_1', props: {addedUserId: 'added_user_id_3'}};
    const postAddToTeam4 = {type: Posts.POST_TYPES.ADD_TO_TEAM, user_id: 'user_id_2', props: {addedUserId: 'added_user_id_4'}};
    test('should match return for ADD_TO_TEAM', () => {
        const out1 = {[Posts.POST_TYPES.ADD_TO_TEAM]: {user_id_1: ['added_user_id_1']}};
        expect(PostUtils.combineUserActivitySystemPost([postAddToTeam1])).toEqual(out1);

        const out2 = {[Posts.POST_TYPES.ADD_TO_TEAM]: {user_id_1: ['added_user_id_1', 'added_user_id_2']}};
        expect(PostUtils.combineUserActivitySystemPost([postAddToTeam1, postAddToTeam2])).toEqual(out2);

        const out3 = {[Posts.POST_TYPES.ADD_TO_TEAM]: {user_id_1: ['added_user_id_1', 'added_user_id_2', 'added_user_id_3']}};
        expect(PostUtils.combineUserActivitySystemPost([postAddToTeam1, postAddToTeam2, postAddToTeam3])).toEqual(out3);

        const out4 = {[Posts.POST_TYPES.ADD_TO_TEAM]: {user_id_1: ['added_user_id_1', 'added_user_id_2', 'added_user_id_3'], user_id_2: ['added_user_id_4']}};
        expect(PostUtils.combineUserActivitySystemPost([postAddToTeam1, postAddToTeam2, postAddToTeam3, postAddToTeam4])).toEqual(out4);
    });

    const postJoinChannel1 = {type: Posts.POST_TYPES.JOIN_CHANNEL, user_id: 'user_id_1'};
    const postJoinChannel2 = {type: Posts.POST_TYPES.JOIN_CHANNEL, user_id: 'user_id_2'};
    const postJoinChannel3 = {type: Posts.POST_TYPES.JOIN_CHANNEL, user_id: 'user_id_3'};
    const postJoinChannel4 = {type: Posts.POST_TYPES.JOIN_CHANNEL, user_id: 'user_id_4'};
    test('should match return for JOIN_CHANNEL', () => {
        const out1 = {[Posts.POST_TYPES.JOIN_CHANNEL]: ['user_id_1']};
        expect(PostUtils.combineUserActivitySystemPost([postJoinChannel1])).toEqual(out1);

        const out2 = {[Posts.POST_TYPES.JOIN_CHANNEL]: ['user_id_1', 'user_id_2']};
        expect(PostUtils.combineUserActivitySystemPost([postJoinChannel1, postJoinChannel2])).toEqual(out2);

        const out3 = {[Posts.POST_TYPES.JOIN_CHANNEL]: ['user_id_1', 'user_id_2', 'user_id_3']};
        expect(PostUtils.combineUserActivitySystemPost([postJoinChannel1, postJoinChannel2, postJoinChannel3])).toEqual(out3);

        const out4 = {[Posts.POST_TYPES.JOIN_CHANNEL]: ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4']};
        expect(PostUtils.combineUserActivitySystemPost([postJoinChannel1, postJoinChannel2, postJoinChannel3, postJoinChannel4])).toEqual(out4);
    });

    const postJoinTeam1 = {type: Posts.POST_TYPES.JOIN_TEAM, user_id: 'user_id_1'};
    const postJoinTeam2 = {type: Posts.POST_TYPES.JOIN_TEAM, user_id: 'user_id_2'};
    const postJoinTeam3 = {type: Posts.POST_TYPES.JOIN_TEAM, user_id: 'user_id_3'};
    const postJoinTeam4 = {type: Posts.POST_TYPES.JOIN_TEAM, user_id: 'user_id_4'};
    test('should match return for JOIN_TEAM', () => {
        const out1 = {[Posts.POST_TYPES.JOIN_TEAM]: ['user_id_1']};
        expect(PostUtils.combineUserActivitySystemPost([postJoinTeam1])).toEqual(out1);

        const out2 = {[Posts.POST_TYPES.JOIN_TEAM]: ['user_id_1', 'user_id_2']};
        expect(PostUtils.combineUserActivitySystemPost([postJoinTeam1, postJoinTeam2])).toEqual(out2);

        const out3 = {[Posts.POST_TYPES.JOIN_TEAM]: ['user_id_1', 'user_id_2', 'user_id_3']};
        expect(PostUtils.combineUserActivitySystemPost([postJoinTeam1, postJoinTeam2, postJoinTeam3])).toEqual(out3);

        const out4 = {[Posts.POST_TYPES.JOIN_TEAM]: ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4']};
        expect(PostUtils.combineUserActivitySystemPost([postJoinTeam1, postJoinTeam2, postJoinTeam3, postJoinTeam4])).toEqual(out4);
    });

    const postLeaveChannel1 = {type: Posts.POST_TYPES.LEAVE_CHANNEL, user_id: 'user_id_1'};
    const postLeaveChannel2 = {type: Posts.POST_TYPES.LEAVE_CHANNEL, user_id: 'user_id_2'};
    const postLeaveChannel3 = {type: Posts.POST_TYPES.LEAVE_CHANNEL, user_id: 'user_id_3'};
    const postLeaveChannel4 = {type: Posts.POST_TYPES.LEAVE_CHANNEL, user_id: 'user_id_4'};
    test('should match return for LEAVE_CHANNEL', () => {
        const out1 = {[Posts.POST_TYPES.LEAVE_CHANNEL]: ['user_id_1']};
        expect(PostUtils.combineUserActivitySystemPost([postLeaveChannel1])).toEqual(out1);

        const out2 = {[Posts.POST_TYPES.LEAVE_CHANNEL]: ['user_id_1', 'user_id_2']};
        expect(PostUtils.combineUserActivitySystemPost([postLeaveChannel1, postLeaveChannel2])).toEqual(out2);

        const out3 = {[Posts.POST_TYPES.LEAVE_CHANNEL]: ['user_id_1', 'user_id_2', 'user_id_3']};
        expect(PostUtils.combineUserActivitySystemPost([postLeaveChannel1, postLeaveChannel2, postLeaveChannel3])).toEqual(out3);

        const out4 = {[Posts.POST_TYPES.LEAVE_CHANNEL]: ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4']};
        expect(PostUtils.combineUserActivitySystemPost([postLeaveChannel1, postLeaveChannel2, postLeaveChannel3, postLeaveChannel4])).toEqual(out4);
    });

    const postLeaveTeam1 = {type: Posts.POST_TYPES.LEAVE_TEAM, user_id: 'user_id_1'};
    const postLeaveTeam2 = {type: Posts.POST_TYPES.LEAVE_TEAM, user_id: 'user_id_2'};
    const postLeaveTeam3 = {type: Posts.POST_TYPES.LEAVE_TEAM, user_id: 'user_id_3'};
    const postLeaveTeam4 = {type: Posts.POST_TYPES.LEAVE_TEAM, user_id: 'user_id_4'};
    test('should match return for LEAVE_TEAM', () => {
        const out1 = {[Posts.POST_TYPES.LEAVE_TEAM]: ['user_id_1']};
        expect(PostUtils.combineUserActivitySystemPost([postLeaveTeam1])).toEqual(out1);

        const out2 = {[Posts.POST_TYPES.LEAVE_TEAM]: ['user_id_1', 'user_id_2']};
        expect(PostUtils.combineUserActivitySystemPost([postLeaveTeam1, postLeaveTeam2])).toEqual(out2);

        const out3 = {[Posts.POST_TYPES.LEAVE_TEAM]: ['user_id_1', 'user_id_2', 'user_id_3']};
        expect(PostUtils.combineUserActivitySystemPost([postLeaveTeam1, postLeaveTeam2, postLeaveTeam3])).toEqual(out3);

        const out4 = {[Posts.POST_TYPES.LEAVE_TEAM]: ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4']};
        expect(PostUtils.combineUserActivitySystemPost([postLeaveTeam1, postLeaveTeam2, postLeaveTeam3, postLeaveTeam4])).toEqual(out4);
    });

    const postRemoveFromChannel1 = {type: Posts.POST_TYPES.REMOVE_FROM_CHANNEL, props: {removedUserId: 'user_id_1'}};
    const postRemoveFromChannel2 = {type: Posts.POST_TYPES.REMOVE_FROM_CHANNEL, props: {removedUserId: 'user_id_2'}};
    const postRemoveFromChannel3 = {type: Posts.POST_TYPES.REMOVE_FROM_CHANNEL, props: {removedUserId: 'user_id_3'}};
    const postRemoveFromChannel4 = {type: Posts.POST_TYPES.REMOVE_FROM_CHANNEL, props: {removedUserId: 'user_id_4'}};
    test('should match return for REMOVE_FROM_CHANNEL', () => {
        const out1 = {[Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: ['user_id_1']};
        expect(PostUtils.combineUserActivitySystemPost([postRemoveFromChannel1])).toEqual(out1);

        const out2 = {[Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: ['user_id_1', 'user_id_2']};
        expect(PostUtils.combineUserActivitySystemPost([postRemoveFromChannel1, postRemoveFromChannel2])).toEqual(out2);

        const out3 = {[Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: ['user_id_1', 'user_id_2', 'user_id_3']};
        expect(PostUtils.combineUserActivitySystemPost([postRemoveFromChannel1, postRemoveFromChannel2, postRemoveFromChannel3])).toEqual(out3);

        const out4 = {[Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4']};
        expect(PostUtils.combineUserActivitySystemPost([postRemoveFromChannel1, postRemoveFromChannel2, postRemoveFromChannel3, postRemoveFromChannel4])).toEqual(out4);
    });

    const postRemoveFromTeam1 = {type: Posts.POST_TYPES.REMOVE_FROM_TEAM, user_id: 'user_id_1'};
    const postRemoveFromTeam2 = {type: Posts.POST_TYPES.REMOVE_FROM_TEAM, user_id: 'user_id_2'};
    const postRemoveFromTeam3 = {type: Posts.POST_TYPES.REMOVE_FROM_TEAM, user_id: 'user_id_3'};
    const postRemoveFromTeam4 = {type: Posts.POST_TYPES.REMOVE_FROM_TEAM, user_id: 'user_id_4'};
    test('should match return for REMOVE_FROM_TEAM', () => {
        const out1 = {[Posts.POST_TYPES.REMOVE_FROM_TEAM]: ['user_id_1']};
        expect(PostUtils.combineUserActivitySystemPost([postRemoveFromTeam1])).toEqual(out1);

        const out2 = {[Posts.POST_TYPES.REMOVE_FROM_TEAM]: ['user_id_1', 'user_id_2']};
        expect(PostUtils.combineUserActivitySystemPost([postRemoveFromTeam1, postRemoveFromTeam2])).toEqual(out2);

        const out3 = {[Posts.POST_TYPES.REMOVE_FROM_TEAM]: ['user_id_1', 'user_id_2', 'user_id_3']};
        expect(PostUtils.combineUserActivitySystemPost([postRemoveFromTeam1, postRemoveFromTeam2, postRemoveFromTeam3])).toEqual(out3);

        const out4 = {[Posts.POST_TYPES.REMOVE_FROM_TEAM]: ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4']};
        expect(PostUtils.combineUserActivitySystemPost([postRemoveFromTeam1, postRemoveFromTeam2, postRemoveFromTeam3, postRemoveFromTeam4])).toEqual(out4);
    });

    test('should match return on combination', () => {
        const out1 = {
            [Posts.POST_TYPES.ADD_TO_CHANNEL]: {user_id_1: ['added_user_id_1', 'added_user_id_2']},
            [Posts.POST_TYPES.ADD_TO_TEAM]: {user_id_1: ['added_user_id_1', 'added_user_id_2']},
        };
        expect(PostUtils.combineUserActivitySystemPost([postAddToChannel1, postAddToChannel2, postAddToTeam1, postAddToTeam2])).toEqual(out1);

        const out2 = {
            [Posts.POST_TYPES.JOIN_CHANNEL]: ['user_id_1', 'user_id_2'],
            [Posts.POST_TYPES.JOIN_TEAM]: ['user_id_1', 'user_id_2'],
        };
        expect(PostUtils.combineUserActivitySystemPost([postJoinChannel1, postJoinChannel2, postJoinTeam1, postJoinTeam2])).toEqual(out2);

        const out3 = {
            [Posts.POST_TYPES.LEAVE_CHANNEL]: ['user_id_1', 'user_id_2'],
            [Posts.POST_TYPES.LEAVE_TEAM]: ['user_id_1', 'user_id_2'],
        };
        expect(PostUtils.combineUserActivitySystemPost([postLeaveChannel1, postLeaveChannel2, postLeaveTeam1, postLeaveTeam2])).toEqual(out3);

        const out4 = {
            [Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: ['user_id_1', 'user_id_2'],
            [Posts.POST_TYPES.REMOVE_FROM_TEAM]: ['user_id_1', 'user_id_2'],
        };
        expect(PostUtils.combineUserActivitySystemPost([postRemoveFromChannel1, postRemoveFromChannel2, postRemoveFromTeam1, postRemoveFromTeam2])).toEqual(out4);

        const out5 = {
            [Posts.POST_TYPES.ADD_TO_CHANNEL]: {user_id_1: ['added_user_id_1', 'added_user_id_2']},
            [Posts.POST_TYPES.JOIN_CHANNEL]: ['user_id_1', 'user_id_2'],
            [Posts.POST_TYPES.LEAVE_CHANNEL]: ['user_id_1', 'user_id_2'],
            [Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: ['user_id_1', 'user_id_2'],
        };
        expect(PostUtils.combineUserActivitySystemPost([
            postAddToChannel1,
            postJoinChannel1,
            postLeaveChannel1,
            postRemoveFromChannel1,
            postAddToChannel2,
            postJoinChannel2,
            postLeaveChannel2,
            postRemoveFromChannel2,
        ])).toEqual(out5);

        const out6 = {
            [Posts.POST_TYPES.ADD_TO_TEAM]: {user_id_1: ['added_user_id_3'], user_id_2: ['added_user_id_4']},
            [Posts.POST_TYPES.JOIN_TEAM]: ['user_id_3', 'user_id_4'],
            [Posts.POST_TYPES.LEAVE_TEAM]: ['user_id_3', 'user_id_4'],
            [Posts.POST_TYPES.REMOVE_FROM_TEAM]: ['user_id_3', 'user_id_4'],
        };
        expect(PostUtils.combineUserActivitySystemPost([
            postAddToTeam3,
            postJoinTeam3,
            postLeaveTeam3,
            postRemoveFromTeam3,
            postAddToTeam4,
            postJoinTeam4,
            postLeaveTeam4,
            postRemoveFromTeam4,
        ])).toEqual(out6);

        const out7 = {
            [Posts.POST_TYPES.ADD_TO_CHANNEL]: {user_id_1: ['added_user_id_1', 'added_user_id_2', 'added_user_id_3'], user_id_2: ['added_user_id_4']},
            [Posts.POST_TYPES.JOIN_CHANNEL]: ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4'],
            [Posts.POST_TYPES.LEAVE_CHANNEL]: ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4'],
            [Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4'],

            [Posts.POST_TYPES.ADD_TO_TEAM]: {user_id_1: ['added_user_id_3', 'added_user_id_1', 'added_user_id_2'], user_id_2: ['added_user_id_4']},
            [Posts.POST_TYPES.JOIN_TEAM]: ['user_id_3', 'user_id_4', 'user_id_1', 'user_id_2'],
            [Posts.POST_TYPES.LEAVE_TEAM]: ['user_id_3', 'user_id_4', 'user_id_1', 'user_id_2'],
            [Posts.POST_TYPES.REMOVE_FROM_TEAM]: ['user_id_3', 'user_id_4', 'user_id_1', 'user_id_2'],
        };
        expect(PostUtils.combineUserActivitySystemPost([
            postAddToTeam3,
            postJoinTeam3,
            postLeaveTeam3,
            postRemoveFromTeam3,
            postAddToTeam4,
            postJoinTeam4,
            postLeaveTeam4,
            postRemoveFromTeam4,

            postAddToChannel1,
            postJoinChannel1,
            postLeaveChannel1,
            postRemoveFromChannel1,
            postAddToChannel2,
            postJoinChannel2,
            postLeaveChannel2,
            postRemoveFromChannel2,

            postAddToChannel3,
            postJoinChannel3,
            postLeaveChannel3,
            postRemoveFromChannel3,
            postAddToChannel4,
            postJoinChannel4,
            postLeaveChannel4,
            postRemoveFromChannel4,

            postAddToTeam1,
            postJoinTeam1,
            postLeaveTeam1,
            postRemoveFromTeam1,
            postAddToTeam2,
            postJoinTeam2,
            postLeaveTeam2,
            postRemoveFromTeam2,
        ])).toEqual(out7);
    });
});
