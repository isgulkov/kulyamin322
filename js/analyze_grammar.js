
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
