// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {AsciiToUtf8Characters} from "./constants"

export const asciiToUtf8Variants = (term: string) => {
    var variants = [term]
    term.split('').forEach((t: string, i: number) => {
        if ((AsciiToUtf8Characters as {[key: string]: string[]})[t] && i < 5) {
            (AsciiToUtf8Characters as {[key: string]: string[]})[t].forEach((utf8char: string) => {
                const substr = asciiToUtf8Variants(term.replace(t, utf8char))
                variants = variants.concat(substr)
            })
        }
    })

    return variants
}