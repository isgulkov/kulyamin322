
var getAllVariantVectors = function(prod) {
    var allVariants = [[]];

    prod.forEach(function(subProd) {
        var varIds = getLocalVariants(subProd);

        allVariants = appendToAllArrays(allVariants, varIds);
    });

    return allVariants;
};

var appendToAllArrays = function(penises, enlargements) {
    var result = [];

    penises.forEach(function(s){
        enlargements.forEach(function(t) {
            result.push(s.concat([t]));
        });
    });

    return result;
};

var getLocalVariants = function(subProd) {
    if(typeof subProd === 'string') {
        return [subProd];
    }
    else if(subProd.hasOwnProperty('?')) {
        return [""].concat(getLocalVariants(subProd['?']));
    }
    else if(subProd.hasOwnProperty('*')) {
        var variants = {
            "": true
        };

        var sVariants = [""].concat(getLocalVariants(subProd['*']));

        sVariants.forEach(function(s) {
            sVariants.forEach(function(t) {
                variants[s + t] = true;
            });
        });

        return Object.keys(variants);
    }
    else if(subProd.hasOwnProperty('+')) {
        var newVariants = {};

        var pVariants = [""].concat(getLocalVariants(subProd['+']));

        pVariants.forEach(function(s) {
            pVariants.forEach(function(t) {
                pVariants.forEach(function(u) {
                    newVariants[s + t + u] = true;
                });
            });
        });

        delete newVariants[""];

        return Object.keys(newVariants);
    }
    else if(subProd.hasOwnProperty('|')) {
        return subProd['|'];
    }
};

var getExplodedProd = function(prod) {
    return prod.map(getLocalVariants);
};

var sortInOrderOfNumVarsDesc = function(explodedProd) {
    var sortedProd = [];
    var oldLocations = {};

    explodedProd = explodedProd.concat([]);

    for(var i = 0; i < explodedProd.length; i++) {
        var iBiggest = null;
        var nBiggest = 0;

        for(var j = 0; j < explodedProd.length; j++) {
            if(explodedProd[j] === null) {
                continue;
            }

            if(explodedProd[j].length > nBiggest) {
                nBiggest = explodedProd[j].length;
                iBiggest = j;
            }
        }

        oldLocations[i] = iBiggest;
        sortedProd.push(explodedProd[iBiggest]);
        explodedProd[iBiggest] = null;
    }

    return {
        sortedProd: sortedProd,
        oldLocations: oldLocations
    };
};

var getPairwiseSetForTwo = function(nVars, mVars) {
    var pairwiseSet = [];

    for(var i = 0; i < nVars; i++) {
        for(var j = 0; j < mVars; j++) {
            pairwiseSet.push([i, j]);
        }
    }

    return pairwiseSet;
};

var getAllPairsBetweenManyAndOne = function(manyNs, oneN) {
    var allPairs = {};

    manyNs.forEach(function(particularN, iP) {
        for(var i = 0; i < particularN; i++) {
            for(var j = 0; j < oneN; j++) {
                allPairs["" + iP + "-" + i + "/" + j] = true;
            }
        }
    });

    return allPairs;
};

var getPairsWithParticularTest = function(v, newX) {
    var pairs = {};

    v.forEach(function(x, i) {
        pairs["" + i + "-" + x + "/" + newX] = true;
    });

    return pairs;
};

