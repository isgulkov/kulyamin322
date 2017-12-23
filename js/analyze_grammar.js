
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

var findVariantVectorsThatCoverAllPairs = function(prod)
{
    var allVariantVs = getAllVariantVectors(prod);

    var selectedVarVs = [];

    var numTotalPairs = countTotalPairs(prod);
    var knownPairs = {};

    while(Object.keys(knownPairs).length < numTotalPairs) {
        var iBest = indexMaxByKey(allVariantVs, function(varId) {
            return countNewPairs(knownPairs, varId);
        });

        getPairs(allVariantVs[iBest]).forEach(function(p) {
            knownPairs[p] = true;
        });

        selectedVarVs.push(allVariantVs[iBest]);

        allVariantVs.splice(iBest, 1);
    }

    return selectedVarVs;
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
