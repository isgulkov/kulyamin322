
var oppositeOp = function(op) {
    return ['<', '>', '<=', '>=', '=='][['>', '<', '>=', '<=', '=='].indexOf(op)];
};

var areSimpleExprsEqual = function(one, another) {
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

var printSimpleExpr = function(expr) {
    return expr.left.value + " " + expr.op + " " + expr.right.value;
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

    return allSimpleExprs;
};
