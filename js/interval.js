
var Interval = function(start, end, includeStart, includeEnd) {
    this.start = start === undefined ? -Infinity : start;
    this.end = end === undefined ? +Infinity : end;

    this.includeStart = includeStart === undefined ? false : includeStart;
    this.includeEnd = includeEnd === undefined ? false : includeEnd;
};

Interval.prototype.intersectWith = function(other) {
    var newInterval = new Interval(this.start, this.end, this.includeStart, this.includeEnd);

    if(other.start >= this.start) {
        newInterval.start = other.start;

        newInterval.includeStart  = this.includeStart && other.includeStart;
    }

    if(other.end <= this.end) {
        newInterval.end = other.end();

        newInterval.includeEnd = this.includeEnd & other.includeEnd;
    }
};

Interval.prototype.isNotEmpty = function() {
    if(this.start < this.end) {
        return true;
    }
    else if(this.start === this.end) {
        return this.includeStart && this.includeEnd;
    }
    else {
        return false;
    }
};

var Union = function() {
    this.intervals = [new Interval()];

    arguments.forEach(function(interval) {

    })
};

Union.prototype.unionWith = function(other) {
    if(other instanceof Union) {
        other.intervals.forEach(function(interval) {
            this.unionWith(interval);
        });
    }
    else if(other instanceof Interval) {
        
    }
};
