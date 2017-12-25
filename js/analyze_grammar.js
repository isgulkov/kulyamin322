
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

var produceVariantNumVectorsIPO = function(numsOfVariants) {
    return [
        numsOfVariants.map(function(v) { return 0; }),
        numsOfVariants.map(function(v) { return v - 1; })
    ]; // TODO: actually implement the IPO algorithm
};

var findVariantVectorsThatCoverAllPairs = function(prod) {
    var explodedProd = getExplodedProd(prod);

    var sortResult = sortInOrderOfNumVarsDesc(explodedProd);

    console.log(sortResult.sortedProd);

    var numVectors = produceVariantNumVectorsIPO(sortResult.sortedProd.map(function(vars) { return vars.length; }));

    numVectors = numVectors.map(function(v) {
        var newV = v.map(function() { return 0; });

        v.forEach(function(x, i) {
            newV[sortResult.oldLocations[i]] = x;
        });

        return newV;
    });

    return numVectors.map(function(v) {
        return v.map(function(x, i) {
            return explodedProd[i][x];
        })
    });
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
    var variantPairs = getPairs(variantV);

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

var getPairs = function(variantV) {
    var pairs = [];

    for(var i = 0; i < variantV.length; i++) {
        for(var j = i + 1; j < variantV.length; j++) {
            pairs.push("" + i + variantV[i] + "/" + j + variantV[j]);
        }
    }

    return pairs;
};
