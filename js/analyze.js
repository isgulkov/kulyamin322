
var oppositeOp = function(op) {
    return ['<', '>', '<=', '>=', '=='][['>', '<', '>=', '<=', '=='].indexOf(op)];
};

var areSimpleExprsEqual = function(one, another) { // TODO: identical
    if(!one.hasOwnProperty('op') || !another.hasOwnProperty('op')) {
        return undefined;
    }

    if(one.op === another.op) {
        if(one.left.value === another.left.value && one.right.value === another.right.value) {
            // console.log(one, another);
            return true;
        }
        else if(one.op === '==') {
            // console.log(one, another);
            return one.left.value === another.right.value && one.right.value === another.left.value
        }

        // console.log(one, another);
        return false;
    }
    else if(one.op === oppositeOp(another.op)) {
        // console.log(one, another);
        return one.left.value === another.right.value && one.right.value === another.left.value;
    }
};

var putIdOnTheLeft = function(simpleExpr) {
    if(simpleExpr.left.kind === 'atomicInt') {
        var tmp = simpleExpr.left;
        simpleExpr.left = simpleExpr.right;
        simpleExpr.right = tmp;

        simpleExpr.op = oppositeOp(simpleExpr.op);
    }
};

var printExpr = function(expr) {
    if(expr === undefined) {
        return "" + undefined;
    }

    if(expr.hasOwnProperty('value')) {
        return "" + expr.value;
    }
    else if(expr.hasOwnProperty('left')) {
        return printExpr(expr.left) + " " + expr.op + " " + printExpr(expr.right);
    }
    else if(expr.hasOwnProperty('arg')) {
        return "!(" + printExpr(expr.arg) + ")";
    }
    else {
        return expr; // TODO: remove
    }
};

var evaluateExpr = function(expression, values) {
    if(expression.kind === 'compare') {
        return values[expression];
    }
    else if(expression.kind === 'logic') {
        if(expression.hasOwnProperty('arg')) {
            return !evaluateExpr(expression.arg, values);
        }

        var leftVal = evaluateExpr(expression.left, values);
        var rightVal = evaluateExpr(expression.right, values);

        if(expression.op === 'and') {
            return leftVal && rightVal;
        }
        else if(expression.op === 'or') {
            return leftVal || rightVal;
        }
    }
};

var inverseOp = function(op) {
    return ['<', '<=', '>=', '>'][['>=', '>', '<', '<='].indexOf(op)];
};

var areSimpleExprsInverse = function(one, another) {
    putIdOnTheLeft(one);
    putIdOnTheLeft(another);

    return one.op === inverseOp(another.op) && one.left.value === another.left.value && one.right.value === another.right.value;
};

var getSimpleExprsRecursive = function(expr) {
    if(expr.kind === 'compare') {
        return [expr];
    }
    else if(expr.left !== undefined && expr.right !== undefined) {
        var leftExprs = getSimpleExprsRecursive(expr.left);
        var rightExprs = getSimpleExprsRecursive(expr.right);

        return leftExprs.concat(rightExprs);
    }
    else {
        return [];
    }
};

var extractSimpleExpressions = function() {
    var allSimpleExprs = [];

    for(var i in arguments) {
        var simpleExprs = getSimpleExprsRecursive(arguments[i]);

        console.log(simpleExprs);

        for(var j in simpleExprs) {
            var newSimpleExpr = simpleExprs[j];

            var duplicate = false;

            for(var k in allSimpleExprs) {
                var oldSimpleExpr = allSimpleExprs[k];

                if(areSimpleExprsEqual(newSimpleExpr, oldSimpleExpr) || areSimpleExprsInverse(newSimpleExpr, oldSimpleExpr)) {
                    duplicate = true;
                    break;
                }
            }

            if(!duplicate) {
                allSimpleExprs.push(newSimpleExpr);
            }
        }
    }

    var substituteAllOccurrencesOnTheLeft = function(expression, simpleExpressions) {
        if(expression.hasOwnProperty('left')) {
            substituteAllOccurrences(expression.left, simpleExpressions);
            substituteAllOccurrences(expression.right, simpleExpressions);

            if(expression.left.kind === 'compare') {
                for(var i in simpleExpressions) {
                    if(areSimpleExprsEqual(simpleExpressions[i], expression.left)) {
                        expression.left = simpleExpressions[i];

                        break;
                    }
                    else if(areSimpleExprsInverse(simpleExpressions[i], expression.left)) {
                        expression.left = {
                            kind: 'logic',
                            op: 'not',
                            arg: expression.left
                        };

                        break;
                    }
                }
            }
        }

        if(expression.hasOwnProperty('arg')) {
            substituteAllOccurrences(expression.arg, simpleExpressions);
        }
    };

    var invert = function(expression) {
        if(expression.kind === 'logic' && expression.hasOwnProperty('left')) {
            invert(expression.left);
            invert(expression.right);

            var tmp = expression.left;
            expression.left = expression.right;
            expression.right = tmp;
        }
    };

    var substituteAllOccurrences = function(expression, simpleExpressions) {
        substituteAllOccurrencesOnTheLeft(expression, simpleExpressions);

        invert(expression);

        substituteAllOccurrencesOnTheLeft(expression, simpleExpressions);

        invert(expression);
    };

    var bigExprs = Array.from(arguments);
    bigExprs.forEach(function(expression) {
        substituteAllOccurrences(expression, allSimpleExprs);
    });

    return {
        allSimpleExprs: allSimpleExprs,
        bigExprs: bigExprs
    };
};
