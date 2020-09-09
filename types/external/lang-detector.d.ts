// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

declare module 'lang-detector' {
    export default function detectLang(snippet: string, options: {statistics: true; heuristic?: bool}): {detected: string; statistics: {[key: string]: number}};
    export default function detectLang(snippet: string, options?: {statistics?: false; heuristic?: bool}): string | {detected: string; statistics: {[key: string]: number}};
}
