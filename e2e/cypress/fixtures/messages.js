// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {generateRandomNumber} from '../utils';

module.exports = {
    TINY: `${generateRandomNumber(1, 10000)} Hello`,
    SMALL: `${generateRandomNumber(1, 10000)} Hello from the world`,
    MEDIUM: `${generateRandomNumber(1, 10000)} The quick brown fox jumps over the lazy dog`,
    LARGE: `${generateRandomNumber(1, 10000)} Sphinx of black quartz, judge my vow. Glib jocks quiz nymph to vex dwarf`,
    HUGE: `${generateRandomNumber(1, 10000)} This pangram contains four As, one B, two Cs, one D, thirty Es, six Fs, five Gs, seven Hs, eleven Is, one J, one K, two Ls, two Ms, eighteen Ns, fifteen Os, two Ps, one Q, five Rs, twenty-seven Ss, eighteen Ts, two Us, seven Vs, eight Ws, two Xs, three Ys, & one Z`,
};
