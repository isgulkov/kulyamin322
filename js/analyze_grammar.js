
var getAllVariantIds = function(prod) {
    var allVariants = [[]];

    prod.forEach(function(subProd) {
        var varIds = getLocalVariantIds(subProd);

        allVariants = appendToAll(allVariants, varIds);
    });

    return allVariants;
};

var getLocalVariantIds = function(subProd) {
    if(typeof subProd === 'string') {
        return [0];
    }
    else if(subProd.hasOwnProperty('?')) {
        return [0, 1];
    }
    else if(subProd.hasOwnProperty('*') || subProd.hasOwnProperty('+')) {
        return [0, 1, 2];
    }
    else if(subProd.hasOwnProperty('|')) {
        var varIds = [];

        for(var i = 0; i < subProd['|'].length; i++) {
            varIds.push(i);
        }

        return varIds;
    }
};

var appendToAll = function(penis, enlargement) {
    var result = [];

    penis.forEach(function(s){
        enlargement.forEach(function(t) {
            result.push(s.concat([t]));
        });
    });

    return result;
};

var getVariantByd = function(prod, variantId) {
    var variant = [];

    variantId.forEach(function(id, i) {
        variant.push(getSubProdVariantById(prod[i], id));
    });

    return variant;
};

var getSubProdVariantById = function(subProd, i) {
    if(subProd.hasOwnProperty('?')) {
        return i == 1 ? subProd['?'] : "";
    }
    else if(subProd.hasOwnProperty('*')) {
        return subProd['*'].repeat(i);
    }
    else if(subProd.hasOwnProperty('+')) {
        return subProd['+'].repeat(i + 1);
    }
    else if(typeof subProd === 'string') {
        return subProd;
    }
    else if(subProd.hasOwnProperty('|')) {
        return subProd['|'][i];
    }
};

var findVariantsThatCoverAllPairs = function(prod)
{
    var allVariantIds = getAllVariantIds(prod);

    var selectedVarIds = [];

    var numTotalPairs = countTotalPairs(prod);
    var knownPairs = {};

    while(Object.keys(knownPairs).length < numTotalPairs) {
        var iBest = indexMaxByKey(allVariantIds, function(varId) {
            return countNewPairs(knownPairs, varId);
        });

        getPairs(allVariantIds[iBest]).forEach(function(p) {
            knownPairs[p] = true;
        });

        selectedVarIds.push(allVariantIds[iBest]);

        allVariantIds.splice(iBest, 1);
    }

    return selectedVarIds;
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

var countNewPairs = function(knownPairs, variantId) {
    var variantPairs = getPairs(variantId);

    var numNewPairs = 0;

    // console.log(variantPairs);

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
            result += getLocalVariantIds(prod[i]).length * getLocalVariantIds(prod[j]).length;
        }
    }

    return result
}

var getPairs = function(variantId) {
    var pairs = [];

    for(var i = 0; i < variantId.length; i++) {
        for(var j = i + 1; j < variantId.length; j++) {
            pairs.push(1000 * i + 100 * variantId[i] + 10 * j + variantId[j]);
        }
    }

    return pairs;
};
