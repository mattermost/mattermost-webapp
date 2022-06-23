// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post} from '@mattermost/types/posts';
import postMessageAs from './post_message_as';

type Arg = Omit<Parameters<typeof postMessageAs>[0], 'message'> & {numberOfMessages: number};

export default async function postListOfMessages(arg: Arg): Promise<{status: number; data: Post}[]> {
    const {numberOfMessages, ...rest} = arg;
    const results = [];

    for (let i = 0; i < numberOfMessages; i++) {
        // Parallel posting of the messages (Promise.all) is not handled well by the server
        // resulting in random failed posts
        // so we use serial posting
        // eslint-disable-next-line no-await-in-loop
        const options: Parameters<typeof postMessageAs>[0] = {message: `Message ${i}`, ...rest}
        results.push(await postMessageAs(options));
    }

    return results;
};
