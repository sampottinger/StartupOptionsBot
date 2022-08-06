function getNormVal(low, high, mustBePositive, rangeStd) {
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
    const candidate = d3.randomNormal(mean, std)();

    if (mustBePositive) {
        return candidate < 0 ? 0 : candidate;
    } else {
        return candidate;
    }
}