var producePairwiseSetIPO = function(numsOfVariants) {
    if(numsOfVariants.length < 2) {
        return []; // no pairs between just one parameter LMAO
    }

    // initialize with a pairwise set for the first two parameters, which is just the set of all pairs

    var pairwiseSet = getPairwiseSetForTwo(numsOfVariants[0], numsOfVariants[1]);

    for(var i = 2; i < numsOfVariants.length; i++) {
        var uncoveredPairs = getAllPairsBetweenManyAndOne(numsOfVariants.concat([]).splice(0, i), numsOfVariants[i]);

        // horizontal growth

        for(var iTest = 0; iTest < pairwiseSet.length; iTest++) {
            var bestX = 0; // Replace with "don't care"?
            var bestXPairs = {};
            var bestNumNewPairs = 0;

            for(var candX = 0; candX < numsOfVariants[i]; candX++) {
                var currentPairs = getPairsWithParticularTest(pairwiseSet[iTest], candX);

                var numNewPairs = 0;

                Object.keys(currentPairs).forEach(function(pair) {
                    if(uncoveredPairs[pair] !== undefined) {
                        numNewPairs += 1;
                    }
                });

                if(numNewPairs > bestNumNewPairs) {
                    bestX = candX;
                    bestNumNewPairs = numNewPairs;
                    bestXPairs = currentPairs;
                }
            }

            pairwiseSet[iTest].push(bestX);

            Object.keys(bestXPairs).forEach(function(pair) {
                delete uncoveredPairs[pair];
            });
        }

        // TODO: vertical growth?
    }

    return pairwiseSet;
};

var findVariantVectorsThatCoverAllPairs = function(prod) {
    var explodedProd = getExplodedProd(prod);

    var sortResult = sortInOrderOfNumVarsDesc(explodedProd);

    var numVectors = producePairwiseSetIPO(sortResult.sortedProd.map(function(vars) { return vars.length; }));

    numVectors = numVectors.map(function(v) {
        var newV = v.map(function() { return 0; });

        v.forEach(function(x, i) {
            newV[sortResult.oldLocations[i]] = x;
        });

        return newV;
    });

    var coveringSetOfWords = numVectors.map(function(v) {
        return v.map(function(x, i) {
            return explodedProd[i][x];
        })
    });

    var uncoveredPairs = getAllPairs(explodedProd);

    getActualPairs(coveringSetOfWords).forEach(function(pair) {
        uncoveredPairs.splice(uncoveredPairs.indexOf(pair), 1);
    });

    console.log("Left uncovered:", uncoveredPairs);

    return coveringSetOfWords;
};

var indexMaxByKey = function(arr, f) {
    var iMax = 0;
    var maxKey = f(arr[0]);

    for(var i = 1; i < arr.length; i++) {
        var currentKey = f(arr[i]);

        if(currentKey > maxKey) {
            maxKey = currentKey;
            iMax = i;
        }
    }

    return iMax;
};

var countNewPairs = function(knownPairs, variantV) {
    var variantPairs = getAllPairs(variantV);

    var numNewPairs = 0;

    variantPairs.forEach(function(p) {
        if(knownPairs[p] === undefined) {
            numNewPairs += 1;
        }
    });

    return numNewPairs;
};

var countTotalPairs = function(prod) {
    var result = 0;

    for(var i = 0; i < prod.length; i++) {
        for(var j = i + 1; j < prod.length; j++) {
            result += getLocalVariants(prod[i]).length * getLocalVariants(prod[j]).length;
        }
    }

    return result
};

var getActualPairs = function(supposedPairwiseSet) {
    var pairs = {};

    for(var iTest = 0; iTest < supposedPairwiseSet.length; iTest++) {
        for(var i = 0; i < supposedPairwiseSet[iTest].length; i++) {
            for(var j = i + 1; j < supposedPairwiseSet[iTest].length; j++) {
                pairs["" + i + supposedPairwiseSet[iTest][i] + "/" + j + supposedPairwiseSet[iTest][j]] = true;
            }
        }
    }

    return Object.keys(pairs);
};

var getAllPairs = function(variantV) {
    var pairs = [];

    for(var i = 0; i < variantV.length; i++) {
        for(var j = i + 1; j < variantV.length; j++) {
            variantV[i].forEach(function(s) {
                variantV[j].forEach(function(t) {
                    pairs.push("" + i + s + "/" + j + t);
                });
            });
        }
    }

    return pairs;
};
