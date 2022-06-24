// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import fs from 'fs';

import pdf, {Result} from 'pdf-parse';

/**
 * Checks whether a file exist in the tests/downloads folder and return the content of it.
 */
export default async function getPdfContent(filePath: string): Promise<Result> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data;
}
