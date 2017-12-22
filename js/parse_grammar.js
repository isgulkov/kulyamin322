
var parseProduction = function() {
    var TERM_SYMBOL = /[a-zA-Z0-9]/

    return function(s) {
        s = s.replace(' ', '').replace('\t', '');

        var prod = [];

        var currentTerm = "";

        var alternativesStack = [];

        for(var i = 0; i < s.length; i++) {
            if(s[i] === '(') {
                if(currentTerm !== "") {
                    if(alternativesStack.length !== 0) {
                        alternativesStack[alternativesStack.length - 1].push(currentTerm);
                    }
                    else {
                        prod.push(currentTerm);
                    }

                    currentTerm = "";
                }

                alternativesStack.push([]);
            }
            else if(TERM_SYMBOL.test(s[i])) {
                currentTerm += s[i];
            }
            else if(s[i] === '|') {
                if(currentTerm !== "") {
                    alternativesStack[alternativesStack.length - 1].push(currentTerm);
                    currentTerm = "";
                }
            }
            else if(s[i] === ')') {
                if(alternativesStack.length !== 0) {
                    if(currentTerm !== "") {
                        alternativesStack[alternativesStack.length - 1].push(currentTerm);
                        currentTerm = "";
                    }

                    var alt = alternativesStack.pop();

                    if(alt.length > 1) {
                        prod.push({
                            '|': alt
                        });
                    }
                    else {
                        prod.push(alt[0]);
                    }
                }
            }
            else if('*+?'.indexOf(s[i]) !== -1) {
                if(currentTerm !== "") {
                    var newSubProd = {};

                    newSubProd[s[i]] = currentTerm;

                    prod.push(newSubProd);

                    currentTerm = "";
                }
                else {
                    var lastItem = prod.pop();

                    var modifiedItem = {};

                    modifiedItem[s[i]] = lastItem;

                    prod.push(modifiedItem);
                }
            }
        }

        if(currentTerm !== "") {
            prod.push(currentTerm);
        }

        return prod;
    }
}();
