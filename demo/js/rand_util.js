/**
 * Utilities for generating random values within various distributions.
 *
 * @license MIT
 */


/**
 * Build a function which returns a value sampled from a normal distribution.
 *
 * @param mean The mean value of the normal distribution to be sampled.
 * @param std The standard deviation of the normal distribution to be sampled.
 * @returns Function which, when called, returns a random value.
 */
function buildNorm(mean, std) {
    return d3.randomNormal(mean, std);
}


/**
 * Build a function which returns a value sampled from a log normal distribution.
 *
 * @param mean The mean value of the distribution to be sampled.
 * @param std The standard deviation of the distribution to be sampled.
 * @returns Function which, when called, returns a random value. Note that the log normal
 *      distribution sampled has an inner mean = 0 and inner std = 0.5. The resulting value has
 *      one subtracted and the result is multiplied by the parameter std and the parameter mean
 *      added.
 */
function buildLogNorm(mean, std) {
    const inner = d3.randomLogNormal(0, 0.5)
    return () => {
        const location = inner() - 1;
        return location * std + mean;
    }
}


/**
 * Get a random value selected from a normal or log normal distribution.
 *
 * @param low The low end of the range.
 * @param high The high end of the range.
 * @param mustBePositive If true, negative values will be returned as zero. If false, negative
 *      values will be returned.
 * @param rangeStd How many standard deviations (+/- around the mean) the range made by high and
 *      low represent in the distribution.
 * @param useLogNorm True if log norm should be used (see buildLogNorm) and false if normal
 *      distribution should be used.
 */
function getNormVal(low, high, mustBePositive, rangeStd, useLogNorm) {
    if (useLogNorm === undefined) {
        useLogNorm = false;
    }
    
    if (high == low) {
        return high;
    } else if (high < low) {
        const newHigh = low;
        const newLow = high;
        low = newLow;
        high = newHigh;
    }

    const mean = (high + low) / 2;
    const std = (high - mean) / rangeStd;
    const randFunc = useLogNorm ? buildLogNorm(mean, std) : buildNorm(mean, std);
    const candidate = randFunc();

    if (mustBePositive) {
        return candidate < 0 ? 0 : candidate;
    } else {
        return candidate;
    }
}
