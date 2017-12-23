
var SetOfIntegers = function(boundaries) {
    this.boundaries = boundaries;
};

SetOfIntegers.all = function() {
    return new SetOfIntegers([]);
};

SetOfIntegers.none = function() {
    return new SetOfIntegers([
        { x: -Infinity, include: false }
    ]);
};

SetOfIntegers.fromCompare = function(compareOp, x) {
    var boundaries = [];

    var isInclusive = compareOp.length > 1 && compareOp[1] === '=';

    // console.log("Make for", compareOp, x);
    // console.log(isInclusive);

    if(compareOp[0] === '>') {
        boundaries.push({
            x: -Infinity,
            include: false
        });
    }
    else if(compareOp[0] === '=') {
        boundaries.push({
            x: -Infinity,
            include: false
        });

        boundaries.push({
            x: x,
            include: isInclusive
        });
    }

    boundaries.push({
        x: x,
        include: isInclusive
    });

    // console.log("Made", boundaries);

    return new SetOfIntegers(boundaries);
};

SetOfIntegers.prototype.toString = function() {
    var intervals = [];

    var currentInclude = true;

    var prev = {
        x: -Infinity,
        include: false
    };

    this.boundaries.forEach(function(current) {
        if(currentInclude && (current.x !== prev.x || (current.include && prev.include))) {
            intervals.push({
                'l': prev,
                'r': current
            })
        }

        prev = current;
        currentInclude = !currentInclude;
    });

    if(currentInclude) {
        intervals.push({
            'l': prev,
            'r': {
                x: +Infinity,
                include: false
            }
        });
    }

    var s = [];

    intervals.forEach(function(int) {
        var ss = "";

        if(int.l.include) {
            ss += "[";
        }
        else {
            ss += "(";
        }

        ss += int.l.x + "; " + int.r.x;

        if(int.r.include) {
            ss += "]";
        }
        else {
            ss += ")";
        }

        s.push(ss);
    });

    s = s.join("u");

    return s ? s : "(none)";
};

SetOfIntegers.prototype.intersect = function(other) {
    var newBoundaries = [];

    var insideBoth = true;

    var iThis = 0, iOther = 0;

    var insideThis = true, insideOther = true;

    while(iThis < this.boundaries.length && iOther < other.boundaries.length) {
        var newX;
        var newInclude;

        if(this.boundaries[iThis].x < other.boundaries[iOther].x) {

            var thisBound = this.boundaries[iThis++];

            newX = thisBound.x;
            newInclude = thisBound.include;

            insideThis = !insideThis;
        }
        else if(this.boundaries[iThis].x === other.boundaries[iOther].x) {
            newX = this.boundaries[iThis].x;

            newInclude = this.boundaries[iThis].include && other.boundaries[iOther].include;

            iThis += 1;
            iOther += 1;

            insideThis = !insideThis;
            insideOther = !insideOther;
        }
        else /* > */ {
            var otherBound = other.boundaries[iOther++];

            newX = otherBound.x;
            newInclude = otherBound.include;

            insideOther = !insideOther;
        }

        if(insideBoth !== (insideThis && insideOther)) {
            insideBoth = insideThis && insideOther;

            newBoundaries.push({
                x: newX,
                include: newInclude
            })
        }
    }

    if(insideOther) {
        while(iThis < this.boundaries.length) {
            for(; iThis < this.boundaries.length; iThis++) {
                newBoundaries.push({
                    x: this.boundaries[iThis].x,
                    include: this.boundaries[iThis].include
                })
            }
        }
    }

    if(insideThis) {
        while(iOther < other.boundaries.length) {
            for(; iOther < other.boundaries.length; iOther++) {
                newBoundaries.push({
                    x: other.boundaries[iOther].x,
                    include: other.boundaries[iOther].include
                })
            }
        }
    }

    return new SetOfIntegers(newBoundaries);
};

SetOfIntegers.prototype.union = function(other) {
    //
};
