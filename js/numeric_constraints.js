
var SetOfNumbers = function(xs) {
    this.xs = xs;
};

SetOfNumbers.all = function(constraint) {
    var newSet = {};

    for(var i = -1000; i <= 1000; i++) {
        if(constraint === undefined || constraint(i)) {
            newSet[i] = true;
        }
    }

    return new SetOfNumbers(newSet);
};

SetOfNumbers.none = function() {
    return new SetOfNumbers({});
};

SetOfNumbers.fromCompare = function(compareOp, x) {
    var constraint;

    if(compareOp === '<') {
        constraint = function(y) {
            return y < x;
        }
    }
    else if(compareOp === '<=') {
        constraint = function(y) {
            return y <= x;
        }
    }
    else if(compareOp === '>=') {
        constraint = function(y) {
            return y >= x;
        }
    }
    else if(compareOp === '>') {
        constraint = function(y) {
            return y > x;
        }
    }
    else if(compareOp === '==') {
        return {
            x: true
        }
    }
    else {
        return undefined;
    }

    return new SetOfNumbers.all(constraint);
};

SetOfNumbers.prototype.clone = function() {
    return new SetOfNumbers(Object.assign({}, this.xs));
};

SetOfNumbers.prototype.toString = function() {
    if(this.xs.length === 0) {
        return "(none)";
    }
    else {
        return "(from " + Math.min.apply(null, Object.keys(this.xs))
            + " to " + Math.max.apply(null, Object.keys(this.xs)) + ")";
    }
};

SetOfNumbers.prototype.intersect = function(other) {
    var newSetXs = {};

    for(var x in other.xs) {
        if(this.xs.hasOwnProperty(x)) {
            newSetXs[x] = true;
        }
    }

    return new SetOfNumbers(newSetXs);
};

SetOfNumbers.prototype.union = function(other) {
    var newSet = this.clone();

    for(var x in other.xs) {
        newSet.xs[x] = true;
    }

    return newSet;
};

SetOfNumbers.prototype.subtract = function(other) {
    var newSet = this.clone();

    for(var x in other.xs) {
        if(newSet.xs.hasOwnProperty(x)) {
            delete newSet.xs[x];
        }
    }

    return newSet;
};

SetOfNumbers.prototype.subtractFrom = function(other) {
    return other.subtract(this);
};

SetOfNumbers.prototype.pickAny = function() {
    for(var i = 0; i <= 1000; i++) {
        if(this.xs.hasOwnProperty(i)) {
            return i;
        }
        else if(this.xs.hasOwnProperty(-i)) {
            return -i;
        }
    }

    return null;
};

SetOfNumbers.prototype.isEmpty = function() {
    return this.xs.length === 0;
};
