function buildNorm(mean, std) {
    return d3.randomNormal(mean, std);
}


function buildLogNorm(mean, std) {
    const inner = d3.randomLogNormal(0, 0.5)
    return () => {
        const location = inner() - 1;
        return location * std + mean;
    }
}


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
