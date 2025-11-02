import { __export } from "./rolldown-runtime-BusqVNde.js";

//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/geometry.helpers.mjs
const { round: round$4, floor, PI: PI$1 } = Math;
const scale = { linear: function(domain, range, value) {
	var domainSpan = domain[1] - domain[0];
	var rangeSpan = range[1] - range[0];
	return (value - domain[0]) / domainSpan * rangeSpan + range[0] || 0;
} };
const normalizeAngle = function(angle) {
	return angle % 360 + (angle < 0 ? 360 : 0);
};
const snapToGrid = function(value, gridSize) {
	return gridSize * round$4(value / gridSize);
};
const toDeg = function(rad) {
	return 180 * rad / PI$1 % 360;
};
const toRad = function(deg, over360) {
	over360 = over360 || false;
	deg = over360 ? deg : deg % 360;
	return deg * PI$1 / 180;
};
const random = function(min$4, max$4) {
	if (max$4 === void 0) {
		max$4 = min$4 === void 0 ? 1 : min$4;
		min$4 = 0;
	} else if (max$4 < min$4) {
		const temp = min$4;
		min$4 = max$4;
		max$4 = temp;
	}
	return floor(Math.random() * (max$4 - min$4 + 1) + min$4);
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/line.bearing.mjs
const { cos: cos$2, sin: sin$2, atan2: atan2$1 } = Math;
const bearing = function(p, q) {
	var lat1 = toRad(p.y);
	var lat2 = toRad(q.y);
	var lon1 = p.x;
	var lon2 = q.x;
	var dLon = toRad(lon2 - lon1);
	var y = sin$2(dLon) * cos$2(lat2);
	var x = cos$2(lat1) * sin$2(lat2) - sin$2(lat1) * cos$2(lat2) * cos$2(dLon);
	var brng = toDeg(atan2$1(y, x));
	var bearings = [
		"NE",
		"E",
		"SE",
		"S",
		"SW",
		"W",
		"NW",
		"N"
	];
	var index = brng - 22.5;
	if (index < 0) index += 360;
	index = parseInt(index / 45);
	return bearings[index];
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/line.squaredLength.mjs
const squaredLength = function(start, end) {
	var x0 = start.x;
	var y0 = start.y;
	var x1 = end.x;
	var y1 = end.y;
	return (x0 -= x1) * x0 + (y0 -= y1) * y0;
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/line.length.mjs
const length = function(start, end) {
	return Math.sqrt(squaredLength(start, end));
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/types.mjs
const types = {
	Point: 1,
	Line: 2,
	Ellipse: 3,
	Rect: 4,
	Polyline: 5,
	Polygon: 6,
	Curve: 7,
	Path: 8
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/point.mjs
const { abs: abs$2, cos: cos$1, sin: sin$1, sqrt: sqrt$2, min: min$3, max: max$3, atan2, round: round$3, pow: pow$3, PI } = Math;
const Point = function(x, y) {
	if (!(this instanceof Point)) return new Point(x, y);
	if (typeof x === "string") {
		var xy = x.split(x.indexOf("@") === -1 ? " " : "@");
		x = parseFloat(xy[0]);
		y = parseFloat(xy[1]);
	} else if (Object(x) === x) {
		y = x.y;
		x = x.x;
	}
	this.x = x === void 0 ? 0 : x;
	this.y = y === void 0 ? 0 : y;
};
Point.fromPolar = function(distance, angle, origin) {
	origin = new Point(origin);
	var x = abs$2(distance * cos$1(angle));
	var y = abs$2(distance * sin$1(angle));
	var deg = normalizeAngle(toDeg(angle));
	if (deg < 90) y = -y;
	else if (deg < 180) {
		x = -x;
		y = -y;
	} else if (deg < 270) x = -x;
	return new Point(origin.x + x, origin.y + y);
};
Point.random = function(x1, x2, y1, y2) {
	return new Point(random(x1, x2), random(y1, y2));
};
Point.prototype = {
	type: types.Point,
	chooseClosest: function(points) {
		var n = points.length;
		if (n === 1) return new Point(points[0]);
		var closest$1 = null;
		var minSqrDistance = Infinity;
		for (var i = 0; i < n; i++) {
			var p = new Point(points[i]);
			var sqrDistance = this.squaredDistance(p);
			if (sqrDistance < minSqrDistance) {
				closest$1 = p;
				minSqrDistance = sqrDistance;
			}
		}
		return closest$1;
	},
	adhereToRect: function(r) {
		if (r.containsPoint(this)) return this;
		this.x = min$3(max$3(this.x, r.x), r.x + r.width);
		this.y = min$3(max$3(this.y, r.y), r.y + r.height);
		return this;
	},
	angleBetween: function(p1, p2) {
		var angleBetween = this.equals(p1) || this.equals(p2) ? NaN : this.theta(p2) - this.theta(p1);
		if (angleBetween < 0) angleBetween += 360;
		return angleBetween;
	},
	bearing: function(point$1) {
		return bearing(this, point$1);
	},
	changeInAngle: function(dx, dy, ref) {
		return this.clone().offset(-dx, -dy).theta(ref) - this.theta(ref);
	},
	clone: function() {
		return new Point(this);
	},
	cross: function(p1, p2) {
		return p1 && p2 ? (p2.x - this.x) * (p1.y - this.y) - (p2.y - this.y) * (p1.x - this.x) : NaN;
	},
	difference: function(dx, dy) {
		if (Object(dx) === dx) {
			dy = dx.y;
			dx = dx.x;
		}
		return new Point(this.x - (dx || 0), this.y - (dy || 0));
	},
	distance: function(p) {
		return length(this, p);
	},
	dot: function(p) {
		return p ? this.x * p.x + this.y * p.y : NaN;
	},
	equals: function(p) {
		return !!p && this.x === p.x && this.y === p.y;
	},
	lerp: function(p, t) {
		var x = this.x;
		var y = this.y;
		return new Point((1 - t) * x + t * p.x, (1 - t) * y + t * p.y);
	},
	magnitude: function() {
		return sqrt$2(this.x * this.x + this.y * this.y) || .01;
	},
	manhattanDistance: function(p) {
		return abs$2(p.x - this.x) + abs$2(p.y - this.y);
	},
	move: function(ref, distance) {
		var theta = toRad(new Point(ref).theta(this));
		var offset$1 = this.offset(cos$1(theta) * distance, -sin$1(theta) * distance);
		return offset$1;
	},
	normalize: function(length$1) {
		var scale$1 = (length$1 || 1) / this.magnitude();
		return this.scale(scale$1, scale$1);
	},
	offset: function(dx, dy) {
		if (Object(dx) === dx) {
			dy = dx.y;
			dx = dx.x;
		}
		this.x += dx || 0;
		this.y += dy || 0;
		return this;
	},
	reflection: function(ref) {
		return new Point(ref).move(this, this.distance(ref));
	},
	rotate: function(origin, angle) {
		if (angle === 0) return this;
		origin = origin || new Point(0, 0);
		angle = toRad(normalizeAngle(-angle));
		var cosAngle = cos$1(angle);
		var sinAngle = sin$1(angle);
		var x = cosAngle * (this.x - origin.x) - sinAngle * (this.y - origin.y) + origin.x;
		var y = sinAngle * (this.x - origin.x) + cosAngle * (this.y - origin.y) + origin.y;
		this.x = x;
		this.y = y;
		return this;
	},
	round: function(precision) {
		let f = 1;
		if (precision) switch (precision) {
			case 1:
				f = 10;
				break;
			case 2:
				f = 100;
				break;
			case 3:
				f = 1e3;
				break;
			default:
				f = pow$3(10, precision);
				break;
		}
		this.x = round$3(this.x * f) / f;
		this.y = round$3(this.y * f) / f;
		return this;
	},
	scale: function(sx, sy, origin) {
		origin = origin && new Point(origin) || new Point(0, 0);
		this.x = origin.x + sx * (this.x - origin.x);
		this.y = origin.y + sy * (this.y - origin.y);
		return this;
	},
	snapToGrid: function(gx, gy) {
		this.x = snapToGrid(this.x, gx);
		this.y = snapToGrid(this.y, gy || gx);
		return this;
	},
	squaredDistance: function(p) {
		return squaredLength(this, p);
	},
	theta: function(p) {
		p = new Point(p);
		var y = -(p.y - this.y);
		var x = p.x - this.x;
		var rad = atan2(y, x);
		if (rad < 0) rad = 2 * PI + rad;
		return 180 * rad / PI;
	},
	toJSON: function() {
		return {
			x: this.x,
			y: this.y
		};
	},
	toPolar: function(o) {
		o = o && new Point(o) || new Point(0, 0);
		var x = this.x;
		var y = this.y;
		this.x = sqrt$2((x - o.x) * (x - o.x) + (y - o.y) * (y - o.y));
		this.y = toRad(o.theta(new Point(x, y)));
		return this;
	},
	toString: function() {
		return this.x + "@" + this.y;
	},
	serialize: function() {
		return this.x + "," + this.y;
	},
	update: function(x, y) {
		if (Object(x) === x) {
			y = x.y;
			x = x.x;
		}
		this.x = x || 0;
		this.y = y || 0;
		return this;
	},
	vectorAngle: function(p) {
		var zero = new Point(0, 0);
		return zero.angleBetween(this, p);
	}
};
Point.prototype.translate = Point.prototype.offset;
const point = Point;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/line.mjs
const { max: max$2, min: min$2 } = Math;
const Line = function(p1, p2) {
	if (!(this instanceof Line)) return new Line(p1, p2);
	if (p1 instanceof Line) return new Line(p1.start, p1.end);
	this.start = new Point(p1);
	this.end = new Point(p2);
};
Line.prototype = {
	type: types.Line,
	angle: function() {
		var horizontalPoint = new Point(this.start.x + 1, this.start.y);
		return this.start.angleBetween(this.end, horizontalPoint);
	},
	bbox: function() {
		var left$3 = min$2(this.start.x, this.end.x);
		var top$3 = min$2(this.start.y, this.end.y);
		var right$3 = max$2(this.start.x, this.end.x);
		var bottom$3 = max$2(this.start.y, this.end.y);
		return new Rect(left$3, top$3, right$3 - left$3, bottom$3 - top$3);
	},
	bearing: function() {
		return bearing(this.start, this.end);
	},
	clone: function() {
		return new Line(this.start, this.end);
	},
	closestPoint: function(p) {
		return this.pointAt(this.closestPointNormalizedLength(p));
	},
	closestPointLength: function(p) {
		return this.closestPointNormalizedLength(p) * this.length();
	},
	closestPointNormalizedLength: function(p) {
		var product = this.vector().dot(new Line(this.start, p).vector());
		var cpNormalizedLength = min$2(1, max$2(0, product / this.squaredLength()));
		if (cpNormalizedLength !== cpNormalizedLength) return 0;
		return cpNormalizedLength;
	},
	closestPointTangent: function(p) {
		return this.tangentAt(this.closestPointNormalizedLength(p));
	},
	containsPoint: function(p) {
		var start = this.start;
		var end = this.end;
		if (start.cross(p, end) !== 0) return false;
		var length$1 = this.length();
		if (new Line(start, p).length() > length$1) return false;
		if (new Line(p, end).length() > length$1) return false;
		return true;
	},
	divideAt: function(ratio) {
		var dividerPoint = this.pointAt(ratio);
		return [new Line(this.start, dividerPoint), new Line(dividerPoint, this.end)];
	},
	divideAtLength: function(length$1) {
		var dividerPoint = this.pointAtLength(length$1);
		return [new Line(this.start, dividerPoint), new Line(dividerPoint, this.end)];
	},
	equals: function(l) {
		return !!l && this.start.x === l.start.x && this.start.y === l.start.y && this.end.x === l.end.x && this.end.y === l.end.y;
	},
	intersect: function(shape, opt) {
		if (shape && shape.intersectionWithLine) {
			var intersection$2 = shape.intersectionWithLine(this, opt);
			if (intersection$2 && shape instanceof Line) intersection$2 = intersection$2[0];
			return intersection$2;
		}
		return null;
	},
	intersectionWithLine: function(line$2) {
		var pt1Dir = new Point(this.end.x - this.start.x, this.end.y - this.start.y);
		var pt2Dir = new Point(line$2.end.x - line$2.start.x, line$2.end.y - line$2.start.y);
		var det = pt1Dir.x * pt2Dir.y - pt1Dir.y * pt2Dir.x;
		var deltaPt = new Point(line$2.start.x - this.start.x, line$2.start.y - this.start.y);
		var alpha = deltaPt.x * pt2Dir.y - deltaPt.y * pt2Dir.x;
		var beta = deltaPt.x * pt1Dir.y - deltaPt.y * pt1Dir.x;
		if (det === 0 || alpha * det < 0 || beta * det < 0) return null;
		if (det > 0) {
			if (alpha > det || beta > det) return null;
		} else if (alpha < det || beta < det) return null;
		return [new Point(this.start.x + alpha * pt1Dir.x / det, this.start.y + alpha * pt1Dir.y / det)];
	},
	isDifferentiable: function() {
		return !this.start.equals(this.end);
	},
	length: function() {
		return length(this.start, this.end);
	},
	midpoint: function() {
		return new Point((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2);
	},
	parallel: function(distance) {
		const l = this.clone();
		if (!this.isDifferentiable()) return l;
		const { start, end } = l;
		const eRef = start.clone().rotate(end, 270);
		const sRef = end.clone().rotate(start, 90);
		start.move(sRef, distance);
		end.move(eRef, distance);
		return l;
	},
	pointAt: function(t) {
		var start = this.start;
		var end = this.end;
		if (t <= 0) return start.clone();
		if (t >= 1) return end.clone();
		return start.lerp(end, t);
	},
	pointAtLength: function(length$1) {
		var start = this.start;
		var end = this.end;
		var fromStart = true;
		if (length$1 < 0) {
			fromStart = false;
			length$1 = -length$1;
		}
		var lineLength = this.length();
		if (length$1 >= lineLength) return fromStart ? end.clone() : start.clone();
		return this.pointAt((fromStart ? length$1 : lineLength - length$1) / lineLength);
	},
	pointOffset: function(p) {
		p = new Point(p);
		var start = this.start;
		var end = this.end;
		var determinant$1 = (end.x - start.x) * (p.y - start.y) - (end.y - start.y) * (p.x - start.x);
		return determinant$1 / this.length();
	},
	rotate: function(origin, angle) {
		this.start.rotate(origin, angle);
		this.end.rotate(origin, angle);
		return this;
	},
	round: function(precision) {
		this.start.round(precision);
		this.end.round(precision);
		return this;
	},
	scale: function(sx, sy, origin) {
		this.start.scale(sx, sy, origin);
		this.end.scale(sx, sy, origin);
		return this;
	},
	setLength: function(length$1) {
		var currentLength = this.length();
		if (!currentLength) return this;
		var scaleFactor = length$1 / currentLength;
		return this.scale(scaleFactor, scaleFactor, this.start);
	},
	squaredLength: function() {
		return squaredLength(this.start, this.end);
	},
	tangentAt: function(t) {
		if (!this.isDifferentiable()) return null;
		var start = this.start;
		var end = this.end;
		var tangentStart = this.pointAt(t);
		var tangentLine = new Line(start, end);
		tangentLine.translate(tangentStart.x - start.x, tangentStart.y - start.y);
		return tangentLine;
	},
	tangentAtLength: function(length$1) {
		if (!this.isDifferentiable()) return null;
		var start = this.start;
		var end = this.end;
		var tangentStart = this.pointAtLength(length$1);
		var tangentLine = new Line(start, end);
		tangentLine.translate(tangentStart.x - start.x, tangentStart.y - start.y);
		return tangentLine;
	},
	toString: function() {
		return this.start.toString() + " " + this.end.toString();
	},
	serialize: function() {
		return this.start.serialize() + " " + this.end.serialize();
	},
	translate: function(tx, ty) {
		this.start.translate(tx, ty);
		this.end.translate(tx, ty);
		return this;
	},
	vector: function() {
		return new Point(this.end.x - this.start.x, this.end.y - this.start.y);
	}
};
Line.prototype.intersection = Line.prototype.intersect;
const line$1 = Line;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/ellipse.mjs
const { sqrt: sqrt$1, round: round$2, pow: pow$2 } = Math;
const Ellipse$1 = function(c, a, b) {
	if (!(this instanceof Ellipse$1)) return new Ellipse$1(c, a, b);
	if (c instanceof Ellipse$1) return new Ellipse$1(new Point(c.x, c.y), c.a, c.b);
	c = new Point(c);
	this.x = c.x;
	this.y = c.y;
	this.a = a;
	this.b = b;
};
Ellipse$1.fromRect = function(rect$1) {
	rect$1 = new Rect(rect$1);
	return new Ellipse$1(rect$1.center(), rect$1.width / 2, rect$1.height / 2);
};
Ellipse$1.prototype = {
	type: types.Ellipse,
	bbox: function() {
		return new Rect(this.x - this.a, this.y - this.b, 2 * this.a, 2 * this.b);
	},
	center: function() {
		return new Point(this.x, this.y);
	},
	clone: function() {
		return new Ellipse$1(this);
	},
	containsPoint: function(p) {
		return this.normalizedDistance(p) <= 1;
	},
	equals: function(ellipse$2) {
		return !!ellipse$2 && ellipse$2.x === this.x && ellipse$2.y === this.y && ellipse$2.a === this.a && ellipse$2.b === this.b;
	},
	inflate: function(dx, dy) {
		if (dx === void 0) dx = 0;
		if (dy === void 0) dy = dx;
		this.a += 2 * dx;
		this.b += 2 * dy;
		return this;
	},
	intersectionWithLine: function(line$2) {
		var intersections = [];
		var a1 = line$2.start;
		var a2 = line$2.end;
		var rx = this.a;
		var ry = this.b;
		var dir = line$2.vector();
		var diff$1 = a1.difference(new Point(this));
		var mDir = new Point(dir.x / (rx * rx), dir.y / (ry * ry));
		var mDiff = new Point(diff$1.x / (rx * rx), diff$1.y / (ry * ry));
		var a = dir.dot(mDir);
		var b = dir.dot(mDiff);
		var c = diff$1.dot(mDiff) - 1;
		var d = b * b - a * c;
		if (d < 0) return null;
		else if (d > 0) {
			var root = sqrt$1(d);
			var ta = (-b - root) / a;
			var tb = (-b + root) / a;
			if ((ta < 0 || 1 < ta) && (tb < 0 || 1 < tb)) return null;
			else {
				if (0 <= ta && ta <= 1) intersections.push(a1.lerp(a2, ta));
				if (0 <= tb && tb <= 1) intersections.push(a1.lerp(a2, tb));
			}
		} else {
			var t = -b / a;
			if (0 <= t && t <= 1) intersections.push(a1.lerp(a2, t));
			else return null;
		}
		return intersections;
	},
	intersectionWithLineFromCenterToPoint: function(p, angle) {
		p = new Point(p);
		if (angle) p.rotate(new Point(this.x, this.y), angle);
		var dx = p.x - this.x;
		var dy = p.y - this.y;
		var result$1;
		if (dx === 0) {
			result$1 = this.bbox().pointNearestToPoint(p);
			if (angle) return result$1.rotate(new Point(this.x, this.y), -angle);
			return result$1;
		}
		var m = dy / dx;
		var mSquared = m * m;
		var aSquared = this.a * this.a;
		var bSquared = this.b * this.b;
		var x = sqrt$1(1 / (1 / aSquared + mSquared / bSquared));
		x = dx < 0 ? -x : x;
		var y = m * x;
		result$1 = new Point(this.x + x, this.y + y);
		if (angle) return result$1.rotate(new Point(this.x, this.y), -angle);
		return result$1;
	},
	normalizedDistance: function(point$1) {
		var x0 = point$1.x;
		var y0 = point$1.y;
		var a = this.a;
		var b = this.b;
		var x = this.x;
		var y = this.y;
		return (x0 - x) * (x0 - x) / (a * a) + (y0 - y) * (y0 - y) / (b * b);
	},
	round: function(precision) {
		let f = 1;
		if (precision) switch (precision) {
			case 1:
				f = 10;
				break;
			case 2:
				f = 100;
				break;
			case 3:
				f = 1e3;
				break;
			default:
				f = pow$2(10, precision);
				break;
		}
		this.x = round$2(this.x * f) / f;
		this.y = round$2(this.y * f) / f;
		this.a = round$2(this.a * f) / f;
		this.b = round$2(this.b * f) / f;
		return this;
	},
	tangentTheta: function(p) {
		var refPointDelta = 30;
		var x0 = p.x;
		var y0 = p.y;
		var a = this.a;
		var b = this.b;
		var center$1 = this.bbox().center();
		var m = center$1.x;
		var n = center$1.y;
		var q1 = x0 > center$1.x + a / 2;
		var q3 = x0 < center$1.x - a / 2;
		var y, x;
		if (q1 || q3) {
			y = x0 > center$1.x ? y0 - refPointDelta : y0 + refPointDelta;
			x = a * a / (x0 - m) - a * a * (y0 - n) * (y - n) / (b * b * (x0 - m)) + m;
		} else {
			x = y0 > center$1.y ? x0 + refPointDelta : x0 - refPointDelta;
			y = b * b / (y0 - n) - b * b * (x0 - m) * (x - m) / (a * a * (y0 - n)) + n;
		}
		return new Point(x, y).theta(p);
	},
	toString: function() {
		return new Point(this.x, this.y).toString() + " " + this.a + " " + this.b;
	}
};
const ellipse$1 = Ellipse$1;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/rect.mjs
const { abs: abs$1, cos, sin, min: min$1, max: max$1, round: round$1, pow: pow$1 } = Math;
const Rect = function(x, y, w, h) {
	if (!(this instanceof Rect)) return new Rect(x, y, w, h);
	if (Object(x) === x) {
		y = x.y;
		w = x.width;
		h = x.height;
		x = x.x;
	}
	this.x = x === void 0 ? 0 : x;
	this.y = y === void 0 ? 0 : y;
	this.width = w === void 0 ? 0 : w;
	this.height = h === void 0 ? 0 : h;
};
Rect.fromEllipse = function(e) {
	e = new Ellipse$1(e);
	return new Rect(e.x - e.a, e.y - e.b, 2 * e.a, 2 * e.b);
};
Rect.fromPointUnion = function(...points) {
	if (points.length === 0) return null;
	const p = new Point();
	let minX, minY, maxX, maxY;
	minX = minY = Infinity;
	maxX = maxY = -Infinity;
	for (let i = 0; i < points.length; i++) {
		p.update(points[i]);
		const x = p.x;
		const y = p.y;
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
	}
	return new Rect(minX, minY, maxX - minX, maxY - minY);
};
Rect.fromRectUnion = function(...rects) {
	if (rects.length === 0) return null;
	const r = new Rect();
	let minX, minY, maxX, maxY;
	minX = minY = Infinity;
	maxX = maxY = -Infinity;
	for (let i = 0; i < rects.length; i++) {
		r.update(rects[i]);
		const x = r.x;
		const y = r.y;
		const mX = x + r.width;
		const mY = y + r.height;
		if (x < minX) minX = x;
		if (mX > maxX) maxX = mX;
		if (y < minY) minY = y;
		if (mY > maxY) maxY = mY;
	}
	return new Rect(minX, minY, maxX - minX, maxY - minY);
};
Rect.prototype = {
	type: types.Rect,
	bbox: function(angle) {
		return this.clone().rotateAroundCenter(angle);
	},
	rotateAroundCenter: function(angle) {
		if (!angle) return this;
		const { width: width$1, height: height$1 } = this;
		const theta = toRad(angle);
		const st = abs$1(sin(theta));
		const ct = abs$1(cos(theta));
		const w = width$1 * ct + height$1 * st;
		const h = width$1 * st + height$1 * ct;
		this.x += (width$1 - w) / 2;
		this.y += (height$1 - h) / 2;
		this.width = w;
		this.height = h;
		return this;
	},
	bottomLeft: function() {
		return new Point(this.x, this.y + this.height);
	},
	bottomLine: function() {
		return new Line(this.bottomLeft(), this.bottomRight());
	},
	bottomMiddle: function() {
		return new Point(this.x + this.width / 2, this.y + this.height);
	},
	center: function() {
		return new Point(this.x + this.width / 2, this.y + this.height / 2);
	},
	clone: function() {
		return new Rect(this);
	},
	containsPoint: function(p, opt) {
		let x, y;
		if (!p || typeof p === "string") ({x, y} = new Point(p));
		else ({x = 0, y = 0} = p);
		return opt && opt.strict ? x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height : x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
	},
	containsRect: function(r) {
		var r0 = new Rect(this).normalize();
		var r1 = new Rect(r).normalize();
		var w0 = r0.width;
		var h0 = r0.height;
		var w1 = r1.width;
		var h1 = r1.height;
		if (!w0 || !h0 || !w1 || !h1) return false;
		var x0 = r0.x;
		var y0 = r0.y;
		var x1 = r1.x;
		var y1 = r1.y;
		w1 += x1;
		w0 += x0;
		h1 += y1;
		h0 += y0;
		return x0 <= x1 && w1 <= w0 && y0 <= y1 && h1 <= h0;
	},
	corner: function() {
		return new Point(this.x + this.width, this.y + this.height);
	},
	equals: function(r) {
		var mr = new Rect(this).normalize();
		var nr = new Rect(r).normalize();
		return mr.x === nr.x && mr.y === nr.y && mr.width === nr.width && mr.height === nr.height;
	},
	inflate: function(dx, dy) {
		if (dx === void 0) dx = 0;
		if (dy === void 0) dy = dx;
		this.x -= dx;
		this.y -= dy;
		this.width += 2 * dx;
		this.height += 2 * dy;
		return this;
	},
	intersect: function(r) {
		var myOrigin = this.origin();
		var myCorner = this.corner();
		var rOrigin = r.origin();
		var rCorner = r.corner();
		if (rCorner.x <= myOrigin.x || rCorner.y <= myOrigin.y || rOrigin.x >= myCorner.x || rOrigin.y >= myCorner.y) return null;
		var x = max$1(myOrigin.x, rOrigin.x);
		var y = max$1(myOrigin.y, rOrigin.y);
		return new Rect(x, y, min$1(myCorner.x, rCorner.x) - x, min$1(myCorner.y, rCorner.y) - y);
	},
	intersectionWithLine: function(line$2) {
		var r = this;
		var rectLines = [
			r.topLine(),
			r.rightLine(),
			r.bottomLine(),
			r.leftLine()
		];
		var points = [];
		var dedupeArr = [];
		var pt, i;
		var n = rectLines.length;
		for (i = 0; i < n; i++) {
			pt = line$2.intersect(rectLines[i]);
			if (pt !== null && dedupeArr.indexOf(pt.toString()) < 0) {
				points.push(pt);
				dedupeArr.push(pt.toString());
			}
		}
		return points.length > 0 ? points : null;
	},
	intersectionWithLineFromCenterToPoint: function(p, angle) {
		p = new Point(p);
		var center$1 = new Point(this.x + this.width / 2, this.y + this.height / 2);
		var result$1;
		if (angle) p.rotate(center$1, angle);
		var sides = [
			this.topLine(),
			this.rightLine(),
			this.bottomLine(),
			this.leftLine()
		];
		var connector = new Line(center$1, p);
		for (var i = sides.length - 1; i >= 0; --i) {
			var intersection$2 = sides[i].intersection(connector);
			if (intersection$2 !== null) {
				result$1 = intersection$2;
				break;
			}
		}
		if (result$1 && angle) result$1.rotate(center$1, -angle);
		return result$1;
	},
	leftLine: function() {
		return new Line(this.topLeft(), this.bottomLeft());
	},
	leftMiddle: function() {
		return new Point(this.x, this.y + this.height / 2);
	},
	maxRectScaleToFit: function(rect$1, origin) {
		rect$1 = new Rect(rect$1);
		origin || (origin = rect$1.center());
		var sx1, sx2, sx3, sx4, sy1, sy2, sy3, sy4;
		var ox = origin.x;
		var oy = origin.y;
		sx1 = sx2 = sx3 = sx4 = sy1 = sy2 = sy3 = sy4 = Infinity;
		var p1 = rect$1.topLeft();
		if (p1.x < ox) sx1 = (this.x - ox) / (p1.x - ox);
		if (p1.y < oy) sy1 = (this.y - oy) / (p1.y - oy);
		var p2 = rect$1.bottomRight();
		if (p2.x > ox) sx2 = (this.x + this.width - ox) / (p2.x - ox);
		if (p2.y > oy) sy2 = (this.y + this.height - oy) / (p2.y - oy);
		var p3 = rect$1.topRight();
		if (p3.x > ox) sx3 = (this.x + this.width - ox) / (p3.x - ox);
		if (p3.y < oy) sy3 = (this.y - oy) / (p3.y - oy);
		var p4 = rect$1.bottomLeft();
		if (p4.x < ox) sx4 = (this.x - ox) / (p4.x - ox);
		if (p4.y > oy) sy4 = (this.y + this.height - oy) / (p4.y - oy);
		return {
			sx: min$1(sx1, sx2, sx3, sx4),
			sy: min$1(sy1, sy2, sy3, sy4)
		};
	},
	maxRectUniformScaleToFit: function(rect$1, origin) {
		var scale$1 = this.maxRectScaleToFit(rect$1, origin);
		return min$1(scale$1.sx, scale$1.sy);
	},
	moveAndExpand: function(r) {
		this.x += r.x || 0;
		this.y += r.y || 0;
		this.width += r.width || 0;
		this.height += r.height || 0;
		return this;
	},
	normalize: function() {
		var newx = this.x;
		var newy = this.y;
		var newwidth = this.width;
		var newheight = this.height;
		if (this.width < 0) {
			newx = this.x + this.width;
			newwidth = -this.width;
		}
		if (this.height < 0) {
			newy = this.y + this.height;
			newheight = -this.height;
		}
		this.x = newx;
		this.y = newy;
		this.width = newwidth;
		this.height = newheight;
		return this;
	},
	offset: function(dx, dy) {
		return Point.prototype.offset.call(this, dx, dy);
	},
	origin: function() {
		return new Point(this.x, this.y);
	},
	pointNearestToPoint: function(point$1) {
		point$1 = new Point(point$1);
		if (this.containsPoint(point$1)) {
			var side = this.sideNearestToPoint(point$1);
			switch (side) {
				case "right": return new Point(this.x + this.width, point$1.y);
				case "left": return new Point(this.x, point$1.y);
				case "bottom": return new Point(point$1.x, this.y + this.height);
				case "top": return new Point(point$1.x, this.y);
			}
		}
		return point$1.adhereToRect(this);
	},
	rightLine: function() {
		return new Line(this.topRight(), this.bottomRight());
	},
	rightMiddle: function() {
		return new Point(this.x + this.width, this.y + this.height / 2);
	},
	round: function(precision) {
		let f = 1;
		if (precision) switch (precision) {
			case 1:
				f = 10;
				break;
			case 2:
				f = 100;
				break;
			case 3:
				f = 1e3;
				break;
			default:
				f = pow$1(10, precision);
				break;
		}
		this.x = round$1(this.x * f) / f;
		this.y = round$1(this.y * f) / f;
		this.width = round$1(this.width * f) / f;
		this.height = round$1(this.height * f) / f;
		return this;
	},
	scale: function(sx, sy, origin) {
		origin = this.origin().scale(sx, sy, origin);
		this.x = origin.x;
		this.y = origin.y;
		this.width *= sx;
		this.height *= sy;
		return this;
	},
	sideNearestToPoint: function(point$1) {
		point$1 = new Point(point$1);
		var distToLeft = point$1.x - this.x;
		var distToRight = this.x + this.width - point$1.x;
		var distToTop = point$1.y - this.y;
		var distToBottom = this.y + this.height - point$1.y;
		var closest$1 = distToLeft;
		var side = "left";
		if (distToRight < closest$1) {
			closest$1 = distToRight;
			side = "right";
		}
		if (distToTop < closest$1) {
			closest$1 = distToTop;
			side = "top";
		}
		if (distToBottom < closest$1) side = "bottom";
		return side;
	},
	snapToGrid: function(gx, gy) {
		var origin = this.origin().snapToGrid(gx, gy);
		var corner = this.corner().snapToGrid(gx, gy);
		this.x = origin.x;
		this.y = origin.y;
		this.width = corner.x - origin.x;
		this.height = corner.y - origin.y;
		return this;
	},
	toJSON: function() {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height
		};
	},
	topLine: function() {
		return new Line(this.topLeft(), this.topRight());
	},
	topMiddle: function() {
		return new Point(this.x + this.width / 2, this.y);
	},
	topRight: function() {
		return new Point(this.x + this.width, this.y);
	},
	toString: function() {
		return this.origin().toString() + " " + this.corner().toString();
	},
	union: function(rect$1) {
		return Rect.fromRectUnion(this, rect$1);
	},
	update: function(x, y, w, h) {
		if (Object(x) === x) {
			y = x.y;
			w = x.width;
			h = x.height;
			x = x.x;
		}
		this.x = x || 0;
		this.y = y || 0;
		this.width = w || 0;
		this.height = h || 0;
		return this;
	}
};
Rect.prototype.bottomRight = Rect.prototype.corner;
Rect.prototype.topLeft = Rect.prototype.origin;
Rect.prototype.translate = Rect.prototype.offset;
const rect = Rect;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/points.mjs
function parsePoints(svgString) {
	const trimmedString = svgString.trim();
	if (trimmedString === "") return [];
	const points = [];
	const coords = trimmedString.split(/\b\s*,\s*|,\s*|\s+/);
	const numCoords = coords.length;
	for (let i = 0; i < numCoords; i += 2) points.push({
		x: +coords[i],
		y: +coords[i + 1]
	});
	return points;
}
function clonePoints(points) {
	const numPoints = points.length;
	if (numPoints === 0) return [];
	const newPoints = [];
	for (let i = 0; i < numPoints; i++) {
		const point$1 = points[i].clone();
		newPoints.push(point$1);
	}
	return newPoints;
}
function convexHull(points) {
	const { abs: abs$3 } = Math;
	var i;
	var n;
	var numPoints = points.length;
	if (numPoints === 0) return [];
	var startPoint;
	for (i = 0; i < numPoints; i++) if (startPoint === void 0) startPoint = points[i];
	else if (points[i].y < startPoint.y) startPoint = points[i];
	else if (points[i].y === startPoint.y && points[i].x > startPoint.x) startPoint = points[i];
	var sortedPointRecords = [];
	for (i = 0; i < numPoints; i++) {
		var angle = startPoint.theta(points[i]);
		if (angle === 0) angle = 360;
		var entry = [
			points[i],
			i,
			angle
		];
		sortedPointRecords.push(entry);
	}
	sortedPointRecords.sort(function(record1, record2) {
		var sortOutput = record1[2] - record2[2];
		if (sortOutput === 0) sortOutput = record2[1] - record1[1];
		return sortOutput;
	});
	if (sortedPointRecords.length > 2) {
		var startPointRecord = sortedPointRecords[sortedPointRecords.length - 1];
		sortedPointRecords.unshift(startPointRecord);
	}
	var insidePoints = {};
	var hullPointRecords = [];
	var currentPointRecord;
	var currentPoint;
	var lastHullPointRecord;
	var lastHullPoint;
	var secondLastHullPointRecord;
	var secondLastHullPoint;
	while (sortedPointRecords.length !== 0) {
		currentPointRecord = sortedPointRecords.pop();
		currentPoint = currentPointRecord[0];
		if (insidePoints.hasOwnProperty(currentPointRecord[0] + "@@" + currentPointRecord[1])) continue;
		var correctTurnFound = false;
		while (!correctTurnFound) if (hullPointRecords.length < 2) {
			hullPointRecords.push(currentPointRecord);
			correctTurnFound = true;
		} else {
			lastHullPointRecord = hullPointRecords.pop();
			lastHullPoint = lastHullPointRecord[0];
			secondLastHullPointRecord = hullPointRecords.pop();
			secondLastHullPoint = secondLastHullPointRecord[0];
			var crossProduct = secondLastHullPoint.cross(lastHullPoint, currentPoint);
			if (crossProduct < 0) {
				hullPointRecords.push(secondLastHullPointRecord);
				hullPointRecords.push(lastHullPointRecord);
				hullPointRecords.push(currentPointRecord);
				correctTurnFound = true;
			} else if (crossProduct === 0) {
				var THRESHOLD = 1e-10;
				var angleBetween = lastHullPoint.angleBetween(secondLastHullPoint, currentPoint);
				if (abs$3(angleBetween - 180) < THRESHOLD) {
					insidePoints[lastHullPointRecord[0] + "@@" + lastHullPointRecord[1]] = lastHullPoint;
					hullPointRecords.push(secondLastHullPointRecord);
				} else if (lastHullPoint.equals(currentPoint) || secondLastHullPoint.equals(lastHullPoint)) {
					insidePoints[lastHullPointRecord[0] + "@@" + lastHullPointRecord[1]] = lastHullPoint;
					hullPointRecords.push(secondLastHullPointRecord);
				} else if (abs$3((angleBetween + 1) % 360 - 1) < THRESHOLD) {
					hullPointRecords.push(secondLastHullPointRecord);
					sortedPointRecords.push(lastHullPointRecord);
				}
			} else {
				insidePoints[lastHullPointRecord[0] + "@@" + lastHullPointRecord[1]] = lastHullPoint;
				hullPointRecords.push(secondLastHullPointRecord);
			}
		}
	}
	if (hullPointRecords.length > 2) hullPointRecords.pop();
	var lowestHullIndex;
	var indexOfLowestHullIndexRecord = -1;
	n = hullPointRecords.length;
	for (i = 0; i < n; i++) {
		var currentHullIndex = hullPointRecords[i][1];
		if (lowestHullIndex === void 0 || currentHullIndex < lowestHullIndex) {
			lowestHullIndex = currentHullIndex;
			indexOfLowestHullIndexRecord = i;
		}
	}
	var hullPointRecordsReordered = [];
	if (indexOfLowestHullIndexRecord > 0) {
		var newFirstChunk = hullPointRecords.slice(indexOfLowestHullIndexRecord);
		var newSecondChunk = hullPointRecords.slice(0, indexOfLowestHullIndexRecord);
		hullPointRecordsReordered = newFirstChunk.concat(newSecondChunk);
	} else hullPointRecordsReordered = hullPointRecords;
	var hullPoints = [];
	n = hullPointRecordsReordered.length;
	for (i = 0; i < n; i++) hullPoints.push(hullPointRecordsReordered[i][0]);
	return hullPoints;
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/polyline.mjs
const Polyline = function(points) {
	if (!(this instanceof Polyline)) return new Polyline(points);
	if (typeof points === "string") return new Polyline.parse(points);
	this.points = Array.isArray(points) ? points.map(Point) : [];
};
Polyline.parse = function(svgString) {
	return new Polyline(parsePoints(svgString));
};
Polyline.fromRect = function(rect$1) {
	return new Polyline([
		rect$1.topLeft(),
		rect$1.topRight(),
		rect$1.bottomRight(),
		rect$1.bottomLeft(),
		rect$1.topLeft()
	]);
};
Polyline.prototype = {
	type: types.Polyline,
	bbox: function() {
		var x1 = Infinity;
		var x2 = -Infinity;
		var y1 = Infinity;
		var y2 = -Infinity;
		var points = this.points;
		var numPoints = points.length;
		if (numPoints === 0) return null;
		for (var i = 0; i < numPoints; i++) {
			var point$1 = points[i];
			var x = point$1.x;
			var y = point$1.y;
			if (x < x1) x1 = x;
			if (x > x2) x2 = x;
			if (y < y1) y1 = y;
			if (y > y2) y2 = y;
		}
		return new Rect(x1, y1, x2 - x1, y2 - y1);
	},
	clone: function() {
		return new Polyline(clonePoints(this.points));
	},
	closestPoint: function(p) {
		var cpLength = this.closestPointLength(p);
		return this.pointAtLength(cpLength);
	},
	closestPointLength: function(p) {
		var points = this.lengthPoints();
		var numPoints = points.length;
		if (numPoints === 0) return 0;
		if (numPoints === 1) return 0;
		var cpLength;
		var minSqrDistance = Infinity;
		var length$1 = 0;
		var n = numPoints - 1;
		for (var i = 0; i < n; i++) {
			var line$2 = new Line(points[i], points[i + 1]);
			var lineLength = line$2.length();
			var cpNormalizedLength = line$2.closestPointNormalizedLength(p);
			var cp = line$2.pointAt(cpNormalizedLength);
			var sqrDistance = cp.squaredDistance(p);
			if (sqrDistance < minSqrDistance) {
				minSqrDistance = sqrDistance;
				cpLength = length$1 + cpNormalizedLength * lineLength;
			}
			length$1 += lineLength;
		}
		return cpLength;
	},
	closestPointNormalizedLength: function(p) {
		var cpLength = this.closestPointLength(p);
		if (cpLength === 0) return 0;
		var length$1 = this.length();
		if (length$1 === 0) return 0;
		return cpLength / length$1;
	},
	closestPointTangent: function(p) {
		var cpLength = this.closestPointLength(p);
		return this.tangentAtLength(cpLength);
	},
	containsPoint: function(p) {
		var points = this.points;
		var numPoints = points.length;
		if (numPoints === 0) return false;
		var x = p.x;
		var y = p.y;
		var startIndex = numPoints - 1;
		var endIndex = 0;
		var numIntersections = 0;
		var segment = new Line();
		var ray = new Line();
		var rayEnd = new Point();
		for (; endIndex < numPoints; endIndex++) {
			var start = points[startIndex];
			var end = points[endIndex];
			if (p.equals(start)) return true;
			segment.start = start;
			segment.end = end;
			if (segment.containsPoint(p)) return true;
			if (y <= start.y && y > end.y || y > start.y && y <= end.y) {
				var xDifference = start.x - x > end.x - x ? start.x - x : end.x - x;
				if (xDifference >= 0) {
					rayEnd.x = x + xDifference;
					rayEnd.y = y;
					ray.start = p;
					ray.end = rayEnd;
					if (segment.intersect(ray)) numIntersections++;
				}
			}
			startIndex = endIndex;
		}
		return numIntersections % 2 === 1;
	},
	close: function() {
		const { start, end, points } = this;
		if (start && end && !start.equals(end)) points.push(start.clone());
		return this;
	},
	lengthPoints: function() {
		return this.points;
	},
	convexHull: function() {
		return new Polyline(convexHull(this.points));
	},
	equals: function(p) {
		if (!p) return false;
		var points = this.points;
		var otherPoints = p.points;
		var numPoints = points.length;
		if (otherPoints.length !== numPoints) return false;
		for (var i = 0; i < numPoints; i++) {
			var point$1 = points[i];
			var otherPoint = p.points[i];
			if (!point$1.equals(otherPoint)) return false;
		}
		return true;
	},
	intersectionWithLine: function(l) {
		var line$2 = new Line(l);
		var intersections = [];
		var points = this.lengthPoints();
		var l2 = new Line();
		for (var i = 0, n = points.length - 1; i < n; i++) {
			l2.start = points[i];
			l2.end = points[i + 1];
			var int = line$2.intersectionWithLine(l2);
			if (int) intersections.push(int[0]);
		}
		return intersections.length > 0 ? intersections : null;
	},
	isDifferentiable: function() {
		var points = this.points;
		var numPoints = points.length;
		if (numPoints === 0) return false;
		var line$2 = new Line();
		var n = numPoints - 1;
		for (var i = 0; i < n; i++) {
			line$2.start = points[i];
			line$2.end = points[i + 1];
			if (line$2.isDifferentiable()) return true;
		}
		return false;
	},
	length: function() {
		var points = this.lengthPoints();
		var numPoints = points.length;
		if (numPoints === 0) return 0;
		var length$1 = 0;
		var n = numPoints - 1;
		for (var i = 0; i < n; i++) length$1 += points[i].distance(points[i + 1]);
		return length$1;
	},
	pointAt: function(ratio) {
		var points = this.lengthPoints();
		var numPoints = points.length;
		if (numPoints === 0) return null;
		if (numPoints === 1) return points[0].clone();
		if (ratio <= 0) return points[0].clone();
		if (ratio >= 1) return points[numPoints - 1].clone();
		var polylineLength = this.length();
		var length$1 = polylineLength * ratio;
		return this.pointAtLength(length$1);
	},
	pointAtLength: function(length$1) {
		var points = this.lengthPoints();
		var numPoints = points.length;
		if (numPoints === 0) return null;
		if (numPoints === 1) return points[0].clone();
		var fromStart = true;
		if (length$1 < 0) {
			fromStart = false;
			length$1 = -length$1;
		}
		var l = 0;
		var n = numPoints - 1;
		for (var i = 0; i < n; i++) {
			var index = fromStart ? i : n - 1 - i;
			var a = points[index];
			var b = points[index + 1];
			var line$2 = new Line(a, b);
			var d = a.distance(b);
			if (length$1 <= l + d) return line$2.pointAtLength((fromStart ? 1 : -1) * (length$1 - l));
			l += d;
		}
		var lastPoint = fromStart ? points[numPoints - 1] : points[0];
		return lastPoint.clone();
	},
	round: function(precision) {
		var points = this.points;
		var numPoints = points.length;
		for (var i = 0; i < numPoints; i++) points[i].round(precision);
		return this;
	},
	scale: function(sx, sy, origin) {
		var points = this.points;
		var numPoints = points.length;
		for (var i = 0; i < numPoints; i++) points[i].scale(sx, sy, origin);
		return this;
	},
	simplify: function(opt = {}) {
		const points = this.points;
		if (points.length < 3) return this;
		const threshold = opt.threshold || 1e-10;
		let currentIndex = 0;
		while (points[currentIndex + 2]) {
			const firstIndex = currentIndex;
			const middleIndex = currentIndex + 1;
			const lastIndex = currentIndex + 2;
			const firstPoint = points[firstIndex];
			const middlePoint = points[middleIndex];
			const lastPoint = points[lastIndex];
			const chord = new Line(firstPoint, lastPoint);
			const closestPoint = chord.closestPoint(middlePoint);
			const closestPointDistance = closestPoint.distance(middlePoint);
			if (closestPointDistance <= threshold) points.splice(middleIndex, 1);
			else currentIndex += 1;
		}
		return this;
	},
	tangentAt: function(ratio) {
		var points = this.lengthPoints();
		var numPoints = points.length;
		if (numPoints === 0) return null;
		if (numPoints === 1) return null;
		if (ratio < 0) ratio = 0;
		if (ratio > 1) ratio = 1;
		var polylineLength = this.length();
		var length$1 = polylineLength * ratio;
		return this.tangentAtLength(length$1);
	},
	tangentAtLength: function(length$1) {
		var points = this.lengthPoints();
		var numPoints = points.length;
		if (numPoints === 0) return null;
		if (numPoints === 1) return null;
		var fromStart = true;
		if (length$1 < 0) {
			fromStart = false;
			length$1 = -length$1;
		}
		var lastValidLine;
		var l = 0;
		var n = numPoints - 1;
		for (var i = 0; i < n; i++) {
			var index = fromStart ? i : n - 1 - i;
			var a = points[index];
			var b = points[index + 1];
			var line$2 = new Line(a, b);
			var d = a.distance(b);
			if (line$2.isDifferentiable()) {
				if (length$1 <= l + d) return line$2.tangentAtLength((fromStart ? 1 : -1) * (length$1 - l));
				lastValidLine = line$2;
			}
			l += d;
		}
		if (lastValidLine) {
			var ratio = fromStart ? 1 : 0;
			return lastValidLine.tangentAt(ratio);
		}
		return null;
	},
	toString: function() {
		return this.points + "";
	},
	translate: function(tx, ty) {
		var points = this.points;
		var numPoints = points.length;
		for (var i = 0; i < numPoints; i++) points[i].translate(tx, ty);
		return this;
	},
	serialize: function() {
		var points = this.points;
		var numPoints = points.length;
		if (numPoints === 0) return "";
		var output = "";
		for (var i = 0; i < numPoints; i++) {
			var point$1 = points[i];
			output += point$1.x + "," + point$1.y + " ";
		}
		return output.trim();
	}
};
Object.defineProperty(Polyline.prototype, "start", {
	configurable: true,
	enumerable: true,
	get: function() {
		var points = this.points;
		var numPoints = points.length;
		if (numPoints === 0) return null;
		return this.points[0];
	}
});
Object.defineProperty(Polyline.prototype, "end", {
	configurable: true,
	enumerable: true,
	get: function() {
		var points = this.points;
		var numPoints = points.length;
		if (numPoints === 0) return null;
		return this.points[numPoints - 1];
	}
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/curve.mjs
const { abs, sqrt, min, max, pow } = Math;
const Curve = function(p1, p2, p3, p4) {
	if (!(this instanceof Curve)) return new Curve(p1, p2, p3, p4);
	if (p1 instanceof Curve) return new Curve(p1.start, p1.controlPoint1, p1.controlPoint2, p1.end);
	this.start = new Point(p1);
	this.controlPoint1 = new Point(p2);
	this.controlPoint2 = new Point(p3);
	this.end = new Point(p4);
};
Curve.throughPoints = (function() {
	function getCurveControlPoints(knots) {
		var firstControlPoints = [];
		var secondControlPoints = [];
		var n = knots.length - 1;
		var i;
		if (n == 1) {
			firstControlPoints[0] = new Point((2 * knots[0].x + knots[1].x) / 3, (2 * knots[0].y + knots[1].y) / 3);
			secondControlPoints[0] = new Point(2 * firstControlPoints[0].x - knots[0].x, 2 * firstControlPoints[0].y - knots[0].y);
			return [firstControlPoints, secondControlPoints];
		}
		var rhs = [];
		for (i = 1; i < n - 1; i++) rhs[i] = 4 * knots[i].x + 2 * knots[i + 1].x;
		rhs[0] = knots[0].x + 2 * knots[1].x;
		rhs[n - 1] = (8 * knots[n - 1].x + knots[n].x) / 2;
		var x = getFirstControlPoints(rhs);
		for (i = 1; i < n - 1; ++i) rhs[i] = 4 * knots[i].y + 2 * knots[i + 1].y;
		rhs[0] = knots[0].y + 2 * knots[1].y;
		rhs[n - 1] = (8 * knots[n - 1].y + knots[n].y) / 2;
		var y = getFirstControlPoints(rhs);
		for (i = 0; i < n; i++) {
			firstControlPoints.push(new Point(x[i], y[i]));
			if (i < n - 1) secondControlPoints.push(new Point(2 * knots[i + 1].x - x[i + 1], 2 * knots[i + 1].y - y[i + 1]));
			else secondControlPoints.push(new Point((knots[n].x + x[n - 1]) / 2, (knots[n].y + y[n - 1]) / 2));
		}
		return [firstControlPoints, secondControlPoints];
	}
	function getFirstControlPoints(rhs) {
		var n = rhs.length;
		var x = [];
		var tmp = [];
		var b = 2;
		x[0] = rhs[0] / b;
		for (var i = 1; i < n; i++) {
			tmp[i] = 1 / b;
			b = (i < n - 1 ? 4 : 3.5) - tmp[i];
			x[i] = (rhs[i] - x[i - 1]) / b;
		}
		for (i = 1; i < n; i++) x[n - i - 1] -= tmp[n - i] * x[n - i];
		return x;
	}
	return function(points) {
		if (!points || Array.isArray(points) && points.length < 2) throw new Error("At least 2 points are required");
		var controlPoints = getCurveControlPoints(points);
		var curves = [];
		var n = controlPoints[0].length;
		for (var i = 0; i < n; i++) {
			var controlPoint1 = new Point(controlPoints[0][i].x, controlPoints[0][i].y);
			var controlPoint2 = new Point(controlPoints[1][i].x, controlPoints[1][i].y);
			curves.push(new Curve(points[i], controlPoint1, controlPoint2, points[i + 1]));
		}
		return curves;
	};
})();
Curve.prototype = {
	type: types.Curve,
	bbox: function() {
		var start = this.start;
		var controlPoint1 = this.controlPoint1;
		var controlPoint2 = this.controlPoint2;
		var end = this.end;
		var x0 = start.x;
		var y0 = start.y;
		var x1 = controlPoint1.x;
		var y1 = controlPoint1.y;
		var x2 = controlPoint2.x;
		var y2 = controlPoint2.y;
		var x3 = end.x;
		var y3 = end.y;
		var points = new Array();
		var tvalues = new Array();
		var bounds = [new Array(), new Array()];
		var a, b, c, t;
		var t1, t2;
		var b2ac, sqrtb2ac;
		for (var i = 0; i < 2; ++i) {
			if (i === 0) {
				b = 6 * x0 - 12 * x1 + 6 * x2;
				a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
				c = 3 * x1 - 3 * x0;
			} else {
				b = 6 * y0 - 12 * y1 + 6 * y2;
				a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
				c = 3 * y1 - 3 * y0;
			}
			if (abs(a) < 1e-12) {
				if (abs(b) < 1e-12) continue;
				t = -c / b;
				if (0 < t && t < 1) tvalues.push(t);
				continue;
			}
			b2ac = b * b - 4 * c * a;
			sqrtb2ac = sqrt(b2ac);
			if (b2ac < 0) continue;
			t1 = (-b + sqrtb2ac) / (2 * a);
			if (0 < t1 && t1 < 1) tvalues.push(t1);
			t2 = (-b - sqrtb2ac) / (2 * a);
			if (0 < t2 && t2 < 1) tvalues.push(t2);
		}
		var j = tvalues.length;
		var jlen = j;
		var mt;
		var x, y;
		while (j--) {
			t = tvalues[j];
			mt = 1 - t;
			x = mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3;
			bounds[0][j] = x;
			y = mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3;
			bounds[1][j] = y;
			points[j] = {
				X: x,
				Y: y
			};
		}
		tvalues[jlen] = 0;
		tvalues[jlen + 1] = 1;
		points[jlen] = {
			X: x0,
			Y: y0
		};
		points[jlen + 1] = {
			X: x3,
			Y: y3
		};
		bounds[0][jlen] = x0;
		bounds[1][jlen] = y0;
		bounds[0][jlen + 1] = x3;
		bounds[1][jlen + 1] = y3;
		tvalues.length = jlen + 2;
		bounds[0].length = jlen + 2;
		bounds[1].length = jlen + 2;
		points.length = jlen + 2;
		var left$3 = min.apply(null, bounds[0]);
		var top$3 = min.apply(null, bounds[1]);
		var right$3 = max.apply(null, bounds[0]);
		var bottom$3 = max.apply(null, bounds[1]);
		return new Rect(left$3, top$3, right$3 - left$3, bottom$3 - top$3);
	},
	clone: function() {
		return new Curve(this.start, this.controlPoint1, this.controlPoint2, this.end);
	},
	closestPoint: function(p, opt) {
		return this.pointAtT(this.closestPointT(p, opt));
	},
	closestPointLength: function(p, opt) {
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var subdivisions = opt.subdivisions === void 0 ? this.getSubdivisions({ precision }) : opt.subdivisions;
		var localOpt = {
			precision,
			subdivisions
		};
		return this.lengthAtT(this.closestPointT(p, localOpt), localOpt);
	},
	closestPointNormalizedLength: function(p, opt) {
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var subdivisions = opt.subdivisions === void 0 ? this.getSubdivisions({ precision }) : opt.subdivisions;
		var localOpt = {
			precision,
			subdivisions
		};
		var cpLength = this.closestPointLength(p, localOpt);
		if (!cpLength) return 0;
		var length$1 = this.length(localOpt);
		if (length$1 === 0) return 0;
		return cpLength / length$1;
	},
	closestPointT: function(p, opt) {
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var subdivisions = opt.subdivisions === void 0 ? this.getSubdivisions({ precision }) : opt.subdivisions;
		var investigatedSubdivision;
		var investigatedSubdivisionStartT;
		var investigatedSubdivisionEndT;
		var distFromStart;
		var distFromEnd;
		var chordLength;
		var minSumDist;
		var n = subdivisions.length;
		var subdivisionSize = n ? 1 / n : 0;
		for (var i = 0; i < n; i++) {
			var currentSubdivision = subdivisions[i];
			var startDist = currentSubdivision.start.distance(p);
			var endDist = currentSubdivision.end.distance(p);
			var sumDist = startDist + endDist;
			if (!minSumDist || sumDist < minSumDist) {
				investigatedSubdivision = currentSubdivision;
				investigatedSubdivisionStartT = i * subdivisionSize;
				investigatedSubdivisionEndT = (i + 1) * subdivisionSize;
				distFromStart = startDist;
				distFromEnd = endDist;
				chordLength = currentSubdivision.start.distance(currentSubdivision.end);
				minSumDist = sumDist;
			}
		}
		var precisionRatio = pow(10, -precision);
		while (true) {
			var startPrecisionRatio = distFromStart ? abs(distFromStart - distFromEnd) / distFromStart : 0;
			var endPrecisionRatio = distFromEnd ? abs(distFromStart - distFromEnd) / distFromEnd : 0;
			var hasRequiredPrecision = startPrecisionRatio < precisionRatio || endPrecisionRatio < precisionRatio;
			var hasMinimalStartDistance = distFromStart ? distFromStart < chordLength * precisionRatio : true;
			var hasMinimalEndDistance = distFromEnd ? distFromEnd < chordLength * precisionRatio : true;
			var hasMinimalDistance = hasMinimalStartDistance || hasMinimalEndDistance;
			if (hasRequiredPrecision || hasMinimalDistance) return distFromStart <= distFromEnd ? investigatedSubdivisionStartT : investigatedSubdivisionEndT;
			var divided = investigatedSubdivision.divide(.5);
			subdivisionSize /= 2;
			var startDist1 = divided[0].start.distance(p);
			var endDist1 = divided[0].end.distance(p);
			var sumDist1 = startDist1 + endDist1;
			var startDist2 = divided[1].start.distance(p);
			var endDist2 = divided[1].end.distance(p);
			var sumDist2 = startDist2 + endDist2;
			if (sumDist1 <= sumDist2) {
				investigatedSubdivision = divided[0];
				investigatedSubdivisionEndT -= subdivisionSize;
				distFromStart = startDist1;
				distFromEnd = endDist1;
			} else {
				investigatedSubdivision = divided[1];
				investigatedSubdivisionStartT += subdivisionSize;
				distFromStart = startDist2;
				distFromEnd = endDist2;
			}
		}
	},
	closestPointTangent: function(p, opt) {
		return this.tangentAtT(this.closestPointT(p, opt));
	},
	containsPoint: function(p, opt) {
		var polyline = this.toPolyline(opt);
		return polyline.containsPoint(p);
	},
	divideAt: function(ratio, opt) {
		if (ratio <= 0) return this.divideAtT(0);
		if (ratio >= 1) return this.divideAtT(1);
		var t = this.tAt(ratio, opt);
		return this.divideAtT(t);
	},
	divideAtLength: function(length$1, opt) {
		var t = this.tAtLength(length$1, opt);
		return this.divideAtT(t);
	},
	divideAtT: function(t) {
		var start = this.start;
		var controlPoint1 = this.controlPoint1;
		var controlPoint2 = this.controlPoint2;
		var end = this.end;
		if (t <= 0) return [new Curve(start, start, start, start), new Curve(start, controlPoint1, controlPoint2, end)];
		if (t >= 1) return [new Curve(start, controlPoint1, controlPoint2, end), new Curve(end, end, end, end)];
		var dividerPoints = this.getSkeletonPoints(t);
		var startControl1 = dividerPoints.startControlPoint1;
		var startControl2 = dividerPoints.startControlPoint2;
		var divider = dividerPoints.divider;
		var dividerControl1 = dividerPoints.dividerControlPoint1;
		var dividerControl2 = dividerPoints.dividerControlPoint2;
		return [new Curve(start, startControl1, startControl2, divider), new Curve(divider, dividerControl1, dividerControl2, end)];
	},
	endpointDistance: function() {
		return this.start.distance(this.end);
	},
	equals: function(c) {
		return !!c && this.start.x === c.start.x && this.start.y === c.start.y && this.controlPoint1.x === c.controlPoint1.x && this.controlPoint1.y === c.controlPoint1.y && this.controlPoint2.x === c.controlPoint2.x && this.controlPoint2.y === c.controlPoint2.y && this.end.x === c.end.x && this.end.y === c.end.y;
	},
	getSkeletonPoints: function(t) {
		var start = this.start;
		var control1 = this.controlPoint1;
		var control2 = this.controlPoint2;
		var end = this.end;
		if (t <= 0) return {
			startControlPoint1: start.clone(),
			startControlPoint2: start.clone(),
			divider: start.clone(),
			dividerControlPoint1: control1.clone(),
			dividerControlPoint2: control2.clone()
		};
		if (t >= 1) return {
			startControlPoint1: control1.clone(),
			startControlPoint2: control2.clone(),
			divider: end.clone(),
			dividerControlPoint1: end.clone(),
			dividerControlPoint2: end.clone()
		};
		var midpoint1 = new Line(start, control1).pointAt(t);
		var midpoint2 = new Line(control1, control2).pointAt(t);
		var midpoint3 = new Line(control2, end).pointAt(t);
		var subControl1 = new Line(midpoint1, midpoint2).pointAt(t);
		var subControl2 = new Line(midpoint2, midpoint3).pointAt(t);
		var divider = new Line(subControl1, subControl2).pointAt(t);
		var output = {
			startControlPoint1: midpoint1,
			startControlPoint2: subControl1,
			divider,
			dividerControlPoint1: subControl2,
			dividerControlPoint2: midpoint3
		};
		return output;
	},
	getSubdivisions: function(opt) {
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var start = this.start;
		var control1 = this.controlPoint1;
		var control2 = this.controlPoint2;
		var end = this.end;
		var subdivisions = [new Curve(start, control1, control2, end)];
		if (precision === 0) return subdivisions;
		var isPoint = !this.isDifferentiable();
		if (isPoint) return subdivisions;
		var previousLength = this.endpointDistance();
		var precisionRatio = pow(10, -precision);
		var minIterations = 2;
		var isLine = control1.cross(start, end) === 0 && control2.cross(start, end) === 0;
		if (isLine) minIterations = 2 * precision;
		var iteration = 0;
		while (true) {
			iteration += 1;
			var newSubdivisions = [];
			var numSubdivisions = subdivisions.length;
			for (var i = 0; i < numSubdivisions; i++) {
				var currentSubdivision = subdivisions[i];
				var divided = currentSubdivision.divide(.5);
				newSubdivisions.push(divided[0], divided[1]);
			}
			var length$1 = 0;
			var numNewSubdivisions = newSubdivisions.length;
			for (var j = 0; j < numNewSubdivisions; j++) {
				var currentNewSubdivision = newSubdivisions[j];
				length$1 += currentNewSubdivision.endpointDistance();
			}
			if (iteration >= minIterations) {
				var observedPrecisionRatio = length$1 !== 0 ? (length$1 - previousLength) / length$1 : 0;
				if (observedPrecisionRatio < precisionRatio) return newSubdivisions;
			}
			subdivisions = newSubdivisions;
			previousLength = length$1;
		}
	},
	isDifferentiable: function() {
		var start = this.start;
		var control1 = this.controlPoint1;
		var control2 = this.controlPoint2;
		var end = this.end;
		return !(start.equals(control1) && control1.equals(control2) && control2.equals(end));
	},
	length: function(opt) {
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var subdivisions = opt.subdivisions === void 0 ? this.getSubdivisions({ precision }) : opt.subdivisions;
		var length$1 = 0;
		var n = subdivisions.length;
		for (var i = 0; i < n; i++) {
			var currentSubdivision = subdivisions[i];
			length$1 += currentSubdivision.endpointDistance();
		}
		return length$1;
	},
	lengthAtT: function(t, opt) {
		if (t <= 0) return 0;
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var subCurve = this.divide(t)[0];
		var subCurveLength = subCurve.length({ precision });
		return subCurveLength;
	},
	pointAt: function(ratio, opt) {
		if (ratio <= 0) return this.start.clone();
		if (ratio >= 1) return this.end.clone();
		var t = this.tAt(ratio, opt);
		return this.pointAtT(t);
	},
	pointAtLength: function(length$1, opt) {
		var t = this.tAtLength(length$1, opt);
		return this.pointAtT(t);
	},
	pointAtT: function(t) {
		if (t <= 0) return this.start.clone();
		if (t >= 1) return this.end.clone();
		return this.getSkeletonPoints(t).divider;
	},
	PRECISION: 3,
	round: function(precision) {
		this.start.round(precision);
		this.controlPoint1.round(precision);
		this.controlPoint2.round(precision);
		this.end.round(precision);
		return this;
	},
	scale: function(sx, sy, origin) {
		this.start.scale(sx, sy, origin);
		this.controlPoint1.scale(sx, sy, origin);
		this.controlPoint2.scale(sx, sy, origin);
		this.end.scale(sx, sy, origin);
		return this;
	},
	tangentAt: function(ratio, opt) {
		if (!this.isDifferentiable()) return null;
		if (ratio < 0) ratio = 0;
		else if (ratio > 1) ratio = 1;
		var t = this.tAt(ratio, opt);
		return this.tangentAtT(t);
	},
	tangentAtLength: function(length$1, opt) {
		if (!this.isDifferentiable()) return null;
		var t = this.tAtLength(length$1, opt);
		return this.tangentAtT(t);
	},
	tangentAtT: function(t) {
		if (!this.isDifferentiable()) return null;
		if (t < 0) t = 0;
		else if (t > 1) t = 1;
		var skeletonPoints = this.getSkeletonPoints(t);
		var p1 = skeletonPoints.startControlPoint2;
		var p2 = skeletonPoints.dividerControlPoint1;
		var tangentStart = skeletonPoints.divider;
		var tangentLine = new Line(p1, p2);
		tangentLine.translate(tangentStart.x - p1.x, tangentStart.y - p1.y);
		return tangentLine;
	},
	tAt: function(ratio, opt) {
		if (ratio <= 0) return 0;
		if (ratio >= 1) return 1;
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var subdivisions = opt.subdivisions === void 0 ? this.getSubdivisions({ precision }) : opt.subdivisions;
		var localOpt = {
			precision,
			subdivisions
		};
		var curveLength = this.length(localOpt);
		var length$1 = curveLength * ratio;
		return this.tAtLength(length$1, localOpt);
	},
	tAtLength: function(length$1, opt) {
		var fromStart = true;
		if (length$1 < 0) {
			fromStart = false;
			length$1 = -length$1;
		}
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var subdivisions = opt.subdivisions === void 0 ? this.getSubdivisions({ precision }) : opt.subdivisions;
		var localOpt = {
			precision,
			subdivisions
		};
		var investigatedSubdivision;
		var investigatedSubdivisionStartT;
		var investigatedSubdivisionEndT;
		var baselinePointDistFromStart;
		var baselinePointDistFromEnd;
		var l = 0;
		var n = subdivisions.length;
		var subdivisionSize = 1 / n;
		for (var i = 0; i < n; i++) {
			var index = fromStart ? i : n - 1 - i;
			var currentSubdivision = subdivisions[i];
			var d = currentSubdivision.endpointDistance();
			if (length$1 <= l + d) {
				investigatedSubdivision = currentSubdivision;
				investigatedSubdivisionStartT = index * subdivisionSize;
				investigatedSubdivisionEndT = (index + 1) * subdivisionSize;
				baselinePointDistFromStart = fromStart ? length$1 - l : d + l - length$1;
				baselinePointDistFromEnd = fromStart ? d + l - length$1 : length$1 - l;
				break;
			}
			l += d;
		}
		if (!investigatedSubdivision) return fromStart ? 1 : 0;
		var curveLength = this.length(localOpt);
		var precisionRatio = pow(10, -precision);
		while (true) {
			var observedPrecisionRatio;
			observedPrecisionRatio = curveLength !== 0 ? baselinePointDistFromStart / curveLength : 0;
			if (observedPrecisionRatio < precisionRatio) return investigatedSubdivisionStartT;
			observedPrecisionRatio = curveLength !== 0 ? baselinePointDistFromEnd / curveLength : 0;
			if (observedPrecisionRatio < precisionRatio) return investigatedSubdivisionEndT;
			var newBaselinePointDistFromStart;
			var newBaselinePointDistFromEnd;
			var divided = investigatedSubdivision.divide(.5);
			subdivisionSize /= 2;
			var baseline1Length = divided[0].endpointDistance();
			var baseline2Length = divided[1].endpointDistance();
			if (baselinePointDistFromStart <= baseline1Length) {
				investigatedSubdivision = divided[0];
				investigatedSubdivisionEndT -= subdivisionSize;
				newBaselinePointDistFromStart = baselinePointDistFromStart;
				newBaselinePointDistFromEnd = baseline1Length - newBaselinePointDistFromStart;
			} else {
				investigatedSubdivision = divided[1];
				investigatedSubdivisionStartT += subdivisionSize;
				newBaselinePointDistFromStart = baselinePointDistFromStart - baseline1Length;
				newBaselinePointDistFromEnd = baseline2Length - newBaselinePointDistFromStart;
			}
			baselinePointDistFromStart = newBaselinePointDistFromStart;
			baselinePointDistFromEnd = newBaselinePointDistFromEnd;
		}
	},
	toPoints: function(opt) {
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var subdivisions = opt.subdivisions === void 0 ? this.getSubdivisions({ precision }) : opt.subdivisions;
		var points = [subdivisions[0].start.clone()];
		var n = subdivisions.length;
		for (var i = 0; i < n; i++) {
			var currentSubdivision = subdivisions[i];
			points.push(currentSubdivision.end.clone());
		}
		return points;
	},
	toPolyline: function(opt) {
		return new Polyline(this.toPoints(opt));
	},
	toString: function() {
		return this.start + " " + this.controlPoint1 + " " + this.controlPoint2 + " " + this.end;
	},
	translate: function(tx, ty) {
		this.start.translate(tx, ty);
		this.controlPoint1.translate(tx, ty);
		this.controlPoint2.translate(tx, ty);
		this.end.translate(tx, ty);
		return this;
	}
};
Curve.prototype.divide = Curve.prototype.divideAtT;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/extend.mjs
function extend$1(obj) {
	var i;
	var n;
	var args = [];
	n = arguments.length;
	for (i = 1; i < n; i++) args.push(arguments[i]);
	if (!obj) throw new Error("Missing a parent object.");
	var child = Object.create(obj);
	n = args.length;
	for (i = 0; i < n; i++) {
		var src = args[i];
		var inheritedProperty;
		var key;
		for (key in src) if (src.hasOwnProperty(key)) {
			delete child[key];
			inheritedProperty = Object.getOwnPropertyDescriptor(src, key);
			Object.defineProperty(child, key, inheritedProperty);
		}
	}
	return child;
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/path.mjs
const Path = function(arg) {
	if (!(this instanceof Path)) return new Path(arg);
	if (typeof arg === "string") return new Path.parse(arg);
	this.segments = [];
	var i;
	var n;
	if (!arg) {} else if (Array.isArray(arg) && arg.length !== 0) {
		arg = arg.reduce(function(acc, val) {
			return acc.concat(val);
		}, []);
		n = arg.length;
		if (arg[0].isSegment) for (i = 0; i < n; i++) {
			var segment = arg[i];
			this.appendSegment(segment);
		}
		else {
			var previousObj = null;
			for (i = 0; i < n; i++) {
				var obj = arg[i];
				if (!(obj instanceof Line || obj instanceof Curve)) throw new Error("Cannot construct a path segment from the provided object.");
				if (i === 0) this.appendSegment(Path.createSegment("M", obj.start));
				if (previousObj && !previousObj.end.equals(obj.start)) this.appendSegment(Path.createSegment("M", obj.start));
				if (obj instanceof Line) this.appendSegment(Path.createSegment("L", obj.end));
				else if (obj instanceof Curve) this.appendSegment(Path.createSegment("C", obj.controlPoint1, obj.controlPoint2, obj.end));
				previousObj = obj;
			}
		}
	} else if (arg.isSegment) this.appendSegment(arg);
	else if (arg instanceof Line) {
		this.appendSegment(Path.createSegment("M", arg.start));
		this.appendSegment(Path.createSegment("L", arg.end));
	} else if (arg instanceof Curve) {
		this.appendSegment(Path.createSegment("M", arg.start));
		this.appendSegment(Path.createSegment("C", arg.controlPoint1, arg.controlPoint2, arg.end));
	} else if (arg instanceof Polyline) {
		if (!(arg.points && arg.points.length !== 0)) return;
		n = arg.points.length;
		for (i = 0; i < n; i++) {
			var point$1 = arg.points[i];
			if (i === 0) this.appendSegment(Path.createSegment("M", point$1));
			else this.appendSegment(Path.createSegment("L", point$1));
		}
	} else throw new Error("Cannot construct a path from the provided object.");
};
Path.parse = function(pathData) {
	if (!pathData) return new Path();
	var path = new Path();
	var commandRe = /(?:[a-zA-Z] *)(?:(?:-?\d+(?:\.\d+)?(?:e[-+]?\d+)? *,? *)|(?:-?\.\d+ *,? *))+|(?:[a-zA-Z] *)(?! |\d|-|\.)/g;
	var commands = pathData.match(commandRe);
	var numCommands = commands.length;
	for (var i = 0; i < numCommands; i++) {
		var command = commands[i];
		var argRe = /(?:[a-zA-Z])|(?:(?:-?\d+(?:\.\d+)?(?:e[-+]?\d+)?))|(?:(?:-?\.\d+))/g;
		var args = command.match(argRe);
		var segment = Path.createSegment.apply(this, args);
		path.appendSegment(segment);
	}
	return path;
};
Path.createSegment = function(type) {
	if (!type) throw new Error("Type must be provided.");
	var segmentConstructor = Path.segmentTypes[type];
	if (!segmentConstructor) throw new Error(type + " is not a recognized path segment type.");
	var args = [];
	var n = arguments.length;
	for (var i = 1; i < n; i++) args.push(arguments[i]);
	return applyToNew(segmentConstructor, args);
};
Path.prototype = {
	type: types.Path,
	appendSegment: function(arg) {
		var segments = this.segments;
		var numSegments = segments.length;
		var currentSegment;
		var previousSegment = numSegments !== 0 ? segments[numSegments - 1] : null;
		var nextSegment = null;
		if (!Array.isArray(arg)) {
			if (!arg || !arg.isSegment) throw new Error("Segment required.");
			currentSegment = this.prepareSegment(arg, previousSegment, nextSegment);
			segments.push(currentSegment);
		} else {
			arg = arg.reduce(function(acc, val) {
				return acc.concat(val);
			}, []);
			if (!arg[0].isSegment) throw new Error("Segments required.");
			var n = arg.length;
			for (var i = 0; i < n; i++) {
				var currentArg = arg[i];
				currentSegment = this.prepareSegment(currentArg, previousSegment, nextSegment);
				segments.push(currentSegment);
				previousSegment = currentSegment;
			}
		}
	},
	bbox: function() {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		var bbox$1;
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			if (segment.isVisible) {
				var segmentBBox = segment.bbox();
				bbox$1 = bbox$1 ? bbox$1.union(segmentBBox) : segmentBBox;
			}
		}
		if (bbox$1) return bbox$1;
		var lastSegment = segments[numSegments - 1];
		return new Rect(lastSegment.end.x, lastSegment.end.y, 0, 0);
	},
	clone: function() {
		var segments = this.segments;
		var numSegments = segments.length;
		var path = new Path();
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i].clone();
			path.appendSegment(segment);
		}
		return path;
	},
	closestPoint: function(p, opt) {
		var t = this.closestPointT(p, opt);
		if (!t) return null;
		return this.pointAtT(t);
	},
	closestPointLength: function(p, opt) {
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var localOpt = {
			precision,
			segmentSubdivisions
		};
		var t = this.closestPointT(p, localOpt);
		if (!t) return 0;
		return this.lengthAtT(t, localOpt);
	},
	closestPointNormalizedLength: function(p, opt) {
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var localOpt = {
			precision,
			segmentSubdivisions
		};
		var cpLength = this.closestPointLength(p, localOpt);
		if (cpLength === 0) return 0;
		var length$1 = this.length(localOpt);
		if (length$1 === 0) return 0;
		return cpLength / length$1;
	},
	closestPointT: function(p, opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var closestPointT;
		var minSquaredDistance = Infinity;
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			var subdivisions = segmentSubdivisions[i];
			if (segment.isVisible) {
				var segmentClosestPointT = segment.closestPointT(p, {
					precision,
					subdivisions
				});
				var segmentClosestPoint = segment.pointAtT(segmentClosestPointT);
				var squaredDistance = new Line(segmentClosestPoint, p).squaredLength();
				if (squaredDistance < minSquaredDistance) {
					closestPointT = {
						segmentIndex: i,
						value: segmentClosestPointT
					};
					minSquaredDistance = squaredDistance;
				}
			}
		}
		if (closestPointT) return closestPointT;
		return {
			segmentIndex: numSegments - 1,
			value: 1
		};
	},
	closestPointTangent: function(p, opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var closestPointTangent;
		var minSquaredDistance = Infinity;
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			var subdivisions = segmentSubdivisions[i];
			if (segment.isDifferentiable()) {
				var segmentClosestPointT = segment.closestPointT(p, {
					precision,
					subdivisions
				});
				var segmentClosestPoint = segment.pointAtT(segmentClosestPointT);
				var squaredDistance = new Line(segmentClosestPoint, p).squaredLength();
				if (squaredDistance < minSquaredDistance) {
					closestPointTangent = segment.tangentAtT(segmentClosestPointT);
					minSquaredDistance = squaredDistance;
				}
			}
		}
		if (closestPointTangent) return closestPointTangent;
		return null;
	},
	containsPoint: function(p, opt) {
		var polylines = this.toPolylines(opt);
		if (!polylines) return false;
		var numPolylines = polylines.length;
		var numIntersections = 0;
		for (var i = 0; i < numPolylines; i++) {
			var polyline = polylines[i];
			if (polyline.containsPoint(p)) numIntersections++;
		}
		return numIntersections % 2 === 1;
	},
	divideAt: function(ratio, opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		if (ratio < 0) ratio = 0;
		if (ratio > 1) ratio = 1;
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var localOpt = {
			precision,
			segmentSubdivisions
		};
		var pathLength = this.length(localOpt);
		var length$1 = pathLength * ratio;
		return this.divideAtLength(length$1, localOpt);
	},
	divideAtLength: function(length$1, opt) {
		var numSegments = this.segments.length;
		if (numSegments === 0) return null;
		var fromStart = true;
		if (length$1 < 0) {
			fromStart = false;
			length$1 = -length$1;
		}
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var i;
		var segment;
		var l = 0;
		var divided;
		var dividedSegmentIndex;
		var lastValidSegment;
		var lastValidSegmentIndex;
		var t;
		for (i = 0; i < numSegments; i++) {
			var index = fromStart ? i : numSegments - 1 - i;
			segment = this.getSegment(index);
			var subdivisions = segmentSubdivisions[index];
			var d = segment.length({
				precision,
				subdivisions
			});
			if (segment.isDifferentiable()) {
				lastValidSegment = segment;
				lastValidSegmentIndex = index;
				if (length$1 <= l + d) {
					dividedSegmentIndex = index;
					divided = segment.divideAtLength((fromStart ? 1 : -1) * (length$1 - l), {
						precision,
						subdivisions
					});
					break;
				}
			}
			l += d;
		}
		if (!lastValidSegment) return null;
		if (!divided) {
			dividedSegmentIndex = lastValidSegmentIndex;
			t = fromStart ? 1 : 0;
			divided = lastValidSegment.divideAtT(t);
		}
		var pathCopy = this.clone();
		pathCopy.replaceSegment(dividedSegmentIndex, divided);
		var divisionStartIndex = dividedSegmentIndex;
		var divisionMidIndex = dividedSegmentIndex + 1;
		var divisionEndIndex = dividedSegmentIndex + 2;
		if (!divided[0].isDifferentiable()) {
			pathCopy.removeSegment(divisionStartIndex);
			divisionMidIndex -= 1;
			divisionEndIndex -= 1;
		}
		var movetoEnd = pathCopy.getSegment(divisionMidIndex).start;
		pathCopy.insertSegment(divisionMidIndex, Path.createSegment("M", movetoEnd));
		divisionEndIndex += 1;
		if (!divided[1].isDifferentiable()) {
			pathCopy.removeSegment(divisionEndIndex - 1);
			divisionEndIndex -= 1;
		}
		var secondPathSegmentIndexConversion = divisionEndIndex - divisionStartIndex - 1;
		for (i = divisionEndIndex; i < pathCopy.segments.length; i++) {
			var originalSegment = this.getSegment(i - secondPathSegmentIndexConversion);
			segment = pathCopy.getSegment(i);
			if (segment.type === "Z" && !originalSegment.subpathStartSegment.end.equals(segment.subpathStartSegment.end)) {
				var convertedSegment = Path.createSegment("L", originalSegment.end);
				pathCopy.replaceSegment(i, convertedSegment);
			}
		}
		var firstPath = new Path(pathCopy.segments.slice(0, divisionMidIndex));
		var secondPath = new Path(pathCopy.segments.slice(divisionMidIndex));
		return [firstPath, secondPath];
	},
	equals: function(p) {
		if (!p) return false;
		var segments = this.segments;
		var otherSegments = p.segments;
		var numSegments = segments.length;
		if (otherSegments.length !== numSegments) return false;
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			var otherSegment = otherSegments[i];
			if (segment.type !== otherSegment.type || !segment.equals(otherSegment)) return false;
		}
		return true;
	},
	getSegment: function(index) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) throw new Error("Path has no segments.");
		if (index < 0) index = numSegments + index;
		if (index >= numSegments || index < 0) throw new Error("Index out of range.");
		return segments[index];
	},
	getSegmentSubdivisions: function(opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = [];
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			var subdivisions = segment.getSubdivisions({ precision });
			segmentSubdivisions.push(subdivisions);
		}
		return segmentSubdivisions;
	},
	getSubpaths: function() {
		const validatedPath = this.clone().validate();
		const segments = validatedPath.segments;
		const numSegments = segments.length;
		const subpaths = [];
		for (let i = 0; i < numSegments; i++) {
			const segment = segments[i];
			if (segment.isSubpathStart) subpaths.push(new Path(segment));
			else subpaths[subpaths.length - 1].appendSegment(segment);
		}
		return subpaths;
	},
	insertSegment: function(index, arg) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (index < 0) index = numSegments + index + 1;
		if (index > numSegments || index < 0) throw new Error("Index out of range.");
		var currentSegment;
		var previousSegment = null;
		var nextSegment = null;
		if (numSegments !== 0) if (index >= 1) {
			previousSegment = segments[index - 1];
			nextSegment = previousSegment.nextSegment;
		} else nextSegment = segments[0];
		if (!Array.isArray(arg)) {
			if (!arg || !arg.isSegment) throw new Error("Segment required.");
			currentSegment = this.prepareSegment(arg, previousSegment, nextSegment);
			segments.splice(index, 0, currentSegment);
		} else {
			arg = arg.reduce(function(acc, val) {
				return acc.concat(val);
			}, []);
			if (!arg[0].isSegment) throw new Error("Segments required.");
			var n = arg.length;
			for (var i = 0; i < n; i++) {
				var currentArg = arg[i];
				currentSegment = this.prepareSegment(currentArg, previousSegment, nextSegment);
				segments.splice(index + i, 0, currentSegment);
				previousSegment = currentSegment;
			}
		}
	},
	intersectionWithLine: function(line$2, opt) {
		var intersection$2 = null;
		var polylines = this.toPolylines(opt);
		if (!polylines) return null;
		for (var i = 0, n = polylines.length; i < n; i++) {
			var polyline = polylines[i];
			var polylineIntersection = line$2.intersect(polyline);
			if (polylineIntersection) {
				intersection$2 || (intersection$2 = []);
				if (Array.isArray(polylineIntersection)) Array.prototype.push.apply(intersection$2, polylineIntersection);
				else intersection$2.push(polylineIntersection);
			}
		}
		return intersection$2;
	},
	isDifferentiable: function() {
		var segments = this.segments;
		var numSegments = segments.length;
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			if (segment.isDifferentiable()) return true;
		}
		return false;
	},
	isValid: function() {
		var segments = this.segments;
		var isValid = segments.length === 0 || segments[0].type === "M";
		return isValid;
	},
	length: function(opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return 0;
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var length$1 = 0;
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			var subdivisions = segmentSubdivisions[i];
			length$1 += segment.length({ subdivisions });
		}
		return length$1;
	},
	lengthAtT: function(t, opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return 0;
		var segmentIndex = t.segmentIndex;
		if (segmentIndex < 0) return 0;
		var tValue = t.value;
		if (segmentIndex >= numSegments) {
			segmentIndex = numSegments - 1;
			tValue = 1;
		} else if (tValue < 0) tValue = 0;
		else if (tValue > 1) tValue = 1;
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var subdivisions;
		var length$1 = 0;
		for (var i = 0; i < segmentIndex; i++) {
			var segment = segments[i];
			subdivisions = segmentSubdivisions[i];
			length$1 += segment.length({
				precisison: precision,
				subdivisions
			});
		}
		segment = segments[segmentIndex];
		subdivisions = segmentSubdivisions[segmentIndex];
		length$1 += segment.lengthAtT(tValue, {
			precisison: precision,
			subdivisions
		});
		return length$1;
	},
	pointAt: function(ratio, opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		if (ratio <= 0) return this.start.clone();
		if (ratio >= 1) return this.end.clone();
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var localOpt = {
			precision,
			segmentSubdivisions
		};
		var pathLength = this.length(localOpt);
		var length$1 = pathLength * ratio;
		return this.pointAtLength(length$1, localOpt);
	},
	pointAtLength: function(length$1, opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		if (length$1 === 0) return this.start.clone();
		var fromStart = true;
		if (length$1 < 0) {
			fromStart = false;
			length$1 = -length$1;
		}
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var lastVisibleSegment;
		var l = 0;
		for (var i = 0; i < numSegments; i++) {
			var index = fromStart ? i : numSegments - 1 - i;
			var segment = segments[index];
			var subdivisions = segmentSubdivisions[index];
			var d = segment.length({
				precision,
				subdivisions
			});
			if (segment.isVisible) {
				if (length$1 <= l + d) return segment.pointAtLength((fromStart ? 1 : -1) * (length$1 - l), {
					precision,
					subdivisions
				});
				lastVisibleSegment = segment;
			}
			l += d;
		}
		if (lastVisibleSegment) return fromStart ? lastVisibleSegment.end : lastVisibleSegment.start;
		var lastSegment = segments[numSegments - 1];
		return lastSegment.end.clone();
	},
	pointAtT: function(t) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		var segmentIndex = t.segmentIndex;
		if (segmentIndex < 0) return segments[0].pointAtT(0);
		if (segmentIndex >= numSegments) return segments[numSegments - 1].pointAtT(1);
		var tValue = t.value;
		if (tValue < 0) tValue = 0;
		else if (tValue > 1) tValue = 1;
		return segments[segmentIndex].pointAtT(tValue);
	},
	PRECISION: 3,
	prepareSegment: function(segment, previousSegment, nextSegment) {
		segment.previousSegment = previousSegment;
		segment.nextSegment = nextSegment;
		if (previousSegment) previousSegment.nextSegment = segment;
		if (nextSegment) nextSegment.previousSegment = segment;
		var updateSubpathStart = segment;
		if (segment.isSubpathStart) {
			segment.subpathStartSegment = segment;
			updateSubpathStart = nextSegment;
		}
		if (updateSubpathStart) this.updateSubpathStartSegment(updateSubpathStart);
		return segment;
	},
	removeSegment: function(index) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) throw new Error("Path has no segments.");
		if (index < 0) index = numSegments + index;
		if (index >= numSegments || index < 0) throw new Error("Index out of range.");
		var removedSegment = segments.splice(index, 1)[0];
		var previousSegment = removedSegment.previousSegment;
		var nextSegment = removedSegment.nextSegment;
		if (previousSegment) previousSegment.nextSegment = nextSegment;
		if (nextSegment) nextSegment.previousSegment = previousSegment;
		if (removedSegment.isSubpathStart && nextSegment) this.updateSubpathStartSegment(nextSegment);
	},
	replaceSegment: function(index, arg) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) throw new Error("Path has no segments.");
		if (index < 0) index = numSegments + index;
		if (index >= numSegments || index < 0) throw new Error("Index out of range.");
		var currentSegment;
		var replacedSegment = segments[index];
		var previousSegment = replacedSegment.previousSegment;
		var nextSegment = replacedSegment.nextSegment;
		var updateSubpathStart = replacedSegment.isSubpathStart;
		if (!Array.isArray(arg)) {
			if (!arg || !arg.isSegment) throw new Error("Segment required.");
			currentSegment = this.prepareSegment(arg, previousSegment, nextSegment);
			segments.splice(index, 1, currentSegment);
			if (updateSubpathStart && currentSegment.isSubpathStart) updateSubpathStart = false;
		} else {
			arg = arg.reduce(function(acc, val) {
				return acc.concat(val);
			}, []);
			if (!arg[0].isSegment) throw new Error("Segments required.");
			segments.splice(index, 1);
			var n = arg.length;
			for (var i = 0; i < n; i++) {
				var currentArg = arg[i];
				currentSegment = this.prepareSegment(currentArg, previousSegment, nextSegment);
				segments.splice(index + i, 0, currentSegment);
				previousSegment = currentSegment;
				if (updateSubpathStart && currentSegment.isSubpathStart) updateSubpathStart = false;
			}
		}
		if (updateSubpathStart && nextSegment) this.updateSubpathStartSegment(nextSegment);
	},
	round: function(precision) {
		var segments = this.segments;
		var numSegments = segments.length;
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			segment.round(precision);
		}
		return this;
	},
	scale: function(sx, sy, origin) {
		var segments = this.segments;
		var numSegments = segments.length;
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			segment.scale(sx, sy, origin);
		}
		return this;
	},
	segmentAt: function(ratio, opt) {
		var index = this.segmentIndexAt(ratio, opt);
		if (!index) return null;
		return this.getSegment(index);
	},
	segmentAtLength: function(length$1, opt) {
		var index = this.segmentIndexAtLength(length$1, opt);
		if (!index) return null;
		return this.getSegment(index);
	},
	segmentIndexAt: function(ratio, opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		if (ratio < 0) ratio = 0;
		if (ratio > 1) ratio = 1;
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var localOpt = {
			precision,
			segmentSubdivisions
		};
		var pathLength = this.length(localOpt);
		var length$1 = pathLength * ratio;
		return this.segmentIndexAtLength(length$1, localOpt);
	},
	segmentIndexAtLength: function(length$1, opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		var fromStart = true;
		if (length$1 < 0) {
			fromStart = false;
			length$1 = -length$1;
		}
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var lastVisibleSegmentIndex = null;
		var l = 0;
		for (var i = 0; i < numSegments; i++) {
			var index = fromStart ? i : numSegments - 1 - i;
			var segment = segments[index];
			var subdivisions = segmentSubdivisions[index];
			var d = segment.length({
				precision,
				subdivisions
			});
			if (segment.isVisible) {
				if (length$1 <= l + d) return index;
				lastVisibleSegmentIndex = index;
			}
			l += d;
		}
		return lastVisibleSegmentIndex;
	},
	serialize: function() {
		if (!this.isValid()) throw new Error("Invalid path segments.");
		return this.toString();
	},
	tangentAt: function(ratio, opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		if (ratio < 0) ratio = 0;
		if (ratio > 1) ratio = 1;
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var localOpt = {
			precision,
			segmentSubdivisions
		};
		var pathLength = this.length(localOpt);
		var length$1 = pathLength * ratio;
		return this.tangentAtLength(length$1, localOpt);
	},
	tangentAtLength: function(length$1, opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		var fromStart = true;
		if (length$1 < 0) {
			fromStart = false;
			length$1 = -length$1;
		}
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var lastValidSegment;
		var l = 0;
		for (var i = 0; i < numSegments; i++) {
			var index = fromStart ? i : numSegments - 1 - i;
			var segment = segments[index];
			var subdivisions = segmentSubdivisions[index];
			var d = segment.length({
				precision,
				subdivisions
			});
			if (segment.isDifferentiable()) {
				if (length$1 <= l + d) return segment.tangentAtLength((fromStart ? 1 : -1) * (length$1 - l), {
					precision,
					subdivisions
				});
				lastValidSegment = segment;
			}
			l += d;
		}
		if (lastValidSegment) {
			var t = fromStart ? 1 : 0;
			return lastValidSegment.tangentAtT(t);
		}
		return null;
	},
	tangentAtT: function(t) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		var segmentIndex = t.segmentIndex;
		if (segmentIndex < 0) return segments[0].tangentAtT(0);
		if (segmentIndex >= numSegments) return segments[numSegments - 1].tangentAtT(1);
		var tValue = t.value;
		if (tValue < 0) tValue = 0;
		else if (tValue > 1) tValue = 1;
		return segments[segmentIndex].tangentAtT(tValue);
	},
	toPoints: function(opt) {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		opt = opt || {};
		var precision = opt.precision === void 0 ? this.PRECISION : opt.precision;
		var segmentSubdivisions = opt.segmentSubdivisions === void 0 ? this.getSegmentSubdivisions({ precision }) : opt.segmentSubdivisions;
		var points = [];
		var partialPoints = [];
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			if (segment.isVisible) {
				var currentSegmentSubdivisions = segmentSubdivisions[i];
				if (currentSegmentSubdivisions.length > 0) {
					var subdivisionPoints = currentSegmentSubdivisions.map(function(curve$1) {
						return curve$1.start;
					});
					Array.prototype.push.apply(partialPoints, subdivisionPoints);
				} else partialPoints.push(segment.start);
			} else if (partialPoints.length > 0) {
				partialPoints.push(segments[i - 1].end);
				points.push(partialPoints);
				partialPoints = [];
			}
		}
		if (partialPoints.length > 0) {
			partialPoints.push(this.end);
			points.push(partialPoints);
		}
		return points;
	},
	toPolylines: function(opt) {
		var polylines = [];
		var points = this.toPoints(opt);
		if (!points) return null;
		for (var i = 0, n = points.length; i < n; i++) polylines.push(new Polyline(points[i]));
		return polylines;
	},
	toString: function() {
		var segments = this.segments;
		var numSegments = segments.length;
		var pathData = "";
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			pathData += segment.serialize() + " ";
		}
		return pathData.trim();
	},
	translate: function(tx, ty) {
		var segments = this.segments;
		var numSegments = segments.length;
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			segment.translate(tx, ty);
		}
		return this;
	},
	updateSubpathStartSegment: function(segment) {
		var previousSegment = segment.previousSegment;
		while (segment && !segment.isSubpathStart) {
			if (previousSegment) segment.subpathStartSegment = previousSegment.subpathStartSegment;
			else segment.subpathStartSegment = null;
			previousSegment = segment;
			segment = segment.nextSegment;
		}
	},
	validate: function() {
		if (!this.isValid()) this.insertSegment(0, Path.createSegment("M", 0, 0));
		return this;
	}
};
Object.defineProperty(Path.prototype, "start", {
	configurable: true,
	enumerable: true,
	get: function() {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		for (var i = 0; i < numSegments; i++) {
			var segment = segments[i];
			if (segment.isVisible) return segment.start;
		}
		return segments[numSegments - 1].end;
	}
});
Object.defineProperty(Path.prototype, "end", {
	configurable: true,
	enumerable: true,
	get: function() {
		var segments = this.segments;
		var numSegments = segments.length;
		if (numSegments === 0) return null;
		for (var i = numSegments - 1; i >= 0; i--) {
			var segment = segments[i];
			if (segment.isVisible) return segment.end;
		}
		return segments[numSegments - 1].end;
	}
});
function applyToNew(constructor, argsArray) {
	argsArray.unshift(null);
	return new (Function.prototype.bind.apply(constructor, argsArray))();
}
var segmentPrototype = {
	bbox: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	clone: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	closestPoint: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	closestPointLength: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	closestPointNormalizedLength: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	closestPointT: function(p) {
		if (this.closestPointNormalizedLength) return this.closestPointNormalizedLength(p);
		throw new Error("Neither closestPointT() nor closestPointNormalizedLength() function is implemented.");
	},
	closestPointTangent: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	divideAt: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	divideAtLength: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	divideAtT: function(t) {
		if (this.divideAt) return this.divideAt(t);
		throw new Error("Neither divideAtT() nor divideAt() function is implemented.");
	},
	equals: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	getSubdivisions: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	isDifferentiable: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	isSegment: true,
	isSubpathStart: false,
	isVisible: true,
	length: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	lengthAtT: function(t) {
		if (t <= 0) return 0;
		var length$1 = this.length();
		if (t >= 1) return length$1;
		return length$1 * t;
	},
	nextSegment: null,
	pointAt: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	pointAtLength: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	pointAtT: function(t) {
		if (this.pointAt) return this.pointAt(t);
		throw new Error("Neither pointAtT() nor pointAt() function is implemented.");
	},
	previousSegment: null,
	round: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	subpathStartSegment: null,
	scale: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	serialize: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	tangentAt: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	tangentAtLength: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	tangentAtT: function(t) {
		if (this.tangentAt) return this.tangentAt(t);
		throw new Error("Neither tangentAtT() nor tangentAt() function is implemented.");
	},
	toString: function() {
		throw new Error("Declaration missing for virtual function.");
	},
	translate: function() {
		throw new Error("Declaration missing for virtual function.");
	}
};
Object.defineProperty(segmentPrototype, "end", {
	configurable: true,
	enumerable: true,
	writable: true
});
Object.defineProperty(segmentPrototype, "start", {
	configurable: true,
	enumerable: true,
	get: function() {
		if (!this.previousSegment) throw new Error("Missing previous segment. (This segment cannot be the first segment of a path; OR segment has not yet been added to a path.)");
		return this.previousSegment.end;
	}
});
Object.defineProperty(segmentPrototype, "type", {
	configurable: true,
	enumerable: true,
	get: function() {
		throw new Error("Bad segment declaration. No type specified.");
	}
});
var Lineto = function() {
	var args = [];
	var n = arguments.length;
	for (var i = 0; i < n; i++) args.push(arguments[i]);
	if (!(this instanceof Lineto)) return applyToNew(Lineto, args);
	if (n === 0) throw new Error("Lineto constructor expects a line, 1 point, or 2 coordinates (none provided).");
	var outputArray;
	if (args[0] instanceof Line) if (n === 1) {
		this.end = args[0].end.clone();
		return this;
	} else throw new Error("Lineto constructor expects a line, 1 point, or 2 coordinates (" + n + " lines provided).");
	else if (typeof args[0] === "string" || typeof args[0] === "number") if (n === 2) {
		this.end = new Point(+args[0], +args[1]);
		return this;
	} else if (n < 2) throw new Error("Lineto constructor expects a line, 1 point, or 2 coordinates (" + n + " coordinates provided).");
	else {
		var segmentCoords;
		outputArray = [];
		for (i = 0; i < n; i += 2) {
			segmentCoords = args.slice(i, i + 2);
			outputArray.push(applyToNew(Lineto, segmentCoords));
		}
		return outputArray;
	}
	else if (n === 1) {
		this.end = new Point(args[0]);
		return this;
	} else {
		var segmentPoint;
		outputArray = [];
		for (i = 0; i < n; i += 1) {
			segmentPoint = args[i];
			outputArray.push(new Lineto(segmentPoint));
		}
		return outputArray;
	}
};
var linetoPrototype = {
	clone: function() {
		return new Lineto(this.end);
	},
	divideAt: function(ratio) {
		var line$2 = new Line(this.start, this.end);
		var divided = line$2.divideAt(ratio);
		return [new Lineto(divided[0]), new Lineto(divided[1])];
	},
	divideAtLength: function(length$1) {
		var line$2 = new Line(this.start, this.end);
		var divided = line$2.divideAtLength(length$1);
		return [new Lineto(divided[0]), new Lineto(divided[1])];
	},
	getSubdivisions: function() {
		return [];
	},
	isDifferentiable: function() {
		if (!this.previousSegment) return false;
		return !this.start.equals(this.end);
	},
	round: function(precision) {
		this.end.round(precision);
		return this;
	},
	scale: function(sx, sy, origin) {
		this.end.scale(sx, sy, origin);
		return this;
	},
	serialize: function() {
		var end = this.end;
		return this.type + " " + end.x + " " + end.y;
	},
	toString: function() {
		return this.type + " " + this.start + " " + this.end;
	},
	translate: function(tx, ty) {
		this.end.translate(tx, ty);
		return this;
	}
};
Object.defineProperty(linetoPrototype, "type", {
	configurable: true,
	enumerable: true,
	value: "L"
});
Lineto.prototype = extend$1(segmentPrototype, Line.prototype, linetoPrototype);
var Curveto = function() {
	var args = [];
	var n = arguments.length;
	for (var i = 0; i < n; i++) args.push(arguments[i]);
	if (!(this instanceof Curveto)) return applyToNew(Curveto, args);
	if (n === 0) throw new Error("Curveto constructor expects a curve, 3 points, or 6 coordinates (none provided).");
	var outputArray;
	if (args[0] instanceof Curve) if (n === 1) {
		this.controlPoint1 = args[0].controlPoint1.clone();
		this.controlPoint2 = args[0].controlPoint2.clone();
		this.end = args[0].end.clone();
		return this;
	} else throw new Error("Curveto constructor expects a curve, 3 points, or 6 coordinates (" + n + " curves provided).");
	else if (typeof args[0] === "string" || typeof args[0] === "number") if (n === 6) {
		this.controlPoint1 = new Point(+args[0], +args[1]);
		this.controlPoint2 = new Point(+args[2], +args[3]);
		this.end = new Point(+args[4], +args[5]);
		return this;
	} else if (n < 6) throw new Error("Curveto constructor expects a curve, 3 points, or 6 coordinates (" + n + " coordinates provided).");
	else {
		var segmentCoords;
		outputArray = [];
		for (i = 0; i < n; i += 6) {
			segmentCoords = args.slice(i, i + 6);
			outputArray.push(applyToNew(Curveto, segmentCoords));
		}
		return outputArray;
	}
	else if (n === 3) {
		this.controlPoint1 = new Point(args[0]);
		this.controlPoint2 = new Point(args[1]);
		this.end = new Point(args[2]);
		return this;
	} else if (n < 3) throw new Error("Curveto constructor expects a curve, 3 points, or 6 coordinates (" + n + " points provided).");
	else {
		var segmentPoints;
		outputArray = [];
		for (i = 0; i < n; i += 3) {
			segmentPoints = args.slice(i, i + 3);
			outputArray.push(applyToNew(Curveto, segmentPoints));
		}
		return outputArray;
	}
};
var curvetoPrototype = {
	clone: function() {
		return new Curveto(this.controlPoint1, this.controlPoint2, this.end);
	},
	divideAt: function(ratio, opt) {
		var curve$1 = new Curve(this.start, this.controlPoint1, this.controlPoint2, this.end);
		var divided = curve$1.divideAt(ratio, opt);
		return [new Curveto(divided[0]), new Curveto(divided[1])];
	},
	divideAtLength: function(length$1, opt) {
		var curve$1 = new Curve(this.start, this.controlPoint1, this.controlPoint2, this.end);
		var divided = curve$1.divideAtLength(length$1, opt);
		return [new Curveto(divided[0]), new Curveto(divided[1])];
	},
	divideAtT: function(t) {
		var curve$1 = new Curve(this.start, this.controlPoint1, this.controlPoint2, this.end);
		var divided = curve$1.divideAtT(t);
		return [new Curveto(divided[0]), new Curveto(divided[1])];
	},
	isDifferentiable: function() {
		if (!this.previousSegment) return false;
		var start = this.start;
		var control1 = this.controlPoint1;
		var control2 = this.controlPoint2;
		var end = this.end;
		return !(start.equals(control1) && control1.equals(control2) && control2.equals(end));
	},
	round: function(precision) {
		this.controlPoint1.round(precision);
		this.controlPoint2.round(precision);
		this.end.round(precision);
		return this;
	},
	scale: function(sx, sy, origin) {
		this.controlPoint1.scale(sx, sy, origin);
		this.controlPoint2.scale(sx, sy, origin);
		this.end.scale(sx, sy, origin);
		return this;
	},
	serialize: function() {
		var c1 = this.controlPoint1;
		var c2 = this.controlPoint2;
		var end = this.end;
		return this.type + " " + c1.x + " " + c1.y + " " + c2.x + " " + c2.y + " " + end.x + " " + end.y;
	},
	toString: function() {
		return this.type + " " + this.start + " " + this.controlPoint1 + " " + this.controlPoint2 + " " + this.end;
	},
	translate: function(tx, ty) {
		this.controlPoint1.translate(tx, ty);
		this.controlPoint2.translate(tx, ty);
		this.end.translate(tx, ty);
		return this;
	}
};
Object.defineProperty(curvetoPrototype, "type", {
	configurable: true,
	enumerable: true,
	value: "C"
});
Curveto.prototype = extend$1(segmentPrototype, Curve.prototype, curvetoPrototype);
var Moveto = function() {
	var args = [];
	var n = arguments.length;
	for (var i = 0; i < n; i++) args.push(arguments[i]);
	if (!(this instanceof Moveto)) return applyToNew(Moveto, args);
	if (n === 0) throw new Error("Moveto constructor expects a line, a curve, 1 point, or 2 coordinates (none provided).");
	var outputArray;
	if (args[0] instanceof Line) if (n === 1) {
		this.end = args[0].end.clone();
		return this;
	} else throw new Error("Moveto constructor expects a line, a curve, 1 point, or 2 coordinates (" + n + " lines provided).");
	else if (args[0] instanceof Curve) if (n === 1) {
		this.end = args[0].end.clone();
		return this;
	} else throw new Error("Moveto constructor expects a line, a curve, 1 point, or 2 coordinates (" + n + " curves provided).");
	else if (typeof args[0] === "string" || typeof args[0] === "number") if (n === 2) {
		this.end = new Point(+args[0], +args[1]);
		return this;
	} else if (n < 2) throw new Error("Moveto constructor expects a line, a curve, 1 point, or 2 coordinates (" + n + " coordinates provided).");
	else {
		var segmentCoords;
		outputArray = [];
		for (i = 0; i < n; i += 2) {
			segmentCoords = args.slice(i, i + 2);
			if (i === 0) outputArray.push(applyToNew(Moveto, segmentCoords));
			else outputArray.push(applyToNew(Lineto, segmentCoords));
		}
		return outputArray;
	}
	else if (n === 1) {
		this.end = new Point(args[0]);
		return this;
	} else {
		var segmentPoint;
		outputArray = [];
		for (i = 0; i < n; i += 1) {
			segmentPoint = args[i];
			if (i === 0) outputArray.push(new Moveto(segmentPoint));
			else outputArray.push(new Lineto(segmentPoint));
		}
		return outputArray;
	}
};
var movetoPrototype = {
	bbox: function() {
		return null;
	},
	clone: function() {
		return new Moveto(this.end);
	},
	closestPoint: function() {
		return this.end.clone();
	},
	closestPointNormalizedLength: function() {
		return 0;
	},
	closestPointLength: function() {
		return 0;
	},
	closestPointT: function() {
		return 1;
	},
	closestPointTangent: function() {
		return null;
	},
	divideAt: function() {
		return [this.clone(), this.clone()];
	},
	divideAtLength: function() {
		return [this.clone(), this.clone()];
	},
	equals: function(m) {
		return this.end.equals(m.end);
	},
	getSubdivisions: function() {
		return [];
	},
	isDifferentiable: function() {
		return false;
	},
	isSubpathStart: true,
	isVisible: false,
	length: function() {
		return 0;
	},
	lengthAtT: function() {
		return 0;
	},
	pointAt: function() {
		return this.end.clone();
	},
	pointAtLength: function() {
		return this.end.clone();
	},
	pointAtT: function() {
		return this.end.clone();
	},
	round: function(precision) {
		this.end.round(precision);
		return this;
	},
	scale: function(sx, sy, origin) {
		this.end.scale(sx, sy, origin);
		return this;
	},
	serialize: function() {
		var end = this.end;
		return this.type + " " + end.x + " " + end.y;
	},
	tangentAt: function() {
		return null;
	},
	tangentAtLength: function() {
		return null;
	},
	tangentAtT: function() {
		return null;
	},
	toString: function() {
		return this.type + " " + this.end;
	},
	translate: function(tx, ty) {
		this.end.translate(tx, ty);
		return this;
	}
};
Object.defineProperty(movetoPrototype, "start", {
	configurable: true,
	enumerable: true,
	get: function() {
		throw new Error("Illegal access. Moveto segments should not need a start property.");
	}
});
Object.defineProperty(movetoPrototype, "type", {
	configurable: true,
	enumerable: true,
	value: "M"
});
Moveto.prototype = extend$1(segmentPrototype, movetoPrototype);
var Closepath = function() {
	var args = [];
	var n = arguments.length;
	for (var i = 0; i < n; i++) args.push(arguments[i]);
	if (!(this instanceof Closepath)) return applyToNew(Closepath, args);
	if (n > 0) throw new Error("Closepath constructor expects no arguments.");
	return this;
};
var closepathPrototype = {
	clone: function() {
		return new Closepath();
	},
	divideAt: function(ratio) {
		var line$2 = new Line(this.start, this.end);
		var divided = line$2.divideAt(ratio);
		return [divided[1].isDifferentiable() ? new Lineto(divided[0]) : this.clone(), new Lineto(divided[1])];
	},
	divideAtLength: function(length$1) {
		var line$2 = new Line(this.start, this.end);
		var divided = line$2.divideAtLength(length$1);
		return [divided[1].isDifferentiable() ? new Lineto(divided[0]) : this.clone(), new Lineto(divided[1])];
	},
	getSubdivisions: function() {
		return [];
	},
	isDifferentiable: function() {
		if (!this.previousSegment || !this.subpathStartSegment) return false;
		return !this.start.equals(this.end);
	},
	round: function() {
		return this;
	},
	scale: function() {
		return this;
	},
	serialize: function() {
		return this.type;
	},
	toString: function() {
		return this.type + " " + this.start + " " + this.end;
	},
	translate: function() {
		return this;
	}
};
Object.defineProperty(closepathPrototype, "end", {
	configurable: true,
	enumerable: true,
	get: function() {
		if (!this.subpathStartSegment) throw new Error("Missing subpath start segment. (This segment needs a subpath start segment (e.g. Moveto); OR segment has not yet been added to a path.)");
		return this.subpathStartSegment.end;
	}
});
Object.defineProperty(closepathPrototype, "type", {
	configurable: true,
	enumerable: true,
	value: "Z"
});
Closepath.prototype = extend$1(segmentPrototype, Line.prototype, closepathPrototype);
var segmentTypes = Path.segmentTypes = {
	L: Lineto,
	C: Curveto,
	M: Moveto,
	Z: Closepath,
	z: Closepath
};
Path.regexSupportedData = /* @__PURE__ */ new RegExp("^[\\s\\d" + Object.keys(segmentTypes).join("") + ",.]*$");
Path.isDataSupported = function(data$1) {
	if (typeof data$1 !== "string") return false;
	return this.regexSupportedData.test(data$1);
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/bezier.mjs
const bezier = {
	curveThroughPoints: function(points) {
		console.warn("deprecated");
		return new Path(Curve.throughPoints(points)).serialize();
	},
	getCurveControlPoints: function(knots) {
		console.warn("deprecated");
		var firstControlPoints = [];
		var secondControlPoints = [];
		var n = knots.length - 1;
		var i;
		if (n == 1) {
			firstControlPoints[0] = new Point((2 * knots[0].x + knots[1].x) / 3, (2 * knots[0].y + knots[1].y) / 3);
			secondControlPoints[0] = new Point(2 * firstControlPoints[0].x - knots[0].x, 2 * firstControlPoints[0].y - knots[0].y);
			return [firstControlPoints, secondControlPoints];
		}
		var rhs = [];
		for (i = 1; i < n - 1; i++) rhs[i] = 4 * knots[i].x + 2 * knots[i + 1].x;
		rhs[0] = knots[0].x + 2 * knots[1].x;
		rhs[n - 1] = (8 * knots[n - 1].x + knots[n].x) / 2;
		var x = this.getFirstControlPoints(rhs);
		for (i = 1; i < n - 1; ++i) rhs[i] = 4 * knots[i].y + 2 * knots[i + 1].y;
		rhs[0] = knots[0].y + 2 * knots[1].y;
		rhs[n - 1] = (8 * knots[n - 1].y + knots[n].y) / 2;
		var y = this.getFirstControlPoints(rhs);
		for (i = 0; i < n; i++) {
			firstControlPoints.push(new Point(x[i], y[i]));
			if (i < n - 1) secondControlPoints.push(new Point(2 * knots[i + 1].x - x[i + 1], 2 * knots[i + 1].y - y[i + 1]));
			else secondControlPoints.push(new Point((knots[n].x + x[n - 1]) / 2, (knots[n].y + y[n - 1]) / 2));
		}
		return [firstControlPoints, secondControlPoints];
	},
	getCurveDivider: function(p0, p1, p2, p3) {
		console.warn("deprecated");
		var curve$1 = new Curve(p0, p1, p2, p3);
		return function divideCurve(t) {
			var divided = curve$1.divide(t);
			return [{
				p0: divided[0].start,
				p1: divided[0].controlPoint1,
				p2: divided[0].controlPoint2,
				p3: divided[0].end
			}, {
				p0: divided[1].start,
				p1: divided[1].controlPoint1,
				p2: divided[1].controlPoint2,
				p3: divided[1].end
			}];
		};
	},
	getFirstControlPoints: function(rhs) {
		console.warn("deprecated");
		var n = rhs.length;
		var x = [];
		var tmp = [];
		var b = 2;
		x[0] = rhs[0] / b;
		for (var i = 1; i < n; i++) {
			tmp[i] = 1 / b;
			b = (i < n - 1 ? 4 : 3.5) - tmp[i];
			x[i] = (rhs[i] - x[i - 1]) / b;
		}
		for (i = 1; i < n; i++) x[n - i - 1] -= tmp[n - i] * x[n - i];
		return x;
	},
	getInversionSolver: function(p0, p1, p2, p3) {
		console.warn("deprecated");
		var curve$1 = new Curve(p0, p1, p2, p3);
		return function solveInversion(p) {
			return curve$1.closestPointT(p);
		};
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/polygon.mjs
const Polygon$1 = function(points) {
	if (!(this instanceof Polygon$1)) return new Polygon$1(points);
	if (typeof points === "string") return new Polygon$1.parse(points);
	this.points = Array.isArray(points) ? points.map(Point) : [];
};
Polygon$1.parse = function(svgString) {
	return new Polygon$1(parsePoints(svgString));
};
Polygon$1.fromRect = function(rect$1) {
	return new Polygon$1([
		rect$1.topLeft(),
		rect$1.topRight(),
		rect$1.bottomRight(),
		rect$1.bottomLeft()
	]);
};
Polygon$1.prototype = extend$1(Polyline.prototype, {
	type: types.Polygon,
	clone: function() {
		return new Polygon$1(clonePoints(this.points));
	},
	convexHull: function() {
		return new Polygon$1(convexHull(this.points));
	},
	lengthPoints: function() {
		const { start, end, points } = this;
		if (points.length <= 1 || start.equals(end)) return points;
		return [...points, start.clone()];
	}
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/intersection.mjs
var intersection_exports = {};
__export(intersection_exports, {
	ellipseWithEllipse: () => ellipseWithEllipse,
	ellipseWithLine: () => ellipseWithLine,
	exists: () => exists,
	lineWithLine: () => lineWithLine,
	pathWithEllipse: () => pathWithEllipse,
	pathWithLine: () => pathWithLine,
	pathWithPath: () => pathWithPath,
	pathWithPolygon: () => pathWithPolygon,
	pathWithPolyline: () => pathWithPolyline,
	pathWithRect: () => pathWithRect,
	polygonWithEllipse: () => polygonWithEllipse,
	polygonWithLine: () => polygonWithLine,
	polygonWithPolygon: () => polygonWithPolygon,
	polygonWithPolyline: () => polygonWithPolyline,
	polygonWithRect: () => polygonWithRect,
	polylineWithEllipse: () => polylineWithEllipse,
	polylineWithLine: () => polylineWithLine,
	polylineWithPolyline: () => polylineWithPolyline,
	polylineWithRect: () => polylineWithRect,
	rectWithEllipse: () => rectWithEllipse,
	rectWithLine: () => rectWithLine,
	rectWithRect: () => rectWithRect
});
function exists(shape1, shape2, shape1opt, shape2opt) {
	switch (shape1.type) {
		case types.Line:
			switch (shape2.type) {
				case types.Line: return lineWithLine(shape1, shape2);
			}
			break;
		case types.Ellipse:
			switch (shape2.type) {
				case types.Line: return ellipseWithLine(shape1, shape2);
				case types.Ellipse: return ellipseWithEllipse(shape1, shape2);
			}
			break;
		case types.Rect:
			switch (shape2.type) {
				case types.Line: return rectWithLine(shape1, shape2);
				case types.Ellipse: return rectWithEllipse(shape1, shape2);
				case types.Rect: return rectWithRect(shape1, shape2);
			}
			break;
		case types.Polyline:
			switch (shape2.type) {
				case types.Line: return polylineWithLine(shape1, shape2);
				case types.Ellipse: return polylineWithEllipse(shape1, shape2);
				case types.Rect: return polylineWithRect(shape1, shape2);
				case types.Polyline: return polylineWithPolyline(shape1, shape2);
			}
			break;
		case types.Polygon:
			switch (shape2.type) {
				case types.Line: return polygonWithLine(shape1, shape2);
				case types.Ellipse: return polygonWithEllipse(shape1, shape2);
				case types.Rect: return polygonWithRect(shape1, shape2);
				case types.Polyline: return polygonWithPolyline(shape1, shape2);
				case types.Polygon: return polygonWithPolygon(shape1, shape2);
			}
			break;
		case types.Path:
			switch (shape2.type) {
				case types.Line: return pathWithLine(shape1, shape2, shape1opt);
				case types.Ellipse: return pathWithEllipse(shape1, shape2, shape1opt);
				case types.Rect: return pathWithRect(shape1, shape2, shape1opt);
				case types.Polyline: return pathWithPolyline(shape1, shape2, shape1opt);
				case types.Polygon: return pathWithPolygon(shape1, shape2, shape1opt);
				case types.Path: return pathWithPath(shape1, shape2, shape1opt, shape2opt);
			}
			break;
	}
	switch (shape2.type) {
		case types.Ellipse:
		case types.Rect:
		case types.Polyline:
		case types.Polygon:
		case types.Path: return exists(shape2, shape1, shape2opt, shape1opt);
		default: throw Error(`The intersection for ${shape1} and ${shape2} could not be found.`);
	}
}
function lineWithLine(line1, line2) {
	const x1 = line1.start.x;
	const y1 = line1.start.y;
	const x2 = line1.end.x;
	const y2 = line1.end.y;
	const x3 = line2.start.x;
	const y3 = line2.start.y;
	const x4 = line2.end.x;
	const y4 = line2.end.y;
	const s1x = x2 - x1;
	const s1y = y2 - y1;
	const s2x = x4 - x3;
	const s2y = y4 - y3;
	const s3x = x1 - x3;
	const s3y = y1 - y3;
	const p = s1x * s2y - s2x * s1y;
	const s = (s1x * s3y - s1y * s3x) / p;
	const t = (s2x * s3y - s2y * s3x) / p;
	return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}
function ellipseWithLine(ellipse$2, line$2) {
	const rex = ellipse$2.a;
	const rey = ellipse$2.b;
	const xe = ellipse$2.x;
	const ye = ellipse$2.y;
	const x1 = line$2.start.x - xe;
	const x2 = line$2.end.x - xe;
	const y1 = line$2.start.y - ye;
	const y2 = line$2.end.y - ye;
	const rex_2 = rex * rex;
	const rey_2 = rey * rey;
	const dx = x2 - x1;
	const dy = y2 - y1;
	const A = dx * dx / rex_2 + dy * dy / rey_2;
	const B = 2 * x1 * dx / rex_2 + 2 * y1 * dy / rey_2;
	const C = x1 * x1 / rex_2 + y1 * y1 / rey_2 - 1;
	const D = B * B - 4 * A * C;
	if (D === 0) {
		const t = -B / 2 / A;
		return t >= 0 && t <= 1;
	} else if (D > 0) {
		const sqrt$3 = Math.sqrt(D);
		const t1 = (-B + sqrt$3) / 2 / A;
		const t2 = (-B - sqrt$3) / 2 / A;
		return t1 >= 0 && t1 <= 1 || t2 >= 0 && t2 <= 1;
	}
	return false;
}
function ellipseWithEllipse(ellipse1, ellipse2) {
	return _ellipsesIntersection(ellipse1, 0, ellipse2, 0);
}
function rectWithLine(rect$1, line$2) {
	const { start, end } = line$2;
	const { x, y, width: width$1, height: height$1 } = rect$1;
	if (start.x > x + width$1 && end.x > x + width$1 || start.x < x && end.x < x || start.y > y + height$1 && end.y > y + height$1 || start.y < y && end.y < y) return false;
	if (rect$1.containsPoint(line$2.start) || rect$1.containsPoint(line$2.end)) return true;
	return lineWithLine(rect$1.topLine(), line$2) || lineWithLine(rect$1.rightLine(), line$2) || lineWithLine(rect$1.bottomLine(), line$2) || lineWithLine(rect$1.leftLine(), line$2);
}
function rectWithEllipse(rect$1, ellipse$2) {
	if (!rectWithRect(rect$1, Rect.fromEllipse(ellipse$2))) return false;
	return polygonWithEllipse(Polygon$1.fromRect(rect$1), ellipse$2);
}
function rectWithRect(rect1, rect2) {
	return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
}
function polylineWithLine(polyline, line$2) {
	return _polylineWithLine(polyline, line$2, { interior: false });
}
function polylineWithEllipse(polyline, ellipse$2) {
	return _polylineWithEllipse(polyline, ellipse$2, { interior: false });
}
function polylineWithRect(polyline, rect$1) {
	return _polylineWithRect(polyline, rect$1, { interior: false });
}
function polylineWithPolyline(polyline1, polyline2) {
	return _polylineWithPolyline(polyline1, polyline2, { interior: false });
}
function polygonWithLine(polygon, line$2) {
	return _polylineWithLine(polygon, line$2, { interior: true });
}
function polygonWithEllipse(polygon, ellipse$2) {
	return _polylineWithEllipse(polygon, ellipse$2, { interior: true });
}
function polygonWithRect(polygon, rect$1) {
	return _polylineWithRect(polygon, rect$1, { interior: true });
}
function polygonWithPolyline(polygon, polyline) {
	return _polylineWithPolyline(polygon, polyline, { interior: true });
}
function polygonWithPolygon(polygon1, polygon2) {
	return _polylineWithPolygon(polygon1, polygon2, { interior: true });
}
function pathWithLine(path, line$2, pathOpt) {
	return path.getSubpaths().some((subpath) => {
		const [polyline] = subpath.toPolylines(pathOpt);
		const { type } = subpath.getSegment(-1);
		if (type === "Z") return polygonWithLine(polyline, line$2);
		else return polylineWithLine(polyline, line$2);
	});
}
function pathWithEllipse(path, ellipse$2, pathOpt) {
	return path.getSubpaths().some((subpath) => {
		const [polyline] = subpath.toPolylines(pathOpt);
		const { type } = subpath.getSegment(-1);
		if (type === "Z") return polygonWithEllipse(polyline, ellipse$2);
		else return polylineWithEllipse(polyline, ellipse$2);
	});
}
function pathWithRect(path, rect$1, pathOpt) {
	return pathWithPolygon(path, Polygon$1.fromRect(rect$1), pathOpt);
}
function pathWithPolyline(path, polyline, pathOpt) {
	return _pathWithPolyline(path, polyline, pathOpt, { interior: false });
}
function pathWithPolygon(path, polygon, pathOpt) {
	return _pathWithPolyline(path, polygon, pathOpt, { interior: true });
}
function pathWithPath(path1, path2, pathOpt1, pathOpt2) {
	return path1.getSubpaths().some((subpath) => {
		const [polyline1] = subpath.toPolylines(pathOpt1);
		const { type } = subpath.getSegment(-1);
		if (type === "Z") return pathWithPolygon(path2, polyline1, pathOpt2);
		else return pathWithPolyline(path2, polyline1, pathOpt2);
	});
}
function _polylineWithLine(polyline, line$2, opt = {}) {
	const { interior = false } = opt;
	let thisPoints;
	if (interior) {
		if (polyline.containsPoint(line$2.start)) return true;
		const { start, end, points } = polyline;
		thisPoints = end.equals(start) ? points : [...points, start];
	} else thisPoints = polyline.points;
	const { length: length$1 } = thisPoints;
	const segment = new Line();
	for (let i = 0; i < length$1 - 1; i++) {
		segment.start = thisPoints[i];
		segment.end = thisPoints[i + 1];
		if (lineWithLine(line$2, segment)) return true;
	}
	return false;
}
function _polylineWithEllipse(polyline, ellipse$2, opt = {}) {
	const { start, end, points } = polyline;
	if (ellipse$2.containsPoint(start)) return true;
	let thisPoints;
	const { interior = false } = opt;
	if (interior) {
		if (polyline.containsPoint(ellipse$2.center())) return true;
		thisPoints = end.equals(start) ? points : [...points, start];
	} else thisPoints = points;
	const { length: length$1 } = thisPoints;
	const segment = new Line();
	for (let i = 0; i < length$1 - 1; i++) {
		segment.start = thisPoints[i];
		segment.end = thisPoints[i + 1];
		if (ellipseWithLine(ellipse$2, segment)) return true;
	}
	return false;
}
function _polylineWithRect(polyline, rect$1, opt) {
	const polygon = Polygon$1.fromRect(rect$1);
	return _polylineWithPolygon(polyline, polygon, opt);
}
function _pathWithPolyline(path, polyline1, pathOpt, opt) {
	return path.getSubpaths().some((subpath) => {
		const [polyline2] = subpath.toPolylines(pathOpt);
		const { type } = subpath.getSegment(-1);
		if (type === "Z") return _polylineWithPolygon(polyline1, polyline2, opt);
		else return _polylineWithPolyline(polyline1, polyline2, opt);
	});
}
function _polylineWithPolyline(polyline1, polyline2, opt = {}) {
	const { interior = false } = opt;
	let thisPolyline;
	if (interior) {
		const { start } = polyline2;
		if (polyline1.containsPoint(start)) return true;
		thisPolyline = polyline1.clone().close();
	} else thisPolyline = polyline1;
	const otherPoints = polyline2.points;
	const { length: length$1 } = otherPoints;
	const segment = new Line();
	for (let i = 0; i < length$1 - 1; i++) {
		segment.start = otherPoints[i];
		segment.end = otherPoints[i + 1];
		if (polylineWithLine(thisPolyline, segment)) return true;
	}
	return false;
}
function _polylineWithPolygon(polyline, polygon, opt) {
	return polygon.containsPoint(polyline.start) || _polylineWithPolyline(polyline, polygon.clone().close(), opt);
}
function _ellipsesIntersection(e1, w1, e2, w2) {
	const { cos: cos$3, sin: sin$3 } = Math;
	const sinW1 = sin$3(w1);
	const cosW1 = cos$3(w1);
	const sinW2 = sin$3(w2);
	const cosW2 = cos$3(w2);
	const sinW1s = sinW1 * sinW1;
	const cosW1s = cosW1 * cosW1;
	const sinCos1 = sinW1 * cosW1;
	const sinW2s = sinW2 * sinW2;
	const cosW2s = cosW2 * cosW2;
	const sinCos2 = sinW2 * cosW2;
	const a1s = e1.a * e1.a;
	const b1s = e1.b * e1.b;
	const a2s = e2.a * e2.a;
	const b2s = e2.b * e2.b;
	const A1 = a1s * sinW1s + b1s * cosW1s;
	const A2 = a2s * sinW2s + b2s * cosW2s;
	const B1 = a1s * cosW1s + b1s * sinW1s;
	const B2 = a2s * cosW2s + b2s * sinW2s;
	let C1 = 2 * (b1s - a1s) * sinCos1;
	let C2 = 2 * (b2s - a2s) * sinCos2;
	let D1 = -2 * A1 * e1.x - C1 * e1.y;
	let D2 = -2 * A2 * e2.x - C2 * e2.y;
	let E1 = -C1 * e1.x - 2 * B1 * e1.y;
	let E2 = -C2 * e2.x - 2 * B2 * e2.y;
	const F1 = A1 * e1.x * e1.x + B1 * e1.y * e1.y + C1 * e1.x * e1.y - a1s * b1s;
	const F2 = A2 * e2.x * e2.x + B2 * e2.y * e2.y + C2 * e2.x * e2.y - a2s * b2s;
	C1 = C1 / 2;
	C2 = C2 / 2;
	D1 = D1 / 2;
	D2 = D2 / 2;
	E1 = E1 / 2;
	E2 = E2 / 2;
	const l3 = det3([
		[
			A1,
			C1,
			D1
		],
		[
			C1,
			B1,
			E1
		],
		[
			D1,
			E1,
			F1
		]
	]);
	const l0 = det3([
		[
			A2,
			C2,
			D2
		],
		[
			C2,
			B2,
			E2
		],
		[
			D2,
			E2,
			F2
		]
	]);
	const l2 = .33333333 * (det3([
		[
			A2,
			C1,
			D1
		],
		[
			C2,
			B1,
			E1
		],
		[
			D2,
			E1,
			F1
		]
	]) + det3([
		[
			A1,
			C2,
			D1
		],
		[
			C1,
			B2,
			E1
		],
		[
			D1,
			E2,
			F1
		]
	]) + det3([
		[
			A1,
			C1,
			D2
		],
		[
			C1,
			B1,
			E2
		],
		[
			D1,
			E1,
			F2
		]
	]));
	const l1 = .33333333 * (det3([
		[
			A1,
			C2,
			D2
		],
		[
			C1,
			B2,
			E2
		],
		[
			D1,
			E2,
			F2
		]
	]) + det3([
		[
			A2,
			C1,
			D2
		],
		[
			C2,
			B1,
			E2
		],
		[
			D2,
			E1,
			F2
		]
	]) + det3([
		[
			A2,
			C2,
			D1
		],
		[
			C2,
			B2,
			E1
		],
		[
			D2,
			E2,
			F1
		]
	]));
	const delta1 = det2([[l3, l2], [l2, l1]]);
	const delta2 = det2([[l3, l1], [l2, l0]]);
	const delta3 = det2([[l2, l1], [l1, l0]]);
	const dP = det2([[2 * delta1, delta2], [delta2, 2 * delta3]]);
	if (dP > 0 && (l1 > 0 || l2 > 0)) return false;
	return true;
}
function det2(m) {
	return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}
function det3(m) {
	return m[0][0] * m[1][1] * m[2][2] - m[0][0] * m[1][2] * m[2][1] - m[0][1] * m[1][0] * m[2][2] + m[0][1] * m[1][2] * m[2][0] + m[0][2] * m[1][0] * m[2][1] - m[0][2] * m[1][1] * m[2][0];
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/g/index.mjs
var g_exports = {};
__export(g_exports, {
	Curve: () => Curve,
	Ellipse: () => Ellipse$1,
	Line: () => Line,
	Path: () => Path,
	Point: () => Point,
	Polygon: () => Polygon$1,
	Polyline: () => Polyline,
	Rect: () => Rect,
	bezier: () => bezier,
	ellipse: () => ellipse$1,
	intersection: () => intersection,
	line: () => line$1,
	normalizeAngle: () => normalizeAngle,
	point: () => point,
	random: () => random,
	rect: () => rect,
	scale: () => scale,
	snapToGrid: () => snapToGrid,
	toDeg: () => toDeg,
	toRad: () => toRad,
	types: () => types
});
const intersection = intersection_exports;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/V/index.mjs
const V = (function() {
	var hasSvg = typeof window === "object" && !!window.SVGAngle;
	if (!hasSvg) return function() {
		throw new Error("SVG is required to use Vectorizer.");
	};
	var ns = {
		svg: "http://www.w3.org/2000/svg",
		xmlns: "http://www.w3.org/2000/xmlns/",
		xml: "http://www.w3.org/XML/1998/namespace",
		xlink: "http://www.w3.org/1999/xlink",
		xhtml: "http://www.w3.org/1999/xhtml"
	};
	var SVGVersion = "1.1";
	var math = Math;
	var PI$2 = math.PI;
	var atan2$2 = math.atan2;
	var sqrt$3 = math.sqrt;
	var min$4 = math.min;
	var max$4 = math.max;
	var cos$3 = math.cos;
	var sin$3 = math.sin;
	var V$1 = function(el, attrs, children$1) {
		if (!(this instanceof V$1)) return V$1.apply(Object.create(V$1.prototype), arguments);
		if (!el) return;
		if (V$1.isV(el)) el = el.node;
		attrs = attrs || {};
		if (V$1.isString(el)) {
			el = el.trim();
			if (el.toLowerCase() === "svg") el = V$1.createSvgDocument();
			else if (el[0] === "<") {
				var svgDoc = V$1.createSvgDocument(el);
				if (svgDoc.childNodes.length > 1) {
					var arrayOfVels = [];
					var i, len;
					for (i = 0, len = svgDoc.childNodes.length; i < len; i++) {
						var childNode = svgDoc.childNodes[i];
						arrayOfVels.push(new V$1(document.importNode(childNode, true)));
					}
					return arrayOfVels;
				}
				el = document.importNode(svgDoc.firstChild, true);
			} else el = document.createElementNS(ns.svg, el);
			V$1.ensureId(el);
		}
		this.node = el;
		this.setAttributes(attrs);
		if (children$1) this.append(children$1);
		return this;
	};
	var VPrototype = V$1.prototype;
	Object.defineProperty(VPrototype, "id", {
		enumerable: true,
		get: function() {
			return this.node.id;
		},
		set: function(id) {
			this.node.id = id;
		}
	});
	/**
	* @param {SVGGElement} toElem
	* @returns {SVGMatrix}
	*/
	VPrototype.getTransformToElement = function(target) {
		var node = this.node;
		if (V$1.isSVGGraphicsElement(target) && V$1.isSVGGraphicsElement(node)) {
			var targetCTM = V$1.toNode(target).getScreenCTM();
			var nodeCTM = node.getScreenCTM();
			if (targetCTM && nodeCTM) return targetCTM.inverse().multiply(nodeCTM);
		}
		return V$1.createSVGMatrix();
	};
	/**
	* @param {SVGMatrix} matrix
	* @param {Object=} opt
	* @returns {Vectorizer|SVGMatrix} Setter / Getter
	*/
	VPrototype.transform = function(matrix, opt) {
		var node = this.node;
		if (V$1.isUndefined(matrix)) return V$1.transformStringToMatrix(this.attr("transform"));
		if (opt && opt.absolute) return this.attr("transform", V$1.matrixToTransformString(matrix));
		var svgTransform = V$1.createSVGTransform(matrix);
		node.transform.baseVal.appendItem(svgTransform);
		return this;
	};
	VPrototype.translate = function(tx, ty, opt) {
		opt = opt || {};
		ty = ty || 0;
		var transformAttr = this.attr("transform") || "";
		var transform = V$1.parseTransformString(transformAttr);
		transformAttr = transform.value;
		if (V$1.isUndefined(tx)) return transform.translate;
		transformAttr = transformAttr.replace(/translate\([^)]*\)/g, "").trim();
		var newTx = opt.absolute ? tx : transform.translate.tx + tx;
		var newTy = opt.absolute ? ty : transform.translate.ty + ty;
		var newTranslate = "translate(" + newTx + "," + newTy + ")";
		this.attr("transform", (newTranslate + " " + transformAttr).trim());
		return this;
	};
	VPrototype.rotate = function(angle, cx, cy, opt) {
		opt = opt || {};
		var transformAttr = this.attr("transform") || "";
		var transform = V$1.parseTransformString(transformAttr);
		transformAttr = transform.value;
		if (V$1.isUndefined(angle)) return transform.rotate;
		transformAttr = transformAttr.replace(/rotate\([^)]*\)/g, "").trim();
		angle %= 360;
		var newAngle = opt.absolute ? angle : transform.rotate.angle + angle;
		var newOrigin = cx !== void 0 && cy !== void 0 ? "," + cx + "," + cy : "";
		var newRotate = "rotate(" + newAngle + newOrigin + ")";
		this.attr("transform", (transformAttr + " " + newRotate).trim());
		return this;
	};
	VPrototype.scale = function(sx, sy) {
		sy = V$1.isUndefined(sy) ? sx : sy;
		var transformAttr = this.attr("transform") || "";
		var transform = V$1.parseTransformString(transformAttr);
		transformAttr = transform.value;
		if (V$1.isUndefined(sx)) return transform.scale;
		transformAttr = transformAttr.replace(/scale\([^)]*\)/g, "").trim();
		var newScale = "scale(" + sx + "," + sy + ")";
		this.attr("transform", (transformAttr + " " + newScale).trim());
		return this;
	};
	VPrototype.bbox = function(withoutTransformations, target) {
		var box;
		var node = this.node;
		var ownerSVGElement = node.ownerSVGElement;
		if (!ownerSVGElement) return new Rect(0, 0, 0, 0);
		try {
			box = node.getBBox();
		} catch (e) {
			box = {
				x: node.clientLeft,
				y: node.clientTop,
				width: node.clientWidth,
				height: node.clientHeight
			};
		}
		if (withoutTransformations) return new Rect(box);
		var matrix = this.getTransformToElement(target || ownerSVGElement);
		return V$1.transformRect(box, matrix);
	};
	VPrototype.getBBox = function(opt) {
		var options = {};
		var outputBBox;
		var node = this.node;
		var ownerSVGElement = node.ownerSVGElement;
		if (!ownerSVGElement || !V$1.isSVGGraphicsElement(node)) return new Rect(0, 0, 0, 0);
		if (opt) {
			if (opt.target) options.target = V$1.toNode(opt.target);
			if (opt.recursive) options.recursive = opt.recursive;
		}
		if (!options.recursive) {
			try {
				outputBBox = node.getBBox();
			} catch (e) {
				outputBBox = {
					x: node.clientLeft,
					y: node.clientTop,
					width: node.clientWidth,
					height: node.clientHeight
				};
			}
			if (!options.target) return new Rect(outputBBox);
			else {
				var matrix = this.getTransformToElement(options.target);
				return V$1.transformRect(outputBBox, matrix);
			}
		} else {
			var children$1 = this.children();
			var n = children$1.length;
			if (n === 0) return this.getBBox({
				target: options.target,
				recursive: false
			});
			if (!options.target) options.target = this;
			for (var i = 0; i < n; i++) {
				var currentChild = children$1[i];
				var childBBox;
				if (currentChild.children().length === 0) childBBox = currentChild.getBBox({
					target: options.target,
					recursive: false
				});
				else childBBox = currentChild.getBBox({
					target: options.target,
					recursive: true
				});
				if (!outputBBox) outputBBox = childBBox;
				else outputBBox = outputBBox.union(childBBox);
			}
			return outputBBox;
		}
	};
	function createTextPathNode(attrs, vel) {
		attrs || (attrs = {});
		var textPathElement = V$1("textPath");
		var d = attrs.d;
		if (d && attrs["xlink:href"] === void 0) {
			var linkedPath = V$1("path").attr("d", d).appendTo(vel.defs());
			textPathElement.attr("xlink:href", "#" + linkedPath.id);
		}
		if (V$1.isObject(attrs)) textPathElement.attr(attrs);
		return textPathElement.node;
	}
	function annotateTextLine(lineNode, lineAnnotations, opt) {
		opt || (opt = {});
		var includeAnnotationIndices = opt.includeAnnotationIndices;
		var eol = opt.eol;
		var lineHeight = opt.lineHeight;
		var baseSize = opt.baseSize;
		var maxFontSize = 0;
		var fontMetrics = {};
		var lastJ = lineAnnotations.length - 1;
		for (var j = 0; j <= lastJ; j++) {
			var annotation = lineAnnotations[j];
			var fontSize = null;
			if (V$1.isObject(annotation)) {
				var annotationAttrs = annotation.attrs;
				var vTSpan = V$1("tspan", annotationAttrs);
				var tspanNode = vTSpan.node;
				var t = annotation.t;
				if (eol && j === lastJ) t += eol;
				tspanNode.textContent = t;
				var annotationClass = annotationAttrs["class"];
				if (annotationClass) vTSpan.addClass(annotationClass);
				if (includeAnnotationIndices) vTSpan.attr("annotations", annotation.annotations);
				fontSize = parseFloat(annotationAttrs["font-size"]);
				if (!isFinite(fontSize)) fontSize = baseSize;
				if (fontSize && fontSize > maxFontSize) maxFontSize = fontSize;
			} else {
				if (eol && j === lastJ) annotation += eol;
				tspanNode = document.createTextNode(annotation || " ");
				if (baseSize && baseSize > maxFontSize) maxFontSize = baseSize;
			}
			lineNode.appendChild(tspanNode);
		}
		if (maxFontSize) fontMetrics.maxFontSize = maxFontSize;
		if (lineHeight) fontMetrics.lineHeight = lineHeight;
		else if (maxFontSize) fontMetrics.lineHeight = maxFontSize * 1.2;
		return fontMetrics;
	}
	var emRegex = /em$/;
	function convertEmToPx(em, fontSize) {
		var numerical = parseFloat(em);
		if (emRegex.test(em)) return numerical * fontSize;
		return numerical;
	}
	function calculateDY(alignment, linesMetrics, baseSizePx, lineHeight) {
		if (!Array.isArray(linesMetrics)) return 0;
		var n = linesMetrics.length;
		if (!n) return 0;
		var lineMetrics = linesMetrics[0];
		var flMaxFont = convertEmToPx(lineMetrics.maxFontSize, baseSizePx) || baseSizePx;
		var rLineHeights = 0;
		var lineHeightPx = convertEmToPx(lineHeight, baseSizePx);
		for (var i = 1; i < n; i++) {
			lineMetrics = linesMetrics[i];
			var iLineHeight = convertEmToPx(lineMetrics.lineHeight, baseSizePx) || lineHeightPx;
			rLineHeights += iLineHeight;
		}
		var llMaxFont = convertEmToPx(lineMetrics.maxFontSize, baseSizePx) || baseSizePx;
		var dy;
		switch (alignment) {
			case "middle":
				dy = flMaxFont / 2 - .15 * llMaxFont - rLineHeights / 2;
				break;
			case "bottom":
				dy = -(.25 * llMaxFont) - rLineHeights;
				break;
			case "top":
			default:
				dy = .8 * flMaxFont;
				break;
		}
		return dy;
	}
	VPrototype.text = function(content, opt) {
		if (content && typeof content !== "string") throw new Error("Vectorizer: text() expects the first argument to be a string.");
		content = V$1.sanitizeText(content);
		opt || (opt = {});
		var displayEmpty = opt.displayEmpty;
		var eol = opt.eol;
		var textPath = opt.textPath;
		var verticalAnchor = opt.textVerticalAnchor;
		var namedVerticalAnchor = verticalAnchor === "middle" || verticalAnchor === "bottom" || verticalAnchor === "top";
		var x = opt.x;
		if (x === void 0) x = this.attr("x") || 0;
		var iai = opt.includeAnnotationIndices;
		var annotations = opt.annotations;
		if (annotations && !V$1.isArray(annotations)) annotations = [annotations];
		var defaultLineHeight = opt.lineHeight;
		var autoLineHeight = defaultLineHeight === "auto";
		var lineHeight = autoLineHeight ? "1.5em" : defaultLineHeight || "1em";
		this.empty();
		this.attr({
			"xml:space": "preserve",
			"display": content || displayEmpty ? null : "none"
		});
		var fontSize = parseFloat(this.attr("font-size"));
		if (!fontSize) {
			fontSize = 16;
			if (namedVerticalAnchor || annotations) this.attr("font-size", fontSize);
		}
		var doc = document;
		var containerNode;
		if (textPath) {
			if (typeof textPath === "string") textPath = { d: textPath };
			containerNode = createTextPathNode(textPath, this);
		} else containerNode = doc.createDocumentFragment();
		var offset$1 = 0;
		var lines = content.split("\n");
		var linesMetrics = [];
		var annotatedY;
		for (var i = 0, lastI = lines.length - 1; i <= lastI; i++) {
			var dy = lineHeight;
			var lineClassName = "v-line";
			var lineNode = doc.createElementNS(ns.svg, "tspan");
			var line$2 = lines[i];
			var lineMetrics;
			if (line$2) if (annotations) {
				var lineAnnotations = V$1.annotateString(line$2, annotations, {
					offset: -offset$1,
					includeAnnotationIndices: iai
				});
				lineMetrics = annotateTextLine(lineNode, lineAnnotations, {
					includeAnnotationIndices: iai,
					eol: i !== lastI && eol,
					lineHeight: autoLineHeight ? null : lineHeight,
					baseSize: fontSize
				});
				var iLineHeight = lineMetrics.lineHeight;
				if (iLineHeight && autoLineHeight && i !== 0) dy = iLineHeight;
				if (i === 0) annotatedY = lineMetrics.maxFontSize * .8;
			} else {
				if (eol && i !== lastI) line$2 += eol;
				lineNode.textContent = line$2;
			}
			else {
				lineNode.textContent = "-";
				lineClassName += " v-empty-line";
				var lineNodeStyle = lineNode.style;
				lineNodeStyle.fillOpacity = 0;
				lineNodeStyle.strokeOpacity = 0;
				if (annotations) {
					lineMetrics = {};
					lineAnnotations = V$1.findAnnotationsAtIndex(annotations, offset$1);
					let lineFontSize = fontSize;
					for (let j = lineAnnotations.length; j > 0; j--) {
						const attrs = lineAnnotations[j - 1].attrs;
						if (!attrs || !("font-size" in attrs)) continue;
						const fs = parseFloat(attrs["font-size"]);
						if (isFinite(fs)) {
							lineFontSize = fs;
							break;
						}
					}
					if (autoLineHeight) if (i > 0) dy = lineFontSize * 1.2;
					else annotatedY = lineFontSize * .8;
					lineNode.setAttribute("font-size", lineFontSize);
					lineMetrics.maxFontSize = lineFontSize;
				}
			}
			if (lineMetrics) linesMetrics.push(lineMetrics);
			if (i > 0) lineNode.setAttribute("dy", dy);
			if (i > 0 || textPath) lineNode.setAttribute("x", x);
			lineNode.className.baseVal = lineClassName;
			containerNode.appendChild(lineNode);
			offset$1 += line$2.length + 1;
		}
		if (namedVerticalAnchor) if (annotations) dy = calculateDY(verticalAnchor, linesMetrics, fontSize, lineHeight);
		else if (verticalAnchor === "top") dy = "0.8em";
		else {
			var rh;
			if (lastI > 0) {
				rh = parseFloat(lineHeight) || 1;
				rh *= lastI;
				if (!emRegex.test(lineHeight)) rh /= fontSize;
			} else rh = 0;
			switch (verticalAnchor) {
				case "middle":
					dy = .3 - rh / 2 + "em";
					break;
				case "bottom":
					dy = -rh - .3 + "em";
					break;
			}
		}
		else if (verticalAnchor === 0) dy = "0em";
		else if (verticalAnchor) dy = verticalAnchor;
		else {
			dy = 0;
			if (this.attr("y") === null) this.attr("y", annotatedY || "0.8em");
		}
		containerNode.firstChild.setAttribute("dy", dy);
		this.append(containerNode);
		return this;
	};
	/**
	* @public
	* @param {string} name
	* @returns {Vectorizer}
	*/
	VPrototype.removeAttr = function(name) {
		const trueName = attributeNames[name];
		const { ns: ns$1, local } = V$1.qualifyAttr(trueName);
		const el = this.node;
		if (ns$1) {
			if (el.hasAttributeNS(ns$1, local)) el.removeAttributeNS(ns$1, local);
		} else if (el.hasAttribute(trueName)) el.removeAttribute(trueName);
		return this;
	};
	VPrototype.attr = function(name, value) {
		if (V$1.isUndefined(name)) {
			var attributes$1 = this.node.attributes;
			var attrs = {};
			for (var i = 0; i < attributes$1.length; i++) attrs[attributes$1[i].name] = attributes$1[i].value;
			return attrs;
		}
		if (V$1.isString(name) && V$1.isUndefined(value)) return this.node.getAttribute(attributeNames[name]);
		if (typeof name === "object") {
			for (var attrName in name) if (name.hasOwnProperty(attrName)) this.setAttribute(attrName, name[attrName]);
		} else this.setAttribute(name, value);
		return this;
	};
	VPrototype.normalizePath = function() {
		var tagName = this.tagName();
		if (tagName === "PATH") this.attr("d", V$1.normalizePathData(this.attr("d")));
		return this;
	};
	VPrototype.remove = function() {
		if (this.node.parentNode) this.node.parentNode.removeChild(this.node);
		return this;
	};
	VPrototype.empty = function() {
		while (this.node.firstChild) this.node.removeChild(this.node.firstChild);
		return this;
	};
	/**
	* @private
	* @param {object} attrs
	* @returns {Vectorizer}
	*/
	VPrototype.setAttributes = function(attrs) {
		for (var key in attrs) if (attrs.hasOwnProperty(key)) this.setAttribute(key, attrs[key]);
		return this;
	};
	VPrototype.append = function(els) {
		if (!V$1.isArray(els)) els = [els];
		for (var i = 0, len = els.length; i < len; i++) this.node.appendChild(V$1.toNode(els[i]));
		return this;
	};
	VPrototype.prepend = function(els) {
		var child = this.node.firstChild;
		return child ? V$1(child).before(els) : this.append(els);
	};
	VPrototype.before = function(els) {
		var node = this.node;
		var parent$1 = node.parentNode;
		if (parent$1) {
			if (!V$1.isArray(els)) els = [els];
			for (var i = 0, len = els.length; i < len; i++) parent$1.insertBefore(V$1.toNode(els[i]), node);
		}
		return this;
	};
	VPrototype.appendTo = function(node) {
		V$1.toNode(node).appendChild(this.node);
		return this;
	};
	VPrototype.svg = function() {
		return this.node instanceof window.SVGSVGElement ? this : V$1(this.node.ownerSVGElement);
	};
	VPrototype.tagName = function() {
		return this.node.tagName.toUpperCase();
	};
	VPrototype.defs = function() {
		var context = this.svg() || this;
		var defsNode = context.node.getElementsByTagName("defs")[0];
		if (defsNode) return V$1(defsNode);
		return V$1("defs").appendTo(context);
	};
	VPrototype.clone = function() {
		var clone$2 = V$1(this.node.cloneNode(true));
		clone$2.node.id = V$1.uniqueId();
		return clone$2;
	};
	VPrototype.findOne = function(selector) {
		var found = this.node.querySelector(selector);
		return found ? V$1(found) : void 0;
	};
	VPrototype.find = function(selector) {
		var vels = [];
		var nodes = this.node.querySelectorAll(selector);
		if (nodes) for (var i = 0; i < nodes.length; i++) vels.push(V$1(nodes[i]));
		return vels;
	};
	VPrototype.children = function() {
		var children$1 = this.node.childNodes;
		var outputArray = [];
		for (var i = 0; i < children$1.length; i++) {
			var currentChild = children$1[i];
			if (currentChild.nodeType === 1) outputArray.push(V$1(children$1[i]));
		}
		return outputArray;
	};
	VPrototype.parent = function() {
		return V$1(this.node.parentNode) || null;
	}, VPrototype.index = function() {
		var index = 0;
		var node = this.node.previousSibling;
		while (node) {
			if (node.nodeType === 1) index++;
			node = node.previousSibling;
		}
		return index;
	};
	VPrototype.findParentByClass = function(className$1, terminator) {
		var ownerSVGElement = this.node.ownerSVGElement;
		var node = this.node.parentNode;
		while (node && node !== terminator && node !== ownerSVGElement) {
			var vel = V$1(node);
			if (vel.hasClass(className$1)) return vel;
			node = node.parentNode;
		}
		return null;
	};
	VPrototype.contains = function(el) {
		var a = this.node;
		var b = V$1.toNode(el);
		var bup = b && b.parentNode;
		return a === bup || !!(bup && bup.nodeType === 1 && a.compareDocumentPosition(bup) & 16);
	};
	VPrototype.toLocalPoint = function(x, y) {
		var svg$1 = this.svg().node;
		var p = svg$1.createSVGPoint();
		p.x = x;
		p.y = y;
		try {
			var globalPoint = p.matrixTransform(svg$1.getScreenCTM().inverse());
			var globalToLocalMatrix = this.getTransformToElement(svg$1).inverse();
		} catch (e) {
			return p;
		}
		return globalPoint.matrixTransform(globalToLocalMatrix);
	};
	VPrototype.translateCenterToPoint = function(p) {
		var bbox$1 = this.getBBox({ target: this.svg() });
		var center$1 = bbox$1.center();
		this.translate(p.x - center$1.x, p.y - center$1.y);
		return this;
	};
	VPrototype.translateAndAutoOrient = function(position$1, reference, target) {
		position$1 = new Point(position$1);
		reference = new Point(reference);
		target || (target = this.svg());
		var scale$1 = this.scale();
		this.attr("transform", "");
		var bbox$1 = this.getBBox({ target }).scale(scale$1.sx, scale$1.sy);
		var translateToOrigin = V$1.createSVGTransform();
		translateToOrigin.setTranslate(-bbox$1.x - bbox$1.width / 2, -bbox$1.y - bbox$1.height / 2);
		var rotateAroundOrigin = V$1.createSVGTransform();
		var angle = position$1.angleBetween(reference, position$1.clone().offset(1, 0));
		if (angle) rotateAroundOrigin.setRotate(angle, 0, 0);
		var translateFromOrigin = V$1.createSVGTransform();
		var finalPosition = position$1.clone().move(reference, bbox$1.width / 2);
		translateFromOrigin.setTranslate(2 * position$1.x - finalPosition.x, 2 * position$1.y - finalPosition.y);
		var ctm = this.getTransformToElement(target);
		var transform = V$1.createSVGTransform();
		transform.setMatrix(translateFromOrigin.matrix.multiply(rotateAroundOrigin.matrix.multiply(translateToOrigin.matrix.multiply(ctm.scale(scale$1.sx, scale$1.sy)))));
		this.attr("transform", V$1.matrixToTransformString(transform.matrix));
		return this;
	};
	VPrototype.animateAlongPath = function(attrs, path) {
		path = V$1.toNode(path);
		var id = V$1.ensureId(path);
		var animateMotion = V$1("animateMotion", attrs);
		var mpath = V$1("mpath", { "xlink:href": "#" + id });
		animateMotion.append(mpath);
		this.append(animateMotion);
		try {
			animateMotion.node.beginElement();
		} catch (e) {
			if (document.documentElement.getAttribute("smiling") === "fake") {
				var animation = animateMotion.node;
				animation.animators = [];
				var animationID = animation.getAttribute("id");
				if (animationID) id2anim[animationID] = animation;
				var targets = getTargets(animation);
				for (var i = 0, len = targets.length; i < len; i++) {
					var target = targets[i];
					var animator = new Animator(animation, target, i);
					animators.push(animator);
					animation.animators[i] = animator;
					animator.register();
				}
			}
		}
		return this;
	};
	const noHTMLWhitespaceRegex = /[^\x20\t\r\n\f]+/g;
	function getTokenList(str) {
		if (!V$1.isString(str)) return [];
		return str.trim().match(noHTMLWhitespaceRegex) || [];
	}
	VPrototype.hasClass = function(className$1) {
		if (!V$1.isString(className$1)) return false;
		return this.node.classList.contains(className$1.trim());
	};
	VPrototype.addClass = function(className$1) {
		this.node.classList.add(...getTokenList(className$1));
		return this;
	};
	VPrototype.removeClass = function(className$1) {
		this.node.classList.remove(...getTokenList(className$1));
		return this;
	};
	VPrototype.toggleClass = function(className$1, toAdd) {
		const tokens = getTokenList(className$1);
		for (let i = 0; i < tokens.length; i++) this.node.classList.toggle(tokens[i], toAdd);
		return this;
	};
	VPrototype.sample = function(interval) {
		interval = interval || 1;
		var node = this.node;
		var length$1 = node.getTotalLength();
		var samples = [];
		var distance = 0;
		var sample;
		while (distance < length$1) {
			sample = node.getPointAtLength(distance);
			samples.push({
				x: sample.x,
				y: sample.y,
				distance
			});
			distance += interval;
		}
		return samples;
	};
	VPrototype.convertToPath = function() {
		var path = V$1("path");
		path.attr(this.attr());
		var d = this.convertToPathData();
		if (d) path.attr("d", d);
		return path;
	};
	VPrototype.convertToPathData = function() {
		var tagName = this.tagName();
		switch (tagName) {
			case "PATH": return this.attr("d");
			case "LINE": return V$1.convertLineToPathData(this.node);
			case "POLYGON": return V$1.convertPolygonToPathData(this.node);
			case "POLYLINE": return V$1.convertPolylineToPathData(this.node);
			case "ELLIPSE": return V$1.convertEllipseToPathData(this.node);
			case "CIRCLE": return V$1.convertCircleToPathData(this.node);
			case "RECT": return V$1.convertRectToPathData(this.node);
		}
		throw new Error(tagName + " cannot be converted to PATH.");
	};
	V$1.prototype.toGeometryShape = function() {
		var x, y, width$1, height$1, cx, cy, r, rx, ry, points, d, x1, x2, y1, y2;
		switch (this.tagName()) {
			case "RECT":
				x = parseFloat(this.attr("x")) || 0;
				y = parseFloat(this.attr("y")) || 0;
				width$1 = parseFloat(this.attr("width")) || 0;
				height$1 = parseFloat(this.attr("height")) || 0;
				return new Rect(x, y, width$1, height$1);
			case "CIRCLE":
				cx = parseFloat(this.attr("cx")) || 0;
				cy = parseFloat(this.attr("cy")) || 0;
				r = parseFloat(this.attr("r")) || 0;
				return new Ellipse$1({
					x: cx,
					y: cy
				}, r, r);
			case "ELLIPSE":
				cx = parseFloat(this.attr("cx")) || 0;
				cy = parseFloat(this.attr("cy")) || 0;
				rx = parseFloat(this.attr("rx")) || 0;
				ry = parseFloat(this.attr("ry")) || 0;
				return new Ellipse$1({
					x: cx,
					y: cy
				}, rx, ry);
			case "POLYLINE":
				points = V$1.getPointsFromSvgNode(this);
				return new Polyline(points);
			case "POLYGON":
				points = V$1.getPointsFromSvgNode(this);
				if (points.length > 1) points.push(points[0]);
				return new Polyline(points);
			case "PATH":
				d = this.attr("d");
				if (!Path.isDataSupported(d)) d = V$1.normalizePathData(d);
				return new Path(d);
			case "LINE":
				x1 = parseFloat(this.attr("x1")) || 0;
				y1 = parseFloat(this.attr("y1")) || 0;
				x2 = parseFloat(this.attr("x2")) || 0;
				y2 = parseFloat(this.attr("y2")) || 0;
				return new Line({
					x: x1,
					y: y1
				}, {
					x: x2,
					y: y2
				});
		}
		return this.getBBox();
	};
	VPrototype.findIntersection = function(ref, target) {
		var svg$1 = this.svg().node;
		target = target || svg$1;
		var bbox$1 = this.getBBox({ target });
		var center$1 = bbox$1.center();
		if (!bbox$1.intersectionWithLineFromCenterToPoint(ref)) return void 0;
		var spot;
		var tagName = this.tagName();
		if (tagName === "RECT") {
			var gRect = new Rect(parseFloat(this.attr("x") || 0), parseFloat(this.attr("y") || 0), parseFloat(this.attr("width")), parseFloat(this.attr("height")));
			var rectMatrix = this.getTransformToElement(target);
			var rectMatrixComponents = V$1.decomposeMatrix(rectMatrix);
			var resetRotation = svg$1.createSVGTransform();
			resetRotation.setRotate(-rectMatrixComponents.rotation, center$1.x, center$1.y);
			var rect$1 = V$1.transformRect(gRect, resetRotation.matrix.multiply(rectMatrix));
			spot = new Rect(rect$1).intersectionWithLineFromCenterToPoint(ref, rectMatrixComponents.rotation);
		} else if (tagName === "PATH" || tagName === "POLYGON" || tagName === "POLYLINE" || tagName === "CIRCLE" || tagName === "ELLIPSE") {
			var pathNode = tagName === "PATH" ? this : this.convertToPath();
			var samples = pathNode.sample();
			var minDistance = Infinity;
			var closestSamples = [];
			var i, sample, gp, centerDistance, refDistance, distance;
			for (i = 0; i < samples.length; i++) {
				sample = samples[i];
				gp = V$1.createSVGPoint(sample.x, sample.y);
				gp = gp.matrixTransform(this.getTransformToElement(target));
				sample = new Point(gp);
				centerDistance = sample.distance(center$1);
				refDistance = sample.distance(ref) * 1.1;
				distance = centerDistance + refDistance;
				if (distance < minDistance) {
					minDistance = distance;
					closestSamples = [{
						sample,
						refDistance
					}];
				} else if (distance < minDistance + 1) closestSamples.push({
					sample,
					refDistance
				});
			}
			closestSamples.sort(function(a, b) {
				return a.refDistance - b.refDistance;
			});
			if (closestSamples[0]) spot = closestSamples[0].sample;
		}
		return spot;
	};
	/**
	* @private
	* @param {string} name
	* @param {string} value
	* @returns {Vectorizer}
	*/
	VPrototype.setAttribute = function(name, value) {
		const el = this.node;
		if (value === null) {
			this.removeAttr(name);
			return this;
		}
		const trueName = attributeNames[name];
		const { ns: ns$1 } = V$1.qualifyAttr(trueName);
		if (ns$1) el.setAttributeNS(ns$1, trueName, value);
		else if (trueName === "id") el.id = value;
		else el.setAttribute(trueName, value);
		return this;
	};
	V$1.createSvgDocument = function(content) {
		if (content) {
			const XMLString = `<svg xmlns="${ns.svg}" xmlns:xlink="${ns.xlink}" version="${SVGVersion}">${content}</svg>`;
			const { documentElement: documentElement$1 } = V$1.parseXML(XMLString, { async: false });
			return documentElement$1;
		}
		const svg$1 = document.createElementNS(ns.svg, "svg");
		svg$1.setAttributeNS(ns.xmlns, "xmlns:xlink", ns.xlink);
		svg$1.setAttribute("version", SVGVersion);
		return svg$1;
	};
	V$1.createSVGStyle = function(stylesheet) {
		const { node } = V$1("style", { type: "text/css" }, [V$1.createCDATASection(stylesheet)]);
		return node;
	}, V$1.createCDATASection = function(data$1 = "") {
		const xml = document.implementation.createDocument(null, "xml", null);
		return xml.createCDATASection(data$1);
	};
	V$1.idCounter = 0;
	V$1.uniqueId = function() {
		return "v-" + ++V$1.idCounter;
	};
	V$1.toNode = function(el) {
		return V$1.isV(el) ? el.node : el.nodeName && el || el[0];
	};
	V$1.ensureId = function(node) {
		node = V$1.toNode(node);
		return node.id || (node.id = V$1.uniqueId());
	};
	V$1.sanitizeText = function(text) {
		return (text || "").replace(/ /g, "\xA0");
	};
	V$1.isUndefined = function(value) {
		return typeof value === "undefined";
	};
	V$1.isString = function(value) {
		return typeof value === "string";
	};
	V$1.isObject = function(value) {
		return value && typeof value === "object";
	};
	V$1.isArray = Array.isArray;
	V$1.parseXML = function(data$1, opt) {
		opt = opt || {};
		var xml;
		try {
			var parser = new DOMParser();
			if (!V$1.isUndefined(opt.async)) parser.async = opt.async;
			xml = parser.parseFromString(data$1, "text/xml");
		} catch (error) {
			xml = void 0;
		}
		if (!xml || xml.getElementsByTagName("parsererror").length) throw new Error("Invalid XML: " + data$1);
		return xml;
	};
	const _attributeNames = Object.create(null);
	[
		"baseFrequency",
		"baseProfile",
		"clipPathUnits",
		"contentScriptType",
		"contentStyleType",
		"diffuseConstant",
		"edgeMode",
		"externalResourcesRequired",
		"filterRes",
		"filterUnits",
		"gradientTransform",
		"gradientUnits",
		"kernelMatrix",
		"kernelUnitLength",
		"keyPoints",
		"lengthAdjust",
		"limitingConeAngle",
		"markerHeight",
		"markerUnits",
		"markerWidth",
		"maskContentUnits",
		"maskUnits",
		"numOctaves",
		"pathLength",
		"patternContentUnits",
		"patternTransform",
		"patternUnits",
		"pointsAtX",
		"pointsAtY",
		"pointsAtZ",
		"preserveAlpha",
		"preserveAspectRatio",
		"primitiveUnits",
		"refX",
		"refY",
		"requiredExtensions",
		"requiredFeatures",
		"specularConstant",
		"specularExponent",
		"spreadMethod",
		"startOffset",
		"stdDeviation",
		"stitchTiles",
		"surfaceScale",
		"systemLanguage",
		"tableValues",
		"targetX",
		"targetY",
		"textLength",
		"viewBox",
		"viewTarget",
		"xChannelSelector",
		"yChannelSelector",
		"zoomAndPan"
	].forEach((name) => _attributeNames[name] = name);
	_attributeNames["xlinkShow"] = "xlink:show";
	_attributeNames["xlinkRole"] = "xlink:role";
	_attributeNames["xlinkActuate"] = "xlink:actuate";
	_attributeNames["xlinkHref"] = "xlink:href";
	_attributeNames["xlinkType"] = "xlink:type";
	_attributeNames["xlinkTitle"] = "xlink:title";
	_attributeNames["xmlBase"] = "xml:base";
	_attributeNames["xmlLang"] = "xml:lang";
	_attributeNames["xmlSpace"] = "xml:space";
	const attributeNames = new Proxy(_attributeNames, { get(cache, name) {
		if (!V$1.supportCamelCaseAttributes) return name;
		if (name in cache) return cache[name];
		return cache[name] = name.replace(/[A-Z]/g, "-$&").toLowerCase();
	} });
	Object.defineProperty(V$1, "attributeNames", {
		enumerable: true,
		value: attributeNames,
		writable: false
	});
	Object.defineProperty(V$1, "supportCamelCaseAttributes", {
		enumerable: true,
		value: true,
		writable: true
	});
	/**
	* @param {string} name
	* @returns {{ns: string|null, local: string}} namespace and attribute name
	*/
	V$1.qualifyAttr = function(name) {
		if (name.indexOf(":") !== -1) {
			var combinedKey = name.split(":");
			return {
				ns: ns[combinedKey[0]],
				local: combinedKey[1]
			};
		}
		return {
			ns: null,
			local: name
		};
	};
	V$1.transformSeparatorRegex = /[ ,]+/;
	V$1.transformRegex = /\b\w+\([^()]+\)/g;
	V$1.transformFunctionRegex = /\b(\w+)\(([^()]+)\)/;
	V$1.transformTranslateRegex = /\btranslate\(([^()]+)\)/;
	V$1.transformRotateRegex = /\brotate\(([^()]+)\)/;
	V$1.transformScaleRegex = /\bscale\(([^()]+)\)/;
	V$1.transformStringToMatrix = function(transform) {
		let transformationMatrix = V$1.createSVGMatrix();
		const transformMatches = transform && transform.match(V$1.transformRegex);
		if (!transformMatches) return transformationMatrix;
		const numMatches = transformMatches.length;
		for (let i = 0; i < numMatches; i++) {
			const transformMatch = transformMatches[i];
			const transformFunctionMatch = transformMatch.match(V$1.transformFunctionRegex);
			if (transformFunctionMatch) {
				let sx, sy, tx, ty, angle;
				let ctm = V$1.createSVGMatrix();
				const transformFunction = transformFunctionMatch[1].toLowerCase();
				const args = transformFunctionMatch[2].split(V$1.transformSeparatorRegex);
				switch (transformFunction) {
					case "scale":
						sx = parseFloat(args[0]);
						sy = args[1] === void 0 ? sx : parseFloat(args[1]);
						ctm = ctm.scaleNonUniform(sx, sy);
						break;
					case "translate":
						tx = parseFloat(args[0]);
						ty = parseFloat(args[1]);
						ctm = ctm.translate(tx, ty);
						break;
					case "rotate":
						angle = parseFloat(args[0]);
						tx = parseFloat(args[1]) || 0;
						ty = parseFloat(args[2]) || 0;
						if (tx !== 0 || ty !== 0) ctm = ctm.translate(tx, ty).rotate(angle).translate(-tx, -ty);
						else ctm = ctm.rotate(angle);
						break;
					case "skewx":
						angle = parseFloat(args[0]);
						ctm = ctm.skewX(angle);
						break;
					case "skewy":
						angle = parseFloat(args[0]);
						ctm = ctm.skewY(angle);
						break;
					case "matrix":
						ctm.a = parseFloat(args[0]);
						ctm.b = parseFloat(args[1]);
						ctm.c = parseFloat(args[2]);
						ctm.d = parseFloat(args[3]);
						ctm.e = parseFloat(args[4]);
						ctm.f = parseFloat(args[5]);
						break;
					default: continue;
				}
				transformationMatrix = transformationMatrix.multiply(ctm);
			}
		}
		return transformationMatrix;
	};
	V$1.matrixToTransformString = function(matrix) {
		matrix || (matrix = true);
		return "matrix(" + (matrix.a !== void 0 ? matrix.a : 1) + "," + (matrix.b !== void 0 ? matrix.b : 0) + "," + (matrix.c !== void 0 ? matrix.c : 0) + "," + (matrix.d !== void 0 ? matrix.d : 1) + "," + (matrix.e !== void 0 ? matrix.e : 0) + "," + (matrix.f !== void 0 ? matrix.f : 0) + ")";
	};
	V$1.parseTransformString = function(transform) {
		var translate, rotate, scale$1;
		if (transform) {
			var separator = V$1.transformSeparatorRegex;
			if (transform.trim().indexOf("matrix") >= 0) {
				var matrix = V$1.transformStringToMatrix(transform);
				var decomposedMatrix = V$1.decomposeMatrix(matrix);
				translate = [decomposedMatrix.translateX, decomposedMatrix.translateY];
				scale$1 = [decomposedMatrix.scaleX, decomposedMatrix.scaleY];
				rotate = [decomposedMatrix.rotation];
				var transformations = [];
				if (translate[0] !== 0 || translate[1] !== 0) transformations.push("translate(" + translate + ")");
				if (scale$1[0] !== 1 || scale$1[1] !== 1) transformations.push("scale(" + scale$1 + ")");
				if (rotate[0] !== 0) transformations.push("rotate(" + rotate + ")");
				transform = transformations.join(" ");
			} else {
				const translateMatch = transform.match(V$1.transformTranslateRegex);
				if (translateMatch) translate = translateMatch[1].split(separator);
				const rotateMatch = transform.match(V$1.transformRotateRegex);
				if (rotateMatch) rotate = rotateMatch[1].split(separator);
				const scaleMatch = transform.match(V$1.transformScaleRegex);
				if (scaleMatch) scale$1 = scaleMatch[1].split(separator);
			}
		}
		var sx = scale$1 && scale$1[0] ? parseFloat(scale$1[0]) : 1;
		return {
			value: transform,
			translate: {
				tx: translate && translate[0] ? parseInt(translate[0], 10) : 0,
				ty: translate && translate[1] ? parseInt(translate[1], 10) : 0
			},
			rotate: {
				angle: rotate && rotate[0] ? parseInt(rotate[0], 10) : 0,
				cx: rotate && rotate[1] ? parseInt(rotate[1], 10) : void 0,
				cy: rotate && rotate[2] ? parseInt(rotate[2], 10) : void 0
			},
			scale: {
				sx,
				sy: scale$1 && scale$1[1] ? parseFloat(scale$1[1]) : sx
			}
		};
	};
	V$1.deltaTransformPoint = function(matrix, point$1) {
		var dx = point$1.x * matrix.a + point$1.y * matrix.c + 0;
		var dy = point$1.x * matrix.b + point$1.y * matrix.d + 0;
		return {
			x: dx,
			y: dy
		};
	};
	V$1.decomposeMatrix = function(matrix) {
		var px = V$1.deltaTransformPoint(matrix, {
			x: 0,
			y: 1
		});
		var py = V$1.deltaTransformPoint(matrix, {
			x: 1,
			y: 0
		});
		var skewX = 180 / PI$2 * atan2$2(px.y, px.x) - 90;
		var skewY = 180 / PI$2 * atan2$2(py.y, py.x);
		return {
			translateX: matrix.e,
			translateY: matrix.f,
			scaleX: sqrt$3(matrix.a * matrix.a + matrix.b * matrix.b),
			scaleY: sqrt$3(matrix.c * matrix.c + matrix.d * matrix.d),
			skewX,
			skewY,
			rotation: skewX
		};
	};
	V$1.matrixToScale = function(matrix) {
		var a, b, c, d;
		if (matrix) {
			a = V$1.isUndefined(matrix.a) ? 1 : matrix.a;
			d = V$1.isUndefined(matrix.d) ? 1 : matrix.d;
			b = matrix.b;
			c = matrix.c;
		} else a = d = 1;
		return {
			sx: b ? sqrt$3(a * a + b * b) : a,
			sy: c ? sqrt$3(c * c + d * d) : d
		};
	};
	V$1.matrixToRotate = function(matrix) {
		var p = {
			x: 0,
			y: 1
		};
		if (matrix) p = V$1.deltaTransformPoint(matrix, p);
		return { angle: normalizeAngle(toDeg(atan2$2(p.y, p.x)) - 90) };
	};
	V$1.matrixToTranslate = function(matrix) {
		return {
			tx: matrix && matrix.e || 0,
			ty: matrix && matrix.f || 0
		};
	};
	V$1.isV = function(object) {
		return object instanceof V$1;
	};
	V$1.isVElement = V$1.isV;
	V$1.isSVGGraphicsElement = function(node) {
		if (!node) return false;
		node = V$1.toNode(node);
		return node instanceof SVGElement && typeof node.getScreenCTM === "function";
	};
	var svgDocument = V$1("svg").node;
	V$1.createSVGMatrix = function(matrix) {
		var svgMatrix = svgDocument.createSVGMatrix();
		for (var component in matrix) svgMatrix[component] = matrix[component];
		return svgMatrix;
	};
	V$1.createSVGTransform = function(matrix) {
		if (!V$1.isUndefined(matrix)) {
			if (!(matrix instanceof SVGMatrix)) matrix = V$1.createSVGMatrix(matrix);
			return svgDocument.createSVGTransformFromMatrix(matrix);
		}
		return svgDocument.createSVGTransform();
	};
	V$1.createSVGPoint = function(x, y) {
		var p = svgDocument.createSVGPoint();
		p.x = x;
		p.y = y;
		return p;
	};
	V$1.transformRect = function(r, matrix) {
		var p = svgDocument.createSVGPoint();
		p.x = r.x;
		p.y = r.y;
		var corner1 = p.matrixTransform(matrix);
		p.x = r.x + r.width;
		p.y = r.y;
		var corner2 = p.matrixTransform(matrix);
		p.x = r.x + r.width;
		p.y = r.y + r.height;
		var corner3 = p.matrixTransform(matrix);
		p.x = r.x;
		p.y = r.y + r.height;
		var corner4 = p.matrixTransform(matrix);
		var minX = min$4(corner1.x, corner2.x, corner3.x, corner4.x);
		var maxX = max$4(corner1.x, corner2.x, corner3.x, corner4.x);
		var minY = min$4(corner1.y, corner2.y, corner3.y, corner4.y);
		var maxY = max$4(corner1.y, corner2.y, corner3.y, corner4.y);
		return new Rect(minX, minY, maxX - minX, maxY - minY);
	};
	V$1.transformPoint = function(p, matrix) {
		return new Point(V$1.createSVGPoint(p.x, p.y).matrixTransform(matrix));
	};
	V$1.transformLine = function(l, matrix) {
		return new Line(V$1.transformPoint(l.start, matrix), V$1.transformPoint(l.end, matrix));
	};
	V$1.transformPolyline = function(p, matrix) {
		var inPoints = p instanceof Polyline ? p.points : p;
		if (!V$1.isArray(inPoints)) inPoints = [];
		var outPoints = [];
		for (var i = 0, n = inPoints.length; i < n; i++) outPoints[i] = V$1.transformPoint(inPoints[i], matrix);
		return new Polyline(outPoints);
	};
	V$1.styleToObject = function(styleString) {
		var ret = {};
		var styles = styleString.split(";");
		for (var i = 0; i < styles.length; i++) {
			var style = styles[i];
			var pair = style.split("=");
			ret[pair[0].trim()] = pair[1].trim();
		}
		return ret;
	};
	V$1.createSlicePathData = function(innerRadius, outerRadius, startAngle, endAngle) {
		var svgArcMax = 2 * PI$2 - 1e-6;
		var r0 = innerRadius;
		var r1 = outerRadius;
		var a0 = startAngle;
		var a1 = endAngle;
		var da = (a1 < a0 && (da = a0, a0 = a1, a1 = da), a1 - a0);
		var df = da < PI$2 ? "0" : "1";
		var c0 = cos$3(a0);
		var s0 = sin$3(a0);
		var c1 = cos$3(a1);
		var s1 = sin$3(a1);
		return da >= svgArcMax ? r0 ? "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + -r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "M0," + r0 + "A" + r0 + "," + r0 + " 0 1,0 0," + -r0 + "A" + r0 + "," + r0 + " 0 1,0 0," + r0 + "Z" : "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + -r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "Z" : r0 ? "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L" + r0 * c1 + "," + r0 * s1 + "A" + r0 + "," + r0 + " 0 " + df + ",0 " + r0 * c0 + "," + r0 * s0 + "Z" : "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L0,0Z";
	};
	V$1.mergeAttrs = function(a, b) {
		for (var attr$1 in b) if (attr$1 === "class") a[attr$1] = a[attr$1] ? a[attr$1] + " " + b[attr$1] : b[attr$1];
		else if (attr$1 === "style") if (V$1.isObject(a[attr$1]) && V$1.isObject(b[attr$1])) a[attr$1] = V$1.mergeAttrs(a[attr$1], b[attr$1]);
		else if (V$1.isObject(a[attr$1])) a[attr$1] = V$1.mergeAttrs(a[attr$1], V$1.styleToObject(b[attr$1]));
		else if (V$1.isObject(b[attr$1])) a[attr$1] = V$1.mergeAttrs(V$1.styleToObject(a[attr$1]), b[attr$1]);
		else a[attr$1] = V$1.mergeAttrs(V$1.styleToObject(a[attr$1]), V$1.styleToObject(b[attr$1]));
		else a[attr$1] = b[attr$1];
		return a;
	};
	V$1.annotateString = function(t, annotations, opt) {
		annotations = annotations || [];
		opt = opt || {};
		var offset$1 = opt.offset || 0;
		var compacted = [];
		var batch;
		var ret = [];
		var item;
		var prev;
		for (var i = 0; i < t.length; i++) {
			item = ret[i] = t[i];
			for (var j = 0; j < annotations.length; j++) {
				var annotation = annotations[j];
				var start = annotation.start + offset$1;
				var end = annotation.end + offset$1;
				if (i >= start && i < end) {
					if (V$1.isObject(item)) item.attrs = V$1.mergeAttrs(V$1.mergeAttrs({}, item.attrs), annotation.attrs);
					else item = ret[i] = {
						t: t[i],
						attrs: annotation.attrs
					};
					if (opt.includeAnnotationIndices) (item.annotations || (item.annotations = [])).push(j);
				}
			}
			prev = ret[i - 1];
			if (!prev) batch = item;
			else if (V$1.isObject(item) && V$1.isObject(prev)) if (JSON.stringify(item.attrs) === JSON.stringify(prev.attrs)) batch.t += item.t;
			else {
				compacted.push(batch);
				batch = item;
			}
			else if (V$1.isObject(item)) {
				compacted.push(batch);
				batch = item;
			} else if (V$1.isObject(prev)) {
				compacted.push(batch);
				batch = item;
			} else batch = (batch || "") + item;
		}
		if (batch) compacted.push(batch);
		return compacted;
	};
	V$1.findAnnotationsAtIndex = function(annotations, index) {
		var found = [];
		if (annotations) annotations.forEach(function(annotation) {
			if (annotation.start < index && index <= annotation.end) found.push(annotation);
		});
		return found;
	};
	V$1.findAnnotationsBetweenIndexes = function(annotations, start, end) {
		var found = [];
		if (annotations) annotations.forEach(function(annotation) {
			if (start >= annotation.start && start < annotation.end || end > annotation.start && end <= annotation.end || annotation.start >= start && annotation.end < end) found.push(annotation);
		});
		return found;
	};
	V$1.shiftAnnotations = function(annotations, index, offset$1) {
		if (annotations) annotations.forEach(function(annotation) {
			if (annotation.start < index && annotation.end >= index) annotation.end += offset$1;
			else if (annotation.start >= index) {
				annotation.start += offset$1;
				annotation.end += offset$1;
			}
		});
		return annotations;
	};
	V$1.convertLineToPathData = function(line$2) {
		line$2 = V$1(line$2);
		var d = [
			"M",
			line$2.attr("x1"),
			line$2.attr("y1"),
			"L",
			line$2.attr("x2"),
			line$2.attr("y2")
		].join(" ");
		return d;
	};
	V$1.convertPolygonToPathData = function(polygon) {
		var points = V$1.getPointsFromSvgNode(polygon);
		if (points.length === 0) return null;
		return V$1.svgPointsToPath(points) + " Z";
	};
	V$1.convertPolylineToPathData = function(polyline) {
		var points = V$1.getPointsFromSvgNode(polyline);
		if (points.length === 0) return null;
		return V$1.svgPointsToPath(points);
	};
	V$1.svgPointsToPath = function(points) {
		for (var i = 0, n = points.length; i < n; i++) points[i] = points[i].x + " " + points[i].y;
		return "M " + points.join(" L");
	};
	V$1.getPointsFromSvgNode = function(node) {
		node = V$1.toNode(node);
		var points = [];
		var nodePoints = node.points;
		if (nodePoints) for (var i = 0, n = nodePoints.numberOfItems; i < n; i++) points.push(nodePoints.getItem(i));
		return points;
	};
	V$1.KAPPA = .551784;
	V$1.convertCircleToPathData = function(circle) {
		circle = V$1(circle);
		var cx = parseFloat(circle.attr("cx")) || 0;
		var cy = parseFloat(circle.attr("cy")) || 0;
		var r = parseFloat(circle.attr("r"));
		var cd = r * V$1.KAPPA;
		var d = [
			"M",
			cx,
			cy - r,
			"C",
			cx + cd,
			cy - r,
			cx + r,
			cy - cd,
			cx + r,
			cy,
			"C",
			cx + r,
			cy + cd,
			cx + cd,
			cy + r,
			cx,
			cy + r,
			"C",
			cx - cd,
			cy + r,
			cx - r,
			cy + cd,
			cx - r,
			cy,
			"C",
			cx - r,
			cy - cd,
			cx - cd,
			cy - r,
			cx,
			cy - r,
			"Z"
		].join(" ");
		return d;
	};
	V$1.convertEllipseToPathData = function(ellipse$2) {
		ellipse$2 = V$1(ellipse$2);
		var cx = parseFloat(ellipse$2.attr("cx")) || 0;
		var cy = parseFloat(ellipse$2.attr("cy")) || 0;
		var rx = parseFloat(ellipse$2.attr("rx"));
		var ry = parseFloat(ellipse$2.attr("ry")) || rx;
		var cdx = rx * V$1.KAPPA;
		var cdy = ry * V$1.KAPPA;
		var d = [
			"M",
			cx,
			cy - ry,
			"C",
			cx + cdx,
			cy - ry,
			cx + rx,
			cy - cdy,
			cx + rx,
			cy,
			"C",
			cx + rx,
			cy + cdy,
			cx + cdx,
			cy + ry,
			cx,
			cy + ry,
			"C",
			cx - cdx,
			cy + ry,
			cx - rx,
			cy + cdy,
			cx - rx,
			cy,
			"C",
			cx - rx,
			cy - cdy,
			cx - cdx,
			cy - ry,
			cx,
			cy - ry,
			"Z"
		].join(" ");
		return d;
	};
	V$1.convertRectToPathData = function(rect$1) {
		rect$1 = V$1(rect$1);
		return V$1.rectToPath({
			x: parseFloat(rect$1.attr("x")) || 0,
			y: parseFloat(rect$1.attr("y")) || 0,
			width: parseFloat(rect$1.attr("width")) || 0,
			height: parseFloat(rect$1.attr("height")) || 0,
			rx: parseFloat(rect$1.attr("rx")) || 0,
			ry: parseFloat(rect$1.attr("ry")) || 0
		});
	};
	V$1.rectToPath = function(r) {
		var d;
		var x = r.x;
		var y = r.y;
		var width$1 = r.width;
		var height$1 = r.height;
		var topRx = min$4(r.rx || r["top-rx"] || 0, width$1 / 2);
		var bottomRx = min$4(r.rx || r["bottom-rx"] || 0, width$1 / 2);
		var topRy = min$4(r.ry || r["top-ry"] || 0, height$1 / 2);
		var bottomRy = min$4(r.ry || r["bottom-ry"] || 0, height$1 / 2);
		if (topRx || bottomRx || topRy || bottomRy) d = [
			"M",
			x,
			y + topRy,
			"v",
			height$1 - topRy - bottomRy,
			"a",
			bottomRx,
			bottomRy,
			0,
			0,
			0,
			bottomRx,
			bottomRy,
			"h",
			width$1 - 2 * bottomRx,
			"a",
			bottomRx,
			bottomRy,
			0,
			0,
			0,
			bottomRx,
			-bottomRy,
			"v",
			-(height$1 - bottomRy - topRy),
			"a",
			topRx,
			topRy,
			0,
			0,
			0,
			-topRx,
			-topRy,
			"h",
			-(width$1 - 2 * topRx),
			"a",
			topRx,
			topRy,
			0,
			0,
			0,
			-topRx,
			topRy,
			"Z"
		];
		else d = [
			"M",
			x,
			y,
			"H",
			x + width$1,
			"V",
			y + height$1,
			"H",
			x,
			"V",
			y,
			"Z"
		];
		return d.join(" ");
	};
	V$1.normalizePathData = (function() {
		var spaces = "	\n\v\f\r \xA0 ᠎             　\u2028\u2029";
		var pathCommand = new RegExp("([a-z])[" + spaces + ",]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[" + spaces + "]*,?[" + spaces + "]*)+)", "ig");
		var pathValues = new RegExp("(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[" + spaces + "]*,?[" + spaces + "]*", "ig");
		var math$1 = Math;
		var PI$3 = math$1.PI;
		var sin$4 = math$1.sin;
		var cos$4 = math$1.cos;
		var tan = math$1.tan;
		var asin = math$1.asin;
		var sqrt$4 = math$1.sqrt;
		var abs$3 = math$1.abs;
		function q2c(x1, y1, ax, ay, x2, y2) {
			var _13$1 = 1 / 3;
			var _23$1 = 2 / 3;
			return [
				_13$1 * x1 + _23$1 * ax,
				_13$1 * y1 + _23$1 * ay,
				_13$1 * x2 + _23$1 * ax,
				_13$1 * y2 + _23$1 * ay,
				x2,
				y2
			];
		}
		function rotate(x, y, rad) {
			var X = x * cos$4(rad) - y * sin$4(rad);
			var Y = x * sin$4(rad) + y * cos$4(rad);
			return {
				x: X,
				y: Y
			};
		}
		function a2c(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
			var _120 = PI$3 * 120 / 180;
			var rad = PI$3 / 180 * (+angle || 0);
			var res = [];
			var xy;
			if (!recursive) {
				xy = rotate(x1, y1, -rad);
				x1 = xy.x;
				y1 = xy.y;
				xy = rotate(x2, y2, -rad);
				x2 = xy.x;
				y2 = xy.y;
				var x = (x1 - x2) / 2;
				var y = (y1 - y2) / 2;
				var h = x * x / (rx * rx) + y * y / (ry * ry);
				if (h > 1) {
					h = sqrt$4(h);
					rx = h * rx;
					ry = h * ry;
				}
				var rx2 = rx * rx;
				var ry2 = ry * ry;
				var k = (large_arc_flag == sweep_flag ? -1 : 1) * sqrt$4(abs$3((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x)));
				if (!Number.isFinite(k)) return [
					x1,
					y1,
					x2,
					y2,
					x2,
					y2
				];
				var cx = k * rx * y / ry + (x1 + x2) / 2;
				var cy = k * -ry * x / rx + (y1 + y2) / 2;
				var f1 = asin(((y1 - cy) / ry).toFixed(9));
				var f2 = asin(((y2 - cy) / ry).toFixed(9));
				f1 = x1 < cx ? PI$3 - f1 : f1;
				f2 = x2 < cx ? PI$3 - f2 : f2;
				if (f1 < 0) f1 = PI$3 * 2 + f1;
				if (f2 < 0) f2 = PI$3 * 2 + f2;
				if (sweep_flag && f1 > f2) f1 = f1 - PI$3 * 2;
				if (!sweep_flag && f2 > f1) f2 = f2 - PI$3 * 2;
			} else {
				f1 = recursive[0];
				f2 = recursive[1];
				cx = recursive[2];
				cy = recursive[3];
			}
			var df = f2 - f1;
			if (abs$3(df) > _120) {
				var f2old = f2;
				var x2old = x2;
				var y2old = y2;
				f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
				x2 = cx + rx * cos$4(f2);
				y2 = cy + ry * sin$4(f2);
				res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [
					f2,
					f2old,
					cx,
					cy
				]);
			}
			df = f2 - f1;
			var c1 = cos$4(f1);
			var s1 = sin$4(f1);
			var c2 = cos$4(f2);
			var s2 = sin$4(f2);
			var t = tan(df / 4);
			var hx = 4 / 3 * (rx * t);
			var hy = 4 / 3 * (ry * t);
			var m1 = [x1, y1];
			var m2 = [x1 + hx * s1, y1 - hy * c1];
			var m3 = [x2 + hx * s2, y2 - hy * c2];
			var m4 = [x2, y2];
			m2[0] = 2 * m1[0] - m2[0];
			m2[1] = 2 * m1[1] - m2[1];
			if (recursive) return [
				m2,
				m3,
				m4
			].concat(res);
			else {
				res = [
					m2,
					m3,
					m4
				].concat(res).join().split(",");
				var newres = [];
				var ii = res.length;
				for (var i = 0; i < ii; i++) newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
				return newres;
			}
		}
		function parsePathString(pathString) {
			if (!pathString) return null;
			var paramCounts = {
				a: 7,
				c: 6,
				h: 1,
				l: 2,
				m: 2,
				q: 4,
				s: 4,
				t: 2,
				v: 1,
				z: 0
			};
			var data$1 = [];
			String(pathString).replace(pathCommand, function(a, b, c) {
				var params = [];
				var name = b.toLowerCase();
				c.replace(pathValues, function(a$1, b$1) {
					if (b$1) params.push(+b$1);
				});
				if (name === "m" && params.length > 2) {
					data$1.push([b].concat(params.splice(0, 2)));
					name = "l";
					b = b === "m" ? "l" : "L";
				}
				while (params.length >= paramCounts[name]) {
					data$1.push([b].concat(params.splice(0, paramCounts[name])));
					if (!paramCounts[name]) break;
				}
			});
			return data$1;
		}
		function pathToAbsolute(pathArray) {
			if (!Array.isArray(pathArray) || !Array.isArray(pathArray && pathArray[0])) pathArray = parsePathString(pathArray);
			if (!pathArray || !pathArray.length) return [[
				"M",
				0,
				0
			]];
			var res = [];
			var x = 0;
			var y = 0;
			var mx = 0;
			var my = 0;
			var start = 0;
			var pa0;
			var ii = pathArray.length;
			for (var i = start; i < ii; i++) {
				var r = [];
				res.push(r);
				var pa = pathArray[i];
				pa0 = pa[0];
				if (pa0 != pa0.toUpperCase()) {
					r[0] = pa0.toUpperCase();
					var jj;
					var j;
					switch (r[0]) {
						case "A":
							r[1] = pa[1];
							r[2] = pa[2];
							r[3] = pa[3];
							r[4] = pa[4];
							r[5] = pa[5];
							r[6] = +pa[6] + x;
							r[7] = +pa[7] + y;
							break;
						case "V":
							r[1] = +pa[1] + y;
							break;
						case "H":
							r[1] = +pa[1] + x;
							break;
						case "M":
							mx = +pa[1] + x;
							my = +pa[2] + y;
							jj = pa.length;
							for (j = 1; j < jj; j++) r[j] = +pa[j] + (j % 2 ? x : y);
							break;
						default:
							jj = pa.length;
							for (j = 1; j < jj; j++) r[j] = +pa[j] + (j % 2 ? x : y);
							break;
					}
				} else {
					var kk = pa.length;
					for (var k = 0; k < kk; k++) r[k] = pa[k];
				}
				switch (r[0]) {
					case "Z":
						x = +mx;
						y = +my;
						break;
					case "H":
						x = r[1];
						break;
					case "V":
						y = r[1];
						break;
					case "M":
						mx = r[r.length - 2];
						my = r[r.length - 1];
						x = r[r.length - 2];
						y = r[r.length - 1];
						break;
					default:
						x = r[r.length - 2];
						y = r[r.length - 1];
						break;
				}
			}
			return res;
		}
		function normalize(path) {
			var p = pathToAbsolute(path);
			var attrs = {
				x: 0,
				y: 0,
				bx: 0,
				by: 0,
				X: 0,
				Y: 0,
				qx: null,
				qy: null
			};
			function processPath(path$1, d, pcom$1) {
				var nx, ny;
				if (!path$1) return [
					"C",
					d.x,
					d.y,
					d.x,
					d.y,
					d.x,
					d.y
				];
				if (!(path$1[0] in {
					T: 1,
					Q: 1
				})) {
					d.qx = null;
					d.qy = null;
				}
				switch (path$1[0]) {
					case "M":
						d.X = path$1[1];
						d.Y = path$1[2];
						break;
					case "A":
						if (parseFloat(path$1[1]) === 0 || parseFloat(path$1[2]) === 0) path$1 = [
							"L",
							path$1[6],
							path$1[7]
						];
						else path$1 = ["C"].concat(a2c.apply(0, [d.x, d.y].concat(path$1.slice(1))));
						break;
					case "S":
						if (pcom$1 === "C" || pcom$1 === "S") {
							nx = d.x * 2 - d.bx;
							ny = d.y * 2 - d.by;
						} else {
							nx = d.x;
							ny = d.y;
						}
						path$1 = [
							"C",
							nx,
							ny
						].concat(path$1.slice(1));
						break;
					case "T":
						if (pcom$1 === "Q" || pcom$1 === "T") {
							d.qx = d.x * 2 - d.qx;
							d.qy = d.y * 2 - d.qy;
						} else {
							d.qx = d.x;
							d.qy = d.y;
						}
						path$1 = ["C"].concat(q2c(d.x, d.y, d.qx, d.qy, path$1[1], path$1[2]));
						break;
					case "Q":
						d.qx = path$1[1];
						d.qy = path$1[2];
						path$1 = ["C"].concat(q2c(d.x, d.y, path$1[1], path$1[2], path$1[3], path$1[4]));
						break;
					case "H":
						path$1 = ["L"].concat(path$1[1], d.y);
						break;
					case "V":
						path$1 = ["L"].concat(d.x, path$1[1]);
						break;
					case "L": break;
					case "Z": break;
				}
				return path$1;
			}
			function fixArc(pp, i$1) {
				if (pp[i$1].length > 7) {
					pp[i$1].shift();
					var pi = pp[i$1];
					while (pi.length) {
						pcoms[i$1] = "A";
						pp.splice(i$1++, 0, ["C"].concat(pi.splice(0, 6)));
					}
					pp.splice(i$1, 1);
					ii = p.length;
				}
			}
			var pcoms = [];
			var pfirst = "";
			var pcom = "";
			var ii = p.length;
			for (var i = 0; i < ii; i++) {
				if (p[i]) pfirst = p[i][0];
				if (pfirst !== "C") {
					pcoms[i] = pfirst;
					if (i > 0) pcom = pcoms[i - 1];
				}
				p[i] = processPath(p[i], attrs, pcom);
				if (pcoms[i] !== "A" && pfirst === "C") pcoms[i] = "C";
				fixArc(p, i);
				var seg = p[i];
				var seglen = seg.length;
				attrs.x = seg[seglen - 2];
				attrs.y = seg[seglen - 1];
				attrs.bx = parseFloat(seg[seglen - 4]) || attrs.x;
				attrs.by = parseFloat(seg[seglen - 3]) || attrs.y;
			}
			if (!p[0][0] || p[0][0] !== "M") p.unshift([
				"M",
				0,
				0
			]);
			return p;
		}
		return function(pathData) {
			return normalize(pathData).join(",").split(",").join(" ");
		};
	})();
	V$1.namespace = ns;
	V$1.g = g_exports;
	return V$1;
})();
var V_default = V;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/util/utilHelpers.mjs
const argsTag = "[object Arguments]";
const arrayTag = "[object Array]";
const boolTag = "[object Boolean]";
const dateTag = "[object Date]";
const errorTag = "[object Error]";
const funcTag = "[object Function]";
const mapTag = "[object Map]";
const numberTag = "[object Number]";
const nullTag = "[object Null]";
const objectTag = "[object Object]";
const regexpTag = "[object RegExp]";
const setTag = "[object Set]";
const stringTag = "[object String]";
const symbolTag = "[object Symbol]";
const undefinedTag = "[object Undefined]";
const weakMapTag = "[object WeakMap]";
const arrayBufferTag = "[object ArrayBuffer]";
const dataViewTag = "[object DataView]";
const float32Tag = "[object Float32Array]";
const float64Tag = "[object Float64Array]";
const int8Tag = "[object Int8Array]";
const int16Tag = "[object Int16Array]";
const int32Tag = "[object Int32Array]";
const uint8Tag = "[object Uint8Array]";
const uint8ClampedTag = "[object Uint8ClampedArray]";
const uint16Tag = "[object Uint16Array]";
const uint32Tag = "[object Uint32Array]";
const CLONEABLE_TAGS = {
	[argsTag]: true,
	[arrayTag]: true,
	[arrayBufferTag]: true,
	[dataViewTag]: true,
	[boolTag]: true,
	[dateTag]: true,
	[float32Tag]: true,
	[float64Tag]: true,
	[int8Tag]: true,
	[int16Tag]: true,
	[int32Tag]: true,
	[mapTag]: true,
	[numberTag]: true,
	[objectTag]: true,
	[regexpTag]: true,
	[setTag]: true,
	[stringTag]: true,
	[symbolTag]: true,
	[uint8Tag]: true,
	[uint8ClampedTag]: true,
	[uint16Tag]: true,
	[uint32Tag]: true,
	[errorTag]: false,
	[funcTag]: false,
	[weakMapTag]: false
};
/** Used to compose unicode character classes. */
const rsAstralRange = "\\ud800-\\udfff";
const rsComboMarksRange = "\\u0300-\\u036f";
const reComboHalfMarksRange = "\\ufe20-\\ufe2f";
const rsComboSymbolsRange = "\\u20d0-\\u20ff";
const rsComboMarksExtendedRange = "\\u1ab0-\\u1aff";
const rsComboMarksSupplementRange = "\\u1dc0-\\u1dff";
const rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange + rsComboMarksExtendedRange + rsComboMarksSupplementRange;
const rsDingbatRange = "\\u2700-\\u27bf";
const rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff";
const rsMathOpRange = "\\xac\\xb1\\xd7\\xf7";
const rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf";
const rsPunctuationRange = "\\u2000-\\u206f";
const rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000";
const rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde";
const rsVarRange = "\\ufe0e\\ufe0f";
const rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
/** Used to compose unicode capture groups. */
const rsApos = "['’]";
const rsBreak = `[${rsBreakRange}]`;
const rsCombo = `[${rsComboRange}]`;
const rsDigit = "\\d";
const rsDingbat = `[${rsDingbatRange}]`;
const rsLower = `[${rsLowerRange}]`;
const rsMisc = `[^${rsAstralRange}${rsBreakRange + rsDigit + rsDingbatRange + rsLowerRange + rsUpperRange}]`;
const rsFitz = "\\ud83c[\\udffb-\\udfff]";
const rsModifier = `(?:${rsCombo}|${rsFitz})`;
const rsNonAstral = `[^${rsAstralRange}]`;
const rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
const rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
const rsUpper = `[${rsUpperRange}]`;
const rsZWJ = "\\u200d";
/** Used to compose unicode regexes. */
const rsMiscLower = `(?:${rsLower}|${rsMisc})`;
const rsMiscUpper = `(?:${rsUpper}|${rsMisc})`;
const rsOptContrLower = `(?:${rsApos}(?:d|ll|m|re|s|t|ve))?`;
const rsOptContrUpper = `(?:${rsApos}(?:D|LL|M|RE|S|T|VE))?`;
const reOptMod = `${rsModifier}?`;
const rsOptVar = `[${rsVarRange}]?`;
const rsOptJoin = `(?:${rsZWJ}(?:${[
	rsNonAstral,
	rsRegional,
	rsSurrPair
].join("|")})${rsOptVar + reOptMod})*`;
const rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])";
const rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])";
const rsSeq = rsOptVar + reOptMod + rsOptJoin;
const rsEmoji = `(?:${[
	rsDingbat,
	rsRegional,
	rsSurrPair
].join("|")})${rsSeq}`;
const reUnicodeWords = RegExp([
	`${rsUpper}?${rsLower}+${rsOptContrLower}(?=${[
		rsBreak,
		rsUpper,
		"$"
	].join("|")})`,
	`${rsMiscUpper}+${rsOptContrUpper}(?=${[
		rsBreak,
		rsUpper + rsMiscLower,
		"$"
	].join("|")})`,
	`${rsUpper}?${rsMiscLower}+${rsOptContrLower}`,
	`${rsUpper}+${rsOptContrUpper}`,
	rsOrdUpper,
	rsOrdLower,
	`${rsDigit}+`,
	rsEmoji
].join("|"), "g");
const LARGE_ARRAY_SIZE = 200;
const HASH_UNDEFINED = "__hash_undefined__";
const reTypedTag = /^\[object (?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)Array\]$/;
const rsAstral = `[${rsAstralRange}]`;
const rsNonAstralCombo = `${rsNonAstral}${rsCombo}?`;
const rsSymbol = `(?:${[
	rsNonAstralCombo,
	rsCombo,
	rsRegional,
	rsSurrPair,
	rsAstral
].join("|")})`;
const reUnicode = RegExp(`${rsFitz}(?=${rsFitz})|${rsSymbol + rsSeq}`, "g");
const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const reIsPlainProp = /^\w*$/;
const charCodeOfDot = ".".charCodeAt(0);
const reEscapeChar = /\\(\\)?/g;
const rePropName = RegExp("[^.[\\]]+|\\[(?:([^\"'][^[]*)|([\"'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2)\\]|(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))", "g");
const reIsUint = /^(?:0|[1-9]\d*)$/;
const hasUnicodeWord = RegExp.prototype.test.bind(/[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/);
const MAX_ARRAY_INDEX = 4294967294;
/** Used to match words composed of alphanumeric characters. */
const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
const hasUnicode = (string) => {
	return reUnicode.test(string);
};
const unicodeToArray = (string) => {
	return string.match(reUnicode) || [];
};
const asciiToArray = (string) => {
	return string.split("");
};
const stringToArray = (string) => {
	return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
};
const values = (object) => {
	if (object == null) return [];
	return keys(object).map((key) => object[key]);
};
const keys = (object) => {
	return isArrayLike(object) ? arrayLikeKeys(object) : Object.keys(Object(object));
};
const baseKeys = (object) => {
	if (!isPrototype(object)) return Object.keys(object);
	var result$1 = [];
	for (var key in Object(object)) if (hasOwnProperty.call(object, key) && key != "constructor") result$1.push(key);
	return result$1;
};
const arrayLikeKeys = (value, inherited) => {
	const isArr = Array.isArray(value);
	const isArg = !isArr && isObjectLike(value) && getTag(value) === argsTag;
	const isType = !isArr && !isArg && isTypedArray(value);
	const skipIndexes = isArr || isArg || isType;
	const length$1 = value.length;
	const result$1 = new Array(skipIndexes ? length$1 : 0);
	let index = skipIndexes ? -1 : length$1;
	while (++index < length$1) result$1[index] = `${index}`;
	for (const key in value) if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key === "length" || isIndex(key, length$1)))) result$1.push(key);
	return result$1;
};
const assocIndexOf = (array, key) => {
	let { length: length$1 } = array;
	while (length$1--) if (eq(array[length$1][0], key)) return length$1;
	return -1;
};
const eq = (value, other) => {
	return value === other || value !== value && other !== other;
};
const isObjectLike = (value) => {
	return value != null && typeof value == "object";
};
const isIterateeCall = (value, index, object) => {
	if (!isObject(object)) return false;
	const type = typeof index;
	const isPossibleIteratee = type == "number" ? isArrayLike(object) && index > -1 && index < object.length : type == "string" && index in object;
	if (isPossibleIteratee) return eq(object[index], value);
	return false;
};
const isSet = (value) => {
	return isObjectLike(value) && getTag(value) == setTag;
};
const isMap = (value) => {
	return isObjectLike(value) && getTag(value) == mapTag;
};
const isPrototype = (value) => {
	const Ctor = value && value.constructor;
	const proto = typeof Ctor === "function" && Ctor.prototype || Object.prototype;
	return value === proto;
};
const assignValue = (object, key, value) => {
	const objValue = object[key];
	if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) object[key] = value;
};
const copyObject = (source, props$2, object) => {
	let index = -1;
	const length$1 = props$2.length;
	while (++index < length$1) {
		const key = props$2[index];
		assignValue(object, key, source[key]);
	}
	return object;
};
const isArrayLike = (value) => {
	return value != null && typeof value !== "function" && typeof value.length === "number" && value.length > -1 && value.length % 1 === 0;
};
const isSymbol = (value) => {
	return typeof value == "symbol" || isObjectLike(value) && getTag(value) === symbolTag;
};
const initCloneArray = (array) => {
	const length$1 = array.length;
	let result$1 = new array.constructor(length$1);
	if (length$1 && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
		result$1.index = array.index;
		result$1.input = array.input;
	}
	return result$1;
};
const copyArray = (source, array) => {
	let index = -1;
	const length$1 = source.length;
	array || (array = new Array(length$1));
	while (++index < length$1) array[index] = source[index];
	return array;
};
const getTag = (value) => {
	if (value == null) return value === void 0 ? undefinedTag : nullTag;
	return Object.prototype.toString.call(value);
};
const cloneArrayBuffer = (arrayBuffer) => {
	const result$1 = new arrayBuffer.constructor(arrayBuffer.byteLength);
	new Uint8Array(result$1).set(new Uint8Array(arrayBuffer));
	return result$1;
};
const cloneTypedArray = (typedArray, isDeep) => {
	const buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
	return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
};
const cloneRegExp = (regexp) => {
	const result$1 = new regexp.constructor(regexp.source, /\w*$/.exec(regexp));
	result$1.lastIndex = regexp.lastIndex;
	return result$1;
};
const initCloneObject = (object) => {
	return typeof object.constructor == "function" && !isPrototype(object) ? Object.create(Object.getPrototypeOf(object)) : {};
};
const getSymbols = (object) => {
	if (object == null) return [];
	object = Object(object);
	const symbols = Object.getOwnPropertySymbols(object);
	return symbols.filter((symbol) => propertyIsEnumerable.call(object, symbol));
};
const copySymbols = (source, object) => {
	return copyObject(source, getSymbols(source), object);
};
function cloneDataView(dataView, isDeep) {
	const buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
	return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}
const initCloneByTag = (object, tag, isDeep) => {
	const Constructor = object.constructor;
	switch (tag) {
		case arrayBufferTag: return cloneArrayBuffer(object);
		case boolTag:
		case dateTag: return new Constructor(+object);
		case dataViewTag: return cloneDataView(object, isDeep);
		case float32Tag:
		case float64Tag:
		case int8Tag:
		case int16Tag:
		case int32Tag:
		case uint8Tag:
		case uint8ClampedTag:
		case uint16Tag:
		case uint32Tag: return cloneTypedArray(object, isDeep);
		case mapTag: return new Constructor(object);
		case numberTag:
		case stringTag: return new Constructor(object);
		case regexpTag: return cloneRegExp(object);
		case setTag: return new Constructor();
		case symbolTag: return Symbol.prototype.valueOf ? Object(Symbol.prototype.valueOf.call(object)) : {};
	}
};
const isTypedArray = (value) => {
	return isObjectLike(value) && reTypedTag.test(getTag(value));
};
const getAllKeys = (object) => {
	const result$1 = Object.keys(object);
	if (!Array.isArray(object) && object != null) result$1.push(...getSymbols(Object(object)));
	return result$1;
};
const getSymbolsIn = (object) => {
	const result$1 = [];
	while (object) {
		result$1.push(...getSymbols(object));
		object = Object.getPrototypeOf(Object(object));
	}
	return result$1;
};
const getAllKeysIn = (object) => {
	const result$1 = [];
	for (const key in object) result$1.push(key);
	if (!Array.isArray(object)) result$1.push(...getSymbolsIn(object));
	return result$1;
};
const getMapData = ({ __data__ }, key) => {
	const data$1 = __data__;
	return isKeyable(key) ? data$1[typeof key === "string" ? "string" : "hash"] : data$1.map;
};
const equalObjects = (object, other, equalFunc, stack) => {
	const objProps = getAllKeys(object);
	const objLength = objProps.length;
	const othProps = getAllKeys(other);
	const othLength = othProps.length;
	if (objLength != othLength) return false;
	let key;
	let index = objLength;
	while (index--) {
		key = objProps[index];
		if (!hasOwnProperty.call(other, key)) return false;
	}
	const objStacked = stack.get(object);
	const othStacked = stack.get(other);
	if (objStacked && othStacked) return objStacked == other && othStacked == object;
	let result$1 = true;
	stack.set(object, other);
	stack.set(other, object);
	let compared;
	let skipCtor;
	while (++index < objLength) {
		key = objProps[index];
		const objValue = object[key];
		const othValue = other[key];
		if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, stack) : compared)) {
			result$1 = false;
			break;
		}
		skipCtor || (skipCtor = key == "constructor");
	}
	if (result$1 && !skipCtor) {
		const objCtor = object.constructor;
		const othCtor = other.constructor;
		if (objCtor != othCtor && "constructor" in object && "constructor" in other && !(typeof objCtor === "function" && objCtor instanceof objCtor && typeof othCtor === "function" && othCtor instanceof othCtor)) result$1 = false;
	}
	stack["delete"](object);
	stack["delete"](other);
	return result$1;
};
const baseIsEqual = (value, other, stack) => {
	if (value === other) return true;
	if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) return value !== value && other !== other;
	return baseIsEqualDeep(value, other, baseIsEqual, stack);
};
const baseIsEqualDeep = (object, other, equalFunc, stack) => {
	let objIsArr = Array.isArray(object);
	const othIsArr = Array.isArray(other);
	let objTag = objIsArr ? arrayTag : getTag(object);
	let othTag = othIsArr ? arrayTag : getTag(other);
	objTag = objTag == argsTag ? objectTag : objTag;
	othTag = othTag == argsTag ? objectTag : othTag;
	let objIsObj = objTag == objectTag;
	const othIsObj = othTag == objectTag;
	const isSameTag = objTag == othTag;
	if (isSameTag && !objIsObj) {
		stack || (stack = new Stack());
		return objIsArr || isTypedArray(object) ? equalArrays(object, other, false, equalFunc, stack) : equalByTag(object, other, objTag, equalFunc, stack);
	}
	const objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__");
	const othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
	if (objIsWrapped || othIsWrapped) {
		const objUnwrapped = objIsWrapped ? object.value() : object;
		const othUnwrapped = othIsWrapped ? other.value() : other;
		stack || (stack = new Stack());
		return equalFunc(objUnwrapped, othUnwrapped, stack);
	}
	if (!isSameTag) return false;
	stack || (stack = new Stack());
	return equalObjects(object, other, equalFunc, stack);
};
const equalArrays = (array, other, compareUnordered, equalFunc, stack) => {
	const isPartial = false;
	const arrLength = array.length;
	const othLength = other.length;
	if (arrLength != othLength && true) return false;
	const arrStacked = stack.get(array);
	const othStacked = stack.get(other);
	if (arrStacked && othStacked) return arrStacked == other && othStacked == array;
	let index = -1;
	let result$1 = true;
	const seen = compareUnordered ? new SetCache() : void 0;
	stack.set(array, other);
	stack.set(other, array);
	while (++index < arrLength) {
		let compared;
		const arrValue = array[index];
		const othValue = other[index];
		if (compared !== void 0) {
			result$1 = false;
			break;
		}
		if (seen) {
			if (!some(other, (othValue$1, othIndex) => {
				if (!cacheHas(seen, othIndex) && (arrValue === othValue$1 || equalFunc(arrValue, othValue$1, stack))) return seen.push(othIndex);
			})) {
				result$1 = false;
				break;
			}
		} else if (!(arrValue === othValue || equalFunc(arrValue, othValue, stack))) {
			result$1 = false;
			break;
		}
	}
	stack["delete"](array);
	stack["delete"](other);
	return result$1;
};
const some = (array, predicate) => {
	let index = -1;
	const length$1 = array == null ? 0 : array.length;
	while (++index < length$1) if (predicate(array[index], index, array)) return true;
	return false;
};
const cacheHas = (cache, key) => {
	return cache.has(key);
};
const compareArrayBufferTag = (object, other, equalFunc, stack) => {
	if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other), stack)) return false;
	return true;
};
const equalByTag = (object, other, tag, equalFunc, stack) => {
	switch (tag) {
		case dataViewTag:
			if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) return false;
			object = object.buffer;
			other = other.buffer;
			return compareArrayBufferTag(object, other, equalFunc, stack);
		case arrayBufferTag: return compareArrayBufferTag(object, other, equalFunc, stack);
		case boolTag:
		case dateTag:
		case numberTag: return eq(+object, +other);
		case errorTag: return object.name == other.name && object.message == other.message;
		case regexpTag:
		case stringTag: return object == `${other}`;
		case mapTag: var convert = mapToArray;
		case setTag:
			convert || (convert = setToArray);
			if (object.size != other.size) return false;
			const stacked = stack.get(object);
			if (stacked) return stacked == other;
			stack.set(object, other);
			const result$1 = equalArrays(convert(object), convert(other), true, equalFunc, stack);
			stack["delete"](object);
			return result$1;
		case symbolTag: return Symbol.prototype.valueOf.call(object) == Symbol.prototype.valueOf.call(other);
	}
	return false;
};
const mapToArray = (map) => {
	let index = -1;
	let result$1 = Array(map.size);
	map.forEach((value, key) => {
		result$1[++index] = [key, value];
	});
	return result$1;
};
const setToArray = (set$1) => {
	let index = -1;
	const result$1 = new Array(set$1.size);
	set$1.forEach((value) => {
		result$1[++index] = value;
	});
	return result$1;
};
const isKey = (value, object) => {
	if (Array.isArray(value)) return false;
	const type = typeof value;
	if (type === "number" || type === "boolean" || value == null || isSymbol(value)) return true;
	return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
};
const stringToPath = (string) => {
	const result$1 = [];
	if (string.charCodeAt(0) === charCodeOfDot) result$1.push("");
	string.replace(rePropName, (match, expression, quote, subString) => {
		let key = match;
		if (quote) key = subString.replace(reEscapeChar, "$1");
		else if (expression) key = expression.trim();
		result$1.push(key);
	});
	return result$1;
};
const castPath = (path, object) => {
	if (Array.isArray(path)) return path;
	return isKey(path, object) ? [path] : stringToPath(`${path}`);
};
const get = (object, path) => {
	path = castPath(path, object);
	let index = 0;
	const length$1 = path.length;
	while (object != null && index < length$1) {
		object = object[toKey(path[index])];
		index++;
	}
	return index && index == length$1 ? object : void 0;
};
function compareAscending(value, other) {
	if (value !== other) {
		const valIsDefined = value !== void 0;
		const valIsNull = value === null;
		const valIsReflexive = value === value;
		const valIsSymbol = isSymbol(value);
		const othIsDefined = other !== void 0;
		const othIsNull = other === null;
		const othIsReflexive = other === other;
		const othIsSymbol = isSymbol(other);
		if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) return 1;
		if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) return -1;
	}
	return 0;
}
function compareMultiple(object, other, orders) {
	let index = -1;
	const objCriteria = object.criteria;
	const othCriteria = other.criteria;
	const length$1 = objCriteria.length;
	const ordersLength = orders.length;
	while (++index < length$1) {
		const order = index < ordersLength ? orders[index] : null;
		const cmpFn = order && typeof order === "function" ? order : compareAscending;
		const result$1 = cmpFn(objCriteria[index], othCriteria[index]);
		if (result$1) {
			if (order && typeof order !== "function") return result$1 * (order == "desc" ? -1 : 1);
			return result$1;
		}
	}
	return object.index - other.index;
}
const diff = (array, values$1) => {
	let includes = (array$1, value) => {
		const length$1 = array$1 == null ? 0 : array$1.length;
		return !!length$1 && array$1.indexOf(value) > -1;
	};
	let isCommon = true;
	const result$1 = [];
	const valuesLength = values$1.length;
	if (!array.length) return result$1;
	if (values$1.length >= LARGE_ARRAY_SIZE) {
		includes = (cache, key) => cache.has(key);
		isCommon = false;
		values$1 = new SetCache(values$1);
	}
	outer: for (let key in array) {
		let value = array[key];
		const computed = value;
		value = value !== 0 ? value : 0;
		if (isCommon && computed === computed) {
			let valuesIndex = valuesLength;
			while (valuesIndex--) if (values$1[valuesIndex] === computed) continue outer;
			result$1.push(value);
		} else if (!includes(values$1, computed)) result$1.push(value);
	}
	return result$1;
};
const toKey = (value) => {
	if (typeof value === "string" || isSymbol(value)) return value;
	const result$1 = `${value}`;
	return result$1 == "0" && 1 / value == -Infinity ? "-0" : result$1;
};
const baseClone = (value, isDeep = false, isFlat = false, isFull = true, customizer, key, object, stack) => {
	let result$1;
	if (customizer) result$1 = object ? customizer(value, key, object, stack) : customizer(value);
	if (result$1 !== void 0) return result$1;
	if (!isObject(value)) return value;
	const isArr = Array.isArray(value);
	const tag = getTag(value);
	if (isArr) {
		result$1 = initCloneArray(value);
		if (!isDeep) return copyArray(value, result$1);
	} else {
		const isFunc = typeof value === "function";
		if (tag === objectTag || tag === argsTag || isFunc && !object) {
			result$1 = isFlat || isFunc ? {} : initCloneObject(value);
			if (!isDeep) return isFlat ? copySymbolsIn(value, copyObject(value, Object.keys(value), result$1)) : copySymbols(value, Object.assign(result$1, value));
		} else {
			if (isFunc || !CLONEABLE_TAGS[tag]) return object ? value : {};
			result$1 = initCloneByTag(value, tag, isDeep);
		}
	}
	stack || (stack = new Stack());
	const stacked = stack.get(value);
	if (stacked) return stacked;
	stack.set(value, result$1);
	if (isMap(value)) {
		value.forEach((subValue, key$1) => {
			result$1.set(key$1, baseClone(subValue, isDeep, isFlat, isFull, customizer, key$1, value, stack));
		});
		return result$1;
	}
	if (isSet(value)) {
		value.forEach((subValue) => {
			result$1.add(baseClone(subValue, isDeep, isFlat, isFull, customizer, subValue, value, stack));
		});
		return result$1;
	}
	if (isTypedArray(value)) return result$1;
	const keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
	const props$2 = isArr ? void 0 : keysFunc(value);
	(props$2 || value).forEach((subValue, key$1) => {
		if (props$2) {
			key$1 = subValue;
			subValue = value[key$1];
		}
		assignValue(result$1, key$1, baseClone(subValue, isDeep, isFlat, isFull, customizer, key$1, value, stack));
	});
	return result$1;
};
const copySymbolsIn = (source, object) => {
	return copyObject(source, getSymbolsIn(source), object);
};
const parent = (object, path) => {
	return path.length < 2 ? object : get(object, path.slice(0, -1));
};
const set = (object, path, value) => {
	if (!isObject(object)) return object;
	path = castPath(path, object);
	const length$1 = path.length;
	const lastIndex = length$1 - 1;
	let index = -1;
	let nested = object;
	while (nested != null && ++index < length$1) {
		const key = toKey(path[index]);
		let newValue = value;
		if (index != lastIndex) {
			const objValue = nested[key];
			newValue = void 0;
			if (newValue === void 0) newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
		}
		assignValue(nested, key, newValue);
		nested = nested[key];
	}
	return object;
};
const isIndex = (value, length$1) => {
	const type = typeof value;
	length$1 = length$1 == null ? Number.MAX_SAFE_INTEGER : length$1;
	return !!length$1 && (type === "number" || type !== "symbol" && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length$1;
};
const unset = (object, path) => {
	path = castPath(path, object);
	object = parent(object, path);
	const lastSegment = path[path.length - 1];
	return object == null || delete object[toKey(lastSegment)];
};
const isKeyable = (value) => {
	const type = typeof value;
	return type === "string" || type === "number" || type === "symbol" || type === "boolean" ? value !== "__proto__" : value === null;
};
const keysIn = (object) => {
	const result$1 = [];
	for (const key in object) result$1.push(key);
	return result$1;
};
const toPlainObject = (value) => {
	value = Object(value);
	const result$1 = {};
	for (const key in value) result$1[key] = value[key];
	return result$1;
};
const safeGet = (object, key) => {
	if (key === "constructor" && typeof object[key] === "function") return;
	if (key == "__proto__") return;
	return object[key];
};
function createAssigner(assigner, isMerge = false) {
	return (object, ...sources) => {
		let index = -1;
		let length$1 = sources.length;
		let customizer = length$1 > 1 ? sources[length$1 - 1] : void 0;
		const guard = length$1 > 2 ? sources[2] : void 0;
		customizer = assigner.length > 3 && typeof customizer === "function" ? (length$1--, customizer) : isMerge ? (a, b) => {
			if (Array.isArray(a) && !Array.isArray(b)) return b;
		} : void 0;
		if (guard && isIterateeCall(sources[0], sources[1], guard)) {
			customizer = length$1 < 3 ? void 0 : customizer;
			length$1 = 1;
		}
		object = Object(object);
		while (++index < length$1) {
			const source = sources[index];
			if (source) assigner(object, source, index, customizer);
		}
		return object;
	};
}
const baseMerge = (object, source, srcIndex, customizer, stack) => {
	if (object === source) return;
	forIn(source, (srcValue, key) => {
		if (isObject(srcValue)) {
			stack || (stack = new Stack());
			baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
		} else {
			let newValue = customizer ? customizer(object[key], srcValue, `${key}`, object, source, stack) : void 0;
			if (newValue === void 0) newValue = srcValue;
			assignMergeValue(object, key, newValue);
		}
	});
};
const baseMergeDeep = (object, source, key, srcIndex, mergeFunc, customizer, stack) => {
	const objValue = safeGet(object, key);
	const srcValue = safeGet(source, key);
	const stacked = stack.get(srcValue);
	if (stacked) {
		assignMergeValue(object, key, stacked);
		return;
	}
	let newValue = customizer ? customizer(objValue, srcValue, `${key}`, object, source, stack) : void 0;
	let isCommon = newValue === void 0;
	if (isCommon) {
		const isArr = Array.isArray(srcValue);
		const isTyped = !isArr && isTypedArray(srcValue);
		newValue = srcValue;
		if (isArr || isTyped) if (Array.isArray(objValue)) newValue = objValue;
		else if (isObjectLike(objValue) && isArrayLike(objValue)) newValue = copyArray(objValue);
		else if (isTyped) {
			isCommon = false;
			newValue = cloneTypedArray(srcValue, true);
		} else newValue = [];
		else if (isPlainObject(srcValue) || isArguments(srcValue)) {
			newValue = objValue;
			if (isArguments(objValue)) newValue = toPlainObject(objValue);
			else if (typeof objValue === "function" || !isObject(objValue)) newValue = initCloneObject(srcValue);
		} else isCommon = false;
	}
	if (isCommon) {
		stack.set(srcValue, newValue);
		mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
		stack["delete"](srcValue);
	}
	assignMergeValue(object, key, newValue);
};
const assignMergeValue = (object, key, value) => {
	if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) assignValue(object, key, value);
};
function baseFor(object, iteratee, keysFunc) {
	const iterable = Object(object);
	const props$2 = keysFunc(object);
	let { length: length$1 } = props$2;
	let index = -1;
	while (length$1--) {
		const key = props$2[++index];
		if (iteratee(iterable[key], key, iterable) === false) break;
	}
	return object;
}
const baseForOwn = (object, iteratee) => {
	return object && baseFor(object, iteratee, keys);
};
const baseEach = (collection, iteratee) => {
	if (collection == null) return collection;
	if (!isArrayLike(collection)) return baseForOwn(collection, iteratee);
	const length$1 = collection.length;
	const iterable = Object(collection);
	let index = -1;
	while (++index < length$1) if (iteratee(iterable[index], index, iterable) === false) break;
	return collection;
};
function last(array) {
	const length$1 = array == null ? 0 : array.length;
	return length$1 ? array[length$1 - 1] : void 0;
}
const createSet = Set && 1 / setToArray(new Set([void 0, -0]))[1] == Infinity ? (values$1) => new Set(values$1) : () => {};
function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
	if (isObject(objValue) && isObject(srcValue)) {
		stack.set(srcValue, objValue);
		baseMerge(objValue, srcValue, void 0, customDefaultsMerge, stack);
		stack["delete"](srcValue);
	}
	return objValue;
}
function baseOrderBy(collection, iteratees, orders) {
	if (iteratees.length) iteratees = iteratees.map((iteratee) => {
		if (Array.isArray(iteratee)) return (value) => get(value, iteratee.length === 1 ? iteratee[0] : iteratee);
		return iteratee;
	});
	else iteratees = [(value) => value];
	let criteriaIndex = -1;
	let eachIndex = -1;
	const result$1 = isArrayLike(collection) ? new Array(collection.length) : [];
	baseEach(collection, (value) => {
		const criteria = iteratees.map((iteratee) => iteratee(value));
		result$1[++eachIndex] = {
			criteria,
			index: ++criteriaIndex,
			value
		};
	});
	return baseSortBy(result$1, (object, other) => compareMultiple(object, other, orders));
}
function baseSortBy(array, comparer) {
	let { length: length$1 } = array;
	array.sort(comparer);
	while (length$1--) array[length$1] = array[length$1].value;
	return array;
}
function isStrictComparable(value) {
	return value === value && !isObject(value);
}
function matchesStrictComparable(key, srcValue) {
	return (object) => {
		if (object == null) return false;
		return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
	};
}
function hasIn(object, path) {
	return object != null && hasPath(object, path, baseHasIn);
}
function baseMatchesProperty(path, srcValue) {
	if (isKey(path) && isStrictComparable(srcValue)) return matchesStrictComparable(toKey(path), srcValue);
	return (object) => {
		const objValue = get(object, path);
		return objValue === void 0 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue);
	};
}
function baseMatches(source) {
	const matchData = getMatchData(source);
	if (matchData.length === 1 && matchData[0][2]) return matchesStrictComparable(matchData[0][0], matchData[0][1]);
	return (object) => object === source || baseIsMatch(object, source, matchData);
}
function getMatchData(object) {
	const result$1 = keys(object);
	let length$1 = result$1.length;
	while (length$1--) {
		const key = result$1[length$1];
		const value = object[key];
		result$1[length$1] = [
			key,
			value,
			isStrictComparable(value)
		];
	}
	return result$1;
}
function baseIsMatch(object, source, matchData, customizer) {
	let index = matchData.length;
	const length$1 = index;
	const noCustomizer = !customizer;
	if (object == null) return !length$1;
	let data$1;
	let result$1;
	object = Object(object);
	while (index--) {
		data$1 = matchData[index];
		if (noCustomizer && data$1[2] ? data$1[1] !== object[data$1[0]] : !(data$1[0] in object)) return false;
	}
	while (++index < length$1) {
		data$1 = matchData[index];
		const key = data$1[0];
		const objValue = object[key];
		const srcValue = data$1[1];
		if (noCustomizer && data$1[2]) {
			if (objValue === void 0 && !(key in object)) return false;
		} else {
			const stack = new Stack();
			if (customizer) result$1 = customizer(objValue, srcValue, key, object, source, stack);
			if (!(result$1 === void 0 ? baseIsEqual(srcValue, objValue, stack) : result$1)) return false;
		}
	}
	return true;
}
function property(path) {
	return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}
function baseProperty(key) {
	return (object) => object == null ? void 0 : object[key];
}
function basePropertyDeep(path) {
	return (object) => get(object, path);
}
function baseIteratee(value) {
	if (typeof value == "function") return value;
	if (value == null) return (val) => val;
	if (typeof value == "object") return Array.isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
	return property(value);
}
function getIteratee() {
	const result$1 = baseIteratee;
	return arguments.length ? result$1(arguments[0], arguments[1]) : result$1;
}
const arrayReduce = (array, iteratee, accumulator, initAccum) => {
	let index = -1;
	const length$1 = array == null ? 0 : array.length;
	if (initAccum && length$1) accumulator = array[++index];
	while (++index < length$1) accumulator = iteratee(accumulator, array[index], index, array);
	return accumulator;
};
const baseReduce = (collection, iteratee, accumulator, initAccum, eachFunc) => {
	eachFunc(collection, (value, index, collection$1) => {
		accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection$1);
	});
	return accumulator;
};
function reduce(collection, iteratee, accumulator) {
	const func = Array.isArray(collection) ? arrayReduce : baseReduce;
	const initAccum = arguments.length < 3;
	return func(collection, iteratee, accumulator, initAccum, baseEach);
}
const isFlattenable = (value) => {
	return Array.isArray(value) || isArguments(value) || !!(value && value[Symbol.isConcatSpreadable]);
};
function baseFlatten(array, depth, predicate, isStrict, result$1) {
	let index = -1;
	const length$1 = array.length;
	predicate || (predicate = isFlattenable);
	result$1 || (result$1 = []);
	while (++index < length$1) {
		var value = array[index];
		if (depth > 0 && predicate(value)) if (depth > 1) baseFlatten(value, depth - 1, predicate, isStrict, result$1);
		else result$1.push(...value);
		else if (!isStrict) result$1[result$1.length] = value;
	}
	return result$1;
}
const isArguments = (value) => {
	return isObjectLike(value) && getTag(value) == "[object Arguments]";
};
const basePick = (object, paths) => {
	return basePickBy(object, paths, (value, path) => hasIn(object, path));
};
const basePickBy = (object, paths, predicate) => {
	let index = -1;
	const length$1 = paths.length;
	const result$1 = {};
	while (++index < length$1) {
		const path = paths[index];
		const value = get(object, path);
		if (predicate(value, path)) set(result$1, castPath(path, object), value);
	}
	return result$1;
};
const isLength = (value) => {
	return typeof value == "number" && value > -1 && value % 1 == 0 && value <= Number.MAX_SAFE_INTEGER;
};
const baseHasIn = (object, key) => {
	return object != null && key in Object(object);
};
const hasPath = (object, path, hasFunc) => {
	path = castPath(path, object);
	var index = -1, length$1 = path.length, result$1 = false;
	while (++index < length$1) {
		var key = toKey(path[index]);
		if (!(result$1 = object != null && hasFunc(object, key))) break;
		object = object[key];
	}
	if (result$1 || ++index != length$1) return result$1;
	length$1 = object == null ? 0 : object.length;
	return !!length$1 && isLength(length$1) && isIndex(key, length$1) && (Array.isArray(object) || isArguments(object));
};
const asciiWords = (string) => {
	return string.match(reAsciiWord);
};
const unicodeWords = (string) => {
	return string.match(reUnicodeWords);
};
const words = (string, pattern) => {
	if (pattern === void 0) {
		const result$1 = hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
		return result$1 || [];
	}
	return string.match(pattern) || [];
};
const castSlice = (array, start, end) => {
	const { length: length$1 } = array;
	end = end === void 0 ? length$1 : end;
	return !start && end >= length$1 ? array : array.slice(start, end);
};
const upperFirst = createCaseFirst("toUpperCase");
function createCaseFirst(methodName) {
	return (string) => {
		if (!string) return "";
		const strSymbols = hasUnicode(string) ? stringToArray(string) : void 0;
		const chr = strSymbols ? strSymbols[0] : string[0];
		const trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
		return chr[methodName]() + trailing;
	};
}
function matches(source) {
	return baseMatches(baseClone(source, true));
}
var Stack = class {
	constructor(entries) {
		const data$1 = this.__data__ = new ListCache(entries);
		this.size = data$1.size;
	}
	clear() {
		this.__data__ = new ListCache();
		this.size = 0;
	}
	delete(key) {
		const data$1 = this.__data__;
		const result$1 = data$1["delete"](key);
		this.size = data$1.size;
		return result$1;
	}
	get(key) {
		return this.__data__.get(key);
	}
	has(key) {
		return this.__data__.has(key);
	}
	set(key, value) {
		let data$1 = this.__data__;
		if (data$1 instanceof ListCache) {
			const pairs = data$1.__data__;
			if (pairs.length < LARGE_ARRAY_SIZE - 1) {
				pairs.push([key, value]);
				this.size = ++data$1.size;
				return this;
			}
			data$1 = this.__data__ = new MapCache(pairs);
		}
		data$1.set(key, value);
		this.size = data$1.size;
		return this;
	}
};
var ListCache = class {
	constructor(entries) {
		let index = -1;
		const length$1 = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length$1) {
			const entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	clear() {
		this.__data__ = [];
		this.size = 0;
	}
	delete(key) {
		const data$1 = this.__data__;
		const index = assocIndexOf(data$1, key);
		if (index < 0) return false;
		const lastIndex = data$1.length - 1;
		if (index == lastIndex) data$1.pop();
		else data$1.splice(index, 1);
		--this.size;
		return true;
	}
	get(key) {
		const data$1 = this.__data__;
		const index = assocIndexOf(data$1, key);
		return index < 0 ? void 0 : data$1[index][1];
	}
	has(key) {
		return assocIndexOf(this.__data__, key) > -1;
	}
	set(key, value) {
		const data$1 = this.__data__;
		const index = assocIndexOf(data$1, key);
		if (index < 0) {
			++this.size;
			data$1.push([key, value]);
		} else data$1[index][1] = value;
		return this;
	}
};
var MapCache = class {
	constructor(entries) {
		let index = -1;
		const length$1 = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length$1) {
			const entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	clear() {
		this.size = 0;
		this.__data__ = {
			"hash": new Hash(),
			"map": /* @__PURE__ */ new Map(),
			"string": new Hash()
		};
	}
	delete(key) {
		const result$1 = getMapData(this, key)["delete"](key);
		this.size -= result$1 ? 1 : 0;
		return result$1;
	}
	get(key) {
		return getMapData(this, key).get(key);
	}
	has(key) {
		return getMapData(this, key).has(key);
	}
	set(key, value) {
		const data$1 = getMapData(this, key);
		const size = data$1.size;
		data$1.set(key, value);
		this.size += data$1.size == size ? 0 : 1;
		return this;
	}
};
var Hash = class {
	constructor(entries) {
		let index = -1;
		const length$1 = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length$1) {
			const entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	clear() {
		this.__data__ = Object.create(null);
		this.size = 0;
	}
	delete(key) {
		const result$1 = this.has(key) && delete this.__data__[key];
		this.size -= result$1 ? 1 : 0;
		return result$1;
	}
	get(key) {
		const data$1 = this.__data__;
		const result$1 = data$1[key];
		return result$1 === HASH_UNDEFINED ? void 0 : result$1;
	}
	has(key) {
		const data$1 = this.__data__;
		return data$1[key] !== void 0;
	}
	set(key, value) {
		const data$1 = this.__data__;
		this.size += this.has(key) ? 0 : 1;
		data$1[key] = value === void 0 ? HASH_UNDEFINED : value;
		return this;
	}
};
var SetCache = class {
	constructor(values$1) {
		let index = -1;
		const length$1 = values$1 == null ? 0 : values$1.length;
		this.__data__ = new MapCache();
		while (++index < length$1) this.add(values$1[index]);
	}
	add(value) {
		this.__data__.set(value, HASH_UNDEFINED);
		return this;
	}
	has(value) {
		return this.__data__.has(value);
	}
};
SetCache.prototype.push = SetCache.prototype.add;
const isBoolean = function(value) {
	var toString = Object.prototype.toString;
	return value === true || value === false || !!value && typeof value === "object" && toString.call(value) === boolTag;
};
const isObject = function(value) {
	return !!value && (typeof value === "object" || typeof value === "function");
};
const isNumber = function(value) {
	var toString = Object.prototype.toString;
	return typeof value === "number" || !!value && typeof value === "object" && toString.call(value) === numberTag;
};
const isString = function(value) {
	var toString = Object.prototype.toString;
	return typeof value === "string" || !!value && typeof value === "object" && toString.call(value) === stringTag;
};
const assign = createAssigner((object, source) => {
	if (isPrototype(source) || isArrayLike(source)) {
		copyObject(source, keys(source), object);
		return;
	}
	for (var key in source) if (hasOwnProperty.call(source, key)) assignValue(object, key, source[key]);
});
const supplement = (object, ...sources) => {
	let index = -1;
	let length$1 = sources.length;
	const guard = length$1 > 2 ? sources[2] : void 0;
	if (guard && isIterateeCall(sources[0], sources[1], guard)) length$1 = 1;
	while (++index < length$1) {
		const source = sources[index];
		if (source == null) continue;
		const props$2 = Object.keys(source);
		const propsLength = props$2.length;
		let propsIndex = -1;
		while (++propsIndex < propsLength) {
			const key = props$2[propsIndex];
			const value = object[key];
			if (value === void 0 || eq(value, Object.prototype[key]) && !hasOwnProperty.call(object, key)) object[key] = source[key];
		}
	}
	return object;
};
const defaults = supplement;
const deepSupplement = function defaultsDeep$1(...args) {
	args.push(void 0, customDefaultsMerge);
	return merge.apply(void 0, args);
};
const defaultsDeep = deepSupplement;
const invoke = (collection, path, ...args) => {
	let index = -1;
	const isFunc = typeof path === "function";
	const result$1 = isArrayLike(collection) ? new Array(collection.length) : [];
	baseEach(collection, (value) => {
		result$1[++index] = isFunc ? path.apply(value, args) : invokeProperty(value, path, ...args);
	});
	return result$1;
};
const invokeProperty = (object, path, ...args) => {
	path = castPath(path, object);
	object = parent(object, path);
	const func = object == null ? object : object[toKey(last(path))];
	return func == null ? void 0 : func.apply(object, args);
};
const sortedIndex = (array, value, iteratee) => {
	let low = 0;
	let high = array == null ? 0 : array.length;
	if (high == 0) return 0;
	iteratee = getIteratee(iteratee, 2);
	value = iteratee(value);
	const valIsNaN = value !== value;
	const valIsNull = value === null;
	const valIsSymbol = isSymbol(value);
	const valIsUndefined = value === void 0;
	while (low < high) {
		let setLow;
		const mid = Math.floor((low + high) / 2);
		const computed = iteratee(array[mid]);
		const othIsDefined = computed !== void 0;
		const othIsNull = computed === null;
		const othIsReflexive = computed === computed;
		const othIsSymbol = isSymbol(computed);
		if (valIsNaN) setLow = othIsReflexive;
		else if (valIsUndefined) setLow = othIsReflexive && othIsDefined;
		else if (valIsNull) setLow = othIsReflexive && othIsDefined && !othIsNull;
		else if (valIsSymbol) setLow = othIsReflexive && othIsDefined && !othIsNull && !othIsSymbol;
		else if (othIsNull || othIsSymbol) setLow = false;
		else setLow = computed < value;
		if (setLow) low = mid + 1;
		else high = mid;
	}
	return Math.min(high, MAX_ARRAY_INDEX);
};
const uniq = (array, iteratee) => {
	let index = -1;
	let includes = (array$1, value) => {
		const length$2 = array$1 == null ? 0 : array$1.length;
		return !!length$2 && array$1.indexOf(value) > -1;
	};
	iteratee = getIteratee(iteratee, 2);
	let isCommon = true;
	const { length: length$1 } = array;
	const result$1 = [];
	let seen = result$1;
	if (length$1 >= LARGE_ARRAY_SIZE) {
		const set$1 = iteratee ? null : createSet(array);
		if (set$1) return setToArray(set$1);
		isCommon = false;
		includes = (cache, key) => cache.has(key);
		seen = new SetCache();
	} else seen = iteratee ? [] : result$1;
	outer: while (++index < length$1) {
		let value = array[index];
		const computed = iteratee ? iteratee(value) : value;
		value = value !== 0 ? value : 0;
		if (isCommon && computed === computed) {
			let seenIndex = seen.length;
			while (seenIndex--) if (seen[seenIndex] === computed) continue outer;
			if (iteratee) seen.push(computed);
			result$1.push(value);
		} else if (!includes(seen, computed)) {
			if (seen !== result$1) seen.push(computed);
			result$1.push(value);
		}
	}
	return result$1;
};
const clone = (value) => baseClone(value);
const cloneDeep = (value) => baseClone(value, true);
const isEmpty = (value) => {
	if (value == null) return true;
	if (isArrayLike(value) && (Array.isArray(value) || typeof value === "string" || typeof value.splice === "function" || isTypedArray(value) || isArguments(value))) return !value.length;
	const tag = getTag(value);
	if (tag == "[object Map]" || tag == "[object Set]") return !value.size;
	if (isPrototype(value)) return !baseKeys(value).length;
	for (const key in value) if (hasOwnProperty.call(value, key)) return false;
	return true;
};
const isEqual = (object, other) => baseIsEqual(object, other);
const isFunction = (value) => typeof value === "function";
const isPlainObject = (value) => {
	if (!isObjectLike(value) || getTag(value) != "[object Object]") return false;
	if (Object.getPrototypeOf(value) === null) return true;
	let proto = value;
	while (Object.getPrototypeOf(proto) !== null) proto = Object.getPrototypeOf(proto);
	return Object.getPrototypeOf(value) === proto;
};
const toArray = (value) => {
	if (!value) return [];
	if (isArrayLike(value)) return isString(value) ? stringToArray(value) : copyArray(value);
	if (Symbol.iterator && Symbol.iterator in Object(value)) {
		const iterator = value[Symbol.iterator]();
		let data$1;
		const result$1 = [];
		while (!(data$1 = iterator.next()).done) result$1.push(data$1.value);
		return result$1;
	}
	const tag = getTag(value);
	const func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
	return func(value);
};
function debounce(func, wait, opt) {
	if (typeof func !== "function") throw new TypeError("Expected a function");
	let lastArgs;
	let lastThis;
	let maxWait;
	let result$1;
	let timerId;
	let lastCallTime;
	let lastInvokeTime = 0;
	let leading = false;
	let maxing = false;
	let trailing = true;
	const useRaf = !wait && wait !== 0 && window && typeof window.requestAnimationFrame === "function";
	wait = +wait || 0;
	if (isObject(opt)) {
		leading = !!opt.leading;
		maxing = "maxWait" in opt;
		maxWait = maxing ? Math.max(+opt.maxWait || 0, wait) : maxWait;
		trailing = "trailing" in opt ? !!opt.trailing : trailing;
	}
	function invokeFunc(time) {
		const args = lastArgs;
		const thisArg = lastThis;
		lastArgs = lastThis = void 0;
		lastInvokeTime = time;
		result$1 = func.apply(thisArg, args);
		return result$1;
	}
	function startTimer(pendingFunc, wait$1) {
		if (useRaf) {
			window.cancelAnimationFrame(timerId);
			return window.requestAnimationFrame(pendingFunc);
		}
		return setTimeout(pendingFunc, wait$1);
	}
	function cancelTimer(id) {
		if (useRaf) return window.cancelAnimationFrame(id);
		clearTimeout(id);
	}
	function leadingEdge(time) {
		lastInvokeTime = time;
		timerId = startTimer(timerExpired, wait);
		return leading ? invokeFunc(time) : result$1;
	}
	function remainingWait(time) {
		const timeSinceLastCall = time - lastCallTime;
		const timeSinceLastInvoke = time - lastInvokeTime;
		const timeWaiting = wait - timeSinceLastCall;
		return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
	}
	function shouldInvoke(time) {
		const timeSinceLastCall = time - lastCallTime;
		const timeSinceLastInvoke = time - lastInvokeTime;
		return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
	}
	function timerExpired() {
		const time = Date.now();
		if (shouldInvoke(time)) return trailingEdge(time);
		timerId = startTimer(timerExpired, remainingWait(time));
	}
	function trailingEdge(time) {
		timerId = void 0;
		if (trailing && lastArgs) return invokeFunc(time);
		lastArgs = lastThis = void 0;
		return result$1;
	}
	function debounced(...args) {
		const time = Date.now();
		const isInvoking = shouldInvoke(time);
		lastArgs = args;
		lastThis = this;
		lastCallTime = time;
		if (isInvoking) {
			if (timerId === void 0) return leadingEdge(lastCallTime);
			if (maxing) {
				timerId = startTimer(timerExpired, wait);
				return invokeFunc(lastCallTime);
			}
		}
		if (timerId === void 0) timerId = startTimer(timerExpired, wait);
		return result$1;
	}
	debounced.cancel = () => {
		if (timerId !== void 0) cancelTimer(timerId);
		lastInvokeTime = 0;
		lastArgs = lastCallTime = lastThis = timerId = void 0;
	};
	debounced.flush = () => timerId === void 0 ? result$1 : trailingEdge(Date.now());
	debounced.pending = () => timerId !== void 0;
	return debounced;
}
const groupBy = (collection, iteratee) => {
	iteratee = getIteratee(iteratee, 2);
	return reduce(collection, (result$1, value) => {
		const key = iteratee(value);
		if (hasOwnProperty.call(result$1, key)) result$1[key].push(value);
		else assignValue(result$1, key, [value]);
		return result$1;
	}, {});
};
const sortBy = (collection, iteratees = []) => {
	if (collection == null) return [];
	const length$1 = iteratees.length;
	if (length$1 > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) iteratees = [];
	else if (length$1 > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) iteratees = [iteratees[0]];
	if (!Array.isArray(iteratees)) iteratees = [getIteratee(iteratees, 2)];
	return baseOrderBy(collection, iteratees.flat(1), []);
};
const flattenDeep = (array) => {
	const length$1 = array == null ? 0 : array.length;
	return length$1 ? baseFlatten(array, Infinity) : [];
};
const without = (array, ...values$1) => isArrayLike(array) ? diff(array, values$1) : [];
const difference = (array, ...values$1) => isObjectLike(array) && isArrayLike(array) ? diff(array, values$1.flat(1)) : [];
const union = (...arrays) => {
	const array = arrays.flat(1);
	return uniq(array);
};
const has = (object, key) => {
	if (object == null) return false;
	if (typeof key === "string") key = key.split(".");
	let index = -1;
	let value = object;
	while (++index < key.length) {
		if (!value || !hasOwnProperty.call(value, key[index])) return false;
		value = value[key[index]];
	}
	return true;
};
const result = (object, path, defaultValue) => {
	path = castPath(path, object);
	let index = -1;
	let length$1 = path.length;
	if (!length$1) {
		length$1 = 1;
		object = void 0;
	}
	while (++index < length$1) {
		let value = object == null ? void 0 : object[toKey(path[index])];
		if (value === void 0) {
			index = length$1;
			value = defaultValue;
		}
		object = typeof value === "function" ? value.call(object) : value;
	}
	return object;
};
const omit = (object, ...paths) => {
	let result$1 = {};
	if (object == null) return result$1;
	let isDeep = false;
	paths = paths.flat(1).map((path) => {
		path = castPath(path, object);
		isDeep || (isDeep = path.length > 1);
		return path;
	});
	copyObject(object, getAllKeysIn(object), result$1);
	if (isDeep) result$1 = baseClone(result$1, true, true, true, (value) => isPlainObject(value) ? void 0 : value);
	let length$1 = paths.length;
	while (length$1--) unset(result$1, paths[length$1]);
	return result$1;
};
const pick = (object, ...paths) => {
	return object == null ? {} : basePick(object, paths.flat(Infinity));
};
const forIn = (object, iteratee = (value) => value) => {
	let index = -1;
	const iterable = Object(object);
	const props$2 = isArrayLike(object) ? arrayLikeKeys(object, true) : keysIn(object);
	let length$1 = props$2.length;
	while (length$1--) {
		const key = props$2[++index];
		if (iteratee(iterable[key], key, iterable) === false) break;
	}
};
const camelCase = (string = "") => words(`${string}`.replace(/['\u2019]/g, "")).reduce((result$1, word, index) => {
	word = word.toLowerCase();
	return result$1 + (index ? upperFirst(word) : word);
}, "");
let idCounter = 0;
const uniqueId = (prefix = "") => {
	const id = ++idCounter;
	return `${prefix}` + id;
};
const merge = createAssigner((object, source, srcIndex, customizer) => {
	baseMerge(object, source, srcIndex, customizer);
}, true);

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Data.mjs
var Data = class {
	constructor() {
		this.map = /* @__PURE__ */ new WeakMap();
	}
	has(obj, key) {
		if (key === void 0) return this.map.has(obj);
		return key in this.map.get(obj);
	}
	create(obj) {
		if (!this.has(obj)) this.map.set(obj, Object.create(null));
		return this.get(obj);
	}
	get(obj, key) {
		if (!this.has(obj)) return void 0;
		const data$1 = this.map.get(obj);
		if (key === void 0) return data$1;
		return data$1[key];
	}
	set(obj, key, value) {
		if (key === void 0) return;
		const data$1 = this.create(obj);
		if (typeof key === "string") data$1[key] = value;
		else Object.assign(data$1, key);
	}
	remove(obj, key) {
		if (!this.has(obj)) return;
		if (key === void 0) this.map.delete(obj);
		else {
			const data$1 = this.map.get(obj);
			delete data$1[key];
		}
	}
};
var Data_default = Data;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Dom/vars.mjs
const dataPriv = new Data_default();
const dataUser = new Data_default();

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Dom/Event.mjs
const Event = function(src, props$2) {
	if (!(this instanceof Event)) return new Event(src, props$2);
	if (src && src.type) {
		this.originalEvent = src;
		this.type = src.type;
		this.isDefaultPrevented = src.defaultPrevented ? returnTrue : returnFalse;
		this.target = src.target;
		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;
	} else this.type = src;
	if (props$2) Object.assign(this, props$2);
	this.timeStamp = src && src.timeStamp || Date.now();
	this.envelope = true;
};
Event.prototype = {
	constructor: Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	preventDefault: function() {
		const evt = this.originalEvent;
		this.isDefaultPrevented = returnTrue;
		if (evt) evt.preventDefault();
	},
	stopPropagation: function() {
		const evt = this.originalEvent;
		this.isPropagationStopped = returnTrue;
		if (evt) evt.stopPropagation();
	},
	stopImmediatePropagation: function() {
		const evt = this.originalEvent;
		this.isImmediatePropagationStopped = returnTrue;
		if (evt) evt.stopImmediatePropagation();
		this.stopPropagation();
	}
};
[
	"altKey",
	"bubbles",
	"cancelable",
	"changedTouches",
	"ctrlKey",
	"detail",
	"eventPhase",
	"metaKey",
	"pageX",
	"pageY",
	"shiftKey",
	"view",
	"char",
	"code",
	"charCode",
	"key",
	"keyCode",
	"button",
	"buttons",
	"clientX",
	"clientY",
	"offsetX",
	"offsetY",
	"pointerId",
	"pointerType",
	"screenX",
	"screenY",
	"targetTouches",
	"toElement",
	"touches",
	"which"
].forEach((name) => addProp(name));
function addProp(name) {
	Object.defineProperty(Event.prototype, name, {
		enumerable: true,
		configurable: true,
		get: function() {
			return this.originalEvent ? this.originalEvent[name] : void 0;
		},
		set: function(value) {
			Object.defineProperty(this, name, {
				enumerable: true,
				configurable: true,
				writable: true,
				value
			});
		}
	});
}
function returnTrue() {
	return true;
}
function returnFalse() {
	return false;
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Dom/Dom.mjs
const document$1 = typeof window !== "undefined" ? window.document : null;
const documentElement = document$1 && document$1.documentElement;
const rTypeNamespace = /^([^.]*)(?:\.(.+)|)/;
const rNotHtmlWhite = /[^\x20\t\r\n\f]+/g;
const $ = function(selector) {
	return new $.Dom(selector);
};
$.fn = $.prototype = {
	constructor: $,
	length: 0
};
$.guid = 1;
$.data = dataUser;
$.merge = function(first, second) {
	let len = +second.length;
	let i = first.length;
	for (let j = 0; j < len; j++) first[i++] = second[j];
	first.length = i;
	return first;
};
$.parseHTML = function(string) {
	const context = document$1.implementation.createHTMLDocument();
	const base = context.createElement("base");
	base.href = document$1.location.href;
	context.head.appendChild(base);
	context.body.innerHTML = string;
	const scripts = context.getElementsByTagName("script");
	for (let i = 0; i < scripts.length; i++) scripts[i].remove();
	return Array.from(context.body.childNodes);
};
if (typeof Symbol === "function") $.fn[Symbol.iterator] = Array.prototype[Symbol.iterator];
$.fn.toArray = function() {
	return Array.from(this);
};
$.fn.pushStack = function(elements) {
	const ret = $.merge(this.constructor(), elements);
	ret.prevObject = this;
	return ret;
};
$.fn.find = function(selector) {
	const [el] = this;
	const ret = this.pushStack([]);
	if (!el) return ret;
	const { nodeType } = el;
	if (nodeType !== 1 && nodeType !== 9 && nodeType !== 11) return ret;
	if (typeof selector !== "string") {
		if (el !== selector && el.contains(selector)) $.merge(ret, [selector]);
	} else $.merge(ret, el.querySelectorAll(selector));
	return ret;
};
$.fn.add = function(selector) {
	const newElements = $(selector).toArray();
	const prevElements = this.toArray();
	const ret = this.pushStack([]);
	$.merge(ret, uniq(prevElements.concat(newElements)));
	return ret;
};
$.fn.addBack = function() {
	return this.add(this.prevObject);
};
$.fn.filter = function(selector) {
	const matches$1 = [];
	for (let i = 0; i < this.length; i++) {
		const node = this[i];
		if (!node.matches(selector)) continue;
		matches$1.push(node);
	}
	return this.pushStack(matches$1);
};
const rQuickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
function isObviousHtml(input) {
	return input[0] === "<" && input[input.length - 1] === ">" && input.length >= 3;
}
const Dom = function(selector) {
	if (!selector) return this;
	if (typeof selector === "function") throw new Error("function not supported");
	if (arguments.length > 1) throw new Error("selector with context not supported");
	if (selector.nodeType) {
		this[0] = selector;
		this.length = 1;
		return this;
	}
	let match;
	if (isObviousHtml(selector + "")) match = [
		null,
		selector,
		null
	];
	else if (typeof selector === "string") match = rQuickExpr.exec(selector);
	else return $.merge(this, selector);
	if (!match || !match[1]) return $root.find(selector);
	if (match[1]) {
		$.merge(this, $.parseHTML(match[1]));
		return this;
	}
	const el = document$1.getElementById(match[2]);
	if (el) {
		this[0] = el;
		this.length = 1;
	}
	return this;
};
$.Dom = Dom;
Dom.prototype = $.fn;
$.Event = Event;
$.event = { special: Object.create(null) };
$.event.has = function(elem, eventType) {
	const events = dataPriv.get(elem, "events");
	if (!events) return false;
	if (!eventType) return true;
	return Array.isArray(events[eventType]) && events[eventType].length > 0;
};
$.event.on = function(elem, types$1, selector, data$1, fn$1, one$1) {
	if (typeof types$1 === "object") {
		if (typeof selector !== "string") {
			data$1 = data$1 || selector;
			selector = void 0;
		}
		for (let type in types$1) $.event.on(elem, type, selector, data$1, types$1[type], one$1);
		return elem;
	}
	if (data$1 == null && fn$1 == null) {
		fn$1 = selector;
		data$1 = selector = void 0;
	} else if (fn$1 == null) if (typeof selector === "string") {
		fn$1 = data$1;
		data$1 = void 0;
	} else {
		fn$1 = data$1;
		data$1 = selector;
		selector = void 0;
	}
	if (!fn$1) return elem;
	if (one$1 === 1) {
		const origFn = fn$1;
		fn$1 = function(event) {
			$().off(event);
			return origFn.apply(this, arguments);
		};
		fn$1.guid = origFn.guid || (origFn.guid = $.guid++);
	}
	for (let i = 0; i < elem.length; i++) $.event.add(elem[i], types$1, fn$1, data$1, selector);
};
$.event.add = function(elem, types$1, handler, data$1, selector) {
	if (typeof elem != "object") return;
	const elemData = dataPriv.create(elem);
	let handleObjIn;
	if (handler.handler) {
		handleObjIn = handler;
		handler = handleObjIn.handler;
		selector = handleObjIn.selector;
	}
	if (selector) documentElement.matches(selector);
	if (!handler.guid) handler.guid = $.guid++;
	let events;
	if (!(events = elemData.events)) events = elemData.events = Object.create(null);
	let eventHandle;
	if (!(eventHandle = elemData.handle)) eventHandle = elemData.handle = function(e) {
		return typeof $ !== "undefined" ? $.event.dispatch.apply(elem, arguments) : void 0;
	};
	const typesArr = (types$1 || "").match(rNotHtmlWhite) || [""];
	let i = typesArr.length;
	while (i--) {
		const [, origType, ns = ""] = rTypeNamespace.exec(typesArr[i]);
		if (!origType) continue;
		const namespaces = ns.split(".").sort();
		let special$1 = $.event.special[origType];
		const type = special$1 && (selector ? special$1.delegateType : special$1.bindType) || origType;
		special$1 = $.event.special[type];
		const handleObj = Object.assign({
			type,
			origType,
			data: data$1,
			handler,
			guid: handler.guid,
			selector,
			namespace: namespaces.join(".")
		}, handleObjIn);
		let handlers;
		if (!(handlers = events[type])) {
			handlers = events[type] = [];
			handlers.delegateCount = 0;
			if (!special$1 || !special$1.setup || special$1.setup.call(elem, data$1, namespaces, eventHandle) === false) {
				if (elem.addEventListener) elem.addEventListener(type, eventHandle);
			}
		}
		if (special$1 && special$1.add) {
			special$1.add.call(elem, handleObj);
			if (!handleObj.handler.guid) handleObj.handler.guid = handler.guid;
		}
		if (selector) handlers.splice(handlers.delegateCount++, 0, handleObj);
		else handlers.push(handleObj);
	}
};
$.event.remove = function(elem, types$1, handler, selector, mappedTypes) {
	const elemData = dataPriv.get(elem);
	if (!elemData || !elemData.events) return;
	const events = elemData.events;
	const typesArr = (types$1 || "").match(rNotHtmlWhite) || [""];
	let i = typesArr.length;
	while (i--) {
		const [, origType, ns = ""] = rTypeNamespace.exec(typesArr[i]);
		if (!origType) {
			for (const type$1 in events) $.event.remove(elem, type$1 + typesArr[i], handler, selector, true);
			continue;
		}
		const special$1 = $.event.special[origType];
		const type = special$1 && (selector ? special$1.delegateType : special$1.bindType) || origType;
		const handlers = events[type];
		if (!handlers || handlers.length === 0) continue;
		const namespaces = ns.split(".").sort();
		const rNamespace = ns ? /* @__PURE__ */ new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
		const origCount = handlers.length;
		let j = origCount;
		while (j--) {
			const handleObj = handlers[j];
			if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!rNamespace || rNamespace.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
				handlers.splice(j, 1);
				if (handleObj.selector) handlers.delegateCount--;
				if (special$1 && special$1.remove) special$1.remove.call(elem, handleObj);
			}
		}
		if (origCount && handlers.length === 0) {
			if (!special$1 || !special$1.teardown || special$1.teardown.call(elem, namespaces, elemData.handle) === false) {
				if (elem.removeEventListener) elem.removeEventListener(type, elemData.handle);
			}
			delete events[type];
		}
	}
	if (isEmpty(events)) {
		dataPriv.remove(elem, "handle");
		dataPriv.remove(elem, "events");
	}
};
$.event.dispatch = function(nativeEvent) {
	const elem = this;
	const event = $.event.fix(nativeEvent);
	event.delegateTarget = elem;
	const args = Array.from(arguments);
	args[0] = event;
	const eventsData = dataPriv.get(elem, "events");
	const handlers = eventsData && eventsData[event.type] || [];
	const special$1 = $.event.special[event.type];
	if (special$1 && special$1.preDispatch) {
		if (special$1.preDispatch.call(elem, event) === false) return;
	}
	const handlerQueue = $.event.handlers.call(elem, event, handlers);
	let i = 0;
	let matched;
	while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
		event.currentTarget = matched.elem;
		let j = 0;
		let handleObj;
		while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
			event.handleObj = handleObj;
			event.data = handleObj.data;
			const origSpecial = $.event.special[handleObj.origType];
			let handler;
			if (origSpecial && origSpecial.handle) handler = origSpecial.handle;
			else handler = handleObj.handler;
			const ret = handler.apply(matched.elem, args);
			if (ret !== void 0) {
				if ((event.result = ret) === false) {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		}
	}
	if (special$1 && special$1.postDispatch) special$1.postDispatch.call(elem, event);
	return event.result;
};
$.event.handlers = function(event, handlers) {
	const delegateCount = handlers.delegateCount;
	const handlerQueue = [];
	if (delegateCount && !(event.type === "click" && event.button >= 1)) {
		for (let cur = event.target; cur !== this; cur = cur.parentNode || this) if (cur.nodeType === 1 && !(event.type === "click" && cur.disabled === true)) {
			const matchedHandlers = [];
			const matchedSelectors = {};
			for (let i = 0; i < delegateCount; i++) {
				const handleObj = handlers[i];
				const sel = handleObj.selector + " ";
				if (matchedSelectors[sel] === void 0) matchedSelectors[sel] = cur.matches(sel);
				if (matchedSelectors[sel]) matchedHandlers.push(handleObj);
			}
			if (matchedHandlers.length) handlerQueue.push({
				elem: cur,
				handlers: matchedHandlers
			});
		}
	}
	if (delegateCount < handlers.length) handlerQueue.push({
		elem: this,
		handlers: handlers.slice(delegateCount)
	});
	return handlerQueue;
};
$.event.fix = function(originalEvent) {
	return originalEvent.envelope ? originalEvent : new Event(originalEvent);
};
const $root = $(document$1);

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Dom/methods.mjs
var methods_exports = {};
__export(methods_exports, {
	addClass: () => addClass$1,
	append: () => append,
	appendTo: () => appendTo,
	children: () => children,
	clone: () => clone$1,
	closest: () => closest,
	css: () => css,
	data: () => data,
	detach: () => detach,
	empty: () => empty,
	hasClass: () => hasClass,
	height: () => height,
	html: () => html,
	off: () => off,
	offset: () => offset,
	on: () => on,
	one: () => one,
	position: () => position,
	prepend: () => prepend,
	prependTo: () => prependTo,
	remove: () => remove,
	removeClass: () => removeClass,
	toggleClass: () => toggleClass,
	width: () => width
});
function cleanNodesData(nodes) {
	let i = nodes.length;
	while (i--) cleanNodeData(nodes[i]);
}
function cleanNodeData(node) {
	$.event.remove(node);
	dataPriv.remove(node);
	dataUser.remove(node);
}
function removeNodes(nodes) {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		if (node.parentNode) node.parentNode.removeChild(node);
	}
}
function remove() {
	for (let i = 0; i < this.length; i++) {
		const node = this[i];
		cleanNodeData(node);
		cleanNodesData(node.getElementsByTagName("*"));
	}
	removeNodes(this);
	return this;
}
function detach() {
	removeNodes(this);
	return this;
}
function empty() {
	for (let i = 0; i < this.length; i++) {
		const node = this[i];
		if (node.nodeType === 1) {
			cleanNodesData(node.getElementsByTagName("*"));
			node.textContent = "";
		}
	}
	return this;
}
function clone$1() {
	const clones = [];
	for (let i = 0; i < this.length; i++) clones.push(this[i].cloneNode(true));
	return this.pushStack(clones);
}
function html(html$1) {
	const [el] = this;
	if (!el) return null;
	if (arguments.length === 0) return el.innerHTML;
	if (html$1 === void 0) return this;
	cleanNodesData(el.getElementsByTagName("*"));
	if (typeof html$1 === "string" || typeof html$1 === "number") el.innerHTML = html$1;
	else {
		el.innerHTML = "";
		return this.append(html$1);
	}
	return this;
}
function append(...nodes) {
	const [parent$1] = this;
	if (!parent$1) return this;
	nodes.forEach((node) => {
		if (!node) return;
		if (typeof node === "string") parent$1.append(...$.parseHTML(node));
		else if (node.toString() === "[object Object]") this.append(...Array.from(node));
		else if (Array.isArray(node)) this.append(...node);
		else parent$1.appendChild(node);
	});
	return this;
}
function prepend(...nodes) {
	const [parent$1] = this;
	if (!parent$1) return this;
	nodes.forEach((node) => {
		if (!node) return;
		if (typeof node === "string") parent$1.prepend(...$.parseHTML(node));
		else if (node.toString() === "[object Object]") this.prepend(...Array.from(node));
		else if (Array.isArray(node)) this.prepend(...node);
		else parent$1.insertBefore(node, parent$1.firstChild);
	});
	return this;
}
function appendTo(parent$1) {
	$(parent$1).append(this);
	return this;
}
function prependTo(parent$1) {
	$(parent$1).prepend(this);
	return this;
}
const requireUnits = {};
[
	"width",
	"height",
	"top",
	"bottom",
	"left",
	"right",
	"padding",
	"paddingTop",
	"paddingBottom",
	"paddingLeft",
	"paddingRight",
	"margin",
	"marginTop",
	"marginBottom",
	"marginLeft",
	"marginRight"
].forEach((cssProp) => {
	requireUnits[cssProp] = true;
});
function setCSSProperty(el, name, value) {
	if (typeof value === "number" && requireUnits[camelCase(name)]) value += "px";
	el.style[name] = value;
}
function css(name, value) {
	let styles;
	if (typeof name === "string") if (value === void 0) {
		const [el] = this;
		if (!el) return null;
		return el.style[name];
	} else styles = { [name]: value };
	else if (!name) throw new Error("no styles provided");
	else styles = name;
	for (let style in styles) if (styles.hasOwnProperty(style)) for (let i = 0; i < this.length; i++) setCSSProperty(this[i], style, styles[style]);
	return this;
}
function data(name, value) {
	if (arguments.length < 2) {
		const [el] = this;
		if (!el) return null;
		if (name === void 0) return el.dataset;
		return el.dataset[name];
	}
	for (let i = 0; i < this.length; i++) this[i].dataset[name] = value;
	return this;
}
function setNodesClass(method, nodes, args) {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		V_default.prototype[method].apply({ node }, args);
	}
}
function removeClass() {
	setNodesClass("removeClass", this, arguments);
	return this;
}
function addClass$1() {
	setNodesClass("addClass", this, arguments);
	return this;
}
function toggleClass() {
	setNodesClass("toggleClass", this, arguments);
	return this;
}
function hasClass() {
	const [node] = this;
	if (!node) return false;
	return V_default.prototype.hasClass.apply({ node }, arguments);
}
function children(selector) {
	const matches$1 = [];
	for (let i = 0; i < this.length; i++) {
		const node = this[i];
		let children$1 = Array.from(node.children);
		if (typeof selector === "string") children$1 = children$1.filter((child) => child.matches(selector));
		matches$1.push(...children$1);
	}
	return this.pushStack(matches$1);
}
function closest(selector) {
	const closest$1 = [];
	for (let i = 0; i < this.length; i++) {
		const el = this[i];
		if (typeof selector === "string") {
			const closestEl = el.closest(selector);
			if (closestEl) closest$1.push(closestEl);
		} else {
			const [ancestorEl] = $(selector);
			if (ancestorEl && ancestorEl.contains(el)) closest$1.push(ancestorEl);
		}
	}
	return this.pushStack(closest$1);
}
function on(types$1, selector, data$1, fn$1) {
	$.event.on(this, types$1, selector, data$1, fn$1);
	return this;
}
function one(types$1, selector, data$1, fn$1) {
	$.event.on(this, types$1, selector, data$1, fn$1, 1);
	return this;
}
function off(types$1, selector, fn$1) {
	if (types$1 && types$1.preventDefault && types$1.handleObj) {
		const handleObj = types$1.handleObj;
		$(types$1.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
		return this;
	}
	if (typeof types$1 === "object") {
		for (let type in types$1) this.off(type, selector, types$1[type]);
		return this;
	}
	if (selector === false || typeof selector === "function") {
		fn$1 = selector;
		selector = void 0;
	}
	for (let i = 0; i < this.length; i++) $.event.remove(this[i], types$1, fn$1, selector);
	return this;
}
function width() {
	const [el] = this;
	if (el === window) return el.document.documentElement.clientWidth;
	else if (!el) return void 0;
	const styles = window.getComputedStyle(el);
	const height$1 = el.offsetWidth;
	const borderTopWidth = parseFloat(styles.borderTopWidth);
	const borderBottomWidth = parseFloat(styles.borderBottomWidth);
	const paddingTop = parseFloat(styles.paddingTop);
	const paddingBottom = parseFloat(styles.paddingBottom);
	return height$1 - borderBottomWidth - borderTopWidth - paddingTop - paddingBottom;
}
function height() {
	const [el] = this;
	if (el === window) return el.document.documentElement.clientHeight;
	if (!el) return void 0;
	const styles = window.getComputedStyle(el);
	const width$1 = el.offsetHeight;
	const borderLeftWidth = parseFloat(styles.borderLeftWidth);
	const borderRightWidth = parseFloat(styles.borderRightWidth);
	const paddingLeft = parseFloat(styles.paddingLeft);
	const paddingRight = parseFloat(styles.paddingRight);
	return width$1 - borderLeftWidth - borderRightWidth - paddingLeft - paddingRight;
}
function position() {
	const [el] = this;
	if (!el) return;
	let $el = $(el);
	let offsetParent;
	let offset$1;
	let doc;
	let parentOffset = {
		top: 0,
		left: 0
	};
	if ($el.css("position") === "fixed") offset$1 = el.getBoundingClientRect();
	else {
		offset$1 = $el.offset();
		doc = el.ownerDocument;
		offsetParent = el.offsetParent || doc.documentElement;
		const isStaticallyPositioned = (el$1) => {
			const { position: position$1 } = getComputedStyle(el$1);
			return position$1 === "static";
		};
		while (offsetParent && offsetParent !== doc.documentElement && isStaticallyPositioned(offsetParent)) offsetParent = offsetParent.offsetParent || doc.documentElement;
		if (offsetParent && offsetParent !== el && offsetParent.nodeType === 1 && !isStaticallyPositioned(offsetParent)) {
			const offsetParentStyles = window.getComputedStyle(offsetParent);
			const borderTopWidth = parseFloat(offsetParentStyles.borderTopWidth) || 0;
			const borderLeftWidth = parseFloat(offsetParentStyles.borderLeftWidth) || 0;
			parentOffset = $(offsetParent).offset();
			parentOffset.top += borderTopWidth;
			parentOffset.left += borderLeftWidth;
		}
	}
	const marginTop = parseFloat(window.getComputedStyle(el).marginTop) || 0;
	const marginLeft = parseFloat(window.getComputedStyle(el).marginLeft) || 0;
	return {
		top: offset$1.top - parentOffset.top - marginTop,
		left: offset$1.left - parentOffset.left - marginLeft
	};
}
function offset(coordinates) {
	const [el] = this;
	if (coordinates === void 0) {
		if (!el) return null;
		if (!el.getClientRects().length) return {
			top: 0,
			left: 0
		};
		const rect$1 = el.getBoundingClientRect();
		return {
			top: rect$1.top + window.scrollY,
			left: rect$1.left + window.scrollX
		};
	}
	if (!el) return this;
	const currentStyle = window.getComputedStyle(el);
	if (currentStyle.position === "static") this.css("position", "relative");
	const currentOffset = this.offset();
	const topDifference = coordinates.top - currentOffset.top;
	const leftDifference = coordinates.left - currentOffset.left;
	this.css({
		top: (parseFloat(currentStyle.top) || 0) + topDifference + "px",
		left: (parseFloat(currentStyle.left) || 0) + leftDifference + "px"
	});
	return this;
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Dom/animations.mjs
var animations_exports = {};
__export(animations_exports, {
	animate: () => animate,
	stop: () => stop
});
const animationKey = "animationFrameId";
const cssReset = {};
cssReset["transition-property"] = cssReset["transition-duration"] = cssReset["transition-delay"] = cssReset["transition-timing-function"] = cssReset["animation-name"] = cssReset["animation-duration"] = cssReset["animation-delay"] = cssReset["animation-timing-function"] = "";
function animate(properties, opt = {}) {
	this.stop();
	for (let i = 0; i < this.length; i++) animateNode(this[i], properties, opt);
	return this;
}
function animateNode(el, properties, opt = {}) {
	let { duration = 400, easing = "ease-in-out", delay = 0, complete } = opt;
	const delayId = setTimeout(function() {
		const $el = $(el);
		let fired = false;
		let endEvent = "transitionend";
		duration = duration / 1e3;
		delay = delay / 1e3;
		const cssValues = {};
		if (typeof properties === "string") {
			cssValues["animation-name"] = properties;
			cssValues["animation-duration"] = duration + "s";
			cssValues["animation-delay"] = delay + "s";
			cssValues["animation-timing-function"] = easing;
			endEvent = "animationend";
		} else {
			const transitionProperties = [];
			for (var key in properties) if (properties.hasOwnProperty(key)) {
				cssValues[key] = properties[key];
				transitionProperties.push(key);
			}
			if (duration > 0) {
				cssValues["transition-property"] = transitionProperties.join(", ");
				cssValues["transition-duration"] = duration + "s";
				cssValues["transition-delay"] = delay + "s";
				cssValues["transition-timing-function"] = easing;
			}
		}
		const wrappedCallback = function(event) {
			if (event) {
				if (event.target !== event.currentTarget) return;
				event.target.removeEventListener(endEvent, wrappedCallback);
			} else el.removeEventListener(endEvent, wrappedCallback);
			fired = true;
			$el.css(cssReset);
			complete && complete.call(el);
		};
		if (duration > 0) {
			el.addEventListener(endEvent, wrappedCallback);
			const callbackId = setTimeout(function() {
				if (fired) return;
				wrappedCallback(null);
			}, (duration + delay) * 1e3 + 25);
			dataPriv.set(el, animationKey, {
				id: callbackId,
				stop: () => {
					clearTimeout(callbackId);
					el.removeEventListener(endEvent, wrappedCallback);
				}
			});
		}
		$el.css(cssValues);
		if (duration <= 0) wrappedCallback(null);
	});
	dataPriv.set(el, animationKey, { stop: () => clearTimeout(delayId) });
}
function stop() {
	for (let i = 0; i < this.length; i++) {
		const el = this[i];
		const animation = dataPriv.get(el, animationKey);
		if (!animation) continue;
		animation.stop();
		dataPriv.remove(el, animationKey);
	}
	this.css(cssReset);
	return this;
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Dom/props.mjs
const propertySetters = {
	outerWidth: "offsetWidth",
	outerHeight: "offsetHeight",
	innerWidth: "clientWidth",
	innerHeight: "clientHeight",
	scrollLeft: "scrollLeft",
	scrollTop: "scrollTop",
	val: "value",
	text: "textContent"
};
const propertiesMap = {
	disabled: "disabled",
	value: "value",
	text: "textContent"
};
function prop(name, value) {
	if (!name) throw new Error("no property provided");
	if (arguments.length === 1) {
		const [el] = this;
		if (!el) return null;
		return el[name];
	}
	if (value === void 0) return this;
	for (let i = 0; i < this.length; i++) this[i][name] = value;
	return this;
}
function attr(name, value) {
	let attributes$1;
	if (typeof name === "string") if (value === void 0) {
		const [el] = this;
		if (!el) return null;
		return el.getAttribute(name);
	} else attributes$1 = { [name]: value };
	else if (!name) throw new Error("no attributes provided");
	else attributes$1 = name;
	for (let attr$1 in attributes$1) if (attributes$1.hasOwnProperty(attr$1)) {
		const value$1 = attributes$1[attr$1];
		if (propertiesMap[attr$1]) {
			this.prop(propertiesMap[attr$1], value$1);
			continue;
		}
		for (let i = 0; i < this.length; i++) if (value$1 === null) this[i].removeAttribute(attr$1);
		else this[i].setAttribute(attr$1, value$1);
	}
	return this;
}
const methods = {
	prop,
	attr
};
Object.keys(propertySetters).forEach((methodName) => {
	methods[methodName] = function(...args) {
		return this.prop(propertySetters[methodName], ...args);
	};
});
var props_default$1 = methods;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/config/index.mjs
const config = {
	useCSSSelectors: false,
	classNamePrefix: "joint-",
	defaultTheme: "default",
	doubleTapInterval: 300
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Dom/events.mjs
const special = Object.create(null);
var events_default = special;
special.load = { noBubble: true };
[
	["mouseenter", "mouseover"],
	["mouseleave", "mouseout"],
	["pointerenter", "pointerover"],
	["pointerleave", "pointerout"]
].forEach(([orig, fix]) => {
	special[orig] = {
		delegateType: fix,
		bindType: fix,
		handle: function(event) {
			const target = this;
			const related = event.relatedTarget;
			const handleObj = event.handleObj;
			let ret;
			if (!related || !target.contains(related)) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply(target, arguments);
				event.type = fix;
			}
			return ret;
		}
	};
});
const maxDelay = config.doubleTapInterval;
const minDelay = 30;
special.dbltap = {
	bindType: "touchend",
	delegateType: "touchend",
	handle: function(event, ...args) {
		const { handleObj, target } = event;
		const targetData = $.data.create(target);
		const now = (/* @__PURE__ */ new Date()).getTime();
		const delta = "lastTouch" in targetData ? now - targetData.lastTouch : 0;
		if (delta < maxDelay && delta > minDelay) {
			targetData.lastTouch = null;
			event.type = handleObj.origType;
			handleObj.handler.call(this, event, ...args);
		} else targetData.lastTouch = now;
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Dom/index.mjs
Object.assign($.fn, methods_exports);
Object.assign($.fn, animations_exports);
Object.assign($.fn, props_default$1);
Object.assign($.event.special, events_default);
var Dom_default = $;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/util/util.mjs
const addClassNamePrefix = function(className$1) {
	if (!className$1) return className$1;
	return className$1.toString().split(" ").map(function(_className) {
		if (_className.substr(0, config.classNamePrefix.length) !== config.classNamePrefix) _className = config.classNamePrefix + _className;
		return _className;
	}).join(" ");
};
const parseDOMJSON = function(json, namespace) {
	const selectors = {};
	const groupSelectors = {};
	const svgNamespace = V_default.namespace.svg;
	const initialNS = namespace || svgNamespace;
	const fragment = document.createDocumentFragment();
	const parseNode = function(siblingsDef, parentNode, parentNS) {
		for (let i = 0; i < siblingsDef.length; i++) {
			const nodeDef = siblingsDef[i];
			if (typeof nodeDef === "string") {
				const textNode = document.createTextNode(nodeDef);
				parentNode.appendChild(textNode);
				continue;
			}
			if (!nodeDef.hasOwnProperty("tagName")) throw new Error("json-dom-parser: missing tagName");
			const tagName = nodeDef.tagName;
			let node;
			const ns = nodeDef.hasOwnProperty("namespaceURI") ? nodeDef.namespaceURI : parentNS;
			node = document.createElementNS(ns, tagName);
			const svg$1 = ns === svgNamespace;
			const wrapperNode = svg$1 ? V_default(node) : Dom_default(node);
			const attributes$1 = nodeDef.attributes;
			if (attributes$1) wrapperNode.attr(attributes$1);
			const style = nodeDef.style;
			if (style) Dom_default(node).css(style);
			if (nodeDef.hasOwnProperty("className")) {
				const className$1 = nodeDef.className;
				if (svg$1) node.className.baseVal = className$1;
				else node.className = className$1;
			}
			if (nodeDef.hasOwnProperty("textContent")) node.textContent = nodeDef.textContent;
			if (nodeDef.hasOwnProperty("selector")) {
				const nodeSelector = nodeDef.selector;
				if (selectors[nodeSelector]) throw new Error("json-dom-parser: selector must be unique");
				selectors[nodeSelector] = node;
				wrapperNode.attr("joint-selector", nodeSelector);
			}
			if (nodeDef.hasOwnProperty("groupSelector")) {
				let nodeGroups = nodeDef.groupSelector;
				if (!Array.isArray(nodeGroups)) nodeGroups = [nodeGroups];
				for (let j = 0; j < nodeGroups.length; j++) {
					const nodeGroup = nodeGroups[j];
					let group = groupSelectors[nodeGroup];
					if (!group) group = groupSelectors[nodeGroup] = [];
					group.push(node);
				}
			}
			parentNode.appendChild(node);
			const childrenDef = nodeDef.children;
			if (Array.isArray(childrenDef)) parseNode(childrenDef, node, ns);
		}
	};
	parseNode(json, fragment, initialNS);
	return {
		fragment,
		selectors,
		groupSelectors
	};
};
const hashCode = function(str) {
	let hash = 0;
	if (str.length === 0) return hash;
	for (let i = 0; i < str.length; i++) {
		const c = str.charCodeAt(i);
		hash = (hash << 5) - hash + c;
		hash = hash & hash;
	}
	return hash;
};
const getByPath = function(obj, path, delimiter) {
	var keys$1 = Array.isArray(path) ? path : path.split(delimiter || "/");
	var key;
	var i = 0;
	var length$1 = keys$1.length;
	while (i < length$1) {
		key = keys$1[i++];
		if (Object(obj) === obj && key in obj) obj = obj[key];
		else return void 0;
	}
	return obj;
};
const isGetSafe = function(obj, key) {
	if (typeof key !== "string" && typeof key !== "number") key = String(key);
	if (key === "constructor" && typeof obj[key] === "function") return false;
	if (key === "__proto__") return false;
	return true;
};
const setByPath = function(obj, path, value, delimiter) {
	const keys$1 = Array.isArray(path) ? path : path.split(delimiter || "/");
	const last$1 = keys$1.length - 1;
	let diver = obj;
	let i = 0;
	for (; i < last$1; i++) {
		const key = keys$1[i];
		if (!isGetSafe(diver, key)) return obj;
		const value$1 = diver[key];
		diver = value$1 || (diver[key] = {});
	}
	diver[keys$1[last$1]] = value;
	return obj;
};
const unsetByPath = function(obj, path, delimiter) {
	const keys$1 = Array.isArray(path) ? path : path.split(delimiter || "/");
	const last$1 = keys$1.length - 1;
	let diver = obj;
	let i = 0;
	for (; i < last$1; i++) {
		const key = keys$1[i];
		if (!isGetSafe(diver, key)) return obj;
		const value = diver[key];
		if (!value) return obj;
		diver = value;
	}
	delete diver[keys$1[last$1]];
	return obj;
};
const uuid = function() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0;
		var v = c === "x" ? r : r & 3 | 8;
		return v.toString(16);
	});
};
const guid = function(obj) {
	guid.id = guid.id || 1;
	if (obj === void 0) return "j_" + guid.id++;
	obj.id = obj.id === void 0 ? "j_" + guid.id++ : obj.id;
	return obj.id;
};
const normalizeEvent = function(evt) {
	if (evt.normalized) return evt;
	const { originalEvent, target } = evt;
	const touch = originalEvent && originalEvent.changedTouches && originalEvent.changedTouches[0];
	if (touch) {
		for (let property$1 in touch) if (evt[property$1] === void 0) evt[property$1] = touch[property$1];
	}
	if (target) {
		const useElement = target.correspondingUseElement;
		if (useElement) evt.target = useElement;
	}
	evt.normalized = true;
	return evt;
};
const normalizeWheel = function(evt) {
	const PIXEL_STEP = 10;
	const LINE_HEIGHT = 40;
	const PAGE_HEIGHT = 800;
	let sX = 0, sY = 0, pX = 0, pY = 0;
	if ("detail" in evt) sY = evt.detail;
	if ("wheelDelta" in evt) sY = -evt.wheelDelta / 120;
	if ("wheelDeltaY" in evt) sY = -evt.wheelDeltaY / 120;
	if ("wheelDeltaX" in evt) sX = -evt.wheelDeltaX / 120;
	if ("axis" in evt && evt.axis === evt.HORIZONTAL_AXIS) {
		sX = sY;
		sY = 0;
	}
	pX = "deltaX" in evt ? evt.deltaX : sX * PIXEL_STEP;
	pY = "deltaY" in evt ? evt.deltaY : sY * PIXEL_STEP;
	if ((pX || pY) && evt.deltaMode) if (evt.deltaMode == 1) {
		pX *= LINE_HEIGHT;
		pY *= LINE_HEIGHT;
	} else {
		pX *= PAGE_HEIGHT;
		pY *= PAGE_HEIGHT;
	}
	if (evt.deltaX === 0 && evt.deltaY !== 0 && evt.shiftKey) {
		pX = pY;
		pY = 0;
		sX = sY;
		sY = 0;
	}
	if (pX && !sX) sX = pX < 1 ? -1 : 1;
	if (pY && !sY) sY = pY < 1 ? -1 : 1;
	return {
		spinX: sX,
		spinY: sY,
		deltaX: pX,
		deltaY: pY
	};
};
const cap = function(val, max$4) {
	return val > max$4 ? max$4 : val < -max$4 ? -max$4 : val;
};
const nextFrame = (function() {
	var raf;
	if (typeof window !== "undefined") raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
	if (!raf) {
		var lastTime = 0;
		raf = function(callback) {
			var currTime = (/* @__PURE__ */ new Date()).getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	return function(callback, context, ...rest) {
		return context !== void 0 ? raf(callback.bind(context, ...rest)) : raf(callback);
	};
})();
const cancelFrame = (function() {
	var caf;
	var client = typeof window != "undefined";
	if (client) caf = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame || window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame;
	caf = caf || clearTimeout;
	return client ? caf.bind(window) : caf;
})();
const isPercentage = function(val) {
	return isString(val) && val.slice(-1) === "%";
};
const parseCssNumeric = function(val, restrictUnits) {
	function getUnit(validUnitExp$1) {
		var matches$1 = (/* @__PURE__ */ new RegExp("(?:\\d+(?:\\.\\d+)*)(" + validUnitExp$1 + ")$")).exec(val);
		if (!matches$1) return null;
		return matches$1[1];
	}
	var number = parseFloat(val);
	if (Number.isNaN(number)) return null;
	var output = {};
	output.value = number;
	var validUnitExp;
	if (restrictUnits == null) validUnitExp = "[A-Za-z]*";
	else if (Array.isArray(restrictUnits)) {
		if (restrictUnits.length === 0) return null;
		validUnitExp = restrictUnits.join("|");
	} else if (isString(restrictUnits)) validUnitExp = restrictUnits;
	var unit = getUnit(validUnitExp);
	if (unit === null) return null;
	output.unit = unit;
	return output;
};
const NO_SPACE = 0;
function splitWordWithEOL(word, eol) {
	const eolWords = word.split(eol);
	let n = 1;
	for (let j = 0, jl = eolWords.length - 1; j < jl; j++) {
		const replacement = [];
		if (j > 0 || eolWords[0] !== "") replacement.push(NO_SPACE);
		replacement.push(eol);
		if (j < jl - 1 || eolWords[jl] !== "") replacement.push(NO_SPACE);
		eolWords.splice(n, 0, ...replacement);
		n += replacement.length + 1;
	}
	return eolWords.filter((word$1) => word$1 !== "");
}
function getLineHeight(heightValue, textElement) {
	if (heightValue === null) return textElement.getBBox().height;
	switch (heightValue.unit) {
		case "em": return textElement.getBBox().height * heightValue.value;
		case "px":
		case "": return heightValue.value;
	}
}
const breakText = function(text, size, styles = {}, opt = {}) {
	var width$1 = size.width;
	var height$1 = size.height;
	var svgDocument = opt.svgDocument || V_default("svg").node;
	var textSpan = V_default("tspan").node;
	var textElement = V_default("text").attr(styles).append(textSpan).node;
	var textNode = document.createTextNode("");
	textElement.style.opacity = 0;
	textElement.style.display = "block";
	textSpan.style.display = "block";
	textSpan.appendChild(textNode);
	svgDocument.appendChild(textElement);
	if (!opt.svgDocument) document.body.appendChild(svgDocument);
	const preserveSpaces = opt.preserveSpaces;
	const space = " ";
	const separator = opt.separator || opt.separator === "" ? opt.separator : space;
	const separatorChar = typeof separator === "string" ? separator : space;
	var eol = opt.eol || "\n";
	var hyphen = opt.hyphen ? new RegExp(opt.hyphen) : /[^\w\d\u00C0-\u1FFF\u2800-\uFFFD]/;
	var maxLineCount = opt.maxLineCount;
	if (!isNumber(maxLineCount)) maxLineCount = Infinity;
	var words$1 = text.split(separator);
	var full = [];
	var lines = [];
	var p, h;
	var lineHeight;
	if (preserveSpaces) V_default(textSpan).attr("xml:space", "preserve");
	for (var i = 0, l = 0, len = words$1.length; i < len; i++) {
		var word = words$1[i];
		if (!word && !preserveSpaces) continue;
		if (typeof word !== "string") continue;
		var isEol = false;
		if (eol && word.indexOf(eol) >= 0) if (word.length > 1) {
			const eolWords = splitWordWithEOL(words$1[i], eol);
			words$1.splice(i, 1, ...eolWords);
			i--;
			len = words$1.length;
			continue;
		} else {
			if (preserveSpaces && typeof words$1[i - 1] === "string") {
				words$1.splice(i, NO_SPACE, "", NO_SPACE);
				len += 2;
				i--;
				continue;
			}
			lines[++l] = !preserveSpaces || typeof words$1[i + 1] === "string" ? "" : void 0;
			isEol = true;
		}
		if (!isEol) {
			let data$1;
			if (preserveSpaces) data$1 = lines[l] !== void 0 ? lines[l] + separatorChar + word : word;
			else data$1 = lines[l] ? lines[l] + separatorChar + word : word;
			textNode.data = data$1;
			if (textSpan.getComputedTextLength() <= width$1) {
				lines[l] = data$1;
				if (p || h) {
					full[l++] = true;
					p = 0;
					h = 0;
				}
			} else {
				if (!lines[l] || p) {
					var partition = !!p;
					p = word.length - 1;
					if (partition || !p) {
						if (!p) {
							if (!lines[l]) {
								lines = [];
								break;
							}
							words$1.splice(i, 2, word + words$1[i + 1]);
							len--;
							full[l++] = true;
							i--;
							continue;
						}
						words$1[i] = word.substring(0, p);
						const nextWord = words$1[i + 1];
						words$1[i + 1] = word.substring(p) + (nextWord === void 0 || nextWord === NO_SPACE ? "" : nextWord);
					} else {
						if (h) {
							words$1.splice(i, 2, words$1[i] + words$1[i + 1]);
							h = 0;
						} else {
							var hyphenIndex = word.search(hyphen);
							if (hyphenIndex > -1 && hyphenIndex !== word.length - 1 && hyphenIndex !== 0) {
								h = hyphenIndex + 1;
								p = 0;
							}
							words$1.splice(i, 1, word.substring(0, h || p), word.substring(h || p));
							len++;
						}
						if (l && !full[l - 1]) l--;
					}
					if (!preserveSpaces || lines[l] !== "") i--;
					continue;
				}
				l++;
				i--;
			}
		}
		var lastL = null;
		if (lines.length > maxLineCount) lastL = maxLineCount - 1;
		else if (height$1 !== void 0) {
			if (lineHeight === void 0 && textNode.data !== "") if (styles.lineHeight === "auto") lineHeight = getLineHeight({
				value: 1.5,
				unit: "em"
			}, textElement);
			else {
				const parsed = parseCssNumeric(styles.lineHeight, [
					"em",
					"px",
					""
				]);
				lineHeight = getLineHeight(parsed, textElement);
			}
			if (lineHeight * lines.length > height$1) lastL = Math.floor(height$1 / lineHeight) - 1;
		}
		if (lastL !== null) {
			lines.splice(lastL + 1);
			var ellipsis = opt.ellipsis;
			if (!ellipsis || lastL < 0) break;
			if (typeof ellipsis !== "string") ellipsis = "…";
			var lastLine = lines[lastL];
			if (!lastLine && !isEol) break;
			var k = lastLine.length;
			var lastLineWithOmission, lastChar;
			do {
				lastChar = lastLine[k];
				lastLineWithOmission = lastLine.substring(0, k);
				if (!lastChar) lastLineWithOmission += separatorChar;
				else if (lastChar.match(separator)) lastLineWithOmission += lastChar;
				lastLineWithOmission += ellipsis;
				textNode.data = lastLineWithOmission;
				if (textSpan.getComputedTextLength() <= width$1) {
					lines[lastL] = lastLineWithOmission;
					break;
				}
				k--;
			} while (k >= 0);
			break;
		}
	}
	if (opt.svgDocument) svgDocument.removeChild(textElement);
	else document.body.removeChild(svgDocument);
	return lines.join(eol);
};
const sortElements = function(elements, comparator) {
	elements = Dom_default(elements).toArray();
	var placements = elements.map(function(sortElement) {
		var parentNode = sortElement.parentNode;
		var nextSibling = parentNode.insertBefore(document.createTextNode(""), sortElement.nextSibling);
		return function() {
			if (parentNode === this) throw new Error("You can't sort elements if any one is a descendant of another.");
			parentNode.insertBefore(this, nextSibling);
			parentNode.removeChild(nextSibling);
		};
	});
	elements.sort(comparator);
	for (var i = 0; i < placements.length; i++) placements[i].call(elements[i]);
	return elements;
};
const normalizeSides = function(box) {
	if (Object(box) !== box) {
		var val = 0;
		if (isFinite(box)) val = +box;
		return {
			top: val,
			right: val,
			bottom: val,
			left: val
		};
	}
	var top$3, right$3, bottom$3, left$3;
	top$3 = right$3 = bottom$3 = left$3 = 0;
	if (isFinite(box.vertical)) top$3 = bottom$3 = +box.vertical;
	if (isFinite(box.horizontal)) right$3 = left$3 = +box.horizontal;
	if (isFinite(box.top)) top$3 = +box.top;
	if (isFinite(box.right)) right$3 = +box.right;
	if (isFinite(box.bottom)) bottom$3 = +box.bottom;
	if (isFinite(box.left)) left$3 = +box.left;
	return {
		top: top$3,
		right: right$3,
		bottom: bottom$3,
		left: left$3
	};
};
const timing = {
	linear: function(t) {
		return t;
	},
	quad: function(t) {
		return t * t;
	},
	cubic: function(t) {
		return t * t * t;
	},
	inout: function(t) {
		if (t <= 0) return 0;
		if (t >= 1) return 1;
		var t2 = t * t;
		var t3 = t2 * t;
		return 4 * (t < .5 ? t3 : 3 * (t - t2) + t3 - .75);
	},
	exponential: function(t) {
		return Math.pow(2, 10 * (t - 1));
	},
	bounce: function(t) {
		for (var a = 0, b = 1;; a += b, b /= 2) if (t >= (7 - 4 * a) / 11) {
			var q = (11 - 6 * a - 11 * t) / 4;
			return -q * q + b * b;
		}
	},
	reverse: function(f) {
		return function(t) {
			return 1 - f(1 - t);
		};
	},
	reflect: function(f) {
		return function(t) {
			return .5 * (t < .5 ? f(2 * t) : 2 - f(2 - 2 * t));
		};
	},
	clamp: function(f, n, x) {
		n = n || 0;
		x = x || 1;
		return function(t) {
			var r = f(t);
			return r < n ? n : r > x ? x : r;
		};
	},
	back: function(s) {
		if (!s) s = 1.70158;
		return function(t) {
			return t * t * ((s + 1) * t - s);
		};
	},
	elastic: function(x) {
		if (!x) x = 1.5;
		return function(t) {
			return Math.pow(2, 10 * (t - 1)) * Math.cos(20 * Math.PI * x / 3 * t);
		};
	}
};
const interpolate = {
	number: function(a, b) {
		var d = b - a;
		return function(t) {
			return a + d * t;
		};
	},
	object: function(a, b) {
		var s = Object.keys(a);
		return function(t) {
			var i, p;
			var r = {};
			for (i = s.length - 1; i != -1; i--) {
				p = s[i];
				r[p] = a[p] + (b[p] - a[p]) * t;
			}
			return r;
		};
	},
	hexColor: function(a, b) {
		var ca = parseInt(a.slice(1), 16);
		var cb$1 = parseInt(b.slice(1), 16);
		var ra = ca & 255;
		var rd = (cb$1 & 255) - ra;
		var ga = ca & 65280;
		var gd = (cb$1 & 65280) - ga;
		var ba = ca & 16711680;
		var bd = (cb$1 & 16711680) - ba;
		return function(t) {
			var r = ra + rd * t & 255;
			var g = ga + gd * t & 65280;
			var b$1 = ba + bd * t & 16711680;
			return "#" + (1 << 24 | r | g | b$1).toString(16).slice(1);
		};
	},
	unit: function(a, b) {
		var r = /(-?[0-9]*.[0-9]*)(px|em|cm|mm|in|pt|pc|%)/;
		var ma = r.exec(a);
		var mb = r.exec(b);
		var p = mb[1].indexOf(".");
		var f = p > 0 ? mb[1].length - p - 1 : 0;
		a = +ma[1];
		var d = +mb[1] - a;
		var u = ma[2];
		return function(t) {
			return (a + d * t).toFixed(f) + u;
		};
	}
};
const filter = {
	outline: function(args) {
		var tpl = "<filter><feFlood flood-color=\"${color}\" flood-opacity=\"${opacity}\" result=\"colored\"/><feMorphology in=\"SourceAlpha\" result=\"morphedOuter\" operator=\"dilate\" radius=\"${outerRadius}\" /><feMorphology in=\"SourceAlpha\" result=\"morphedInner\" operator=\"dilate\" radius=\"${innerRadius}\" /><feComposite result=\"morphedOuterColored\" in=\"colored\" in2=\"morphedOuter\" operator=\"in\"/><feComposite operator=\"xor\" in=\"morphedOuterColored\" in2=\"morphedInner\" result=\"outline\"/><feMerge><feMergeNode in=\"outline\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter>";
		var margin = Number.isFinite(args.margin) ? args.margin : 2;
		var width$1 = Number.isFinite(args.width) ? args.width : 1;
		return template(tpl)({
			color: args.color || "blue",
			opacity: Number.isFinite(args.opacity) ? args.opacity : 1,
			outerRadius: margin + width$1,
			innerRadius: margin
		});
	},
	highlight: function(args) {
		var tpl = "<filter><feFlood flood-color=\"${color}\" flood-opacity=\"${opacity}\" result=\"colored\"/><feMorphology result=\"morphed\" in=\"SourceGraphic\" operator=\"dilate\" radius=\"${width}\"/><feComposite result=\"composed\" in=\"colored\" in2=\"morphed\" operator=\"in\"/><feGaussianBlur result=\"blured\" in=\"composed\" stdDeviation=\"${blur}\"/><feBlend in=\"SourceGraphic\" in2=\"blured\" mode=\"normal\"/></filter>";
		return template(tpl)({
			color: args.color || "red",
			width: Number.isFinite(args.width) ? args.width : 1,
			blur: Number.isFinite(args.blur) ? args.blur : 0,
			opacity: Number.isFinite(args.opacity) ? args.opacity : 1
		});
	},
	blur: function(args) {
		var x = Number.isFinite(args.x) ? args.x : 2;
		return template("<filter><feGaussianBlur stdDeviation=\"${stdDeviation}\"/></filter>")({ stdDeviation: Number.isFinite(args.y) ? [x, args.y] : x });
	},
	dropShadow: function(args) {
		var tpl = "SVGFEDropShadowElement" in window ? "<filter><feDropShadow stdDeviation=\"${blur}\" dx=\"${dx}\" dy=\"${dy}\" flood-color=\"${color}\" flood-opacity=\"${opacity}\"/></filter>" : "<filter><feGaussianBlur in=\"SourceAlpha\" stdDeviation=\"${blur}\"/><feOffset dx=\"${dx}\" dy=\"${dy}\" result=\"offsetblur\"/><feFlood flood-color=\"${color}\"/><feComposite in2=\"offsetblur\" operator=\"in\"/><feComponentTransfer><feFuncA type=\"linear\" slope=\"${opacity}\"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter>";
		return template(tpl)({
			dx: args.dx || 0,
			dy: args.dy || 0,
			opacity: Number.isFinite(args.opacity) ? args.opacity : 1,
			color: args.color || "black",
			blur: Number.isFinite(args.blur) ? args.blur : 4
		});
	},
	grayscale: function(args) {
		var amount = Number.isFinite(args.amount) ? args.amount : 1;
		return template("<filter><feColorMatrix type=\"matrix\" values=\"${a} ${b} ${c} 0 0 ${d} ${e} ${f} 0 0 ${g} ${b} ${h} 0 0 0 0 0 1 0\"/></filter>")({
			a: .2126 + .7874 * (1 - amount),
			b: .7152 - .7152 * (1 - amount),
			c: .0722 - .0722 * (1 - amount),
			d: .2126 - .2126 * (1 - amount),
			e: .7152 + .2848 * (1 - amount),
			f: .0722 - .0722 * (1 - amount),
			g: .2126 - .2126 * (1 - amount),
			h: .0722 + .9278 * (1 - amount)
		});
	},
	sepia: function(args) {
		var amount = Number.isFinite(args.amount) ? args.amount : 1;
		return template("<filter><feColorMatrix type=\"matrix\" values=\"${a} ${b} ${c} 0 0 ${d} ${e} ${f} 0 0 ${g} ${h} ${i} 0 0 0 0 0 1 0\"/></filter>")({
			a: .393 + .607 * (1 - amount),
			b: .769 - .769 * (1 - amount),
			c: .189 - .189 * (1 - amount),
			d: .349 - .349 * (1 - amount),
			e: .686 + .314 * (1 - amount),
			f: .168 - .168 * (1 - amount),
			g: .272 - .272 * (1 - amount),
			h: .534 - .534 * (1 - amount),
			i: .131 + .869 * (1 - amount)
		});
	},
	saturate: function(args) {
		var amount = Number.isFinite(args.amount) ? args.amount : 1;
		return template("<filter><feColorMatrix type=\"saturate\" values=\"${amount}\"/></filter>")({ amount: 1 - amount });
	},
	hueRotate: function(args) {
		return template("<filter><feColorMatrix type=\"hueRotate\" values=\"${angle}\"/></filter>")({ angle: args.angle || 0 });
	},
	invert: function(args) {
		var amount = Number.isFinite(args.amount) ? args.amount : 1;
		return template("<filter><feComponentTransfer><feFuncR type=\"table\" tableValues=\"${amount} ${amount2}\"/><feFuncG type=\"table\" tableValues=\"${amount} ${amount2}\"/><feFuncB type=\"table\" tableValues=\"${amount} ${amount2}\"/></feComponentTransfer></filter>")({
			amount,
			amount2: 1 - amount
		});
	},
	brightness: function(args) {
		return template("<filter><feComponentTransfer><feFuncR type=\"linear\" slope=\"${amount}\"/><feFuncG type=\"linear\" slope=\"${amount}\"/><feFuncB type=\"linear\" slope=\"${amount}\"/></feComponentTransfer></filter>")({ amount: Number.isFinite(args.amount) ? args.amount : 1 });
	},
	contrast: function(args) {
		var amount = Number.isFinite(args.amount) ? args.amount : 1;
		return template("<filter><feComponentTransfer><feFuncR type=\"linear\" slope=\"${amount}\" intercept=\"${amount2}\"/><feFuncG type=\"linear\" slope=\"${amount}\" intercept=\"${amount2}\"/><feFuncB type=\"linear\" slope=\"${amount}\" intercept=\"${amount2}\"/></feComponentTransfer></filter>")({
			amount,
			amount2: .5 - amount / 2
		});
	}
};
const template = function(html$1) {
	var regex = /<%= ([^ ]+) %>|\$\{ ?([^{} ]+) ?\}|\{\{([^{} ]+)\}\}/g;
	return function(data$1) {
		data$1 = data$1 || {};
		return html$1.replace(regex, function(match) {
			var args = Array.from(arguments);
			var attr$1 = args.slice(1, 4).find(function(_attr) {
				return !!_attr;
			});
			var attrArray = attr$1.split(".");
			var value = data$1[attrArray.shift()];
			while (value !== void 0 && attrArray.length) value = value[attrArray.shift()];
			return value !== void 0 ? value : "";
		});
	};
};
function findDifference(obj, baseObj, currentDepth, maxDepth) {
	if (currentDepth === maxDepth) return {};
	const diff$1 = {};
	Object.keys(obj).forEach((key) => {
		const objValue = obj[key];
		const baseValue = baseObj[key];
		if (!Array.isArray(objValue) && !Array.isArray(baseValue) && isObject(objValue) && isObject(baseValue)) {
			const nestedDepth = currentDepth + 1;
			const nestedDiff = findDifference(objValue, baseValue, nestedDepth, maxDepth);
			if (Object.keys(nestedDiff).length > 0) diff$1[key] = nestedDiff;
			else if (currentDepth === 0 || nestedDepth === maxDepth) diff$1[key] = {};
		} else if (!isEqual(objValue, baseValue)) diff$1[key] = objValue;
	});
	return diff$1;
}
function objectDifference(object, base, opt) {
	const { maxDepth = Number.POSITIVE_INFINITY } = opt || {};
	return findDifference(object, base, 0, maxDepth);
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Events.mjs
var Events = {};
var eventSplitter = /\s+/;
var _listening;
var eventsApi = function(iteratee, events, name, callback, opts) {
	var i = 0, names;
	if (name && typeof name === "object") {
		if (callback !== void 0 && "context" in opts && opts.context === void 0) opts.context = callback;
		for (names = Object.keys(name); i < names.length; i++) events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
	} else if (name && eventSplitter.test(name)) for (names = name.split(eventSplitter); i < names.length; i++) events = iteratee(events, names[i], callback, opts);
	else events = iteratee(events, name, callback, opts);
	return events;
};
Events.on = function(name, callback, context) {
	this._events = eventsApi(onApi, this._events || {}, name, callback, {
		context,
		ctx: this,
		listening: _listening
	});
	if (_listening) {
		var listeners = this._listeners || (this._listeners = {});
		listeners[_listening.id] = _listening;
		_listening.interop = false;
	}
	return this;
};
Events.listenTo = function(obj, name, callback) {
	if (!obj) return this;
	var id = obj._listenId || (obj._listenId = uniqueId("l"));
	var listeningTo = this._listeningTo || (this._listeningTo = {});
	var listening = _listening = listeningTo[id];
	if (!listening) {
		this._listenId || (this._listenId = uniqueId("l"));
		listening = _listening = listeningTo[id] = new Listening(this, obj);
	}
	var error = tryCatchOn(obj, name, callback, this);
	_listening = void 0;
	if (error) throw error;
	if (listening.interop) listening.on(name, callback);
	return this;
};
var onApi = function(events, name, callback, options) {
	if (callback) {
		var handlers = events[name] || (events[name] = []);
		var context = options.context, ctx = options.ctx, listening = options.listening;
		if (listening) listening.count++;
		handlers.push({
			callback,
			context,
			ctx: context || ctx,
			listening
		});
	}
	return events;
};
var tryCatchOn = function(obj, name, callback, context) {
	try {
		obj.on(name, callback, context);
	} catch (e) {
		return e;
	}
};
Events.off = function(name, callback, context) {
	if (!this._events) return this;
	this._events = eventsApi(offApi, this._events, name, callback, {
		context,
		listeners: this._listeners
	});
	return this;
};
Events.stopListening = function(obj, name, callback) {
	var listeningTo = this._listeningTo;
	if (!listeningTo) return this;
	var ids = obj ? [obj._listenId] : Object.keys(listeningTo);
	for (var i = 0; i < ids.length; i++) {
		var listening = listeningTo[ids[i]];
		if (!listening) break;
		listening.obj.off(name, callback, this);
		if (listening.interop) listening.off(name, callback);
	}
	if (isEmpty(listeningTo)) this._listeningTo = void 0;
	return this;
};
var offApi = function(events, name, callback, options) {
	if (!events) return;
	var context = options.context, listeners = options.listeners;
	var i = 0, names;
	if (!name && !context && !callback) {
		if (listeners != null) for (names = Object.keys(listeners); i < names.length; i++) listeners[names[i]].cleanup();
		return;
	}
	names = name ? [name] : Object.keys(events);
	for (; i < names.length; i++) {
		name = names[i];
		var handlers = events[name];
		if (!handlers) break;
		var remaining = [];
		for (var j = 0; j < handlers.length; j++) {
			var handler = handlers[j];
			if (callback && callback !== handler.callback && callback !== handler.callback._callback || context && context !== handler.context) remaining.push(handler);
			else {
				var listening = handler.listening;
				if (listening) listening.off(name, callback);
			}
		}
		if (remaining.length) events[name] = remaining;
		else delete events[name];
	}
	return events;
};
Events.once = function(name, callback, context) {
	var events = eventsApi(onceMap, {}, name, callback, this.off.bind(this));
	if (typeof name === "string" && context == null) callback = void 0;
	return this.on(events, callback, context);
};
Events.listenToOnce = function(obj, name, callback) {
	var events = eventsApi(onceMap, {}, name, callback, this.stopListening.bind(this, obj));
	return this.listenTo(obj, events);
};
var onceMap = function(map, name, callback, offer) {
	if (callback) {
		var once = map[name] = onceInvoke(function() {
			offer(name, once);
			callback.apply(this, arguments);
		});
		once._callback = callback;
	}
	return map;
};
var onceInvoke = function(func) {
	var result$1;
	if (typeof func != "function") throw new TypeError("Expected a function");
	var n = 2;
	return function() {
		if (--n > 0) result$1 = func.apply(this, arguments);
		if (n <= 1) func = void 0;
		return result$1;
	};
};
Events.trigger = function(name) {
	if (!this._events) return this;
	var length$1 = Math.max(0, arguments.length - 1);
	var args = Array(length$1);
	for (var i = 0; i < length$1; i++) args[i] = arguments[i + 1];
	eventsApi(triggerApi, this._events, name, void 0, args);
	return this;
};
var triggerApi = function(objEvents, name, callback, args) {
	if (objEvents) {
		var events = objEvents[name];
		var allEvents = objEvents.all;
		if (events && allEvents) allEvents = allEvents.slice();
		if (events) triggerEvents(events, args);
		if (allEvents) triggerEvents(allEvents, [name].concat(args));
	}
	return objEvents;
};
var triggerEvents = function(events, args) {
	var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
	switch (args.length) {
		case 0:
			while (++i < l) (ev = events[i]).callback.call(ev.ctx);
			return;
		case 1:
			while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1);
			return;
		case 2:
			while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2);
			return;
		case 3:
			while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
			return;
		default:
			while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
			return;
	}
};
var Listening = function(listener, obj) {
	this.id = listener._listenId;
	this.listener = listener;
	this.obj = obj;
	this.interop = true;
	this.count = 0;
	this._events = void 0;
};
Listening.prototype.on = Events.on;
Listening.prototype.off = function(name, callback) {
	var cleanup;
	if (this.interop) {
		this._events = eventsApi(offApi, this._events, name, callback, {
			context: void 0,
			listeners: void 0
		});
		cleanup = !this._events;
	} else {
		this.count--;
		cleanup = this.count === 0;
	}
	if (cleanup) this.cleanup();
};
Listening.prototype.cleanup = function() {
	delete this.listener._listeningTo[this.obj._listenId];
	if (!this.interop) delete this.obj._listeners[this.id];
};
Events.bind = Events.on;
Events.unbind = Events.off;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/mvcUtils.mjs
var extend = function(protoProps, staticProps) {
	var parent$1 = this;
	var child;
	if (protoProps && has(protoProps, "constructor")) child = protoProps.constructor;
	else child = function() {
		return parent$1.apply(this, arguments);
	};
	assign(child, parent$1, staticProps);
	child.prototype = Object.assign(Object.create(parent$1.prototype), protoProps);
	child.prototype.constructor = child;
	child.__super__ = parent$1.prototype;
	return child;
};
var addMethod = function(base, length$1, method, attribute) {
	switch (length$1) {
		case 1: return function() {
			return base[method](this[attribute]);
		};
		case 2: return function(value) {
			return base[method](this[attribute], value);
		};
		case 3: return function(iteratee, context) {
			return base[method](this[attribute], cb(iteratee, this), context);
		};
		case 4: return function(iteratee, defaultVal, context) {
			return base[method](this[attribute], cb(iteratee, this), defaultVal, context);
		};
		default: return function() {
			var args = Array.prototype.slice.call(arguments);
			args.unshift(this[attribute]);
			return base[method].apply(base, args);
		};
	}
};
var addMethodsUtil = function(Class, base, methods$1, attribute) {
	forIn(methods$1, function(length$1, method) {
		if (base[method]) Class.prototype[method] = addMethod(base, length$1, method, attribute);
	});
};
var cb = function(iteratee, instance) {
	if (isFunction(iteratee)) return iteratee;
	if (isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
	if (isString(iteratee)) return function(model) {
		return model.get(iteratee);
	};
	return iteratee;
};
var modelMatcher = function(attrs) {
	var matcher = matches(attrs);
	return function(model) {
		return matcher(model.attributes);
	};
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Model.mjs
var Model = function(attributes$1, options) {
	var attrs = attributes$1 || {};
	options || (options = {});
	this.preinitialize.apply(this, arguments);
	this.cid = uniqueId(this.cidPrefix);
	this.attributes = {};
	if (options.collection) this.collection = options.collection;
	var attributeDefaults = result(this, "defaults");
	attrs = defaults(assign({}, attributeDefaults, attrs), attributeDefaults);
	this.set(attrs, options);
	this.changed = {};
	this.initialize.apply(this, arguments);
};
assign(Model.prototype, Events, {
	changed: null,
	validationError: null,
	idAttribute: "id",
	cidPrefix: "c",
	preinitialize: function() {},
	initialize: function() {},
	toJSON: function(options) {
		return clone(this.attributes);
	},
	get: function(attr$1) {
		return this.attributes[attr$1];
	},
	has: function(attr$1) {
		return this.get(attr$1) != null;
	},
	set: function(key, val, options) {
		if (key == null) return this;
		var attrs;
		if (typeof key === "object") {
			attrs = key;
			options = val;
		} else (attrs = {})[key] = val;
		options || (options = {});
		if (!this._validate(attrs, options)) return false;
		var unset$1 = options.unset;
		var silent = options.silent;
		var changes = [];
		var changing = this._changing;
		this._changing = true;
		if (!changing) {
			this._previousAttributes = clone(this.attributes);
			this.changed = {};
		}
		var current = this.attributes;
		var changed = this.changed;
		var prev = this._previousAttributes;
		for (var attr$1 in attrs) {
			val = attrs[attr$1];
			if (!isEqual(current[attr$1], val)) changes.push(attr$1);
			if (!isEqual(prev[attr$1], val)) changed[attr$1] = val;
			else delete changed[attr$1];
			unset$1 ? delete current[attr$1] : current[attr$1] = val;
		}
		if (this.idAttribute in attrs) {
			var prevId = this.id;
			this.id = this.get(this.idAttribute);
			this.trigger("changeId", this, prevId, options);
		}
		if (!silent) {
			if (changes.length) this._pending = options;
			for (var i = 0; i < changes.length; i++) this.trigger("change:" + changes[i], this, current[changes[i]], options);
		}
		if (changing) return this;
		if (!silent) while (this._pending) {
			options = this._pending;
			this._pending = false;
			this.trigger("change", this, options);
		}
		this._pending = false;
		this._changing = false;
		return this;
	},
	unset: function(attr$1, options) {
		return this.set(attr$1, void 0, assign({}, options, { unset: true }));
	},
	clear: function(options) {
		var attrs = {};
		for (var key in this.attributes) attrs[key] = void 0;
		return this.set(attrs, assign({}, options, { unset: true }));
	},
	hasChanged: function(attr$1) {
		if (attr$1 == null) return !isEmpty(this.changed);
		return has(this.changed, attr$1);
	},
	changedAttributes: function(diff$1) {
		if (!diff$1) return this.hasChanged() ? clone(this.changed) : false;
		var old = this._changing ? this._previousAttributes : this.attributes;
		var changed = {};
		var hasChanged;
		for (var attr$1 in diff$1) {
			var val = diff$1[attr$1];
			if (isEqual(old[attr$1], val)) continue;
			changed[attr$1] = val;
			hasChanged = true;
		}
		return hasChanged ? changed : false;
	},
	previous: function(attr$1) {
		if (attr$1 == null || !this._previousAttributes) return null;
		return this._previousAttributes[attr$1];
	},
	previousAttributes: function() {
		return clone(this._previousAttributes);
	},
	clone: function() {
		return new this.constructor(this.attributes);
	},
	isValid: function(options) {
		return this._validate({}, assign({}, options, { validate: true }));
	},
	_validate: function(attrs, options) {
		if (!options.validate || !this.validate) return true;
		attrs = assign({}, this.attributes, attrs);
		var error = this.validationError = this.validate(attrs, options) || null;
		if (!error) return true;
		this.trigger("invalid", this, error, assign(options, { validationError: error }));
		return false;
	}
});
Model.extend = extend;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/util/cloneCells.mjs
function cloneCells(cells) {
	cells = uniq(cells);
	const cloneMap = toArray(cells).reduce(function(map, cell) {
		map[cell.id] = cell.clone();
		return map;
	}, {});
	toArray(cells).forEach(function(cell) {
		const clone$2 = cloneMap[cell.id];
		if (clone$2.isLink()) {
			const source = clone$2.source();
			const target = clone$2.target();
			if (source.id && cloneMap[source.id]) clone$2.prop("source/id", cloneMap[source.id].id);
			if (target.id && cloneMap[target.id]) clone$2.prop("target/id", cloneMap[target.id].id);
		}
		const parent$1 = cell.get("parent");
		if (parent$1 && cloneMap[parent$1]) clone$2.set("parent", cloneMap[parent$1].id);
		const embeds = toArray(cell.get("embeds")).reduce(function(newEmbeds, embed) {
			if (cloneMap[embed]) newEmbeds.push(cloneMap[embed].id);
			return newEmbeds;
		}, []);
		if (!isEmpty(embeds)) clone$2.set("embeds", embeds);
	});
	return cloneMap;
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/attributes/props.mjs
const validPropertiesList = [
	"checked",
	"selected",
	"disabled",
	"readOnly",
	"contentEditable",
	"value",
	"indeterminate"
];
const validProperties = validPropertiesList.reduce((acc, key) => {
	acc[key] = true;
	return acc;
}, {});
const props$1 = {
	qualify: function(properties) {
		return isPlainObject(properties);
	},
	set: function(properties, _, node) {
		Object.keys(properties).forEach(function(key) {
			if (validProperties[key] && key in node) {
				const value = properties[key];
				if (node.tagName === "SELECT" && Array.isArray(value)) Array.from(node.options).forEach(function(option, index) {
					option.selected = value.includes(option.value);
				});
				else node[key] = value;
			}
		});
	}
};
var props_default = props$1;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/attributes/legacy.mjs
function positionWrapper(axis, dimension, origin) {
	return function(value, refBBox) {
		var valuePercentage = isPercentage(value);
		value = parseFloat(value);
		if (valuePercentage) value /= 100;
		var delta;
		if (isFinite(value)) {
			var refOrigin = refBBox[origin]();
			if (valuePercentage || value > 0 && value < 1) delta = refOrigin[axis] + refBBox[dimension] * value;
			else delta = refOrigin[axis] + value;
		}
		var point$1 = Point();
		point$1[axis] = delta || 0;
		return point$1;
	};
}
function setWrapper(attrName, dimension) {
	return function(value, refBBox) {
		var isValuePercentage = isPercentage(value);
		value = parseFloat(value);
		if (isValuePercentage) value /= 100;
		var attrs = {};
		if (isFinite(value)) {
			var attrValue = isValuePercentage || value >= 0 && value <= 1 ? value * refBBox[dimension] : Math.max(value + refBBox[dimension], 0);
			attrs[attrName] = attrValue;
		}
		return attrs;
	};
}
const legacyAttributesNS = {
	"ref-x": { position: positionWrapper("x", "width", "origin") },
	"ref-y": { position: positionWrapper("y", "height", "origin") },
	"ref-dx": { position: positionWrapper("x", "width", "corner") },
	"ref-dy": { position: positionWrapper("y", "height", "corner") },
	"ref-width": { set: setWrapper("width", "width") },
	"ref-height": { set: setWrapper("height", "height") },
	"ref-rx": { set: setWrapper("rx", "width") },
	"ref-ry": { set: setWrapper("ry", "height") },
	"ref-cx": { set: setWrapper("cx", "width") },
	"ref-cy": { set: setWrapper("cy", "height") },
	"ref-r-inscribed": { set: (function(attrName) {
		var widthFn = setWrapper(attrName, "width");
		var heightFn = setWrapper(attrName, "height");
		return function(value, refBBox) {
			var fn$1 = refBBox.height > refBBox.width ? widthFn : heightFn;
			return fn$1(value, refBBox);
		};
	})("r") },
	"ref-r-circumscribed": { set: function(value, refBBox) {
		var isValuePercentage = isPercentage(value);
		value = parseFloat(value);
		if (isValuePercentage) value /= 100;
		var diagonalLength = Math.sqrt(refBBox.height * refBBox.height + refBBox.width * refBBox.width);
		var rValue;
		if (isFinite(value)) if (isValuePercentage || value >= 0 && value <= 1) rValue = value * diagonalLength;
		else rValue = Math.max(value + diagonalLength, 0);
		return { r: rValue };
	} }
};
legacyAttributesNS["refX"] = legacyAttributesNS["ref-x"];
legacyAttributesNS["refY"] = legacyAttributesNS["ref-y"];
legacyAttributesNS["ref-x2"] = legacyAttributesNS["ref-x"];
legacyAttributesNS["ref-y2"] = legacyAttributesNS["ref-y"];
legacyAttributesNS["ref-width2"] = legacyAttributesNS["ref-width"];
legacyAttributesNS["ref-height2"] = legacyAttributesNS["ref-height"];
legacyAttributesNS["ref-r"] = legacyAttributesNS["ref-r-inscribed"];
var legacy_default = legacyAttributesNS;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/util/calc.mjs
const props = {
	x: "x",
	y: "y",
	width: "w",
	height: "h",
	minimum: "s",
	maximum: "l",
	diagonal: "d"
};
const propsList = Object.keys(props).map((key) => props[key]).join("");
const numberPattern = "[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?";
const findSpacesRegex = /\s/g;
const parseFormulaRegExp = new RegExp(`^(${numberPattern}\\*)?([${propsList}])(/${numberPattern})?([-+]{1,2}${numberPattern})?$`, "g");
function throwInvalid(expression) {
	throw new Error(`Invalid calc() expression: ${expression}`);
}
function evalCalcFormula(formula, rect$1) {
	const match = parseFormulaRegExp.exec(formula.replace(findSpacesRegex, ""));
	if (!match) throwInvalid(formula);
	parseFormulaRegExp.lastIndex = 0;
	const [, multiply, property$1, divide, add] = match;
	const { x, y, width: width$1, height: height$1 } = rect$1;
	let value = 0;
	switch (property$1) {
		case props.width:
			value = width$1;
			break;
		case props.height:
			value = height$1;
			break;
		case props.x:
			value = x;
			break;
		case props.y:
			value = y;
			break;
		case props.minimum:
			value = Math.min(height$1, width$1);
			break;
		case props.maximum:
			value = Math.max(height$1, width$1);
			break;
		case props.diagonal:
			value = Math.sqrt(height$1 * height$1 + width$1 * width$1);
			break;
	}
	if (multiply) value *= parseFloat(multiply);
	if (divide) value /= parseFloat(divide.slice(1));
	if (add) value += evalAddExpression(add);
	return value;
}
function evalAddExpression(addExpression) {
	if (!addExpression) return 0;
	const [sign] = addExpression;
	switch (sign) {
		case "+": return parseFloat(addExpression.substr(1));
		case "-": return -parseFloat(addExpression.substr(1));
	}
	return parseFloat(addExpression);
}
function isCalcExpression(value) {
	return typeof value === "string" && value.includes("calc");
}
const calcStart = "calc(";
const calcStartOffset = 5;
function evalCalcExpression(expression, rect$1) {
	let value = expression;
	let startSearchIndex = 0;
	do {
		let calcIndex = value.indexOf(calcStart, startSearchIndex);
		if (calcIndex === -1) return value;
		let calcEndIndex = calcIndex + calcStartOffset;
		let brackets = 1;
		findClosingBracket: do {
			switch (value[calcEndIndex]) {
				case "(":
					brackets++;
					break;
				case ")":
					brackets--;
					if (brackets === 0) break findClosingBracket;
					break;
				case void 0: throwInvalid(value);
			}
			calcEndIndex++;
		} while (true);
		let expression$1 = value.slice(calcIndex + calcStartOffset, calcEndIndex);
		if (isCalcExpression(expression$1)) expression$1 = evalCalcExpression(expression$1, rect$1);
		const calcValue = String(evalCalcFormula(expression$1, rect$1));
		value = value.slice(0, calcIndex) + calcValue + value.slice(calcEndIndex + 1);
		startSearchIndex = calcIndex + calcValue.length;
	} while (true);
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/attributes/text.mjs
function isTextInUse(_value, _node, attrs) {
	return attrs.text !== void 0;
}
const FONT_ATTRIBUTES = [
	"font-weight",
	"font-family",
	"font-size",
	"letter-spacing",
	"text-transform"
];
const textAttributesNS = {
	"line-height": { qualify: isTextInUse },
	"text-vertical-anchor": { qualify: isTextInUse },
	"text-path": { qualify: isTextInUse },
	"annotations": { qualify: isTextInUse },
	"eol": { qualify: isTextInUse },
	"display-empty": { qualify: isTextInUse },
	"text": {
		qualify: function(_text, _node, attrs) {
			const textWrap = attrs["text-wrap"];
			return !textWrap || !isPlainObject(textWrap);
		},
		unset: function(node) {
			node.textContent = "";
		},
		set: function(text, refBBox, node, attrs) {
			const cacheName = "joint-text";
			const cache = Dom_default.data.get(node, cacheName);
			const lineHeight = attrs["line-height"];
			const textVerticalAnchor = attrs["text-vertical-anchor"];
			const displayEmpty = attrs["display-empty"];
			const fontSize = attrs["font-size"];
			const annotations = attrs.annotations;
			const eol = attrs.eol;
			const x = attrs.x;
			let textPath = attrs["text-path"];
			const textHash = JSON.stringify([
				text,
				lineHeight,
				annotations,
				textVerticalAnchor,
				eol,
				displayEmpty,
				textPath,
				x,
				fontSize
			]);
			if (cache === void 0 || cache !== textHash) {
				if (fontSize) node.setAttribute("font-size", fontSize);
				if (isObject(textPath)) {
					const pathSelector = textPath.selector;
					if (typeof pathSelector === "string") {
						const pathNode = this.findNode(pathSelector);
						if (pathNode instanceof SVGPathElement) textPath = assign({ "xlink:href": "#" + pathNode.id }, textPath);
					}
				}
				V_default(node).text("" + text, {
					lineHeight,
					annotations,
					textPath,
					x,
					textVerticalAnchor,
					eol,
					displayEmpty
				});
				Dom_default.data.set(node, cacheName, textHash);
			}
		}
	},
	"text-wrap": {
		qualify: isPlainObject,
		set: function(value, refBBox, node, attrs) {
			var size = {};
			var width$1 = value.width || 0;
			if (isPercentage(width$1)) size.width = refBBox.width * parseFloat(width$1) / 100;
			else if (isCalcExpression(width$1)) size.width = Number(evalCalcExpression(width$1, refBBox));
			else if (value.width === null) size.width = Infinity;
			else if (width$1 <= 0) size.width = refBBox.width + width$1;
			else size.width = width$1;
			var height$1 = value.height || 0;
			if (isPercentage(height$1)) size.height = refBBox.height * parseFloat(height$1) / 100;
			else if (isCalcExpression(height$1)) size.height = Number(evalCalcExpression(height$1, refBBox));
			else if (value.height === null) {} else if (height$1 <= 0) size.height = refBBox.height + height$1;
			else size.height = height$1;
			var wrappedText;
			var text = value.text;
			if (text === void 0) text = attrs.text;
			if (text !== void 0) {
				const breakTextFn = value.breakText || breakText;
				const computedStyles = getComputedStyle(node);
				const wrapFontAttributes = {};
				for (let i = 0; i < FONT_ATTRIBUTES.length; i++) {
					const name = FONT_ATTRIBUTES[i];
					if (name in attrs) node.setAttribute(name, attrs[name]);
					wrapFontAttributes[name] = computedStyles[name];
				}
				wrapFontAttributes.lineHeight = attrs["line-height"];
				wrappedText = breakTextFn("" + text, size, wrapFontAttributes, {
					svgDocument: this.paper.svg,
					ellipsis: value.ellipsis,
					hyphen: value.hyphen,
					separator: value.separator,
					maxLineCount: value.maxLineCount,
					preserveSpaces: value.preserveSpaces
				});
			} else wrappedText = "";
			textAttributesNS.text.set.call(this, wrappedText, refBBox, node, attrs);
		},
		FONT_ATTRIBUTES
	},
	"title": {
		qualify: function(title, node) {
			return node instanceof SVGElement;
		},
		unset: function(node) {
			Dom_default.data.remove(node, "joint-title");
			const titleNode = node.firstElementChild;
			if (titleNode) titleNode.remove();
		},
		set: function(title, refBBox, node) {
			var cacheName = "joint-title";
			var cache = Dom_default.data.get(node, cacheName);
			if (cache === void 0 || cache !== title) {
				Dom_default.data.set(node, cacheName, title);
				if (node.tagName === "title") {
					node.textContent = title;
					return;
				}
				var firstChild = node.firstElementChild;
				if (firstChild && firstChild.tagName === "title") firstChild.textContent = title;
				else {
					var titleNode = document.createElementNS(node.namespaceURI, "title");
					titleNode.textContent = title;
					node.insertBefore(titleNode, firstChild);
				}
			}
		}
	}
};
var text_default = textAttributesNS;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/attributes/connection.mjs
function atConnectionWrapper(method, opt) {
	var zeroVector = new Point(1, 0);
	return function(value) {
		var p, angle;
		var tangent = this[method](value);
		if (tangent) {
			angle = opt.rotate ? tangent.vector().vectorAngle(zeroVector) : 0;
			p = tangent.start;
		} else {
			p = this.path.start;
			angle = 0;
		}
		if (angle === 0) return { transform: "translate(" + p.x + "," + p.y + ")" };
		return { transform: "translate(" + p.x + "," + p.y + ") rotate(" + angle + ")" };
	};
}
function isLinkView() {
	return this.model.isLink();
}
const connectionAttributesNS = {
	"connection": {
		qualify: isLinkView,
		unset: "d",
		set: function({ stubs = 0 }) {
			let d;
			if (isFinite(stubs) && stubs !== 0) {
				let offset$1;
				if (stubs < 0) offset$1 = (this.getConnectionLength() + stubs) / 2;
				else offset$1 = stubs;
				const path = this.getConnection();
				const segmentSubdivisions = this.getConnectionSubdivisions();
				const sourceParts = path.divideAtLength(offset$1, { segmentSubdivisions });
				const targetParts = path.divideAtLength(-offset$1, { segmentSubdivisions });
				if (sourceParts && targetParts) d = `${sourceParts[0].serialize()} ${targetParts[1].serialize()}`;
			}
			return { d: d || this.getSerializedConnection() };
		}
	},
	"at-connection-length-keep-gradient": {
		qualify: isLinkView,
		unset: "transform",
		set: atConnectionWrapper("getTangentAtLength", { rotate: true })
	},
	"at-connection-length-ignore-gradient": {
		qualify: isLinkView,
		unset: "transform",
		set: atConnectionWrapper("getTangentAtLength", { rotate: false })
	},
	"at-connection-ratio-keep-gradient": {
		qualify: isLinkView,
		unset: "transform",
		set: atConnectionWrapper("getTangentAtRatio", { rotate: true })
	},
	"at-connection-ratio-ignore-gradient": {
		qualify: isLinkView,
		unset: "transform",
		set: atConnectionWrapper("getTangentAtRatio", { rotate: false })
	}
};
connectionAttributesNS["at-connection-length"] = connectionAttributesNS["at-connection-length-keep-gradient"];
connectionAttributesNS["at-connection-ratio"] = connectionAttributesNS["at-connection-ratio-keep-gradient"];
var connection_default = connectionAttributesNS;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/attributes/shape.mjs
function shapeWrapper(shapeConstructor, opt) {
	var cacheName = "joint-shape";
	var resetOffset = opt && opt.resetOffset;
	return function(value, refBBox, node) {
		var cache = Dom_default.data.get(node, cacheName);
		if (!cache || cache.value !== value) {
			var cachedShape = shapeConstructor(value);
			cache = {
				value,
				shape: cachedShape,
				shapeBBox: cachedShape.bbox()
			};
			Dom_default.data.set(node, cacheName, cache);
		}
		var shape = cache.shape.clone();
		var shapeBBox = cache.shapeBBox.clone();
		var shapeOrigin = shapeBBox.origin();
		var refOrigin = refBBox.origin();
		shapeBBox.x = refOrigin.x;
		shapeBBox.y = refOrigin.y;
		var fitScale = refBBox.maxRectScaleToFit(shapeBBox, refOrigin);
		var sx = shapeBBox.width === 0 || refBBox.width === 0 ? 1 : fitScale.sx;
		var sy = shapeBBox.height === 0 || refBBox.height === 0 ? 1 : fitScale.sy;
		shape.scale(sx, sy, shapeOrigin);
		if (resetOffset) shape.translate(-shapeOrigin.x, -shapeOrigin.y);
		return shape;
	};
}
function dWrapper(opt) {
	function pathConstructor(value) {
		return new Path(V_default.normalizePathData(value));
	}
	var shape = shapeWrapper(pathConstructor, opt);
	return function(value, refBBox, node) {
		var path = shape(value, refBBox, node);
		return { d: path.serialize() };
	};
}
function pointsWrapper(opt) {
	var shape = shapeWrapper(Polyline, opt);
	return function(value, refBBox, node) {
		var polyline = shape(value, refBBox, node);
		return { points: polyline.serialize() };
	};
}
const shapeAttributesNS = {
	"ref-d-reset-offset": {
		unset: "d",
		set: dWrapper({ resetOffset: true })
	},
	"ref-d-keep-offset": {
		unset: "d",
		set: dWrapper({ resetOffset: false })
	},
	"ref-points-reset-offset": {
		unset: "points",
		set: pointsWrapper({ resetOffset: true })
	},
	"ref-points-keep-offset": {
		unset: "points",
		set: pointsWrapper({ resetOffset: false })
	}
};
shapeAttributesNS["ref-d"] = shapeAttributesNS["ref-d-reset-offset"];
shapeAttributesNS["ref-points"] = shapeAttributesNS["ref-points-reset-offset"];
var shape_default = shapeAttributesNS;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/attributes/defs.mjs
function contextMarker(context) {
	var marker = {};
	var stroke$2 = context.stroke;
	if (typeof stroke$2 === "string") {
		marker["stroke"] = stroke$2;
		marker["fill"] = stroke$2;
	}
	var strokeOpacity = context["stroke-opacity"];
	if (strokeOpacity === void 0) strokeOpacity = context.opacity;
	if (strokeOpacity !== void 0) {
		marker["stroke-opacity"] = strokeOpacity;
		marker["fill-opacity"] = strokeOpacity;
	}
	return marker;
}
function setPaintURL(def) {
	const { paper } = this;
	const url = def.type === "pattern" ? paper.definePattern(def) : paper.defineGradient(def);
	return `url(#${url})`;
}
const defsAttributesNS = {
	"source-marker": {
		qualify: isPlainObject,
		unset: "marker-start",
		set: function(marker, refBBox, node, attrs) {
			marker = assign(contextMarker(attrs), marker);
			return { "marker-start": "url(#" + this.paper.defineMarker(marker) + ")" };
		}
	},
	"target-marker": {
		qualify: isPlainObject,
		unset: "marker-end",
		set: function(marker, refBBox, node, attrs) {
			marker = assign(contextMarker(attrs), { "transform": "rotate(180)" }, marker);
			return { "marker-end": "url(#" + this.paper.defineMarker(marker) + ")" };
		}
	},
	"vertex-marker": {
		qualify: isPlainObject,
		unset: "marker-mid",
		set: function(marker, refBBox, node, attrs) {
			marker = assign(contextMarker(attrs), marker);
			return { "marker-mid": "url(#" + this.paper.defineMarker(marker) + ")" };
		}
	},
	"fill": {
		qualify: isPlainObject,
		set: setPaintURL
	},
	"stroke": {
		qualify: isPlainObject,
		set: setPaintURL
	},
	"filter": {
		qualify: isPlainObject,
		set: function(filter$1) {
			return "url(#" + this.paper.defineFilter(filter$1) + ")";
		}
	}
};
var defs_default = defsAttributesNS;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/attributes/offset.mjs
function offsetWrapper(axis, dimension, corner) {
	return function(value, nodeBBox) {
		var delta;
		if (value === "middle") delta = nodeBBox[dimension] / 2;
		else if (value === corner) delta = nodeBBox[dimension];
		else if (isFinite(value)) delta = value > -1 && value < 1 ? -nodeBBox[dimension] * value : -value;
		else if (isPercentage(value)) delta = nodeBBox[dimension] * parseFloat(value) / 100;
		else delta = 0;
		var point$1 = new Point();
		point$1[axis] = -(nodeBBox[axis] + delta);
		return point$1;
	};
}
const offsetAttributesNS = {
	"x-alignment": { offset: offsetWrapper("x", "width", "right") },
	"y-alignment": { offset: offsetWrapper("y", "height", "bottom") },
	"reset-offset": { offset: function(val, nodeBBox) {
		return val ? {
			x: -nodeBBox.x,
			y: -nodeBBox.y
		} : {
			x: 0,
			y: 0
		};
	} }
};
var offset_default = offsetAttributesNS;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/attributes/index.mjs
function setIfChangedWrapper(attribute) {
	return function setIfChanged(value, _, node) {
		const vel = V_default(node);
		if (vel.attr(attribute) === value) return;
		vel.attr(attribute, value);
	};
}
const attributesNS = {
	"ref": {},
	"href": { set: setIfChangedWrapper("href") },
	"xlink:href": { set: setIfChangedWrapper("xlink:href") },
	"port": { set: function(port) {
		return port === null || port.id === void 0 ? port : port.id;
	} },
	"style": {
		qualify: isPlainObject,
		set: function(styles, refBBox, node) {
			Dom_default(node).css(styles);
		}
	},
	"html": {
		unset: function(node) {
			Dom_default(node).empty();
		},
		set: function(html$1, refBBox, node) {
			Dom_default(node).html(html$1 + "");
		}
	},
	props: props_default
};
assign(attributesNS, legacy_default);
assign(attributesNS, text_default);
assign(attributesNS, connection_default);
assign(attributesNS, shape_default);
assign(attributesNS, defs_default);
assign(attributesNS, offset_default);
const attributes = attributesNS;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/Cell.mjs
const attributesMerger = function(a, b) {
	if (Array.isArray(a)) return b;
};
function removeEmptyAttributes(obj) {
	for (const key in obj) {
		const objValue = obj[key];
		const isRealObject = isObject(objValue) && !Array.isArray(objValue);
		if (!isRealObject) continue;
		if (isEmpty(objValue)) delete obj[key];
	}
}
const Cell = Model.extend({
	constructor: function(attributes$1, options) {
		var defaults$1;
		var attrs = attributes$1 || {};
		if (typeof this.preinitialize === "function") this.preinitialize.apply(this, arguments);
		this.cid = uniqueId("c");
		this.attributes = {};
		if (options && options.collection) this.collection = options.collection;
		if (options && options.parse) attrs = this.parse(attrs, options) || {};
		if (defaults$1 = result(this, "defaults")) {
			const customizer = options && options.mergeArrays === true ? false : attributesMerger;
			attrs = merge({}, defaults$1, attrs, customizer);
		}
		this.set(attrs, options);
		this.changed = {};
		this.initialize.apply(this, arguments);
	},
	translate: function(dx, dy, opt) {
		throw new Error("Must define a translate() method.");
	},
	toJSON: function(opt) {
		const { ignoreDefaults, ignoreEmptyAttributes = false } = opt || {};
		const defaults$1 = result(this.constructor.prototype, "defaults");
		if (ignoreDefaults === false) {
			const finalAttributes$1 = cloneDeep(this.attributes);
			if (!ignoreEmptyAttributes) return finalAttributes$1;
			removeEmptyAttributes(finalAttributes$1);
			return finalAttributes$1;
		}
		let defaultAttributes = {};
		let attributes$1 = cloneDeep(this.attributes);
		if (ignoreDefaults === true) defaultAttributes = defaults$1;
		else {
			const differentiateKeys = Array.isArray(ignoreDefaults) ? ignoreDefaults : ["attrs"];
			differentiateKeys.forEach((key) => {
				defaultAttributes[key] = defaults$1[key] || {};
			});
		}
		const finalAttributes = objectDifference(attributes$1, omit(defaultAttributes, "id", "type"), { maxDepth: 4 });
		if (ignoreEmptyAttributes) removeEmptyAttributes(finalAttributes);
		return finalAttributes;
	},
	initialize: function(options) {
		const idAttribute = this.getIdAttribute();
		if (!options || options[idAttribute] === void 0) this.set(idAttribute, this.generateId(), { silent: true });
		this._transitionIds = {};
		this._scheduledTransitionIds = {};
		this.processPorts();
		this.on("change:attrs", this.processPorts, this);
	},
	getIdAttribute: function() {
		return this.idAttribute || "id";
	},
	generateId: function() {
		return uuid();
	},
	processPorts: function() {
		var previousPorts = this.ports;
		var ports = {};
		forIn(this.get("attrs"), function(attrs, selector) {
			if (attrs && attrs.port) if (attrs.port.id !== void 0) ports[attrs.port.id] = attrs.port;
			else ports[attrs.port] = { id: attrs.port };
		});
		var removedPorts = {};
		forIn(previousPorts, function(port, id) {
			if (!ports[id]) removedPorts[id] = true;
		});
		if (this.graph && !isEmpty(removedPorts)) {
			var inboundLinks = this.graph.getConnectedLinks(this, { inbound: true });
			inboundLinks.forEach(function(link) {
				if (removedPorts[link.get("target").port]) link.remove();
			});
			var outboundLinks = this.graph.getConnectedLinks(this, { outbound: true });
			outboundLinks.forEach(function(link) {
				if (removedPorts[link.get("source").port]) link.remove();
			});
		}
		this.ports = ports;
	},
	remove: function(opt = {}) {
		const { graph, collection } = this;
		if (!graph) {
			if (collection) collection.remove(this, opt);
			return this;
		}
		graph.startBatch("remove");
		const parentCell = this.getParentCell();
		if (parentCell) parentCell.unembed(this, opt);
		const embeddedCells = this.getEmbeddedCells();
		for (let i = 0, n = embeddedCells.length; i < n; i++) {
			const embed = embeddedCells[i];
			if (embed) embed.remove(opt);
		}
		this.trigger("remove", this, graph.attributes.cells, opt);
		graph.stopBatch("remove");
		return this;
	},
	toFront: function(opt) {
		var graph = this.graph;
		if (graph) {
			opt = defaults(opt || {}, { foregroundEmbeds: true });
			let cells;
			if (opt.deep) {
				cells = this.getEmbeddedCells({
					deep: true,
					breadthFirst: opt.breadthFirst !== false,
					sortSiblings: opt.foregroundEmbeds
				});
				cells.unshift(this);
			} else cells = [this];
			const sortedCells = opt.foregroundEmbeds ? cells : sortBy(cells, (cell) => cell.z());
			const maxZ = graph.maxZIndex();
			let z = maxZ - cells.length + 1;
			const collection = graph.get("cells");
			let shouldUpdate = collection.toArray().indexOf(sortedCells[0]) !== collection.length - cells.length;
			if (!shouldUpdate) shouldUpdate = sortedCells.some(function(cell, index) {
				return cell.z() !== z + index;
			});
			if (shouldUpdate) {
				this.startBatch("to-front");
				z = z + cells.length;
				sortedCells.forEach(function(cell, index) {
					cell.set("z", z + index, opt);
				});
				this.stopBatch("to-front");
			}
		}
		return this;
	},
	toBack: function(opt) {
		var graph = this.graph;
		if (graph) {
			opt = defaults(opt || {}, { foregroundEmbeds: true });
			let cells;
			if (opt.deep) {
				cells = this.getEmbeddedCells({
					deep: true,
					breadthFirst: opt.breadthFirst !== false,
					sortSiblings: opt.foregroundEmbeds
				});
				cells.unshift(this);
			} else cells = [this];
			const sortedCells = opt.foregroundEmbeds ? cells : sortBy(cells, (cell) => cell.z());
			let z = graph.minZIndex();
			var collection = graph.get("cells");
			let shouldUpdate = collection.toArray().indexOf(sortedCells[0]) !== 0;
			if (!shouldUpdate) shouldUpdate = sortedCells.some(function(cell, index) {
				return cell.z() !== z + index;
			});
			if (shouldUpdate) {
				this.startBatch("to-back");
				z -= cells.length;
				sortedCells.forEach(function(cell, index) {
					cell.set("z", z + index, opt);
				});
				this.stopBatch("to-back");
			}
		}
		return this;
	},
	parent: function(parent$1, opt) {
		if (parent$1 === void 0) return this.get("parent");
		return this.set("parent", parent$1, opt);
	},
	embed: function(cell, opt = {}) {
		const cells = Array.isArray(cell) ? cell : [cell];
		if (!this.canEmbed(cells)) throw new Error("Recursive embedding not allowed.");
		if (opt.reparent) {
			const parents = uniq(cells.map((c) => c.getParentCell()));
			parents.forEach((parent$1) => {
				if (!parent$1) return;
				parent$1._unembedCells(cells, opt);
			});
		} else if (cells.some((c) => c.isEmbedded() && this.id !== c.parent())) throw new Error("Embedding of already embedded cells is not allowed.");
		this._embedCells(cells, opt);
		return this;
	},
	unembed: function(cell, opt) {
		const cells = Array.isArray(cell) ? cell : [cell];
		this._unembedCells(cells, opt);
		return this;
	},
	canEmbed: function(cell) {
		const cells = Array.isArray(cell) ? cell : [cell];
		return cells.every((c) => this !== c && !this.isEmbeddedIn(c));
	},
	_embedCells: function(cells, opt) {
		const batchName = "embed";
		this.startBatch(batchName);
		const embeds = assign([], this.get("embeds"));
		cells.forEach((cell) => {
			embeds[cell.isLink() ? "unshift" : "push"](cell.id);
			cell.parent(this.id, opt);
		});
		this.set("embeds", uniq(embeds), opt);
		this.stopBatch(batchName);
	},
	_unembedCells: function(cells, opt) {
		const batchName = "unembed";
		this.startBatch(batchName);
		cells.forEach((cell) => cell.unset("parent", opt));
		this.set("embeds", without(this.get("embeds"), ...cells.map((cell) => cell.id)), opt);
		this.stopBatch(batchName);
	},
	getParentCell: function() {
		var parentId = this.parent();
		var graph = this.graph;
		return parentId && graph && graph.getCell(parentId) || null;
	},
	getAncestors: function() {
		var ancestors = [];
		if (!this.graph) return ancestors;
		var parentCell = this.getParentCell();
		while (parentCell) {
			ancestors.push(parentCell);
			parentCell = parentCell.getParentCell();
		}
		return ancestors;
	},
	getEmbeddedCells: function(opt) {
		opt = opt || {};
		if (!this.graph) return [];
		if (opt.deep) if (opt.breadthFirst) return this._getEmbeddedCellsBfs(opt.sortSiblings);
		else return this._getEmbeddedCellsDfs(opt.sortSiblings);
		const embeddedIds = this.get("embeds");
		if (isEmpty(embeddedIds)) return [];
		let cells = embeddedIds.map(this.graph.getCell, this.graph);
		if (opt.sortSiblings) cells = sortBy(cells, (cell) => cell.z());
		return cells;
	},
	_getEmbeddedCellsBfs: function(sortSiblings) {
		const cells = [];
		const queue = [];
		queue.push(this);
		while (queue.length > 0) {
			const current = queue.shift();
			cells.push(current);
			const embeddedCells = current.getEmbeddedCells({ sortSiblings });
			queue.push(...embeddedCells);
		}
		cells.shift();
		return cells;
	},
	_getEmbeddedCellsDfs: function(sortSiblings) {
		const cells = [];
		const stack = [];
		stack.push(this);
		while (stack.length > 0) {
			const current = stack.pop();
			cells.push(current);
			const embeddedCells = current.getEmbeddedCells({ sortSiblings });
			for (let i = embeddedCells.length - 1; i >= 0; --i) stack.push(embeddedCells[i]);
		}
		cells.shift();
		return cells;
	},
	isEmbeddedIn: function(cell, opt) {
		var cellId = isString(cell) ? cell : cell.id;
		var parentId = this.parent();
		opt = assign({ deep: true }, opt);
		if (this.graph && opt.deep) {
			while (parentId) {
				if (parentId === cellId) return true;
				parentId = this.graph.getCell(parentId).parent();
			}
			return false;
		} else return parentId === cellId;
	},
	isEmbedded: function() {
		return !!this.parent();
	},
	clone: function(opt) {
		opt = opt || {};
		if (!opt.deep) {
			var clone$2 = Model.prototype.clone.apply(this, arguments);
			clone$2.set(this.getIdAttribute(), this.generateId());
			clone$2.unset("embeds");
			clone$2.unset("parent");
			return clone$2;
		} else return toArray(cloneCells([this].concat(this.getEmbeddedCells({ deep: true }))));
	},
	prop: function(props$2, value, opt) {
		var delim = "/";
		var _isString = isString(props$2);
		if (_isString || Array.isArray(props$2)) if (arguments.length > 1) {
			var path;
			var pathArray;
			if (_isString) {
				path = props$2;
				pathArray = path.split("/");
			} else {
				path = props$2.join(delim);
				pathArray = props$2.slice();
			}
			var property$1 = pathArray[0];
			var pathArrayLength = pathArray.length;
			const options$1 = opt || {};
			options$1.propertyPath = path;
			options$1.propertyValue = value;
			options$1.propertyPathArray = pathArray;
			if (!("rewrite" in options$1)) options$1.rewrite = false;
			var update = {};
			var initializer = update;
			var prevProperty = property$1;
			for (var i = 1; i < pathArrayLength; i++) {
				var pathItem = pathArray[i];
				var isArrayIndex = Number.isFinite(_isString ? Number(pathItem) : pathItem);
				initializer = initializer[prevProperty] = isArrayIndex ? [] : {};
				prevProperty = pathItem;
			}
			update = setByPath(update, pathArray, value, "/");
			var baseAttributes = merge({}, this.attributes);
			options$1.rewrite && unsetByPath(baseAttributes, path, "/");
			var attributes$1 = merge(baseAttributes, update);
			return this.set(property$1, attributes$1[property$1], options$1);
		} else return getByPath(this.attributes, props$2, delim);
		const options = value || {};
		options.propertyPath = null;
		options.propertyValue = props$2;
		options.propertyPathArray = [];
		if (!("rewrite" in options)) options.rewrite = false;
		const changedAttributes = {};
		for (const key in props$2) {
			const { changedValue } = merge({}, { changedValue: this.attributes[key] }, { changedValue: props$2[key] });
			changedAttributes[key] = changedValue;
		}
		return this.set(changedAttributes, options);
	},
	removeProp: function(path, opt) {
		opt = opt || {};
		var pathArray = Array.isArray(path) ? path : path.split("/");
		var property$1 = pathArray[0];
		if (property$1 === "attrs") opt.dirty = true;
		if (pathArray.length === 1) return this.unset(path, opt);
		var nestedPath = pathArray.slice(1);
		var propertyValue = this.get(property$1);
		if (propertyValue === void 0 || propertyValue === null) return this;
		propertyValue = cloneDeep(propertyValue);
		unsetByPath(propertyValue, nestedPath, "/");
		return this.set(property$1, propertyValue, opt);
	},
	attr: function(attrs, value, opt) {
		var args = Array.from(arguments);
		if (args.length === 0) return this.get("attrs");
		if (Array.isArray(attrs)) args[0] = ["attrs"].concat(attrs);
		else if (isString(attrs)) args[0] = "attrs/" + attrs;
		else args[0] = { "attrs": attrs };
		return this.prop.apply(this, args);
	},
	removeAttr: function(path, opt) {
		if (Array.isArray(path)) return this.removeProp(["attrs"].concat(path));
		return this.removeProp("attrs/" + path, opt);
	},
	transition: function(path, value, opt, delim) {
		delim = delim || "/";
		var defaults$1 = {
			duration: 100,
			delay: 10,
			timingFunction: timing.linear,
			valueFunction: interpolate.number
		};
		opt = assign(defaults$1, opt);
		var firstFrameTime = 0;
		var interpolatingFunction;
		var setter = function(runtime) {
			var id, progress, propertyValue;
			firstFrameTime = firstFrameTime || runtime;
			runtime -= firstFrameTime;
			progress = runtime / opt.duration;
			if (progress < 1) this._transitionIds[path] = id = nextFrame(setter);
			else {
				progress = 1;
				delete this._transitionIds[path];
			}
			propertyValue = interpolatingFunction(opt.timingFunction(progress));
			opt.transitionId = id;
			this.prop(path, propertyValue, opt);
			if (!id) this.trigger("transition:end", this, path);
		}.bind(this);
		const { _scheduledTransitionIds } = this;
		let initialId;
		var initiator = (callback) => {
			if (_scheduledTransitionIds[path]) {
				_scheduledTransitionIds[path] = without(_scheduledTransitionIds[path], initialId);
				if (_scheduledTransitionIds[path].length === 0) delete _scheduledTransitionIds[path];
			}
			this.stopPendingTransitions(path, delim);
			interpolatingFunction = opt.valueFunction(getByPath(this.attributes, path, delim), value);
			this._transitionIds[path] = nextFrame(callback);
			this.trigger("transition:start", this, path);
		};
		initialId = setTimeout(initiator, opt.delay, setter);
		_scheduledTransitionIds[path] || (_scheduledTransitionIds[path] = []);
		_scheduledTransitionIds[path].push(initialId);
		return initialId;
	},
	getTransitions: function() {
		return union(Object.keys(this._transitionIds), Object.keys(this._scheduledTransitionIds));
	},
	stopScheduledTransitions: function(path, delim = "/") {
		const { _scheduledTransitionIds = {} } = this;
		let transitions = Object.keys(_scheduledTransitionIds);
		if (path) {
			const pathArray = path.split(delim);
			transitions = transitions.filter((key) => {
				return isEqual(pathArray, key.split(delim).slice(0, pathArray.length));
			});
		}
		transitions.forEach((key) => {
			const transitionIds = _scheduledTransitionIds[key];
			transitionIds.forEach((transitionId) => clearTimeout(transitionId));
			delete _scheduledTransitionIds[key];
		});
		return this;
	},
	stopPendingTransitions(path, delim = "/") {
		const { _transitionIds = {} } = this;
		let transitions = Object.keys(_transitionIds);
		if (path) {
			const pathArray = path.split(delim);
			transitions = transitions.filter((key) => {
				return isEqual(pathArray, key.split(delim).slice(0, pathArray.length));
			});
		}
		transitions.forEach((key) => {
			const transitionId = _transitionIds[key];
			cancelFrame(transitionId);
			delete _transitionIds[key];
			this.trigger("transition:end", this, key);
		});
	},
	stopTransitions: function(path, delim = "/") {
		this.stopScheduledTransitions(path, delim);
		this.stopPendingTransitions(path, delim);
		return this;
	},
	addTo: function(graph, opt) {
		graph.addCell(this, opt);
		return this;
	},
	findView: function(paper) {
		return paper.findViewByModel(this);
	},
	isElement: function() {
		return false;
	},
	isLink: function() {
		return false;
	},
	startBatch: function(name, opt) {
		if (this.graph) this.graph.startBatch(name, assign({}, opt, { cell: this }));
		return this;
	},
	stopBatch: function(name, opt) {
		if (this.graph) this.graph.stopBatch(name, assign({}, opt, { cell: this }));
		return this;
	},
	getChangeFlag: function(attributes$1) {
		var flag = 0;
		if (!attributes$1) return flag;
		for (var key in attributes$1) {
			if (!attributes$1.hasOwnProperty(key) || !this.hasChanged(key)) continue;
			flag |= attributes$1[key];
		}
		return flag;
	},
	angle: function() {
		return 0;
	},
	position: function() {
		return new Point(0, 0);
	},
	z: function() {
		return this.get("z") || 0;
	},
	getPointFromConnectedLink: function() {
		return new Point();
	},
	getBBox: function() {
		return new Rect(0, 0, 0, 0);
	},
	getPointRotatedAroundCenter(angle, x, y) {
		const point$1 = new Point(x, y);
		if (angle) point$1.rotate(this.getBBox().center(), angle);
		return point$1;
	},
	getAbsolutePointFromRelative(x, y) {
		return this.getPointRotatedAroundCenter(-this.angle(), this.position().offset(x, y));
	},
	getRelativePointFromAbsolute(x, y) {
		return this.getPointRotatedAroundCenter(this.angle(), x, y).difference(this.position());
	}
}, {
	getAttributeDefinition: function(attrName) {
		var defNS = this.attributes;
		var globalDefNS = attributes;
		return defNS && defNS[attrName] || globalDefNS[attrName];
	},
	define: function(type, defaults$1, protoProps, staticProps) {
		protoProps = assign({ defaults: defaultsDeep({ type }, defaults$1, this.prototype.defaults) }, protoProps);
		var Cell$1 = this.extend(protoProps, staticProps);
		if (typeof joint !== "undefined" && has(joint, "shapes")) setByPath(joint.shapes, type, Cell$1, ".");
		return Cell$1;
	}
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/util/wrappers.mjs
const wrapWith = function(object, methods$1, wrapper) {
	if (isString(wrapper)) {
		if (!wrappers[wrapper]) throw new Error("Unknown wrapper: \"" + wrapper + "\"");
		wrapper = wrappers[wrapper];
	}
	if (!isFunction(wrapper)) throw new Error("Wrapper must be a function.");
	toArray(methods$1).forEach(function(method) {
		object[method] = wrapper(object[method]);
	});
};
const wrappers = { cells: function(fn$1) {
	return function() {
		var args = Array.from(arguments);
		var n = args.length;
		var cells = n > 0 && args[0] || [];
		var opt = n > 1 && args[n - 1] || {};
		if (!Array.isArray(cells)) {
			if (opt instanceof Cell) cells = args;
			else if (cells instanceof Cell) {
				if (args.length > 1) args.pop();
				cells = args;
			}
		}
		if (opt instanceof Cell) opt = {};
		return fn$1.call(this, cells, opt);
	};
} };

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/util/svgTagTemplate.mjs
function svg(strings, ...expressions) {
	const svgParts = [];
	strings.forEach((part, index) => {
		svgParts.push(part);
		if (index in expressions) svgParts.push(expressions[index]);
	});
	const markup = parseFromSVGString(svgParts.join(""));
	return markup;
}
function parseFromSVGString(str) {
	const parser = new DOMParser();
	const markupString = `<svg>${str.trim()}</svg>`;
	const xmldocument = parser.parseFromString(markupString.replace(/@/g, ""), "application/xml");
	if (xmldocument.getElementsByTagName("parsererror")[0]) throw new Error("Invalid SVG markup");
	const document$2 = parser.parseFromString(markupString, "text/html");
	const svg$1 = document$2.querySelector("svg");
	return build(svg$1);
}
function buildNode(node) {
	const markupNode = {};
	const { tagName, attributes: attributes$1, namespaceURI, style, childNodes } = node;
	markupNode.namespaceURI = namespaceURI;
	markupNode.tagName = namespaceURI === V_default.namespace.xhtml ? tagName.toLowerCase() : tagName;
	const stylesObject = {};
	for (var i = style.length; i--;) {
		var nameString = style[i];
		stylesObject[nameString] = style.getPropertyValue(nameString);
	}
	markupNode.style = stylesObject;
	const selectorAttribute = attributes$1.getNamedItem("@selector");
	if (selectorAttribute) {
		markupNode.selector = selectorAttribute.value;
		attributes$1.removeNamedItem("@selector");
	}
	const groupSelectorAttribute = attributes$1.getNamedItem("@group-selector");
	if (groupSelectorAttribute) {
		const groupSelectors = groupSelectorAttribute.value.split(",");
		markupNode.groupSelector = groupSelectors.map((s) => s.trim());
		attributes$1.removeNamedItem("@group-selector");
	}
	const className$1 = attributes$1.getNamedItem("class");
	if (className$1) markupNode.className = className$1.value;
	const children$1 = [];
	childNodes.forEach((node$1) => {
		switch (node$1.nodeType) {
			case Node.TEXT_NODE: {
				const trimmedText = node$1.data.replace(/\s\s+/g, " ");
				if (trimmedText.trim()) children$1.push(trimmedText);
				break;
			}
			case Node.ELEMENT_NODE:
				children$1.push(buildNode(node$1));
				break;
			default: break;
		}
	});
	if (children$1.length) markupNode.children = children$1;
	const nodeAttrs = {};
	Array.from(attributes$1).forEach((nodeAttribute) => {
		const { name, value } = nodeAttribute;
		nodeAttrs[name] = value;
	});
	if (Object.keys(nodeAttrs).length > 0) markupNode.attributes = nodeAttrs;
	return markupNode;
}
function build(root) {
	const markup = [];
	Array.from(root.children).forEach((node) => {
		markup.push(buildNode(node));
	});
	return markup;
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/util/getRectPoint.mjs
const Positions = {
	TOP: "top",
	RIGHT: "right",
	BOTTOM: "bottom",
	LEFT: "left",
	TOP_LEFT: "top-left",
	TOP_RIGHT: "top-right",
	BOTTOM_LEFT: "bottom-left",
	BOTTOM_RIGHT: "bottom-right",
	CENTER: "center"
};
function getRectPoint(rect$1, position$1) {
	const r = new Rect(rect$1);
	switch (position$1) {
		case void 0: throw new Error("Position required");
		case Positions.LEFT:
		case "leftMiddle": return r.leftMiddle();
		case Positions.RIGHT:
		case "rightMiddle": return r.rightMiddle();
		case Positions.TOP:
		case "topMiddle": return r.topMiddle();
		case Positions.BOTTOM:
		case "bottomMiddle": return r.bottomMiddle();
		case Positions.TOP_LEFT:
		case "topLeft":
		case "origin": return r.topLeft();
		case Positions.TOP_RIGHT:
		case "topRight": return r.topRight();
		case Positions.BOTTOM_LEFT:
		case "bottomLeft": return r.bottomLeft();
		case Positions.BOTTOM_RIGHT:
		case "bottomRight":
		case "corner": return r.bottomRight();
		case Positions.CENTER: return r.center();
		default: throw new Error(`Unknown position: ${position$1}`);
	}
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/layout/ports/port.mjs
var port_exports = {};
__export(port_exports, {
	absolute: () => absolute,
	bottom: () => bottom$2,
	ellipse: () => ellipse,
	ellipseSpread: () => ellipseSpread,
	fn: () => fn,
	left: () => left$2,
	line: () => line,
	right: () => right$2,
	top: () => top$2
});
function portTransformAttrs(point$1, angle, opt) {
	var trans = point$1.toJSON();
	trans.angle = angle || 0;
	return defaults({}, opt, trans);
}
function lineLayout(ports, p1, p2, elBBox) {
	return ports.map(function(port, index, ports$1) {
		var p = this.pointAt((index + .5) / ports$1.length);
		if (port.dx || port.dy) p.offset(port.dx || 0, port.dy || 0);
		return portTransformAttrs(p.round(), 0, argTransform(elBBox, port));
	}, line$1(p1, p2));
}
function ellipseLayout(ports, elBBox, startAngle, stepFn) {
	var center$1 = elBBox.center();
	var ratio = elBBox.width / elBBox.height;
	var p1 = elBBox.topMiddle();
	var ellipse$2 = Ellipse$1.fromRect(elBBox);
	return ports.map(function(port, index, ports$1) {
		var angle = startAngle + stepFn(index, ports$1.length);
		var p2 = p1.clone().rotate(center$1, -angle).scale(ratio, 1, center$1);
		var theta = port.compensateRotation ? -ellipse$2.tangentTheta(p2) : 0;
		if (port.dx || port.dy) p2.offset(port.dx || 0, port.dy || 0);
		if (port.dr) p2.move(center$1, port.dr);
		return portTransformAttrs(p2.round(), theta, argTransform(elBBox, port));
	});
}
function argTransform(bbox$1, args) {
	let { x, y, angle } = args;
	if (isPercentage(x)) x = parseFloat(x) / 100 * bbox$1.width;
	else if (isCalcExpression(x)) x = Number(evalCalcExpression(x, bbox$1));
	if (isPercentage(y)) y = parseFloat(y) / 100 * bbox$1.height;
	else if (isCalcExpression(y)) y = Number(evalCalcExpression(y, bbox$1));
	return {
		x,
		y,
		angle
	};
}
function argPoint(bbox$1, args) {
	const { x, y } = argTransform(bbox$1, args);
	return new Point(x || 0, y || 0);
}
/**
* @param {Array<Object>} ports
* @param {g.Rect} elBBox
* @param {Object=} opt opt Group options
* @returns {Array<g.Point>}
*/
const absolute = function(ports, elBBox) {
	return ports.map((port) => {
		const transformation = argPoint(elBBox, port).round().toJSON();
		transformation.angle = port.angle || 0;
		return transformation;
	});
};
/**
* @param {Array<Object>} ports
* @param {g.Rect} elBBox
* @param {Object=} opt opt Group options
* @returns {Array<g.Point>}
*/
const fn = function(ports, elBBox, opt) {
	return opt.fn(ports, elBBox, opt);
};
/**
* @param {Array<Object>} ports
* @param {g.Rect} elBBox
* @param {Object=} opt opt Group options
* @returns {Array<g.Point>}
*/
const line = function(ports, elBBox, opt) {
	var start = argPoint(elBBox, opt.start || elBBox.origin());
	var end = argPoint(elBBox, opt.end || elBBox.corner());
	return lineLayout(ports, start, end, elBBox);
};
/**
* @param {Array<Object>} ports
* @param {g.Rect} elBBox
* @param {Object=} opt opt Group options
* @returns {Array<g.Point>}
*/
const left$2 = function(ports, elBBox, opt) {
	return lineLayout(ports, elBBox.origin(), elBBox.bottomLeft(), elBBox);
};
/**
* @param {Array<Object>} ports
* @param {g.Rect} elBBox
* @param {Object=} opt opt Group options
* @returns {Array<g.Point>}
*/
const right$2 = function(ports, elBBox, opt) {
	return lineLayout(ports, elBBox.topRight(), elBBox.corner(), elBBox);
};
/**
* @param {Array<Object>} ports
* @param {g.Rect} elBBox
* @param {Object=} opt opt Group options
* @returns {Array<g.Point>}
*/
const top$2 = function(ports, elBBox, opt) {
	return lineLayout(ports, elBBox.origin(), elBBox.topRight(), elBBox);
};
/**
* @param {Array<Object>} ports
* @param {g.Rect} elBBox
* @param {Object=} opt opt Group options
* @returns {Array<g.Point>}
*/
const bottom$2 = function(ports, elBBox, opt) {
	return lineLayout(ports, elBBox.bottomLeft(), elBBox.corner(), elBBox);
};
/**
* @param {Array<Object>} ports
* @param {g.Rect} elBBox
* @param {Object=} opt Group options
* @returns {Array<g.Point>}
*/
const ellipseSpread = function(ports, elBBox, opt) {
	var startAngle = opt.startAngle || 0;
	var stepAngle = opt.step || 360 / ports.length;
	return ellipseLayout(ports, elBBox, startAngle, function(index) {
		return index * stepAngle;
	});
};
/**
* @param {Array<Object>} ports
* @param {g.Rect} elBBox
* @param {Object=} opt Group options
* @returns {Array<g.Point>}
*/
const ellipse = function(ports, elBBox, opt) {
	var startAngle = opt.startAngle || 0;
	var stepAngle = opt.step || 20;
	return ellipseLayout(ports, elBBox, startAngle, function(index, count) {
		return (index + .5 - count / 2) * stepAngle;
	});
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/layout/ports/portLabel.mjs
var portLabel_exports = {};
__export(portLabel_exports, {
	bottom: () => bottom$1,
	inside: () => inside,
	insideOriented: () => insideOriented,
	left: () => left$1,
	manual: () => manual,
	outside: () => outside,
	outsideOriented: () => outsideOriented,
	radial: () => radial,
	radialOriented: () => radialOriented,
	right: () => right$1,
	top: () => top$1
});
function labelAttributes(opt1, opt2) {
	return defaultsDeep({}, opt1, opt2, {
		x: 0,
		y: 0,
		angle: 0,
		attrs: {}
	});
}
function getBBoxAngles(elBBox) {
	var center$1 = elBBox.center();
	var tl = center$1.theta(elBBox.origin());
	var bl = center$1.theta(elBBox.bottomLeft());
	var br = center$1.theta(elBBox.corner());
	var tr = center$1.theta(elBBox.topRight());
	return [
		tl,
		tr,
		br,
		bl
	];
}
function outsideLayout(portPosition, elBBox, autoOrient, opt) {
	opt = defaults({}, opt, { offset: 15 });
	var angle = elBBox.center().theta(portPosition);
	var tx, ty, y, textAnchor;
	var offset$1 = opt.offset;
	var orientAngle = 0;
	const [topLeftAngle, bottomLeftAngle, bottomRightAngle, topRightAngle] = getBBoxAngles(elBBox);
	if (angle < bottomLeftAngle || angle > bottomRightAngle) {
		y = ".3em";
		tx = offset$1;
		ty = 0;
		textAnchor = "start";
	} else if (angle < topLeftAngle) {
		tx = 0;
		ty = -offset$1;
		if (autoOrient) {
			orientAngle = -90;
			textAnchor = "start";
			y = ".3em";
		} else {
			textAnchor = "middle";
			y = "0";
		}
	} else if (angle < topRightAngle) {
		y = ".3em";
		tx = -offset$1;
		ty = 0;
		textAnchor = "end";
	} else {
		tx = 0;
		ty = offset$1;
		if (autoOrient) {
			orientAngle = 90;
			textAnchor = "start";
			y = ".3em";
		} else {
			textAnchor = "middle";
			y = ".6em";
		}
	}
	var round$5 = Math.round;
	return labelAttributes(opt, {
		x: round$5(tx),
		y: round$5(ty),
		angle: orientAngle,
		attrs: { labelText: {
			y,
			textAnchor
		} }
	});
}
function insideLayout(portPosition, elBBox, autoOrient, opt) {
	opt = defaults({}, opt, { offset: 15 });
	var angle = elBBox.center().theta(portPosition);
	var tx, ty, y, textAnchor;
	var offset$1 = opt.offset;
	var orientAngle = 0;
	const [topLeftAngle, bottomLeftAngle, bottomRightAngle, topRightAngle] = getBBoxAngles(elBBox);
	if (angle < bottomLeftAngle || angle > bottomRightAngle) {
		y = ".3em";
		tx = -offset$1;
		ty = 0;
		textAnchor = "end";
	} else if (angle < topLeftAngle) {
		tx = 0;
		ty = offset$1;
		if (autoOrient) {
			orientAngle = 90;
			textAnchor = "start";
			y = ".3em";
		} else {
			textAnchor = "middle";
			y = ".6em";
		}
	} else if (angle < topRightAngle) {
		y = ".3em";
		tx = offset$1;
		ty = 0;
		textAnchor = "start";
	} else {
		tx = 0;
		ty = -offset$1;
		if (autoOrient) {
			orientAngle = -90;
			textAnchor = "start";
			y = ".3em";
		} else {
			textAnchor = "middle";
			y = "0";
		}
	}
	var round$5 = Math.round;
	return labelAttributes(opt, {
		x: round$5(tx),
		y: round$5(ty),
		angle: orientAngle,
		attrs: { labelText: {
			y,
			textAnchor
		} }
	});
}
function radialLayout(portCenterOffset, autoOrient, opt) {
	opt = defaults({}, opt, { offset: 20 });
	var origin = point(0, 0);
	var angle = -portCenterOffset.theta(origin);
	var orientAngle = angle;
	var offset$1 = portCenterOffset.clone().move(origin, opt.offset).difference(portCenterOffset).round();
	var y = ".3em";
	var textAnchor;
	if ((angle + 90) % 180 === 0) {
		textAnchor = autoOrient ? "end" : "middle";
		if (!autoOrient && angle === -270) y = "0em";
	} else if (angle > -270 && angle < -90) {
		textAnchor = "start";
		orientAngle = angle - 180;
	} else textAnchor = "end";
	var round$5 = Math.round;
	return labelAttributes(opt, {
		x: round$5(offset$1.x),
		y: round$5(offset$1.y),
		angle: autoOrient ? orientAngle : 0,
		attrs: { labelText: {
			y,
			textAnchor
		} }
	});
}
const manual = function(_portPosition, _elBBox, opt) {
	return labelAttributes(opt);
};
const left$1 = function(portPosition, elBBox, opt) {
	return labelAttributes(opt, {
		x: -15,
		attrs: { labelText: {
			y: ".3em",
			textAnchor: "end"
		} }
	});
};
const right$1 = function(portPosition, elBBox, opt) {
	return labelAttributes(opt, {
		x: 15,
		attrs: { labelText: {
			y: ".3em",
			textAnchor: "start"
		} }
	});
};
const top$1 = function(portPosition, elBBox, opt) {
	return labelAttributes(opt, {
		y: -15,
		attrs: { labelText: {
			y: "0",
			textAnchor: "middle"
		} }
	});
};
const bottom$1 = function(portPosition, elBBox, opt) {
	return labelAttributes(opt, {
		y: 15,
		attrs: { labelText: {
			y: ".6em",
			textAnchor: "middle"
		} }
	});
};
const outsideOriented = function(portPosition, elBBox, opt) {
	return outsideLayout(portPosition, elBBox, true, opt);
};
const outside = function(portPosition, elBBox, opt) {
	return outsideLayout(portPosition, elBBox, false, opt);
};
const insideOriented = function(portPosition, elBBox, opt) {
	return insideLayout(portPosition, elBBox, true, opt);
};
const inside = function(portPosition, elBBox, opt) {
	return insideLayout(portPosition, elBBox, false, opt);
};
const radial = function(portPosition, elBBox, opt) {
	return radialLayout(portPosition.difference(elBBox.center()), false, opt);
};
const radialOriented = function(portPosition, elBBox, opt) {
	return radialLayout(portPosition.difference(elBBox.center()), true, opt);
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/ports.mjs
var PortData = function(data$1) {
	var clonedData = cloneDeep(data$1) || {};
	this.ports = [];
	this.groups = {};
	this.portLayoutNamespace = port_exports;
	this.portLabelLayoutNamespace = portLabel_exports;
	this._init(clonedData);
};
PortData.prototype = {
	getPorts: function() {
		return this.ports;
	},
	getGroup: function(name) {
		return this.groups[name] || {};
	},
	getPortsByGroup: function(groupName) {
		return this.ports.filter(function(port) {
			return port.group === groupName;
		});
	},
	getGroupPortsMetrics: function(groupName, elBBox) {
		var group = this.getGroup(groupName);
		var ports = this.getPortsByGroup(groupName);
		var groupPosition = group.position || {};
		var groupPositionName = groupPosition.name;
		var namespace = this.portLayoutNamespace;
		if (!namespace[groupPositionName]) groupPositionName = "left";
		var groupArgs = groupPosition.args || {};
		var portsArgs = ports.map(function(port) {
			return port && port.position && port.position.args;
		});
		var groupPortTransformations = namespace[groupPositionName](portsArgs, elBBox, groupArgs);
		var accumulator = {
			ports,
			result: []
		};
		toArray(groupPortTransformations).reduce(function(res, portTransformation, index) {
			var port = res.ports[index];
			res.result.push({
				portId: port.id,
				portTransformation,
				labelTransformation: this._getPortLabelLayout(port, Point(portTransformation), elBBox),
				portAttrs: port.attrs,
				portSize: port.size,
				labelSize: port.label.size
			});
			return res;
		}.bind(this), accumulator);
		return accumulator.result;
	},
	_getPortLabelLayout: function(port, portPosition, elBBox) {
		var namespace = this.portLabelLayoutNamespace;
		var labelPosition = port.label.position.name || "left";
		if (namespace[labelPosition]) return namespace[labelPosition](portPosition, elBBox, port.label.position.args);
		return null;
	},
	_init: function(data$1) {
		if (isObject(data$1.groups)) {
			var groups = Object.keys(data$1.groups);
			for (var i = 0, n = groups.length; i < n; i++) {
				var key = groups[i];
				this.groups[key] = this._evaluateGroup(data$1.groups[key]);
			}
		}
		var ports = toArray(data$1.items);
		for (var j = 0, m = ports.length; j < m; j++) this.ports.push(this._evaluatePort(ports[j]));
	},
	_evaluateGroup: function(group) {
		return merge(group, {
			position: this._getPosition(group.position, true),
			label: this._getLabel(group, true)
		});
	},
	_evaluatePort: function(port) {
		var evaluated = assign({}, port);
		var group = this.getGroup(port.group);
		evaluated.markup = evaluated.markup || group.markup;
		evaluated.attrs = merge({}, group.attrs, evaluated.attrs);
		evaluated.position = this._createPositionNode(group, evaluated);
		evaluated.label = merge({}, group.label, this._getLabel(evaluated));
		evaluated.z = this._getZIndex(group, evaluated);
		evaluated.size = assign({}, group.size, evaluated.size);
		return evaluated;
	},
	_getZIndex: function(group, port) {
		if (isNumber(port.z)) return port.z;
		if (isNumber(group.z) || group.z === "auto") return group.z;
		return "auto";
	},
	_createPositionNode: function(group, port) {
		return merge({
			name: "left",
			args: {}
		}, group.position, { args: port.args });
	},
	_getPosition: function(position$1, setDefault) {
		var args = {};
		var positionName;
		if (isFunction(position$1)) {
			positionName = "fn";
			args.fn = position$1;
		} else if (isString(position$1)) positionName = position$1;
		else if (position$1 === void 0) positionName = setDefault ? "left" : null;
		else if (Array.isArray(position$1)) {
			positionName = "absolute";
			args.x = position$1[0];
			args.y = position$1[1];
		} else if (isObject(position$1)) {
			positionName = position$1.name;
			assign(args, position$1.args);
		}
		var result$1 = { args };
		if (positionName) result$1.name = positionName;
		return result$1;
	},
	_getLabel: function(item, setDefaults) {
		var label = item.label || {};
		var ret = label;
		ret.position = this._getPosition(label.position, setDefaults);
		return ret;
	}
};
const elementPortPrototype = {
	_initializePorts: function() {
		this._createPortData();
		this.on("change:ports", function() {
			this._processRemovedPort();
			this._createPortData();
		}, this);
	},
	_processRemovedPort: function() {
		var current = this.get("ports") || {};
		var currentItemsMap = {};
		toArray(current.items).forEach(function(item) {
			currentItemsMap[item.id] = true;
		});
		var previous = this.previous("ports") || {};
		var removed = {};
		toArray(previous.items).forEach(function(item) {
			if (!currentItemsMap[item.id]) removed[item.id] = true;
		});
		var graph = this.graph;
		if (graph && !isEmpty(removed)) {
			var inboundLinks = graph.getConnectedLinks(this, { inbound: true });
			inboundLinks.forEach(function(link) {
				if (removed[link.get("target").port]) link.remove();
			});
			var outboundLinks = graph.getConnectedLinks(this, { outbound: true });
			outboundLinks.forEach(function(link) {
				if (removed[link.get("source").port]) link.remove();
			});
		}
	},
	hasPorts: function() {
		var ports = this.prop("ports/items");
		return Array.isArray(ports) && ports.length > 0;
	},
	hasPort: function(id) {
		return this.getPortIndex(id) !== -1;
	},
	getPorts: function() {
		return cloneDeep(this.prop("ports/items")) || [];
	},
	getGroupPorts: function(groupName) {
		const groupPorts = toArray(this.prop(["ports", "items"])).filter((port) => port.group === groupName);
		return cloneDeep(groupPorts);
	},
	getPort: function(id) {
		return cloneDeep(toArray(this.prop("ports/items")).find(function(port) {
			return port.id && port.id === id;
		}));
	},
	getPortGroupNames: function() {
		return Object.keys(this._portSettingsData.groups);
	},
	getPortsPositions: function(groupName) {
		var portsMetrics = this._portSettingsData.getGroupPortsMetrics(groupName, Rect(this.size()));
		return portsMetrics.reduce(function(positions, metrics) {
			var transformation = metrics.portTransformation;
			positions[metrics.portId] = {
				x: transformation.x,
				y: transformation.y,
				angle: transformation.angle
			};
			return positions;
		}, {});
	},
	getPortIndex: function(port) {
		var id = isObject(port) ? port.id : port;
		if (!this._isValidPortId(id)) return -1;
		return toArray(this.prop("ports/items")).findIndex(function(item) {
			return item.id === id;
		});
	},
	addPort: function(port, opt) {
		if (!isObject(port) || Array.isArray(port)) throw new Error("Element: addPort requires an object.");
		var ports = assign([], this.prop("ports/items"));
		ports.push(port);
		this.prop("ports/items", ports, opt);
		return this;
	},
	insertPort: function(before, port, opt) {
		const index = typeof before === "number" ? before : this.getPortIndex(before);
		if (!isObject(port) || Array.isArray(port)) throw new Error("dia.Element: insertPort requires an object.");
		const ports = assign([], this.prop("ports/items"));
		ports.splice(index, 0, port);
		this.prop("ports/items", ports, opt);
		return this;
	},
	portProp: function(portId, path, value, opt) {
		var index = this.getPortIndex(portId);
		if (index === -1) throw new Error("Element: unable to find port with id " + portId);
		var args = Array.prototype.slice.call(arguments, 1);
		if (Array.isArray(path)) args[0] = [
			"ports",
			"items",
			index
		].concat(path);
		else if (isString(path)) args[0] = [
			"ports/items/",
			index,
			"/",
			path
		].join("");
		else {
			args = ["ports/items/" + index];
			if (isPlainObject(path)) {
				args.push(path);
				args.push(value);
			}
		}
		return this.prop.apply(this, args);
	},
	_validatePorts: function() {
		var portsAttr = this.get("ports") || {};
		var errorMessages = [];
		portsAttr = portsAttr || {};
		var ports = toArray(portsAttr.items);
		ports.forEach(function(p) {
			if (typeof p !== "object") errorMessages.push("Element: invalid port ", p);
			if (!this._isValidPortId(p.id)) p.id = this.generatePortId();
		}, this);
		if (uniq(ports, "id").length !== ports.length) errorMessages.push("Element: found id duplicities in ports.");
		return errorMessages;
	},
	generatePortId: function() {
		return this.generateId();
	},
	_isValidPortId: function(id) {
		return id !== null && id !== void 0 && !isObject(id);
	},
	addPorts: function(ports, opt) {
		if (ports.length) this.prop("ports/items", assign([], this.prop("ports/items")).concat(ports), opt);
		return this;
	},
	removePort: function(port, opt) {
		const options = opt || {};
		const index = this.getPortIndex(port);
		if (index !== -1) {
			const ports = assign([], this.prop(["ports", "items"]));
			ports.splice(index, 1);
			options.rewrite = true;
			this.startBatch("port-remove");
			this.prop(["ports", "items"], ports, options);
			this.stopBatch("port-remove");
		}
		return this;
	},
	removePorts: function(portsForRemoval, opt) {
		let options, newPorts;
		if (Array.isArray(portsForRemoval)) {
			options = opt || {};
			if (portsForRemoval.length === 0) return this.this;
			const currentPorts = assign([], this.prop(["ports", "items"]));
			newPorts = currentPorts.filter(function(cp) {
				return !portsForRemoval.some(function(rp) {
					const rpId = isObject(rp) ? rp.id : rp;
					return cp.id === rpId;
				});
			});
		} else {
			options = portsForRemoval || {};
			newPorts = [];
		}
		this.startBatch("port-remove");
		options.rewrite = true;
		this.prop(["ports", "items"], newPorts, options);
		this.stopBatch("port-remove");
		return this;
	},
	_createPortData: function() {
		var err = this._validatePorts();
		if (err.length > 0) {
			this.set("ports", this.previous("ports"));
			throw new Error(err.join(" "));
		}
		var prevPortData;
		if (this._portSettingsData) prevPortData = this._portSettingsData.getPorts();
		this._portSettingsData = new PortData(this.get("ports"));
		var curPortData = this._portSettingsData.getPorts();
		if (prevPortData) {
			var added = curPortData.filter(function(item) {
				if (!prevPortData.find(function(prevPort) {
					return prevPort.id === item.id;
				})) return item;
			});
			var removed = prevPortData.filter(function(item) {
				if (!curPortData.find(function(curPort) {
					return curPort.id === item.id;
				})) return item;
			});
			if (removed.length > 0) this.trigger("ports:remove", this, removed);
			if (added.length > 0) this.trigger("ports:add", this, added);
		}
	}
};
const elementViewPortPrototype = {
	portContainerMarkup: "g",
	portMarkup: [{
		tagName: "circle",
		selector: "circle",
		attributes: {
			"r": 10,
			"fill": "#FFFFFF",
			"stroke": "#000000"
		}
	}],
	portLabelMarkup: [{
		tagName: "text",
		selector: "text",
		attributes: { "fill": "#000000" }
	}],
	_portElementsCache: null,
	_initializePorts: function() {
		this._cleanPortsCache();
	},
	_refreshPorts: function() {
		this._removePorts();
		this._cleanPortsCache();
		this._renderPorts();
	},
	_cleanPortsCache: function() {
		this._portElementsCache = {};
	},
	_renderPorts: function() {
		var elementReferences = [];
		var elem = this._getContainerElement();
		for (var i = 0, count = elem.node.childNodes.length; i < count; i++) elementReferences.push(elem.node.childNodes[i]);
		var portsGropsByZ = groupBy(this.model._portSettingsData.getPorts(), "z");
		var withoutZKey = "auto";
		toArray(portsGropsByZ[withoutZKey]).forEach(function(port) {
			var portElement = this._getPortElement(port);
			elem.append(portElement);
			elementReferences.push(portElement);
		}, this);
		var groupNames = Object.keys(portsGropsByZ);
		for (var k = 0; k < groupNames.length; k++) {
			var groupName = groupNames[k];
			if (groupName !== withoutZKey) {
				var z = parseInt(groupName, 10);
				this._appendPorts(portsGropsByZ[groupName], z, elementReferences);
			}
		}
		this._updatePorts();
	},
	_getContainerElement: function() {
		return this.rotatableNode || this.vel;
	},
	_appendPorts: function(ports, z, refs) {
		var containerElement = this._getContainerElement();
		var portElements = toArray(ports).map(this._getPortElement, this);
		if (refs[z] || z < 0) V_default(refs[Math.max(z, 0)]).before(portElements);
		else containerElement.append(portElements);
	},
	_getPortElement: function(port) {
		if (this._portElementsCache[port.id]) return this._portElementsCache[port.id].portElement;
		return this._createPortElement(port);
	},
	findPortNodes: function(portId, selector) {
		const portCache = this._portElementsCache[portId];
		if (!portCache) return [];
		if (!selector) return [portCache.portContentElement.node];
		const portRoot = portCache.portElement.node;
		const portSelectors = portCache.portSelectors;
		return this.findBySelector(selector, portRoot, portSelectors);
	},
	findPortNode: function(portId, selector) {
		const [node = null] = this.findPortNodes(portId, selector);
		return node;
	},
	_updatePorts: function() {
		this._updatePortGroup(void 0);
		var groupsNames = Object.keys(this.model._portSettingsData.groups);
		groupsNames.forEach(this._updatePortGroup, this);
	},
	_removePorts: function() {
		invoke(this._portElementsCache, "portElement.remove");
	},
	_createPortElement: function(port) {
		let portElement;
		let labelElement;
		let labelSelectors;
		let portSelectors;
		var portContainerElement = V_default(this.portContainerMarkup).addClass("joint-port");
		var portMarkup = this._getPortMarkup(port);
		if (Array.isArray(portMarkup)) {
			var portDoc = this.parseDOMJSON(portMarkup, portContainerElement.node);
			var portFragment = portDoc.fragment;
			if (portFragment.childNodes.length > 1) portElement = V_default("g").append(portFragment);
			else portElement = V_default(portFragment.firstChild);
			portSelectors = portDoc.selectors;
		} else {
			portElement = V_default(portMarkup);
			if (Array.isArray(portElement)) portElement = V_default("g").append(portElement);
		}
		if (!portElement) throw new Error("ElementView: Invalid port markup.");
		portElement.attr({
			"port": port.id,
			"port-group": port.group
		});
		if (isNumber(port.id)) portElement.attr("port-id-type", "number");
		const labelMarkupDef = this._getPortLabelMarkup(port.label);
		if (Array.isArray(labelMarkupDef)) {
			const { fragment, selectors } = this.parseDOMJSON(labelMarkupDef, portContainerElement.node);
			const childCount = fragment.childNodes.length;
			if (childCount > 0) {
				labelSelectors = selectors;
				labelElement = childCount === 1 ? V_default(fragment.firstChild) : V_default("g").append(fragment);
			}
		} else {
			labelElement = V_default(labelMarkupDef);
			if (Array.isArray(labelElement)) labelElement = V_default("g").append(labelElement);
		}
		var portContainerSelectors;
		if (portSelectors && labelSelectors) {
			for (var key in labelSelectors) if (portSelectors[key] && key !== this.selector) throw new Error("ElementView: selectors within port must be unique.");
			portContainerSelectors = assign({}, portSelectors, labelSelectors);
		} else portContainerSelectors = portSelectors || labelSelectors || {};
		const portRootSelector = "portRoot";
		const labelRootSelector = "labelRoot";
		const labelTextSelector = "labelText";
		if (!(portRootSelector in portContainerSelectors)) portContainerSelectors[portRootSelector] = portElement.node;
		if (labelElement) {
			const labelNode = labelElement.node;
			if (!(labelRootSelector in portContainerSelectors)) portContainerSelectors[labelRootSelector] = labelNode;
			if (!(labelTextSelector in portContainerSelectors)) {
				const labelTextNode = labelElement.tagName() === "TEXT" ? labelNode : Array.from(labelNode.querySelectorAll("text"));
				portContainerSelectors[labelTextSelector] = labelTextNode;
				if (!labelSelectors) labelSelectors = {};
				labelSelectors[labelTextSelector] = labelTextNode;
			}
		}
		portContainerElement.append(portElement.addClass("joint-port-body"));
		if (labelElement) portContainerElement.append(labelElement.addClass("joint-port-label"));
		this._portElementsCache[port.id] = {
			portElement: portContainerElement,
			portLabelElement: labelElement,
			portSelectors: portContainerSelectors,
			portLabelSelectors: labelSelectors,
			portContentElement: portElement,
			portContentSelectors: portSelectors
		};
		return portContainerElement;
	},
	_updatePortGroup: function(groupName) {
		var elementBBox = Rect(this.model.size());
		var portsMetrics = this.model._portSettingsData.getGroupPortsMetrics(groupName, elementBBox);
		for (var i = 0, n = portsMetrics.length; i < n; i++) {
			var metrics = portsMetrics[i];
			var portId = metrics.portId;
			var cached = this._portElementsCache[portId] || {};
			var portTransformation = metrics.portTransformation;
			var labelTransformation = metrics.labelTransformation;
			if (labelTransformation && cached.portLabelElement) {
				this.updateDOMSubtreeAttributes(cached.portLabelElement.node, labelTransformation.attrs, {
					rootBBox: new Rect(metrics.labelSize),
					selectors: cached.portLabelSelectors
				});
				this.applyPortTransform(cached.portLabelElement, labelTransformation, -portTransformation.angle || 0);
			}
			this.updateDOMSubtreeAttributes(cached.portElement.node, metrics.portAttrs, {
				rootBBox: new Rect(metrics.portSize),
				selectors: cached.portSelectors
			});
			this.applyPortTransform(cached.portElement, portTransformation);
		}
	},
	applyPortTransform: function(element, transformData, initialAngle) {
		var matrix = V_default.createSVGMatrix().rotate(initialAngle || 0).translate(transformData.x || 0, transformData.y || 0).rotate(transformData.angle || 0);
		element.transform(matrix, { absolute: true });
	},
	_getPortMarkup: function(port) {
		return port.markup || this.model.get("portMarkup") || this.model.portMarkup || this.portMarkup;
	},
	_getPortLabelMarkup: function(label) {
		return label.markup || this.model.get("portLabelMarkup") || this.model.portLabelMarkup || this.portLabelMarkup;
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/Element.mjs
const Element$1 = Cell.extend({
	defaults: {
		position: {
			x: 0,
			y: 0
		},
		size: {
			width: 1,
			height: 1
		},
		angle: 0
	},
	initialize: function() {
		this._initializePorts();
		Cell.prototype.initialize.apply(this, arguments);
	},
	_initializePorts: function() {},
	_refreshPorts: function() {},
	isElement: function() {
		return true;
	},
	position: function(x, y, opt) {
		const isSetter = isNumber(y);
		opt = (isSetter ? opt : x) || {};
		const { parentRelative, deep, restrictedArea } = opt;
		let parentPosition;
		if (parentRelative) {
			if (!this.graph) throw new Error("Element must be part of a graph.");
			const parent$1 = this.getParentCell();
			if (parent$1 && !parent$1.isLink()) parentPosition = parent$1.get("position");
		}
		if (isSetter) {
			if (parentPosition) {
				x += parentPosition.x;
				y += parentPosition.y;
			}
			if (deep || restrictedArea) {
				const { x: x0, y: y0 } = this.get("position");
				this.translate(x - x0, y - y0, opt);
			} else this.set("position", {
				x,
				y
			}, opt);
			return this;
		} else {
			const elementPosition = Point(this.get("position"));
			return parentRelative ? elementPosition.difference(parentPosition) : elementPosition;
		}
	},
	translate: function(tx, ty, opt) {
		tx = tx || 0;
		ty = ty || 0;
		if (tx === 0 && ty === 0) return this;
		opt = opt || {};
		opt.translateBy = opt.translateBy || this.id;
		var position$1 = this.get("position") || {
			x: 0,
			y: 0
		};
		var ra = opt.restrictedArea;
		if (ra && opt.translateBy === this.id) if (typeof ra === "function") {
			var newPosition = ra.call(this, position$1.x + tx, position$1.y + ty, opt);
			tx = newPosition.x - position$1.x;
			ty = newPosition.y - position$1.y;
		} else {
			var bbox$1 = this.getBBox({ deep: true });
			var dx = position$1.x - bbox$1.x;
			var dy = position$1.y - bbox$1.y;
			var x = Math.max(ra.x + dx, Math.min(ra.x + ra.width + dx - bbox$1.width, position$1.x + tx));
			var y = Math.max(ra.y + dy, Math.min(ra.y + ra.height + dy - bbox$1.height, position$1.y + ty));
			tx = x - position$1.x;
			ty = y - position$1.y;
		}
		var translatedPosition = {
			x: position$1.x + tx,
			y: position$1.y + ty
		};
		opt.tx = tx;
		opt.ty = ty;
		if (opt.transition) {
			if (!isObject(opt.transition)) opt.transition = {};
			this.transition("position", translatedPosition, assign({}, opt.transition, { valueFunction: interpolate.object }));
			invoke(this.getEmbeddedCells(), "translate", tx, ty, opt);
		} else {
			this.startBatch("translate", opt);
			this.set("position", translatedPosition, opt);
			invoke(this.getEmbeddedCells(), "translate", tx, ty, opt);
			this.stopBatch("translate", opt);
		}
		return this;
	},
	size: function(width$1, height$1, opt) {
		var currentSize = this.get("size");
		if (width$1 === void 0) return {
			width: currentSize.width,
			height: currentSize.height
		};
		if (isObject(width$1)) {
			opt = height$1;
			height$1 = isNumber(width$1.height) ? width$1.height : currentSize.height;
			width$1 = isNumber(width$1.width) ? width$1.width : currentSize.width;
		}
		return this.resize(width$1, height$1, opt);
	},
	resize: function(width$1, height$1, opt) {
		opt = opt || {};
		this.startBatch("resize", opt);
		if (opt.direction) {
			var currentSize = this.get("size");
			switch (opt.direction) {
				case "left":
				case "right":
					height$1 = currentSize.height;
					break;
				case "top":
				case "bottom":
					width$1 = currentSize.width;
					break;
			}
			var angle = normalizeAngle(this.get("angle") || 0);
			var bbox$1 = this.getBBox();
			var origin;
			if (angle) {
				var quadrant = {
					"top-right": 0,
					"right": 0,
					"top-left": 1,
					"top": 1,
					"bottom-left": 2,
					"left": 2,
					"bottom-right": 3,
					"bottom": 3
				}[opt.direction];
				if (opt.absolute) {
					quadrant += Math.floor((angle + 45) / 90);
					quadrant %= 4;
				}
				var fixedPoint = bbox$1[[
					"bottomLeft",
					"corner",
					"topRight",
					"origin"
				][quadrant]]();
				var imageFixedPoint = Point(fixedPoint).rotate(bbox$1.center(), -angle);
				var radius = Math.sqrt(width$1 * width$1 + height$1 * height$1) / 2;
				var alpha = quadrant * Math.PI / 2;
				alpha += Math.atan(quadrant % 2 == 0 ? height$1 / width$1 : width$1 / height$1);
				alpha -= toRad(angle);
				var center$1 = Point.fromPolar(radius, alpha, imageFixedPoint);
				origin = Point(center$1).offset(width$1 / -2, height$1 / -2);
			} else {
				origin = bbox$1.topLeft();
				switch (opt.direction) {
					case "top":
					case "top-right":
						origin.offset(0, bbox$1.height - height$1);
						break;
					case "left":
					case "bottom-left":
						origin.offset(bbox$1.width - width$1, 0);
						break;
					case "top-left":
						origin.offset(bbox$1.width - width$1, bbox$1.height - height$1);
						break;
				}
			}
			this.set("size", {
				width: width$1,
				height: height$1
			}, opt);
			this.position(origin.x, origin.y, opt);
		} else this.set("size", {
			width: width$1,
			height: height$1
		}, opt);
		this.stopBatch("resize", opt);
		return this;
	},
	scale: function(sx, sy, origin, opt) {
		var scaledBBox = this.getBBox().scale(sx, sy, origin);
		this.startBatch("scale", opt);
		this.position(scaledBBox.x, scaledBBox.y, opt);
		this.resize(scaledBBox.width, scaledBBox.height, opt);
		this.stopBatch("scale");
		return this;
	},
	fitEmbeds: function(opt) {
		return this.fitToChildren(opt);
	},
	fitToChildren: function(opt = {}) {
		const { graph } = this;
		if (!graph) throw new Error("Element must be part of a graph.");
		const childElements = this.getEmbeddedCells().filter((cell) => cell.isElement());
		if (childElements.length === 0) return this;
		this.startBatch("fit-embeds", opt);
		if (opt.deep) invoke(childElements, "fitToChildren", opt);
		this._fitToElements(Object.assign({ elements: childElements }, opt));
		this.stopBatch("fit-embeds");
		return this;
	},
	fitParent: function(opt = {}) {
		const { graph } = this;
		if (!graph) throw new Error("Element must be part of a graph.");
		if (opt.deep && opt.terminator && (opt.terminator === this || opt.terminator === this.id)) return this;
		const parentElement = this.getParentCell();
		if (!parentElement || !parentElement.isElement()) return this;
		const siblingElements = parentElement.getEmbeddedCells().filter((cell) => cell.isElement());
		if (siblingElements.length === 0) return this;
		this.startBatch("fit-parent", opt);
		parentElement._fitToElements(Object.assign({ elements: siblingElements }, opt));
		if (opt.deep) parentElement.fitParent(opt);
		this.stopBatch("fit-parent");
		return this;
	},
	_fitToElements: function(opt = {}) {
		const elementsBBox = this.graph.getCellsBBox(opt.elements);
		if (!elementsBBox) return;
		const { expandOnly, shrinkOnly } = opt;
		if (expandOnly && shrinkOnly) return;
		let { x, y, width: width$1, height: height$1 } = elementsBBox;
		const { left: left$3, right: right$3, top: top$3, bottom: bottom$3 } = normalizeSides(opt.padding);
		x -= left$3;
		y -= top$3;
		width$1 += left$3 + right$3;
		height$1 += bottom$3 + top$3;
		let resultBBox = new Rect(x, y, width$1, height$1);
		if (expandOnly) resultBBox = this.getBBox().union(resultBBox);
		else if (shrinkOnly) {
			const intersectionBBox = this.getBBox().intersect(resultBBox);
			if (!intersectionBBox) return;
			resultBBox = intersectionBBox;
		}
		this.set({
			position: {
				x: resultBBox.x,
				y: resultBBox.y
			},
			size: {
				width: resultBBox.width,
				height: resultBBox.height
			}
		}, opt);
	},
	rotate: function(angle, absolute$1, origin, opt) {
		if (origin) {
			var center$1 = this.getBBox().center();
			var size = this.get("size");
			var position$1 = this.get("position");
			center$1.rotate(origin, this.get("angle") - angle);
			var dx = center$1.x - size.width / 2 - position$1.x;
			var dy = center$1.y - size.height / 2 - position$1.y;
			this.startBatch("rotate", {
				angle,
				absolute: absolute$1,
				origin
			});
			this.position(position$1.x + dx, position$1.y + dy, opt);
			this.rotate(angle, absolute$1, null, opt);
			this.stopBatch("rotate");
		} else this.set("angle", absolute$1 ? angle : (this.get("angle") + angle) % 360, opt);
		return this;
	},
	angle: function() {
		return normalizeAngle(this.get("angle") || 0);
	},
	getBBox: function(opt = {}) {
		const { graph, attributes: attributes$1 } = this;
		const { deep, rotate } = opt;
		if (deep && graph) {
			const elements = this.getEmbeddedCells({
				deep: true,
				breadthFirst: true
			});
			elements.push(this);
			return graph.getCellsBBox(elements, opt);
		}
		const { angle = 0, position: { x, y }, size: { width: width$1, height: height$1 } } = attributes$1;
		const bbox$1 = new Rect(x, y, width$1, height$1);
		if (rotate) bbox$1.rotateAroundCenter(angle);
		return bbox$1;
	},
	getPointFromConnectedLink: function(link, endType) {
		var bbox$1 = this.getBBox();
		var center$1 = bbox$1.center();
		var endDef = link.get(endType);
		if (!endDef) return center$1;
		var portId = endDef.port;
		if (!portId || !this.hasPort(portId)) return center$1;
		var portGroup = this.portProp(portId, ["group"]);
		var portsPositions = this.getPortsPositions(portGroup);
		var portCenter = new Point(portsPositions[portId]).offset(bbox$1.origin());
		var angle = this.angle();
		if (angle) portCenter.rotate(center$1, -angle);
		return portCenter;
	}
});
assign(Element$1.prototype, elementPortPrototype);

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/Link.mjs
const Link = Cell.extend({
	defaultLabel: void 0,
	labelMarkup: void 0,
	_builtins: { defaultLabel: {
		markup: [{
			tagName: "rect",
			selector: "rect"
		}, {
			tagName: "text",
			selector: "text"
		}],
		attrs: {
			text: {
				fill: "#000000",
				fontSize: 14,
				textAnchor: "middle",
				textVerticalAnchor: "middle",
				pointerEvents: "none"
			},
			rect: {
				ref: "text",
				fill: "#ffffff",
				rx: 3,
				ry: 3,
				x: "calc(x)",
				y: "calc(y)",
				width: "calc(w)",
				height: "calc(h)"
			}
		},
		position: { distance: .5 }
	} },
	defaults: {
		source: {},
		target: {}
	},
	isLink: function() {
		return true;
	},
	disconnect: function(opt) {
		return this.set({
			source: {
				x: 0,
				y: 0
			},
			target: {
				x: 0,
				y: 0
			}
		}, opt);
	},
	source: function(source, args, opt) {
		if (source === void 0) return clone(this.get("source"));
		var setSource;
		var setOpt;
		var isCellProvided = source instanceof Cell;
		if (isCellProvided) {
			setSource = clone(args) || {};
			setSource.id = source.id;
			setOpt = opt;
			return this.set("source", setSource, setOpt);
		}
		var isPointProvided = !isPlainObject(source);
		if (isPointProvided) {
			setSource = clone(args) || {};
			setSource.x = source.x;
			setSource.y = source.y;
			setOpt = opt;
			return this.set("source", setSource, setOpt);
		}
		setSource = source;
		setOpt = args;
		return this.set("source", setSource, setOpt);
	},
	target: function(target, args, opt) {
		if (target === void 0) return clone(this.get("target"));
		var setTarget;
		var setOpt;
		var isCellProvided = target instanceof Cell;
		if (isCellProvided) {
			setTarget = clone(args) || {};
			setTarget.id = target.id;
			setOpt = opt;
			return this.set("target", setTarget, setOpt);
		}
		var isPointProvided = !isPlainObject(target);
		if (isPointProvided) {
			setTarget = clone(args) || {};
			setTarget.x = target.x;
			setTarget.y = target.y;
			setOpt = opt;
			return this.set("target", setTarget, setOpt);
		}
		setTarget = target;
		setOpt = args;
		return this.set("target", setTarget, setOpt);
	},
	router: function(name, args, opt) {
		if (name === void 0) {
			var router$1 = this.get("router");
			if (!router$1) return null;
			if (typeof router$1 === "object") return clone(router$1);
			return router$1;
		}
		var isRouterProvided = typeof name === "object" || typeof name === "function";
		var localRouter = isRouterProvided ? name : {
			name,
			args
		};
		var localOpt = isRouterProvided ? args : opt;
		return this.set("router", localRouter, localOpt);
	},
	connector: function(name, args, opt) {
		if (name === void 0) {
			var connector = this.get("connector");
			if (!connector) return null;
			if (typeof connector === "object") return clone(connector);
			return connector;
		}
		var isConnectorProvided = typeof name === "object" || typeof name === "function";
		var localConnector = isConnectorProvided ? name : {
			name,
			args
		};
		var localOpt = isConnectorProvided ? args : opt;
		return this.set("connector", localConnector, localOpt);
	},
	label: function(idx, label, opt) {
		var labels = this.labels();
		idx = isFinite(idx) && idx !== null ? idx | 0 : 0;
		if (idx < 0) idx = labels.length + idx;
		if (arguments.length <= 1) return this.prop(["labels", idx]);
		return this.prop(["labels", idx], label, opt);
	},
	labels: function(labels, opt) {
		if (arguments.length === 0) {
			labels = this.get("labels");
			if (!Array.isArray(labels)) return [];
			return labels.slice();
		}
		if (!Array.isArray(labels)) labels = [];
		return this.set("labels", labels, opt);
	},
	hasLabels: function() {
		const { labels } = this.attributes;
		return Array.isArray(labels) && labels.length > 0;
	},
	insertLabel: function(idx, label, opt) {
		if (!label) throw new Error("dia.Link: no label provided");
		var labels = this.labels();
		var n = labels.length;
		idx = isFinite(idx) && idx !== null ? idx | 0 : n;
		if (idx < 0) idx = n + idx + 1;
		labels.splice(idx, 0, label);
		return this.labels(labels, opt);
	},
	appendLabel: function(label, opt) {
		return this.insertLabel(-1, label, opt);
	},
	removeLabel: function(idx, opt) {
		var labels = this.labels();
		idx = isFinite(idx) && idx !== null ? idx | 0 : -1;
		labels.splice(idx, 1);
		return this.labels(labels, opt);
	},
	vertex: function(idx, vertex, opt) {
		var vertices = this.vertices();
		idx = isFinite(idx) && idx !== null ? idx | 0 : 0;
		if (idx < 0) idx = vertices.length + idx;
		if (arguments.length <= 1) return this.prop(["vertices", idx]);
		var setVertex = this._normalizeVertex(vertex);
		return this.prop(["vertices", idx], setVertex, opt);
	},
	vertices: function(vertices, opt) {
		if (arguments.length === 0) {
			vertices = this.get("vertices");
			if (!Array.isArray(vertices)) return [];
			return vertices.slice();
		}
		if (!Array.isArray(vertices)) vertices = [];
		var setVertices = [];
		for (var i = 0; i < vertices.length; i++) {
			var vertex = vertices[i];
			var setVertex = this._normalizeVertex(vertex);
			setVertices.push(setVertex);
		}
		return this.set("vertices", setVertices, opt);
	},
	insertVertex: function(idx, vertex, opt) {
		if (!vertex) throw new Error("dia.Link: no vertex provided");
		var vertices = this.vertices();
		var n = vertices.length;
		idx = isFinite(idx) && idx !== null ? idx | 0 : n;
		if (idx < 0) idx = n + idx + 1;
		var setVertex = this._normalizeVertex(vertex);
		vertices.splice(idx, 0, setVertex);
		return this.vertices(vertices, opt);
	},
	removeVertex: function(idx, opt) {
		var vertices = this.vertices();
		idx = isFinite(idx) && idx !== null ? idx | 0 : -1;
		vertices.splice(idx, 1);
		return this.vertices(vertices, opt);
	},
	_normalizeVertex: function(vertex) {
		var isPointProvided = !isPlainObject(vertex);
		if (isPointProvided) return {
			x: vertex.x,
			y: vertex.y
		};
		return vertex;
	},
	translate: function(tx, ty, opt) {
		opt = opt || {};
		opt.translateBy = opt.translateBy || this.id;
		opt.tx = tx;
		opt.ty = ty;
		return this.applyToPoints(function(p) {
			return {
				x: (p.x || 0) + tx,
				y: (p.y || 0) + ty
			};
		}, opt);
	},
	scale: function(sx, sy, origin, opt) {
		return this.applyToPoints(function(p) {
			return Point(p).scale(sx, sy, origin).toJSON();
		}, opt);
	},
	applyToPoints: function(fn$1, opt) {
		if (!isFunction(fn$1)) throw new TypeError("dia.Link: applyToPoints expects its first parameter to be a function.");
		var attrs = {};
		var { source, target } = this.attributes;
		if (!source.id) attrs.source = fn$1(source);
		if (!target.id) attrs.target = fn$1(target);
		var vertices = this.vertices();
		if (vertices.length > 0) attrs.vertices = vertices.map(fn$1);
		return this.set(attrs, opt);
	},
	getSourcePoint: function() {
		var sourceCell = this.getSourceCell();
		if (!sourceCell) return new Point(this.source());
		return sourceCell.getPointFromConnectedLink(this, "source");
	},
	getTargetPoint: function() {
		var targetCell = this.getTargetCell();
		if (!targetCell) return new Point(this.target());
		return targetCell.getPointFromConnectedLink(this, "target");
	},
	getPointFromConnectedLink: function() {
		return this.getPolyline().pointAt(.5);
	},
	getPolyline: function() {
		const points = [
			this.getSourcePoint(),
			...this.vertices().map(Point),
			this.getTargetPoint()
		];
		return new Polyline(points);
	},
	getBBox: function() {
		return this.getPolyline().bbox();
	},
	reparent: function(opt) {
		var newParent;
		if (this.graph) {
			var source = this.getSourceElement();
			var target = this.getTargetElement();
			var prevParent = this.getParentCell();
			if (source && target) if (source === target || source.isEmbeddedIn(target)) newParent = target;
			else if (target.isEmbeddedIn(source)) newParent = source;
			else newParent = this.graph.getCommonAncestor(source, target);
			if (prevParent && (!newParent || newParent.id !== prevParent.id)) prevParent.unembed(this, opt);
			if (newParent) newParent.embed(this, opt);
		}
		return newParent;
	},
	hasLoop: function(opt) {
		opt = opt || {};
		var { source, target } = this.attributes;
		var sourceId = source.id;
		var targetId = target.id;
		if (!sourceId || !targetId) return false;
		var loop = sourceId === targetId;
		if (!loop && opt.deep && this.graph) {
			var sourceElement = this.getSourceCell();
			var targetElement = this.getTargetCell();
			loop = sourceElement.isEmbeddedIn(targetElement) || targetElement.isEmbeddedIn(sourceElement);
		}
		return loop;
	},
	getSourceCell: function() {
		const { graph, attributes: attributes$1 } = this;
		var source = attributes$1.source;
		return source && source.id && graph && graph.getCell(source.id) || null;
	},
	getSourceElement: function() {
		var cell = this;
		var visited = {};
		do {
			if (visited[cell.id]) return null;
			visited[cell.id] = true;
			cell = cell.getSourceCell();
		} while (cell && cell.isLink());
		return cell;
	},
	getTargetCell: function() {
		const { graph, attributes: attributes$1 } = this;
		var target = attributes$1.target;
		return target && target.id && graph && graph.getCell(target.id) || null;
	},
	getTargetElement: function() {
		var cell = this;
		var visited = {};
		do {
			if (visited[cell.id]) return null;
			visited[cell.id] = true;
			cell = cell.getTargetCell();
		} while (cell && cell.isLink());
		return cell;
	},
	getRelationshipAncestor: function() {
		var connectionAncestor;
		if (this.graph) {
			var cells = [
				this,
				this.getSourceElement(),
				this.getTargetElement()
			].filter(function(item) {
				return !!item;
			});
			connectionAncestor = this.graph.getCommonAncestor.apply(this.graph, cells);
		}
		return connectionAncestor || null;
	},
	isRelationshipEmbeddedIn: function(cell) {
		var cellId = isString(cell) || isNumber(cell) ? cell : cell.id;
		var ancestor = this.getRelationshipAncestor();
		return !!ancestor && (ancestor.id === cellId || ancestor.isEmbeddedIn(cellId));
	},
	_getDefaultLabel: function() {
		var defaultLabel = this.get("defaultLabel") || this.defaultLabel || {};
		var label = {};
		label.markup = defaultLabel.markup || this.get("labelMarkup") || this.labelMarkup;
		label.position = defaultLabel.position;
		label.attrs = defaultLabel.attrs;
		label.size = defaultLabel.size;
		return label;
	}
}, { endsEqual: function(a, b) {
	var portsEqual = a.port === b.port || !a.port && !b.port;
	return a.id === b.id && portsEqual;
} });

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/env/index.mjs
const env = {
	_results: {},
	_tests: {
		svgforeignobject: function() {
			return !!document.createElementNS && /SVGForeignObject/.test({}.toString.call(document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")));
		},
		isSafari: function() {
			return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
		}
	},
	addTest: function(name, fn$1) {
		return this._tests[name] = fn$1;
	},
	test: function(name) {
		var fn$1 = this._tests[name];
		if (!fn$1) throw new Error("Test not defined (\"" + name + "\"). Use `joint.env.addTest(name, fn) to add a new test.`");
		var result$1 = this._results[name];
		if (typeof result$1 !== "undefined") return result$1;
		try {
			result$1 = fn$1();
		} catch (error) {
			result$1 = false;
		}
		this._results[name] = result$1;
		return result$1;
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/shapes/standard.mjs
var standard_exports = {};
__export(standard_exports, {
	BorderedImage: () => BorderedImage,
	Circle: () => Circle,
	Cylinder: () => Cylinder,
	DoubleLink: () => DoubleLink,
	Ellipse: () => Ellipse,
	EmbeddedImage: () => EmbeddedImage,
	HeaderedRectangle: () => HeaderedRectangle,
	Image: () => Image,
	InscribedImage: () => InscribedImage,
	Link: () => Link$1,
	Path: () => Path$1,
	Polygon: () => Polygon,
	Polyline: () => Polyline$1,
	Rectangle: () => Rectangle,
	ShadowLink: () => ShadowLink,
	TextBlock: () => TextBlock
});
const Rectangle = Element$1.define("standard.Rectangle", { attrs: {
	root: { cursor: "move" },
	body: {
		width: "calc(w)",
		height: "calc(h)",
		strokeWidth: 2,
		stroke: "#000000",
		fill: "#FFFFFF"
	},
	label: {
		textVerticalAnchor: "middle",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: "calc(h/2)",
		fontSize: 14,
		fill: "#333333"
	}
} }, { markup: [{
	tagName: "rect",
	selector: "body"
}, {
	tagName: "text",
	selector: "label"
}] });
const Circle = Element$1.define("standard.Circle", { attrs: {
	root: { cursor: "move" },
	body: {
		cx: "calc(s/2)",
		cy: "calc(s/2)",
		r: "calc(s/2)",
		strokeWidth: 2,
		stroke: "#333333",
		fill: "#FFFFFF"
	},
	label: {
		textVerticalAnchor: "middle",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: "calc(h/2)",
		fontSize: 14,
		fill: "#333333"
	}
} }, { markup: [{
	tagName: "circle",
	selector: "body"
}, {
	tagName: "text",
	selector: "label"
}] });
const Ellipse = Element$1.define("standard.Ellipse", { attrs: {
	root: { cursor: "move" },
	body: {
		cx: "calc(w/2)",
		cy: "calc(h/2)",
		rx: "calc(w/2)",
		ry: "calc(h/2)",
		strokeWidth: 2,
		stroke: "#333333",
		fill: "#FFFFFF"
	},
	label: {
		textVerticalAnchor: "middle",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: "calc(h/2)",
		fontSize: 14,
		fill: "#333333"
	}
} }, { markup: [{
	tagName: "ellipse",
	selector: "body"
}, {
	tagName: "text",
	selector: "label"
}] });
const Path$1 = Element$1.define("standard.Path", { attrs: {
	root: { cursor: "move" },
	body: {
		d: "M 0 0 H calc(w) V calc(h) H 0 Z",
		strokeWidth: 2,
		stroke: "#333333",
		fill: "#FFFFFF"
	},
	label: {
		textVerticalAnchor: "middle",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: "calc(h/2)",
		fontSize: 14,
		fill: "#333333"
	}
} }, { markup: [{
	tagName: "path",
	selector: "body"
}, {
	tagName: "text",
	selector: "label"
}] });
const Polygon = Element$1.define("standard.Polygon", { attrs: {
	root: { cursor: "move" },
	body: {
		points: "0 0 calc(w) 0 calc(w) calc(h) 0 calc(h)",
		strokeWidth: 2,
		stroke: "#333333",
		fill: "#FFFFFF"
	},
	label: {
		textVerticalAnchor: "middle",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: "calc(h/2)",
		fontSize: 14,
		fill: "#333333"
	}
} }, { markup: [{
	tagName: "polygon",
	selector: "body"
}, {
	tagName: "text",
	selector: "label"
}] });
const Polyline$1 = Element$1.define("standard.Polyline", { attrs: {
	root: { cursor: "move" },
	body: {
		points: "0 0 calc(w) 0 calc(w) calc(h) 0 calc(h)",
		strokeWidth: 2,
		stroke: "#333333",
		fill: "#FFFFFF"
	},
	label: {
		textVerticalAnchor: "middle",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: "calc(h/2)",
		fontSize: 14,
		fill: "#333333"
	}
} }, { markup: [{
	tagName: "polyline",
	selector: "body"
}, {
	tagName: "text",
	selector: "label"
}] });
const Image = Element$1.define("standard.Image", { attrs: {
	root: { cursor: "move" },
	image: {
		width: "calc(w)",
		height: "calc(h)"
	},
	label: {
		textVerticalAnchor: "top",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: "calc(h+10)",
		fontSize: 14,
		fill: "#333333"
	}
} }, { markup: [{
	tagName: "image",
	selector: "image"
}, {
	tagName: "text",
	selector: "label"
}] });
const BorderedImage = Element$1.define("standard.BorderedImage", { attrs: {
	root: { cursor: "move" },
	border: {
		width: "calc(w)",
		height: "calc(h)",
		stroke: "#333333",
		strokeWidth: 2
	},
	background: {
		width: "calc(w-1)",
		height: "calc(h-1)",
		x: .5,
		y: .5,
		fill: "#FFFFFF"
	},
	image: {
		width: "calc(w-1)",
		height: "calc(h-1)",
		x: .5,
		y: .5
	},
	label: {
		textVerticalAnchor: "top",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: "calc(h+10)",
		fontSize: 14,
		fill: "#333333"
	}
} }, { markup: [
	{
		tagName: "rect",
		selector: "background",
		attributes: { "stroke": "none" }
	},
	{
		tagName: "image",
		selector: "image"
	},
	{
		tagName: "rect",
		selector: "border",
		attributes: { "fill": "none" }
	},
	{
		tagName: "text",
		selector: "label"
	}
] });
const EmbeddedImage = Element$1.define("standard.EmbeddedImage", { attrs: {
	root: { cursor: "move" },
	body: {
		width: "calc(w)",
		height: "calc(h)",
		stroke: "#333333",
		fill: "#FFFFFF",
		strokeWidth: 2
	},
	image: {
		width: "calc(0.3*w)",
		height: "calc(h-20)",
		x: 10,
		y: 10,
		preserveAspectRatio: "xMidYMin"
	},
	label: {
		textVerticalAnchor: "top",
		textAnchor: "left",
		x: "calc(0.3*w+20)",
		y: 10,
		fontSize: 14,
		fill: "#333333"
	}
} }, { markup: [
	{
		tagName: "rect",
		selector: "body"
	},
	{
		tagName: "image",
		selector: "image"
	},
	{
		tagName: "text",
		selector: "label"
	}
] });
const InscribedImage = Element$1.define("standard.InscribedImage", { attrs: {
	root: { cursor: "move" },
	border: {
		rx: "calc(w/2)",
		ry: "calc(h/2)",
		cx: "calc(w/2)",
		cy: "calc(h/2)",
		stroke: "#333333",
		strokeWidth: 2
	},
	background: {
		rx: "calc(w/2)",
		ry: "calc(h/2)",
		cx: "calc(w/2)",
		cy: "calc(h/2)",
		fill: "#FFFFFF"
	},
	image: {
		width: "calc(0.68*w)",
		height: "calc(0.68*h)",
		x: "calc(0.16*w)",
		y: "calc(0.16*h)",
		preserveAspectRatio: "xMidYMid"
	},
	label: {
		textVerticalAnchor: "top",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: "calc(h+10)",
		fontSize: 14,
		fill: "#333333"
	}
} }, { markup: [
	{
		tagName: "ellipse",
		selector: "background"
	},
	{
		tagName: "image",
		selector: "image"
	},
	{
		tagName: "ellipse",
		selector: "border",
		attributes: { "fill": "none" }
	},
	{
		tagName: "text",
		selector: "label"
	}
] });
const HeaderedRectangle = Element$1.define("standard.HeaderedRectangle", { attrs: {
	root: { cursor: "move" },
	body: {
		width: "calc(w)",
		height: "calc(h)",
		strokeWidth: 2,
		stroke: "#000000",
		fill: "#FFFFFF"
	},
	header: {
		width: "calc(w)",
		height: 30,
		strokeWidth: 2,
		stroke: "#000000",
		fill: "#FFFFFF"
	},
	headerText: {
		textVerticalAnchor: "middle",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: 15,
		fontSize: 16,
		fill: "#333333"
	},
	bodyText: {
		textVerticalAnchor: "middle",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: "calc(h/2+15)",
		fontSize: 14,
		fill: "#333333"
	}
} }, { markup: [
	{
		tagName: "rect",
		selector: "body"
	},
	{
		tagName: "rect",
		selector: "header"
	},
	{
		tagName: "text",
		selector: "headerText"
	},
	{
		tagName: "text",
		selector: "bodyText"
	}
] });
var CYLINDER_TILT = 10;
const Cylinder = Element$1.define("standard.Cylinder", { attrs: {
	root: { cursor: "move" },
	body: {
		lateralArea: CYLINDER_TILT,
		fill: "#FFFFFF",
		stroke: "#333333",
		strokeWidth: 2
	},
	top: {
		cx: "calc(w/2)",
		cy: CYLINDER_TILT,
		rx: "calc(w/2)",
		ry: CYLINDER_TILT,
		fill: "#FFFFFF",
		stroke: "#333333",
		strokeWidth: 2
	},
	label: {
		textVerticalAnchor: "middle",
		textAnchor: "middle",
		x: "calc(w/2)",
		y: "calc(h+15)",
		fontSize: 14,
		fill: "#333333"
	}
} }, {
	markup: [
		{
			tagName: "path",
			selector: "body"
		},
		{
			tagName: "ellipse",
			selector: "top"
		},
		{
			tagName: "text",
			selector: "label"
		}
	],
	topRy: function(t, opt) {
		if (t === void 0) return this.attr("body/lateralArea");
		var bodyAttrs = { lateralArea: t };
		var isPercentageSetter = isPercentage(t);
		var ty = isPercentageSetter ? `calc(${parseFloat(t) / 100}*h)` : t;
		var topAttrs = {
			cy: ty,
			ry: ty
		};
		return this.attr({
			body: bodyAttrs,
			top: topAttrs
		}, opt);
	}
}, { attributes: { "lateral-area": {
	set: function(t, refBBox) {
		var isPercentageSetter = isPercentage(t);
		if (isPercentageSetter) t = parseFloat(t) / 100;
		var x = refBBox.x;
		var y = refBBox.y;
		var w = refBBox.width;
		var h = refBBox.height;
		var rx = w / 2;
		var ry = isPercentageSetter ? h * t : t;
		var kappa = V_default.KAPPA;
		var cx = kappa * rx;
		var cy = kappa * (isPercentageSetter ? h * t : t);
		var xLeft = x;
		var xCenter = x + w / 2;
		var xRight = x + w;
		var ySideTop = y + ry;
		var yCurveTop = ySideTop - ry;
		var ySideBottom = y + h - ry;
		var yCurveBottom = y + h;
		var data$1 = [
			"M",
			xLeft,
			ySideTop,
			"L",
			xLeft,
			ySideBottom,
			"C",
			x,
			ySideBottom + cy,
			xCenter - cx,
			yCurveBottom,
			xCenter,
			yCurveBottom,
			"C",
			xCenter + cx,
			yCurveBottom,
			xRight,
			ySideBottom + cy,
			xRight,
			ySideBottom,
			"L",
			xRight,
			ySideTop,
			"C",
			xRight,
			ySideTop - cy,
			xCenter + cx,
			yCurveTop,
			xCenter,
			yCurveTop,
			"C",
			xCenter - cx,
			yCurveTop,
			xLeft,
			ySideTop - cy,
			xLeft,
			ySideTop,
			"Z"
		];
		return { d: data$1.join(" ") };
	},
	unset: "d"
} } });
var foLabelMarkup = {
	tagName: "foreignObject",
	selector: "foreignObject",
	attributes: { "overflow": "hidden" },
	children: [{
		tagName: "div",
		namespaceURI: "http://www.w3.org/1999/xhtml",
		selector: "label",
		style: {
			width: "100%",
			height: "100%",
			position: "static",
			backgroundColor: "transparent",
			textAlign: "center",
			margin: 0,
			padding: "0px 5px",
			boxSizing: "border-box",
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		}
	}]
};
var svgLabelMarkup = {
	tagName: "text",
	selector: "label",
	attributes: { "text-anchor": "middle" }
};
var labelMarkup = env.test("svgforeignobject") ? foLabelMarkup : svgLabelMarkup;
const TextBlock = Element$1.define("standard.TextBlock", { attrs: {
	root: { cursor: "move" },
	body: {
		width: "calc(w)",
		height: "calc(h)",
		stroke: "#333333",
		fill: "#ffffff",
		strokeWidth: 2
	},
	foreignObject: {
		width: "calc(w)",
		height: "calc(h)"
	},
	label: { style: { fontSize: 14 } }
} }, { markup: [{
	tagName: "rect",
	selector: "body"
}, labelMarkup] }, { attributes: { text: {
	set: function(text, refBBox, node, attrs) {
		if (node instanceof HTMLElement) node.textContent = text;
		else {
			var style = attrs["style"] || {};
			var wrapValue = {
				text,
				width: -5,
				height: "100%"
			};
			var wrapAttrs = assign({ "text-vertical-anchor": "middle" }, style);
			attributes["text-wrap"].set.call(this, wrapValue, refBBox, node, wrapAttrs);
			return { fill: style.color || null };
		}
	},
	unset: function(node) {
		node.textContent = "";
		if (node instanceof SVGElement) return "fill";
	},
	position: function(text, refBBox, node) {
		if (node instanceof SVGElement) return refBBox.center();
	}
} } });
const Link$1 = Link.define("standard.Link", { attrs: {
	line: {
		connection: true,
		stroke: "#333333",
		strokeWidth: 2,
		strokeLinejoin: "round",
		targetMarker: {
			"type": "path",
			"d": "M 10 -5 0 0 10 5 z"
		}
	},
	wrapper: {
		connection: true,
		strokeWidth: 10,
		strokeLinejoin: "round"
	}
} }, { markup: [{
	tagName: "path",
	selector: "wrapper",
	attributes: {
		"fill": "none",
		"cursor": "pointer",
		"stroke": "transparent",
		"stroke-linecap": "round"
	}
}, {
	tagName: "path",
	selector: "line",
	attributes: {
		"fill": "none",
		"pointer-events": "none"
	}
}] });
const DoubleLink = Link.define("standard.DoubleLink", { attrs: {
	line: {
		connection: true,
		stroke: "#DDDDDD",
		strokeWidth: 4,
		strokeLinejoin: "round",
		targetMarker: {
			type: "path",
			stroke: "#000000",
			d: "M 10 -3 10 -10 -2 0 10 10 10 3"
		}
	},
	outline: {
		connection: true,
		stroke: "#000000",
		strokeWidth: 6,
		strokeLinejoin: "round"
	}
} }, { markup: [{
	tagName: "path",
	selector: "outline",
	attributes: {
		"fill": "none",
		"cursor": "pointer"
	}
}, {
	tagName: "path",
	selector: "line",
	attributes: {
		"fill": "none",
		"pointer-events": "none"
	}
}] });
const ShadowLink = Link.define("standard.ShadowLink", { attrs: {
	line: {
		connection: true,
		stroke: "#FF0000",
		strokeWidth: 20,
		strokeLinejoin: "round",
		targetMarker: {
			"type": "path",
			"stroke": "none",
			"d": "M 0 -10 -10 0 0 10 z"
		},
		sourceMarker: {
			"type": "path",
			"stroke": "none",
			"d": "M -10 -10 0 0 -10 10 0 10 0 -10 z"
		}
	},
	shadow: {
		connection: true,
		transform: "translate(3,6)",
		stroke: "#000000",
		strokeOpacity: .2,
		strokeWidth: 20,
		strokeLinejoin: "round",
		targetMarker: {
			"type": "path",
			"d": "M 0 -10 -10 0 0 10 z",
			"stroke": "none"
		},
		sourceMarker: {
			"type": "path",
			"stroke": "none",
			"d": "M -10 -10 0 0 -10 10 0 10 0 -10 z"
		}
	}
} }, { markup: [{
	tagName: "path",
	selector: "shadow",
	attributes: {
		"fill": "none",
		"pointer-events": "none"
	}
}, {
	tagName: "path",
	selector: "line",
	attributes: {
		"fill": "none",
		"cursor": "pointer"
	}
}] });

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/connectors/straight.mjs
const CornerTypes = {
	POINT: "point",
	CUBIC: "cubic",
	LINE: "line",
	GAP: "gap"
};
const DEFINED_CORNER_TYPES = Object.values(CornerTypes);
const CORNER_RADIUS$1 = 10;
const PRECISION$1 = 1;
const straight = function(sourcePoint, targetPoint, routePoints = [], opt = {}) {
	const { cornerType = CornerTypes.POINT, cornerRadius = CORNER_RADIUS$1, cornerPreserveAspectRatio = false, precision = PRECISION$1, raw = false } = opt;
	if (DEFINED_CORNER_TYPES.indexOf(cornerType) === -1) throw new Error("Invalid `cornerType` provided to `straight` connector.");
	let path;
	if (cornerType === CornerTypes.POINT || !cornerRadius) {
		const points = [sourcePoint].concat(routePoints).concat([targetPoint]);
		const polyline = new Polyline(points);
		path = new Path(polyline);
	} else {
		path = new Path();
		path.appendSegment(Path.createSegment("M", sourcePoint));
		let nextDistance;
		const routePointsLength = routePoints.length;
		for (let i = 0; i < routePointsLength; i++) {
			const curr = new Point(routePoints[i]);
			const prev = routePoints[i - 1] || sourcePoint;
			const next = routePoints[i + 1] || targetPoint;
			const prevDistance = nextDistance || curr.distance(prev) / 2;
			nextDistance = curr.distance(next) / 2;
			let startMove, endMove;
			if (!cornerPreserveAspectRatio) {
				startMove = -Math.min(cornerRadius, prevDistance);
				endMove = -Math.min(cornerRadius, nextDistance);
			} else startMove = endMove = -Math.min(cornerRadius, prevDistance, nextDistance);
			const cornerStart = curr.clone().move(prev, startMove).round(precision);
			const cornerEnd = curr.clone().move(next, endMove).round(precision);
			path.appendSegment(Path.createSegment("L", cornerStart));
			switch (cornerType) {
				case CornerTypes.CUBIC: {
					const _13$1 = 1 / 3;
					const _23$1 = 2 / 3;
					const control1 = new Point(_13$1 * cornerStart.x + _23$1 * curr.x, _23$1 * curr.y + _13$1 * cornerStart.y);
					const control2 = new Point(_13$1 * cornerEnd.x + _23$1 * curr.x, _23$1 * curr.y + _13$1 * cornerEnd.y);
					path.appendSegment(Path.createSegment("C", control1, control2, cornerEnd));
					break;
				}
				case CornerTypes.LINE:
					path.appendSegment(Path.createSegment("L", cornerEnd));
					break;
				case CornerTypes.GAP:
					path.appendSegment(Path.createSegment("M", cornerEnd));
					break;
			}
		}
		path.appendSegment(Path.createSegment("L", targetPoint));
	}
	return raw ? path : path.serialize();
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/connectors/jumpover.mjs
var JUMP_SIZE = 5;
var JUMP_TYPES = [
	"arc",
	"gap",
	"cubic"
];
var RADIUS = 0;
var CLOSE_PROXIMITY_PADDING = 1;
var IGNORED_CONNECTORS = ["smooth"];
var _13 = 1 / 3;
var _23 = 2 / 3;
function sortPointsAscending(p1, p2) {
	let { x: x1, y: y1 } = p1;
	let { x: x2, y: y2 } = p2;
	if (x1 > x2) {
		let swap = x1;
		x1 = x2;
		x2 = swap;
		swap = y1;
		y1 = y2;
		y2 = swap;
	}
	if (y1 > y2) {
		let swap = x1;
		x1 = x2;
		x2 = swap;
		swap = y1;
		y1 = y2;
		y2 = swap;
	}
	return [new Point(x1, y1), new Point(x2, y2)];
}
function overlapExists(line1, line2) {
	const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = sortPointsAscending(line1.start, line1.end);
	const [{ x: x3, y: y3 }, { x: x4, y: y4 }] = sortPointsAscending(line2.start, line2.end);
	const xMatch = x1 <= x4 && x3 <= x2;
	const yMatch = y1 <= y4 && y3 <= y2;
	return xMatch && yMatch;
}
/**
* Transform start/end and route into series of lines
* @param {g.point} sourcePoint start point
* @param {g.point} targetPoint end point
* @param {g.point[]} route optional list of route
* @return {g.line[]} [description]
*/
function createLines(sourcePoint, targetPoint, route) {
	var points = [].concat(sourcePoint, route, targetPoint);
	return points.reduce(function(resultLines, point$1, idx) {
		var nextPoint = points[idx + 1];
		if (nextPoint != null) resultLines[idx] = line$1(point$1, nextPoint);
		return resultLines;
	}, []);
}
function setupUpdating(jumpOverLinkView) {
	var paper = jumpOverLinkView.paper;
	var updateList = paper._jumpOverUpdateList;
	if (updateList == null) {
		updateList = paper._jumpOverUpdateList = [];
		var graph = paper.model;
		graph.on("batch:stop", function() {
			if (this.hasActiveBatch()) return;
			updateJumpOver(paper);
		});
		graph.on("reset", function() {
			updateList = paper._jumpOverUpdateList = [];
		});
	}
	if (updateList.indexOf(jumpOverLinkView) < 0) {
		updateList.push(jumpOverLinkView);
		jumpOverLinkView.listenToOnce(jumpOverLinkView.model, "change:connector remove", function() {
			updateList.splice(updateList.indexOf(jumpOverLinkView), 1);
		});
	}
}
/**
* Handler for a batch:stop event to force
* update of all registered links with jump over connector
* @param {object} batchEvent optional object with info about batch
*/
function updateJumpOver(paper) {
	var updateList = paper._jumpOverUpdateList;
	for (var i = 0; i < updateList.length; i++) {
		const linkView = updateList[i];
		const updateFlag = linkView.getFlag(linkView.constructor.Flags.CONNECTOR);
		linkView.requestUpdate(updateFlag);
	}
}
/**
* Utility function to collect all intersection points of a single
* line against group of other lines.
* @param {g.line} line where to find points
* @param {g.line[]} crossCheckLines lines to cross
* @return {g.point[]} list of intersection points
*/
function findLineIntersections(line$2, crossCheckLines) {
	return toArray(crossCheckLines).reduce(function(res, crossCheckLine) {
		var intersection$2 = line$2.intersection(crossCheckLine);
		if (intersection$2) res.push(intersection$2);
		return res;
	}, []);
}
/**
* Sorting function for list of points by their distance.
* @param {g.point} p1 first point
* @param {g.point} p2 second point
* @return {number} squared distance between points
*/
function sortPoints(p1, p2) {
	return line$1(p1, p2).squaredLength();
}
/**
* Split input line into multiple based on intersection points.
* @param {g.line} line input line to split
* @param {g.point[]} intersections points where to split the line
* @param {number} jumpSize the size of jump arc (length empty spot on a line)
* @return {g.line[]} list of lines being split
*/
function createJumps(line$2, intersections, jumpSize) {
	return intersections.reduce(function(resultLines, point$1, idx) {
		if (point$1.skip === true) return resultLines;
		var lastLine = resultLines.pop() || line$2;
		var jumpStart = point(point$1).move(lastLine.start, -jumpSize);
		var jumpEnd = point(point$1).move(lastLine.start, +jumpSize);
		var nextPoint = intersections[idx + 1];
		if (nextPoint != null) {
			var distance = jumpEnd.distance(nextPoint);
			if (distance <= jumpSize) {
				jumpEnd = nextPoint.move(lastLine.start, distance);
				nextPoint.skip = true;
			}
		} else {
			var endDistance = jumpStart.distance(lastLine.end);
			if (endDistance < jumpSize * 2 + CLOSE_PROXIMITY_PADDING) {
				resultLines.push(lastLine);
				return resultLines;
			}
		}
		var startDistance = jumpEnd.distance(lastLine.start);
		if (startDistance < jumpSize * 2 + CLOSE_PROXIMITY_PADDING) {
			resultLines.push(lastLine);
			return resultLines;
		}
		var jumpLine = line$1(jumpStart, jumpEnd);
		jumpLine.isJump = true;
		resultLines.push(line$1(lastLine.start, jumpStart), jumpLine, line$1(jumpEnd, lastLine.end));
		return resultLines;
	}, []);
}
/**
* Assemble `D` attribute of a SVG path by iterating given lines.
* @param {g.line[]} lines source lines to use
* @param {number} jumpSize the size of jump arc (length empty spot on a line)
* @param {number} radius the radius
* @return {string}
*/
function buildPath(lines, jumpSize, jumpType, radius) {
	var path = new Path();
	var segment;
	segment = Path.createSegment("M", lines[0].start);
	path.appendSegment(segment);
	toArray(lines).forEach(function(line$2, index) {
		if (line$2.isJump) {
			var angle, diff$1;
			var control1, control2;
			if (jumpType === "arc") {
				angle = -90;
				diff$1 = line$2.start.difference(line$2.end);
				var xAxisRotate = Number(diff$1.x < 0 || diff$1.x === 0 && diff$1.y < 0);
				if (xAxisRotate) angle += 180;
				var midpoint = line$2.midpoint();
				var centerLine = new Line(midpoint, line$2.end).rotate(midpoint, angle);
				var halfLine;
				halfLine = new Line(line$2.start, midpoint);
				control1 = halfLine.pointAt(2 / 3).rotate(line$2.start, angle);
				control2 = centerLine.pointAt(1 / 3).rotate(centerLine.end, -angle);
				segment = Path.createSegment("C", control1, control2, centerLine.end);
				path.appendSegment(segment);
				halfLine = new Line(midpoint, line$2.end);
				control1 = centerLine.pointAt(1 / 3).rotate(centerLine.end, angle);
				control2 = halfLine.pointAt(1 / 3).rotate(line$2.end, -angle);
				segment = Path.createSegment("C", control1, control2, line$2.end);
				path.appendSegment(segment);
			} else if (jumpType === "gap") {
				segment = Path.createSegment("M", line$2.end);
				path.appendSegment(segment);
			} else if (jumpType === "cubic") {
				angle = line$2.start.theta(line$2.end);
				var xOffset = jumpSize * .6;
				var yOffset = jumpSize * 1.35;
				diff$1 = line$2.start.difference(line$2.end);
				xAxisRotate = Number(diff$1.x < 0 || diff$1.x === 0 && diff$1.y < 0);
				if (xAxisRotate) yOffset *= -1;
				control1 = Point(line$2.start.x + xOffset, line$2.start.y + yOffset).rotate(line$2.start, angle);
				control2 = Point(line$2.end.x - xOffset, line$2.end.y + yOffset).rotate(line$2.end, angle);
				segment = Path.createSegment("C", control1, control2, line$2.end);
				path.appendSegment(segment);
			}
		} else {
			var nextLine = lines[index + 1];
			if (radius == 0 || !nextLine || nextLine.isJump) {
				segment = Path.createSegment("L", line$2.end);
				path.appendSegment(segment);
			} else buildRoundedSegment(radius, path, line$2.end, line$2.start, nextLine.end);
		}
	});
	return path;
}
function buildRoundedSegment(offset$1, path, curr, prev, next) {
	var prevDistance = curr.distance(prev) / 2;
	var nextDistance = curr.distance(next) / 2;
	var startMove = -Math.min(offset$1, prevDistance);
	var endMove = -Math.min(offset$1, nextDistance);
	var roundedStart = curr.clone().move(prev, startMove).round();
	var roundedEnd = curr.clone().move(next, endMove).round();
	var control1 = new Point(_13 * roundedStart.x + _23 * curr.x, _23 * curr.y + _13 * roundedStart.y);
	var control2 = new Point(_13 * roundedEnd.x + _23 * curr.x, _23 * curr.y + _13 * roundedEnd.y);
	var segment;
	segment = Path.createSegment("L", roundedStart);
	path.appendSegment(segment);
	segment = Path.createSegment("C", control1, control2, roundedEnd);
	path.appendSegment(segment);
}
/**
* Actual connector function that will be run on every update.
* @param {g.point} sourcePoint start point of this link
* @param {g.point} targetPoint end point of this link
* @param {g.point[]} route of this link
* @param {object} opt options
* @property {number} size optional size of a jump arc
* @return {string} created `D` attribute of SVG path
*/
const jumpover = function(sourcePoint, targetPoint, route, opt) {
	setupUpdating(this);
	var raw = opt.raw;
	var jumpSize = opt.size || JUMP_SIZE;
	var jumpType = opt.jump && ("" + opt.jump).toLowerCase();
	var radius = opt.radius || RADIUS;
	var ignoreConnectors = opt.ignoreConnectors || IGNORED_CONNECTORS;
	if (JUMP_TYPES.indexOf(jumpType) === -1) jumpType = JUMP_TYPES[0];
	var paper = this.paper;
	var graph = paper.model;
	var allLinks = graph.getLinks();
	if (allLinks.length === 1) return buildPath(createLines(sourcePoint, targetPoint, route), jumpSize, jumpType, radius);
	var thisModel = this.model;
	var thisIndex = allLinks.indexOf(thisModel);
	var defaultConnector = paper.options.defaultConnector || {};
	var links = allLinks.filter(function(link, idx) {
		var connector = link.get("connector") || defaultConnector;
		if (toArray(ignoreConnectors).includes(connector.name)) return false;
		if (idx > thisIndex) return connector.name !== "jumpover";
		return true;
	});
	var linkViews = links.map(function(link) {
		return paper.findViewByModel(link);
	});
	var thisLines = createLines(sourcePoint, targetPoint, route);
	var linkLines = linkViews.map(function(linkView) {
		if (linkView == null) return [];
		if (linkView === this) return thisLines;
		return createLines(linkView.sourcePoint, linkView.targetPoint, linkView.route);
	}, this);
	var jumpingLines = thisLines.reduce(function(resultLines, thisLine) {
		var intersections = links.reduce(function(res, link, i) {
			if (link !== thisModel) {
				const linkLinesToTest = linkLines[i].slice();
				const overlapIndex = linkLinesToTest.findIndex((line$2) => overlapExists(thisLine, line$2));
				if (overlapIndex > -1 && thisLine.containsPoint(linkLinesToTest[overlapIndex].end)) linkLinesToTest.splice(overlapIndex + 1, 1);
				const lineIntersections = findLineIntersections(thisLine, linkLinesToTest);
				res.push.apply(res, lineIntersections);
			}
			return res;
		}, []).sort(function(a, b) {
			return sortPoints(thisLine.start, a) - sortPoints(thisLine.start, b);
		});
		if (intersections.length > 0) resultLines.push.apply(resultLines, createJumps(thisLine, intersections, jumpSize));
		else resultLines.push(thisLine);
		return resultLines;
	}, []);
	var path = buildPath(jumpingLines, jumpSize, jumpType, radius);
	return raw ? path : path.serialize();
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/connectors/normal.mjs
const normal$1 = function(sourcePoint, targetPoint, route = [], opt = {}) {
	const { raw } = opt;
	const localOpt = {
		cornerType: "point",
		raw
	};
	return straight(sourcePoint, targetPoint, route, localOpt);
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/connectors/rounded.mjs
const CORNER_RADIUS = 10;
const PRECISION = 0;
const rounded = function(sourcePoint, targetPoint, route = [], opt = {}) {
	const { radius = CORNER_RADIUS, raw } = opt;
	const localOpt = {
		cornerType: "cubic",
		cornerRadius: radius,
		precision: PRECISION,
		raw
	};
	return straight(sourcePoint, targetPoint, route, localOpt);
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/connectors/smooth.mjs
const smooth = function(sourcePoint, targetPoint, route, opt) {
	var raw = opt && opt.raw;
	var path;
	if (route && route.length !== 0) {
		var points = [sourcePoint].concat(route).concat([targetPoint]);
		var curves = Curve.throughPoints(points);
		path = new Path(curves);
	} else {
		path = new Path();
		var segment;
		segment = Path.createSegment("M", sourcePoint);
		path.appendSegment(segment);
		if (Math.abs(sourcePoint.x - targetPoint.x) >= Math.abs(sourcePoint.y - targetPoint.y)) {
			var controlPointX = (sourcePoint.x + targetPoint.x) / 2;
			segment = Path.createSegment("C", controlPointX, sourcePoint.y, controlPointX, targetPoint.y, targetPoint.x, targetPoint.y);
			path.appendSegment(segment);
		} else {
			var controlPointY = (sourcePoint.y + targetPoint.y) / 2;
			segment = Path.createSegment("C", sourcePoint.x, controlPointY, targetPoint.x, controlPointY, targetPoint.x, targetPoint.y);
			path.appendSegment(segment);
		}
	}
	return raw ? path : path.serialize();
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/connectors/curve.mjs
const Directions$2 = {
	AUTO: "auto",
	HORIZONTAL: "horizontal",
	VERTICAL: "vertical",
	CLOSEST_POINT: "closest-point",
	OUTWARDS: "outwards"
};
const TangentDirections = {
	UP: "up",
	DOWN: "down",
	LEFT: "left",
	RIGHT: "right",
	AUTO: "auto",
	CLOSEST_POINT: "closest-point",
	OUTWARDS: "outwards"
};
const curve = function(sourcePoint, targetPoint, route = [], opt = {}, linkView) {
	const raw = Boolean(opt.raw);
	const { direction = Directions$2.AUTO, precision = 3 } = opt;
	const options = {
		coeff: opt.distanceCoefficient || .6,
		angleTangentCoefficient: opt.angleTangentCoefficient || 80,
		tau: opt.tension || .5,
		sourceTangent: opt.sourceTangent ? new Point(opt.sourceTangent) : null,
		targetTangent: opt.targetTangent ? new Point(opt.targetTangent) : null,
		rotate: Boolean(opt.rotate)
	};
	if (typeof opt.sourceDirection === "string") options.sourceDirection = opt.sourceDirection;
	else if (typeof opt.sourceDirection === "number") options.sourceDirection = new Point(1, 0).rotate(null, opt.sourceDirection);
	else options.sourceDirection = opt.sourceDirection ? new Point(opt.sourceDirection).normalize() : null;
	if (typeof opt.targetDirection === "string") options.targetDirection = opt.targetDirection;
	else if (typeof opt.targetDirection === "number") options.targetDirection = new Point(1, 0).rotate(null, opt.targetDirection);
	else options.targetDirection = opt.targetDirection ? new Point(opt.targetDirection).normalize() : null;
	const completeRoute = [
		sourcePoint,
		...route,
		targetPoint
	].map((p) => new Point(p));
	let sourceTangent;
	if (options.sourceTangent) sourceTangent = options.sourceTangent;
	else {
		const sourceDirection = getSourceTangentDirection(linkView, completeRoute, direction, options);
		const tangentLength = completeRoute[0].distance(completeRoute[1]) * options.coeff;
		const pointsVector = completeRoute[1].difference(completeRoute[0]).normalize();
		const angle = angleBetweenVectors(sourceDirection, pointsVector);
		if (angle > Math.PI / 4) {
			const updatedLength = tangentLength + (angle - Math.PI / 4) * options.angleTangentCoefficient;
			sourceTangent = sourceDirection.clone().scale(updatedLength, updatedLength);
		} else sourceTangent = sourceDirection.clone().scale(tangentLength, tangentLength);
	}
	let targetTangent;
	if (options.targetTangent) targetTangent = options.targetTangent;
	else {
		const targetDirection = getTargetTangentDirection(linkView, completeRoute, direction, options);
		const last$1 = completeRoute.length - 1;
		const tangentLength = completeRoute[last$1 - 1].distance(completeRoute[last$1]) * options.coeff;
		const pointsVector = completeRoute[last$1 - 1].difference(completeRoute[last$1]).normalize();
		const angle = angleBetweenVectors(targetDirection, pointsVector);
		if (angle > Math.PI / 4) {
			const updatedLength = tangentLength + (angle - Math.PI / 4) * options.angleTangentCoefficient;
			targetTangent = targetDirection.clone().scale(updatedLength, updatedLength);
		} else targetTangent = targetDirection.clone().scale(tangentLength, tangentLength);
	}
	const catmullRomCurves = createCatmullRomCurves(completeRoute, sourceTangent, targetTangent, options);
	const bezierCurves = catmullRomCurves.map((curve$1) => catmullRomToBezier(curve$1, options));
	const path = new Path(bezierCurves).round(precision);
	return raw ? path : path.serialize();
};
curve.Directions = Directions$2;
curve.TangentDirections = TangentDirections;
function getHorizontalSourceDirection(linkView, route, options) {
	const { sourceBBox } = linkView;
	let sourceSide;
	let rotation;
	if (!linkView.sourceView) if (sourceBBox.x > route[1].x) sourceSide = "right";
	else sourceSide = "left";
	else {
		rotation = linkView.sourceView.model.angle();
		if (options.rotate && rotation) {
			const unrotatedBBox = linkView.sourceView.getNodeUnrotatedBBox(linkView.sourceView.el);
			const sourcePoint = route[0].clone();
			sourcePoint.rotate(sourceBBox.center(), rotation);
			sourceSide = unrotatedBBox.sideNearestToPoint(sourcePoint);
		} else sourceSide = sourceBBox.sideNearestToPoint(route[0]);
	}
	let direction;
	switch (sourceSide) {
		case "left":
			direction = new Point(-1, 0);
			break;
		case "right":
		default:
			direction = new Point(1, 0);
			break;
	}
	if (options.rotate && rotation) direction.rotate(null, -rotation);
	return direction;
}
function getHorizontalTargetDirection(linkView, route, options) {
	const { targetBBox } = linkView;
	let targetSide;
	let rotation;
	if (!linkView.targetView) if (targetBBox.x > route[route.length - 2].x) targetSide = "left";
	else targetSide = "right";
	else {
		rotation = linkView.targetView.model.angle();
		if (options.rotate && rotation) {
			const unrotatedBBox = linkView.targetView.getNodeUnrotatedBBox(linkView.targetView.el);
			const targetPoint = route[route.length - 1].clone();
			targetPoint.rotate(targetBBox.center(), rotation);
			targetSide = unrotatedBBox.sideNearestToPoint(targetPoint);
		} else targetSide = targetBBox.sideNearestToPoint(route[route.length - 1]);
	}
	let direction;
	switch (targetSide) {
		case "left":
			direction = new Point(-1, 0);
			break;
		case "right":
		default:
			direction = new Point(1, 0);
			break;
	}
	if (options.rotate && rotation) direction.rotate(null, -rotation);
	return direction;
}
function getVerticalSourceDirection(linkView, route, options) {
	const { sourceBBox } = linkView;
	let sourceSide;
	let rotation;
	if (!linkView.sourceView) if (sourceBBox.y > route[1].y) sourceSide = "bottom";
	else sourceSide = "top";
	else {
		rotation = linkView.sourceView.model.angle();
		if (options.rotate && rotation) {
			const unrotatedBBox = linkView.sourceView.getNodeUnrotatedBBox(linkView.sourceView.el);
			const sourcePoint = route[0].clone();
			sourcePoint.rotate(sourceBBox.center(), rotation);
			sourceSide = unrotatedBBox.sideNearestToPoint(sourcePoint);
		} else sourceSide = sourceBBox.sideNearestToPoint(route[0]);
	}
	let direction;
	switch (sourceSide) {
		case "top":
			direction = new Point(0, -1);
			break;
		case "bottom":
		default:
			direction = new Point(0, 1);
			break;
	}
	if (options.rotate && rotation) direction.rotate(null, -rotation);
	return direction;
}
function getVerticalTargetDirection(linkView, route, options) {
	const { targetBBox } = linkView;
	let targetSide;
	let rotation;
	if (!linkView.targetView) if (targetBBox.y > route[route.length - 2].y) targetSide = "top";
	else targetSide = "bottom";
	else {
		rotation = linkView.targetView.model.angle();
		if (options.rotate && rotation) {
			const unrotatedBBox = linkView.targetView.getNodeUnrotatedBBox(linkView.targetView.el);
			const targetPoint = route[route.length - 1].clone();
			targetPoint.rotate(targetBBox.center(), rotation);
			targetSide = unrotatedBBox.sideNearestToPoint(targetPoint);
		} else targetSide = targetBBox.sideNearestToPoint(route[route.length - 1]);
	}
	let direction;
	switch (targetSide) {
		case "top":
			direction = new Point(0, -1);
			break;
		case "bottom":
		default:
			direction = new Point(0, 1);
			break;
	}
	if (options.rotate && rotation) direction.rotate(null, -rotation);
	return direction;
}
function getAutoSourceDirection(linkView, route, options) {
	const { sourceBBox } = linkView;
	let sourceSide;
	let rotation;
	if (!linkView.sourceView) sourceSide = sourceBBox.sideNearestToPoint(route[1]);
	else {
		rotation = linkView.sourceView.model.angle();
		if (options.rotate && rotation) {
			const unrotatedBBox = linkView.sourceView.getNodeUnrotatedBBox(linkView.sourceView.el);
			const sourcePoint = route[0].clone();
			sourcePoint.rotate(sourceBBox.center(), rotation);
			sourceSide = unrotatedBBox.sideNearestToPoint(sourcePoint);
		} else sourceSide = sourceBBox.sideNearestToPoint(route[0]);
	}
	let direction;
	switch (sourceSide) {
		case "top":
			direction = new Point(0, -1);
			break;
		case "bottom":
			direction = new Point(0, 1);
			break;
		case "right":
			direction = new Point(1, 0);
			break;
		case "left":
			direction = new Point(-1, 0);
			break;
	}
	if (options.rotate && rotation) direction.rotate(null, -rotation);
	return direction;
}
function getAutoTargetDirection(linkView, route, options) {
	const { targetBBox } = linkView;
	let targetSide;
	let rotation;
	if (!linkView.targetView) targetSide = targetBBox.sideNearestToPoint(route[route.length - 2]);
	else {
		rotation = linkView.targetView.model.angle();
		if (options.rotate && rotation) {
			const unrotatedBBox = linkView.targetView.getNodeUnrotatedBBox(linkView.targetView.el);
			const targetPoint = route[route.length - 1].clone();
			targetPoint.rotate(targetBBox.center(), rotation);
			targetSide = unrotatedBBox.sideNearestToPoint(targetPoint);
		} else targetSide = targetBBox.sideNearestToPoint(route[route.length - 1]);
	}
	let direction;
	switch (targetSide) {
		case "top":
			direction = new Point(0, -1);
			break;
		case "bottom":
			direction = new Point(0, 1);
			break;
		case "right":
			direction = new Point(1, 0);
			break;
		case "left":
			direction = new Point(-1, 0);
			break;
	}
	if (options.rotate && rotation) direction.rotate(null, -rotation);
	return direction;
}
function getClosestPointSourceDirection(linkView, route, options) {
	return route[1].difference(route[0]).normalize();
}
function getClosestPointTargetDirection(linkView, route, options) {
	const last$1 = route.length - 1;
	return route[last$1 - 1].difference(route[last$1]).normalize();
}
function getOutwardsSourceDirection(linkView, route, options) {
	const { sourceBBox } = linkView;
	const sourceCenter = sourceBBox.center();
	return route[0].difference(sourceCenter).normalize();
}
function getOutwardsTargetDirection(linkView, route, options) {
	const { targetBBox } = linkView;
	const targetCenter = targetBBox.center();
	return route[route.length - 1].difference(targetCenter).normalize();
}
function getSourceTangentDirection(linkView, route, direction, options) {
	if (options.sourceDirection) switch (options.sourceDirection) {
		case TangentDirections.UP: return new Point(0, -1);
		case TangentDirections.DOWN: return new Point(0, 1);
		case TangentDirections.LEFT: return new Point(-1, 0);
		case TangentDirections.RIGHT: return new Point(1, 0);
		case TangentDirections.AUTO: return getAutoSourceDirection(linkView, route, options);
		case TangentDirections.CLOSEST_POINT: return getClosestPointSourceDirection(linkView, route, options);
		case TangentDirections.OUTWARDS: return getOutwardsSourceDirection(linkView, route, options);
		default: return options.sourceDirection;
	}
	switch (direction) {
		case Directions$2.HORIZONTAL: return getHorizontalSourceDirection(linkView, route, options);
		case Directions$2.VERTICAL: return getVerticalSourceDirection(linkView, route, options);
		case Directions$2.CLOSEST_POINT: return getClosestPointSourceDirection(linkView, route, options);
		case Directions$2.OUTWARDS: return getOutwardsSourceDirection(linkView, route, options);
		case Directions$2.AUTO:
		default: return getAutoSourceDirection(linkView, route, options);
	}
}
function getTargetTangentDirection(linkView, route, direction, options) {
	if (options.targetDirection) switch (options.targetDirection) {
		case TangentDirections.UP: return new Point(0, -1);
		case TangentDirections.DOWN: return new Point(0, 1);
		case TangentDirections.LEFT: return new Point(-1, 0);
		case TangentDirections.RIGHT: return new Point(1, 0);
		case TangentDirections.AUTO: return getAutoTargetDirection(linkView, route, options);
		case TangentDirections.CLOSEST_POINT: return getClosestPointTargetDirection(linkView, route, options);
		case TangentDirections.OUTWARDS: return getOutwardsTargetDirection(linkView, route, options);
		default: return options.targetDirection;
	}
	switch (direction) {
		case Directions$2.HORIZONTAL: return getHorizontalTargetDirection(linkView, route, options);
		case Directions$2.VERTICAL: return getVerticalTargetDirection(linkView, route, options);
		case Directions$2.CLOSEST_POINT: return getClosestPointTargetDirection(linkView, route, options);
		case Directions$2.OUTWARDS: return getOutwardsTargetDirection(linkView, route, options);
		case Directions$2.AUTO:
		default: return getAutoTargetDirection(linkView, route, options);
	}
}
function rotateVector(vector, angle) {
	const cos$3 = Math.cos(angle);
	const sin$3 = Math.sin(angle);
	const x = cos$3 * vector.x - sin$3 * vector.y;
	const y = sin$3 * vector.x + cos$3 * vector.y;
	vector.x = x;
	vector.y = y;
}
function angleBetweenVectors(v1, v2) {
	let cos$3 = v1.dot(v2) / (v1.magnitude() * v2.magnitude());
	if (cos$3 < -1) cos$3 = -1;
	if (cos$3 > 1) cos$3 = 1;
	return Math.acos(cos$3);
}
function determinant(v1, v2) {
	return v1.x * v2.y - v1.y * v2.x;
}
function createCatmullRomCurves(points, sourceTangent, targetTangent, options) {
	const { tau, coeff } = options;
	const distances = [];
	const tangents = [];
	const catmullRomCurves = [];
	const n = points.length - 1;
	for (let i = 0; i < n; i++) distances[i] = points[i].distance(points[i + 1]);
	tangents[0] = sourceTangent;
	tangents[n] = targetTangent;
	for (let i = 1; i < n; i++) {
		let tpPrev;
		let tpNext;
		if (i === 1) tpPrev = points[i - 1].clone().offset(tangents[i - 1].x, tangents[i - 1].y);
		else tpPrev = points[i - 1].clone();
		if (i === n - 1) tpNext = points[i + 1].clone().offset(tangents[i + 1].x, tangents[i + 1].y);
		else tpNext = points[i + 1].clone();
		const v1 = tpPrev.difference(points[i]).normalize();
		const v2 = tpNext.difference(points[i]).normalize();
		const vAngle = angleBetweenVectors(v1, v2);
		let rot = (Math.PI - vAngle) / 2;
		let t;
		const vectorDeterminant = determinant(v1, v2);
		let pointsDeterminant;
		pointsDeterminant = determinant(points[i].difference(points[i + 1]), points[i].difference(points[i - 1]));
		if (vectorDeterminant < 0) rot = -rot;
		if (vAngle < Math.PI / 2 && (rot < 0 && pointsDeterminant < 0 || rot > 0 && pointsDeterminant > 0)) rot = rot - Math.PI;
		t = v2.clone();
		rotateVector(t, rot);
		const t1 = t.clone();
		const t2 = t.clone();
		const scaleFactor1 = distances[i - 1] * coeff;
		const scaleFactor2 = distances[i] * coeff;
		t1.scale(scaleFactor1, scaleFactor1);
		t2.scale(scaleFactor2, scaleFactor2);
		tangents[i] = [t1, t2];
	}
	for (let i = 0; i < n; i++) {
		let p0;
		let p3;
		if (i === 0) p0 = points[i + 1].difference(tangents[i].x / tau, tangents[i].y / tau);
		else p0 = points[i + 1].difference(tangents[i][1].x / tau, tangents[i][1].y / tau);
		if (i === n - 1) p3 = points[i].clone().offset(tangents[i + 1].x / tau, tangents[i + 1].y / tau);
		else p3 = points[i].difference(tangents[i + 1][0].x / tau, tangents[i + 1][0].y / tau);
		catmullRomCurves[i] = [
			p0,
			points[i],
			points[i + 1],
			p3
		];
	}
	return catmullRomCurves;
}
function catmullRomToBezier(points, options) {
	const { tau } = options;
	const bcp1 = new Point();
	bcp1.x = points[1].x + (points[2].x - points[0].x) / (6 * tau);
	bcp1.y = points[1].y + (points[2].y - points[0].y) / (6 * tau);
	const bcp2 = new Point();
	bcp2.x = points[2].x + (points[3].x - points[1].x) / (6 * tau);
	bcp2.y = points[2].y + (points[3].y - points[1].y) / (6 * tau);
	return new Curve(points[1], bcp1, bcp2, points[2]);
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/connectors/index.mjs
var connectors_exports = {};
__export(connectors_exports, {
	curve: () => curve,
	jumpover: () => jumpover,
	normal: () => normal$1,
	rounded: () => rounded,
	smooth: () => smooth,
	straight: () => straight
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/ViewBase.mjs
var ViewBase = function(options) {
	this.cid = uniqueId("view");
	this.preinitialize.apply(this, arguments);
	assign(this, pick(options, viewOptions));
	this._ensureElement();
	this.initialize.apply(this, arguments);
};
var delegateEventSplitter = /^(\S+)\s*(.*)$/;
var viewOptions = [
	"model",
	"collection",
	"el",
	"id",
	"attributes",
	"className",
	"tagName",
	"events",
	"style"
];
assign(ViewBase.prototype, Events, {
	tagName: "div",
	$: function(selector) {
		return this.$el.find(selector);
	},
	preinitialize: function() {},
	initialize: function() {},
	render: function() {
		return this;
	},
	remove: function() {
		this._removeElement();
		this.stopListening();
		return this;
	},
	_removeElement: function() {
		this.$el.remove();
	},
	setElement: function(element) {
		this.undelegateEvents();
		this._setElement(element);
		this.delegateEvents();
		return this;
	},
	_setElement: function(el) {
		this.$el = el instanceof Dom_default ? el : Dom_default(el);
		this.el = this.$el[0];
	},
	delegateEvents: function(events) {
		events || (events = result(this, "events"));
		if (!events) return this;
		this.undelegateEvents();
		for (var key in events) {
			var method = events[key];
			if (!isFunction(method)) method = this[method];
			if (!method) continue;
			var match = key.match(delegateEventSplitter);
			this.delegate(match[1], match[2], method.bind(this));
		}
		return this;
	},
	delegate: function(eventName, selector, listener) {
		this.$el.on(eventName + ".delegateEvents" + this.cid, selector, listener);
		return this;
	},
	undelegateEvents: function() {
		if (this.$el) this.$el.off(".delegateEvents" + this.cid);
		return this;
	},
	undelegate: function(eventName, selector, listener) {
		this.$el.off(eventName + ".delegateEvents" + this.cid, selector, listener);
		return this;
	},
	_createElement: function(tagName) {
		return document.createElement(tagName);
	},
	_ensureElement: function() {
		if (!this.el) {
			var attrs = assign({}, result(this, "attributes"));
			if (this.id) attrs.id = result(this, "id");
			if (this.className) attrs["class"] = result(this, "className");
			this.setElement(this._createElement(result(this, "tagName")));
			this._setAttributes(attrs);
		} else this.setElement(result(this, "el"));
	},
	_setAttributes: function(attributes$1) {
		this.$el.attr(attributes$1);
	}
});
ViewBase.extend = extend;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/View.mjs
const views = {};
const View = ViewBase.extend({
	options: {},
	theme: null,
	themeClassNamePrefix: addClassNamePrefix("theme-"),
	requireSetThemeOverride: false,
	defaultTheme: config.defaultTheme,
	children: null,
	childNodes: null,
	DETACHABLE: true,
	UPDATE_PRIORITY: 2,
	FLAG_INSERT: 1 << 30,
	FLAG_REMOVE: 1 << 29,
	FLAG_INIT: 1 << 28,
	constructor: function(options) {
		this.requireSetThemeOverride = options && !!options.theme;
		this.options = assign({}, this.options, options);
		ViewBase.call(this, options);
	},
	initialize: function() {
		views[this.cid] = this;
		this.setTheme(this.options.theme || this.defaultTheme);
		this.init();
	},
	unmount: function() {
		if (this.svgElement) this.vel.remove();
		else this.$el.remove();
	},
	isMounted: function() {
		return this.el.parentNode !== null;
	},
	renderChildren: function(children$1) {
		children$1 || (children$1 = result(this, "children"));
		if (children$1) {
			var isSVG = this.svgElement;
			var namespace = V_default.namespace[isSVG ? "svg" : "xhtml"];
			var doc = parseDOMJSON(children$1, namespace);
			(isSVG ? this.vel : this.$el).empty().append(doc.fragment);
			this.childNodes = doc.selectors;
		}
		return this;
	},
	findAttributeNode: function(attributeName, node) {
		let currentNode = node;
		while (currentNode && currentNode.nodeType === 1) {
			if (currentNode.getAttribute(attributeName)) return currentNode;
			if (currentNode === this.el) return null;
			currentNode = currentNode.parentNode;
		}
		return null;
	},
	findAttribute: function(attributeName, node) {
		const matchedNode = this.findAttributeNode(attributeName, node);
		return matchedNode && matchedNode.getAttribute(attributeName);
	},
	_ensureElement: function() {
		if (!this.el) {
			var tagName = result(this, "tagName");
			var attrs = assign({}, result(this, "attributes"));
			var style = assign({}, result(this, "style"));
			if (this.id) attrs.id = result(this, "id");
			this.setElement(this._createElement(tagName));
			this._setAttributes(attrs);
			this._setStyle(style);
		} else this.setElement(result(this, "el"));
		this._ensureElClassName();
	},
	_setAttributes: function(attrs) {
		if (this.svgElement) this.vel.attr(attrs);
		else this.$el.attr(attrs);
	},
	_setStyle: function(style) {
		this.$el.css(style);
	},
	_createElement: function(tagName) {
		if (this.svgElement) return document.createElementNS(V_default.namespace.svg, tagName);
		else return document.createElement(tagName);
	},
	_setElement: function(el) {
		this.$el = el instanceof Dom_default ? el : Dom_default(el);
		this.el = this.$el[0];
		if (this.svgElement) this.vel = V_default(this.el);
	},
	_ensureElClassName: function() {
		var className$1 = result(this, "className");
		if (!className$1) return;
		var prefixedClassName = addClassNamePrefix(className$1);
		if (this.svgElement) this.vel.removeClass(className$1).addClass(prefixedClassName);
		else this.$el.removeClass(className$1).addClass(prefixedClassName);
	},
	init: function() {},
	onRender: function() {},
	confirmUpdate: function() {
		return 0;
	},
	setTheme: function(theme, opt) {
		opt = opt || {};
		if (this.theme && this.requireSetThemeOverride && !opt.override) return this;
		this.removeThemeClassName();
		this.addThemeClassName(theme);
		this.onSetTheme(this.theme, theme);
		this.theme = theme;
		return this;
	},
	addThemeClassName: function(theme) {
		theme = theme || this.theme;
		if (!theme) return this;
		var className$1 = this.themeClassNamePrefix + theme;
		if (this.svgElement) this.vel.addClass(className$1);
		else this.$el.addClass(className$1);
		return this;
	},
	removeThemeClassName: function(theme) {
		theme = theme || this.theme;
		var className$1 = this.themeClassNamePrefix + theme;
		if (this.svgElement) this.vel.removeClass(className$1);
		else this.$el.removeClass(className$1);
		return this;
	},
	onSetTheme: function(oldTheme, newTheme) {},
	remove: function() {
		this.onRemove();
		this.undelegateDocumentEvents();
		views[this.cid] = null;
		ViewBase.prototype.remove.apply(this, arguments);
		return this;
	},
	onRemove: function() {},
	getEventNamespace: function() {
		return ".joint-event-ns-" + this.cid;
	},
	delegateElementEvents: function(element, events, data$1) {
		if (!events) return this;
		data$1 || (data$1 = {});
		var eventNS = this.getEventNamespace();
		for (var eventName in events) {
			var method = events[eventName];
			if (typeof method !== "function") method = this[method];
			if (!method) continue;
			Dom_default(element).on(eventName + eventNS, data$1, method.bind(this));
		}
		return this;
	},
	undelegateElementEvents: function(element) {
		Dom_default(element).off(this.getEventNamespace());
		return this;
	},
	delegateDocumentEvents: function(events, data$1) {
		events || (events = result(this, "documentEvents"));
		return this.delegateElementEvents(document, events, data$1);
	},
	undelegateDocumentEvents: function() {
		return this.undelegateElementEvents(document);
	},
	eventData: function(evt, data$1) {
		if (!evt) throw new Error("eventData(): event object required.");
		var currentData = evt.data;
		var key = "__" + this.cid + "__";
		if (data$1 === void 0) {
			if (!currentData) return {};
			return currentData[key] || {};
		}
		currentData || (currentData = evt.data = {});
		currentData[key] || (currentData[key] = {});
		assign(currentData[key], data$1);
		return this;
	},
	stopPropagation: function(evt) {
		this.eventData(evt, { propagationStopped: true });
		return this;
	},
	isPropagationStopped: function(evt) {
		return !!this.eventData(evt).propagationStopped;
	}
}, { extend: function() {
	var args = Array.from(arguments);
	var protoProps = args[0] && assign({}, args[0]) || {};
	var staticProps = args[1] && assign({}, args[1]) || {};
	var renderFn = protoProps.render || this.prototype && this.prototype.render || null;
	protoProps.render = function() {
		if (typeof renderFn === "function") renderFn.apply(this, arguments);
		if (this.render.__render__ === renderFn) this.onRender();
		return this;
	};
	protoProps.render.__render__ = renderFn;
	return ViewBase.extend.call(this, protoProps, staticProps);
} });

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Listener.mjs
var Listener = class {
	constructor(...callbackArguments) {
		this.callbackArguments = callbackArguments;
	}
	listenTo(object, evt, ...args) {
		const { callbackArguments } = this;
		if (evt && typeof evt === "object") {
			const [context = null] = args;
			Object.entries(evt).forEach(([eventName, cb$1]) => {
				if (typeof cb$1 !== "function") return;
				if (context || callbackArguments.length > 0) cb$1 = cb$1.bind(context, ...callbackArguments);
				Events.listenTo.call(this, object, eventName, cb$1);
			});
		} else if (typeof evt === "string" && typeof args[0] === "function") {
			let [cb$1, context = null] = args;
			if (context || callbackArguments.length > 0) cb$1 = cb$1.bind(context, ...callbackArguments);
			Events.listenTo.call(this, object, evt, cb$1);
		}
	}
	stopListening() {
		Events.stopListening.call(this);
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/mvc/Collection.mjs
var Collection = function(models, options) {
	options || (options = {});
	this.preinitialize.apply(this, arguments);
	if (options.model) this.model = options.model;
	if (options.comparator !== void 0) this.comparator = options.comparator;
	this._reset();
	this.initialize.apply(this, arguments);
	if (models) this.reset(models, assign({ silent: true }, options));
};
var setOptions = {
	add: true,
	remove: true,
	merge: true
};
var addOptions = {
	add: true,
	remove: false
};
var splice = function(array, insert, at) {
	at = Math.min(Math.max(at, 0), array.length);
	var tail = Array(array.length - at);
	var length$1 = insert.length;
	var i;
	for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
	for (i = 0; i < length$1; i++) array[i + at] = insert[i];
	for (i = 0; i < tail.length; i++) array[i + length$1 + at] = tail[i];
};
assign(Collection.prototype, Events, {
	model: Model,
	preinitialize: function() {},
	initialize: function() {},
	toJSON: function(options) {
		return this.map(function(model) {
			return model.toJSON(options);
		});
	},
	add: function(models, options) {
		return this.set(models, assign({ merge: false }, options, addOptions));
	},
	remove: function(models, options) {
		options = assign({}, options);
		var singular = !Array.isArray(models);
		models = singular ? [models] : models.slice();
		var removed = this._removeModels(models, options);
		if (!options.silent && removed.length) {
			options.changes = {
				added: [],
				merged: [],
				removed
			};
			this.trigger("update", this, options);
		}
		return singular ? removed[0] : removed;
	},
	set: function(models, options) {
		if (models == null) return;
		options = assign({}, setOptions, options);
		var singular = !Array.isArray(models);
		models = singular ? [models] : models.slice();
		var at = options.at;
		if (at != null) at = +at;
		if (at > this.length) at = this.length;
		if (at < 0) at += this.length + 1;
		var set$1 = [];
		var toAdd = [];
		var toMerge = [];
		var toRemove = [];
		var modelMap = {};
		var add = options.add;
		var merge$1 = options.merge;
		var remove$1 = options.remove;
		var sort = false;
		var sortable = this.comparator && at == null && options.sort !== false;
		var sortAttr = isString(this.comparator) ? this.comparator : null;
		var model, i;
		for (i = 0; i < models.length; i++) {
			model = models[i];
			var existing = this.get(model);
			if (existing) {
				if (merge$1 && model !== existing) {
					var attrs = this._isModel(model) ? model.attributes : model;
					existing.set(attrs, options);
					toMerge.push(existing);
					if (sortable && !sort) sort = existing.hasChanged(sortAttr);
				}
				if (!modelMap[existing.cid]) {
					modelMap[existing.cid] = true;
					set$1.push(existing);
				}
				models[i] = existing;
			} else if (add) {
				model = models[i] = this._prepareModel(model, options);
				if (model) {
					toAdd.push(model);
					this._addReference(model, options);
					modelMap[model.cid] = true;
					set$1.push(model);
				}
			}
		}
		if (remove$1) {
			for (i = 0; i < this.length; i++) {
				model = this.models[i];
				if (!modelMap[model.cid]) toRemove.push(model);
			}
			if (toRemove.length) this._removeModels(toRemove, options);
		}
		var orderChanged = false;
		var replace = !sortable && add && remove$1;
		if (set$1.length && replace) {
			orderChanged = this.length !== set$1.length || this.models.some(function(m, index) {
				return m !== set$1[index];
			});
			this.models.length = 0;
			splice(this.models, set$1, 0);
			this.length = this.models.length;
		} else if (toAdd.length) {
			if (sortable) sort = true;
			splice(this.models, toAdd, at == null ? this.length : at);
			this.length = this.models.length;
		}
		if (sort) this.sort({ silent: true });
		if (!options.silent) {
			for (i = 0; i < toAdd.length; i++) {
				if (at != null) options.index = at + i;
				model = toAdd[i];
				model.trigger("add", model, this, options);
			}
			if (sort || orderChanged) this.trigger("sort", this, options);
			if (toAdd.length || toRemove.length || toMerge.length) {
				options.changes = {
					added: toAdd,
					removed: toRemove,
					merged: toMerge
				};
				this.trigger("update", this, options);
			}
		}
		return singular ? models[0] : models;
	},
	reset: function(models, options) {
		options = options ? clone(options) : {};
		for (var i = 0; i < this.models.length; i++) this._removeReference(this.models[i], options);
		options.previousModels = this.models;
		this._reset();
		models = this.add(models, assign({ silent: true }, options));
		if (!options.silent) this.trigger("reset", this, options);
		return models;
	},
	push: function(model, options) {
		return this.add(model, assign({ at: this.length }, options));
	},
	pop: function(options) {
		var model = this.at(this.length - 1);
		return this.remove(model, options);
	},
	unshift: function(model, options) {
		return this.add(model, assign({ at: 0 }, options));
	},
	shift: function(options) {
		var model = this.at(0);
		return this.remove(model, options);
	},
	slice: function() {
		return Array.prototype.slice.apply(this.models, arguments);
	},
	get: function(obj) {
		if (obj == null) return void 0;
		return this._byId[obj] || this._byId[this.modelId(this._isModel(obj) ? obj.attributes : obj, obj.idAttribute)] || obj.cid && this._byId[obj.cid];
	},
	has: function(obj) {
		return this.get(obj) != null;
	},
	at: function(index) {
		if (index < 0) index += this.length;
		return this.models[index];
	},
	sort: function(options) {
		var comparator = this.comparator;
		if (!comparator) throw new Error("Cannot sort a set without a comparator");
		options || (options = {});
		var length$1 = comparator.length;
		if (isFunction(comparator)) comparator = comparator.bind(this);
		if (length$1 === 1 || isString(comparator)) this.models = this.sortBy(comparator);
		else this.models.sort(comparator);
		if (!options.silent) this.trigger("sort", this, options);
		return this;
	},
	clone: function() {
		return new this.constructor(this.models, {
			model: this.model,
			comparator: this.comparator
		});
	},
	modelId: function(attrs, idAttribute) {
		return attrs[idAttribute || this.model.prototype.idAttribute || "id"];
	},
	values: function() {
		return new CollectionIterator(this, ITERATOR_VALUES);
	},
	keys: function() {
		return new CollectionIterator(this, ITERATOR_KEYS);
	},
	entries: function() {
		return new CollectionIterator(this, ITERATOR_KEYSVALUES);
	},
	each: function(fn$1, context) {
		this.models.forEach(fn$1, context);
	},
	filter: function(fn$1, context) {
		return this.models.filter(fn$1, context);
	},
	find: function(fn$1, context) {
		return this.models.find(fn$1, context);
	},
	findIndex: function(fn$1, context) {
		return this.models.findIndex(fn$1, context);
	},
	first: function() {
		return this.models[0];
	},
	includes: function(value) {
		return this.models.includes(value);
	},
	last: function() {
		return this.models[this.models.length - 1];
	},
	isEmpty: function() {
		return !this.models.length;
	},
	map: function(fn$1, context) {
		return this.models.map(fn$1, context);
	},
	reduce: function(fn$1, initAcc = this.first()) {
		return this.models.reduce(fn$1, initAcc);
	},
	_reset: function() {
		this.length = 0;
		this.models = [];
		this._byId = {};
	},
	_prepareModel: function(attrs, options) {
		if (this._isModel(attrs)) {
			if (!attrs.collection) attrs.collection = this;
			return attrs;
		}
		options = options ? clone(options) : {};
		options.collection = this;
		var model;
		if (this.model.prototype) model = new this.model(attrs, options);
		else model = this.model(attrs, options);
		if (!model.validationError) return model;
		this.trigger("invalid", this, model.validationError, options);
		return false;
	},
	_removeModels: function(models, options) {
		var removed = [];
		for (var i = 0; i < models.length; i++) {
			var model = this.get(models[i]);
			if (!model) continue;
			var index = this.models.indexOf(model);
			this.models.splice(index, 1);
			this.length--;
			delete this._byId[model.cid];
			var id = this.modelId(model.attributes, model.idAttribute);
			if (id != null) delete this._byId[id];
			if (!options.silent) {
				options.index = index;
				model.trigger("remove", model, this, options);
			}
			removed.push(model);
			this._removeReference(model, options);
		}
		if (models.length > 0 && !options.silent) delete options.index;
		return removed;
	},
	_isModel: function(model) {
		return model instanceof Model;
	},
	_addReference: function(model, options) {
		this._byId[model.cid] = model;
		var id = this.modelId(model.attributes, model.idAttribute);
		if (id != null) this._byId[id] = model;
		model.on("all", this._onModelEvent, this);
	},
	_removeReference: function(model, options) {
		delete this._byId[model.cid];
		var id = this.modelId(model.attributes, model.idAttribute);
		if (id != null) delete this._byId[id];
		if (this === model.collection) delete model.collection;
		model.off("all", this._onModelEvent, this);
	},
	_onModelEvent: function(event, model, collection, options) {
		if (model) {
			if ((event === "add" || event === "remove") && collection !== this) return;
			if (event === "changeId") {
				var prevId = this.modelId(model.previousAttributes(), model.idAttribute);
				var id = this.modelId(model.attributes, model.idAttribute);
				if (prevId != null) delete this._byId[prevId];
				if (id != null) this._byId[id] = model;
			}
		}
		this.trigger.apply(this, arguments);
	}
});
var $$iterator = typeof Symbol === "function" && Symbol.iterator;
if ($$iterator) Collection.prototype[$$iterator] = Collection.prototype.values;
var CollectionIterator = function(collection, kind) {
	this._collection = collection;
	this._kind = kind;
	this._index = 0;
};
var ITERATOR_VALUES = 1;
var ITERATOR_KEYS = 2;
var ITERATOR_KEYSVALUES = 3;
if ($$iterator) CollectionIterator.prototype[$$iterator] = function() {
	return this;
};
CollectionIterator.prototype.next = function() {
	if (this._collection) {
		if (this._index < this._collection.length) {
			var model = this._collection.at(this._index);
			this._index++;
			var value;
			if (this._kind === ITERATOR_VALUES) value = model;
			else {
				var id = this._collection.modelId(model.attributes, model.idAttribute);
				if (this._kind === ITERATOR_KEYS) value = id;
				else value = [id, model];
			}
			return {
				value,
				done: false
			};
		}
		this._collection = void 0;
	}
	return {
		value: void 0,
		done: true
	};
};
var collectionMethods = {
	toArray: 1,
	sortBy: 3
};
var config$3 = [
	Collection,
	collectionMethods,
	"models"
];
function addMethods(config$4) {
	var Base = config$4[0], methods$1 = config$4[1], attribute = config$4[2];
	const methodsToAdd = {
		sortBy,
		toArray
	};
	addMethodsUtil(Base, methodsToAdd, methods$1, attribute);
}
addMethods(config$3);
Collection.extend = extend;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/HighlighterView.mjs
function toArray$1(obj) {
	if (!obj) return [];
	if (Array.isArray(obj)) return obj;
	return [obj];
}
const HighlighterView = View.extend({
	tagName: "g",
	svgElement: true,
	className: "highlight",
	HIGHLIGHT_FLAG: 1,
	UPDATE_PRIORITY: 3,
	DETACHABLE: false,
	UPDATABLE: true,
	MOUNTABLE: true,
	cellView: null,
	nodeSelector: null,
	node: null,
	updateRequested: false,
	postponedUpdate: false,
	transformGroup: null,
	detachedTransformGroup: null,
	requestUpdate(cellView, nodeSelector) {
		const { paper } = cellView;
		this.cellView = cellView;
		this.nodeSelector = nodeSelector;
		if (paper) {
			this.updateRequested = true;
			paper.requestViewUpdate(this, this.HIGHLIGHT_FLAG, this.UPDATE_PRIORITY);
		}
	},
	confirmUpdate() {
		this.updateRequested = false;
		const { cellView, nodeSelector } = this;
		if (cellView.isMounted()) {
			this.update(cellView, nodeSelector);
			this.mount();
			this.transform();
		} else this.postponedUpdate = true;
		return 0;
	},
	findNode(cellView, nodeSelector = null) {
		let el;
		if (typeof nodeSelector === "string") el = cellView.findNode(nodeSelector);
		else if (isPlainObject(nodeSelector)) {
			const isLink = cellView.model.isLink();
			const { label = null, port, selector } = nodeSelector;
			if (isLink && label !== null) el = cellView.findLabelNode(label, selector);
			else if (!isLink && port) el = cellView.findPortNode(port, selector);
			else el = cellView.findNode(selector);
		} else if (nodeSelector) {
			el = V_default.toNode(nodeSelector);
			if (!(el instanceof SVGElement)) el = null;
		}
		return el ? el : null;
	},
	getNodeMatrix(cellView, node) {
		const { options } = this;
		const { layer } = options;
		const { rotatableNode } = cellView;
		const nodeMatrix = cellView.getNodeMatrix(node);
		if (rotatableNode) if (layer) {
			if (rotatableNode.contains(node)) return nodeMatrix;
			return cellView.getRootRotateMatrix().inverse().multiply(nodeMatrix);
		} else return cellView.getNodeRotateMatrix(node).multiply(nodeMatrix);
		return nodeMatrix;
	},
	mount() {
		const { MOUNTABLE, cellView, el, options, transformGroup, detachedTransformGroup, postponedUpdate, nodeSelector } = this;
		if (!MOUNTABLE || transformGroup) return;
		if (postponedUpdate) {
			this.update(cellView, nodeSelector);
			this.transform();
			return;
		}
		const { vel: cellViewRoot, paper } = cellView;
		const { layer: layerName } = options;
		if (layerName) {
			let vGroup;
			if (detachedTransformGroup) {
				vGroup = detachedTransformGroup;
				this.detachedTransformGroup = null;
			} else vGroup = V_default("g").addClass("highlight-transform").append(el);
			this.transformGroup = vGroup;
			paper.getLayerView(layerName).insertSortedNode(vGroup.node, options.z);
		} else if (!el.parentNode || el.nextSibling) cellViewRoot.append(el);
	},
	unmount() {
		const { MOUNTABLE, transformGroup, vel } = this;
		if (!MOUNTABLE) return;
		if (transformGroup) {
			this.transformGroup = null;
			this.detachedTransformGroup = transformGroup;
			transformGroup.remove();
		} else vel.remove();
	},
	transform() {
		const { transformGroup, cellView, updateRequested } = this;
		if (!transformGroup || cellView.model.isLink() || updateRequested) return;
		const translateMatrix = cellView.getRootTranslateMatrix();
		const rotateMatrix = cellView.getRootRotateMatrix();
		const transformMatrix = translateMatrix.multiply(rotateMatrix);
		transformGroup.attr("transform", V_default.matrixToTransformString(transformMatrix));
	},
	update() {
		const { node: prevNode, cellView, nodeSelector, updateRequested, id } = this;
		if (updateRequested) return;
		this.postponedUpdate = false;
		const node = this.node = this.findNode(cellView, nodeSelector);
		if (prevNode) this.unhighlight(cellView, prevNode);
		if (node) {
			this.highlight(cellView, node);
			this.mount();
		} else {
			this.unmount();
			cellView.notify("cell:highlight:invalid", id, this);
		}
	},
	onRemove() {
		const { node, cellView, id, constructor } = this;
		if (node) this.unhighlight(cellView, node);
		this.unmount();
		constructor._removeRef(cellView, id);
	},
	highlight(_cellView, _node) {},
	unhighlight(_cellView, _node) {},
	listenToUpdateAttributes(cellView) {
		const attributes$1 = result(this, "UPDATE_ATTRIBUTES");
		if (!Array.isArray(attributes$1) || attributes$1.length === 0) return;
		this.listenTo(cellView.model, "change", this.onCellAttributeChange);
	},
	onCellAttributeChange() {
		const { cellView } = this;
		if (!cellView) return;
		const { model, paper } = cellView;
		const attributes$1 = result(this, "UPDATE_ATTRIBUTES");
		if (!attributes$1.some((attribute) => model.hasChanged(attribute))) return;
		paper.requestViewUpdate(this, this.HIGHLIGHT_FLAG, this.UPDATE_PRIORITY);
	}
}, {
	_views: {},
	highlight: function(cellView, node, opt) {
		const id = this.uniqueId(node, opt);
		this.add(cellView, node, id, opt);
	},
	unhighlight: function(cellView, node, opt) {
		const id = this.uniqueId(node, opt);
		this.remove(cellView, id);
	},
	get(cellView, id = null) {
		const { cid } = cellView;
		const { _views } = this;
		const refs = _views[cid];
		if (id === null) {
			const views$1 = [];
			if (!refs) return views$1;
			for (let hid in refs) {
				const ref = refs[hid];
				if (ref instanceof this) views$1.push(ref);
			}
			return views$1;
		} else {
			if (!refs) return null;
			if (id in refs) {
				const ref = refs[id];
				if (ref instanceof this) return ref;
			}
			return null;
		}
	},
	add(cellView, nodeSelector, id, opt = {}) {
		if (!id) throw new Error("dia.HighlighterView: An ID required.");
		const previousView = HighlighterView.get(cellView, id);
		if (previousView) previousView.remove();
		const view = new this(opt);
		view.id = id;
		this._addRef(cellView, id, view);
		view.requestUpdate(cellView, nodeSelector);
		view.listenToUpdateAttributes(cellView);
		return view;
	},
	_addRef(cellView, id, view) {
		const { cid } = cellView;
		const { _views } = this;
		let refs = _views[cid];
		if (!refs) refs = _views[cid] = {};
		refs[id] = view;
	},
	_removeRef(cellView, id) {
		const { cid } = cellView;
		const { _views } = this;
		const refs = _views[cid];
		if (!refs) return;
		if (id) delete refs[id];
		for (let _ in refs) return;
		delete _views[cid];
	},
	remove(cellView, id = null) {
		toArray$1(this.get(cellView, id)).forEach((view) => {
			view.remove();
		});
	},
	getAll(paper, id = null) {
		const views$1 = [];
		const { _views } = this;
		for (let cid in _views) for (let hid in _views[cid]) {
			const view = _views[cid][hid];
			if (view.cellView.paper === paper && view instanceof this && (id === null || hid === id)) views$1.push(view);
		}
		return views$1;
	},
	removeAll(paper, id = null) {
		this.getAll(paper, id).forEach((view) => view.remove());
	},
	update(cellView, id = null, dirty = false) {
		toArray$1(this.get(cellView, id)).forEach((view) => {
			if (dirty || view.UPDATABLE) view.update();
		});
	},
	transform(cellView, id = null) {
		toArray$1(this.get(cellView, id)).forEach((view) => {
			if (view.UPDATABLE) view.transform();
		});
	},
	unmount(cellView, id = null) {
		toArray$1(this.get(cellView, id)).forEach((view) => view.unmount());
	},
	mount(cellView, id = null) {
		toArray$1(this.get(cellView, id)).forEach((view) => view.mount());
	},
	uniqueId(node, opt = "") {
		return V_default.ensureId(node) + JSON.stringify(opt);
	}
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/highlighters/stroke.mjs
const stroke$1 = HighlighterView.extend({
	tagName: "path",
	className: "highlight-stroke",
	attributes: {
		"pointer-events": "none",
		"fill": "none"
	},
	options: {
		padding: 3,
		rx: 0,
		ry: 0,
		useFirstSubpath: false,
		attrs: {
			"stroke-width": 3,
			"stroke": "#FEB663"
		}
	},
	getPathData(cellView, node) {
		const { options } = this;
		const { useFirstSubpath } = options;
		let d;
		try {
			const vNode = V_default(node);
			d = vNode.convertToPathData().trim();
			if (vNode.tagName() === "PATH" && useFirstSubpath) {
				const secondSubpathIndex = d.search(/.M/i) + 1;
				if (secondSubpathIndex > 0) d = d.substr(0, secondSubpathIndex);
			}
		} catch (error) {
			const nodeBBox = cellView.getNodeBoundingRect(node);
			d = V_default.rectToPath(assign({}, options, nodeBBox.toJSON()));
		}
		return d;
	},
	highlightConnection(cellView) {
		this.vel.attr("d", cellView.getSerializedConnection());
	},
	highlightNode(cellView, node) {
		const { vel, options } = this;
		const { padding, layer } = options;
		let highlightMatrix = this.getNodeMatrix(cellView, node);
		if (padding) {
			if (!layer && node === cellView.el) vel.remove();
			let nodeBBox = cellView.getNodeBoundingRect(node);
			const cx = nodeBBox.x + nodeBBox.width / 2;
			const cy = nodeBBox.y + nodeBBox.height / 2;
			nodeBBox = V_default.transformRect(nodeBBox, highlightMatrix);
			const width$1 = Math.max(nodeBBox.width, 1);
			const height$1 = Math.max(nodeBBox.height, 1);
			const sx = (width$1 + padding) / width$1;
			const sy = (height$1 + padding) / height$1;
			const paddingMatrix = V_default.createSVGMatrix({
				a: sx,
				b: 0,
				c: 0,
				d: sy,
				e: cx - sx * cx,
				f: cy - sy * cy
			});
			highlightMatrix = highlightMatrix.multiply(paddingMatrix);
		}
		vel.attr({
			"d": this.getPathData(cellView, node),
			"transform": V_default.matrixToTransformString(highlightMatrix)
		});
	},
	highlight(cellView, node) {
		const { vel, options } = this;
		vel.attr(options.attrs);
		if (options.nonScalingStroke) vel.attr("vector-effect", "non-scaling-stroke");
		if (cellView.isNodeConnection(node)) this.highlightConnection(cellView);
		else this.highlightNode(cellView, node);
	}
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/highlighters/mask.mjs
const MASK_CLIP = 20;
function forEachDescendant(vel, fn$1) {
	const descendants = vel.children();
	while (descendants.length > 0) {
		const descendant = descendants.shift();
		if (fn$1(descendant)) descendants.push(...descendant.children());
	}
}
const mask = HighlighterView.extend({
	tagName: "rect",
	className: "highlight-mask",
	attributes: { "pointer-events": "none" },
	options: {
		padding: 3,
		maskClip: MASK_CLIP,
		deep: false,
		attrs: {
			"stroke": "#FEB663",
			"stroke-width": 3,
			"stroke-linecap": "butt",
			"stroke-linejoin": "miter"
		}
	},
	VISIBLE: "white",
	INVISIBLE: "black",
	MASK_ROOT_ATTRIBUTE_BLACKLIST: [
		"marker-start",
		"marker-end",
		"marker-mid",
		"transform",
		"stroke-dasharray",
		"class"
	],
	MASK_CHILD_ATTRIBUTE_BLACKLIST: [
		"stroke",
		"fill",
		"stroke-width",
		"stroke-opacity",
		"stroke-dasharray",
		"fill-opacity",
		"marker-start",
		"marker-end",
		"marker-mid",
		"class"
	],
	MASK_REPLACE_TAGS: [
		"FOREIGNOBJECT",
		"IMAGE",
		"USE",
		"TEXT",
		"TSPAN",
		"TEXTPATH"
	],
	MASK_REMOVE_TAGS: [
		"TEXT",
		"TSPAN",
		"TEXTPATH"
	],
	transformMaskChild(cellView, childEl) {
		const { MASK_CHILD_ATTRIBUTE_BLACKLIST, MASK_REPLACE_TAGS, MASK_REMOVE_TAGS } = this;
		const childTagName = childEl.tagName();
		if (!V_default.isSVGGraphicsElement(childEl) || MASK_REMOVE_TAGS.includes(childTagName)) {
			childEl.remove();
			return false;
		}
		if (MASK_REPLACE_TAGS.includes(childTagName)) {
			const originalChild = cellView.vel.findOne(`#${childEl.id}`);
			if (originalChild) {
				const { node: originalNode } = originalChild;
				let childBBox = cellView.getNodeBoundingRect(originalNode);
				if (cellView.model.isElement()) childBBox = V_default.transformRect(childBBox, cellView.getNodeMatrix(originalNode));
				const replacement = V_default("rect", childBBox.toJSON());
				const { x: ox, y: oy } = childBBox.center();
				const { angle, cx = ox, cy = oy } = originalChild.rotate();
				if (angle) replacement.rotate(angle, cx, cy);
				childEl.parent().append(replacement);
			}
			childEl.remove();
			return false;
		}
		MASK_CHILD_ATTRIBUTE_BLACKLIST.forEach((attrName) => {
			if (attrName === "fill" && childEl.attr("fill") === "none") return;
			childEl.removeAttr(attrName);
		});
		return true;
	},
	transformMaskRoot(_cellView, rootEl) {
		const { MASK_ROOT_ATTRIBUTE_BLACKLIST } = this;
		MASK_ROOT_ATTRIBUTE_BLACKLIST.forEach((attrName) => {
			rootEl.removeAttr(attrName);
		});
	},
	getMaskShape(cellView, vel) {
		const { options, MASK_REPLACE_TAGS } = this;
		const { deep } = options;
		const tagName = vel.tagName();
		let maskRoot;
		if (tagName === "G") {
			if (!deep) return null;
			maskRoot = vel.clone();
			forEachDescendant(maskRoot, (maskChild) => this.transformMaskChild(cellView, maskChild));
		} else {
			if (MASK_REPLACE_TAGS.includes(tagName)) return null;
			maskRoot = vel.clone();
		}
		this.transformMaskRoot(cellView, maskRoot);
		return maskRoot;
	},
	getMaskId() {
		return `highlight-mask-${this.cid}`;
	},
	getMask(cellView, vNode) {
		const { VISIBLE, INVISIBLE, options } = this;
		const { padding, attrs } = options;
		const strokeWidth = parseFloat(V_default("g").attr(attrs).attr("stroke-width"));
		const hasNodeFill = vNode.attr("fill") !== "none";
		let magnetStrokeWidth = parseFloat(vNode.attr("stroke-width"));
		if (isNaN(magnetStrokeWidth)) magnetStrokeWidth = 1;
		const minStrokeWidth = magnetStrokeWidth + padding * 2;
		const maxStrokeWidth = minStrokeWidth + strokeWidth * 2;
		let maskEl = this.getMaskShape(cellView, vNode);
		if (!maskEl) {
			const nodeBBox = cellView.getNodeBoundingRect(vNode.node);
			nodeBBox.inflate(nodeBBox.width ? 0 : .5, nodeBBox.height ? 0 : .5);
			maskEl = V_default("rect", nodeBBox.toJSON());
		}
		maskEl.attr(attrs);
		return V_default("mask", { "id": this.getMaskId() }).append([maskEl.clone().attr({
			"fill": hasNodeFill ? VISIBLE : "none",
			"stroke": VISIBLE,
			"stroke-width": maxStrokeWidth
		}), maskEl.clone().attr({
			"fill": hasNodeFill ? INVISIBLE : "none",
			"stroke": INVISIBLE,
			"stroke-width": minStrokeWidth
		})]);
	},
	removeMask(paper) {
		const maskNode = paper.svg.getElementById(this.getMaskId());
		if (maskNode) paper.defs.removeChild(maskNode);
	},
	addMask(paper, maskEl) {
		paper.defs.appendChild(maskEl.node);
	},
	highlight(cellView, node) {
		const { options, vel } = this;
		const { padding, attrs, maskClip = MASK_CLIP, layer } = options;
		const color = "stroke" in attrs ? attrs["stroke"] : "#000000";
		if (!layer && node === cellView.el) vel.remove();
		const highlighterBBox = cellView.getNodeBoundingRect(node).inflate(padding + maskClip);
		const highlightMatrix = this.getNodeMatrix(cellView, node);
		const maskEl = this.getMask(cellView, V_default(node));
		this.addMask(cellView.paper, maskEl);
		vel.attr(highlighterBBox.toJSON());
		vel.attr({
			"transform": V_default.matrixToTransformString(highlightMatrix),
			"mask": `url(#${maskEl.id})`,
			"fill": color
		});
	},
	unhighlight(cellView) {
		this.removeMask(cellView.paper);
	}
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/highlighters/opacity.mjs
const opacity = HighlighterView.extend({
	UPDATABLE: false,
	MOUNTABLE: false,
	highlight: function(_cellView, node) {
		const { alphaValue = .3 } = this.options;
		node.style.opacity = alphaValue;
	},
	unhighlight: function(_cellView, node) {
		node.style.opacity = "";
	}
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/highlighters/addClass.mjs
const className = addClassNamePrefix("highlighted");
const addClass = HighlighterView.extend({
	UPDATABLE: false,
	MOUNTABLE: false,
	options: { className },
	highlight: function(_cellView, node) {
		V_default(node).addClass(this.options.className);
	},
	unhighlight: function(_cellView, node) {
		V_default(node).removeClass(this.options.className);
	}
}, { className });

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/highlighters/list.mjs
const Directions$1 = {
	ROW: "row",
	COLUMN: "column"
};
const list = HighlighterView.extend({
	tagName: "g",
	MOUNTABLE: true,
	UPDATE_ATTRIBUTES: function() {
		return [this.options.attribute];
	},
	_prevItems: null,
	highlight(elementView, node) {
		const element = elementView.model;
		const { attribute, size = 20, gap = 5, direction = Directions$1.ROW } = this.options;
		if (!attribute) throw new Error("List: attribute is required");
		const normalizedSize = typeof size === "number" ? {
			width: size,
			height: size
		} : size;
		const isRowDirection = direction === Directions$1.ROW;
		const itemWidth = isRowDirection ? normalizedSize.width : normalizedSize.height;
		let items = element.get(attribute);
		if (!Array.isArray(items)) items = [];
		const prevItems = this._prevItems || [];
		const comparison = items.map((item, index) => isEqual(prevItems[index], items[index]));
		if (prevItems.length !== items.length || comparison.some((unchanged) => !unchanged)) {
			const prevEls = this.vel.children();
			const itemsEls = items.map((item, index) => {
				const prevEl = index in prevEls ? prevEls[index].node : null;
				if (comparison[index]) return prevEl;
				const itemEl = this.createListItem(item, normalizedSize, prevEl);
				if (!itemEl) return null;
				if (!(itemEl instanceof SVGElement)) throw new Error("List: item must be an SVGElement");
				itemEl.dataset.index = index;
				itemEl.dataset.attribute = attribute;
				const offset$1 = index * (itemWidth + gap);
				itemEl.setAttribute("transform", isRowDirection ? `translate(${offset$1}, 0)` : `translate(0, ${offset$1})`);
				return itemEl;
			});
			this.vel.empty().append(itemsEls);
			this._prevItems = items;
		}
		const itemsCount = items.length;
		const length$1 = itemsCount === 0 ? 0 : itemsCount * itemWidth + (itemsCount - 1) * gap;
		const listSize = isRowDirection ? {
			width: length$1,
			height: normalizedSize.height
		} : {
			width: normalizedSize.width,
			height: length$1
		};
		this.position(element, listSize);
	},
	position(element, listSize) {
		const { vel, options } = this;
		const { margin = 5, position: position$1 = "top-left" } = options;
		const { width: width$1, height: height$1 } = element.size();
		const { left: left$3, right: right$3, top: top$3, bottom: bottom$3 } = normalizeSides(margin);
		const bbox$1 = new Rect(left$3, top$3, width$1 - (left$3 + right$3), height$1 - (top$3 + bottom$3));
		let { x, y } = getRectPoint(bbox$1, position$1);
		switch (position$1) {
			case Positions.CENTER:
			case Positions.TOP:
			case Positions.BOTTOM:
				x -= listSize.width / 2;
				break;
			case Positions.RIGHT:
			case Positions.BOTTOM_RIGHT:
			case Positions.TOP_RIGHT:
				x -= listSize.width;
				break;
		}
		switch (position$1) {
			case Positions.CENTER:
			case Positions.RIGHT:
			case Positions.LEFT:
				y -= listSize.height / 2;
				break;
			case Positions.BOTTOM:
			case Positions.BOTTOM_RIGHT:
			case Positions.BOTTOM_LEFT:
				y -= listSize.height;
				break;
		}
		vel.attr("transform", `translate(${x}, ${y})`);
	}
}, {
	Directions: Directions$1,
	Positions
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/highlighters/index.mjs
var highlighters_exports = {};
__export(highlighters_exports, {
	addClass: () => addClass,
	list: () => list,
	mask: () => mask,
	opacity: () => opacity,
	stroke: () => stroke$1
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/connectionPoints/index.mjs
var connectionPoints_exports = {};
__export(connectionPoints_exports, {
	anchor: () => anchor,
	bbox: () => bbox,
	boundary: () => boundary,
	rectangle: () => rectangle
});
function offsetPoint(p1, p2, offset$1) {
	if (isPlainObject(offset$1)) {
		const { x, y } = offset$1;
		if (isFinite(y)) {
			const line$2 = new Line(p2, p1);
			const { start, end } = line$2.parallel(y);
			p2 = start;
			p1 = end;
		}
		offset$1 = x;
	}
	if (!isFinite(offset$1)) return p1;
	var length$1 = p1.distance(p2);
	if (offset$1 === 0 && length$1 > 0) return p1;
	return p1.move(p2, -Math.min(offset$1, length$1 - 1));
}
function stroke(magnet) {
	var stroke$2 = magnet.getAttribute("stroke-width");
	if (stroke$2 === null) return 0;
	return parseFloat(stroke$2) || 0;
}
function alignLine(line$2, type, offset$1 = 0) {
	let coordinate, a, b, direction;
	const { start, end } = line$2;
	switch (type) {
		case "left":
			coordinate = "x";
			a = end;
			b = start;
			direction = -1;
			break;
		case "right":
			coordinate = "x";
			a = start;
			b = end;
			direction = 1;
			break;
		case "top":
			coordinate = "y";
			a = end;
			b = start;
			direction = -1;
			break;
		case "bottom":
			coordinate = "y";
			a = start;
			b = end;
			direction = 1;
			break;
		default: return;
	}
	if (start[coordinate] < end[coordinate]) a[coordinate] = b[coordinate];
	else b[coordinate] = a[coordinate];
	if (isFinite(offset$1)) {
		a[coordinate] += direction * offset$1;
		b[coordinate] += direction * offset$1;
	}
}
function anchorConnectionPoint(line$2, _view, _magnet, opt) {
	let { offset: offset$1, alignOffset, align: align$1 } = opt;
	if (align$1) alignLine(line$2, align$1, alignOffset);
	return offsetPoint(line$2.end, line$2.start, offset$1);
}
function bboxIntersection(line$2, view, magnet, opt) {
	var bbox$1 = view.getNodeBBox(magnet);
	if (opt.stroke) bbox$1.inflate(stroke(magnet) / 2);
	var intersections = line$2.intersect(bbox$1);
	var cp = intersections ? line$2.start.chooseClosest(intersections) : line$2.end;
	return offsetPoint(cp, line$2.start, opt.offset);
}
function rectangleIntersection(line$2, view, magnet, opt) {
	var angle = view.model.angle();
	if (angle === 0) return bboxIntersection(line$2, view, magnet, opt);
	var bboxWORotation = view.getNodeUnrotatedBBox(magnet);
	if (opt.stroke) bboxWORotation.inflate(stroke(magnet) / 2);
	var center$1 = bboxWORotation.center();
	var lineWORotation = line$2.clone().rotate(center$1, angle);
	var intersections = lineWORotation.setLength(1e6).intersect(bboxWORotation);
	var cp = intersections ? lineWORotation.start.chooseClosest(intersections).rotate(center$1, -angle) : line$2.end;
	return offsetPoint(cp, line$2.start, opt.offset);
}
function findShapeNode(magnet) {
	if (!magnet) return null;
	var node = magnet;
	do {
		var tagName = node.tagName;
		if (typeof tagName !== "string") return null;
		tagName = tagName.toUpperCase();
		if (tagName === "G") node = node.firstElementChild;
		else if (tagName === "TITLE") node = node.nextElementSibling;
		else break;
	} while (node);
	return node;
}
var BNDR_SUBDIVISIONS = "segmentSubdivisons";
var BNDR_SHAPE_BBOX = "shapeBBox";
function boundaryIntersection(line$2, view, magnet, opt) {
	var node, intersection$2;
	var selector = opt.selector;
	var anchor$1 = line$2.end;
	if (typeof selector === "string") node = view.findNode(selector);
	else if (selector === false) node = magnet;
	else if (Array.isArray(selector)) node = getByPath(magnet, selector);
	else node = findShapeNode(magnet);
	if (!V_default.isSVGGraphicsElement(node)) {
		if (node === magnet || !V_default.isSVGGraphicsElement(magnet)) return anchor$1;
		node = magnet;
	}
	var localShape = view.getNodeShape(node);
	var magnetMatrix = view.getNodeMatrix(node);
	var translateMatrix = view.getRootTranslateMatrix();
	var rotateMatrix = view.getRootRotateMatrix();
	var targetMatrix = translateMatrix.multiply(rotateMatrix).multiply(magnetMatrix);
	var localMatrix = targetMatrix.inverse();
	var localLine = V_default.transformLine(line$2, localMatrix);
	var localRef = localLine.start.clone();
	var data$1 = view.getNodeData(node);
	if (opt.insideout === false) {
		if (!data$1[BNDR_SHAPE_BBOX]) data$1[BNDR_SHAPE_BBOX] = localShape.bbox();
		var localBBox = data$1[BNDR_SHAPE_BBOX];
		if (localBBox.containsPoint(localRef)) return anchor$1;
	}
	var pathOpt;
	if (localShape instanceof Path) {
		var precision = opt.precision || 2;
		if (!data$1[BNDR_SUBDIVISIONS]) data$1[BNDR_SUBDIVISIONS] = localShape.getSegmentSubdivisions({ precision });
		pathOpt = {
			precision,
			segmentSubdivisions: data$1[BNDR_SUBDIVISIONS]
		};
	}
	if (opt.extrapolate === true) localLine.setLength(1e6);
	intersection$2 = localLine.intersect(localShape, pathOpt);
	if (intersection$2) {
		if (V_default.isArray(intersection$2)) intersection$2 = localRef.chooseClosest(intersection$2);
	} else if (opt.sticky === true) if (localShape instanceof Rect) intersection$2 = localShape.pointNearestToPoint(localRef);
	else if (localShape instanceof Ellipse$1) intersection$2 = localShape.intersectionWithLineFromCenterToPoint(localRef);
	else intersection$2 = localShape.closestPoint(localRef, pathOpt);
	var cp = intersection$2 ? V_default.transformPoint(intersection$2, targetMatrix) : anchor$1;
	var cpOffset = opt.offset || 0;
	if (opt.stroke) cpOffset += stroke(node) / 2;
	return offsetPoint(cp, line$2.start, cpOffset);
}
const anchor = anchorConnectionPoint;
const bbox = bboxIntersection;
const rectangle = rectangleIntersection;
const boundary = boundaryIntersection;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/routers/normal.mjs
const normal = function(vertices, opt, linkView) {
	return vertices;
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/routers/oneSide.mjs
const oneSide = function(vertices, opt, linkView) {
	var side = opt.side || "bottom";
	var padding = normalizeSides(opt.padding || 40);
	var sourceBBox = linkView.sourceBBox;
	var targetBBox = linkView.targetBBox;
	var sourcePoint = sourceBBox.center();
	var targetPoint = targetBBox.center();
	var coordinate, dimension, direction;
	switch (side) {
		case "bottom":
			direction = 1;
			coordinate = "y";
			dimension = "height";
			break;
		case "top":
			direction = -1;
			coordinate = "y";
			dimension = "height";
			break;
		case "left":
			direction = -1;
			coordinate = "x";
			dimension = "width";
			break;
		case "right":
			direction = 1;
			coordinate = "x";
			dimension = "width";
			break;
		default: throw new Error("Router: invalid side");
	}
	sourcePoint[coordinate] += direction * (sourceBBox[dimension] / 2 + padding[side]);
	targetPoint[coordinate] += direction * (targetBBox[dimension] / 2 + padding[side]);
	if (direction * (sourcePoint[coordinate] - targetPoint[coordinate]) > 0) targetPoint[coordinate] = sourcePoint[coordinate];
	else sourcePoint[coordinate] = targetPoint[coordinate];
	return [sourcePoint].concat(vertices, targetPoint);
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/routers/orthogonal.mjs
var opposites = {
	N: "S",
	S: "N",
	E: "W",
	W: "E"
};
var radians = {
	N: -Math.PI / 2 * 3,
	S: -Math.PI / 2,
	E: 0,
	W: Math.PI
};
function freeJoin(p1, p2, bbox$1) {
	var p = new Point(p1.x, p2.y);
	if (bbox$1.containsPoint(p)) p = new Point(p2.x, p1.y);
	return p;
}
function getBBoxSize(bbox$1, bearing$1) {
	return bbox$1[bearing$1 === "W" || bearing$1 === "E" ? "width" : "height"];
}
function getBearing(from, to) {
	if (from.x === to.x) return from.y > to.y ? "N" : "S";
	if (from.y === to.y) return from.x > to.x ? "W" : "E";
	return null;
}
function getPointBox(p) {
	return new Rect(p.x, p.y, 0, 0);
}
function getPaddingBox(opt) {
	var sides = normalizeSides(opt.padding || opt.elementPadding || 20);
	return {
		x: -sides.left,
		y: -sides.top,
		width: sides.left + sides.right,
		height: sides.top + sides.bottom
	};
}
function getSourceBBox$1(linkView, opt) {
	return linkView.sourceBBox.clone().moveAndExpand(getPaddingBox(opt));
}
function getTargetBBox$1(linkView, opt) {
	return linkView.targetBBox.clone().moveAndExpand(getPaddingBox(opt));
}
function getSourceAnchor$1(linkView, opt) {
	if (linkView.sourceAnchor) return linkView.sourceAnchor;
	var sourceBBox = getSourceBBox$1(linkView, opt);
	return sourceBBox.center();
}
function getTargetAnchor$1(linkView, opt) {
	if (linkView.targetAnchor) return linkView.targetAnchor;
	var targetBBox = getTargetBBox$1(linkView, opt);
	return targetBBox.center();
}
function vertexVertex(from, to, bearing$1) {
	var p1 = new Point(from.x, to.y);
	var p2 = new Point(to.x, from.y);
	var d1 = getBearing(from, p1);
	var d2 = getBearing(from, p2);
	var opposite = opposites[bearing$1];
	var p = d1 === bearing$1 || d1 !== opposite && (d2 === opposite || d2 !== bearing$1) ? p1 : p2;
	return {
		points: [p],
		direction: getBearing(p, to)
	};
}
function elementVertex(from, to, fromBBox) {
	var p = freeJoin(from, to, fromBBox);
	return {
		points: [p],
		direction: getBearing(p, to)
	};
}
function vertexElement(from, to, toBBox, bearing$1) {
	var route = {};
	var points = [new Point(from.x, to.y), new Point(to.x, from.y)];
	var freePoints = points.filter(function(pt) {
		return !toBBox.containsPoint(pt);
	});
	var freeBearingPoints = freePoints.filter(function(pt) {
		return getBearing(pt, from) !== bearing$1;
	});
	var p;
	if (freeBearingPoints.length > 0) {
		p = freeBearingPoints.filter(function(pt) {
			return getBearing(from, pt) === bearing$1;
		}).pop();
		p = p || freeBearingPoints[0];
		route.points = [p];
		route.direction = getBearing(p, to);
	} else {
		p = difference(points, freePoints)[0];
		var p2 = new Point(to).move(p, -getBBoxSize(toBBox, bearing$1) / 2);
		var p1 = freeJoin(p2, from, toBBox);
		route.points = [p1, p2];
		route.direction = getBearing(p2, to);
	}
	return route;
}
function elementElement(from, to, fromBBox, toBBox) {
	var route = elementVertex(to, from, toBBox);
	var p1 = route.points[0];
	if (fromBBox.containsPoint(p1)) {
		route = elementVertex(from, to, fromBBox);
		var p2 = route.points[0];
		if (toBBox.containsPoint(p2)) {
			var fromBorder = new Point(from).move(p2, -getBBoxSize(fromBBox, getBearing(from, p2)) / 2);
			var toBorder = new Point(to).move(p1, -getBBoxSize(toBBox, getBearing(to, p1)) / 2);
			var mid = new Line(fromBorder, toBorder).midpoint();
			var startRoute = elementVertex(from, mid, fromBBox);
			var endRoute = vertexVertex(mid, to, startRoute.direction);
			route.points = [startRoute.points[0], endRoute.points[0]];
			route.direction = endRoute.direction;
		}
	}
	return route;
}
function insideElement(from, to, fromBBox, toBBox, bearing$1) {
	var route = {};
	var boundary$1 = fromBBox.union(toBBox).inflate(1);
	var reversed = boundary$1.center().distance(to) > boundary$1.center().distance(from);
	var start = reversed ? to : from;
	var end = reversed ? from : to;
	var p1, p2, p3;
	if (bearing$1) {
		p1 = Point.fromPolar(boundary$1.width + boundary$1.height, radians[bearing$1], start);
		p1 = boundary$1.pointNearestToPoint(p1).move(p1, -1);
	} else p1 = boundary$1.pointNearestToPoint(start).move(start, 1);
	p2 = freeJoin(p1, end, boundary$1);
	if (p1.round().equals(p2.round())) {
		p2 = Point.fromPolar(boundary$1.width + boundary$1.height, toRad(p1.theta(start)) + Math.PI / 2, end);
		p2 = boundary$1.pointNearestToPoint(p2).move(end, 1).round();
		p3 = freeJoin(p1, p2, boundary$1);
		route.points = reversed ? [
			p2,
			p3,
			p1
		] : [
			p1,
			p3,
			p2
		];
	} else route.points = reversed ? [p2, p1] : [p1, p2];
	route.direction = reversed ? getBearing(p1, to) : getBearing(p2, to);
	return route;
}
function orthogonal(vertices, opt, linkView) {
	var sourceBBox = getSourceBBox$1(linkView, opt);
	var targetBBox = getTargetBBox$1(linkView, opt);
	var sourceAnchor = getSourceAnchor$1(linkView, opt);
	var targetAnchor = getTargetAnchor$1(linkView, opt);
	sourceBBox = sourceBBox.union(getPointBox(sourceAnchor));
	targetBBox = targetBBox.union(getPointBox(targetAnchor));
	vertices = toArray(vertices).map(Point);
	vertices.unshift(sourceAnchor);
	vertices.push(targetAnchor);
	var bearing$1;
	var orthogonalVertices = [];
	for (var i = 0, max$4 = vertices.length - 1; i < max$4; i++) {
		var route = null;
		var from = vertices[i];
		var to = vertices[i + 1];
		var isOrthogonal = !!getBearing(from, to);
		if (i === 0) {
			if (i + 1 === max$4) {
				if (sourceBBox.intersect(targetBBox.clone().inflate(1))) route = insideElement(from, to, sourceBBox, targetBBox);
				else if (!isOrthogonal) route = elementElement(from, to, sourceBBox, targetBBox);
			} else if (sourceBBox.containsPoint(to)) route = insideElement(from, to, sourceBBox, getPointBox(to).moveAndExpand(getPaddingBox(opt)));
			else if (!isOrthogonal) route = elementVertex(from, to, sourceBBox);
		} else if (i + 1 === max$4) {
			var isOrthogonalLoop = isOrthogonal && getBearing(to, from) === bearing$1;
			if (targetBBox.containsPoint(from) || isOrthogonalLoop) route = insideElement(from, to, getPointBox(from).moveAndExpand(getPaddingBox(opt)), targetBBox, bearing$1);
			else if (!isOrthogonal) route = vertexElement(from, to, targetBBox, bearing$1);
		} else if (!isOrthogonal) route = vertexVertex(from, to, bearing$1);
		if (route) {
			Array.prototype.push.apply(orthogonalVertices, route.points);
			bearing$1 = route.direction;
		} else bearing$1 = getBearing(from, to);
		if (i + 1 < max$4) orthogonalVertices.push(to);
	}
	return orthogonalVertices;
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/routers/manhattan.mjs
var config$2 = {
	step: 10,
	maximumLoops: 2e3,
	precision: 1,
	maxAllowedDirectionChange: 90,
	perpendicular: true,
	excludeEnds: [],
	excludeTypes: [],
	startDirections: [
		"top",
		"right",
		"bottom",
		"left"
	],
	endDirections: [
		"top",
		"right",
		"bottom",
		"left"
	],
	directionMap: {
		top: {
			x: 0,
			y: -1
		},
		right: {
			x: 1,
			y: 0
		},
		bottom: {
			x: 0,
			y: 1
		},
		left: {
			x: -1,
			y: 0
		}
	},
	cost: function() {
		return this.step;
	},
	directions: function() {
		var step = this.step;
		var cost = this.cost();
		return [
			{
				offsetX: step,
				offsetY: 0,
				cost
			},
			{
				offsetX: -step,
				offsetY: 0,
				cost
			},
			{
				offsetX: 0,
				offsetY: step,
				cost
			},
			{
				offsetX: 0,
				offsetY: -step,
				cost
			}
		];
	},
	penalties: function() {
		return {
			0: 0,
			45: this.step / 2,
			90: this.step / 2
		};
	},
	paddingBox: function() {
		var step = this.step;
		return {
			x: -step,
			y: -step,
			width: 2 * step,
			height: 2 * step
		};
	},
	isPointObstacle: null,
	fallbackRouter: function(vertices, opt, linkView) {
		if (!isFunction(orthogonal)) throw new Error("Manhattan requires the orthogonal router as default fallback.");
		return orthogonal(vertices, assign({}, config$2, opt), linkView);
	},
	fallbackRoute: function(from, to, opt) {
		return null;
	},
	draggingRoute: null
};
function ObstacleMap(opt) {
	this.map = {};
	this.options = opt;
	this.mapGridSize = 100;
}
ObstacleMap.prototype.build = function(graph, link) {
	var opt = this.options;
	var excludedEnds = toArray(opt.excludeEnds).reduce(function(res, item) {
		var end = link.get(item);
		if (end) {
			var cell = graph.getCell(end.id);
			if (cell) res.push(cell);
		}
		return res;
	}, []);
	var excludedAncestors = [];
	var source = graph.getCell(link.get("source").id);
	if (source) excludedAncestors = union(excludedAncestors, source.getAncestors().map(function(cell) {
		return cell.id;
	}));
	var target = graph.getCell(link.get("target").id);
	if (target) excludedAncestors = union(excludedAncestors, target.getAncestors().map(function(cell) {
		return cell.id;
	}));
	var mapGridSize = this.mapGridSize;
	graph.getElements().reduce(function(map, element) {
		var isExcludedType = toArray(opt.excludeTypes).includes(element.get("type"));
		var isExcludedEnd = excludedEnds.find(function(excluded) {
			return excluded.id === element.id;
		});
		var isExcludedAncestor = excludedAncestors.includes(element.id);
		var isExcluded = isExcludedType || isExcludedEnd || isExcludedAncestor;
		if (!isExcluded) {
			var bbox$1 = element.getBBox().moveAndExpand(opt.paddingBox);
			var origin = bbox$1.origin().snapToGrid(mapGridSize);
			var corner = bbox$1.corner().snapToGrid(mapGridSize);
			for (var x = origin.x; x <= corner.x; x += mapGridSize) for (var y = origin.y; y <= corner.y; y += mapGridSize) {
				var gridKey = x + "@" + y;
				map[gridKey] = map[gridKey] || [];
				map[gridKey].push(bbox$1);
			}
		}
		return map;
	}, this.map);
	return this;
};
ObstacleMap.prototype.isPointAccessible = function(point$1) {
	var mapKey = point$1.clone().snapToGrid(this.mapGridSize).toString();
	return toArray(this.map[mapKey]).every(function(obstacle) {
		return !obstacle.containsPoint(point$1);
	});
};
function SortedSet() {
	this.items = [];
	this.hash = {};
	this.values = {};
	this.OPEN = 1;
	this.CLOSE = 2;
}
SortedSet.prototype.add = function(item, value) {
	if (this.hash[item]) this.items.splice(this.items.indexOf(item), 1);
	else this.hash[item] = this.OPEN;
	this.values[item] = value;
	var index = sortedIndex(this.items, item, function(i) {
		return this.values[i];
	}.bind(this));
	this.items.splice(index, 0, item);
};
SortedSet.prototype.remove = function(item) {
	this.hash[item] = this.CLOSE;
};
SortedSet.prototype.isOpen = function(item) {
	return this.hash[item] === this.OPEN;
};
SortedSet.prototype.isClose = function(item) {
	return this.hash[item] === this.CLOSE;
};
SortedSet.prototype.isEmpty = function() {
	return this.items.length === 0;
};
SortedSet.prototype.pop = function() {
	var item = this.items.shift();
	this.remove(item);
	return item;
};
function getSourceBBox(linkView, opt) {
	if (opt && opt.paddingBox) return linkView.sourceBBox.clone().moveAndExpand(opt.paddingBox);
	return linkView.sourceBBox.clone();
}
function getTargetBBox(linkView, opt) {
	if (opt && opt.paddingBox) return linkView.targetBBox.clone().moveAndExpand(opt.paddingBox);
	return linkView.targetBBox.clone();
}
function getSourceAnchor(linkView, opt) {
	if (linkView.sourceAnchor) return linkView.sourceAnchor;
	var sourceBBox = getSourceBBox(linkView, opt);
	return sourceBBox.center();
}
function getTargetAnchor(linkView, opt) {
	if (linkView.targetAnchor) return linkView.targetAnchor;
	var targetBBox = getTargetBBox(linkView, opt);
	return targetBBox.center();
}
function getDirectionAngle(start, end, numDirections, grid, opt) {
	var quadrant = 360 / numDirections;
	var angleTheta = start.theta(fixAngleEnd(start, end, grid, opt));
	var normalizedAngle = normalizeAngle(angleTheta + quadrant / 2);
	return quadrant * Math.floor(normalizedAngle / quadrant);
}
function fixAngleEnd(start, end, grid, opt) {
	var step = opt.step;
	var diffX = end.x - start.x;
	var diffY = end.y - start.y;
	var gridStepsX = diffX / grid.x;
	var gridStepsY = diffY / grid.y;
	var distanceX = gridStepsX * step;
	var distanceY = gridStepsY * step;
	return new Point(start.x + distanceX, start.y + distanceY);
}
function getDirectionChange(angle1, angle2) {
	var directionChange = Math.abs(angle1 - angle2);
	return directionChange > 180 ? 360 - directionChange : directionChange;
}
function getGridOffsets(directions, grid, opt) {
	var step = opt.step;
	toArray(opt.directions).forEach(function(direction) {
		direction.gridOffsetX = direction.offsetX / step * grid.x;
		direction.gridOffsetY = direction.offsetY / step * grid.y;
	});
}
function getGrid(step, source, target) {
	return {
		source: source.clone(),
		x: getGridDimension(target.x - source.x, step),
		y: getGridDimension(target.y - source.y, step)
	};
}
function getGridDimension(diff$1, step) {
	if (!diff$1) return step;
	var absDiff = Math.abs(diff$1);
	var numSteps = Math.round(absDiff / step);
	if (!numSteps) return absDiff;
	var roundedDiff = numSteps * step;
	var remainder = absDiff - roundedDiff;
	var stepCorrection = remainder / numSteps;
	return step + stepCorrection;
}
function snapToGrid$1(point$1, grid) {
	var source = grid.source;
	var snappedX = snapToGrid(point$1.x - source.x, grid.x) + source.x;
	var snappedY = snapToGrid(point$1.y - source.y, grid.y) + source.y;
	return new Point(snappedX, snappedY);
}
function round(point$1, precision) {
	return point$1.round(precision);
}
function align(point$1, grid, precision) {
	return round(snapToGrid$1(point$1.clone(), grid), precision);
}
function getKey(point$1) {
	return point$1.clone().toString();
}
function normalizePoint(point$1) {
	return new Point(point$1.x === 0 ? 0 : Math.abs(point$1.x) / point$1.x, point$1.y === 0 ? 0 : Math.abs(point$1.y) / point$1.y);
}
function reconstructRoute(parents, points, tailPoint, from, to, grid, opt) {
	var route = [];
	var prevDiff = normalizePoint(to.difference(tailPoint));
	var currentKey = getKey(tailPoint);
	var parent$1 = parents[currentKey];
	var point$1;
	while (parent$1) {
		point$1 = points[currentKey];
		var diff$1 = normalizePoint(point$1.difference(parent$1));
		if (!diff$1.equals(prevDiff)) {
			route.unshift(point$1);
			prevDiff = diff$1;
		}
		currentKey = getKey(parent$1);
		parent$1 = parents[currentKey];
	}
	var leadPoint = points[currentKey];
	var fromDiff = normalizePoint(leadPoint.difference(from));
	if (!fromDiff.equals(prevDiff)) route.unshift(leadPoint);
	return route;
}
function estimateCost(from, endPoints) {
	var min$4 = Infinity;
	for (var i = 0, len = endPoints.length; i < len; i++) {
		var cost = from.manhattanDistance(endPoints[i]);
		if (cost < min$4) min$4 = cost;
	}
	return min$4;
}
function getRectPoints(anchor$1, bbox$1, directionList, grid, opt) {
	var precision = opt.precision;
	var directionMap = opt.directionMap;
	var anchorCenterVector = anchor$1.difference(bbox$1.center());
	var keys$1 = isObject(directionMap) ? Object.keys(directionMap) : [];
	var dirList = toArray(directionList);
	var rectPoints = keys$1.reduce(function(res, key) {
		if (dirList.includes(key)) {
			var direction = directionMap[key];
			var endpoint = new Point(anchor$1.x + direction.x * (Math.abs(anchorCenterVector.x) + bbox$1.width), anchor$1.y + direction.y * (Math.abs(anchorCenterVector.y) + bbox$1.height));
			var intersectionLine = new Line(anchor$1, endpoint);
			var intersections = intersectionLine.intersect(bbox$1) || [];
			var numIntersections = intersections.length;
			var farthestIntersectionDistance;
			var farthestIntersection = null;
			for (var i = 0; i < numIntersections; i++) {
				var currentIntersection = intersections[i];
				var distance = anchor$1.squaredDistance(currentIntersection);
				if (farthestIntersectionDistance === void 0 || distance > farthestIntersectionDistance) {
					farthestIntersectionDistance = distance;
					farthestIntersection = currentIntersection;
				}
			}
			if (farthestIntersection) {
				var point$1 = align(farthestIntersection, grid, precision);
				if (bbox$1.containsPoint(point$1)) point$1 = align(point$1.offset(direction.x * grid.x, direction.y * grid.y), grid, precision);
				res.push(point$1);
			}
		}
		return res;
	}, []);
	if (!bbox$1.containsPoint(anchor$1)) rectPoints.push(align(anchor$1, grid, precision));
	return rectPoints;
}
function findRoute(from, to, isPointObstacle, opt) {
	var precision = opt.precision;
	var sourceAnchor, targetAnchor;
	if (from instanceof Rect) sourceAnchor = round(getSourceAnchor(this, opt).clone(), precision);
	else sourceAnchor = round(from.clone(), precision);
	if (to instanceof Rect) targetAnchor = round(getTargetAnchor(this, opt).clone(), precision);
	else targetAnchor = round(to.clone(), precision);
	var grid = getGrid(opt.step, sourceAnchor, targetAnchor);
	var start, end;
	var startPoints, endPoints;
	if (from instanceof Rect) {
		start = sourceAnchor;
		startPoints = getRectPoints(start, from, opt.startDirections, grid, opt);
	} else {
		start = sourceAnchor;
		startPoints = [start];
	}
	if (to instanceof Rect) {
		end = targetAnchor;
		endPoints = getRectPoints(targetAnchor, to, opt.endDirections, grid, opt);
	} else {
		end = targetAnchor;
		endPoints = [end];
	}
	startPoints = startPoints.filter((p) => !isPointObstacle(p));
	endPoints = endPoints.filter((p) => !isPointObstacle(p));
	if (startPoints.length > 0 && endPoints.length > 0) {
		var openSet = new SortedSet();
		var points = {};
		var parents = {};
		var costs = {};
		for (var i = 0, n = startPoints.length; i < n; i++) {
			var startPoint = startPoints[i];
			var key = getKey(startPoint);
			openSet.add(key, estimateCost(startPoint, endPoints));
			points[key] = startPoint;
			costs[key] = 0;
		}
		var previousRouteDirectionAngle = opt.previousDirectionAngle;
		var isPathBeginning = previousRouteDirectionAngle === void 0;
		var direction, directionChange;
		var directions = opt.directions;
		getGridOffsets(directions, grid, opt);
		var numDirections = directions.length;
		var endPointsKeys = toArray(endPoints).reduce(function(res, endPoint) {
			var key$1 = getKey(endPoint);
			res.push(key$1);
			return res;
		}, []);
		var loopsRemaining = opt.maximumLoops;
		while (!openSet.isEmpty() && loopsRemaining > 0) {
			var currentKey = openSet.pop();
			var currentPoint = points[currentKey];
			var currentParent = parents[currentKey];
			var currentCost = costs[currentKey];
			var isRouteBeginning = currentParent === void 0;
			var isStart = currentPoint.equals(start);
			var previousDirectionAngle;
			if (!isRouteBeginning) previousDirectionAngle = getDirectionAngle(currentParent, currentPoint, numDirections, grid, opt);
			else if (!isPathBeginning) previousDirectionAngle = previousRouteDirectionAngle;
			else if (!isStart) previousDirectionAngle = getDirectionAngle(start, currentPoint, numDirections, grid, opt);
			else previousDirectionAngle = null;
			var samePoints = startPoints.length === endPoints.length;
			if (samePoints) {
				for (var j = 0; j < startPoints.length; j++) if (!startPoints[j].equals(endPoints[j])) {
					samePoints = false;
					break;
				}
			}
			var skipEndCheck = isRouteBeginning && samePoints;
			if (!skipEndCheck && endPointsKeys.indexOf(currentKey) >= 0) {
				opt.previousDirectionAngle = previousDirectionAngle;
				return reconstructRoute(parents, points, currentPoint, start, end, grid, opt);
			}
			for (i = 0; i < numDirections; i++) {
				direction = directions[i];
				var directionAngle = direction.angle;
				directionChange = getDirectionChange(previousDirectionAngle, directionAngle);
				if (!(isPathBeginning && isStart) && directionChange > opt.maxAllowedDirectionChange) continue;
				var neighborPoint = align(currentPoint.clone().offset(direction.gridOffsetX, direction.gridOffsetY), grid, precision);
				var neighborKey = getKey(neighborPoint);
				if (openSet.isClose(neighborKey) || isPointObstacle(neighborPoint)) continue;
				if (endPointsKeys.indexOf(neighborKey) >= 0) {
					var isNeighborEnd = neighborPoint.equals(end);
					if (!isNeighborEnd) {
						var endDirectionAngle = getDirectionAngle(neighborPoint, end, numDirections, grid, opt);
						var endDirectionChange = getDirectionChange(directionAngle, endDirectionAngle);
						if (endDirectionChange > opt.maxAllowedDirectionChange) continue;
					}
				}
				var neighborCost = direction.cost;
				var neighborPenalty = isStart ? 0 : opt.penalties[directionChange];
				var costFromStart = currentCost + neighborCost + neighborPenalty;
				if (!openSet.isOpen(neighborKey) || costFromStart < costs[neighborKey]) {
					points[neighborKey] = neighborPoint;
					parents[neighborKey] = currentPoint;
					costs[neighborKey] = costFromStart;
					openSet.add(neighborKey, costFromStart + estimateCost(neighborPoint, endPoints));
				}
			}
			loopsRemaining--;
		}
	}
	return opt.fallbackRoute.call(this, start, end, opt);
}
function resolveOptions(opt) {
	opt.directions = result(opt, "directions");
	opt.penalties = result(opt, "penalties");
	opt.paddingBox = result(opt, "paddingBox");
	opt.padding = result(opt, "padding");
	if (opt.padding) {
		var sides = normalizeSides(opt.padding);
		opt.paddingBox = {
			x: -sides.left,
			y: -sides.top,
			width: sides.left + sides.right,
			height: sides.top + sides.bottom
		};
	}
	toArray(opt.directions).forEach(function(direction) {
		var point1 = new Point(0, 0);
		var point2 = new Point(direction.offsetX, direction.offsetY);
		direction.angle = normalizeAngle(point1.theta(point2));
	});
}
function router(vertices, opt, linkView) {
	resolveOptions(opt);
	linkView.options.perpendicular = !!opt.perpendicular;
	var sourceBBox = getSourceBBox(linkView, opt);
	var targetBBox = getTargetBBox(linkView, opt);
	var sourceAnchor = getSourceAnchor(linkView, opt);
	let isPointObstacle;
	if (typeof opt.isPointObstacle === "function") isPointObstacle = opt.isPointObstacle;
	else {
		const map = new ObstacleMap(opt);
		map.build(linkView.paper.model, linkView.model);
		isPointObstacle = (point$1) => !map.isPointAccessible(point$1);
	}
	var oldVertices = toArray(vertices).map(Point);
	var newVertices = [];
	var tailPoint = sourceAnchor;
	var to, from;
	for (var i = 0, len = oldVertices.length; i <= len; i++) {
		var partialRoute = null;
		from = to || sourceBBox;
		to = oldVertices[i];
		if (!to) {
			to = targetBBox;
			var isEndingAtPoint = !linkView.model.get("source").id || !linkView.model.get("target").id;
			if (isEndingAtPoint && isFunction(opt.draggingRoute)) {
				var dragFrom = from === sourceBBox ? sourceAnchor : from;
				var dragTo = to.origin();
				partialRoute = opt.draggingRoute.call(linkView, dragFrom, dragTo, opt);
			}
		}
		partialRoute = partialRoute || findRoute.call(linkView, from, to, isPointObstacle, opt);
		if (partialRoute === null) return opt.fallbackRouter(vertices, opt, linkView);
		var leadPoint = partialRoute[0];
		if (leadPoint && leadPoint.equals(tailPoint)) partialRoute.shift();
		tailPoint = partialRoute[partialRoute.length - 1] || tailPoint;
		Array.prototype.push.apply(newVertices, partialRoute);
	}
	return newVertices;
}
const manhattan = function(vertices, opt, linkView) {
	return router(vertices, assign({}, config$2, opt), linkView);
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/routers/metro.mjs
var config$1 = {
	maxAllowedDirectionChange: 45,
	diagonalCost: function() {
		var step = this.step;
		return Math.ceil(Math.sqrt(step * step << 1));
	},
	directions: function() {
		var step = this.step;
		var cost = this.cost();
		var diagonalCost = this.diagonalCost();
		return [
			{
				offsetX: step,
				offsetY: 0,
				cost
			},
			{
				offsetX: step,
				offsetY: step,
				cost: diagonalCost
			},
			{
				offsetX: 0,
				offsetY: step,
				cost
			},
			{
				offsetX: -step,
				offsetY: step,
				cost: diagonalCost
			},
			{
				offsetX: -step,
				offsetY: 0,
				cost
			},
			{
				offsetX: -step,
				offsetY: -step,
				cost: diagonalCost
			},
			{
				offsetX: 0,
				offsetY: -step,
				cost
			},
			{
				offsetX: step,
				offsetY: -step,
				cost: diagonalCost
			}
		];
	},
	fallbackRoute: function(from, to, opt) {
		var theta = from.theta(to);
		var route = [];
		var a = {
			x: to.x,
			y: from.y
		};
		var b = {
			x: from.x,
			y: to.y
		};
		if (theta % 180 > 90) {
			var t = a;
			a = b;
			b = t;
		}
		var p1 = theta % 90 < 45 ? a : b;
		var l1 = new Line(from, p1);
		var alpha = 90 * Math.ceil(theta / 90);
		var p2 = Point.fromPolar(l1.squaredLength(), toRad(alpha + 135), p1);
		var l2 = new Line(to, p2);
		var intersectionPoint = l1.intersection(l2);
		var point$1 = intersectionPoint ? intersectionPoint : to;
		var directionFrom = intersectionPoint ? point$1 : from;
		var quadrant = 360 / opt.directions.length;
		var angleTheta = directionFrom.theta(to);
		var normalizedAngle = normalizeAngle(angleTheta + quadrant / 2);
		var directionAngle = quadrant * Math.floor(normalizedAngle / quadrant);
		opt.previousDirectionAngle = directionAngle;
		if (point$1) route.push(point$1.round());
		route.push(to);
		return route;
	}
};
const metro = function(vertices, opt, linkView) {
	if (!isFunction(manhattan)) throw new Error("Metro requires the manhattan router.");
	return manhattan(vertices, assign({}, config$1, opt), linkView);
};

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/routers/rightAngle.mjs
const Directions = {
	AUTO: "auto",
	LEFT: "left",
	RIGHT: "right",
	TOP: "top",
	BOTTOM: "bottom",
	ANCHOR_SIDE: "anchor-side",
	MAGNET_SIDE: "magnet-side"
};
const DEFINED_DIRECTIONS = [
	Directions.LEFT,
	Directions.RIGHT,
	Directions.TOP,
	Directions.BOTTOM
];
const OPPOSITE_DIRECTIONS = {
	[Directions.LEFT]: Directions.RIGHT,
	[Directions.RIGHT]: Directions.LEFT,
	[Directions.TOP]: Directions.BOTTOM,
	[Directions.BOTTOM]: Directions.TOP
};
const VERTICAL_DIRECTIONS = [Directions.TOP, Directions.BOTTOM];
const ANGLE_DIRECTION_MAP = {
	0: Directions.RIGHT,
	180: Directions.LEFT,
	270: Directions.TOP,
	90: Directions.BOTTOM
};
function getSegmentAngle(line$2) {
	return line$2.angle();
}
function simplifyPoints(points) {
	return new Polyline(points).simplify({ threshold: 1 }).points;
}
function resolveSides(source, target) {
	const { point: sourcePoint, x0: sx0, y0: sy0, view: sourceView, bbox: sourceBBox, direction: sourceDirection } = source;
	const { point: targetPoint, x0: tx0, y0: ty0, view: targetView, bbox: targetBBox, direction: targetDirection } = target;
	let sourceSide;
	if (!sourceView) {
		const sourceLinkAnchorBBox = new Rect(sx0, sy0, 0, 0);
		sourceSide = DEFINED_DIRECTIONS.includes(sourceDirection) ? sourceDirection : sourceLinkAnchorBBox.sideNearestToPoint(targetPoint);
	} else if (sourceView.model.isLink()) sourceSide = getDirectionForLinkConnection(targetPoint, sourcePoint, sourceView);
	else if (sourceDirection === Directions.ANCHOR_SIDE) sourceSide = sourceBBox.sideNearestToPoint(sourcePoint);
	else if (sourceDirection === Directions.MAGNET_SIDE) sourceSide = sourceView.model.getBBox().sideNearestToPoint(sourcePoint);
	else sourceSide = sourceDirection;
	let targetSide;
	if (!targetView) {
		const targetLinkAnchorBBox = new Rect(tx0, ty0, 0, 0);
		targetSide = DEFINED_DIRECTIONS.includes(targetDirection) ? targetDirection : targetLinkAnchorBBox.sideNearestToPoint(sourcePoint);
	} else if (targetView.model.isLink()) targetSide = getDirectionForLinkConnection(sourcePoint, targetPoint, targetView);
	else if (targetDirection === Directions.ANCHOR_SIDE) targetSide = targetBBox.sideNearestToPoint(targetPoint);
	else if (targetDirection === Directions.MAGNET_SIDE) targetSide = targetView.model.getBBox().sideNearestToPoint(targetPoint);
	else targetSide = targetDirection;
	return [sourceSide, targetSide];
}
function resolveForTopSourceSide(source, target, nextInLine) {
	const { x0: sx0, y0: sy0, width: width$1, height: height$1, point: anchor$1, margin } = source;
	const sx1 = sx0 + width$1;
	const sy1 = sy0 + height$1;
	const smx0 = sx0 - margin;
	const smx1 = sx1 + margin;
	const smy0 = sy0 - margin;
	const { x: ax } = anchor$1;
	const { x0: tx, y0: ty } = target;
	if (tx === ax && ty < sy0) return Directions.BOTTOM;
	if (tx < ax && ty < smy0) {
		if (nextInLine.point.x === ax) return Directions.BOTTOM;
		return Directions.RIGHT;
	}
	if (tx > ax && ty < smy0) {
		if (nextInLine.point.x === ax) return Directions.BOTTOM;
		return Directions.LEFT;
	}
	if (tx < smx0 && ty > smy0) return Directions.TOP;
	if (tx > smx1 && ty > smy0) return Directions.TOP;
	if (tx >= smx0 && tx <= ax && ty > sy1) {
		if (nextInLine.point.x < tx) return Directions.RIGHT;
		return Directions.LEFT;
	}
	if (tx <= smx1 && tx >= ax && ty > sy1) {
		if (nextInLine.point.x < tx) return Directions.RIGHT;
		return Directions.LEFT;
	}
	return Directions.BOTTOM;
}
function resolveForBottomSourceSide(source, target, nextInLine) {
	const { x0: sx0, y0: sy0, width: width$1, height: height$1, point: anchor$1, margin } = source;
	const sx1 = sx0 + width$1;
	const sy1 = sy0 + height$1;
	const smx0 = sx0 - margin;
	const smx1 = sx1 + margin;
	const smy1 = sy1 + margin;
	const { x: ax } = anchor$1;
	const { x0: tx, y0: ty } = target;
	if (tx === ax && ty > sy1) return Directions.TOP;
	if (tx < ax && ty > smy1) {
		if (nextInLine.point.x === ax) return Directions.TOP;
		return Directions.RIGHT;
	}
	if (tx > ax && ty > smy1) {
		if (nextInLine.point.x === ax) return Directions.TOP;
		return Directions.LEFT;
	}
	if (tx < smx0 && ty < smy1) return Directions.BOTTOM;
	if (tx > smx1 && ty < smy1) return Directions.BOTTOM;
	if (tx >= smx0 && tx <= ax && ty < sy0) {
		if (nextInLine.point.x < tx) return Directions.RIGHT;
		return Directions.LEFT;
	}
	if (tx <= smx1 && tx >= ax && ty < sy0) {
		if (nextInLine.point.x < tx) return Directions.RIGHT;
		return Directions.LEFT;
	}
	return Directions.TOP;
}
function resolveForLeftSourceSide(source, target, nextInLine) {
	const { y0: sy0, x0: sx0, width: width$1, height: height$1, point: anchor$1, margin } = source;
	const sx1 = sx0 + width$1;
	const sy1 = sy0 + height$1;
	const smx0 = sx0 - margin;
	const smy0 = sy0 - margin;
	const smy1 = sy1 + margin;
	const { x: ax, y: ay } = anchor$1;
	const { x0: tx, y0: ty } = target;
	if (tx < ax && ty === ay) return Directions.RIGHT;
	if (tx <= smx0 && ty < ay) return Directions.BOTTOM;
	if (tx <= smx0 && ty > ay) return Directions.TOP;
	if (tx >= smx0 && ty < smy0) return Directions.LEFT;
	if (tx >= smx0 && ty > smy1) return Directions.LEFT;
	if (tx > sx1 && ty >= smy0 && ty <= ay) {
		if (nextInLine.point.y < ty) return Directions.BOTTOM;
		return Directions.TOP;
	}
	if (tx > sx1 && ty <= smy1 && ty >= ay) {
		if (nextInLine.point.y < ty) return Directions.BOTTOM;
		return Directions.TOP;
	}
	return Directions.RIGHT;
}
function resolveForRightSourceSide(source, target, nextInLine) {
	const { y0: sy0, x0: sx0, width: width$1, height: height$1, point: anchor$1, margin } = source;
	const sx1 = sx0 + width$1;
	const sy1 = sy0 + height$1;
	const smx1 = sx1 + margin;
	const smy0 = sy0 - margin;
	const smy1 = sy1 + margin;
	const { x: ax, y: ay } = anchor$1;
	const { x0: tx, y0: ty } = target;
	if (tx > ax && ty === ay) return Directions.LEFT;
	if (tx >= smx1 && ty < ay) return Directions.BOTTOM;
	if (tx >= smx1 && ty > ay) return Directions.TOP;
	if (tx <= smx1 && ty < smy0) return Directions.RIGHT;
	if (tx <= smx1 && ty > smy1) return Directions.RIGHT;
	if (tx < sx0 && ty >= smy0 && ty <= ay) {
		if (nextInLine.point.y < ty) return Directions.BOTTOM;
		return Directions.TOP;
	}
	if (tx < sx0 && ty <= smy1 && ty >= ay) {
		if (nextInLine.point.y < ty) return Directions.BOTTOM;
		return Directions.TOP;
	}
	return Directions.LEFT;
}
function resolveInitialDirection(source, target, nextInLine) {
	const [sourceSide] = resolveSides(source, target);
	switch (sourceSide) {
		case Directions.TOP: return resolveForTopSourceSide(source, target, nextInLine);
		case Directions.RIGHT: return resolveForRightSourceSide(source, target, nextInLine);
		case Directions.BOTTOM: return resolveForBottomSourceSide(source, target, nextInLine);
		case Directions.LEFT: return resolveForLeftSourceSide(source, target, nextInLine);
	}
}
function getDirectionForLinkConnection(linkOrigin, connectionPoint, linkView) {
	const tangent = linkView.getTangentAtLength(linkView.getClosestPointLength(connectionPoint));
	const roundedAngle = Math.round(getSegmentAngle(tangent) / 90) * 90;
	if (roundedAngle % 180 === 0 && linkOrigin.y === connectionPoint.y) return linkOrigin.x < connectionPoint.x ? Directions.LEFT : Directions.RIGHT;
	else if (linkOrigin.x === connectionPoint.x) return linkOrigin.y < connectionPoint.y ? Directions.TOP : Directions.BOTTOM;
	switch (roundedAngle) {
		case 0:
		case 180:
		case 360: return linkOrigin.y < connectionPoint.y ? Directions.TOP : Directions.BOTTOM;
		case 90:
		case 270: return linkOrigin.x < connectionPoint.x ? Directions.LEFT : Directions.RIGHT;
	}
}
function pointDataFromAnchor(view, point$1, bbox$1, direction, isPort, fallBackAnchor, margin) {
	if (direction === Directions.AUTO) direction = isPort ? Directions.MAGNET_SIDE : Directions.ANCHOR_SIDE;
	const isElement = view && view.model.isElement();
	const { x: x0, y: y0, width: width$1 = 0, height: height$1 = 0 } = isElement ? Rect.fromRectUnion(bbox$1, view.model.getBBox()) : fallBackAnchor;
	return {
		point: point$1,
		x0,
		y0,
		view,
		bbox: bbox$1,
		width: width$1,
		height: height$1,
		direction,
		margin: isElement ? margin : 0
	};
}
function pointDataFromVertex({ x, y }) {
	const point$1 = new Point(x, y);
	return {
		point: point$1,
		x0: point$1.x,
		y0: point$1.y,
		view: null,
		bbox: new Rect(x, y, 0, 0),
		width: 0,
		height: 0,
		direction: null,
		margin: 0
	};
}
function getOutsidePoint(side, pointData, margin) {
	const outsidePoint = pointData.point.clone();
	const { x0, y0, width: width$1, height: height$1 } = pointData;
	switch (side) {
		case "left":
			outsidePoint.x = x0 - margin;
			break;
		case "right":
			outsidePoint.x = x0 + width$1 + margin;
			break;
		case "top":
			outsidePoint.y = y0 - margin;
			break;
		case "bottom":
			outsidePoint.y = y0 + height$1 + margin;
			break;
	}
	return outsidePoint;
}
function createLoop(from, to, { dx = 0, dy = 0 }) {
	const p1 = {
		x: from.point.x + dx,
		y: from.point.y + dy
	};
	const p2 = {
		x: to.point.x + dx,
		y: to.point.y + dy
	};
	return [
		from.point,
		p1,
		p2,
		to.point
	];
}
function loopSegment(from, to, connectionSegmentAngle, margin) {
	const angle = normalizeAngle(connectionSegmentAngle - 90);
	let dx = 0;
	let dy = 0;
	if (angle === 90) dy = -margin;
	else if (angle === 180) dx = -margin;
	else if (angle === 270) dy = margin;
	else if (angle === 0) dx = margin;
	const loopRoute = createLoop(from, to, {
		dx,
		dy
	});
	const secondCreatedPoint = loopRoute[2];
	const loopEndSegment = new Line(to.point, secondCreatedPoint);
	const continueDirection = ANGLE_DIRECTION_MAP[getSegmentAngle(loopEndSegment)];
	return {
		loopRoute,
		continueDirection
	};
}
function getHorizontalDistance(source, target) {
	const { x0: sx0, x1: sx1, outsidePoint: sourcePoint } = source;
	const { x0: tx0, x1: tx1, outsidePoint: targetPoint } = target;
	let leftBoundary = Math.min(sx0, tx0);
	let rightBoundary = Math.max(sx1, tx1);
	if (source.direction === target.direction) {
		const aboveShape = source.y0 < target.y0 ? source : target;
		const belowShape = aboveShape === source ? target : source;
		const boundaryDefiningShape = source.direction === Directions.TOP ? aboveShape : belowShape;
		leftBoundary = boundaryDefiningShape.x0;
		rightBoundary = boundaryDefiningShape.x1;
	}
	const { x: sox } = sourcePoint;
	const { x: tox } = targetPoint;
	const leftDistance1 = Math.abs(sox - leftBoundary);
	const leftDistance2 = Math.abs(tox - leftBoundary);
	const leftD = leftDistance1 + leftDistance2;
	const rightDistance1 = Math.abs(sox - rightBoundary);
	const rightDistance2 = Math.abs(tox - rightBoundary);
	const rightD = rightDistance1 + rightDistance2;
	return [leftD, rightD];
}
function getVerticalDistance(source, target) {
	const { y0: sy0, y1: sy1, outsidePoint: sourcePoint } = source;
	const { y0: ty0, y1: ty1, outsidePoint: targetPoint } = target;
	let topBoundary = Math.min(sy0, ty0);
	let bottomBoundary = Math.max(sy1, ty1);
	if (source.direction === target.direction) {
		const leftShape = source.x0 < target.x0 ? source : target;
		const rightShape = leftShape === source ? target : source;
		const boundaryDefiningShape = source.direction === Directions.LEFT ? leftShape : rightShape;
		topBoundary = boundaryDefiningShape.y0;
		bottomBoundary = boundaryDefiningShape.y1;
	}
	const { y: soy } = sourcePoint;
	const { y: toy } = targetPoint;
	const topDistance1 = Math.abs(soy - topBoundary);
	const topDistance2 = Math.abs(toy - topBoundary);
	const topD = topDistance1 + topDistance2;
	const bottomDistance1 = Math.abs(soy - bottomBoundary);
	const bottomDistance2 = Math.abs(toy - bottomBoundary);
	const bottomD = bottomDistance1 + bottomDistance2;
	return [topD, bottomD];
}
function moveAndExpandBBox(bbox$1, direction, margin) {
	switch (direction) {
		case Directions.LEFT:
			bbox$1.inflate(0, margin).moveAndExpand({
				x: -margin,
				width: margin
			});
			break;
		case Directions.RIGHT:
			bbox$1.inflate(0, margin).moveAndExpand({ width: margin });
			break;
		case Directions.TOP:
			bbox$1.inflate(margin, 0).moveAndExpand({
				y: -margin,
				height: margin
			});
			break;
		case Directions.BOTTOM:
			bbox$1.inflate(margin, 0).moveAndExpand({ height: margin });
			break;
	}
	return bbox$1;
}
function routeBetweenPoints(source, target, opt = {}) {
	const { point: sourcePoint, x0: sx0, y0: sy0, width: sourceWidth, height: sourceHeight, margin: sourceMargin } = source;
	const { point: targetPoint, x0: tx0, y0: ty0, width: targetWidth, height: targetHeight, margin: targetMargin } = target;
	const { targetInSourceBBox = false } = opt;
	const tx1 = tx0 + targetWidth;
	const ty1 = ty0 + targetHeight;
	const sx1 = sx0 + sourceWidth;
	const sy1 = sy0 + sourceHeight;
	const smx0 = sx0 - sourceMargin;
	const smx1 = sx1 + sourceMargin;
	const smy0 = sy0 - sourceMargin;
	const smy1 = sy1 + sourceMargin;
	const tmx0 = tx0 - targetMargin;
	const tmx1 = tx1 + targetMargin;
	const tmy0 = ty0 - targetMargin;
	const tmy1 = ty1 + targetMargin;
	const [sourceSide, targetSide] = resolveSides(source, target);
	const sourceOutsidePoint = getOutsidePoint(sourceSide, {
		point: sourcePoint,
		x0: sx0,
		y0: sy0,
		width: sourceWidth,
		height: sourceHeight
	}, sourceMargin);
	const targetOutsidePoint = getOutsidePoint(targetSide, {
		point: targetPoint,
		x0: tx0,
		y0: ty0,
		width: targetWidth,
		height: targetHeight
	}, targetMargin);
	const { x: sox, y: soy } = sourceOutsidePoint;
	const { x: tox, y: toy } = targetOutsidePoint;
	const tcx = (tx0 + tx1) / 2;
	const tcy = (ty0 + ty1) / 2;
	const scx = (sx0 + sx1) / 2;
	const scy = (sy0 + sy1) / 2;
	const middleOfVerticalSides = (scx < tcx ? sx1 + tx0 : tx1 + sx0) / 2;
	const middleOfHorizontalSides = (scy < tcy ? sy1 + ty0 : ty1 + sy0) / 2;
	const sourceBBox = new Rect(sx0, sy0, sourceWidth, sourceHeight);
	const targetBBox = new Rect(tx0, ty0, targetWidth, targetHeight);
	const inflatedSourceBBox = sourceBBox.clone().inflate(sourceMargin);
	const inflatedTargetBBox = targetBBox.clone().inflate(targetMargin);
	const sourceForDistance = Object.assign({}, source, {
		x1: sx1,
		y1: sy1,
		outsidePoint: sourceOutsidePoint,
		direction: sourceSide
	});
	const targetForDistance = Object.assign({}, target, {
		x1: tx1,
		y1: ty1,
		outsidePoint: targetOutsidePoint,
		direction: targetSide
	});
	const [leftD, rightD] = getHorizontalDistance(sourceForDistance, targetForDistance);
	const [topD, bottomD] = getVerticalDistance(sourceForDistance, targetForDistance);
	if (sourceSide === "left" && targetSide === "right") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetOutsidePoint);
		const isPointInsideTarget = inflatedTargetBBox.containsPoint(sourceOutsidePoint);
		if (isPointInsideSource || isPointInsideTarget) {
			const middleOfAnchors = (soy + toy) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: sox,
					y: middleOfAnchors
				},
				{
					x: tox,
					y: middleOfAnchors
				},
				{
					x: tox,
					y: toy
				}
			];
		}
		if (smx0 < tox) {
			let y = middleOfHorizontalSides;
			let x1 = sox;
			let x2 = tox;
			const isUpwardsShorter = topD < bottomD;
			if (y >= smy0 && y <= smy1 || y >= tmy0 && y <= tmy1) {
				if (smy1 >= tmy0 && isUpwardsShorter) y = Math.min(tmy0, smy0);
				else if (smy0 <= tmy1 && !isUpwardsShorter) y = Math.max(tmy1, smy1);
				x1 = Math.min(sox, tmx0);
				x2 = Math.max(tox, smx1);
				if (isUpwardsShorter && soy < ty0 || !isUpwardsShorter && soy > ty1) x1 = sox;
				else if (isUpwardsShorter && toy < sy0 || !isUpwardsShorter && toy > sy1) x2 = tox;
			}
			return [
				{
					x: x1,
					y: soy
				},
				{
					x: x1,
					y
				},
				{
					x: x2,
					y
				},
				{
					x: x2,
					y: toy
				}
			];
		}
		const x = (sox + tox) / 2;
		return [{
			x,
			y: soy
		}, {
			x,
			y: toy
		}];
	} else if (sourceSide === "right" && targetSide === "left") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetOutsidePoint);
		const isPointInsideTarget = inflatedTargetBBox.containsPoint(sourceOutsidePoint);
		if (isPointInsideSource || isPointInsideTarget) {
			const middleOfAnchors = (soy + toy) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: sox,
					y: middleOfAnchors
				},
				{
					x: tox,
					y: middleOfAnchors
				},
				{
					x: tox,
					y: toy
				}
			];
		}
		if (smx1 > tox) {
			let y = middleOfHorizontalSides;
			let x1 = sox;
			let x2 = tox;
			const isUpwardsShorter = topD < bottomD;
			if (y >= smy0 && y <= smy1 || y >= tmy0 && y <= tmy1) {
				if (smy1 >= tmy0 && isUpwardsShorter) y = Math.min(tmy0, smy0);
				else if (smy0 <= tmy1 && !isUpwardsShorter) y = Math.max(tmy1, smy1);
				x1 = Math.max(sox, tmx1);
				x2 = Math.min(tox, smx0);
				if (isUpwardsShorter && soy < ty0 || !isUpwardsShorter && soy > ty1) x1 = sox;
				else if (isUpwardsShorter && toy < sy0 || !isUpwardsShorter && toy > sy1) x2 = tox;
			}
			return [
				{
					x: x1,
					y: soy
				},
				{
					x: x1,
					y
				},
				{
					x: x2,
					y
				},
				{
					x: x2,
					y: toy
				}
			];
		}
		const x = (sox + tox) / 2;
		return [{
			x,
			y: soy
		}, {
			x,
			y: toy
		}];
	} else if (sourceSide === "top" && targetSide === "bottom") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetOutsidePoint);
		const isPointInsideTarget = inflatedTargetBBox.containsPoint(sourceOutsidePoint);
		if (isPointInsideSource || isPointInsideTarget) {
			const middleOfAnchors = (sox + tox) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: middleOfAnchors,
					y: soy
				},
				{
					x: middleOfAnchors,
					y: toy
				},
				{
					x: tox,
					y: toy
				}
			];
		}
		if (smy0 < toy) {
			let x = middleOfVerticalSides;
			let y1 = soy;
			let y2 = toy;
			const isLeftShorter = leftD < rightD;
			if (x >= smx0 && x <= smx1 || x >= tmx0 && x <= tmx1) {
				if (smx1 >= tmx0 && isLeftShorter) x = Math.min(tmx0, smx0);
				else if (smx0 <= tmx1 && !isLeftShorter) x = Math.max(tmx1, smx1);
				y1 = Math.min(soy, tmy0);
				y2 = Math.max(toy, smy1);
				if (isLeftShorter && sox < tx0 || !isLeftShorter && sox > tx1) y1 = soy;
				else if (isLeftShorter && tox < sx0 || !isLeftShorter && tox > sx1) y2 = toy;
			}
			return [
				{
					x: sox,
					y: y1
				},
				{
					x,
					y: y1
				},
				{
					x,
					y: y2
				},
				{
					x: tox,
					y: y2
				}
			];
		}
		const y = (soy + toy) / 2;
		return [{
			x: sox,
			y
		}, {
			x: tox,
			y
		}];
	} else if (sourceSide === "bottom" && targetSide === "top") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetOutsidePoint);
		const isPointInsideTarget = inflatedTargetBBox.containsPoint(sourceOutsidePoint);
		if (isPointInsideSource || isPointInsideTarget) {
			const middleOfAnchors = (sox + tox) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: middleOfAnchors,
					y: soy
				},
				{
					x: middleOfAnchors,
					y: toy
				},
				{
					x: tox,
					y: toy
				}
			];
		}
		if (smy1 > toy) {
			let x = middleOfVerticalSides;
			let y1 = soy;
			let y2 = toy;
			const isLeftShorter = leftD < rightD;
			if (x >= smx0 && x <= smx1 || x >= tmx0 && x <= tmx1) {
				if (smx1 >= tmx0 && isLeftShorter) x = Math.min(tmx0, smx0);
				else if (smx0 <= tmx1 && !isLeftShorter) x = Math.max(tmx1, smx1);
				y1 = Math.max(soy, tmy1);
				y2 = Math.min(toy, smy0);
				if (isLeftShorter && sox < tx0 || !isLeftShorter && sox > tx1) y1 = soy;
				else if (isLeftShorter && tox < sx0 || !isLeftShorter && tox > sx1) y2 = toy;
			}
			return [
				{
					x: sox,
					y: y1
				},
				{
					x,
					y: y1
				},
				{
					x,
					y: y2
				},
				{
					x: tox,
					y: y2
				}
			];
		}
		const y = (soy + toy) / 2;
		return [{
			x: sox,
			y
		}, {
			x: tox,
			y
		}];
	} else if (sourceSide === "top" && targetSide === "top") {
		const useUShapeConnection = targetInSourceBBox || intersection.rectWithRect(inflatedSourceBBox, targetBBox) || soy <= ty0 && (inflatedSourceBBox.bottomRight().x <= tox || inflatedSourceBBox.bottomLeft().x >= tox) || soy >= ty0 && (inflatedTargetBBox.bottomRight().x <= sox || inflatedTargetBBox.bottomLeft().x >= sox);
		if (useUShapeConnection && sox !== tox) return [{
			x: sox,
			y: Math.min(soy, toy)
		}, {
			x: tox,
			y: Math.min(soy, toy)
		}];
		let x;
		let y1 = Math.min((sy1 + ty0) / 2, toy);
		let y2 = Math.min((sy0 + ty1) / 2, soy);
		if (toy < soy) if (rightD > leftD) x = Math.min(sox, tmx0);
		else x = Math.max(sox, tmx1);
		else if (rightD > leftD) x = Math.min(tox, smx0);
		else x = Math.max(tox, smx1);
		return [
			{
				x: sox,
				y: y2
			},
			{
				x,
				y: y2
			},
			{
				x,
				y: y1
			},
			{
				x: tox,
				y: y1
			}
		];
	} else if (sourceSide === "bottom" && targetSide === "bottom") {
		const useUShapeConnection = targetInSourceBBox || intersection.rectWithRect(inflatedSourceBBox, targetBBox) || soy >= toy && (inflatedSourceBBox.topRight().x <= tox || inflatedSourceBBox.topLeft().x >= tox) || soy <= toy && (inflatedTargetBBox.topRight().x <= sox || inflatedTargetBBox.topLeft().x >= sox);
		if (useUShapeConnection && sox !== tox) return [{
			x: sox,
			y: Math.max(soy, toy)
		}, {
			x: tox,
			y: Math.max(soy, toy)
		}];
		let x;
		let y1 = Math.max((sy0 + ty1) / 2, toy);
		let y2 = Math.max((sy1 + ty0) / 2, soy);
		if (toy > soy) if (rightD > leftD) x = Math.min(sox, tmx0);
		else x = Math.max(sox, tmx1);
		else if (rightD > leftD) x = Math.min(tox, smx0);
		else x = Math.max(tox, smx1);
		return [
			{
				x: sox,
				y: y2
			},
			{
				x,
				y: y2
			},
			{
				x,
				y: y1
			},
			{
				x: tox,
				y: y1
			}
		];
	} else if (sourceSide === "left" && targetSide === "left") {
		const useUShapeConnection = targetInSourceBBox || intersection.rectWithRect(inflatedSourceBBox, targetBBox) || sox <= tox && (inflatedSourceBBox.bottomRight().y <= toy || inflatedSourceBBox.topRight().y >= toy) || sox >= tox && (inflatedTargetBBox.bottomRight().y <= soy || inflatedTargetBBox.topRight().y >= soy);
		if (useUShapeConnection && soy !== toy) return [{
			x: Math.min(sox, tox),
			y: soy
		}, {
			x: Math.min(sox, tox),
			y: toy
		}];
		let y;
		let x1 = Math.min((sx1 + tx0) / 2, tox);
		let x2 = Math.min((sx0 + tx1) / 2, sox);
		if (tox > sox) if (topD <= bottomD) y = Math.min(smy0, toy);
		else y = Math.max(smy1, toy);
		else if (topD <= bottomD) y = Math.min(tmy0, soy);
		else y = Math.max(tmy1, soy);
		return [
			{
				x: x2,
				y: soy
			},
			{
				x: x2,
				y
			},
			{
				x: x1,
				y
			},
			{
				x: x1,
				y: toy
			}
		];
	} else if (sourceSide === "right" && targetSide === "right") {
		const useUShapeConnection = targetInSourceBBox || intersection.rectWithRect(inflatedSourceBBox, targetBBox) || sox >= tox && (inflatedSourceBBox.bottomLeft().y <= toy || inflatedSourceBBox.topLeft().y >= toy) || sox <= tox && (inflatedTargetBBox.bottomLeft().y <= soy || inflatedTargetBBox.topLeft().y >= soy);
		if (useUShapeConnection && soy !== toy) return [{
			x: Math.max(sox, tox),
			y: soy
		}, {
			x: Math.max(sox, tox),
			y: toy
		}];
		let y;
		let x1 = Math.max((sx0 + tx1) / 2, tox);
		let x2 = Math.max((sx1 + tx0) / 2, sox);
		if (tox <= sox) if (topD <= bottomD) y = Math.min(smy0, toy);
		else y = Math.max(smy1, toy);
		else if (topD <= bottomD) y = Math.min(tmy0, soy);
		else y = Math.max(tmy1, soy);
		return [
			{
				x: x2,
				y: soy
			},
			{
				x: x2,
				y
			},
			{
				x: x1,
				y
			},
			{
				x: x1,
				y: toy
			}
		];
	} else if (sourceSide === "top" && targetSide === "right") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetPoint);
		if (isPointInsideSource) {
			if (sox <= tmx1) {
				const x$1 = Math.max(sox + sourceMargin, tox);
				const y = Math.min(smy0, tmy0);
				return [
					{
						x: sox,
						y
					},
					{
						x: x$1,
						y
					},
					{
						x: x$1,
						y: toy
					}
				];
			}
			const anchorMiddleX = (sox - sourceMargin + tox) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: anchorMiddleX,
					y: soy
				},
				{
					x: anchorMiddleX,
					y: toy
				}
			];
		}
		if (smy0 > toy) {
			if (sox < tox) {
				let y = tmy0;
				if (tmy1 <= smy0 && tmx1 >= sox) y = middleOfHorizontalSides;
				return [
					{
						x: sox,
						y
					},
					{
						x: tox,
						y
					},
					{
						x: tox,
						y: toy
					}
				];
			}
			return [{
				x: sox,
				y: toy
			}];
		}
		const x = Math.max(middleOfVerticalSides, tmx1);
		if (sox > tox && sy1 >= toy) return [
			{
				x: sox,
				y: soy
			},
			{
				x,
				y: soy
			},
			{
				x,
				y: toy
			}
		];
		if (x > smx0 && soy < ty1) {
			const y = Math.min(smy0, tmy0);
			const x$1 = Math.max(smx1, tmx1);
			return [
				{
					x: sox,
					y
				},
				{
					x: x$1,
					y
				},
				{
					x: x$1,
					y: toy
				}
			];
		}
		return [
			{
				x: sox,
				y: soy
			},
			{
				x,
				y: soy
			},
			{
				x,
				y: toy
			}
		];
	} else if (sourceSide === "top" && targetSide === "left") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetPoint);
		if (isPointInsideSource) {
			if (sox >= tmx0) {
				const x$1 = Math.min(sox - sourceMargin, tox);
				const y = Math.min(smy0, tmy0);
				return [
					{
						x: sox,
						y
					},
					{
						x: x$1,
						y
					},
					{
						x: x$1,
						y: toy
					}
				];
			}
			const anchorMiddleX = (sox + sourceMargin + tox) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: anchorMiddleX,
					y: soy
				},
				{
					x: anchorMiddleX,
					y: toy
				}
			];
		}
		if (smy0 > toy) {
			if (sox > tox) {
				let y = tmy0;
				if (tmy1 <= smy0 && tmx0 <= sox) y = middleOfHorizontalSides;
				return [
					{
						x: sox,
						y
					},
					{
						x: tox,
						y
					},
					{
						x: tox,
						y: toy
					}
				];
			}
			return [{
				x: sox,
				y: toy
			}];
		}
		const x = Math.min(tmx0, middleOfVerticalSides);
		if (sox < tox && sy1 >= toy) return [
			{
				x: sox,
				y: soy
			},
			{
				x,
				y: soy
			},
			{
				x,
				y: toy
			}
		];
		if (x < smx1 && soy < ty1) {
			const y = Math.min(smy0, tmy0);
			const x$1 = Math.min(smx0, tmx0);
			return [
				{
					x: sox,
					y
				},
				{
					x: x$1,
					y
				},
				{
					x: x$1,
					y: toy
				}
			];
		}
		return [
			{
				x: sox,
				y: soy
			},
			{
				x,
				y: soy
			},
			{
				x,
				y: toy
			}
		];
	} else if (sourceSide === "bottom" && targetSide === "right") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetPoint);
		if (isPointInsideSource) {
			if (sox <= tmx1) {
				const x$1 = Math.max(sox + sourceMargin, tox);
				const y = Math.max(smy1, tmy1);
				return [
					{
						x: sox,
						y
					},
					{
						x: x$1,
						y
					},
					{
						x: x$1,
						y: toy
					}
				];
			}
			const anchorMiddleX = (sox - sourceMargin + tox) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: anchorMiddleX,
					y: soy
				},
				{
					x: anchorMiddleX,
					y: toy
				}
			];
		}
		if (smy1 < toy) {
			if (sox < tox) {
				let y = tmy1;
				if (tmy0 >= smy1 && tmx1 >= sox) y = middleOfHorizontalSides;
				return [
					{
						x: sox,
						y
					},
					{
						x: tox,
						y
					},
					{
						x: tox,
						y: toy
					}
				];
			}
			return [{
				x: sox,
				y: toy
			}];
		}
		const x = Math.max(middleOfVerticalSides, tmx1);
		if (sox > tox && sy0 <= toy) return [
			{
				x: sox,
				y: soy
			},
			{
				x,
				y: soy
			},
			{
				x,
				y: toy
			}
		];
		if (x > smx0 && soy > ty0) {
			const y = Math.max(smy1, tmy1);
			const x$1 = Math.max(smx1, tmx1);
			return [
				{
					x: sox,
					y
				},
				{
					x: x$1,
					y
				},
				{
					x: x$1,
					y: toy
				}
			];
		}
		return [
			{
				x: sox,
				y: soy
			},
			{
				x,
				y: soy
			},
			{
				x,
				y: toy
			}
		];
	} else if (sourceSide === "bottom" && targetSide === "left") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetPoint);
		if (isPointInsideSource) {
			if (sox >= tmx0) {
				const x$1 = Math.min(sox - sourceMargin, tox);
				const y = Math.max(smy1, tmy1);
				return [
					{
						x: sox,
						y
					},
					{
						x: x$1,
						y
					},
					{
						x: x$1,
						y: toy
					}
				];
			}
			const anchorMiddleX = (sox + sourceMargin + tox) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: anchorMiddleX,
					y: soy
				},
				{
					x: anchorMiddleX,
					y: toy
				}
			];
		}
		if (smy1 < toy) {
			if (sox > tox) {
				let y = tmy1;
				if (tmy0 >= smy1 && tmx0 <= sox) y = middleOfHorizontalSides;
				return [
					{
						x: sox,
						y
					},
					{
						x: tox,
						y
					},
					{
						x: tox,
						y: toy
					}
				];
			}
			return [{
				x: sox,
				y: toy
			}];
		}
		const x = Math.min(tmx0, middleOfVerticalSides);
		if (sox < tox && sy0 <= toy) return [
			{
				x: sox,
				y: soy
			},
			{
				x,
				y: soy
			},
			{
				x,
				y: toy
			}
		];
		if (x < smx1 && soy > ty0) {
			const y = Math.max(smy1, tmy1);
			const x$1 = Math.min(smx0, tmx0);
			return [
				{
					x: sox,
					y
				},
				{
					x: x$1,
					y
				},
				{
					x: x$1,
					y: toy
				}
			];
		}
		return [
			{
				x: sox,
				y: soy
			},
			{
				x,
				y: soy
			},
			{
				x,
				y: toy
			}
		];
	} else if (sourceSide === "left" && targetSide === "bottom") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetPoint);
		if (isPointInsideSource) {
			if (soy <= tmy1) {
				const x = Math.min(smx0, tmx0);
				const y$1 = Math.max(soy + sourceMargin, toy);
				return [
					{
						x,
						y: soy
					},
					{
						x,
						y: y$1
					},
					{
						x: tox,
						y: y$1
					}
				];
			}
			const anchorMiddleY = (soy - sourceMargin + toy) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: sox,
					y: anchorMiddleY
				},
				{
					x: tox,
					y: anchorMiddleY
				}
			];
		}
		if (smx0 > tox) {
			if (soy < toy) {
				let x = tmx0;
				if (tmx1 <= smx0 && tmy1 >= soy) x = middleOfVerticalSides;
				return [
					{
						x,
						y: soy
					},
					{
						x,
						y: toy
					},
					{
						x: tox,
						y: toy
					}
				];
			}
			return [{
				x: tox,
				y: soy
			}];
		}
		const y = Math.max(tmy1, middleOfHorizontalSides);
		if (soy > toy && sx1 >= tox) return [
			{
				x: sox,
				y: soy
			},
			{
				x: sox,
				y
			},
			{
				x: tox,
				y
			}
		];
		if (y > smy0 && sox < tx1) {
			const x = Math.min(smx0, tmx0);
			const y$1 = Math.max(smy1, tmy1);
			return [
				{
					x,
					y: soy
				},
				{
					x,
					y: y$1
				},
				{
					x: tox,
					y: y$1
				}
			];
		}
		return [
			{
				x: sox,
				y: soy
			},
			{
				x: sox,
				y
			},
			{
				x: tox,
				y
			}
		];
	} else if (sourceSide === "left" && targetSide === "top") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetPoint);
		if (isPointInsideSource) {
			if (soy >= tmy0) {
				const y$1 = Math.min(soy - sourceMargin, toy);
				const x = Math.min(smx0, tmx0);
				return [
					{
						x,
						y: soy
					},
					{
						x,
						y: y$1
					},
					{
						x: tox,
						y: y$1
					}
				];
			}
			const anchorMiddleY = (soy + sourceMargin + toy) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: sox,
					y: anchorMiddleY
				},
				{
					x: tox,
					y: anchorMiddleY
				}
			];
		}
		if (smx0 > tox) {
			if (soy > toy) {
				let x = tmx0;
				if (tmx1 <= smx0 && tmy0 <= soy) x = middleOfVerticalSides;
				return [
					{
						x,
						y: soy
					},
					{
						x,
						y: toy
					},
					{
						x: tox,
						y: toy
					}
				];
			}
			return [{
				x: tox,
				y: soy
			}];
		}
		const y = Math.min(tmy0, middleOfHorizontalSides);
		if (soy < toy && sx1 >= tox) return [
			{
				x: sox,
				y: soy
			},
			{
				x: sox,
				y
			},
			{
				x: tox,
				y
			}
		];
		if (y < smy1 && sox < tx1) {
			const x = Math.min(smx0, tmx0);
			const y$1 = Math.min(smy0, tmy0);
			return [
				{
					x,
					y: soy
				},
				{
					x,
					y: y$1
				},
				{
					x: tox,
					y: y$1
				}
			];
		}
		return [
			{
				x: sox,
				y: soy
			},
			{
				x: sox,
				y
			},
			{
				x: tox,
				y
			}
		];
	} else if (sourceSide === "right" && targetSide === "top") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetPoint);
		if (isPointInsideSource) {
			if (soy >= tmy0) {
				const x = Math.max(smx1, tmx1);
				const y$1 = Math.min(soy - sourceMargin, toy);
				return [
					{
						x,
						y: soy
					},
					{
						x,
						y: y$1
					},
					{
						x: tox,
						y: y$1
					}
				];
			}
			const anchorMiddleY = (soy + sourceMargin + toy) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: sox,
					y: anchorMiddleY
				},
				{
					x: tox,
					y: anchorMiddleY
				}
			];
		}
		if (smx1 < tox) {
			if (soy > toy) {
				let x = tmx1;
				if (tmx0 >= smx1 && tmy0 <= soy) x = middleOfVerticalSides;
				return [
					{
						x,
						y: soy
					},
					{
						x,
						y: toy
					},
					{
						x: tox,
						y: toy
					}
				];
			}
			return [{
				x: tox,
				y: soy
			}];
		}
		const y = Math.min(tmy0, middleOfHorizontalSides);
		if (soy < toy && sx0 <= tox) return [
			{
				x: sox,
				y: soy
			},
			{
				x: sox,
				y
			},
			{
				x: tox,
				y
			}
		];
		if (y < smy1 && sox > tx0) {
			const x = Math.max(smx1, tmx1);
			const y$1 = Math.min(smy0, tmy0);
			return [
				{
					x,
					y: soy
				},
				{
					x,
					y: y$1
				},
				{
					x: tox,
					y: y$1
				}
			];
		}
		return [
			{
				x: sox,
				y: soy
			},
			{
				x: sox,
				y
			},
			{
				x: tox,
				y
			}
		];
	} else if (sourceSide === "right" && targetSide === "bottom") {
		const isPointInsideSource = inflatedSourceBBox.containsPoint(targetPoint);
		if (isPointInsideSource) {
			if (soy <= tmy1) {
				const x = Math.max(smx1, tmx1);
				const y$1 = Math.max(soy + sourceMargin, toy);
				return [
					{
						x,
						y: soy
					},
					{
						x,
						y: y$1
					},
					{
						x: tox,
						y: y$1
					}
				];
			}
			const anchorMiddleY = (soy - sourceMargin + toy) / 2;
			return [
				{
					x: sox,
					y: soy
				},
				{
					x: sox,
					y: anchorMiddleY
				},
				{
					x: tox,
					y: anchorMiddleY
				}
			];
		}
		if (smx1 < tox) {
			if (soy < toy) {
				let x = tmx1;
				if (tmx0 >= smx1 && tmy1 >= soy) x = middleOfVerticalSides;
				return [
					{
						x,
						y: soy
					},
					{
						x,
						y: toy
					},
					{
						x: tox,
						y: toy
					}
				];
			}
			return [{
				x: tox,
				y: soy
			}];
		}
		const y = Math.max(tmy1, middleOfHorizontalSides);
		if (soy > toy && sx0 <= tox) return [
			{
				x: sox,
				y: soy
			},
			{
				x: sox,
				y
			},
			{
				x: tox,
				y
			}
		];
		if (y > smy0 && sox > tx0) {
			const x = Math.max(smx1, tmx1);
			const y$1 = Math.max(smy1, tmy1);
			return [
				{
					x,
					y: soy
				},
				{
					x,
					y: y$1
				},
				{
					x: tox,
					y: y$1
				}
			];
		}
		return [
			{
				x: sox,
				y: soy
			},
			{
				x: sox,
				y
			},
			{
				x: tox,
				y
			}
		];
	}
}
function getLoopCoordinates(direction, angle, margin) {
	const isHorizontal = direction === Directions.LEFT || direction === Directions.RIGHT;
	let dx = 0;
	let dy = 0;
	switch (normalizeAngle(Math.round(angle))) {
		case 0:
		case 90:
			dx = isHorizontal ? 0 : margin;
			dy = isHorizontal ? margin : 0;
			break;
		case 180:
		case 270:
			dx = isHorizontal ? 0 : -margin;
			dy = isHorizontal ? -margin : 0;
			break;
	}
	return {
		dx,
		dy
	};
}
function rightAngleRouter(vertices, opt, linkView) {
	const { sourceDirection = Directions.AUTO, targetDirection = Directions.AUTO } = opt;
	const margin = opt.margin || 20;
	const useVertices = opt.useVertices || false;
	const isSourcePort = !!linkView.model.source().port;
	const sourcePoint = pointDataFromAnchor(linkView.sourceView, linkView.sourceAnchor, linkView.sourceBBox, sourceDirection, isSourcePort, linkView.sourceAnchor, margin);
	const isTargetPort = !!linkView.model.target().port;
	const targetPoint = pointDataFromAnchor(linkView.targetView, linkView.targetAnchor, linkView.targetBBox, targetDirection, isTargetPort, linkView.targetAnchor, margin);
	let resultVertices = [];
	if (!useVertices || vertices.length === 0) return simplifyPoints(routeBetweenPoints(sourcePoint, targetPoint));
	const verticesData = vertices.map((v) => pointDataFromVertex(v));
	const [firstVertex] = verticesData;
	const [resolvedSourceDirection] = resolveSides(sourcePoint, firstVertex);
	const isElement = sourcePoint.view && sourcePoint.view.model.isElement();
	const sourceBBox = isElement ? moveAndExpandBBox(sourcePoint.view.model.getBBox(), resolvedSourceDirection, margin) : null;
	const isVertexInside = isElement ? sourceBBox.containsPoint(firstVertex.point) : false;
	if (isVertexInside) {
		const outsidePoint = getOutsidePoint(resolvedSourceDirection, sourcePoint, margin);
		const firstPointOverlap = outsidePoint.equals(firstVertex.point);
		const alignsVertically = sourcePoint.point.x === firstVertex.point.x;
		const alignsHorizontally = sourcePoint.point.y === firstVertex.point.y;
		const isVerticalAndAligns = alignsVertically && (resolvedSourceDirection === Directions.TOP || resolvedSourceDirection === Directions.BOTTOM);
		const isHorizontalAndAligns = alignsHorizontally && (resolvedSourceDirection === Directions.LEFT || resolvedSourceDirection === Directions.RIGHT);
		const firstSegment = new Line(sourcePoint.point, outsidePoint);
		const isVertexOnSegment = firstSegment.containsPoint(firstVertex.point);
		const isVertexAlignedAndInside = isVertexInside && (isHorizontalAndAligns || isVerticalAndAligns);
		if (firstPointOverlap) {
			resultVertices.push(sourcePoint.point, firstVertex.point);
			firstVertex.direction = OPPOSITE_DIRECTIONS[resolvedSourceDirection];
		} else if (isVertexOnSegment || isVertexAlignedAndInside) {
			const angle = getSegmentAngle(isVertexOnSegment ? firstSegment : new Line(sourcePoint.point, firstVertex.point));
			const { dx, dy } = getLoopCoordinates(resolvedSourceDirection, angle, margin);
			const loop = createLoop({ point: outsidePoint }, firstVertex, {
				dx,
				dy
			});
			const secondCreatedPoint = loop[2];
			const loopEndSegment = new Line(firstVertex.point, secondCreatedPoint);
			const accessDirection = ANGLE_DIRECTION_MAP[getSegmentAngle(loopEndSegment)];
			firstVertex.direction = accessDirection;
			resultVertices.push(...loop);
		} else {
			firstVertex.direction = resolvedSourceDirection;
			firstVertex.margin = margin;
			resultVertices.push(...routeBetweenPoints(sourcePoint, firstVertex, { targetInSourceBBox: true }), firstVertex.point);
		}
	} else {
		const next = verticesData[1] || targetPoint;
		const direction = resolveInitialDirection(sourcePoint, firstVertex, next);
		firstVertex.direction = direction;
		resultVertices.push(...routeBetweenPoints(sourcePoint, firstVertex), firstVertex.point);
	}
	for (let i = 0; i < verticesData.length - 1; i++) {
		const from = verticesData[i];
		const to = verticesData[i + 1];
		const connectionSegment = new Line(from.point, to.point);
		const connectionSegmentAngle = getSegmentAngle(connectionSegment);
		if (connectionSegmentAngle % 90 === 0) {
			const connectionDirection = ANGLE_DIRECTION_MAP[connectionSegmentAngle];
			const simplifiedRoute = simplifyPoints([...resultVertices, from.point]);
			const accessSegment = new Line(simplifiedRoute[simplifiedRoute.length - 2], simplifiedRoute[simplifiedRoute.length - 1]);
			const accessDirection = ANGLE_DIRECTION_MAP[Math.round(getSegmentAngle(accessSegment))];
			if (connectionDirection !== OPPOSITE_DIRECTIONS[accessDirection]) {
				resultVertices.push(from.point, to.point);
				const [, toDirection$1] = resolveSides(from, to);
				to.direction = toDirection$1;
			} else {
				const { loopRoute, continueDirection } = loopSegment(from, to, connectionSegmentAngle, margin);
				to.direction = continueDirection;
				resultVertices.push(...loopRoute);
			}
			continue;
		}
		const [fromDirection, toDirection] = resolveDirection(from, to);
		from.direction = fromDirection;
		to.direction = toDirection;
		resultVertices.push(...routeBetweenPoints(from, to), to.point);
	}
	const lastVertex = verticesData[verticesData.length - 1];
	if (targetPoint.view && targetPoint.view.model.isElement()) {
		const [, resolvedTargetDirection] = resolveSides(lastVertex, targetPoint);
		const outsidePoint = getOutsidePoint(resolvedTargetDirection, targetPoint, margin);
		const simplified = simplifyPoints([...resultVertices, lastVertex.point]);
		const simplifiedSegment = new Line(simplified[simplified.length - 2], simplified[simplified.length - 1]);
		const simplifiedSegmentAngle = Math.round(getSegmentAngle(simplifiedSegment));
		const definedDirection = ANGLE_DIRECTION_MAP[simplifiedSegmentAngle];
		const lastPointOverlap = outsidePoint.equals(lastVertex.point);
		if (!lastPointOverlap || lastPointOverlap && definedDirection === resolvedTargetDirection) {
			lastVertex.direction = definedDirection;
			let lastSegmentRoute = routeBetweenPoints(lastVertex, targetPoint);
			const [p1, p2] = simplifyPoints([...lastSegmentRoute, targetPoint.point]);
			const lastSegment = new Line(p1, p2);
			const roundedLastSegmentAngle = Math.round(getSegmentAngle(lastSegment));
			const lastSegmentDirection = ANGLE_DIRECTION_MAP[roundedLastSegmentAngle];
			const targetBBox = moveAndExpandBBox(targetPoint.view.model.getBBox(), resolvedTargetDirection, margin);
			const alignsVertically = lastVertex.point.x === targetPoint.point.x;
			const alignsHorizontally = lastVertex.point.y === targetPoint.point.y;
			const isVertexInside$1 = targetBBox.containsPoint(lastVertex.point);
			const isVerticalAndAligns = alignsVertically && (resolvedTargetDirection === Directions.TOP || resolvedTargetDirection === Directions.BOTTOM);
			const isHorizontalAndAligns = alignsHorizontally && (resolvedTargetDirection === Directions.LEFT || resolvedTargetDirection === Directions.RIGHT);
			if (!lastPointOverlap && isVertexInside$1 && (isHorizontalAndAligns || isVerticalAndAligns)) {
				const { dx, dy } = getLoopCoordinates(resolvedTargetDirection, simplifiedSegmentAngle, margin);
				lastSegmentRoute = createLoop(lastVertex, { point: outsidePoint }, {
					dx,
					dy
				});
			} else if (isVertexInside$1 && resolvedTargetDirection !== OPPOSITE_DIRECTIONS[definedDirection]) {
				lastVertex.margin = margin;
				lastVertex.direction = resolvedTargetDirection;
				lastSegmentRoute = routeBetweenPoints(lastVertex, targetPoint);
			} else if (lastSegmentDirection !== definedDirection && definedDirection === OPPOSITE_DIRECTIONS[lastSegmentDirection]) {
				lastVertex.margin = margin;
				lastSegmentRoute = routeBetweenPoints(lastVertex, targetPoint);
			}
			resultVertices.push(...lastSegmentRoute);
		}
	} else {
		const from = lastVertex;
		const to = targetPoint;
		const connectionSegment = new Line(from.point, to.point);
		const connectionSegmentAngle = getSegmentAngle(connectionSegment);
		if (connectionSegmentAngle % 90 === 0) {
			const connectionDirection = ANGLE_DIRECTION_MAP[connectionSegmentAngle];
			const simplifiedRoute = simplifyPoints(resultVertices);
			const accessSegment = new Line(simplifiedRoute[simplifiedRoute.length - 2], from.point);
			const accessDirection = ANGLE_DIRECTION_MAP[Math.round(getSegmentAngle(accessSegment))];
			if (connectionDirection !== OPPOSITE_DIRECTIONS[accessDirection]) resultVertices.push(from.point);
			else {
				const { loopRoute } = loopSegment(from, to, connectionSegmentAngle, margin);
				loopRoute.pop();
				resultVertices.push(...loopRoute);
			}
		} else {
			const [fromDirection, toDirection] = resolveDirection(from, to);
			from.direction = fromDirection;
			to.direction = toDirection;
			resultVertices.push(...routeBetweenPoints(from, to));
		}
	}
	return simplifyPoints(resultVertices);
}
function resolveDirection(from, to) {
	const accessDirection = from.direction;
	const isDirectionVertical = VERTICAL_DIRECTIONS.includes(accessDirection);
	let sourceDirection = from.direction;
	let targetDirection = to.direction;
	if (isDirectionVertical) {
		const isToAbove = from.point.y > to.point.y;
		const dx = to.point.x - from.point.x;
		if (accessDirection === Directions.BOTTOM) {
			sourceDirection = isToAbove ? OPPOSITE_DIRECTIONS[accessDirection] : dx >= 0 ? Directions.RIGHT : Directions.LEFT;
			if (dx > 0) targetDirection = isToAbove ? Directions.LEFT : Directions.TOP;
			else if (dx < 0) targetDirection = isToAbove ? Directions.RIGHT : Directions.TOP;
		} else {
			sourceDirection = isToAbove ? dx >= 0 ? Directions.RIGHT : Directions.LEFT : OPPOSITE_DIRECTIONS[accessDirection];
			if (dx > 0) targetDirection = isToAbove ? Directions.BOTTOM : Directions.LEFT;
			else if (dx < 0) targetDirection = isToAbove ? Directions.BOTTOM : Directions.RIGHT;
		}
	} else {
		const isToLeft = from.point.x > to.point.x;
		const dy = to.point.y - from.point.y;
		if (accessDirection === Directions.RIGHT) {
			sourceDirection = isToLeft ? OPPOSITE_DIRECTIONS[accessDirection] : dy >= 0 ? Directions.BOTTOM : Directions.TOP;
			if (dy > 0) targetDirection = isToLeft ? Directions.TOP : Directions.LEFT;
			else if (dy < 0) targetDirection = isToLeft ? Directions.BOTTOM : Directions.LEFT;
		} else {
			sourceDirection = isToLeft ? dy >= 0 ? Directions.BOTTOM : Directions.TOP : OPPOSITE_DIRECTIONS[accessDirection];
			if (dy > 0) targetDirection = isToLeft ? Directions.RIGHT : Directions.TOP;
			else if (dy < 0) targetDirection = isToLeft ? Directions.RIGHT : Directions.BOTTOM;
		}
	}
	return [sourceDirection, targetDirection];
}
rightAngleRouter.Directions = Directions;
const rightAngle = rightAngleRouter;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/routers/index.mjs
var routers_exports = {};
__export(routers_exports, {
	manhattan: () => manhattan,
	metro: () => metro,
	normal: () => normal,
	oneSide: () => oneSide,
	orthogonal: () => orthogonal,
	rightAngle: () => rightAngle
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/linkAnchors/index.mjs
var linkAnchors_exports = {};
__export(linkAnchors_exports, {
	connectionClosest: () => connectionClosest,
	connectionLength: () => connectionLength,
	connectionPerpendicular: () => connectionPerpendicular,
	connectionRatio: () => connectionRatio,
	resolveRef: () => resolveRef
});
function connectionRatio(view, _magnet, _refPoint, opt) {
	var ratio = "ratio" in opt ? opt.ratio : .5;
	return view.getPointAtRatio(ratio);
}
function connectionLength(view, _magnet, _refPoint, opt) {
	var length$1 = "length" in opt ? opt.length : 20;
	return view.getPointAtLength(length$1);
}
function _connectionPerpendicular(view, _magnet, refPoint, opt) {
	var OFFSET = 1e6;
	var path = view.getConnection();
	var segmentSubdivisions = view.getConnectionSubdivisions();
	var verticalLine = new Line(refPoint.clone().offset(0, OFFSET), refPoint.clone().offset(0, -OFFSET));
	var horizontalLine = new Line(refPoint.clone().offset(OFFSET, 0), refPoint.clone().offset(-OFFSET, 0));
	var verticalIntersections = verticalLine.intersect(path, { segmentSubdivisions });
	var horizontalIntersections = horizontalLine.intersect(path, { segmentSubdivisions });
	var intersections = [];
	if (verticalIntersections) Array.prototype.push.apply(intersections, verticalIntersections);
	if (horizontalIntersections) Array.prototype.push.apply(intersections, horizontalIntersections);
	if (intersections.length > 0) return refPoint.chooseClosest(intersections);
	if ("fallbackAt" in opt) return getPointAtLink(view, opt.fallbackAt);
	return connectionClosest(view, _magnet, refPoint, opt);
}
function _connectionClosest(view, _magnet, refPoint, _opt) {
	var closestPoint = view.getClosestPoint(refPoint);
	if (!closestPoint) return new Point();
	return closestPoint;
}
function resolveRef(fn$1) {
	return function(view, magnet, ref, opt) {
		if (ref instanceof Element) {
			var refView = this.paper.findView(ref);
			var refPoint;
			if (refView) if (refView.isNodeConnection(ref)) {
				var distance = "fixedAt" in opt ? opt.fixedAt : "50%";
				refPoint = getPointAtLink(refView, distance);
			} else refPoint = refView.getNodeBBox(ref).center();
			else refPoint = new Point();
			return fn$1.call(this, view, magnet, refPoint, opt);
		}
		return fn$1.apply(this, arguments);
	};
}
function getPointAtLink(view, value) {
	var parsedValue = parseFloat(value);
	if (isPercentage(value)) return view.getPointAtRatio(parsedValue / 100);
	else return view.getPointAtLength(parsedValue);
}
const connectionPerpendicular = resolveRef(_connectionPerpendicular);
const connectionClosest = resolveRef(_connectionClosest);

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/anchors/index.mjs
var anchors_exports = {};
__export(anchors_exports, {
	bottom: () => bottom,
	bottomLeft: () => bottomLeft,
	bottomRight: () => bottomRight,
	center: () => center,
	left: () => left,
	midSide: () => midSide,
	modelCenter: () => modelCenter,
	perpendicular: () => perpendicular,
	right: () => right,
	top: () => top,
	topLeft: () => topLeft,
	topRight: () => topRight
});
function bboxWrapper(method) {
	return function(view, magnet, ref, opt) {
		var rotate = !!opt.rotate;
		var bbox$1 = rotate ? view.getNodeUnrotatedBBox(magnet) : view.getNodeBBox(magnet);
		var anchor$1 = bbox$1[method]();
		var dx = opt.dx;
		if (dx) {
			var dxPercentage = isPercentage(dx);
			dx = parseFloat(dx);
			if (isFinite(dx)) {
				if (dxPercentage) {
					dx /= 100;
					dx *= bbox$1.width;
				}
				anchor$1.x += dx;
			}
		}
		var dy = opt.dy;
		if (dy) {
			var dyPercentage = isPercentage(dy);
			dy = parseFloat(dy);
			if (isFinite(dy)) {
				if (dyPercentage) {
					dy /= 100;
					dy *= bbox$1.height;
				}
				anchor$1.y += dy;
			}
		}
		return rotate ? anchor$1.rotate(view.model.getBBox().center(), -view.model.angle()) : anchor$1;
	};
}
function _perpendicular(view, magnet, refPoint, opt) {
	var angle = view.model.angle();
	var bbox$1 = view.getNodeBBox(magnet);
	var anchor$1 = bbox$1.center();
	var topLeft$1 = bbox$1.origin();
	var bottomRight$1 = bbox$1.corner();
	var padding = opt.padding;
	if (!isFinite(padding)) padding = 0;
	if (topLeft$1.y + padding <= refPoint.y && refPoint.y <= bottomRight$1.y - padding) {
		var dy = refPoint.y - anchor$1.y;
		anchor$1.x += angle === 0 || angle === 180 ? 0 : dy * 1 / Math.tan(toRad(angle));
		anchor$1.y += dy;
	} else if (topLeft$1.x + padding <= refPoint.x && refPoint.x <= bottomRight$1.x - padding) {
		var dx = refPoint.x - anchor$1.x;
		anchor$1.y += angle === 90 || angle === 270 ? 0 : dx * Math.tan(toRad(angle));
		anchor$1.x += dx;
	}
	return anchor$1;
}
function _midSide(view, magnet, refPoint, opt) {
	var rotate = !!opt.rotate;
	var bbox$1, angle, center$1;
	if (rotate) {
		bbox$1 = view.getNodeUnrotatedBBox(magnet);
		center$1 = view.model.getBBox().center();
		angle = view.model.angle();
	} else bbox$1 = view.getNodeBBox(magnet);
	var padding = opt.padding;
	if (isFinite(padding)) bbox$1.inflate(padding);
	if (rotate) refPoint.rotate(center$1, angle);
	var side = bbox$1.sideNearestToPoint(refPoint);
	var anchor$1;
	switch (side) {
		case "left":
			anchor$1 = bbox$1.leftMiddle();
			break;
		case "right":
			anchor$1 = bbox$1.rightMiddle();
			break;
		case "top":
			anchor$1 = bbox$1.topMiddle();
			break;
		case "bottom":
			anchor$1 = bbox$1.bottomMiddle();
			break;
	}
	return rotate ? anchor$1.rotate(center$1, -angle) : anchor$1;
}
function _modelCenter(view, _magnet, _refPoint, opt, endType) {
	return view.model.getPointFromConnectedLink(this.model, endType).offset(opt.dx, opt.dy);
}
const center = bboxWrapper("center");
const top = bboxWrapper("topMiddle");
const bottom = bboxWrapper("bottomMiddle");
const left = bboxWrapper("leftMiddle");
const right = bboxWrapper("rightMiddle");
const topLeft = bboxWrapper("origin");
const topRight = bboxWrapper("topRight");
const bottomLeft = bboxWrapper("bottomLeft");
const bottomRight = bboxWrapper("corner");
const perpendicular = resolveRef(_perpendicular);
const midSide = resolveRef(_midSide);
const modelCenter = _modelCenter;

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/Graph.mjs
const GraphCells = Collection.extend({
	initialize: function(models, opt) {
		if (opt.cellNamespace) this.cellNamespace = opt.cellNamespace;
		else this.cellNamespace = typeof joint !== "undefined" && has(joint, "shapes") ? joint.shapes : null;
		this.graph = opt.graph;
	},
	model: function(attrs, opt) {
		const collection = opt.collection;
		const namespace = collection.cellNamespace;
		const { type } = attrs;
		const ModelClass = getByPath(namespace, type, ".");
		if (!ModelClass) throw new Error(`dia.Graph: Could not find cell constructor for type: '${type}'. Make sure to add the constructor to 'cellNamespace'.`);
		return new ModelClass(attrs, opt);
	},
	_addReference: function(model, options) {
		Collection.prototype._addReference.apply(this, arguments);
		if (!options.dry && !model.graph) model.graph = this.graph;
	},
	_removeReference: function(model, options) {
		Collection.prototype._removeReference.apply(this, arguments);
		if (!options.dry && model.graph === this.graph) model.graph = null;
	},
	comparator: function(model) {
		return model.get("z") || 0;
	}
});
const Graph = Model.extend({
	initialize: function(attrs, opt) {
		opt = opt || {};
		var cells = new GraphCells([], {
			model: opt.cellModel,
			cellNamespace: opt.cellNamespace,
			graph: this
		});
		Model.prototype.set.call(this, "cells", cells);
		cells.on("all", this.trigger, this);
		this.on("change:z", this._sortOnChangeZ, this);
		this._out = {};
		this._in = {};
		this._nodes = {};
		this._edges = {};
		this._batches = {};
		cells.on("add", this._restructureOnAdd, this);
		cells.on("remove", this._restructureOnRemove, this);
		cells.on("reset", this._restructureOnReset, this);
		cells.on("change:source", this._restructureOnChangeSource, this);
		cells.on("change:target", this._restructureOnChangeTarget, this);
		cells.on("remove", this._removeCell, this);
	},
	_sortOnChangeZ: function() {
		this.get("cells").sort();
	},
	_restructureOnAdd: function(cell) {
		if (cell.isLink()) {
			this._edges[cell.id] = true;
			var { source, target } = cell.attributes;
			if (source.id) (this._out[source.id] || (this._out[source.id] = {}))[cell.id] = true;
			if (target.id) (this._in[target.id] || (this._in[target.id] = {}))[cell.id] = true;
		} else this._nodes[cell.id] = true;
	},
	_restructureOnRemove: function(cell) {
		if (cell.isLink()) {
			delete this._edges[cell.id];
			var { source, target } = cell.attributes;
			if (source.id && this._out[source.id] && this._out[source.id][cell.id]) delete this._out[source.id][cell.id];
			if (target.id && this._in[target.id] && this._in[target.id][cell.id]) delete this._in[target.id][cell.id];
		} else delete this._nodes[cell.id];
	},
	_restructureOnReset: function(cells) {
		cells = cells.models;
		this._out = {};
		this._in = {};
		this._nodes = {};
		this._edges = {};
		cells.forEach(this._restructureOnAdd, this);
	},
	_restructureOnChangeSource: function(link) {
		var prevSource = link.previous("source");
		if (prevSource.id && this._out[prevSource.id]) delete this._out[prevSource.id][link.id];
		var source = link.attributes.source;
		if (source.id) (this._out[source.id] || (this._out[source.id] = {}))[link.id] = true;
	},
	_restructureOnChangeTarget: function(link) {
		var prevTarget = link.previous("target");
		if (prevTarget.id && this._in[prevTarget.id]) delete this._in[prevTarget.id][link.id];
		var target = link.get("target");
		if (target.id) (this._in[target.id] || (this._in[target.id] = {}))[link.id] = true;
	},
	getOutboundEdges: function(node) {
		return this._out && this._out[node] || {};
	},
	getInboundEdges: function(node) {
		return this._in && this._in[node] || {};
	},
	toJSON: function(opt = {}) {
		var json = Model.prototype.toJSON.apply(this, arguments);
		json.cells = this.get("cells").toJSON(opt.cellAttributes);
		return json;
	},
	fromJSON: function(json, opt) {
		if (!json.cells) throw new Error("Graph JSON must contain cells array.");
		return this.set(json, opt);
	},
	set: function(key, val, opt) {
		var attrs;
		if (typeof key === "object") {
			attrs = key;
			opt = val;
		} else (attrs = {})[key] = val;
		if (attrs.hasOwnProperty("cells")) {
			this.resetCells(attrs.cells, opt);
			attrs = omit(attrs, "cells");
		}
		return Model.prototype.set.call(this, attrs, opt);
	},
	clear: function(opt) {
		opt = assign({}, opt, { clear: true });
		var collection = this.get("cells");
		if (collection.length === 0) return this;
		this.startBatch("clear", opt);
		var cells = collection.sortBy(function(cell) {
			return cell.isLink() ? 1 : 2;
		});
		do
			cells.shift().remove(opt);
		while (cells.length > 0);
		this.stopBatch("clear");
		return this;
	},
	_prepareCell: function(cell) {
		let attrs;
		if (cell instanceof Model) attrs = cell.attributes;
		else attrs = cell;
		if (!isString(attrs.type)) throw new TypeError("dia.Graph: cell type must be a string.");
		return cell;
	},
	minZIndex: function() {
		var firstCell = this.get("cells").first();
		return firstCell ? firstCell.get("z") || 0 : 0;
	},
	maxZIndex: function() {
		var lastCell = this.get("cells").last();
		return lastCell ? lastCell.get("z") || 0 : 0;
	},
	addCell: function(cell, opt) {
		if (Array.isArray(cell)) return this.addCells(cell, opt);
		if (cell instanceof Model) {
			if (!cell.has("z")) cell.set("z", this.maxZIndex() + 1);
		} else if (cell.z === void 0) cell.z = this.maxZIndex() + 1;
		this.get("cells").add(this._prepareCell(cell, opt), opt || {});
		return this;
	},
	addCells: function(cells, opt) {
		if (cells.length === 0) return this;
		cells = flattenDeep(cells);
		opt.maxPosition = opt.position = cells.length - 1;
		this.startBatch("add", opt);
		cells.forEach(function(cell) {
			this.addCell(cell, opt);
			opt.position--;
		}, this);
		this.stopBatch("add", opt);
		return this;
	},
	resetCells: function(cells, opt) {
		var preparedCells = toArray(cells).map(function(cell) {
			return this._prepareCell(cell, opt);
		}, this);
		this.get("cells").reset(preparedCells, opt);
		return this;
	},
	removeCells: function(cells, opt) {
		if (cells.length) {
			this.startBatch("remove");
			invoke(cells, "remove", opt);
			this.stopBatch("remove");
		}
		return this;
	},
	_removeCell: function(cell, collection, options) {
		options = options || {};
		if (!options.clear) if (options.disconnectLinks) this.disconnectLinks(cell, options);
		else this.removeLinks(cell, options);
		this.get("cells").remove(cell, { silent: true });
	},
	transferCellEmbeds: function(sourceCell, targetCell, opt = {}) {
		const batchName = "transfer-embeds";
		this.startBatch(batchName);
		const children$1 = sourceCell.getEmbeddedCells();
		targetCell.embed(children$1, {
			...opt,
			reparent: true
		});
		this.stopBatch(batchName);
	},
	transferCellConnectedLinks: function(sourceCell, targetCell, opt = {}) {
		const batchName = "transfer-connected-links";
		this.startBatch(batchName);
		const connectedLinks = this.getConnectedLinks(sourceCell, opt);
		connectedLinks.forEach((link) => {
			if (link.getSourceCell() === sourceCell) link.prop(["source", "id"], targetCell.id, opt);
			if (link.getTargetCell() === sourceCell) link.prop(["target", "id"], targetCell.id, opt);
		});
		this.stopBatch(batchName);
	},
	getCell: function(id) {
		return this.get("cells").get(id);
	},
	getCells: function() {
		return this.get("cells").toArray();
	},
	getElements: function() {
		return this.get("cells").toArray().filter((cell) => cell.isElement());
	},
	getLinks: function() {
		return this.get("cells").toArray().filter((cell) => cell.isLink());
	},
	getFirstCell: function() {
		return this.get("cells").first();
	},
	getLastCell: function() {
		return this.get("cells").last();
	},
	getConnectedLinks: function(model, opt) {
		opt = opt || {};
		var indirect = opt.indirect;
		var inbound = opt.inbound;
		var outbound = opt.outbound;
		if (inbound === void 0 && outbound === void 0) inbound = outbound = true;
		var links = [];
		var edges = {};
		if (outbound) addOutbounds(this, model);
		if (inbound) addInbounds(this, model);
		function addOutbounds(graph, model$1) {
			forIn(graph.getOutboundEdges(model$1.id), function(_, edge) {
				if (edges[edge]) return;
				var link = graph.getCell(edge);
				links.push(link);
				edges[edge] = true;
				if (indirect) {
					if (inbound) addInbounds(graph, link);
					if (outbound) addOutbounds(graph, link);
				}
			}.bind(graph));
			if (indirect && model$1.isLink()) {
				var outCell = model$1.getTargetCell();
				if (outCell && outCell.isLink()) {
					if (!edges[outCell.id]) {
						links.push(outCell);
						addOutbounds(graph, outCell);
					}
				}
			}
		}
		function addInbounds(graph, model$1) {
			forIn(graph.getInboundEdges(model$1.id), function(_, edge) {
				if (edges[edge]) return;
				var link = graph.getCell(edge);
				links.push(link);
				edges[edge] = true;
				if (indirect) {
					if (inbound) addInbounds(graph, link);
					if (outbound) addOutbounds(graph, link);
				}
			}.bind(graph));
			if (indirect && model$1.isLink()) {
				var inCell = model$1.getSourceCell();
				if (inCell && inCell.isLink()) {
					if (!edges[inCell.id]) {
						links.push(inCell);
						addInbounds(graph, inCell);
					}
				}
			}
		}
		if (opt.deep) {
			var embeddedCells = model.getEmbeddedCells({ deep: true });
			var embeddedElements = {};
			embeddedCells.forEach(function(cell) {
				if (cell.isElement()) embeddedElements[cell.id] = true;
			});
			embeddedCells.forEach(function(cell) {
				if (cell.isLink()) return;
				if (outbound) forIn(this.getOutboundEdges(cell.id), function(exists$1, edge) {
					if (!edges[edge]) {
						var edgeCell = this.getCell(edge);
						var { source, target } = edgeCell.attributes;
						var sourceId = source.id;
						var targetId = target.id;
						if (!opt.includeEnclosed && sourceId && embeddedElements[sourceId] && targetId && embeddedElements[targetId]) return;
						links.push(this.getCell(edge));
						edges[edge] = true;
					}
				}.bind(this));
				if (inbound) forIn(this.getInboundEdges(cell.id), function(exists$1, edge) {
					if (!edges[edge]) {
						var edgeCell = this.getCell(edge);
						var { source, target } = edgeCell.attributes;
						var sourceId = source.id;
						var targetId = target.id;
						if (!opt.includeEnclosed && sourceId && embeddedElements[sourceId] && targetId && embeddedElements[targetId]) return;
						links.push(this.getCell(edge));
						edges[edge] = true;
					}
				}.bind(this));
			}, this);
		}
		return links;
	},
	getNeighbors: function(model, opt) {
		opt || (opt = {});
		var inbound = opt.inbound;
		var outbound = opt.outbound;
		if (inbound === void 0 && outbound === void 0) inbound = outbound = true;
		var neighbors = this.getConnectedLinks(model, opt).reduce(function(res, link) {
			var { source, target } = link.attributes;
			var loop = link.hasLoop(opt);
			if (inbound && has(source, "id") && !res[source.id]) {
				var sourceElement = this.getCell(source.id);
				if (sourceElement.isElement()) {
					if (loop || sourceElement && sourceElement !== model && (!opt.deep || !sourceElement.isEmbeddedIn(model))) res[source.id] = sourceElement;
				}
			}
			if (outbound && has(target, "id") && !res[target.id]) {
				var targetElement = this.getCell(target.id);
				if (targetElement.isElement()) {
					if (loop || targetElement && targetElement !== model && (!opt.deep || !targetElement.isEmbeddedIn(model))) res[target.id] = targetElement;
				}
			}
			return res;
		}.bind(this), {});
		if (model.isLink()) {
			if (inbound) {
				var sourceCell = model.getSourceCell();
				if (sourceCell && sourceCell.isElement() && !neighbors[sourceCell.id]) neighbors[sourceCell.id] = sourceCell;
			}
			if (outbound) {
				var targetCell = model.getTargetCell();
				if (targetCell && targetCell.isElement() && !neighbors[targetCell.id]) neighbors[targetCell.id] = targetCell;
			}
		}
		return toArray(neighbors);
	},
	getCommonAncestor: function() {
		var cellsAncestors = Array.from(arguments).map(function(cell) {
			var ancestors = [];
			var parentId = cell.get("parent");
			while (parentId) {
				ancestors.push(parentId);
				parentId = this.getCell(parentId).get("parent");
			}
			return ancestors;
		}, this);
		cellsAncestors = cellsAncestors.sort(function(a, b) {
			return a.length - b.length;
		});
		var commonAncestor = toArray(cellsAncestors.shift()).find(function(ancestor) {
			return cellsAncestors.every(function(cellAncestors) {
				return cellAncestors.includes(ancestor);
			});
		});
		return this.getCell(commonAncestor);
	},
	getSuccessors: function(element, opt) {
		opt = opt || {};
		var res = [];
		this.search(element, function(el) {
			if (el !== element) res.push(el);
		}, assign({}, opt, { outbound: true }));
		return res;
	},
	cloneCells,
	cloneSubgraph: function(cells, opt) {
		var subgraph = this.getSubgraph(cells, opt);
		return this.cloneCells(subgraph);
	},
	getSubgraph: function(cells, opt) {
		opt = opt || {};
		var subgraph = [];
		var cellMap = {};
		var elements = [];
		var links = [];
		toArray(cells).forEach(function(cell) {
			if (!cellMap[cell.id]) {
				subgraph.push(cell);
				cellMap[cell.id] = cell;
				if (cell.isLink()) links.push(cell);
				else elements.push(cell);
			}
			if (opt.deep) {
				var embeds = cell.getEmbeddedCells({ deep: true });
				embeds.forEach(function(embed) {
					if (!cellMap[embed.id]) {
						subgraph.push(embed);
						cellMap[embed.id] = embed;
						if (embed.isLink()) links.push(embed);
						else elements.push(embed);
					}
				});
			}
		});
		links.forEach(function(link) {
			var { source, target } = link.attributes;
			if (source.id && !cellMap[source.id]) {
				var sourceElement = this.getCell(source.id);
				subgraph.push(sourceElement);
				cellMap[sourceElement.id] = sourceElement;
				elements.push(sourceElement);
			}
			if (target.id && !cellMap[target.id]) {
				var targetElement = this.getCell(target.id);
				subgraph.push(this.getCell(target.id));
				cellMap[targetElement.id] = targetElement;
				elements.push(targetElement);
			}
		}, this);
		elements.forEach(function(element) {
			var links$1 = this.getConnectedLinks(element, opt);
			links$1.forEach(function(link) {
				var { source, target } = link.attributes;
				if (!cellMap[link.id] && source.id && cellMap[source.id] && target.id && cellMap[target.id]) {
					subgraph.push(link);
					cellMap[link.id] = link;
				}
			});
		}, this);
		return subgraph;
	},
	getPredecessors: function(element, opt) {
		opt = opt || {};
		var res = [];
		this.search(element, function(el) {
			if (el !== element) res.push(el);
		}, assign({}, opt, { inbound: true }));
		return res;
	},
	search: function(element, iteratee, opt) {
		opt = opt || {};
		if (opt.breadthFirst) this.bfs(element, iteratee, opt);
		else this.dfs(element, iteratee, opt);
	},
	bfs: function(element, iteratee, opt = {}) {
		const visited = {};
		const distance = {};
		const queue = [];
		queue.push(element);
		distance[element.id] = 0;
		while (queue.length > 0) {
			var next = queue.shift();
			if (visited[next.id]) continue;
			visited[next.id] = true;
			if (iteratee.call(this, next, distance[next.id]) === false) continue;
			const neighbors = this.getNeighbors(next, opt);
			for (let i = 0, n = neighbors.length; i < n; i++) {
				const neighbor = neighbors[i];
				distance[neighbor.id] = distance[next.id] + 1;
				queue.push(neighbor);
			}
		}
	},
	dfs: function(element, iteratee, opt = {}) {
		const visited = {};
		const distance = {};
		const queue = [];
		queue.push(element);
		distance[element.id] = 0;
		while (queue.length > 0) {
			const next = queue.pop();
			if (visited[next.id]) continue;
			visited[next.id] = true;
			if (iteratee.call(this, next, distance[next.id]) === false) continue;
			const neighbors = this.getNeighbors(next, opt);
			const lastIndex = queue.length;
			for (let i = 0, n = neighbors.length; i < n; i++) {
				const neighbor = neighbors[i];
				distance[neighbor.id] = distance[next.id] + 1;
				queue.splice(lastIndex, 0, neighbor);
			}
		}
	},
	getSources: function() {
		var sources = [];
		forIn(this._nodes, function(exists$1, node) {
			if (!this._in[node] || isEmpty(this._in[node])) sources.push(this.getCell(node));
		}.bind(this));
		return sources;
	},
	getSinks: function() {
		var sinks = [];
		forIn(this._nodes, function(exists$1, node) {
			if (!this._out[node] || isEmpty(this._out[node])) sinks.push(this.getCell(node));
		}.bind(this));
		return sinks;
	},
	isSource: function(element) {
		return !this._in[element.id] || isEmpty(this._in[element.id]);
	},
	isSink: function(element) {
		return !this._out[element.id] || isEmpty(this._out[element.id]);
	},
	isSuccessor: function(elementA, elementB) {
		var isSuccessor = false;
		this.search(elementA, function(element) {
			if (element === elementB && element !== elementA) {
				isSuccessor = true;
				return false;
			}
		}, { outbound: true });
		return isSuccessor;
	},
	isPredecessor: function(elementA, elementB) {
		var isPredecessor = false;
		this.search(elementA, function(element) {
			if (element === elementB && element !== elementA) {
				isPredecessor = true;
				return false;
			}
		}, { inbound: true });
		return isPredecessor;
	},
	isNeighbor: function(elementA, elementB, opt) {
		opt = opt || {};
		var inbound = opt.inbound;
		var outbound = opt.outbound;
		if (inbound === void 0 && outbound === void 0) inbound = outbound = true;
		var isNeighbor = false;
		this.getConnectedLinks(elementA, opt).forEach(function(link) {
			var { source, target } = link.attributes;
			if (inbound && has(source, "id") && source.id === elementB.id) {
				isNeighbor = true;
				return false;
			}
			if (outbound && has(target, "id") && target.id === elementB.id) {
				isNeighbor = true;
				return false;
			}
		});
		return isNeighbor;
	},
	disconnectLinks: function(model, opt) {
		this.getConnectedLinks(model).forEach(function(link) {
			link.set(link.attributes.source.id === model.id ? "source" : "target", {
				x: 0,
				y: 0
			}, opt);
		});
	},
	removeLinks: function(model, opt) {
		invoke(this.getConnectedLinks(model), "remove", opt);
	},
	findElementsAtPoint: function(point$1, opt) {
		return this._filterAtPoint(this.getElements(), point$1, opt);
	},
	findLinksAtPoint: function(point$1, opt) {
		return this._filterAtPoint(this.getLinks(), point$1, opt);
	},
	findCellsAtPoint: function(point$1, opt) {
		return this._filterAtPoint(this.getCells(), point$1, opt);
	},
	_filterAtPoint: function(cells, point$1, opt = {}) {
		return cells.filter((el) => el.getBBox({ rotate: true }).containsPoint(point$1, opt));
	},
	findElementsInArea: function(area, opt = {}) {
		return this._filterInArea(this.getElements(), area, opt);
	},
	findLinksInArea: function(area, opt = {}) {
		return this._filterInArea(this.getLinks(), area, opt);
	},
	findCellsInArea: function(area, opt = {}) {
		return this._filterInArea(this.getCells(), area, opt);
	},
	_filterInArea: function(cells, area, opt = {}) {
		const r = new Rect(area);
		const { strict = false } = opt;
		const method = strict ? "containsRect" : "intersect";
		return cells.filter((el) => r[method](el.getBBox({ rotate: true })));
	},
	findElementsUnderElement: function(element, opt) {
		return this._filterCellsUnderElement(this.getElements(), element, opt);
	},
	findLinksUnderElement: function(element, opt) {
		return this._filterCellsUnderElement(this.getLinks(), element, opt);
	},
	findCellsUnderElement: function(element, opt) {
		return this._filterCellsUnderElement(this.getCells(), element, opt);
	},
	_isValidElementUnderElement: function(el1, el2) {
		return el1.id !== el2.id && !el1.isEmbeddedIn(el2);
	},
	_isValidLinkUnderElement: function(link, el) {
		return link.source().id !== el.id && link.target().id !== el.id && !link.isEmbeddedIn(el);
	},
	_validateCellsUnderElement: function(cells, element) {
		return cells.filter((cell) => {
			return cell.isLink() ? this._isValidLinkUnderElement(cell, element) : this._isValidElementUnderElement(cell, element);
		});
	},
	_getFindUnderElementGeometry: function(element, searchBy = "bbox") {
		const bbox$1 = element.getBBox({ rotate: true });
		return searchBy !== "bbox" ? getRectPoint(bbox$1, searchBy) : bbox$1;
	},
	_filterCellsUnderElement: function(cells, element, opt = {}) {
		const geometry = this._getFindUnderElementGeometry(element, opt.searchBy);
		const filteredCells = geometry.type === types.Point ? this._filterAtPoint(cells, geometry) : this._filterInArea(cells, geometry, opt);
		return this._validateCellsUnderElement(filteredCells, element);
	},
	findModelsInArea: function(area, opt) {
		return this.findElementsInArea(area, opt);
	},
	findModelsFromPoint: function(point$1) {
		return this.findElementsAtPoint(point$1);
	},
	findModelsUnderElement: function(element, opt) {
		return this.findElementsUnderElement(element, opt);
	},
	getBBox: function() {
		return this.getCellsBBox(this.getCells());
	},
	getCellsBBox: function(cells, opt = {}) {
		const { rotate = true } = opt;
		return toArray(cells).reduce(function(memo, cell) {
			const rect$1 = cell.getBBox({ rotate });
			if (!rect$1) return memo;
			if (memo) return memo.union(rect$1);
			return rect$1;
		}, null);
	},
	translate: function(dx, dy, opt) {
		var cells = this.getCells().filter(function(cell) {
			return !cell.isEmbedded();
		});
		invoke(cells, "translate", dx, dy, opt);
		return this;
	},
	resize: function(width$1, height$1, opt) {
		return this.resizeCells(width$1, height$1, this.getCells(), opt);
	},
	resizeCells: function(width$1, height$1, cells, opt) {
		var bbox$1 = this.getCellsBBox(cells);
		if (bbox$1) {
			var sx = Math.max(width$1 / bbox$1.width, 0);
			var sy = Math.max(height$1 / bbox$1.height, 0);
			invoke(cells, "scale", sx, sy, bbox$1.origin(), opt);
		}
		return this;
	},
	startBatch: function(name, data$1) {
		data$1 = data$1 || {};
		this._batches[name] = (this._batches[name] || 0) + 1;
		return this.trigger("batch:start", assign({}, data$1, { batchName: name }));
	},
	stopBatch: function(name, data$1) {
		data$1 = data$1 || {};
		this._batches[name] = (this._batches[name] || 0) - 1;
		return this.trigger("batch:stop", assign({}, data$1, { batchName: name }));
	},
	hasActiveBatch: function(name) {
		const batches = this._batches;
		let names;
		if (arguments.length === 0) names = Object.keys(batches);
		else if (Array.isArray(name)) names = name;
		else names = [name];
		return names.some((batch) => batches[batch] > 0);
	}
}, { validations: {
	multiLinks: function(graph, link) {
		var { source, target } = link.attributes;
		if (source.id && target.id) {
			var sourceModel = link.getSourceCell();
			if (sourceModel) {
				var connectedLinks = graph.getConnectedLinks(sourceModel, { outbound: true });
				var sameLinks = connectedLinks.filter(function(_link) {
					var { source: _source, target: _target } = _link.attributes;
					return _source && _source.id === source.id && (!_source.port || _source.port === source.port) && _target && _target.id === target.id && (!_target.port || _target.port === target.port);
				});
				if (sameLinks.length > 1) return false;
			}
		}
		return true;
	},
	linkPinning: function(_graph, link) {
		var { source, target } = link.attributes;
		return source.id && target.id;
	}
} });
wrapWith(Graph.prototype, [
	"resetCells",
	"addCells",
	"removeCells"
], wrappers.cells);

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/PaperLayer.mjs
const LayersNames = {
	GRID: "grid",
	CELLS: "cells",
	BACK: "back",
	FRONT: "front",
	TOOLS: "tools",
	LABELS: "labels"
};
const PaperLayer = View.extend({
	tagName: "g",
	svgElement: true,
	pivotNodes: null,
	defaultTheme: null,
	options: { name: "" },
	className: function() {
		return addClassNamePrefix(`${this.options.name}-layer`);
	},
	init: function() {
		this.pivotNodes = {};
	},
	insertSortedNode: function(node, z) {
		this.el.insertBefore(node, this.insertPivot(z));
	},
	insertNode: function(node) {
		const { el } = this;
		if (node.parentNode !== el) el.appendChild(node);
	},
	insertPivot: function(z) {
		const { el, pivotNodes } = this;
		z = +z;
		z || (z = 0);
		let pivotNode = pivotNodes[z];
		if (pivotNode) return pivotNode;
		pivotNode = pivotNodes[z] = document.createComment("z-index:" + (z + 1));
		let neighborZ = -Infinity;
		for (let currentZ in pivotNodes) {
			currentZ = +currentZ;
			if (currentZ < z && currentZ > neighborZ) {
				neighborZ = currentZ;
				if (neighborZ === z - 1) continue;
			}
		}
		if (neighborZ !== -Infinity) {
			const neighborPivot = pivotNodes[neighborZ];
			el.insertBefore(pivotNode, neighborPivot.nextSibling);
		} else el.insertBefore(pivotNode, el.firstChild);
		return pivotNode;
	},
	removePivots: function() {
		const { el, pivotNodes } = this;
		for (let z in pivotNodes) el.removeChild(pivotNodes[z]);
		this.pivotNodes = {};
	}
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/attributes/eval.mjs
const calcAttributesList = [
	"transform",
	"x",
	"y",
	"cx",
	"cy",
	"dx",
	"dy",
	"x1",
	"y1",
	"x2",
	"y2",
	"points",
	"d",
	"r",
	"rx",
	"ry",
	"width",
	"height",
	"stroke-width",
	"font-size"
];
const positiveValueList = [
	"r",
	"rx",
	"ry",
	"width",
	"height",
	"stroke-width",
	"font-size"
];
const calcAttributes = calcAttributesList.reduce((acc, attrName) => {
	acc[attrName] = true;
	return acc;
}, {});
const positiveValueAttributes = positiveValueList.reduce((acc, attrName) => {
	acc[attrName] = true;
	return acc;
}, {});
function evalAttributes(attrs, refBBox) {
	const evalAttrs = {};
	for (let attrName in attrs) {
		if (!attrs.hasOwnProperty(attrName)) continue;
		evalAttrs[attrName] = evalAttribute(attrName, attrs[attrName], refBBox);
	}
	return evalAttrs;
}
function evalAttribute(attrName, attrValue, refBBox) {
	if (attrName in calcAttributes && isCalcExpression(attrValue)) {
		let evalAttrValue = evalCalcExpression(attrValue, refBBox);
		if (attrName in positiveValueAttributes) evalAttrValue = Math.max(0, evalAttrValue);
		return evalAttrValue;
	}
	return attrValue;
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/CellView.mjs
const HighlightingTypes$1 = {
	DEFAULT: "default",
	EMBEDDING: "embedding",
	CONNECTING: "connecting",
	MAGNET_AVAILABILITY: "magnetAvailability",
	ELEMENT_AVAILABILITY: "elementAvailability"
};
const Flags$2 = { TOOLS: "TOOLS" };
const CellView = View.extend({
	tagName: "g",
	svgElement: true,
	selector: "root",
	metrics: null,
	className: function() {
		var classNames = ["cell"];
		var type = this.model.get("type");
		if (type) type.toLowerCase().split(".").forEach(function(value, index, list$1) {
			classNames.push("type-" + list$1.slice(0, index + 1).join("-"));
		});
		return classNames.join(" ");
	},
	_presentationAttributes: null,
	_flags: null,
	setFlags: function() {
		var flags = {};
		var attributes$1 = {};
		var shift = 0;
		var i, n, label;
		var presentationAttributes = result(this, "presentationAttributes");
		for (var attribute in presentationAttributes) {
			if (!presentationAttributes.hasOwnProperty(attribute)) continue;
			var labels = presentationAttributes[attribute];
			if (!Array.isArray(labels)) labels = [labels];
			for (i = 0, n = labels.length; i < n; i++) {
				label = labels[i];
				var flag = flags[label];
				if (!flag) flag = flags[label] = 1 << shift++;
				attributes$1[attribute] |= flag;
			}
		}
		var initFlag = result(this, "initFlag");
		if (!Array.isArray(initFlag)) initFlag = [initFlag];
		for (i = 0, n = initFlag.length; i < n; i++) {
			label = initFlag[i];
			if (!flags[label]) flags[label] = 1 << shift++;
		}
		if (shift > 25) throw new Error("dia.CellView: Maximum number of flags exceeded.");
		this._flags = flags;
		this._presentationAttributes = attributes$1;
	},
	hasFlag: function(flag, label) {
		return flag & this.getFlag(label);
	},
	removeFlag: function(flag, label) {
		return flag ^ flag & this.getFlag(label);
	},
	getFlag: function(label) {
		var flags = this._flags;
		if (!flags) return 0;
		var flag = 0;
		if (Array.isArray(label)) for (var i = 0, n = label.length; i < n; i++) flag |= flags[label[i]];
		else flag |= flags[label];
		return flag;
	},
	attributes: function() {
		var cell = this.model;
		return {
			"model-id": cell.id,
			"data-type": cell.attributes.type
		};
	},
	constructor: function(options) {
		options.id = options.id || guid(this);
		View.call(this, options);
	},
	initialize: function() {
		this.setFlags();
		View.prototype.initialize.apply(this, arguments);
		this.cleanNodesCache();
		this.startListening();
	},
	startListening: function() {
		this.listenTo(this.model, "change", this.onAttributesChange);
	},
	onAttributesChange: function(model, opt) {
		var flag = model.getChangeFlag(this._presentationAttributes);
		if (opt.updateHandled || !flag) return;
		if (opt.dirty && this.hasFlag(flag, "UPDATE")) flag |= this.getFlag("RENDER");
		if (opt.tool) opt.async = false;
		this.requestUpdate(flag, opt);
	},
	requestUpdate: function(flags, opt) {
		const { paper } = this;
		if (paper && flags > 0) paper.requestViewUpdate(this, flags, this.UPDATE_PRIORITY, opt);
	},
	parseDOMJSON: function(markup, root) {
		var doc = parseDOMJSON(markup);
		var selectors = doc.selectors;
		var groups = doc.groupSelectors;
		for (var group in groups) {
			if (selectors[group]) throw new Error("dia.CellView: ambiguous group selector");
			selectors[group] = groups[group];
		}
		if (root) {
			var rootSelector = this.selector;
			if (selectors[rootSelector]) throw new Error("dia.CellView: ambiguous root selector.");
			selectors[rootSelector] = root;
		}
		return {
			fragment: doc.fragment,
			selectors
		};
	},
	can: function(feature) {
		var interactive = isFunction(this.options.interactive) ? this.options.interactive(this) : this.options.interactive;
		return isObject(interactive) && interactive[feature] !== false || isBoolean(interactive) && interactive !== false;
	},
	findBySelector: function(selector, root, selectors) {
		if (!selector || selector === ".") return [root];
		if (selectors) {
			var nodes = selectors[selector];
			if (nodes) {
				if (Array.isArray(nodes)) return nodes;
				return [nodes];
			}
		}
		if (this.useCSSSelectors) return Dom_default(root).find(selector).toArray();
		return [];
	},
	findNodes: function(selector) {
		return this.findBySelector(selector, this.el, this.selectors);
	},
	findNode: function(selector) {
		const [node = null] = this.findNodes(selector);
		return node;
	},
	notify: function(eventName) {
		if (this.paper) {
			var args = Array.prototype.slice.call(arguments, 1);
			this.trigger.apply(this, [eventName].concat(args));
			this.paper.trigger.apply(this.paper, [eventName, this].concat(args));
		}
	},
	getBBox: function(opt) {
		var bbox$1;
		if (opt && opt.useModelGeometry) {
			var model = this.model;
			bbox$1 = model.getBBox().bbox(model.angle());
		} else bbox$1 = this.getNodeBBox(this.el);
		return this.paper.localToPaperRect(bbox$1);
	},
	getNodeBBox: function(magnet) {
		const rect$1 = this.getNodeBoundingRect(magnet);
		const transformMatrix = this.getRootTranslateMatrix().multiply(this.getNodeRotateMatrix(magnet));
		const magnetMatrix = this.getNodeMatrix(magnet);
		return V_default.transformRect(rect$1, transformMatrix.multiply(magnetMatrix));
	},
	getNodeRotateMatrix(node) {
		if (!this.rotatableNode || this.rotatableNode.contains(node)) return this.getRootRotateMatrix();
		return V_default.createSVGMatrix();
	},
	getNodeUnrotatedBBox: function(magnet) {
		var rect$1 = this.getNodeBoundingRect(magnet);
		var magnetMatrix = this.getNodeMatrix(magnet);
		var translateMatrix = this.getRootTranslateMatrix();
		return V_default.transformRect(rect$1, translateMatrix.multiply(magnetMatrix));
	},
	getRootTranslateMatrix: function() {
		var model = this.model;
		var position$1 = model.position();
		var mt = V_default.createSVGMatrix().translate(position$1.x, position$1.y);
		return mt;
	},
	getRootRotateMatrix: function() {
		var mr = V_default.createSVGMatrix();
		var model = this.model;
		var angle = model.angle();
		if (angle) {
			var bbox$1 = model.getBBox();
			var cx = bbox$1.width / 2;
			var cy = bbox$1.height / 2;
			mr = mr.translate(cx, cy).rotate(angle).translate(-cx, -cy);
		}
		return mr;
	},
	_notifyHighlight: function(eventName, el, opt = {}) {
		const { el: rootNode } = this;
		let node;
		if (typeof el === "string") node = this.findNode(el) || rootNode;
		else [node = rootNode] = this.$(el);
		opt.partial = node !== rootNode;
		if (opt.type === void 0) {
			let type;
			switch (true) {
				case opt.embedding:
					type = HighlightingTypes$1.EMBEDDING;
					break;
				case opt.connecting:
					type = HighlightingTypes$1.CONNECTING;
					break;
				case opt.magnetAvailability:
					type = HighlightingTypes$1.MAGNET_AVAILABILITY;
					break;
				case opt.elementAvailability:
					type = HighlightingTypes$1.ELEMENT_AVAILABILITY;
					break;
				default:
					type = HighlightingTypes$1.DEFAULT;
					break;
			}
			opt.type = type;
		}
		this.notify(eventName, node, opt);
		return this;
	},
	highlight: function(el, opt) {
		return this._notifyHighlight("cell:highlight", el, opt);
	},
	unhighlight: function(el, opt = {}) {
		return this._notifyHighlight("cell:unhighlight", el, opt);
	},
	findMagnet: function(el) {
		const root = this.el;
		let magnet = this.$(el)[0];
		if (!magnet) magnet = root;
		do {
			const magnetAttribute = magnet.getAttribute("magnet");
			const isMagnetRoot = magnet === root;
			if ((magnetAttribute || isMagnetRoot) && magnetAttribute !== "false") return magnet;
			if (isMagnetRoot) return void 0;
			magnet = magnet.parentNode;
		} while (magnet);
		return void 0;
	},
	findProxyNode: function(el, type) {
		el || (el = this.el);
		const nodeSelector = el.getAttribute(`${type}-selector`);
		if (nodeSelector) {
			const proxyNode = this.findNode(nodeSelector);
			if (proxyNode) return proxyNode;
		}
		return el;
	},
	getSelector: function(el, prevSelector) {
		var selector;
		if (el === this.el) {
			if (typeof prevSelector === "string") selector = ":scope > " + prevSelector;
			return selector;
		}
		if (el) {
			var nthChild = V_default(el).index() + 1;
			selector = el.tagName + ":nth-child(" + nthChild + ")";
			if (prevSelector) selector += " > " + prevSelector;
			selector = this.getSelector(el.parentNode, selector);
		}
		return selector;
	},
	addLinkFromMagnet: function(magnet, x, y) {
		var paper = this.paper;
		var graph = paper.model;
		var link = paper.getDefaultLink(this, magnet);
		link.set({
			source: this.getLinkEnd(magnet, x, y, link, "source"),
			target: {
				x,
				y
			}
		}).addTo(graph, {
			async: false,
			ui: true
		});
		return link.findView(paper);
	},
	getLinkEnd: function(magnet, ...args) {
		const model = this.model;
		const id = model.id;
		const portNode = this.findAttributeNode("port", magnet);
		const selector = magnet.getAttribute("joint-selector");
		const end = { id };
		if (selector != null) end.magnet = selector;
		if (portNode != null) {
			let port = portNode.getAttribute("port");
			if (portNode.getAttribute("port-id-type") === "number") port = parseInt(port, 10);
			end.port = port;
			if (!model.hasPort(port) && !selector) end.selector = this.getSelector(magnet);
		} else if (selector == null && this.el !== magnet) end.selector = this.getSelector(magnet);
		return this.customizeLinkEnd(end, magnet, ...args);
	},
	customizeLinkEnd: function(end, magnet, x, y, link, endType) {
		const { paper } = this;
		const { connectionStrategy } = paper.options;
		if (typeof connectionStrategy === "function") {
			var strategy = connectionStrategy.call(paper, end, this, magnet, new Point(x, y), link, endType, paper);
			if (strategy) return strategy;
		}
		return end;
	},
	getMagnetFromLinkEnd: function(end) {
		var port = end.port;
		var selector = end.magnet;
		var model = this.model;
		var magnet;
		if (port != null && model.isElement() && model.hasPort(port)) magnet = this.findPortNode(port, selector) || this.el;
		else {
			if (!selector) selector = end.selector;
			if (!selector && port != null) selector = "[port=\"" + port + "\"]";
			magnet = this.findNode(selector);
		}
		return this.findProxyNode(magnet, "magnet");
	},
	dragLinkStart: function(evt, magnet, x, y) {
		this.model.startBatch("add-link");
		const linkView = this.addLinkFromMagnet(magnet, x, y);
		linkView.notifyPointerdown(evt, x, y);
		linkView.eventData(evt, linkView.startArrowheadMove("target", { whenNotAllowed: "remove" }));
		this.eventData(evt, { linkView });
	},
	dragLink: function(evt, x, y) {
		var data$1 = this.eventData(evt);
		var linkView = data$1.linkView;
		if (linkView) linkView.pointermove(evt, x, y);
		else {
			var paper = this.paper;
			var magnetThreshold = paper.options.magnetThreshold;
			var currentTarget = this.getEventTarget(evt);
			var targetMagnet = data$1.targetMagnet;
			if (magnetThreshold === "onleave") {
				if (targetMagnet === currentTarget || V_default(targetMagnet).contains(currentTarget)) return;
			} else if (paper.eventData(evt).mousemoved <= magnetThreshold) return;
			this.dragLinkStart(evt, targetMagnet, x, y);
		}
	},
	dragLinkEnd: function(evt, x, y) {
		var data$1 = this.eventData(evt);
		var linkView = data$1.linkView;
		if (!linkView) return;
		linkView.pointerup(evt, x, y);
		this.model.stopBatch("add-link");
	},
	getAttributeDefinition: function(attrName) {
		return this.model.constructor.getAttributeDefinition(attrName);
	},
	setNodeAttributes: function(node, attrs) {
		if (!isEmpty(attrs)) if (node instanceof SVGElement) V_default(node).attr(attrs);
		else Dom_default(node).attr(attrs);
	},
	processNodeAttributes: function(node, attrs) {
		var attrName, attrVal, def, i, n;
		var normalAttrs, setAttrs, positionAttrs, offsetAttrs;
		var relatives = [];
		const rawAttrs = {};
		for (attrName in attrs) {
			if (!attrs.hasOwnProperty(attrName)) continue;
			rawAttrs[V_default.attributeNames[attrName]] = attrs[attrName];
		}
		for (attrName in rawAttrs) {
			if (!rawAttrs.hasOwnProperty(attrName)) continue;
			attrVal = rawAttrs[attrName];
			def = this.getAttributeDefinition(attrName);
			if (def) if (attrVal === null) {
				let unsetAttrName;
				if (isFunction(def.unset)) unsetAttrName = def.unset.call(this, node, rawAttrs, this);
				else unsetAttrName = def.unset;
				if (!unsetAttrName && isString(def.set)) unsetAttrName = def.set;
				if (!unsetAttrName) unsetAttrName = attrName;
				if (isString(unsetAttrName) && unsetAttrName) {
					normalAttrs || (normalAttrs = {});
					if (unsetAttrName in normalAttrs) continue;
					normalAttrs[unsetAttrName] = attrVal;
				} else if (Array.isArray(unsetAttrName) && unsetAttrName.length > 0) {
					normalAttrs || (normalAttrs = {});
					for (i = 0, n = unsetAttrName.length; i < n; i++) {
						const attrName$1 = unsetAttrName[i];
						if (attrName$1 in normalAttrs) continue;
						normalAttrs[attrName$1] = attrVal;
					}
				}
			} else if (!isFunction(def.qualify) || def.qualify.call(this, attrVal, node, rawAttrs, this)) {
				if (isString(def.set)) {
					normalAttrs || (normalAttrs = {});
					normalAttrs[def.set] = attrVal;
				}
				relatives.push(attrName, def);
			} else {
				normalAttrs || (normalAttrs = {});
				normalAttrs[attrName] = attrVal;
			}
			else {
				normalAttrs || (normalAttrs = {});
				normalAttrs[attrName] = attrVal;
			}
		}
		for (i = 0, n = relatives.length; i < n; i += 2) {
			attrName = relatives[i];
			def = relatives[i + 1];
			attrVal = attrs[attrName];
			if (isFunction(def.set)) {
				setAttrs || (setAttrs = {});
				setAttrs[attrName] = attrVal;
			}
			if (isFunction(def.position)) {
				positionAttrs || (positionAttrs = {});
				positionAttrs[attrName] = attrVal;
			}
			if (isFunction(def.offset)) {
				offsetAttrs || (offsetAttrs = {});
				offsetAttrs[attrName] = attrVal;
			}
		}
		return {
			raw: rawAttrs,
			normal: normalAttrs,
			set: setAttrs,
			position: positionAttrs,
			offset: offsetAttrs
		};
	},
	updateRelativeAttributes: function(node, attrs, refBBox, opt) {
		opt || (opt = {});
		var attrName, attrVal, def;
		var evalAttrs = evalAttributes(attrs.raw || {}, refBBox);
		var nodeAttrs = attrs.normal || {};
		for (const nodeAttrName in nodeAttrs) nodeAttrs[nodeAttrName] = evalAttrs[nodeAttrName];
		var setAttrs = attrs.set;
		var positionAttrs = attrs.position;
		var offsetAttrs = attrs.offset;
		for (attrName in setAttrs) {
			attrVal = evalAttrs[attrName];
			def = this.getAttributeDefinition(attrName);
			var setResult = def.set.call(this, attrVal, refBBox.clone(), node, evalAttrs, this);
			if (isObject(setResult)) assign(nodeAttrs, setResult);
			else if (setResult !== void 0) nodeAttrs[attrName] = setResult;
		}
		if (node instanceof HTMLElement) {
			this.setNodeAttributes(node, nodeAttrs);
			return;
		}
		var nodeTransform = nodeAttrs.transform;
		var nodeMatrix = V_default.transformStringToMatrix(nodeTransform);
		var nodePosition = Point(nodeMatrix.e, nodeMatrix.f);
		if (nodeTransform) {
			nodeAttrs = omit(nodeAttrs, "transform");
			nodeMatrix.e = nodeMatrix.f = 0;
		}
		var sx, sy, translation;
		if (positionAttrs || offsetAttrs) {
			var nodeScale = this.getNodeScale(node, opt.scalableNode);
			sx = nodeScale.sx;
			sy = nodeScale.sy;
		}
		var positioned = false;
		for (attrName in positionAttrs) {
			attrVal = evalAttrs[attrName];
			def = this.getAttributeDefinition(attrName);
			translation = def.position.call(this, attrVal, refBBox.clone(), node, evalAttrs, this);
			if (translation) {
				nodePosition.offset(Point(translation).scale(sx, sy));
				positioned || (positioned = true);
			}
		}
		this.setNodeAttributes(node, nodeAttrs);
		var offseted = false;
		if (offsetAttrs) {
			var nodeBoundingRect = this.getNodeBoundingRect(node);
			if (nodeBoundingRect.width > 0 && nodeBoundingRect.height > 0) {
				var nodeBBox = V_default.transformRect(nodeBoundingRect, nodeMatrix).scale(1 / sx, 1 / sy);
				for (attrName in offsetAttrs) {
					attrVal = evalAttrs[attrName];
					def = this.getAttributeDefinition(attrName);
					translation = def.offset.call(this, attrVal, nodeBBox, node, evalAttrs, this);
					if (translation) {
						nodePosition.offset(Point(translation).scale(sx, sy));
						offseted || (offseted = true);
					}
				}
			}
		}
		if (nodeTransform !== void 0 || positioned || offseted) {
			nodePosition.round(1);
			nodeMatrix.e = nodePosition.x;
			nodeMatrix.f = nodePosition.y;
			node.setAttribute("transform", V_default.matrixToTransformString(nodeMatrix));
		}
	},
	getNodeScale: function(node, scalableNode) {
		var sx, sy;
		if (scalableNode && scalableNode.contains(node)) {
			var scale$1 = scalableNode.scale();
			sx = 1 / scale$1.sx;
			sy = 1 / scale$1.sy;
		} else {
			sx = 1;
			sy = 1;
		}
		return {
			sx,
			sy
		};
	},
	cleanNodesCache: function() {
		this.metrics = {};
	},
	cleanNodeCache: function(node) {
		const id = node.id;
		if (!id) return;
		delete this.metrics[id];
	},
	nodeCache: function(magnet) {
		var metrics = this.metrics;
		if (!metrics) return {};
		var id = V_default.ensureId(magnet);
		var value = metrics[id];
		if (!value) value = metrics[id] = {};
		return value;
	},
	getNodeData: function(magnet) {
		var metrics = this.nodeCache(magnet);
		if (!metrics.data) metrics.data = {};
		return metrics.data;
	},
	getNodeBoundingRect: function(magnet) {
		var metrics = this.nodeCache(magnet);
		if (metrics.boundingRect === void 0) metrics.boundingRect = V_default(magnet).getBBox();
		return new Rect(metrics.boundingRect);
	},
	getNodeMatrix: function(magnet) {
		const metrics = this.nodeCache(magnet);
		if (metrics.magnetMatrix === void 0) {
			const { rotatableNode, el } = this;
			let target;
			if (rotatableNode && rotatableNode.contains(magnet)) target = rotatableNode;
			else target = el;
			metrics.magnetMatrix = V_default(magnet).getTransformToElement(target);
		}
		return V_default.createSVGMatrix(metrics.magnetMatrix);
	},
	getNodeShape: function(magnet) {
		var metrics = this.nodeCache(magnet);
		if (metrics.geometryShape === void 0) metrics.geometryShape = V_default(magnet).toGeometryShape();
		return metrics.geometryShape.clone();
	},
	isNodeConnection: function(node) {
		return this.model.isLink() && (!node || node === this.el);
	},
	findNodesAttributes: function(attrs, root, selectorCache, selectors) {
		var i, n, nodeAttrs, nodeId;
		var nodesAttrs = {};
		var mergeIds = [];
		for (var selector in attrs) {
			if (!attrs.hasOwnProperty(selector)) continue;
			nodeAttrs = attrs[selector];
			if (!isPlainObject(nodeAttrs)) continue;
			var selected = selectorCache[selector] = this.findBySelector(selector, root, selectors);
			for (i = 0, n = selected.length; i < n; i++) {
				var node = selected[i];
				nodeId = V_default.ensureId(node);
				var unique = selectors && selectors[selector] === node;
				var prevNodeAttrs = nodesAttrs[nodeId];
				if (prevNodeAttrs) {
					if (!prevNodeAttrs.array) {
						mergeIds.push(nodeId);
						prevNodeAttrs.array = true;
						prevNodeAttrs.attributes = [prevNodeAttrs.attributes];
						prevNodeAttrs.selectedLength = [prevNodeAttrs.selectedLength];
					}
					var attributes$1 = prevNodeAttrs.attributes;
					var selectedLength = prevNodeAttrs.selectedLength;
					if (unique) {
						attributes$1.unshift(nodeAttrs);
						selectedLength.unshift(-1);
					} else {
						var sortIndex = sortedIndex(selectedLength, n);
						attributes$1.splice(sortIndex, 0, nodeAttrs);
						selectedLength.splice(sortIndex, 0, n);
					}
				} else nodesAttrs[nodeId] = {
					attributes: nodeAttrs,
					selectedLength: unique ? -1 : n,
					node,
					array: false
				};
			}
		}
		for (i = 0, n = mergeIds.length; i < n; i++) {
			nodeId = mergeIds[i];
			nodeAttrs = nodesAttrs[nodeId];
			nodeAttrs.attributes = merge({}, ...nodeAttrs.attributes.reverse());
		}
		return nodesAttrs;
	},
	getEventTarget: function(evt, opt = {}) {
		const { target, type, clientX = 0, clientY = 0 } = evt;
		if (opt.fromPoint || type === "touchmove" || type === "touchend" || "pointerId" in evt && target.hasPointerCapture(evt.pointerId)) return document.elementFromPoint(clientX, clientY);
		return target;
	},
	updateDOMSubtreeAttributes: function(rootNode, attrs, opt) {
		opt || (opt = {});
		opt.rootBBox || (opt.rootBBox = Rect());
		opt.selectors || (opt.selectors = this.selectors);
		var selectorCache = {};
		var bboxCache = {};
		var relativeItems = [];
		var relativeRefItems = [];
		var item, node, nodeAttrs, nodeData, processedAttrs;
		var roAttrs = opt.roAttributes;
		var nodesAttrs = this.findNodesAttributes(roAttrs || attrs, rootNode, selectorCache, opt.selectors);
		var nodesAllAttrs = roAttrs ? this.findNodesAttributes(attrs, rootNode, selectorCache, opt.selectors) : nodesAttrs;
		for (var nodeId in nodesAttrs) {
			nodeData = nodesAttrs[nodeId];
			nodeAttrs = nodeData.attributes;
			node = nodeData.node;
			processedAttrs = this.processNodeAttributes(node, nodeAttrs);
			if (!processedAttrs.set && !processedAttrs.position && !processedAttrs.offset && !processedAttrs.raw.ref) this.setNodeAttributes(node, evalAttributes(processedAttrs.normal, opt.rootBBox));
			else {
				var nodeAllAttrs = nodesAllAttrs[nodeId] && nodesAllAttrs[nodeId].attributes;
				var refSelector = nodeAllAttrs && nodeAttrs.ref === void 0 ? nodeAllAttrs.ref : nodeAttrs.ref;
				var refNode;
				if (refSelector) {
					refNode = (selectorCache[refSelector] || this.findBySelector(refSelector, rootNode, opt.selectors))[0];
					if (!refNode) throw new Error("dia.CellView: \"" + refSelector + "\" reference does not exist.");
				} else refNode = null;
				item = {
					node,
					refNode,
					processedAttributes: processedAttrs,
					allAttributes: nodeAllAttrs
				};
				if (refNode) {
					var itemIndex = relativeRefItems.findIndex(function(item$1) {
						return item$1.refNode === node;
					});
					if (itemIndex > -1) relativeRefItems.splice(itemIndex, 0, item);
					else relativeRefItems.push(item);
				} else relativeItems.push(item);
			}
		}
		relativeItems.push(...relativeRefItems);
		for (let i = 0, n = relativeItems.length; i < n; i++) {
			item = relativeItems[i];
			node = item.node;
			refNode = item.refNode;
			const refNodeId = refNode ? V_default.ensureId(refNode) : "";
			let refBBox = bboxCache[refNodeId];
			if (!refBBox) refBBox = bboxCache[refNodeId] = refNode ? V_default(refNode).getBBox({ target: getCommonAncestorNode(node, refNode) }) : opt.rootBBox;
			if (roAttrs) {
				processedAttrs = this.processNodeAttributes(node, item.allAttributes);
				this.mergeProcessedAttributes(processedAttrs, item.processedAttributes);
			} else processedAttrs = item.processedAttributes;
			this.updateRelativeAttributes(node, processedAttrs, refBBox, opt);
		}
	},
	mergeProcessedAttributes: function(processedAttrs, roProcessedAttrs) {
		processedAttrs.set || (processedAttrs.set = {});
		processedAttrs.position || (processedAttrs.position = {});
		processedAttrs.offset || (processedAttrs.offset = {});
		assign(processedAttrs.set, roProcessedAttrs.set);
		assign(processedAttrs.position, roProcessedAttrs.position);
		assign(processedAttrs.offset, roProcessedAttrs.offset);
		var transform = processedAttrs.normal && processedAttrs.normal.transform;
		if (transform !== void 0 && roProcessedAttrs.normal) roProcessedAttrs.normal.transform = transform;
		processedAttrs.normal = roProcessedAttrs.normal;
	},
	onMount(isInitialMount) {
		if (isInitialMount) return;
		this.mountTools();
		HighlighterView.mount(this);
	},
	onDetach() {
		this.unmountTools();
		HighlighterView.unmount(this);
	},
	onRemove: function() {
		this.removeTools();
		this.removeHighlighters();
	},
	_toolsView: null,
	hasTools: function(name) {
		var toolsView = this._toolsView;
		if (!toolsView) return false;
		if (!name) return true;
		return toolsView.getName() === name;
	},
	addTools: function(toolsView) {
		this.removeTools();
		if (toolsView) {
			this._toolsView = toolsView;
			toolsView.configure({ relatedView: this });
			toolsView.listenTo(this.paper, "tools:event", this.onToolEvent.bind(this));
		}
		return this;
	},
	unmountTools() {
		const toolsView = this._toolsView;
		if (toolsView) toolsView.unmount();
		return this;
	},
	mountTools() {
		const toolsView = this._toolsView;
		if (toolsView && !toolsView.isMounted()) toolsView.mount();
		return this;
	},
	updateTools: function(opt) {
		var toolsView = this._toolsView;
		if (toolsView) toolsView.update(opt);
		return this;
	},
	removeTools: function() {
		var toolsView = this._toolsView;
		if (toolsView) {
			toolsView.remove();
			this._toolsView = null;
		}
		return this;
	},
	hideTools: function() {
		var toolsView = this._toolsView;
		if (toolsView) toolsView.hide();
		return this;
	},
	showTools: function() {
		var toolsView = this._toolsView;
		if (toolsView) toolsView.show();
		return this;
	},
	onToolEvent: function(event) {
		switch (event) {
			case "remove":
				this.removeTools();
				break;
			case "hide":
				this.hideTools();
				break;
			case "show":
				this.showTools();
				break;
		}
	},
	removeHighlighters: function() {
		HighlighterView.remove(this);
	},
	updateHighlighters: function(dirty = false) {
		HighlighterView.update(this, null, dirty);
	},
	transformHighlighters: function() {
		HighlighterView.transform(this);
	},
	preventDefaultInteraction(evt) {
		this.eventData(evt, { defaultInteractionPrevented: true });
	},
	isDefaultInteractionPrevented(evt) {
		const { defaultInteractionPrevented = false } = this.eventData(evt);
		return defaultInteractionPrevented;
	},
	pointerdblclick: function(evt, x, y) {
		this.notify("cell:pointerdblclick", evt, x, y);
	},
	pointerclick: function(evt, x, y) {
		this.notify("cell:pointerclick", evt, x, y);
	},
	contextmenu: function(evt, x, y) {
		this.notify("cell:contextmenu", evt, x, y);
	},
	pointerdown: function(evt, x, y) {
		const { model } = this;
		const { graph } = model;
		if (graph) {
			model.startBatch("pointer");
			this.eventData(evt, { graph });
		}
		this.notify("cell:pointerdown", evt, x, y);
	},
	pointermove: function(evt, x, y) {
		this.notify("cell:pointermove", evt, x, y);
	},
	pointerup: function(evt, x, y) {
		const { graph } = this.eventData(evt);
		this.notify("cell:pointerup", evt, x, y);
		if (graph) graph.stopBatch("pointer", { cell: this.model });
	},
	mouseover: function(evt) {
		this.notify("cell:mouseover", evt);
	},
	mouseout: function(evt) {
		this.notify("cell:mouseout", evt);
	},
	mouseenter: function(evt) {
		this.notify("cell:mouseenter", evt);
	},
	mouseleave: function(evt) {
		this.notify("cell:mouseleave", evt);
	},
	mousewheel: function(evt, x, y, delta) {
		this.notify("cell:mousewheel", evt, x, y, delta);
	},
	onevent: function(evt, eventName, x, y) {
		this.notify(eventName, evt, x, y);
	},
	onmagnet: function() {},
	magnetpointerdblclick: function() {},
	magnetcontextmenu: function() {},
	checkMouseleave(evt) {
		const { paper, model } = this;
		if (paper.isAsync()) {
			if (model.isLink()) {
				const sourceElement = model.getSourceElement();
				if (sourceElement) {
					const sourceView = paper.findViewByModel(sourceElement);
					if (sourceView) {
						paper.dumpView(sourceView);
						paper.checkViewVisibility(sourceView);
					}
				}
				const targetElement = model.getTargetElement();
				if (targetElement) {
					const targetView = paper.findViewByModel(targetElement);
					if (targetView) {
						paper.dumpView(targetView);
						paper.checkViewVisibility(targetView);
					}
				}
			}
			paper.dumpView(this);
			paper.checkViewVisibility(this);
		}
		const target = this.getEventTarget(evt, { fromPoint: true });
		const view = paper.findView(target);
		if (view === this) return;
		this.mouseleave(evt);
		if (!view) return;
		view.mouseenter(evt);
	},
	setInteractivity: function(value) {
		this.options.interactive = value;
	},
	isIntersecting: function(geometryShape, geometryData) {
		return intersection.exists(geometryShape, this.getNodeBBox(this.el), geometryData);
	},
	isEnclosedIn: function(geometryRect) {
		return geometryRect.containsRect(this.getNodeBBox(this.el));
	},
	isInArea: function(geometryRect, options = {}) {
		if (options.strict) return this.isEnclosedIn(geometryRect);
		return this.isIntersecting(geometryRect);
	},
	isAtPoint: function(point$1, options) {
		return this.getNodeBBox(this.el).containsPoint(point$1, options);
	}
}, {
	Flags: Flags$2,
	Highlighting: HighlightingTypes$1,
	addPresentationAttributes: function(presentationAttributes) {
		return merge({}, result(this.prototype, "presentationAttributes"), presentationAttributes, function(a, b) {
			if (!a || !b) return;
			if (typeof a === "string") a = [a];
			if (typeof b === "string") b = [b];
			if (Array.isArray(a) && Array.isArray(b)) return uniq(a.concat(b));
		});
	},
	evalAttribute
});
Object.defineProperty(CellView.prototype, "useCSSSelectors", { get() {
	const localUse = this.model.useCSSSelectors;
	if (localUse !== void 0) return localUse;
	return config.useCSSSelectors;
} });
function getCommonAncestorNode(node1, node2) {
	let parent$1 = node1;
	do {
		if (parent$1.contains(node2)) return parent$1;
		parent$1 = parent$1.parentNode;
	} while (parent$1);
	return null;
}

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/ElementView.mjs
const Flags$1 = {
	TOOLS: CellView.Flags.TOOLS,
	UPDATE: "UPDATE",
	TRANSLATE: "TRANSLATE",
	RESIZE: "RESIZE",
	PORTS: "PORTS",
	ROTATE: "ROTATE",
	RENDER: "RENDER"
};
const DragActions = {
	MOVE: "move",
	MAGNET: "magnet"
};
const ElementView = CellView.extend({
	_removePorts: function() {},
	_renderPorts: function() {},
	className: function() {
		var classNames = CellView.prototype.className.apply(this).split(" ");
		classNames.push("element");
		return classNames.join(" ");
	},
	initialize: function() {
		CellView.prototype.initialize.apply(this, arguments);
		this._initializePorts();
	},
	presentationAttributes: {
		"attrs": [Flags$1.UPDATE],
		"position": [Flags$1.TRANSLATE, Flags$1.TOOLS],
		"size": [
			Flags$1.RESIZE,
			Flags$1.PORTS,
			Flags$1.TOOLS
		],
		"angle": [Flags$1.ROTATE, Flags$1.TOOLS],
		"markup": [Flags$1.RENDER],
		"ports": [Flags$1.PORTS]
	},
	initFlag: [Flags$1.RENDER],
	UPDATE_PRIORITY: 0,
	confirmUpdate: function(flag, opt) {
		const { useCSSSelectors } = this;
		if (this.hasFlag(flag, Flags$1.PORTS)) {
			this._removePorts();
			this._cleanPortsCache();
		}
		let transformHighlighters = false;
		if (this.hasFlag(flag, Flags$1.RENDER)) {
			this.render();
			this.updateTools(opt);
			this.updateHighlighters(true);
			transformHighlighters = true;
			flag = this.removeFlag(flag, [
				Flags$1.RENDER,
				Flags$1.UPDATE,
				Flags$1.RESIZE,
				Flags$1.TRANSLATE,
				Flags$1.ROTATE,
				Flags$1.PORTS,
				Flags$1.TOOLS
			]);
		} else {
			let updateHighlighters = false;
			if (this.hasFlag(flag, Flags$1.RESIZE)) {
				this.resize(opt);
				updateHighlighters = true;
				flag = this.removeFlag(flag, [Flags$1.RESIZE, Flags$1.UPDATE]);
				if (useCSSSelectors) flag = this.removeFlag(flag, Flags$1.PORTS);
			}
			if (this.hasFlag(flag, Flags$1.UPDATE)) {
				this.update(this.model, null, opt);
				flag = this.removeFlag(flag, Flags$1.UPDATE);
				updateHighlighters = true;
				if (useCSSSelectors) flag = this.removeFlag(flag, Flags$1.PORTS);
			}
			if (this.hasFlag(flag, Flags$1.TRANSLATE)) {
				this.translate();
				flag = this.removeFlag(flag, Flags$1.TRANSLATE);
				transformHighlighters = true;
			}
			if (this.hasFlag(flag, Flags$1.ROTATE)) {
				this.rotate();
				flag = this.removeFlag(flag, Flags$1.ROTATE);
				transformHighlighters = true;
			}
			if (this.hasFlag(flag, Flags$1.PORTS)) {
				this._renderPorts();
				updateHighlighters = true;
				flag = this.removeFlag(flag, Flags$1.PORTS);
			}
			if (updateHighlighters) this.updateHighlighters(false);
		}
		if (transformHighlighters) this.transformHighlighters();
		if (this.hasFlag(flag, Flags$1.TOOLS)) {
			this.updateTools(opt);
			flag = this.removeFlag(flag, Flags$1.TOOLS);
		}
		return flag;
	},
	_initializePorts: function() {},
	update: function(_, renderingOnlyAttrs) {
		this.cleanNodesCache();
		const { useCSSSelectors } = this;
		if (useCSSSelectors) this._removePorts();
		var model = this.model;
		var modelAttrs = model.attr();
		this.updateDOMSubtreeAttributes(this.el, modelAttrs, {
			rootBBox: new Rect(model.size()),
			selectors: this.selectors,
			scalableNode: this.scalableNode,
			rotatableNode: this.rotatableNode,
			roAttributes: renderingOnlyAttrs === modelAttrs ? null : renderingOnlyAttrs
		});
		if (useCSSSelectors) this._renderPorts();
	},
	rotatableSelector: "rotatable",
	scalableSelector: "scalable",
	scalableNode: null,
	rotatableNode: null,
	renderMarkup: function() {
		var element = this.model;
		var markup = element.get("markup") || element.markup;
		if (!markup) throw new Error("dia.ElementView: markup required");
		if (Array.isArray(markup)) return this.renderJSONMarkup(markup);
		if (typeof markup === "string") return this.renderStringMarkup(markup);
		throw new Error("dia.ElementView: invalid markup");
	},
	renderJSONMarkup: function(markup) {
		var doc = this.parseDOMJSON(markup, this.el);
		var selectors = this.selectors = doc.selectors;
		this.rotatableNode = V_default(selectors[this.rotatableSelector]) || null;
		this.scalableNode = V_default(selectors[this.scalableSelector]) || null;
		this.vel.append(doc.fragment);
	},
	renderStringMarkup: function(markup) {
		var vel = this.vel;
		vel.append(V_default(markup));
		this.rotatableNode = vel.findOne(".rotatable");
		this.scalableNode = vel.findOne(".scalable");
		var selectors = this.selectors = {};
		selectors[this.selector] = this.el;
	},
	render: function() {
		this.vel.empty();
		this.renderMarkup();
		if (this.scalableNode) this.update();
		this.resize();
		if (this.rotatableNode) {
			this.rotate();
			this.translate();
		} else this.updateTransformation();
		if (!this.useCSSSelectors) this._renderPorts();
		return this;
	},
	resize: function(opt) {
		if (this.scalableNode) return this.sgResize(opt);
		if (this.model.attributes.angle) this.rotate();
		this.update();
	},
	translate: function() {
		if (this.rotatableNode) return this.rgTranslate();
		this.updateTransformation();
	},
	rotate: function() {
		if (this.rotatableNode) {
			this.rgRotate();
			this.update();
			return;
		}
		this.updateTransformation();
	},
	updateTransformation: function() {
		var transformation = this.getTranslateString();
		var rotateString = this.getRotateString();
		if (rotateString) transformation += " " + rotateString;
		this.vel.attr("transform", transformation);
	},
	getTranslateString: function() {
		const { x, y } = this.model.position();
		return `translate(${x},${y})`;
	},
	getRotateString: function() {
		const angle = this.model.angle();
		if (!angle) return null;
		const { width: width$1, height: height$1 } = this.model.size();
		return `rotate(${angle},${width$1 / 2},${height$1 / 2})`;
	},
	rgRotate: function() {
		this.rotatableNode.attr("transform", this.getRotateString());
	},
	rgTranslate: function() {
		this.vel.attr("transform", this.getTranslateString());
	},
	sgResize: function(opt) {
		var model = this.model;
		var angle = model.angle();
		var size = model.size();
		var scalable = this.scalableNode;
		var recursive = false;
		if (scalable.node.getElementsByTagName("path").length > 0) recursive = true;
		var scalableBBox = scalable.getBBox({ recursive });
		var sx = size.width / (scalableBBox.width || 1);
		var sy = size.height / (scalableBBox.height || 1);
		scalable.attr("transform", "scale(" + sx + "," + sy + ")");
		var rotatable = this.rotatableNode;
		var rotation = rotatable && rotatable.attr("transform");
		if (rotation) {
			rotatable.attr("transform", rotation + " rotate(" + -angle + "," + size.width / 2 + "," + size.height / 2 + ")");
			var rotatableBBox = scalable.getBBox({ target: this.paper.cells });
			model.set("position", {
				x: rotatableBBox.x,
				y: rotatableBBox.y
			}, assign({ updateHandled: true }, opt));
			this.translate();
			this.rotate();
		}
		this.update();
	},
	prepareEmbedding: function(data$1 = {}) {
		const element = data$1.model || this.model;
		const paper = data$1.paper || this.paper;
		const graph = paper.model;
		const initialZIndices = data$1.initialZIndices = {};
		const embeddedCells = element.getEmbeddedCells({ deep: true });
		const connectedLinks = graph.getConnectedLinks(element, {
			deep: true,
			includeEnclosed: true
		});
		[
			element,
			...embeddedCells,
			...connectedLinks
		].forEach((cell) => initialZIndices[cell.id] = cell.attributes.z);
		element.startBatch("to-front");
		element.toFront({
			deep: true,
			ui: true
		});
		const maxZ = graph.getElements().reduce((max$4, cell) => Math.max(max$4, cell.attributes.z || 0), 0);
		connectedLinks.forEach((link) => {
			if (link.attributes.z <= maxZ) link.set("z", maxZ + 1, { ui: true });
		});
		element.stopBatch("to-front");
		const parentId = element.parent();
		if (parentId) {
			const parent$1 = graph.getCell(parentId);
			parent$1.unembed(element, { ui: true });
			data$1.initialParentId = parentId;
		} else data$1.initialParentId = null;
	},
	processEmbedding: function(data$1 = {}, evt, x, y) {
		const model = data$1.model || this.model;
		const paper = data$1.paper || this.paper;
		const graph = paper.model;
		const { findParentBy, frontParentOnly, validateEmbedding } = paper.options;
		let candidates;
		if (isFunction(findParentBy)) candidates = toArray(findParentBy.call(graph, this, evt, x, y));
		else if (findParentBy === "pointer") candidates = graph.findElementsAtPoint({
			x,
			y
		});
		else candidates = graph.findElementsUnderElement(model, { searchBy: findParentBy });
		candidates = candidates.filter((el) => {
			return el instanceof Cell && model.id !== el.id && !el.isEmbeddedIn(model);
		});
		if (frontParentOnly) candidates = candidates.slice(-1);
		let newCandidateView = null;
		const prevCandidateView = data$1.candidateEmbedView;
		for (let i = candidates.length - 1; i >= 0; i--) {
			const candidate = candidates[i];
			if (prevCandidateView && prevCandidateView.model.id == candidate.id) {
				newCandidateView = prevCandidateView;
				break;
			} else {
				const view = candidate.findView(paper);
				if (!isFunction(validateEmbedding) || validateEmbedding.call(paper, this, view)) {
					newCandidateView = view;
					break;
				}
			}
		}
		if (newCandidateView && newCandidateView != prevCandidateView) {
			this.clearEmbedding(data$1);
			data$1.candidateEmbedView = newCandidateView.highlight(newCandidateView.findProxyNode(null, "container"), { embedding: true });
		}
		if (!newCandidateView && prevCandidateView) this.clearEmbedding(data$1);
	},
	clearEmbedding: function(data$1) {
		data$1 || (data$1 = {});
		var candidateView = data$1.candidateEmbedView;
		if (candidateView) {
			candidateView.unhighlight(candidateView.findProxyNode(null, "container"), { embedding: true });
			data$1.candidateEmbedView = null;
		}
	},
	finalizeEmbedding: function(data$1 = {}) {
		const candidateView = data$1.candidateEmbedView;
		const element = data$1.model || this.model;
		const paper = data$1.paper || this.paper;
		if (candidateView) {
			candidateView.model.embed(element, { ui: true });
			candidateView.unhighlight(candidateView.findProxyNode(null, "container"), { embedding: true });
			data$1.candidateEmbedView = null;
		} else {
			const { validateUnembedding } = paper.options;
			const { initialParentId } = data$1;
			if (initialParentId && typeof validateUnembedding === "function" && !validateUnembedding.call(paper, this)) {
				this._disallowUnembed(data$1);
				return;
			}
		}
		paper.model.getConnectedLinks(element, { deep: true }).forEach((link) => {
			link.reparent({ ui: true });
		});
	},
	_disallowUnembed: function(data$1) {
		const { model, whenNotAllowed = "revert" } = data$1;
		const element = model || this.model;
		const paper = data$1.paper || this.paper;
		const graph = paper.model;
		switch (whenNotAllowed) {
			case "remove":
				element.remove({ ui: true });
				break;
			case "revert": {
				const { initialParentId, initialPosition, initialZIndices } = data$1;
				if (initialPosition) {
					const { x, y } = initialPosition;
					element.position(x, y, {
						deep: true,
						ui: true
					});
				}
				if (initialZIndices) Object.keys(initialZIndices).forEach((id) => {
					const cell = graph.getCell(id);
					if (cell) cell.set("z", initialZIndices[id], { ui: true });
				});
				const parent$1 = graph.getCell(initialParentId);
				if (parent$1) parent$1.embed(element, { ui: true });
				break;
			}
		}
	},
	getTargetParentView: function(evt) {
		const { candidateEmbedView = null } = this.eventData(evt);
		return candidateEmbedView;
	},
	getDelegatedView: function() {
		var view = this;
		var model = view.model;
		var paper = view.paper;
		while (view) {
			if (model.isLink()) break;
			if (!model.isEmbedded() || view.can("stopDelegation")) return view;
			model = model.getParentCell();
			view = paper.findViewByModel(model);
		}
		return null;
	},
	findProxyNode: function(el, type) {
		el || (el = this.el);
		const nodeSelector = el.getAttribute(`${type}-selector`);
		if (nodeSelector) {
			const port = this.findAttribute("port", el);
			if (port) {
				const proxyPortNode = this.findPortNode(port, nodeSelector);
				if (proxyPortNode) return proxyPortNode;
			} else {
				const proxyNode = this.findNode(nodeSelector);
				if (proxyNode) return proxyNode;
			}
		}
		return el;
	},
	notifyPointerdown(evt, x, y) {
		CellView.prototype.pointerdown.call(this, evt, x, y);
		this.notify("element:pointerdown", evt, x, y);
	},
	notifyPointermove(evt, x, y) {
		CellView.prototype.pointermove.call(this, evt, x, y);
		this.notify("element:pointermove", evt, x, y);
	},
	notifyPointerup(evt, x, y) {
		this.notify("element:pointerup", evt, x, y);
		CellView.prototype.pointerup.call(this, evt, x, y);
	},
	pointerdblclick: function(evt, x, y) {
		CellView.prototype.pointerdblclick.apply(this, arguments);
		this.notify("element:pointerdblclick", evt, x, y);
	},
	pointerclick: function(evt, x, y) {
		CellView.prototype.pointerclick.apply(this, arguments);
		this.notify("element:pointerclick", evt, x, y);
	},
	contextmenu: function(evt, x, y) {
		CellView.prototype.contextmenu.apply(this, arguments);
		this.notify("element:contextmenu", evt, x, y);
	},
	pointerdown: function(evt, x, y) {
		this.notifyPointerdown(evt, x, y);
		this.dragStart(evt, x, y);
	},
	pointermove: function(evt, x, y) {
		const data$1 = this.eventData(evt);
		const { targetMagnet, action, delegatedView } = data$1;
		if (targetMagnet) this.magnetpointermove(evt, targetMagnet, x, y);
		switch (action) {
			case DragActions.MAGNET:
				this.dragMagnet(evt, x, y);
				break;
			case DragActions.MOVE: (delegatedView || this).drag(evt, x, y);
			default:
				if (data$1.preventPointerEvents) break;
				this.notifyPointermove(evt, x, y);
				break;
		}
		this.eventData(evt, data$1);
	},
	pointerup: function(evt, x, y) {
		const data$1 = this.eventData(evt);
		const { targetMagnet, action, delegatedView } = data$1;
		if (targetMagnet) this.magnetpointerup(evt, targetMagnet, x, y);
		switch (action) {
			case DragActions.MAGNET:
				this.dragMagnetEnd(evt, x, y);
				break;
			case DragActions.MOVE: (delegatedView || this).dragEnd(evt, x, y);
			default:
				if (data$1.preventPointerEvents) break;
				this.notifyPointerup(evt, x, y);
		}
		if (targetMagnet) this.magnetpointerclick(evt, targetMagnet, x, y);
		this.checkMouseleave(evt);
	},
	mouseover: function(evt) {
		CellView.prototype.mouseover.apply(this, arguments);
		this.notify("element:mouseover", evt);
	},
	mouseout: function(evt) {
		CellView.prototype.mouseout.apply(this, arguments);
		this.notify("element:mouseout", evt);
	},
	mouseenter: function(evt) {
		CellView.prototype.mouseenter.apply(this, arguments);
		this.notify("element:mouseenter", evt);
	},
	mouseleave: function(evt) {
		CellView.prototype.mouseleave.apply(this, arguments);
		this.notify("element:mouseleave", evt);
	},
	mousewheel: function(evt, x, y, delta) {
		CellView.prototype.mousewheel.apply(this, arguments);
		this.notify("element:mousewheel", evt, x, y, delta);
	},
	onmagnet: function(evt, x, y) {
		const { currentTarget: targetMagnet } = evt;
		this.magnetpointerdown(evt, targetMagnet, x, y);
		this.eventData(evt, { targetMagnet });
		this.dragMagnetStart(evt, x, y);
	},
	magnetpointerdown: function(evt, magnet, x, y) {
		this.notify("element:magnet:pointerdown", evt, magnet, x, y);
	},
	magnetpointermove: function(evt, magnet, x, y) {
		this.notify("element:magnet:pointermove", evt, magnet, x, y);
	},
	magnetpointerup: function(evt, magnet, x, y) {
		this.notify("element:magnet:pointerup", evt, magnet, x, y);
	},
	magnetpointerdblclick: function(evt, magnet, x, y) {
		this.notify("element:magnet:pointerdblclick", evt, magnet, x, y);
	},
	magnetcontextmenu: function(evt, magnet, x, y) {
		this.notify("element:magnet:contextmenu", evt, magnet, x, y);
	},
	dragStart: function(evt, x, y) {
		if (this.isDefaultInteractionPrevented(evt)) return;
		var view = this.getDelegatedView();
		if (!view || !view.can("elementMove")) return;
		this.eventData(evt, {
			action: DragActions.MOVE,
			delegatedView: view
		});
		const position$1 = view.model.position();
		view.eventData(evt, {
			initialPosition: position$1,
			pointerOffset: position$1.difference(x, y),
			restrictedArea: this.paper.getRestrictedArea(view, x, y)
		});
	},
	dragMagnetStart: function(evt, x, y) {
		const { paper } = this;
		const isPropagationAlreadyStopped = evt.isPropagationStopped();
		if (isPropagationAlreadyStopped) this.eventData(evt, { preventPointerEvents: true });
		if (this.isDefaultInteractionPrevented(evt) || !this.can("addLinkFromMagnet")) return;
		const { targetMagnet = evt.currentTarget } = this.eventData(evt);
		evt.stopPropagation();
		if (!paper.options.validateMagnet.call(paper, this, targetMagnet, evt)) {
			if (isPropagationAlreadyStopped) this.dragStart(evt, x, y);
			else this.pointerdown(evt, x, y);
			return;
		}
		if (paper.options.magnetThreshold <= 0) this.dragLinkStart(evt, targetMagnet, x, y);
		this.eventData(evt, { action: DragActions.MAGNET });
	},
	snapToGrid: function(evt, x, y) {
		const grid = this.paper.options.gridSize;
		return {
			x: snapToGrid(x, grid),
			y: snapToGrid(y, grid)
		};
	},
	drag: function(evt, x, y) {
		var paper = this.paper;
		var element = this.model;
		var data$1 = this.eventData(evt);
		var { pointerOffset, restrictedArea, embedding } = data$1;
		const { x: elX, y: elY } = this.snapToGrid(evt, x + pointerOffset.x, y + pointerOffset.y);
		element.position(elX, elY, {
			restrictedArea,
			deep: true,
			ui: true
		});
		if (paper.options.embeddingMode) {
			if (!embedding) {
				this.prepareEmbedding(data$1);
				embedding = true;
			}
			this.processEmbedding(data$1, evt, x, y);
		}
		this.eventData(evt, { embedding });
	},
	dragMagnet: function(evt, x, y) {
		this.dragLink(evt, x, y);
	},
	dragEnd: function(evt, x, y) {
		var data$1 = this.eventData(evt);
		if (data$1.embedding) this.finalizeEmbedding(data$1);
	},
	dragMagnetEnd: function(evt, x, y) {
		this.dragLinkEnd(evt, x, y);
	},
	magnetpointerclick: function(evt, magnet, x, y) {
		var paper = this.paper;
		if (paper.eventData(evt).mousemoved > paper.options.clickThreshold) return;
		this.notify("element:magnet:pointerclick", evt, magnet, x, y);
	}
}, { Flags: Flags$1 });
assign(ElementView.prototype, elementViewPortPrototype);

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/LinkView.mjs
const Flags = {
	TOOLS: CellView.Flags.TOOLS,
	RENDER: "RENDER",
	UPDATE: "UPDATE",
	LABELS: "LABELS",
	SOURCE: "SOURCE",
	TARGET: "TARGET",
	CONNECTOR: "CONNECTOR"
};
const LinkView = CellView.extend({
	className: function() {
		var classNames = CellView.prototype.className.apply(this).split(" ");
		classNames.push("link");
		return classNames.join(" ");
	},
	_labelCache: null,
	_labelSelectors: null,
	_V: null,
	_dragData: null,
	metrics: null,
	decimalsRounding: 2,
	initialize: function() {
		CellView.prototype.initialize.apply(this, arguments);
		this._labelCache = {};
		this._labelSelectors = {};
		this._V = {};
		this.cleanNodesCache();
	},
	presentationAttributes: {
		markup: [Flags.RENDER],
		attrs: [Flags.UPDATE],
		router: [Flags.UPDATE],
		connector: [Flags.CONNECTOR],
		labels: [Flags.LABELS, Flags.TOOLS],
		labelMarkup: [Flags.LABELS],
		vertices: [Flags.UPDATE],
		source: [Flags.SOURCE, Flags.UPDATE],
		target: [Flags.TARGET, Flags.UPDATE]
	},
	initFlag: [
		Flags.RENDER,
		Flags.SOURCE,
		Flags.TARGET,
		Flags.TOOLS
	],
	UPDATE_PRIORITY: 1,
	EPSILON: 1e-6,
	confirmUpdate: function(flags, opt) {
		opt || (opt = {});
		if (this.hasFlag(flags, Flags.SOURCE)) {
			if (!this.updateEndProperties("source")) return flags;
			flags = this.removeFlag(flags, Flags.SOURCE);
		}
		if (this.hasFlag(flags, Flags.TARGET)) {
			if (!this.updateEndProperties("target")) return flags;
			flags = this.removeFlag(flags, Flags.TARGET);
		}
		const { paper, sourceView, targetView } = this;
		if (paper && (sourceView && !paper.isViewMounted(sourceView) || targetView && !paper.isViewMounted(targetView))) return flags;
		if (this.hasFlag(flags, Flags.RENDER)) {
			this.render();
			this.updateHighlighters(true);
			this.updateTools(opt);
			flags = this.removeFlag(flags, [
				Flags.RENDER,
				Flags.UPDATE,
				Flags.LABELS,
				Flags.TOOLS,
				Flags.CONNECTOR
			]);
			if (env.test("isSafari")) this.__fixSafariBug268376();
			return flags;
		}
		let updateHighlighters = false;
		const { model } = this;
		const { attributes: attributes$1 } = model;
		let updateLabels = this.hasFlag(flags, Flags.LABELS);
		if (updateLabels) {
			this.onLabelsChange(model, attributes$1.labels, opt);
			flags = this.removeFlag(flags, Flags.LABELS);
			updateHighlighters = true;
		}
		const updateAll = this.hasFlag(flags, Flags.UPDATE);
		const updateConnector = this.hasFlag(flags, Flags.CONNECTOR);
		if (updateAll || updateConnector) {
			if (!updateAll) {
				this.updatePath();
				this.updateDOM();
			} else if (opt.translateBy && model.isRelationshipEmbeddedIn(opt.translateBy)) this.translate(opt.tx, opt.ty);
			else this.update();
			this.updateTools(opt);
			flags = this.removeFlag(flags, [
				Flags.UPDATE,
				Flags.TOOLS,
				Flags.CONNECTOR
			]);
			updateLabels = false;
			updateHighlighters = true;
		}
		if (updateLabels) this.updateLabelPositions();
		if (updateHighlighters) this.updateHighlighters();
		if (this.hasFlag(flags, Flags.TOOLS)) {
			this.updateTools(opt);
			flags = this.removeFlag(flags, Flags.TOOLS);
		}
		return flags;
	},
	__fixSafariBug268376: function() {
		const { el } = this;
		const childNodes = Array.from(el.childNodes);
		const fragment = document.createDocumentFragment();
		for (let i = 0, n = childNodes.length; i < n; i++) {
			el.removeChild(childNodes[i]);
			fragment.appendChild(childNodes[i]);
		}
		el.appendChild(fragment);
	},
	requestConnectionUpdate: function(opt) {
		this.requestUpdate(this.getFlag(Flags.UPDATE), opt);
	},
	isLabelsRenderRequired: function(opt = {}) {
		const previousLabels = this.model.previous("labels");
		if (!previousLabels) return true;
		if ("propertyPathArray" in opt && "propertyValue" in opt) {
			var pathArray = opt.propertyPathArray || [];
			var pathLength = pathArray.length;
			if (pathLength > 1) {
				var labelExists = !!previousLabels[pathArray[1]];
				if (labelExists) {
					if (pathLength === 2) return "markup" in Object(opt.propertyValue);
					else if (pathArray[2] !== "markup") return false;
				}
			}
		}
		return true;
	},
	onLabelsChange: function(_link, _labels, opt) {
		if (this.isLabelsRenderRequired(opt)) this.renderLabels();
		else this.updateLabels();
	},
	render: function() {
		this.vel.empty();
		this.unmountLabels();
		this._V = {};
		this.renderMarkup();
		this.renderLabels();
		this.update();
		return this;
	},
	renderMarkup: function() {
		var link = this.model;
		var markup = link.get("markup") || link.markup;
		if (!markup) throw new Error("dia.LinkView: markup required");
		if (Array.isArray(markup)) return this.renderJSONMarkup(markup);
		if (typeof markup === "string") return this.renderStringMarkup(markup);
		throw new Error("dia.LinkView: invalid markup");
	},
	renderJSONMarkup: function(markup) {
		var doc = this.parseDOMJSON(markup, this.el);
		this.selectors = doc.selectors;
		this.vel.append(doc.fragment);
	},
	renderStringMarkup: function(markup) {
		var children$1 = V_default(markup);
		if (!Array.isArray(children$1)) children$1 = [children$1];
		this.vel.append(children$1);
	},
	_getLabelMarkup: function(labelMarkup$1) {
		if (!labelMarkup$1) return void 0;
		if (Array.isArray(labelMarkup$1)) return this.parseDOMJSON(labelMarkup$1, null);
		if (typeof labelMarkup$1 === "string") return this._getLabelStringMarkup(labelMarkup$1);
		throw new Error("dia.linkView: invalid label markup");
	},
	_getLabelStringMarkup: function(labelMarkup$1) {
		var children$1 = V_default(labelMarkup$1);
		var fragment = document.createDocumentFragment();
		if (!Array.isArray(children$1)) fragment.appendChild(children$1.node);
		else for (var i = 0, n = children$1.length; i < n; i++) {
			var currentChild = children$1[i].node;
			fragment.appendChild(currentChild);
		}
		return {
			fragment,
			selectors: {}
		};
	},
	_normalizeLabelMarkup: function(markup) {
		if (!markup) return void 0;
		var fragment = markup.fragment;
		if (!(markup.fragment instanceof DocumentFragment) || !markup.fragment.hasChildNodes()) throw new Error("dia.LinkView: invalid label markup.");
		var vNode;
		var childNodes = fragment.childNodes;
		if (childNodes.length > 1 || childNodes[0].nodeName.toUpperCase() !== "G") vNode = V_default("g").append(fragment);
		else vNode = V_default(childNodes[0]);
		vNode.addClass("label");
		return {
			node: vNode.node,
			selectors: markup.selectors
		};
	},
	renderLabels: function() {
		var cache = this._V;
		var vLabels = cache.labels;
		var labelCache = this._labelCache = {};
		var labelSelectors = this._labelSelectors = {};
		var model = this.model;
		var labels = model.attributes.labels || [];
		var labelsCount = labels.length;
		if (labelsCount === 0) {
			if (vLabels) vLabels.remove();
			return this;
		}
		if (vLabels) vLabels.empty();
		else {
			vLabels = cache.labels = V_default("g").addClass("labels");
			if (this.options.labelsLayer) {
				vLabels.addClass(addClassNamePrefix(result(this, "className")));
				vLabels.attr("model-id", model.id);
			}
		}
		for (var i = 0; i < labelsCount; i++) {
			var label = labels[i];
			var labelMarkup$1 = this._normalizeLabelMarkup(this._getLabelMarkup(label.markup));
			var labelNode;
			var selectors;
			if (labelMarkup$1) {
				labelNode = labelMarkup$1.node;
				selectors = labelMarkup$1.selectors;
			} else {
				var builtinDefaultLabel = model._builtins.defaultLabel;
				var builtinDefaultLabelMarkup = this._normalizeLabelMarkup(this._getLabelMarkup(builtinDefaultLabel.markup));
				var defaultLabel = model._getDefaultLabel();
				var defaultLabelMarkup = this._normalizeLabelMarkup(this._getLabelMarkup(defaultLabel.markup));
				var defaultMarkup = defaultLabelMarkup || builtinDefaultLabelMarkup;
				labelNode = defaultMarkup.node;
				selectors = defaultMarkup.selectors;
			}
			labelNode.setAttribute("label-idx", i);
			vLabels.append(labelNode);
			labelCache[i] = labelNode;
			var rootSelector = this.selector;
			if (selectors[rootSelector]) throw new Error("dia.LinkView: ambiguous label root selector.");
			selectors[rootSelector] = labelNode;
			labelSelectors[i] = selectors;
		}
		if (!vLabels.parent()) this.mountLabels();
		this.updateLabels();
		return this;
	},
	mountLabels: function() {
		const { el, paper, model, _V, options } = this;
		const { labels: vLabels } = _V;
		if (!vLabels || !model.hasLabels()) return;
		const { node } = vLabels;
		if (options.labelsLayer) paper.getLayerView(options.labelsLayer).insertSortedNode(node, model.get("z"));
		else if (node.parentNode !== el) el.appendChild(node);
	},
	unmountLabels: function() {
		const { options, _V } = this;
		if (!_V) return;
		const { labels: vLabels } = _V;
		if (vLabels && options.labelsLayer) vLabels.remove();
	},
	findLabelNodes: function(labelIndex, selector) {
		const labelRoot = this._labelCache[labelIndex];
		if (!labelRoot) return [];
		const labelSelectors = this._labelSelectors[labelIndex];
		return this.findBySelector(selector, labelRoot, labelSelectors);
	},
	findLabelNode: function(labelIndex, selector) {
		const [node = null] = this.findLabelNodes(labelIndex, selector);
		return node;
	},
	_mergeLabelAttrs: function(hasCustomMarkup, labelAttrs, defaultLabelAttrs, builtinDefaultLabelAttrs) {
		if (labelAttrs === null) return null;
		if (labelAttrs === void 0) {
			if (defaultLabelAttrs === null) return null;
			if (defaultLabelAttrs === void 0) {
				if (hasCustomMarkup) return void 0;
				return builtinDefaultLabelAttrs;
			}
			if (hasCustomMarkup) return defaultLabelAttrs;
			return merge({}, builtinDefaultLabelAttrs, defaultLabelAttrs);
		}
		if (hasCustomMarkup) return merge({}, defaultLabelAttrs, labelAttrs);
		return merge({}, builtinDefaultLabelAttrs, defaultLabelAttrs, labelAttrs);
	},
	_mergeLabelSize: function(labelSize, defaultLabelSize) {
		if (labelSize === null) return null;
		if (labelSize === void 0) {
			if (defaultLabelSize === null) return null;
			if (defaultLabelSize === void 0) return void 0;
			return defaultLabelSize;
		}
		return merge({}, defaultLabelSize, labelSize);
	},
	updateLabels: function() {
		if (!this._V.labels) return this;
		if (!this.paper.options.labelLayer) this.cleanNodeCache(this.el);
		var model = this.model;
		var labels = model.get("labels") || [];
		var canLabelMove = this.can("labelMove");
		var builtinDefaultLabel = model._builtins.defaultLabel;
		var builtinDefaultLabelAttrs = builtinDefaultLabel.attrs;
		var defaultLabel = model._getDefaultLabel();
		var defaultLabelMarkup = defaultLabel.markup;
		var defaultLabelAttrs = defaultLabel.attrs;
		var defaultLabelSize = defaultLabel.size;
		for (var i = 0, n = labels.length; i < n; i++) {
			var labelNode = this._labelCache[i];
			labelNode.setAttribute("cursor", canLabelMove ? "move" : "default");
			var selectors = this._labelSelectors[i];
			var label = labels[i];
			var labelMarkup$1 = label.markup;
			var labelAttrs = label.attrs;
			var labelSize = label.size;
			var attrs = this._mergeLabelAttrs(labelMarkup$1 || defaultLabelMarkup, labelAttrs, defaultLabelAttrs, builtinDefaultLabelAttrs);
			var size = this._mergeLabelSize(labelSize, defaultLabelSize);
			this.updateDOMSubtreeAttributes(labelNode, attrs, {
				rootBBox: new Rect(size),
				selectors
			});
		}
		return this;
	},
	removeRedundantLinearVertices: function(opt) {
		const SIMPLIFY_THRESHOLD = .001;
		const link = this.model;
		const vertices = link.vertices();
		const routePoints = [
			this.sourceAnchor,
			...vertices,
			this.targetAnchor
		];
		const numRoutePoints = routePoints.length;
		const polyline = new Polyline(routePoints);
		polyline.simplify({ threshold: SIMPLIFY_THRESHOLD });
		const polylinePoints = polyline.points.map((point$1) => point$1.toJSON());
		const numPolylinePoints = polylinePoints.length;
		if (numRoutePoints === numPolylinePoints) return 0;
		link.vertices(polylinePoints.slice(1, numPolylinePoints - 1), opt);
		return numRoutePoints - numPolylinePoints;
	},
	getEndView: function(type) {
		switch (type) {
			case "source": return this.sourceView || null;
			case "target": return this.targetView || null;
			default: throw new Error("dia.LinkView: type parameter required.");
		}
	},
	getEndAnchor: function(type) {
		switch (type) {
			case "source": return new Point(this.sourceAnchor);
			case "target": return new Point(this.targetAnchor);
			default: throw new Error("dia.LinkView: type parameter required.");
		}
	},
	getEndConnectionPoint: function(type) {
		switch (type) {
			case "source": return new Point(this.sourcePoint);
			case "target": return new Point(this.targetPoint);
			default: throw new Error("dia.LinkView: type parameter required.");
		}
	},
	getEndMagnet: function(type) {
		switch (type) {
			case "source":
				var sourceView = this.sourceView;
				if (!sourceView) break;
				return this.sourceMagnet || sourceView.el;
			case "target":
				var targetView = this.targetView;
				if (!targetView) break;
				return this.targetMagnet || targetView.el;
			default: throw new Error("dia.LinkView: type parameter required.");
		}
		return null;
	},
	update: function() {
		this.updateRoute();
		this.updatePath();
		this.updateDOM();
		return this;
	},
	translate: function(tx = 0, ty = 0) {
		const { route, path } = this;
		if (!route || !path) return;
		const polyline = new Polyline(route);
		polyline.translate(tx, ty);
		this.route = polyline.points;
		this.sourcePoint.offset(tx, ty);
		this.targetPoint.offset(tx, ty);
		this.sourceAnchor.offset(tx, ty);
		this.targetAnchor.offset(tx, ty);
		path.translate(tx, ty);
		this.updateDOM();
	},
	updateDOM() {
		const { el, model, selectors } = this;
		this.cleanNodesCache();
		this.updateDOMSubtreeAttributes(el, model.attr(), { selectors });
		this.updateLabelPositions();
		this.options.perpendicular = null;
	},
	updateRoute: function() {
		const { model } = this;
		const vertices = model.vertices();
		const anchors = this.findAnchors(vertices);
		const sourceAnchor = this.sourceAnchor = anchors.source;
		const targetAnchor = this.targetAnchor = anchors.target;
		const route = this.findRoute(vertices);
		this.route = route;
		var connectionPoints = this.findConnectionPoints(route, sourceAnchor, targetAnchor);
		this.sourcePoint = connectionPoints.source;
		this.targetPoint = connectionPoints.target;
	},
	updatePath: function() {
		const { route, sourcePoint, targetPoint } = this;
		const path = this.findPath(route, sourcePoint.clone(), targetPoint.clone());
		this.path = path;
	},
	findAnchorsOrdered: function(firstEndType, firstRef, secondEndType, secondRef) {
		var firstAnchor, secondAnchor;
		var firstAnchorRef, secondAnchorRef;
		var model = this.model;
		var firstDef = model.get(firstEndType);
		var secondDef = model.get(secondEndType);
		var firstView = this.getEndView(firstEndType);
		var secondView = this.getEndView(secondEndType);
		var firstMagnet = this.getEndMagnet(firstEndType);
		var secondMagnet = this.getEndMagnet(secondEndType);
		if (firstView) {
			if (firstRef) firstAnchorRef = new Point(firstRef);
			else if (secondView) firstAnchorRef = secondMagnet;
			else firstAnchorRef = new Point(secondDef);
			firstAnchor = this.getAnchor(firstDef.anchor, firstView, firstMagnet, firstAnchorRef, firstEndType);
		} else firstAnchor = new Point(firstDef);
		if (secondView) {
			secondAnchorRef = new Point(secondRef || firstAnchor);
			secondAnchor = this.getAnchor(secondDef.anchor, secondView, secondMagnet, secondAnchorRef, secondEndType);
		} else secondAnchor = new Point(secondDef);
		var res = {};
		res[firstEndType] = firstAnchor;
		res[secondEndType] = secondAnchor;
		return res;
	},
	findAnchors: function(vertices) {
		var model = this.model;
		var firstVertex = vertices[0];
		var lastVertex = vertices[vertices.length - 1];
		if (model.target().priority && !model.source().priority) return this.findAnchorsOrdered("target", lastVertex, "source", firstVertex);
		return this.findAnchorsOrdered("source", firstVertex, "target", lastVertex);
	},
	findConnectionPoints: function(route, sourceAnchor, targetAnchor) {
		var firstWaypoint = route[0];
		var lastWaypoint = route[route.length - 1];
		var model = this.model;
		var sourceDef = model.get("source");
		var targetDef = model.get("target");
		var sourceView = this.sourceView;
		var targetView = this.targetView;
		var paperOptions = this.paper.options;
		var sourceMagnet, targetMagnet;
		var sourcePoint;
		if (sourceView && !sourceView.isNodeConnection(this.sourceMagnet)) {
			sourceMagnet = this.sourceMagnet || sourceView.el;
			var sourceConnectionPointDef = sourceDef.connectionPoint || paperOptions.defaultConnectionPoint;
			var sourcePointRef = firstWaypoint || targetAnchor;
			var sourceLine = new Line(sourcePointRef, sourceAnchor);
			sourcePoint = this.getConnectionPoint(sourceConnectionPointDef, sourceView, sourceMagnet, sourceLine, "source");
		} else sourcePoint = sourceAnchor;
		var targetPoint;
		if (targetView && !targetView.isNodeConnection(this.targetMagnet)) {
			targetMagnet = this.targetMagnet || targetView.el;
			var targetConnectionPointDef = targetDef.connectionPoint || paperOptions.defaultConnectionPoint;
			var targetPointRef = lastWaypoint || sourceAnchor;
			var targetLine = new Line(targetPointRef, targetAnchor);
			targetPoint = this.getConnectionPoint(targetConnectionPointDef, targetView, targetMagnet, targetLine, "target");
		} else targetPoint = targetAnchor;
		return {
			source: sourcePoint,
			target: targetPoint
		};
	},
	getAnchor: function(anchorDef, cellView, magnet, ref, endType) {
		var isConnection = cellView.isNodeConnection(magnet);
		var paperOptions = this.paper.options;
		if (!anchorDef) if (isConnection) anchorDef = paperOptions.defaultLinkAnchor;
		else if (this.options.perpendicular) anchorDef = { name: "perpendicular" };
		else anchorDef = paperOptions.defaultAnchor;
		if (!anchorDef) throw new Error("Anchor required.");
		var anchorFn;
		if (typeof anchorDef === "function") anchorFn = anchorDef;
		else {
			var anchorName = anchorDef.name;
			var anchorNamespace = isConnection ? "linkAnchorNamespace" : "anchorNamespace";
			anchorFn = paperOptions[anchorNamespace][anchorName];
			if (typeof anchorFn !== "function") throw new Error("Unknown anchor: " + anchorName);
		}
		var anchor$1 = anchorFn.call(this, cellView, magnet, ref, anchorDef.args || {}, endType, this);
		if (!anchor$1) return new Point();
		return anchor$1.round(this.decimalsRounding);
	},
	getConnectionPoint: function(connectionPointDef, view, magnet, line$2, endType) {
		var connectionPoint;
		var anchor$1 = line$2.end;
		var paperOptions = this.paper.options;
		if (!connectionPointDef) return anchor$1;
		var connectionPointFn;
		if (typeof connectionPointDef === "function") connectionPointFn = connectionPointDef;
		else {
			var connectionPointName = connectionPointDef.name;
			connectionPointFn = paperOptions.connectionPointNamespace[connectionPointName];
			if (typeof connectionPointFn !== "function") throw new Error("Unknown connection point: " + connectionPointName);
		}
		connectionPoint = connectionPointFn.call(this, line$2, view, magnet, connectionPointDef.args || {}, endType, this);
		if (!connectionPoint) return anchor$1;
		return connectionPoint.round(this.decimalsRounding);
	},
	isIntersecting: function(geometryShape, geometryData) {
		const connection = this.getConnection();
		if (!connection) return false;
		return intersection.exists(geometryShape, connection, geometryData, { segmentSubdivisions: this.getConnectionSubdivisions() });
	},
	isEnclosedIn: function(geometryRect) {
		const connection = this.getConnection();
		if (!connection) return false;
		const bbox$1 = connection.bbox();
		if (!bbox$1) return false;
		return geometryRect.containsRect(bbox$1);
	},
	isAtPoint: function(point$1) {
		const area = new Rect(point$1);
		area.inflate(this.EPSILON);
		return this.isIntersecting(area);
	},
	_getDefaultLabelPositionProperty: function() {
		var model = this.model;
		var builtinDefaultLabel = model._builtins.defaultLabel;
		var builtinDefaultLabelPosition = builtinDefaultLabel.position;
		var defaultLabel = model._getDefaultLabel();
		var defaultLabelPosition = this._normalizeLabelPosition(defaultLabel.position);
		return merge({}, builtinDefaultLabelPosition, defaultLabelPosition);
	},
	_normalizeLabelPosition: function(labelPosition) {
		if (typeof labelPosition === "number") return {
			distance: labelPosition,
			offset: null,
			angle: 0,
			args: null
		};
		return labelPosition;
	},
	_mergeLabelPositionProperty: function(normalizedLabelPosition, normalizedDefaultLabelPosition) {
		if (normalizedLabelPosition === null) return null;
		if (normalizedLabelPosition === void 0) {
			if (normalizedDefaultLabelPosition === null) return null;
			return normalizedDefaultLabelPosition;
		}
		return merge({}, normalizedDefaultLabelPosition, normalizedLabelPosition);
	},
	updateLabelPositions: function() {
		if (!this._V.labels) return this;
		var path = this.path;
		if (!path) return this;
		var model = this.model;
		var labels = model.get("labels") || [];
		if (!labels.length) return this;
		var defaultLabelPosition = this._getDefaultLabelPositionProperty();
		for (var idx = 0, n = labels.length; idx < n; idx++) {
			var labelNode = this._labelCache[idx];
			if (!labelNode) continue;
			var label = labels[idx];
			var labelPosition = this._normalizeLabelPosition(label.position);
			var position$1 = this._mergeLabelPositionProperty(labelPosition, defaultLabelPosition);
			var transformationMatrix = this._getLabelTransformationMatrix(position$1);
			labelNode.setAttribute("transform", V_default.matrixToTransformString(transformationMatrix));
			this._cleanLabelMatrices(idx);
		}
		return this;
	},
	_cleanLabelMatrices: function(index) {
		const { metrics, _labelSelectors } = this;
		const selectors = _labelSelectors[index];
		if (!selectors) return;
		for (let selector in selectors) {
			const { id } = selectors[selector];
			if (id && id in metrics) delete metrics[id].magnetMatrix;
		}
	},
	updateEndProperties: function(endType) {
		const { model, paper } = this;
		const endViewProperty = `${endType}View`;
		const endDef = model.get(endType);
		const endId = endDef && endDef.id;
		if (!endId) {
			this[endViewProperty] = null;
			this.updateEndMagnet(endType);
			return true;
		}
		const endModel = paper.getModelById(endId);
		if (!endModel) throw new Error("LinkView: invalid " + endType + " cell.");
		const endView = endModel.findView(paper);
		if (!endView) return false;
		this[endViewProperty] = endView;
		this.updateEndMagnet(endType);
		return true;
	},
	updateEndMagnet: function(endType) {
		const endMagnetProperty = `${endType}Magnet`;
		const endView = this.getEndView(endType);
		if (endView) {
			let connectedMagnet = endView.getMagnetFromLinkEnd(this.model.get(endType));
			if (connectedMagnet === endView.el) connectedMagnet = null;
			this[endMagnetProperty] = connectedMagnet;
		} else this[endMagnetProperty] = null;
	},
	_getLabelPositionProperty: function(idx) {
		return this.model.label(idx).position || {};
	},
	_getLabelPositionAngle: function(idx) {
		var labelPosition = this._getLabelPositionProperty(idx);
		return labelPosition.angle || 0;
	},
	_getLabelPositionArgs: function(idx) {
		var labelPosition = this._getLabelPositionProperty(idx);
		return labelPosition.args;
	},
	_getDefaultLabelPositionArgs: function() {
		var defaultLabel = this.model._getDefaultLabel();
		var defaultLabelPosition = defaultLabel.position || {};
		return defaultLabelPosition.args;
	},
	_mergeLabelPositionArgs: function(labelPositionArgs, defaultLabelPositionArgs) {
		if (labelPositionArgs === null) return null;
		if (labelPositionArgs === void 0) {
			if (defaultLabelPositionArgs === null) return null;
			return defaultLabelPositionArgs;
		}
		return merge({}, defaultLabelPositionArgs, labelPositionArgs);
	},
	addLabel: function(p1, p2, p3, p4) {
		var localX;
		var localY;
		var localAngle = 0;
		var localOpt;
		if (typeof p1 !== "number") {
			localX = p1.x;
			localY = p1.y;
			if (typeof p2 === "number") {
				localAngle = p2;
				localOpt = p3;
			} else localOpt = p2;
		} else {
			localX = p1;
			localY = p2;
			if (typeof p3 === "number") {
				localAngle = p3;
				localOpt = p4;
			} else localOpt = p3;
		}
		var defaultLabelPositionArgs = this._getDefaultLabelPositionArgs();
		var labelPositionArgs = localOpt;
		var positionArgs = this._mergeLabelPositionArgs(labelPositionArgs, defaultLabelPositionArgs);
		var label = { position: this.getLabelPosition(localX, localY, localAngle, positionArgs) };
		var idx = -1;
		this.model.insertLabel(idx, label, localOpt);
		return idx;
	},
	addVertex: function(x, y, opt) {
		var isPointProvided = typeof x !== "number";
		var localX = isPointProvided ? x.x : x;
		var localY = isPointProvided ? x.y : y;
		var localOpt = isPointProvided ? y : opt;
		var vertex = {
			x: localX,
			y: localY
		};
		var idx = this.getVertexIndex(localX, localY);
		this.model.insertVertex(idx, vertex, localOpt);
		return idx;
	},
	sendToken: function(token, opt, callback) {
		function onAnimationEnd(vToken$1, callback$1) {
			return function() {
				vToken$1.remove();
				if (typeof callback$1 === "function") callback$1();
			};
		}
		var duration, isReversed, selector;
		if (isObject(opt)) {
			duration = opt.duration;
			isReversed = opt.direction === "reverse";
			selector = opt.connection;
		} else {
			duration = opt;
			isReversed = false;
			selector = null;
		}
		duration = duration || 1e3;
		var animationAttributes = {
			dur: duration + "ms",
			repeatCount: 1,
			calcMode: "linear",
			fill: "freeze"
		};
		if (isReversed) {
			animationAttributes.keyPoints = "1;0";
			animationAttributes.keyTimes = "0;1";
		}
		var vToken = V_default(token);
		var connection;
		if (typeof selector === "string") connection = this.findNode(selector);
		else {
			var cache = this._V;
			connection = cache.connection ? cache.connection.node : this.el.querySelector("path");
		}
		if (!(connection instanceof SVGPathElement)) throw new Error("dia.LinkView: token animation requires a valid connection path.");
		vToken.appendTo(this.paper.cells).animateAlongPath(animationAttributes, connection);
		setTimeout(onAnimationEnd(vToken, callback), duration);
	},
	findRoute: function(vertices) {
		vertices || (vertices = []);
		var namespace = this.paper.options.routerNamespace || routers_exports;
		var router$1 = this.model.router();
		var defaultRouter = this.paper.options.defaultRouter;
		if (!router$1) if (defaultRouter) router$1 = defaultRouter;
		else return vertices.map(Point);
		var routerFn = isFunction(router$1) ? router$1 : namespace[router$1.name];
		if (!isFunction(routerFn)) throw new Error("dia.LinkView: unknown router: \"" + router$1.name + "\".");
		var args = router$1.args || {};
		var route = routerFn.call(this, vertices, args, this);
		if (!route) return vertices.map(Point);
		return route;
	},
	findPath: function(route, sourcePoint, targetPoint) {
		var namespace = this.paper.options.connectorNamespace || connectors_exports;
		var connector = this.model.connector();
		var defaultConnector = this.paper.options.defaultConnector;
		if (!connector) connector = defaultConnector || {};
		var connectorFn = isFunction(connector) ? connector : namespace[connector.name];
		if (!isFunction(connectorFn)) throw new Error("dia.LinkView: unknown connector: \"" + connector.name + "\".");
		var args = clone(connector.args || {});
		args.raw = true;
		var path = connectorFn.call(this, sourcePoint, targetPoint, route, args, this);
		if (typeof path === "string") path = new Path(V_default.normalizePathData(path));
		return path;
	},
	getConnection: function() {
		var path = this.path;
		if (!path) return null;
		return path.clone();
	},
	getSerializedConnection: function() {
		var path = this.path;
		if (!path) return null;
		var metrics = this.metrics;
		if (metrics.hasOwnProperty("data")) return metrics.data;
		var data$1 = path.serialize();
		metrics.data = data$1;
		return data$1;
	},
	getConnectionSubdivisions: function() {
		var path = this.path;
		if (!path) return null;
		var metrics = this.metrics;
		if (metrics.hasOwnProperty("segmentSubdivisions")) return metrics.segmentSubdivisions;
		var subdivisions = path.getSegmentSubdivisions();
		metrics.segmentSubdivisions = subdivisions;
		return subdivisions;
	},
	getConnectionLength: function() {
		var path = this.path;
		if (!path) return 0;
		var metrics = this.metrics;
		if (metrics.hasOwnProperty("length")) return metrics.length;
		var length$1 = path.length({ segmentSubdivisions: this.getConnectionSubdivisions() });
		metrics.length = length$1;
		return length$1;
	},
	getPointAtLength: function(length$1) {
		var path = this.path;
		if (!path) return null;
		return path.pointAtLength(length$1, { segmentSubdivisions: this.getConnectionSubdivisions() });
	},
	getPointAtRatio: function(ratio) {
		var path = this.path;
		if (!path) return null;
		if (isPercentage(ratio)) ratio = parseFloat(ratio) / 100;
		return path.pointAt(ratio, { segmentSubdivisions: this.getConnectionSubdivisions() });
	},
	getTangentAtLength: function(length$1) {
		var path = this.path;
		if (!path) return null;
		return path.tangentAtLength(length$1, { segmentSubdivisions: this.getConnectionSubdivisions() });
	},
	getTangentAtRatio: function(ratio) {
		var path = this.path;
		if (!path) return null;
		return path.tangentAt(ratio, { segmentSubdivisions: this.getConnectionSubdivisions() });
	},
	getClosestPoint: function(point$1) {
		var path = this.path;
		if (!path) return null;
		return path.closestPoint(point$1, { segmentSubdivisions: this.getConnectionSubdivisions() });
	},
	getClosestPointLength: function(point$1) {
		var path = this.path;
		if (!path) return null;
		return path.closestPointLength(point$1, { segmentSubdivisions: this.getConnectionSubdivisions() });
	},
	getClosestPointRatio: function(point$1) {
		var path = this.path;
		if (!path) return null;
		return path.closestPointNormalizedLength(point$1, { segmentSubdivisions: this.getConnectionSubdivisions() });
	},
	getLabelPosition: function(x, y, p3, p4) {
		var position$1 = {};
		var localAngle = 0;
		var localOpt;
		if (typeof p3 === "number") {
			localAngle = p3;
			localOpt = p4;
		} else localOpt = p3;
		if (localOpt) position$1.args = localOpt;
		var isDistanceRelative = !(localOpt && localOpt.absoluteDistance);
		var isDistanceAbsoluteReverse = localOpt && localOpt.absoluteDistance && localOpt.reverseDistance;
		var isOffsetAbsolute = localOpt && localOpt.absoluteOffset;
		var path = this.path;
		var pathOpt = { segmentSubdivisions: this.getConnectionSubdivisions() };
		var labelPoint = new Point(x, y);
		var t = path.closestPointT(labelPoint, pathOpt);
		var labelDistance = path.lengthAtT(t, pathOpt);
		if (isDistanceRelative) labelDistance = labelDistance / this.getConnectionLength() || 0;
		if (isDistanceAbsoluteReverse) labelDistance = -1 * (this.getConnectionLength() - labelDistance) || 1;
		position$1.distance = labelDistance;
		var tangent;
		if (!isOffsetAbsolute) tangent = path.tangentAtT(t);
		var labelOffset;
		if (tangent) labelOffset = tangent.pointOffset(labelPoint);
		else {
			var closestPoint = path.pointAtT(t);
			var labelOffsetDiff = labelPoint.difference(closestPoint);
			labelOffset = {
				x: labelOffsetDiff.x,
				y: labelOffsetDiff.y
			};
		}
		position$1.offset = labelOffset;
		position$1.angle = localAngle;
		return position$1;
	},
	_getLabelTransformationMatrix: function(labelPosition) {
		var labelDistance;
		var labelAngle = 0;
		var args = {};
		if (typeof labelPosition === "number") labelDistance = labelPosition;
		else if (typeof labelPosition.distance === "number") {
			args = labelPosition.args || {};
			labelDistance = labelPosition.distance;
			labelAngle = labelPosition.angle || 0;
		} else throw new Error("dia.LinkView: invalid label position distance.");
		var isDistanceRelative = labelDistance > 0 && labelDistance <= 1;
		var labelOffset = 0;
		var labelOffsetCoordinates = {
			x: 0,
			y: 0
		};
		if (labelPosition.offset) {
			var positionOffset = labelPosition.offset;
			if (typeof positionOffset === "number") labelOffset = positionOffset;
			if (positionOffset.x) labelOffsetCoordinates.x = positionOffset.x;
			if (positionOffset.y) labelOffsetCoordinates.y = positionOffset.y;
		}
		var isOffsetAbsolute = labelOffsetCoordinates.x !== 0 || labelOffsetCoordinates.y !== 0 || labelOffset === 0;
		var isKeepGradient = args.keepGradient;
		var isEnsureLegibility = args.ensureLegibility;
		var path = this.path;
		var pathOpt = { segmentSubdivisions: this.getConnectionSubdivisions() };
		var distance = isDistanceRelative ? labelDistance * this.getConnectionLength() : labelDistance;
		var tangent = path.tangentAtLength(distance, pathOpt);
		var translation;
		var angle = labelAngle;
		if (tangent) {
			if (isOffsetAbsolute) {
				translation = tangent.start.clone();
				translation.offset(labelOffsetCoordinates);
			} else {
				var normal$2 = tangent.clone();
				normal$2.rotate(tangent.start, -90);
				normal$2.setLength(labelOffset);
				translation = normal$2.end;
			}
			if (isKeepGradient) {
				angle = tangent.angle() + labelAngle;
				if (isEnsureLegibility) angle = normalizeAngle((angle + 90) % 180 - 90);
			}
		} else {
			translation = path.start.clone();
			if (isOffsetAbsolute) translation.offset(labelOffsetCoordinates);
		}
		return V_default.createSVGMatrix().translate(translation.x, translation.y).rotate(angle);
	},
	getLabelCoordinates: function(labelPosition) {
		var transformationMatrix = this._getLabelTransformationMatrix(labelPosition);
		return new Point(transformationMatrix.e, transformationMatrix.f);
	},
	getVertexIndex: function(x, y) {
		var model = this.model;
		var vertices = model.vertices();
		var vertexLength = this.getClosestPointLength(new Point(x, y));
		var idx = 0;
		for (var n = vertices.length; idx < n; idx++) {
			var currentVertex = vertices[idx];
			var currentVertexLength = this.getClosestPointLength(currentVertex);
			if (vertexLength < currentVertexLength) break;
		}
		return idx;
	},
	notifyPointerdown(evt, x, y) {
		CellView.prototype.pointerdown.call(this, evt, x, y);
		this.notify("link:pointerdown", evt, x, y);
	},
	notifyPointermove(evt, x, y) {
		CellView.prototype.pointermove.call(this, evt, x, y);
		this.notify("link:pointermove", evt, x, y);
	},
	notifyPointerup(evt, x, y) {
		this.notify("link:pointerup", evt, x, y);
		CellView.prototype.pointerup.call(this, evt, x, y);
	},
	pointerdblclick: function(evt, x, y) {
		CellView.prototype.pointerdblclick.apply(this, arguments);
		this.notify("link:pointerdblclick", evt, x, y);
	},
	pointerclick: function(evt, x, y) {
		CellView.prototype.pointerclick.apply(this, arguments);
		this.notify("link:pointerclick", evt, x, y);
	},
	contextmenu: function(evt, x, y) {
		CellView.prototype.contextmenu.apply(this, arguments);
		this.notify("link:contextmenu", evt, x, y);
	},
	pointerdown: function(evt, x, y) {
		this.notifyPointerdown(evt, x, y);
		this.dragStart(evt, x, y);
	},
	pointermove: function(evt, x, y) {
		var dragData = this._dragData;
		if (dragData) this.eventData(evt, dragData);
		var data$1 = this.eventData(evt);
		switch (data$1.action) {
			case "label-move":
				this.dragLabel(evt, x, y);
				break;
			case "arrowhead-move":
				this.dragArrowhead(evt, x, y);
				break;
			case "move":
				this.drag(evt, x, y);
				break;
		}
		if (dragData) assign(dragData, this.eventData(evt));
		this.notifyPointermove(evt, x, y);
	},
	pointerup: function(evt, x, y) {
		var dragData = this._dragData;
		if (dragData) {
			this.eventData(evt, dragData);
			this._dragData = null;
		}
		var data$1 = this.eventData(evt);
		switch (data$1.action) {
			case "label-move":
				this.dragLabelEnd(evt, x, y);
				break;
			case "arrowhead-move":
				this.dragArrowheadEnd(evt, x, y);
				break;
			case "move": this.dragEnd(evt, x, y);
		}
		this.notifyPointerup(evt, x, y);
		this.checkMouseleave(evt);
	},
	mouseover: function(evt) {
		CellView.prototype.mouseover.apply(this, arguments);
		this.notify("link:mouseover", evt);
	},
	mouseout: function(evt) {
		CellView.prototype.mouseout.apply(this, arguments);
		this.notify("link:mouseout", evt);
	},
	mouseenter: function(evt) {
		CellView.prototype.mouseenter.apply(this, arguments);
		this.notify("link:mouseenter", evt);
	},
	mouseleave: function(evt) {
		CellView.prototype.mouseleave.apply(this, arguments);
		this.notify("link:mouseleave", evt);
	},
	mousewheel: function(evt, x, y, delta) {
		CellView.prototype.mousewheel.apply(this, arguments);
		this.notify("link:mousewheel", evt, x, y, delta);
	},
	onlabel: function(evt, x, y) {
		this.notifyPointerdown(evt, x, y);
		this.dragLabelStart(evt, x, y);
		var stopPropagation = this.eventData(evt).stopPropagation;
		if (stopPropagation) evt.stopPropagation();
	},
	dragLabelStart: function(evt, x, y) {
		if (this.can("labelMove")) {
			if (this.isDefaultInteractionPrevented(evt)) return;
			var labelNode = evt.currentTarget;
			var labelIdx = parseInt(labelNode.getAttribute("label-idx"), 10);
			var defaultLabelPosition = this._getDefaultLabelPositionProperty();
			var initialLabelPosition = this._normalizeLabelPosition(this._getLabelPositionProperty(labelIdx));
			var position$1 = this._mergeLabelPositionProperty(initialLabelPosition, defaultLabelPosition);
			var coords = this.getLabelCoordinates(position$1);
			var dx = coords.x - x;
			var dy = coords.y - y;
			var positionAngle = this._getLabelPositionAngle(labelIdx);
			var labelPositionArgs = this._getLabelPositionArgs(labelIdx);
			var defaultLabelPositionArgs = this._getDefaultLabelPositionArgs();
			var positionArgs = this._mergeLabelPositionArgs(labelPositionArgs, defaultLabelPositionArgs);
			this.eventData(evt, {
				action: "label-move",
				labelIdx,
				dx,
				dy,
				positionAngle,
				positionArgs,
				stopPropagation: true
			});
		} else this.eventData(evt, { stopPropagation: true });
		this.paper.delegateDragEvents(this, evt.data);
	},
	dragArrowheadStart: function(evt, x, y) {
		if (!this.can("arrowheadMove")) return;
		var arrowheadNode = evt.target;
		var arrowheadType = arrowheadNode.getAttribute("end");
		var data$1 = this.startArrowheadMove(arrowheadType, { ignoreBackwardsCompatibility: true });
		this.eventData(evt, data$1);
	},
	dragStart: function(evt, x, y) {
		if (this.isDefaultInteractionPrevented(evt)) return;
		if (!this.can("linkMove")) return;
		this.eventData(evt, {
			action: "move",
			dx: x,
			dy: y
		});
	},
	dragLabel: function(evt, x, y) {
		var data$1 = this.eventData(evt);
		var label = { position: this.getLabelPosition(x + data$1.dx, y + data$1.dy, data$1.positionAngle, data$1.positionArgs) };
		if (this.paper.options.snapLabels) delete label.position.offset;
		const setOptions$1 = { ui: true };
		if (this.paper.isAsync() && evt.type === "touchmove") setOptions$1.async = false;
		this.model.label(data$1.labelIdx, label, setOptions$1);
	},
	dragArrowhead: function(evt, x, y) {
		if (this.paper.options.snapLinks) {
			const isSnapped = this._snapArrowhead(evt, x, y);
			if (!isSnapped && this.paper.options.snapLinksSelf) this._snapArrowheadSelf(evt, x, y);
		} else if (this.paper.options.snapLinksSelf) this._snapArrowheadSelf(evt, x, y);
		else this._connectArrowhead(this.getEventTarget(evt), x, y, this.eventData(evt));
	},
	drag: function(evt, x, y) {
		var data$1 = this.eventData(evt);
		this.model.translate(x - data$1.dx, y - data$1.dy, { ui: true });
		this.eventData(evt, {
			dx: x,
			dy: y
		});
	},
	dragLabelEnd: function() {},
	dragArrowheadEnd: function(evt, x, y) {
		var data$1 = this.eventData(evt);
		var paper = this.paper;
		if (paper.options.snapLinks) this._snapArrowheadEnd(data$1);
		else this._connectArrowheadEnd(data$1, x, y);
		if (!paper.linkAllowed(this)) this._disallow(data$1);
		else {
			this._finishEmbedding(data$1);
			this._notifyConnectEvent(data$1, evt);
		}
		this._afterArrowheadMove(data$1);
	},
	dragEnd: function() {},
	_disallow: function(data$1) {
		switch (data$1.whenNotAllowed) {
			case "remove":
				this.model.remove({ ui: true });
				break;
			case "revert":
			default:
				this.model.set(data$1.arrowhead, data$1.initialEnd, { ui: true });
				break;
		}
	},
	_finishEmbedding: function(data$1) {
		if (this.paper.options.embeddingMode && this.model.reparent()) data$1.z = null;
	},
	_notifyConnectEvent: function(data$1, evt) {
		var arrowhead = data$1.arrowhead;
		var initialEnd = data$1.initialEnd;
		var currentEnd = this.model.prop(arrowhead);
		var endChanged = currentEnd && !Link.endsEqual(initialEnd, currentEnd);
		if (endChanged) {
			var paper = this.paper;
			if (initialEnd.id) this.notify("link:disconnect", evt, paper.findViewByModel(initialEnd.id), data$1.initialMagnet, arrowhead);
			if (currentEnd.id) this.notify("link:connect", evt, paper.findViewByModel(currentEnd.id), data$1.magnetUnderPointer, arrowhead);
		}
	},
	_snapToPoints: function(snapPoint, points, radius) {
		let closestPointX = null;
		let closestDistanceX = Infinity;
		let closestPointY = null;
		let closestDistanceY = Infinity;
		let x = snapPoint.x;
		let y = snapPoint.y;
		for (let i = 0; i < points.length; i++) {
			const distX = Math.abs(points[i].x - snapPoint.x);
			if (distX < closestDistanceX) {
				closestDistanceX = distX;
				closestPointX = points[i];
			}
			const distY = Math.abs(points[i].y - snapPoint.y);
			if (distY < closestDistanceY) {
				closestDistanceY = distY;
				closestPointY = points[i];
			}
		}
		if (closestDistanceX < radius) x = closestPointX.x;
		if (closestDistanceY < radius) y = closestPointY.y;
		return {
			x,
			y
		};
	},
	_snapArrowheadSelf: function(evt, x, y) {
		const { paper, model } = this;
		const { snapLinksSelf } = paper.options;
		const data$1 = this.eventData(evt);
		const radius = snapLinksSelf.radius || 20;
		const anchor$1 = this.getEndAnchor(data$1.arrowhead === "source" ? "target" : "source");
		const vertices = model.vertices();
		const points = [anchor$1, ...vertices];
		const snapPoint = this._snapToPoints({
			x,
			y
		}, points, radius);
		const point$1 = paper.localToClientPoint(snapPoint);
		this._connectArrowhead(document.elementFromPoint(point$1.x, point$1.y), snapPoint.x, snapPoint.y, this.eventData(evt));
	},
	_snapArrowhead: function(evt, x, y) {
		const { paper } = this;
		const { snapLinks, connectionStrategy } = paper.options;
		const data$1 = this.eventData(evt);
		let isSnapped = false;
		var r = snapLinks.radius || 50;
		var viewsInArea = paper.findElementViewsInArea({
			x: x - r,
			y: y - r,
			width: 2 * r,
			height: 2 * r
		}, snapLinks.findInAreaOptions);
		var prevClosestView = data$1.closestView || null;
		var prevClosestMagnet = data$1.closestMagnet || null;
		var prevMagnetProxy = data$1.magnetProxy || null;
		data$1.closestView = data$1.closestMagnet = data$1.magnetProxy = null;
		var minDistance = Number.MAX_VALUE;
		var pointer = new Point(x, y);
		viewsInArea.forEach(function(view) {
			const candidates = [];
			if (view.el.getAttribute("magnet") !== "false") candidates.push({
				bbox: view.model.getBBox(),
				magnet: view.el
			});
			view.$("[magnet]").toArray().forEach((magnet) => {
				candidates.push({
					bbox: view.getNodeBBox(magnet),
					magnet
				});
			});
			candidates.forEach((candidate) => {
				const { magnet, bbox: bbox$1 } = candidate;
				const distance = bbox$1.center().squaredDistance(pointer);
				if (distance < minDistance) {
					const isAlreadyValidated = prevClosestMagnet === magnet;
					if (isAlreadyValidated || paper.options.validateConnection.apply(paper, data$1.validateConnectionArgs(view, view.el === magnet ? null : magnet))) {
						minDistance = distance;
						data$1.closestView = view;
						data$1.closestMagnet = magnet;
					}
				}
			});
		}, this);
		var end;
		var magnetProxy = null;
		var closestView = data$1.closestView;
		var closestMagnet = data$1.closestMagnet;
		if (closestMagnet) magnetProxy = data$1.magnetProxy = closestView.findProxyNode(closestMagnet, "highlighter");
		var endType = data$1.arrowhead;
		var newClosestMagnet = prevClosestMagnet !== closestMagnet;
		if (prevClosestView && newClosestMagnet) prevClosestView.unhighlight(prevMagnetProxy, {
			connecting: true,
			snapping: true
		});
		if (closestView) {
			const { prevEnd, prevX, prevY } = data$1;
			data$1.prevX = x;
			data$1.prevY = y;
			isSnapped = true;
			if (!newClosestMagnet) {
				if (typeof connectionStrategy !== "function" || prevX === x && prevY === y) return isSnapped;
			}
			end = closestView.getLinkEnd(closestMagnet, x, y, this.model, endType);
			if (!newClosestMagnet && isEqual(prevEnd, end)) return isSnapped;
			data$1.prevEnd = end;
			if (newClosestMagnet) closestView.highlight(magnetProxy, {
				connecting: true,
				snapping: true
			});
		} else end = {
			x,
			y
		};
		this.model.set(endType, end || {
			x,
			y
		}, { ui: true });
		if (prevClosestView) this.notify("link:snap:disconnect", evt, prevClosestView, prevClosestMagnet, endType);
		if (closestView) this.notify("link:snap:connect", evt, closestView, closestMagnet, endType);
		return isSnapped;
	},
	_snapArrowheadEnd: function(data$1) {
		var closestView = data$1.closestView;
		var closestMagnet = data$1.closestMagnet;
		if (closestView && closestMagnet) {
			closestView.unhighlight(data$1.magnetProxy, {
				connecting: true,
				snapping: true
			});
			data$1.magnetUnderPointer = closestView.findMagnet(closestMagnet);
		}
		data$1.closestView = data$1.closestMagnet = null;
	},
	_connectArrowhead: function(target, x, y, data$1) {
		const { paper, model } = this;
		if (data$1.eventTarget !== target) {
			if (data$1.magnetProxy) data$1.viewUnderPointer.unhighlight(data$1.magnetProxy, { connecting: true });
			const viewUnderPointer = data$1.viewUnderPointer = paper.findView(target);
			if (viewUnderPointer) {
				const magnetUnderPointer = data$1.magnetUnderPointer = viewUnderPointer.findMagnet(target);
				const magnetProxy = data$1.magnetProxy = viewUnderPointer.findProxyNode(magnetUnderPointer, "highlighter");
				if (magnetUnderPointer && this.paper.options.validateConnection.apply(paper, data$1.validateConnectionArgs(viewUnderPointer, magnetUnderPointer))) {
					if (magnetProxy) viewUnderPointer.highlight(magnetProxy, { connecting: true });
				} else {
					data$1.magnetUnderPointer = null;
					data$1.magnetProxy = null;
				}
			} else {
				data$1.magnetUnderPointer = null;
				data$1.magnetProxy = null;
			}
		}
		data$1.eventTarget = target;
		model.set(data$1.arrowhead, {
			x,
			y
		}, { ui: true });
	},
	_connectArrowheadEnd: function(data$1 = {}, x, y) {
		const { model } = this;
		const { viewUnderPointer, magnetUnderPointer, magnetProxy, arrowhead } = data$1;
		if (!magnetUnderPointer || !magnetProxy || !viewUnderPointer) return;
		viewUnderPointer.unhighlight(magnetProxy, { connecting: true });
		const end = viewUnderPointer.getLinkEnd(magnetUnderPointer, x, y, model, arrowhead);
		model.set(arrowhead, end, { ui: true });
	},
	_beforeArrowheadMove: function(data$1) {
		data$1.z = this.model.get("z");
		this.model.toFront();
		var style = this.el.style;
		data$1.pointerEvents = style.pointerEvents;
		style.pointerEvents = "none";
		if (this.paper.options.markAvailable) this._markAvailableMagnets(data$1);
	},
	_afterArrowheadMove: function(data$1) {
		if (data$1.z !== null) {
			this.model.set("z", data$1.z, { ui: true });
			data$1.z = null;
		}
		this.el.style.pointerEvents = data$1.pointerEvents;
		if (this.paper.options.markAvailable) this._unmarkAvailableMagnets(data$1);
	},
	_createValidateConnectionArgs: function(arrowhead) {
		var args = [];
		args[4] = arrowhead;
		args[5] = this;
		var oppositeArrowhead;
		var i = 0;
		var j = 0;
		if (arrowhead === "source") {
			i = 2;
			oppositeArrowhead = "target";
		} else {
			j = 2;
			oppositeArrowhead = "source";
		}
		var end = this.model.get(oppositeArrowhead);
		if (end.id) {
			var view = args[i] = this.paper.findViewByModel(end.id);
			var magnet = view.getMagnetFromLinkEnd(end);
			if (magnet === view.el) magnet = void 0;
			args[i + 1] = magnet;
		}
		function validateConnectionArgs(cellView, magnet$1) {
			args[j] = cellView;
			args[j + 1] = cellView.el === magnet$1 ? void 0 : magnet$1;
			return args;
		}
		return validateConnectionArgs;
	},
	_markAvailableMagnets: function(data$1) {
		function isMagnetAvailable(view$1, magnet) {
			var paper$1 = view$1.paper;
			var validate = paper$1.options.validateConnection;
			return validate.apply(paper$1, this.validateConnectionArgs(view$1, magnet));
		}
		var paper = this.paper;
		var elements = paper.model.getCells();
		data$1.marked = {};
		for (var i = 0, n = elements.length; i < n; i++) {
			var view = elements[i].findView(paper);
			if (!view) continue;
			var magnets = Array.prototype.slice.call(view.el.querySelectorAll("[magnet]"));
			if (view.el.getAttribute("magnet") !== "false") magnets.push(view.el);
			var availableMagnets = magnets.filter(isMagnetAvailable.bind(data$1, view));
			if (availableMagnets.length > 0) {
				for (var j = 0, m = availableMagnets.length; j < m; j++) view.highlight(availableMagnets[j], { magnetAvailability: true });
				view.highlight(null, { elementAvailability: true });
				data$1.marked[view.model.id] = availableMagnets;
			}
		}
	},
	_unmarkAvailableMagnets: function(data$1) {
		var markedKeys = Object.keys(data$1.marked);
		var id;
		var markedMagnets;
		for (var i = 0, n = markedKeys.length; i < n; i++) {
			id = markedKeys[i];
			markedMagnets = data$1.marked[id];
			var view = this.paper.findViewByModel(id);
			if (view) {
				for (var j = 0, m = markedMagnets.length; j < m; j++) view.unhighlight(markedMagnets[j], { magnetAvailability: true });
				view.unhighlight(null, { elementAvailability: true });
			}
		}
		data$1.marked = null;
	},
	startArrowheadMove: function(end, opt) {
		opt || (opt = {});
		var data$1 = {
			action: "arrowhead-move",
			arrowhead: end,
			whenNotAllowed: opt.whenNotAllowed || "revert",
			initialMagnet: this[end + "Magnet"] || (this[end + "View"] ? this[end + "View"].el : null),
			initialEnd: clone(this.model.get(end)),
			validateConnectionArgs: this._createValidateConnectionArgs(end)
		};
		this._beforeArrowheadMove(data$1);
		if (opt.ignoreBackwardsCompatibility !== true) this._dragData = data$1;
		return data$1;
	},
	onMount: function() {
		CellView.prototype.onMount.apply(this, arguments);
		this.mountLabels();
	},
	onDetach: function() {
		CellView.prototype.onDetach.apply(this, arguments);
		this.unmountLabels();
	},
	onRemove: function() {
		CellView.prototype.onRemove.apply(this, arguments);
		this.unmountLabels();
	}
}, { Flags });
Object.defineProperty(LinkView.prototype, "sourceBBox", {
	enumerable: true,
	get: function() {
		var sourceView = this.sourceView;
		if (!sourceView) {
			var sourceDef = this.model.source();
			return new Rect(sourceDef.x, sourceDef.y);
		}
		var sourceMagnet = this.sourceMagnet;
		if (sourceView.isNodeConnection(sourceMagnet)) return new Rect(this.sourceAnchor);
		return sourceView.getNodeBBox(sourceMagnet || sourceView.el);
	}
});
Object.defineProperty(LinkView.prototype, "targetBBox", {
	enumerable: true,
	get: function() {
		var targetView = this.targetView;
		if (!targetView) {
			var targetDef = this.model.target();
			return new Rect(targetDef.x, targetDef.y);
		}
		var targetMagnet = this.targetMagnet;
		if (targetView.isNodeConnection(targetMagnet)) return new Rect(this.targetAnchor);
		return targetView.getNodeBBox(targetMagnet || targetView.el);
	}
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/layers/GridLayer.mjs
const GridLayer = PaperLayer.extend({
	style: { "pointer-events": "none" },
	_gridCache: null,
	_gridSettings: null,
	init() {
		PaperLayer.prototype.init.apply(this, arguments);
		const { options: { paper } } = this;
		this._gridCache = null;
		this._gridSettings = [];
		this.listenTo(paper, "transform resize", this.updateGrid);
	},
	setGrid(drawGrid) {
		this._gridSettings = this.getGridSettings(drawGrid);
		this.renderGrid();
	},
	getGridSettings(drawGrid) {
		const gridSettings = [];
		if (drawGrid) {
			const optionsList = Array.isArray(drawGrid) ? drawGrid : [drawGrid || {}];
			optionsList.forEach((item) => {
				gridSettings.push(...this._resolveDrawGridOption(item));
			});
		}
		return gridSettings;
	},
	removeGrid() {
		const { _gridCache: grid } = this;
		if (!grid) return;
		grid.root.remove();
		this._gridCache = null;
	},
	renderGrid() {
		const { options: { paper } } = this;
		const { _gridSettings: gridSettings } = this;
		this.removeGrid();
		if (gridSettings.length === 0) return;
		const gridSize = paper.options.drawGridSize || paper.options.gridSize;
		if (gridSize <= 1) return;
		const refs = this._getGridRefs();
		gridSettings.forEach((gridLayerSetting, index) => {
			const id = this._getPatternId(index);
			const options = merge({}, gridLayerSetting);
			const { scaleFactor = 1 } = options;
			options.width = gridSize * scaleFactor || 1;
			options.height = gridSize * scaleFactor || 1;
			let vPattern;
			if (!refs.exist(id)) {
				vPattern = V_default("pattern", {
					id,
					patternUnits: "userSpaceOnUse"
				}, V_default(options.markup));
				refs.add(id, vPattern);
			} else vPattern = refs.get(id);
			if (isFunction(options.render)) options.render(vPattern.node.firstChild, options, paper);
			vPattern.attr({
				width: options.width,
				height: options.height
			});
		});
		refs.root.appendTo(this.el);
		this.updateGrid();
	},
	updateGrid() {
		const { _gridCache: grid, _gridSettings: gridSettings, options: { paper } } = this;
		if (!grid) return;
		const { root: vSvg, patterns } = grid;
		const { x, y, width: width$1, height: height$1 } = paper.getArea();
		vSvg.attr({
			x,
			y,
			width: width$1,
			height: height$1
		});
		for (const patternId in patterns) {
			const vPattern = patterns[patternId];
			vPattern.attr({
				x: -x,
				y: -y
			});
		}
		gridSettings.forEach((options, index) => {
			if (isFunction(options.update)) {
				const vPattern = patterns[this._getPatternId(index)];
				options.update(vPattern.node.firstChild, options, paper);
			}
		});
	},
	_getPatternId(index) {
		return `pattern_${this.options.paper.cid}_${index}`;
	},
	_getGridRefs() {
		let { _gridCache: grid } = this;
		if (grid) return grid;
		const defsVEl = V_default("defs");
		const svgVEl = V_default("svg", {
			width: "100%",
			height: "100%"
		}, [defsVEl]);
		grid = this._gridCache = {
			root: svgVEl,
			patterns: {},
			add: function(id, patternVEl) {
				const rectVEl = V_default("rect", {
					width: "100%",
					height: "100%",
					fill: `url(#${id})`
				});
				defsVEl.append(patternVEl);
				svgVEl.append(rectVEl);
				this.patterns[id] = patternVEl;
			},
			get: function(id) {
				return this.patterns[id];
			},
			exist: function(id) {
				return this.patterns[id] !== void 0;
			}
		};
		return grid;
	},
	_resolveDrawGridOption(opt) {
		var namespace = this.options.patterns;
		if (isString(opt) && Array.isArray(namespace[opt])) return namespace[opt].map(function(item) {
			return assign({}, item);
		});
		var options = opt || { args: [{}] };
		var isArray = Array.isArray(options);
		var name = options.name;
		if (!isArray && !name && !options.markup) name = "dot";
		if (name && Array.isArray(namespace[name])) {
			var pattern = namespace[name].map(function(item) {
				return assign({}, item);
			});
			var args = Array.isArray(options.args) ? options.args : [options.args || {}];
			defaults(args[0], omit(opt, "args"));
			for (var i = 0; i < args.length; i++) if (pattern[i]) assign(pattern[i], args[i]);
			return pattern;
		}
		return isArray ? options : [options];
	}
});

//#endregion
//#region ../../node_modules/.pnpm/@joint+core@4.1.3/node_modules/@joint/core/src/dia/Paper.mjs
const sortingTypes = {
	NONE: "sorting-none",
	APPROX: "sorting-approximate",
	EXACT: "sorting-exact"
};
const WHEEL_CAP = 50;
const WHEEL_WAIT_MS = 20;
const MOUNT_BATCH_SIZE = 1e3;
const UPDATE_BATCH_SIZE = Infinity;
const MIN_PRIORITY = 9007199254740991;
const HighlightingTypes = CellView.Highlighting;
const defaultHighlighting = {
	[HighlightingTypes.DEFAULT]: {
		name: "stroke",
		options: { padding: 3 }
	},
	[HighlightingTypes.MAGNET_AVAILABILITY]: {
		name: "addClass",
		options: { className: "available-magnet" }
	},
	[HighlightingTypes.ELEMENT_AVAILABILITY]: {
		name: "addClass",
		options: { className: "available-cell" }
	}
};
const defaultLayers = [
	{ name: LayersNames.GRID },
	{ name: LayersNames.BACK },
	{ name: LayersNames.CELLS },
	{ name: LayersNames.LABELS },
	{ name: LayersNames.FRONT },
	{ name: LayersNames.TOOLS }
];
const Paper = View.extend({
	className: "paper",
	options: {
		width: 800,
		height: 600,
		gridSize: 1,
		drawGrid: false,
		drawGridSize: null,
		background: false,
		elementView: ElementView,
		linkView: LinkView,
		snapLabels: false,
		snapLinks: false,
		snapLinksSelf: false,
		labelsLayer: false,
		multiLinks: true,
		guard: function(evt, view) {
			return false;
		},
		highlighting: defaultHighlighting,
		preventContextMenu: true,
		preventDefaultBlankAction: true,
		preventDefaultViewAction: true,
		restrictTranslate: false,
		markAvailable: false,
		defaultLink: function() {
			const { cellNamespace } = this.model.get("cells");
			const ctor = getByPath(cellNamespace, ["standard", "Link"]);
			if (!ctor) throw new Error("dia.Paper: no default link model found. Use `options.defaultLink` to specify a default link model.");
			return new ctor();
		},
		defaultConnector: { name: "normal" },
		defaultRouter: { name: "normal" },
		defaultAnchor: { name: "center" },
		defaultLinkAnchor: { name: "connectionRatio" },
		defaultConnectionPoint: { name: "boundary" },
		connectionStrategy: null,
		validateMagnet: function(_cellView, magnet, _evt) {
			return magnet.getAttribute("magnet") !== "passive";
		},
		validateConnection: function(cellViewS, _magnetS, cellViewT, _magnetT, end, _linkView) {
			return (end === "target" ? cellViewT : cellViewS) instanceof ElementView;
		},
		embeddingMode: false,
		validateEmbedding: function(childView, parentView) {
			return true;
		},
		validateUnembedding: function(childView) {
			return true;
		},
		findParentBy: "bbox",
		frontParentOnly: true,
		interactive: { labelMove: false },
		linkPinning: true,
		allowLink: null,
		clickThreshold: 0,
		moveThreshold: 0,
		magnetThreshold: 0,
		sorting: sortingTypes.APPROX,
		frozen: false,
		autoFreeze: false,
		onViewUpdate: function(view, flag, priority, opt, paper) {
			if (flag & (view.FLAG_INSERT | view.FLAG_REMOVE) || opt.mounting || opt.isolate) return;
			paper.requestConnectedLinksUpdate(view, priority, opt);
		},
		onViewPostponed: function(view, flag, paper) {
			return paper.forcePostponedViewUpdate(view, flag);
		},
		beforeRender: null,
		afterRender: null,
		viewport: null,
		cellViewNamespace: null,
		routerNamespace: null,
		connectorNamespace: null,
		highlighterNamespace: highlighters_exports,
		anchorNamespace: anchors_exports,
		linkAnchorNamespace: linkAnchors_exports,
		connectionPointNamespace: connectionPoints_exports,
		overflow: false
	},
	events: {
		"dblclick": "pointerdblclick",
		"dbltap": "pointerdblclick",
		"contextmenu": "contextmenu",
		"mousedown": "pointerdown",
		"touchstart": "pointerdown",
		"mouseover": "mouseover",
		"mouseout": "mouseout",
		"mouseenter": "mouseenter",
		"mouseleave": "mouseleave",
		"wheel": "mousewheel",
		"mouseenter .joint-cell": "mouseenter",
		"mouseleave .joint-cell": "mouseleave",
		"mouseenter .joint-tools": "mouseenter",
		"mouseleave .joint-tools": "mouseleave",
		"dblclick .joint-cell [magnet]": "magnetpointerdblclick",
		"contextmenu .joint-cell [magnet]": "magnetcontextmenu",
		"mousedown .joint-link .label": "onlabel",
		"touchstart .joint-link .label": "onlabel",
		"dragstart .joint-cell image": "onImageDragStart"
	},
	documentEvents: {
		"mousemove": "pointermove",
		"touchmove": "pointermove",
		"mouseup": "pointerup",
		"touchend": "pointerup",
		"touchcancel": "pointerup"
	},
	stylesheet: `
        .joint-element .scalable * {
            vector-effect: non-scaling-stroke;
        }
    `,
	svg: null,
	viewport: null,
	defs: null,
	tools: null,
	layers: null,
	_viewportMatrix: null,
	_viewportTransformString: null,
	_updates: null,
	_layers: null,
	SORT_DELAYING_BATCHES: [
		"add",
		"to-front",
		"to-back"
	],
	UPDATE_DELAYING_BATCHES: ["translate"],
	FORM_CONTROL_TAG_NAMES: [
		"TEXTAREA",
		"INPUT",
		"BUTTON",
		"SELECT",
		"OPTION"
	],
	GUARDED_TAG_NAMES: ["SELECT"],
	MIN_SCALE: 1e-6,
	DEFAULT_FIND_BUFFER: 200,
	init: function() {
		const { options } = this;
		if (!options.cellViewNamespace) options.cellViewNamespace = typeof joint !== "undefined" && has(joint, "shapes") ? joint.shapes : null;
		const model = this.model = options.model || new Graph();
		this._layers = {};
		this.cloneOptions();
		this.render();
		this._setDimensions();
		this.startListening();
		this._views = {};
		this._mw_evt_buffer = {
			event: null,
			deltas: []
		};
		this.resetViews(model.attributes.cells.models);
		if (!this.isFrozen() && this.isAsync()) this.updateViewsAsync();
	},
	_resetUpdates: function() {
		if (this._updates && this._updates.id) cancelFrame(this._updates.id);
		return this._updates = {
			id: null,
			priorities: [
				{},
				{},
				{}
			],
			unmountedCids: [],
			mountedCids: [],
			unmounted: {},
			mounted: {},
			count: 0,
			keyFrozen: false,
			freezeKey: null,
			sort: false,
			disabled: false,
			idle: false
		};
	},
	startListening: function() {
		var model = this.model;
		this.listenTo(model, "add", this.onCellAdded).listenTo(model, "remove", this.onCellRemoved).listenTo(model, "change", this.onCellChange).listenTo(model, "reset", this.onGraphReset).listenTo(model, "sort", this.onGraphSort).listenTo(model, "batch:stop", this.onGraphBatchStop);
		this.on("cell:highlight", this.onCellHighlight).on("cell:unhighlight", this.onCellUnhighlight).on("transform", this.update);
	},
	onCellAdded: function(cell, _, opt) {
		var position$1 = opt.position;
		if (this.isAsync() || !isNumber(position$1)) this.renderView(cell, opt);
		else {
			if (opt.maxPosition === position$1) this.freeze({ key: "addCells" });
			this.renderView(cell, opt);
			if (position$1 === 0) this.unfreeze({ key: "addCells" });
		}
	},
	onCellRemoved: function(cell, _, opt) {
		const view = this.findViewByModel(cell);
		if (view) this.requestViewUpdate(view, view.FLAG_REMOVE, view.UPDATE_PRIORITY, opt);
	},
	onCellChange: function(cell, opt) {
		if (cell === this.model.attributes.cells) return;
		if (cell.hasChanged("z") && this.options.sorting === sortingTypes.APPROX) {
			const view = this.findViewByModel(cell);
			if (view) this.requestViewUpdate(view, view.FLAG_INSERT, view.UPDATE_PRIORITY, opt);
		}
	},
	onGraphReset: function(collection, opt) {
		this.resetLayers();
		this.resetViews(collection.models, opt);
	},
	onGraphSort: function() {
		if (this.model.hasActiveBatch(this.SORT_DELAYING_BATCHES)) return;
		this.sortViews();
	},
	onGraphBatchStop: function(data$1) {
		if (this.isFrozen()) return;
		var name = data$1 && data$1.batchName;
		var graph = this.model;
		if (!this.isAsync()) {
			var updateDelayingBatches = this.UPDATE_DELAYING_BATCHES;
			if (updateDelayingBatches.includes(name) && !graph.hasActiveBatch(updateDelayingBatches)) this.updateViews(data$1);
		}
		var sortDelayingBatches = this.SORT_DELAYING_BATCHES;
		if (sortDelayingBatches.includes(name) && !graph.hasActiveBatch(sortDelayingBatches)) this.sortViews();
	},
	cloneOptions: function() {
		const { options } = this;
		const { defaultConnector, defaultRouter, defaultConnectionPoint, defaultAnchor, defaultLinkAnchor, highlighting, cellViewNamespace, interactive } = options;
		if (!cellViewNamespace && typeof joint !== "undefined" && has(joint, "shapes")) options.cellViewNamespace = joint.shapes;
		if (!isFunction(defaultConnector)) options.defaultConnector = cloneDeep(defaultConnector);
		if (!isFunction(defaultRouter)) options.defaultRouter = cloneDeep(defaultRouter);
		if (!isFunction(defaultConnectionPoint)) options.defaultConnectionPoint = cloneDeep(defaultConnectionPoint);
		if (!isFunction(defaultAnchor)) options.defaultAnchor = cloneDeep(defaultAnchor);
		if (!isFunction(defaultLinkAnchor)) options.defaultLinkAnchor = cloneDeep(defaultLinkAnchor);
		if (isPlainObject(interactive)) options.interactive = assign({}, interactive);
		if (isPlainObject(highlighting)) options.highlighting = defaultsDeep({}, highlighting, defaultHighlighting);
	},
	children: function() {
		var ns = V_default.namespace;
		return [{
			namespaceURI: ns.xhtml,
			tagName: "div",
			className: addClassNamePrefix("paper-background"),
			selector: "background",
			style: {
				position: "absolute",
				inset: 0
			}
		}, {
			namespaceURI: ns.svg,
			tagName: "svg",
			attributes: {
				"width": "100%",
				"height": "100%",
				"xmlns:xlink": ns.xlink
			},
			selector: "svg",
			style: {
				position: "absolute",
				inset: 0
			},
			children: [{
				tagName: "defs",
				selector: "defs"
			}, {
				tagName: "g",
				className: addClassNamePrefix("layers"),
				selector: "layers"
			}]
		}];
	},
	hasLayerView(layerName) {
		return layerName in this._layers;
	},
	getLayerView(layerName) {
		const { _layers } = this;
		if (layerName in _layers) return _layers[layerName];
		throw new Error(`dia.Paper: Unknown layer "${layerName}"`);
	},
	getLayerNode(layerName) {
		return this.getLayerView(layerName).el;
	},
	render: function() {
		this.renderChildren();
		const { el, childNodes, options, stylesheet } = this;
		const { svg: svg$1, defs, layers } = childNodes;
		el.style.position = "relative";
		svg$1.style.overflow = options.overflow ? "visible" : "hidden";
		this.svg = svg$1;
		this.defs = defs;
		this.layers = layers;
		this.renderLayers();
		V_default.ensureId(svg$1);
		this.addStylesheet(stylesheet);
		if (options.background) this.drawBackground(options.background);
		if (options.drawGrid) this.setGrid(options.drawGrid);
		return this;
	},
	addStylesheet: function(css$1) {
		if (!css$1) return;
		V_default(this.svg).prepend(V_default.createSVGStyle(css$1));
	},
	createLayer(name) {
		switch (name) {
			case LayersNames.GRID: return new GridLayer({
				name,
				paper: this,
				patterns: this.constructor.gridPatterns
			});
			default: return new PaperLayer({ name });
		}
	},
	renderLayers: function(layers = defaultLayers) {
		this.removeLayers();
		layers.forEach(({ name, sorted }) => {
			const layerView = this.createLayer(name);
			this.layers.appendChild(layerView.el);
			this._layers[name] = layerView;
		});
		const cellsLayerView = this.getLayerView(LayersNames.CELLS);
		const toolsLayerView = this.getLayerView(LayersNames.TOOLS);
		const labelsLayerView = this.getLayerView(LayersNames.LABELS);
		this.tools = toolsLayerView.el;
		this.cells = this.viewport = cellsLayerView.el;
		cellsLayerView.vel.addClass(addClassNamePrefix("viewport"));
		labelsLayerView.vel.addClass(addClassNamePrefix("viewport"));
		cellsLayerView.el.style.webkitUserSelect = "none";
		cellsLayerView.el.style.userSelect = "none";
		labelsLayerView.el.style.webkitUserSelect = "none";
		labelsLayerView.el.style.userSelect = "none";
	},
	removeLayers: function() {
		const { _layers } = this;
		Object.keys(_layers).forEach((name) => {
			_layers[name].remove();
			delete _layers[name];
		});
	},
	resetLayers: function() {
		const { _layers } = this;
		Object.keys(_layers).forEach((name) => {
			_layers[name].removePivots();
		});
	},
	update: function() {
		if (this._background) this.updateBackgroundImage(this._background);
		return this;
	},
	scale: function(sx, sy, data$1) {
		const ctm = this.matrix();
		if (sx === void 0) return V_default.matrixToScale(ctm);
		if (sy === void 0) sy = sx;
		sx = Math.max(sx || 0, this.MIN_SCALE);
		sy = Math.max(sy || 0, this.MIN_SCALE);
		ctm.a = sx;
		ctm.d = sy;
		this.matrix(ctm, data$1);
		return this;
	},
	scaleUniformAtPoint: function(scale$1, point$1, data$1) {
		const { a: sx, d: sy, e: tx, f: ty } = this.matrix();
		scale$1 = Math.max(scale$1 || 0, this.MIN_SCALE);
		if (scale$1 === sx && scale$1 === sy) return this;
		const matrix = V_default.createSVGMatrix().translate(tx - point$1.x * (scale$1 - sx), ty - point$1.y * (scale$1 - sy)).scale(scale$1, scale$1);
		this.matrix(matrix, data$1);
		return this;
	},
	translate: function(tx, ty, data$1) {
		const ctm = this.matrix();
		if (tx === void 0) return V_default.matrixToTranslate(ctm);
		tx || (tx = 0);
		ty || (ty = 0);
		if (ctm.e === tx && ctm.f === ty) return this;
		ctm.e = tx;
		ctm.f = ty;
		this.matrix(ctm, data$1);
		return this;
	},
	matrix: function(ctm, data$1 = {}) {
		var viewport = this.layers;
		if (ctm === void 0) {
			var transformString = viewport.getAttribute("transform");
			if ((this._viewportTransformString || null) === transformString) ctm = this._viewportMatrix;
			else {
				ctm = viewport.getCTM();
				this._viewportMatrix = ctm;
				this._viewportTransformString = transformString;
			}
			return V_default.createSVGMatrix(ctm);
		}
		const prev = this.matrix();
		const current = V_default.createSVGMatrix(ctm);
		const currentTransformString = this._viewportTransformString;
		const ctmString = V_default.matrixToTransformString(current);
		if (ctmString === currentTransformString) return this;
		if (!currentTransformString && V_default.matrixToTransformString() === ctmString) return this;
		const { a, d, e, f } = current;
		viewport.setAttribute("transform", ctmString);
		this._viewportMatrix = current;
		this._viewportTransformString = viewport.getAttribute("transform");
		if (a !== prev.a || d !== prev.d) this.trigger("scale", a, d, data$1);
		if (e !== prev.e || f !== prev.f) this.trigger("translate", e, f, data$1);
		this.trigger("transform", current, data$1);
		return this;
	},
	clientMatrix: function() {
		return V_default.createSVGMatrix(this.cells.getScreenCTM());
	},
	requestConnectedLinksUpdate: function(view, priority, opt) {
		if (view instanceof CellView) {
			var model = view.model;
			var links = this.model.getConnectedLinks(model);
			for (var j = 0, n = links.length; j < n; j++) {
				var link = links[j];
				var linkView = this.findViewByModel(link);
				if (!linkView) continue;
				var flagLabels = ["UPDATE"];
				if (link.getTargetCell() === model) flagLabels.push("TARGET");
				if (link.getSourceCell() === model) flagLabels.push("SOURCE");
				var nextPriority = Math.max(priority + 1, linkView.UPDATE_PRIORITY);
				this.scheduleViewUpdate(linkView, linkView.getFlag(flagLabels), nextPriority, opt);
			}
		}
	},
	forcePostponedViewUpdate: function(view, flag) {
		if (!view || !(view instanceof CellView)) return false;
		var model = view.model;
		if (model.isElement()) return false;
		if ((flag & view.getFlag(["SOURCE", "TARGET"])) === 0) {
			var dumpOptions = { silent: true };
			var sourceFlag = 0;
			var sourceView = this.findViewByModel(model.getSourceCell());
			if (sourceView && !this.isViewMounted(sourceView)) {
				sourceFlag = this.dumpView(sourceView, dumpOptions);
				view.updateEndMagnet("source");
			}
			var targetFlag = 0;
			var targetView = this.findViewByModel(model.getTargetCell());
			if (targetView && !this.isViewMounted(targetView)) {
				targetFlag = this.dumpView(targetView, dumpOptions);
				view.updateEndMagnet("target");
			}
			if (sourceFlag === 0 && targetFlag === 0) return !this.dumpView(view, dumpOptions);
		}
		return false;
	},
	requestViewUpdate: function(view, flag, priority, opt) {
		opt || (opt = {});
		this.scheduleViewUpdate(view, flag, priority, opt);
		var isAsync = this.isAsync();
		if (this.isFrozen() || isAsync && opt.async !== false) return;
		if (this.model.hasActiveBatch(this.UPDATE_DELAYING_BATCHES)) return;
		var stats = this.updateViews(opt);
		if (isAsync) this.notifyAfterRender(stats, opt);
	},
	scheduleViewUpdate: function(view, type, priority, opt) {
		const { _updates: updates, options } = this;
		if (updates.idle) {
			if (options.autoFreeze) {
				updates.idle = false;
				this.unfreeze();
			}
		}
		const { FLAG_REMOVE, FLAG_INSERT, UPDATE_PRIORITY, cid } = view;
		let priorityUpdates = updates.priorities[priority];
		if (!priorityUpdates) priorityUpdates = updates.priorities[priority] = {};
		if (priority > UPDATE_PRIORITY) for (let i = priority - 1; i >= UPDATE_PRIORITY; i--) {
			const prevPriorityUpdates = updates.priorities[i];
			if (!prevPriorityUpdates || !(cid in prevPriorityUpdates)) continue;
			priorityUpdates[cid] |= prevPriorityUpdates[cid];
			delete prevPriorityUpdates[cid];
		}
		let currentType = priorityUpdates[cid] || 0;
		if ((currentType & type) === type) return;
		if (!currentType) updates.count++;
		if (type & FLAG_REMOVE && currentType & FLAG_INSERT) priorityUpdates[cid] ^= FLAG_INSERT;
		else if (type & FLAG_INSERT && currentType & FLAG_REMOVE) priorityUpdates[cid] ^= FLAG_REMOVE;
		priorityUpdates[cid] |= type;
		const viewUpdateFn = options.onViewUpdate;
		if (typeof viewUpdateFn === "function") viewUpdateFn.call(this, view, type, priority, opt || {}, this);
	},
	dumpViewUpdate: function(view) {
		if (!view) return 0;
		var updates = this._updates;
		var cid = view.cid;
		var priorityUpdates = updates.priorities[view.UPDATE_PRIORITY];
		var flag = this.registerMountedView(view) | priorityUpdates[cid];
		delete priorityUpdates[cid];
		return flag;
	},
	dumpView: function(view, opt = {}) {
		const flag = this.dumpViewUpdate(view);
		if (!flag) return 0;
		const shouldNotify = !opt.silent;
		if (shouldNotify) this.notifyBeforeRender(opt);
		const leftover = this.updateView(view, flag, opt);
		if (shouldNotify) {
			const stats = {
				updated: 1,
				priority: view.UPDATE_PRIORITY
			};
			this.notifyAfterRender(stats, opt);
		}
		return leftover;
	},
	updateView: function(view, flag, opt) {
		if (!view) return 0;
		const { FLAG_REMOVE, FLAG_INSERT, FLAG_INIT, model } = view;
		if (view instanceof CellView) {
			if (flag & FLAG_REMOVE) {
				this.removeView(model);
				return 0;
			}
			if (flag & FLAG_INSERT) {
				const isInitialInsert = !!(flag & FLAG_INIT);
				if (isInitialInsert) flag ^= FLAG_INIT;
				this.insertView(view, isInitialInsert);
				flag ^= FLAG_INSERT;
			}
		}
		if (!flag) return 0;
		return view.confirmUpdate(flag, opt || {});
	},
	requireView: function(model, opt) {
		var view = this.findViewByModel(model);
		if (!view) return null;
		this.dumpView(view, opt);
		return view;
	},
	registerUnmountedView: function(view) {
		var cid = view.cid;
		var updates = this._updates;
		if (cid in updates.unmounted) return 0;
		var flag = updates.unmounted[cid] |= view.FLAG_INSERT;
		updates.unmountedCids.push(cid);
		delete updates.mounted[cid];
		return flag;
	},
	registerMountedView: function(view) {
		var cid = view.cid;
		var updates = this._updates;
		if (cid in updates.mounted) return 0;
		updates.mounted[cid] = true;
		updates.mountedCids.push(cid);
		var flag = updates.unmounted[cid] || 0;
		delete updates.unmounted[cid];
		return flag;
	},
	isViewMounted: function(view) {
		if (!view) return false;
		var cid = view.cid;
		var updates = this._updates;
		return cid in updates.mounted;
	},
	dumpViews: function(opt) {
		var passingOpt = defaults({}, opt, { viewport: null });
		this.checkViewport(passingOpt);
		this.updateViews(passingOpt);
	},
	updateViews: function(opt) {
		this.notifyBeforeRender(opt);
		let batchStats;
		let updateCount = 0;
		let batchCount = 0;
		let priority = MIN_PRIORITY;
		do {
			batchCount++;
			batchStats = this.updateViewsBatch(opt);
			updateCount += batchStats.updated;
			priority = Math.min(batchStats.priority, priority);
		} while (!batchStats.empty);
		const stats = {
			updated: updateCount,
			batches: batchCount,
			priority
		};
		this.notifyAfterRender(stats, opt);
		return stats;
	},
	hasScheduledUpdates: function() {
		const priorities = this._updates.priorities;
		const priorityIndexes = Object.keys(priorities);
		let i = priorityIndexes.length;
		while (i > 0 && i--) for (let _key in priorities[priorityIndexes[i]]) return true;
		return false;
	},
	updateViewsAsync: function(opt, data$1) {
		opt || (opt = {});
		data$1 || (data$1 = {
			processed: 0,
			priority: MIN_PRIORITY
		});
		const { _updates: updates, options } = this;
		const id = updates.id;
		if (id) {
			cancelFrame(id);
			if (data$1.processed === 0 && this.hasScheduledUpdates()) this.notifyBeforeRender(opt);
			const stats = this.updateViewsBatch(opt);
			const passingOpt = defaults({}, opt, {
				mountBatchSize: MOUNT_BATCH_SIZE - stats.mounted,
				unmountBatchSize: MOUNT_BATCH_SIZE - stats.unmounted
			});
			const checkStats = this.checkViewport(passingOpt);
			const unmountCount = checkStats.unmounted;
			const mountCount = checkStats.mounted;
			let processed = data$1.processed;
			const total = updates.count;
			if (stats.updated > 0) {
				processed += stats.updated + stats.unmounted;
				stats.processed = processed;
				data$1.priority = Math.min(stats.priority, data$1.priority);
				if (stats.empty && mountCount === 0) {
					stats.unmounted += unmountCount;
					stats.mounted += mountCount;
					stats.priority = data$1.priority;
					this.notifyAfterRender(stats, opt);
					data$1.processed = 0;
					data$1.priority = MIN_PRIORITY;
					updates.count = 0;
				} else data$1.processed = processed;
			} else if (!updates.idle) {
				if (options.autoFreeze) {
					this.freeze();
					updates.idle = true;
					this.trigger("render:idle", opt);
				}
			}
			const progressFn = opt.progress;
			if (total && typeof progressFn === "function") progressFn.call(this, stats.empty, processed, total, stats, this);
			if (updates.id !== id) return;
		}
		if (updates.disabled) throw new Error("dia.Paper: can not unfreeze the paper after it was removed");
		updates.id = nextFrame(this.updateViewsAsync, this, opt, data$1);
	},
	notifyBeforeRender: function(opt = {}) {
		let beforeFn = opt.beforeRender;
		if (typeof beforeFn !== "function") {
			beforeFn = this.options.beforeRender;
			if (typeof beforeFn !== "function") return;
		}
		beforeFn.call(this, opt, this);
	},
	notifyAfterRender: function(stats, opt = {}) {
		let afterFn = opt.afterRender;
		if (typeof afterFn !== "function") afterFn = this.options.afterRender;
		if (typeof afterFn === "function") afterFn.call(this, stats, opt, this);
		this.trigger("render:done", stats, opt);
	},
	updateViewsBatch: function(opt) {
		opt || (opt = {});
		var batchSize = opt.batchSize || UPDATE_BATCH_SIZE;
		var updates = this._updates;
		var updateCount = 0;
		var postponeCount = 0;
		var unmountCount = 0;
		var mountCount = 0;
		var maxPriority = MIN_PRIORITY;
		var empty$1 = true;
		var options = this.options;
		var priorities = updates.priorities;
		var viewportFn = "viewport" in opt ? opt.viewport : options.viewport;
		if (typeof viewportFn !== "function") viewportFn = null;
		var postponeViewFn = options.onViewPostponed;
		if (typeof postponeViewFn !== "function") postponeViewFn = null;
		var priorityIndexes = Object.keys(priorities);
		main: for (var i = 0, n = priorityIndexes.length; i < n; i++) {
			var priority = +priorityIndexes[i];
			var priorityUpdates = priorities[priority];
			for (var cid in priorityUpdates) {
				if (updateCount >= batchSize) {
					empty$1 = false;
					break main;
				}
				var view = views[cid];
				if (!view) {
					delete priorityUpdates[cid];
					continue;
				}
				var currentFlag = priorityUpdates[cid];
				if ((currentFlag & view.FLAG_REMOVE) === 0) {
					var isDetached = cid in updates.unmounted;
					if (view.DETACHABLE && viewportFn && !viewportFn.call(this, view, !isDetached, this)) {
						if (!isDetached) {
							this.registerUnmountedView(view);
							this.detachView(view);
						}
						updates.unmounted[cid] |= currentFlag;
						delete priorityUpdates[cid];
						unmountCount++;
						continue;
					}
					if (isDetached) {
						currentFlag |= view.FLAG_INSERT;
						mountCount++;
					}
					currentFlag |= this.registerMountedView(view);
				}
				var leftoverFlag = this.updateView(view, currentFlag, opt);
				if (leftoverFlag > 0) {
					priorityUpdates[cid] = leftoverFlag;
					if (!postponeViewFn || !postponeViewFn.call(this, view, leftoverFlag, this) || priorityUpdates[cid]) {
						postponeCount++;
						empty$1 = false;
						continue;
					}
				}
				if (maxPriority > priority) maxPriority = priority;
				updateCount++;
				delete priorityUpdates[cid];
			}
		}
		return {
			priority: maxPriority,
			updated: updateCount,
			postponed: postponeCount,
			unmounted: unmountCount,
			mounted: mountCount,
			empty: empty$1
		};
	},
	getUnmountedViews: function() {
		const updates = this._updates;
		const unmountedCids = Object.keys(updates.unmounted);
		const n = unmountedCids.length;
		const unmountedViews = new Array(n);
		for (var i = 0; i < n; i++) unmountedViews[i] = views[unmountedCids[i]];
		return unmountedViews;
	},
	getMountedViews: function() {
		const updates = this._updates;
		const mountedCids = Object.keys(updates.mounted);
		const n = mountedCids.length;
		const mountedViews = new Array(n);
		for (var i = 0; i < n; i++) mountedViews[i] = views[mountedCids[i]];
		return mountedViews;
	},
	checkUnmountedViews: function(viewportFn, opt) {
		opt || (opt = {});
		var mountCount = 0;
		if (typeof viewportFn !== "function") viewportFn = null;
		var batchSize = "mountBatchSize" in opt ? opt.mountBatchSize : Infinity;
		var updates = this._updates;
		var unmountedCids = updates.unmountedCids;
		var unmounted = updates.unmounted;
		for (var i = 0, n = Math.min(unmountedCids.length, batchSize); i < n; i++) {
			var cid = unmountedCids[i];
			if (!(cid in unmounted)) continue;
			var view = views[cid];
			if (!view) continue;
			if (view.DETACHABLE && viewportFn && !viewportFn.call(this, view, false, this)) {
				unmountedCids.push(cid);
				continue;
			}
			mountCount++;
			var flag = this.registerMountedView(view);
			if (flag) this.scheduleViewUpdate(view, flag, view.UPDATE_PRIORITY, { mounting: true });
		}
		unmountedCids.splice(0, i);
		return mountCount;
	},
	checkMountedViews: function(viewportFn, opt) {
		opt || (opt = {});
		var unmountCount = 0;
		if (typeof viewportFn !== "function") return unmountCount;
		var batchSize = "unmountBatchSize" in opt ? opt.unmountBatchSize : Infinity;
		var updates = this._updates;
		var mountedCids = updates.mountedCids;
		var mounted = updates.mounted;
		for (var i = 0, n = Math.min(mountedCids.length, batchSize); i < n; i++) {
			var cid = mountedCids[i];
			if (!(cid in mounted)) continue;
			var view = views[cid];
			if (!view) continue;
			if (!view.DETACHABLE || viewportFn.call(this, view, true, this)) {
				mountedCids.push(cid);
				continue;
			}
			unmountCount++;
			var flag = this.registerUnmountedView(view);
			if (flag) this.detachView(view);
		}
		mountedCids.splice(0, i);
		return unmountCount;
	},
	checkViewVisibility: function(cellView, opt = {}) {
		let viewportFn = "viewport" in opt ? opt.viewport : this.options.viewport;
		if (typeof viewportFn !== "function") viewportFn = null;
		const updates = this._updates;
		const { mounted, unmounted } = updates;
		const visible = !cellView.DETACHABLE || !viewportFn || viewportFn.call(this, cellView, false, this);
		let isUnmounted = false;
		let isMounted = false;
		if (cellView.cid in mounted && !visible) {
			const flag$1 = this.registerUnmountedView(cellView);
			if (flag$1) this.detachView(cellView);
			const i = updates.mountedCids.indexOf(cellView.cid);
			updates.mountedCids.splice(i, 1);
			isUnmounted = true;
		}
		if (!isUnmounted && cellView.cid in unmounted && visible) {
			const i = updates.unmountedCids.indexOf(cellView.cid);
			updates.unmountedCids.splice(i, 1);
			var flag = this.registerMountedView(cellView);
			if (flag) this.scheduleViewUpdate(cellView, flag, cellView.UPDATE_PRIORITY, { mounting: true });
			isMounted = true;
		}
		return {
			mounted: isMounted ? 1 : 0,
			unmounted: isUnmounted ? 1 : 0
		};
	},
	checkViewport: function(opt) {
		var passingOpt = defaults({}, opt, {
			mountBatchSize: Infinity,
			unmountBatchSize: Infinity
		});
		var viewportFn = "viewport" in passingOpt ? passingOpt.viewport : this.options.viewport;
		var unmountedCount = this.checkMountedViews(viewportFn, passingOpt);
		if (unmountedCount > 0) {
			var unmountedCids = this._updates.unmountedCids;
			passingOpt.mountBatchSize = Math.min(unmountedCids.length - unmountedCount, passingOpt.mountBatchSize);
		}
		var mountedCount = this.checkUnmountedViews(viewportFn, passingOpt);
		return {
			mounted: mountedCount,
			unmounted: unmountedCount
		};
	},
	freeze: function(opt) {
		opt || (opt = {});
		var updates = this._updates;
		var key = opt.key;
		var isFrozen = this.options.frozen;
		var freezeKey = updates.freezeKey;
		if (key && key !== freezeKey) {
			if (isFrozen && freezeKey) return;
			updates.freezeKey = key;
			updates.keyFrozen = isFrozen;
		}
		this.options.frozen = true;
		var id = updates.id;
		updates.id = null;
		if (this.isAsync() && id) cancelFrame(id);
	},
	unfreeze: function(opt) {
		opt || (opt = {});
		var updates = this._updates;
		var key = opt.key;
		var freezeKey = updates.freezeKey;
		if (key && freezeKey && key !== freezeKey) return;
		updates.freezeKey = null;
		if (key && key === freezeKey && updates.keyFrozen) return;
		if (this.isAsync()) {
			this.freeze();
			this.updateViewsAsync(opt);
		} else this.updateViews(opt);
		this.options.frozen = updates.keyFrozen = false;
		if (updates.sort) {
			this.sortViews();
			updates.sort = false;
		}
	},
	isAsync: function() {
		return !!this.options.async;
	},
	isFrozen: function() {
		return !!this.options.frozen;
	},
	isExactSorting: function() {
		return this.options.sorting === sortingTypes.EXACT;
	},
	onRemove: function() {
		this.freeze();
		this._updates.disabled = true;
		this.removeLayers();
		this.removeViews();
	},
	getComputedSize: function() {
		var options = this.options;
		var w = options.width;
		var h = options.height;
		if (!isNumber(w)) w = this.el.clientWidth;
		if (!isNumber(h)) h = this.el.clientHeight;
		return {
			width: w,
			height: h
		};
	},
	setDimensions: function(width$1, height$1, data$1 = {}) {
		const { options } = this;
		const { width: currentWidth, height: currentHeight } = options;
		let w = width$1 === void 0 ? currentWidth : width$1;
		let h = height$1 === void 0 ? currentHeight : height$1;
		if (currentWidth === w && currentHeight === h) return;
		options.width = w;
		options.height = h;
		this._setDimensions();
		const computedSize = this.getComputedSize();
		this.trigger("resize", computedSize.width, computedSize.height, data$1);
	},
	_setDimensions: function() {
		const { options } = this;
		let w = options.width;
		let h = options.height;
		if (isNumber(w)) w = `${Math.round(w)}px`;
		if (isNumber(h)) h = `${Math.round(h)}px`;
		this.$el.css({
			width: w === null ? "" : w,
			height: h === null ? "" : h
		});
	},
	fitToContent: function(gridWidth, gridHeight, padding, opt) {
		if (isObject(gridWidth)) opt = gridWidth;
		else opt = assign({
			gridWidth,
			gridHeight,
			padding
		}, opt);
		const { x, y, width: width$1, height: height$1 } = this.getFitToContentArea(opt);
		const { sx, sy } = this.scale();
		this.translate(-x * sx, -y * sy, opt);
		this.setDimensions(width$1 * sx, height$1 * sy, opt);
		return new Rect(x, y, width$1, height$1);
	},
	getFitToContentArea: function(opt = {}) {
		const gridWidth = opt.gridWidth || 1;
		const gridHeight = opt.gridHeight || 1;
		const padding = normalizeSides(opt.padding || 0);
		const minWidth = Math.max(opt.minWidth || 0, gridWidth);
		const minHeight = Math.max(opt.minHeight || 0, gridHeight);
		const maxWidth = opt.maxWidth || Number.MAX_VALUE;
		const maxHeight = opt.maxHeight || Number.MAX_VALUE;
		const newOrigin = opt.allowNewOrigin;
		const area = "contentArea" in opt ? new Rect(opt.contentArea) : this.getContentArea(opt);
		const { sx, sy } = this.scale();
		area.x *= sx;
		area.y *= sy;
		area.width *= sx;
		area.height *= sy;
		let calcWidth = Math.ceil((area.width + area.x) / gridWidth);
		let calcHeight = Math.ceil((area.height + area.y) / gridHeight);
		if (!opt.allowNegativeBottomRight) {
			calcWidth = Math.max(calcWidth, 1);
			calcHeight = Math.max(calcHeight, 1);
		}
		calcWidth *= gridWidth;
		calcHeight *= gridHeight;
		let tx = 0;
		if (newOrigin === "negative" && area.x < 0 || newOrigin === "positive" && area.x >= 0 || newOrigin === "any") {
			tx = Math.ceil(-area.x / gridWidth) * gridWidth;
			tx += padding.left;
			calcWidth += tx;
		}
		let ty = 0;
		if (newOrigin === "negative" && area.y < 0 || newOrigin === "positive" && area.y >= 0 || newOrigin === "any") {
			ty = Math.ceil(-area.y / gridHeight) * gridHeight;
			ty += padding.top;
			calcHeight += ty;
		}
		calcWidth += padding.right;
		calcHeight += padding.bottom;
		calcWidth = Math.max(calcWidth, minWidth);
		calcHeight = Math.max(calcHeight, minHeight);
		calcWidth = Math.min(calcWidth, maxWidth);
		calcHeight = Math.min(calcHeight, maxHeight);
		return new Rect(-tx / sx, -ty / sy, calcWidth / sx, calcHeight / sy);
	},
	transformToFitContent: function(opt) {
		opt || (opt = {});
		let contentBBox, contentLocalOrigin;
		if ("contentArea" in opt) {
			const contentArea = opt.contentArea;
			contentBBox = this.localToPaperRect(contentArea);
			contentLocalOrigin = new Point(contentArea);
		} else {
			contentBBox = this.getContentBBox(opt);
			contentLocalOrigin = this.paperToLocalPoint(contentBBox);
		}
		if (!contentBBox.width || !contentBBox.height) return;
		defaults(opt, {
			padding: 0,
			preserveAspectRatio: true,
			scaleGrid: null,
			minScale: 0,
			maxScale: Number.MAX_VALUE,
			verticalAlign: "top",
			horizontalAlign: "left"
		});
		const padding = normalizeSides(opt.padding);
		const minScaleX = opt.minScaleX || opt.minScale;
		const maxScaleX = opt.maxScaleX || opt.maxScale;
		const minScaleY = opt.minScaleY || opt.minScale;
		const maxScaleY = opt.maxScaleY || opt.maxScale;
		let fittingBBox;
		if (opt.fittingBBox) fittingBBox = opt.fittingBBox;
		else {
			const currentTranslate = this.translate();
			const computedSize = this.getComputedSize();
			fittingBBox = {
				x: currentTranslate.tx,
				y: currentTranslate.ty,
				width: computedSize.width,
				height: computedSize.height
			};
		}
		fittingBBox = new Rect(fittingBBox).moveAndExpand({
			x: padding.left,
			y: padding.top,
			width: -padding.left - padding.right,
			height: -padding.top - padding.bottom
		});
		const ctm = this.matrix();
		const { a: sx, d: sy, e: tx, f: ty } = ctm;
		let newSx = fittingBBox.width / contentBBox.width * sx;
		let newSy = fittingBBox.height / contentBBox.height * sy;
		if (opt.preserveAspectRatio) newSx = newSy = Math.min(newSx, newSy);
		if (opt.scaleGrid) {
			const gridSize = opt.scaleGrid;
			newSx = gridSize * Math.floor(newSx / gridSize);
			newSy = gridSize * Math.floor(newSy / gridSize);
		}
		newSx = Math.min(maxScaleX, Math.max(minScaleX, newSx));
		newSy = Math.min(maxScaleY, Math.max(minScaleY, newSy));
		const scaleDiff = {
			x: newSx / sx,
			y: newSy / sy
		};
		let newOx = fittingBBox.x - contentLocalOrigin.x * newSx - tx;
		let newOy = fittingBBox.y - contentLocalOrigin.y * newSy - ty;
		switch (opt.verticalAlign) {
			case "middle":
				newOy = newOy + (fittingBBox.height - contentBBox.height * scaleDiff.y) / 2;
				break;
			case "bottom":
				newOy = newOy + (fittingBBox.height - contentBBox.height * scaleDiff.y);
				break;
			case "top":
			default: break;
		}
		switch (opt.horizontalAlign) {
			case "middle":
				newOx = newOx + (fittingBBox.width - contentBBox.width * scaleDiff.x) / 2;
				break;
			case "right":
				newOx = newOx + (fittingBBox.width - contentBBox.width * scaleDiff.x);
				break;
			case "left":
			default: break;
		}
		ctm.a = newSx;
		ctm.d = newSy;
		ctm.e = newOx;
		ctm.f = newOy;
		this.matrix(ctm, opt);
	},
	scaleContentToFit: function(opt) {
		this.transformToFitContent(opt);
	},
	getContentArea: function(opt) {
		if (opt && opt.useModelGeometry) return this.model.getBBox() || new Rect();
		return V_default(this.cells).getBBox();
	},
	getContentBBox: function(opt) {
		return this.localToPaperRect(this.getContentArea(opt));
	},
	getArea: function() {
		return this.paperToLocalRect(this.getComputedSize());
	},
	getRestrictedArea: function(...args) {
		const { restrictTranslate } = this.options;
		let restrictedArea;
		if (isFunction(restrictTranslate)) restrictedArea = restrictTranslate.apply(this, args);
		else if (restrictTranslate === true) restrictedArea = this.getArea();
		else if (!restrictTranslate) restrictedArea = null;
		else restrictedArea = new Rect(restrictTranslate);
		return restrictedArea;
	},
	createViewForModel: function(cell) {
		const { options } = this;
		var optionalViewClass;
		var defaultViewClass;
		var namespace = options.cellViewNamespace;
		var type = cell.get("type") + "View";
		var namespaceViewClass = getByPath(namespace, type, ".");
		if (cell.isLink()) {
			optionalViewClass = options.linkView;
			defaultViewClass = LinkView;
		} else {
			optionalViewClass = options.elementView;
			defaultViewClass = ElementView;
		}
		var ViewClass = optionalViewClass.prototype instanceof ViewBase ? namespaceViewClass || optionalViewClass : optionalViewClass.call(this, cell) || namespaceViewClass || defaultViewClass;
		return new ViewClass({
			model: cell,
			interactive: options.interactive,
			labelsLayer: options.labelsLayer === true ? LayersNames.LABELS : options.labelsLayer
		});
	},
	removeView: function(cell) {
		const { id } = cell;
		const { _views, _updates } = this;
		const view = _views[id];
		if (view) {
			var { cid } = view;
			const { mounted, unmounted } = _updates;
			view.remove();
			delete _views[id];
			delete mounted[cid];
			delete unmounted[cid];
		}
		return view;
	},
	renderView: function(cell, opt) {
		const { id } = cell;
		const views$1 = this._views;
		let view, flag;
		let create = true;
		if (id in views$1) {
			view = views$1[id];
			if (view.model === cell) {
				flag = view.FLAG_INSERT;
				create = false;
			} else this.removeView(cell);
		}
		if (create) {
			view = views$1[id] = this.createViewForModel(cell);
			view.paper = this;
			flag = this.registerUnmountedView(view) | this.FLAG_INIT | view.getFlag(result(view, "initFlag"));
		}
		this.requestViewUpdate(view, flag, view.UPDATE_PRIORITY, opt);
		return view;
	},
	onImageDragStart: function() {
		return false;
	},
	resetViews: function(cells, opt) {
		opt || (opt = {});
		cells || (cells = []);
		this._resetUpdates();
		this.removeViews();
		const key = this.options.autoFreeze ? null : "reset";
		this.freeze({ key });
		for (var i = 0, n = cells.length; i < n; i++) this.renderView(cells[i], opt);
		this.unfreeze({ key });
		this.sortViews();
	},
	removeViews: function() {
		invoke(this._views, "remove");
		this._views = {};
	},
	sortViews: function() {
		if (!this.isExactSorting()) return;
		if (this.isFrozen()) {
			this._updates.sort = true;
			return;
		}
		this.sortViewsExact();
	},
	sortViewsExact: function() {
		var cellNodes = Array.from(this.cells.childNodes).filter((node) => node.getAttribute("model-id"));
		var cells = this.model.get("cells");
		sortElements(cellNodes, function(a, b) {
			var cellA = cells.get(a.getAttribute("model-id"));
			var cellB = cells.get(b.getAttribute("model-id"));
			var zA = cellA.attributes.z || 0;
			var zB = cellB.attributes.z || 0;
			return zA === zB ? 0 : zA < zB ? -1 : 1;
		});
	},
	insertView: function(view, isInitialInsert) {
		const layerView = this.getLayerView(LayersNames.CELLS);
		const { el, model } = view;
		switch (this.options.sorting) {
			case sortingTypes.APPROX:
				layerView.insertSortedNode(el, model.get("z"));
				break;
			case sortingTypes.EXACT:
			default:
				layerView.insertNode(el);
				break;
		}
		view.onMount(isInitialInsert);
	},
	detachView(view) {
		view.unmount();
		view.onDetach();
	},
	findView: function($el) {
		var el = isString($el) ? this.cells.querySelector($el) : $el instanceof Dom_default ? $el[0] : $el;
		var id = this.findAttribute("model-id", el);
		if (id) return this._views[id];
		return void 0;
	},
	findViewByModel: function(cell) {
		var id = isString(cell) || isNumber(cell) ? cell : cell && cell.id;
		return this._views[id];
	},
	findViewsFromPoint: function(p) {
		p = new Point(p);
		var views$1 = this.model.getElements().map(this.findViewByModel, this);
		return views$1.filter(function(view) {
			return view && view.vel.getBBox({ target: this.cells }).containsPoint(p);
		}, this);
	},
	findViewsInArea: function(rect$1, opt) {
		opt = defaults(opt || {}, { strict: false });
		rect$1 = new Rect(rect$1);
		var views$1 = this.model.getElements().map(this.findViewByModel, this);
		var method = opt.strict ? "containsRect" : "intersect";
		return views$1.filter(function(view) {
			return view && rect$1[method](view.vel.getBBox({ target: this.cells }));
		}, this);
	},
	findElementViewsInArea(plainArea, opt) {
		return this._filterViewsInArea(plainArea, (extArea, findOpt) => this.model.findElementsInArea(extArea, findOpt), opt);
	},
	findLinkViewsInArea: function(plainArea, opt) {
		return this._filterViewsInArea(plainArea, (extArea, findOpt) => this.model.findLinksInArea(extArea, findOpt), opt);
	},
	findCellViewsInArea: function(plainArea, opt) {
		return this._filterViewsInArea(plainArea, (extArea, findOpt) => this.model.findCellsInArea(extArea, findOpt), opt);
	},
	findElementViewsAtPoint: function(plainPoint, opt) {
		return this._filterViewsAtPoint(plainPoint, (extArea) => this.model.findElementsInArea(extArea), opt);
	},
	findLinkViewsAtPoint: function(plainPoint, opt) {
		return this._filterViewsAtPoint(plainPoint, (extArea) => this.model.findLinksInArea(extArea), opt);
	},
	findCellViewsAtPoint: function(plainPoint, opt) {
		return this._filterViewsAtPoint(plainPoint, (extArea) => this.model.findCellsInArea(extArea), opt);
	},
	_findInExtendedArea: function(area, findCellsFn, opt = {}) {
		const { buffer = this.DEFAULT_FIND_BUFFER } = opt;
		const extendedArea = new Rect(area).inflate(buffer);
		const cellsInExtendedArea = findCellsFn(extendedArea, opt);
		return cellsInExtendedArea.map((element) => this.findViewByModel(element));
	},
	_filterViewsInArea: function(plainArea, findCells, opt = {}) {
		const area = new Rect(plainArea);
		const viewsInExtendedArea = this._findInExtendedArea(area, findCells, opt);
		const viewsInArea = viewsInExtendedArea.filter((view) => {
			if (!view) return false;
			return view.isInArea(area, opt);
		});
		return viewsInArea;
	},
	_filterViewsAtPoint: function(plainPoint, findCells, opt = {}) {
		const area = new Rect(plainPoint);
		const viewsInExtendedArea = this._findInExtendedArea(area, findCells, opt);
		const viewsAtPoint = viewsInExtendedArea.filter((view) => {
			if (!view) return false;
			return view.isAtPoint(plainPoint, opt);
		});
		return viewsAtPoint;
	},
	removeTools: function() {
		this.dispatchToolsEvent("remove");
		return this;
	},
	hideTools: function() {
		this.dispatchToolsEvent("hide");
		return this;
	},
	showTools: function() {
		this.dispatchToolsEvent("show");
		return this;
	},
	dispatchToolsEvent: function(event, ...args) {
		if (typeof event !== "string") return;
		this.trigger("tools:event", event, ...args);
	},
	getModelById: function(id) {
		return this.model.getCell(id);
	},
	snapToGrid: function(x, y) {
		return this.clientToLocalPoint(x, y).snapToGrid(this.options.gridSize);
	},
	localToPaperPoint: function(x, y) {
		var localPoint = new Point(x, y);
		var paperPoint = V_default.transformPoint(localPoint, this.matrix());
		return paperPoint;
	},
	localToPaperRect: function(x, y, width$1, height$1) {
		var localRect = new Rect(x, y, width$1, height$1);
		var paperRect = V_default.transformRect(localRect, this.matrix());
		return paperRect;
	},
	paperToLocalPoint: function(x, y) {
		var paperPoint = new Point(x, y);
		var localPoint = V_default.transformPoint(paperPoint, this.matrix().inverse());
		return localPoint;
	},
	paperToLocalRect: function(x, y, width$1, height$1) {
		var paperRect = new Rect(x, y, width$1, height$1);
		var localRect = V_default.transformRect(paperRect, this.matrix().inverse());
		return localRect;
	},
	localToClientPoint: function(x, y) {
		var localPoint = new Point(x, y);
		var clientPoint = V_default.transformPoint(localPoint, this.clientMatrix());
		return clientPoint;
	},
	localToClientRect: function(x, y, width$1, height$1) {
		var localRect = new Rect(x, y, width$1, height$1);
		var clientRect = V_default.transformRect(localRect, this.clientMatrix());
		return clientRect;
	},
	clientToLocalPoint: function(x, y) {
		var clientPoint = new Point(x, y);
		var localPoint = V_default.transformPoint(clientPoint, this.clientMatrix().inverse());
		return localPoint;
	},
	clientToLocalRect: function(x, y, width$1, height$1) {
		var clientRect = new Rect(x, y, width$1, height$1);
		var localRect = V_default.transformRect(clientRect, this.clientMatrix().inverse());
		return localRect;
	},
	localToPagePoint: function(x, y) {
		return this.localToPaperPoint(x, y).offset(this.pageOffset());
	},
	localToPageRect: function(x, y, width$1, height$1) {
		return this.localToPaperRect(x, y, width$1, height$1).offset(this.pageOffset());
	},
	pageToLocalPoint: function(x, y) {
		var pagePoint = new Point(x, y);
		var paperPoint = pagePoint.difference(this.pageOffset());
		return this.paperToLocalPoint(paperPoint);
	},
	pageToLocalRect: function(x, y, width$1, height$1) {
		var pageOffset = this.pageOffset();
		var paperRect = new Rect(x, y, width$1, height$1);
		paperRect.x -= pageOffset.x;
		paperRect.y -= pageOffset.y;
		return this.paperToLocalRect(paperRect);
	},
	clientOffset: function() {
		var clientRect = this.svg.getBoundingClientRect();
		return new Point(clientRect.left, clientRect.top);
	},
	pageOffset: function() {
		return this.clientOffset().offset(window.scrollX, window.scrollY);
	},
	linkAllowed: function(linkView) {
		if (!(linkView instanceof LinkView)) throw new Error("Must provide a linkView.");
		var link = linkView.model;
		var paperOptions = this.options;
		var graph = this.model;
		var ns = graph.constructor.validations;
		if (!paperOptions.multiLinks) {
			if (!ns.multiLinks.call(this, graph, link)) return false;
		}
		if (!paperOptions.linkPinning) {
			if (!ns.linkPinning.call(this, graph, link)) return false;
		}
		if (typeof paperOptions.allowLink === "function") {
			if (!paperOptions.allowLink.call(this, linkView, this)) return false;
		}
		return true;
	},
	getDefaultLink: function(cellView, magnet) {
		return isFunction(this.options.defaultLink) ? this.options.defaultLink.call(this, cellView, magnet) : this.options.defaultLink.clone();
	},
	resolveHighlighter: function(opt = {}) {
		let { highlighter: highlighterDef, type } = opt;
		const { highlighting, highlighterNamespace } = this.options;
		if (highlighterDef === void 0) {
			if (!highlighting) return false;
			if (type) {
				highlighterDef = highlighting[type];
				if (highlighterDef === false) return false;
			}
			if (!highlighterDef) highlighterDef = highlighting["default"];
		}
		if (!highlighterDef) return false;
		if (isString(highlighterDef)) highlighterDef = { name: highlighterDef };
		const name = highlighterDef.name;
		const highlighter = highlighterNamespace[name];
		if (!highlighter) throw new Error("Unknown highlighter (\"" + name + "\")");
		if (typeof highlighter.highlight !== "function") throw new Error("Highlighter (\"" + name + "\") is missing required highlight() method");
		if (typeof highlighter.unhighlight !== "function") throw new Error("Highlighter (\"" + name + "\") is missing required unhighlight() method");
		return {
			highlighter,
			options: highlighterDef.options || {},
			name
		};
	},
	onCellHighlight: function(cellView, magnetEl, opt) {
		const highlighterDescriptor = this.resolveHighlighter(opt);
		if (!highlighterDescriptor) return;
		const { highlighter, options } = highlighterDescriptor;
		highlighter.highlight(cellView, magnetEl, options);
	},
	onCellUnhighlight: function(cellView, magnetEl, opt) {
		const highlighterDescriptor = this.resolveHighlighter(opt);
		if (!highlighterDescriptor) return;
		const { highlighter, options } = highlighterDescriptor;
		highlighter.unhighlight(cellView, magnetEl, options);
	},
	pointerdblclick: function(evt) {
		evt.preventDefault();
		evt = normalizeEvent(evt);
		var view = this.findView(evt.target);
		if (this.guard(evt, view)) return;
		var localPoint = this.snapToGrid(evt.clientX, evt.clientY);
		if (view) view.pointerdblclick(evt, localPoint.x, localPoint.y);
		else this.trigger("blank:pointerdblclick", evt, localPoint.x, localPoint.y);
	},
	pointerclick: function(evt) {
		var data$1 = this.eventData(evt);
		if (data$1.mousemoved <= this.options.clickThreshold) {
			evt = normalizeEvent(evt);
			var view = this.findView(evt.target);
			if (this.guard(evt, view)) return;
			var localPoint = this.snapToGrid(evt.clientX, evt.clientY);
			if (view) view.pointerclick(evt, localPoint.x, localPoint.y);
			else this.trigger("blank:pointerclick", evt, localPoint.x, localPoint.y);
		}
	},
	contextmenu: function(evt) {
		if (this.options.preventContextMenu) evt.preventDefault();
		if (this.contextMenuFired) {
			this.contextMenuFired = false;
			return;
		}
		evt = normalizeEvent(evt);
		this.contextMenuTrigger(evt);
	},
	contextMenuTrigger: function(evt) {
		var view = this.findView(evt.target);
		if (this.guard(evt, view)) return;
		var localPoint = this.snapToGrid(evt.clientX, evt.clientY);
		if (view) view.contextmenu(evt, localPoint.x, localPoint.y);
		else this.trigger("blank:contextmenu", evt, localPoint.x, localPoint.y);
	},
	pointerdown: function(evt) {
		evt = normalizeEvent(evt);
		const { target, button } = evt;
		const view = this.findView(target);
		const isContextMenu = button === 2;
		if (view) {
			if (!isContextMenu && this.guard(evt, view)) return;
			const isTargetFormNode = this.FORM_CONTROL_TAG_NAMES.includes(target.tagName);
			if (this.options.preventDefaultViewAction && !isTargetFormNode) evt.preventDefault();
			if (isTargetFormNode) view.preventDefaultInteraction(evt);
			const eventEvt = this.customEventTrigger(evt, view);
			if (eventEvt) {
				if (eventEvt.isPropagationStopped()) return;
				evt.data = eventEvt.data;
			}
			const magnetNode = target.closest("[magnet]");
			if (magnetNode && view.el !== magnetNode && view.el.contains(magnetNode)) {
				const magnetEvt = normalizeEvent(new Dom_default.Event(evt.originalEvent, {
					data: evt.data,
					currentTarget: magnetNode
				}));
				this.onmagnet(magnetEvt);
				if (magnetEvt.isDefaultPrevented()) evt.preventDefault();
				if (magnetEvt.isPropagationStopped()) {
					if (isContextMenu) return;
					this.delegateDragEvents(view, magnetEvt.data);
					return;
				}
				evt.data = magnetEvt.data;
			}
		}
		if (isContextMenu) {
			this.contextMenuFired = true;
			const contextmenuEvt = new Dom_default.Event(evt.originalEvent, {
				type: "contextmenu",
				data: evt.data
			});
			this.contextMenuTrigger(contextmenuEvt);
		} else {
			const localPoint = this.snapToGrid(evt.clientX, evt.clientY);
			if (view) view.pointerdown(evt, localPoint.x, localPoint.y);
			else {
				if (this.options.preventDefaultBlankAction) evt.preventDefault();
				this.trigger("blank:pointerdown", evt, localPoint.x, localPoint.y);
			}
			this.delegateDragEvents(view, evt.data);
		}
	},
	pointermove: function(evt) {
		var data$1 = this.eventData(evt);
		if (!data$1.mousemoved) {
			data$1.mousemoved = 0;
			this.undelegateEvents();
		}
		var mousemoved = ++data$1.mousemoved;
		if (mousemoved <= this.options.moveThreshold) return;
		evt = normalizeEvent(evt);
		var localPoint = this.snapToGrid(evt.clientX, evt.clientY);
		var view = data$1.sourceView;
		if (view) view.pointermove(evt, localPoint.x, localPoint.y);
		else this.trigger("blank:pointermove", evt, localPoint.x, localPoint.y);
		this.eventData(evt, data$1);
	},
	pointerup: function(evt) {
		this.undelegateDocumentEvents();
		var normalizedEvt = normalizeEvent(evt);
		var localPoint = this.snapToGrid(normalizedEvt.clientX, normalizedEvt.clientY);
		var view = this.eventData(evt).sourceView;
		if (view) view.pointerup(normalizedEvt, localPoint.x, localPoint.y);
		else this.trigger("blank:pointerup", normalizedEvt, localPoint.x, localPoint.y);
		if (!normalizedEvt.isPropagationStopped()) this.pointerclick(new Dom_default.Event(evt.originalEvent, {
			type: "click",
			data: evt.data
		}));
		this.delegateEvents();
	},
	mouseover: function(evt) {
		evt = normalizeEvent(evt);
		var view = this.findView(evt.target);
		if (this.guard(evt, view)) return;
		if (view) view.mouseover(evt);
		else {
			if (this.el === evt.target) return;
			this.trigger("blank:mouseover", evt);
		}
	},
	mouseout: function(evt) {
		evt = normalizeEvent(evt);
		var view = this.findView(evt.target);
		if (this.guard(evt, view)) return;
		if (view) view.mouseout(evt);
		else {
			if (this.el === evt.target) return;
			this.trigger("blank:mouseout", evt);
		}
	},
	mouseenter: function(evt) {
		evt = normalizeEvent(evt);
		const { target, relatedTarget, currentTarget } = evt;
		const view = this.findView(target);
		if (this.guard(evt, view)) return;
		const relatedView = this.findView(relatedTarget);
		if (view) {
			if (relatedView === view) return;
			view.mouseenter(evt);
			if (this.el.contains(relatedTarget)) return;
		}
		if (relatedView) return;
		if (currentTarget === this.el) this.trigger("paper:mouseenter", evt);
	},
	mouseleave: function(evt) {
		evt = normalizeEvent(evt);
		const { target, relatedTarget, currentTarget } = evt;
		const view = this.findView(target);
		if (this.guard(evt, view)) return;
		const relatedView = this.findView(relatedTarget);
		if (view) {
			if (relatedView === view) return;
			view.mouseleave(evt);
			if (this.el.contains(relatedTarget)) return;
		}
		if (relatedView) return;
		if (currentTarget === this.el) this.trigger("paper:mouseleave", evt);
	},
	_processMouseWheelEvtBuf: debounce(function() {
		const { event, deltas } = this._mw_evt_buffer;
		const deltaY = deltas.reduce((acc, deltaY$1) => acc + cap(deltaY$1, WHEEL_CAP), 0);
		const scale$1 = Math.pow(.995, deltaY);
		const { x, y } = this.clientToLocalPoint(event.clientX, event.clientY);
		this.trigger("paper:pinch", event, x, y, scale$1);
		this._mw_evt_buffer = {
			event: null,
			deltas: []
		};
	}, WHEEL_WAIT_MS, { maxWait: WHEEL_WAIT_MS }),
	mousewheel: function(evt) {
		evt = normalizeEvent(evt);
		const view = this.findView(evt.target);
		if (this.guard(evt, view)) return;
		const originalEvent = evt.originalEvent;
		const localPoint = this.snapToGrid(originalEvent.clientX, originalEvent.clientY);
		const { deltaX, deltaY } = normalizeWheel(originalEvent);
		const pinchHandlers = this._events["paper:pinch"];
		if (evt.ctrlKey && pinchHandlers && pinchHandlers.length > 0) {
			originalEvent.preventDefault();
			this._mw_evt_buffer.event = evt;
			this._mw_evt_buffer.deltas.push(deltaY);
			this._processMouseWheelEvtBuf();
		} else {
			const delta = Math.max(-1, Math.min(1, originalEvent.wheelDelta));
			if (view) view.mousewheel(evt, localPoint.x, localPoint.y, delta);
			else this.trigger("blank:mousewheel", evt, localPoint.x, localPoint.y, delta);
			this.trigger("paper:pan", evt, deltaX, deltaY);
		}
	},
	onevent: function(evt) {
		var eventNode = evt.currentTarget;
		var eventName = eventNode.getAttribute("event");
		if (eventName) {
			var view = this.findView(eventNode);
			if (view) {
				evt = normalizeEvent(evt);
				if (this.guard(evt, view)) return;
				var localPoint = this.snapToGrid(evt.clientX, evt.clientY);
				view.onevent(evt, eventName, localPoint.x, localPoint.y);
			}
		}
	},
	magnetEvent: function(evt, handler) {
		var magnetNode = evt.currentTarget;
		var magnetValue = magnetNode.getAttribute("magnet");
		if (magnetValue) {
			var view = this.findView(magnetNode);
			if (view) {
				evt = normalizeEvent(evt);
				if (this.guard(evt, view)) return;
				var localPoint = this.snapToGrid(evt.clientX, evt.clientY);
				handler.call(this, view, evt, magnetNode, localPoint.x, localPoint.y);
			}
		}
	},
	onmagnet: function(evt) {
		if (evt.button === 2) {
			this.contextMenuFired = true;
			this.magnetContextMenuFired = true;
			const contextmenuEvt = new Dom_default.Event(evt.originalEvent, {
				type: "contextmenu",
				data: evt.data,
				currentTarget: evt.currentTarget
			});
			this.magnetContextMenuTrigger(contextmenuEvt);
			if (contextmenuEvt.isPropagationStopped()) evt.stopPropagation();
		} else this.magnetEvent(evt, function(view, evt$1, _, x, y) {
			view.onmagnet(evt$1, x, y);
		});
	},
	magnetpointerdblclick: function(evt) {
		this.magnetEvent(evt, function(view, evt$1, magnet, x, y) {
			view.magnetpointerdblclick(evt$1, magnet, x, y);
		});
	},
	magnetcontextmenu: function(evt) {
		if (this.options.preventContextMenu) evt.preventDefault();
		if (this.magnetContextMenuFired) {
			this.magnetContextMenuFired = false;
			return;
		}
		this.magnetContextMenuTrigger(evt);
	},
	magnetContextMenuTrigger: function(evt) {
		this.magnetEvent(evt, function(view, evt$1, magnet, x, y) {
			view.magnetcontextmenu(evt$1, magnet, x, y);
		});
	},
	onlabel: function(evt) {
		var labelNode = evt.currentTarget;
		var view = this.findView(labelNode);
		if (!view) return;
		evt = normalizeEvent(evt);
		if (this.guard(evt, view)) return;
		const eventEvt = this.customEventTrigger(evt, view, labelNode);
		if (eventEvt) {
			if (eventEvt.isPropagationStopped()) return;
			evt.data = eventEvt.data;
		}
		var localPoint = this.snapToGrid(evt.clientX, evt.clientY);
		view.onlabel(evt, localPoint.x, localPoint.y);
	},
	getPointerArgs(evt) {
		const normalizedEvt = normalizeEvent(evt);
		const { x, y } = this.snapToGrid(normalizedEvt.clientX, normalizedEvt.clientY);
		return [
			normalizedEvt,
			x,
			y
		];
	},
	delegateDragEvents: function(view, data$1) {
		data$1 || (data$1 = {});
		this.eventData({ data: data$1 }, {
			sourceView: view || null,
			mousemoved: 0
		});
		this.delegateDocumentEvents(null, data$1);
	},
	guard: function(evt, view) {
		if (evt.type === "mousedown" && evt.button === 2) return true;
		if (this.options.guard && this.options.guard(evt, view)) return true;
		if (evt.data && evt.data.guarded !== void 0) return evt.data.guarded;
		const { target } = evt;
		if (this.GUARDED_TAG_NAMES.includes(target.tagName)) return true;
		if (view && view.model && view.model instanceof Cell) return false;
		if (this.el === target || this.svg.contains(target)) return false;
		return true;
	},
	setGridSize: function(gridSize) {
		const { options } = this;
		options.gridSize = gridSize;
		if (options.drawGrid && !options.drawGridSize) this.getLayerView(LayersNames.GRID).renderGrid();
		return this;
	},
	setGrid: function(drawGrid) {
		this.getLayerView(LayersNames.GRID).setGrid(drawGrid);
		return this;
	},
	updateBackgroundImage: function(opt) {
		opt = opt || {};
		var backgroundPosition = opt.position || "center";
		var backgroundSize = opt.size || "auto auto";
		var currentScale = this.scale();
		var currentTranslate = this.translate();
		if (isObject(backgroundPosition)) {
			var x = currentTranslate.tx + currentScale.sx * (backgroundPosition.x || 0);
			var y = currentTranslate.ty + currentScale.sy * (backgroundPosition.y || 0);
			backgroundPosition = x + "px " + y + "px";
		}
		if (isObject(backgroundSize)) {
			backgroundSize = new Rect(backgroundSize).scale(currentScale.sx, currentScale.sy);
			backgroundSize = backgroundSize.width + "px " + backgroundSize.height + "px";
		}
		const { background } = this.childNodes;
		background.style.backgroundSize = backgroundSize;
		background.style.backgroundPosition = backgroundPosition;
	},
	drawBackgroundImage: function(img, opt) {
		if (!(img instanceof HTMLImageElement)) {
			this.childNodes.background.style.backgroundImage = "";
			return;
		}
		if (!this._background || this._background.id !== opt.id) return;
		opt = opt || {};
		var backgroundImage;
		var backgroundSize = opt.size;
		var backgroundRepeat = opt.repeat || "no-repeat";
		var backgroundOpacity = opt.opacity || 1;
		var backgroundQuality = Math.abs(opt.quality) || 1;
		var backgroundPattern = this.constructor.backgroundPatterns[camelCase(backgroundRepeat)];
		if (isFunction(backgroundPattern)) {
			img.width *= backgroundQuality;
			img.height *= backgroundQuality;
			var canvas = backgroundPattern(img, opt);
			if (!(canvas instanceof HTMLCanvasElement)) throw new Error("dia.Paper: background pattern must return an HTML Canvas instance");
			backgroundImage = canvas.toDataURL("image/png");
			backgroundRepeat = "repeat";
			if (isObject(backgroundSize)) {
				backgroundSize.width *= canvas.width / img.width;
				backgroundSize.height *= canvas.height / img.height;
			} else if (backgroundSize === void 0) opt.size = {
				width: canvas.width / backgroundQuality,
				height: canvas.height / backgroundQuality
			};
		} else {
			backgroundImage = img.src;
			if (backgroundSize === void 0) opt.size = {
				width: img.width,
				height: img.height
			};
		}
		this.childNodes.background.style.opacity = backgroundOpacity;
		this.childNodes.background.style.backgroundRepeat = backgroundRepeat;
		this.childNodes.background.style.backgroundImage = `url(${backgroundImage})`;
		this.updateBackgroundImage(opt);
	},
	updateBackgroundColor: function(color) {
		this.$el.css("backgroundColor", color || "");
	},
	drawBackground: function(opt) {
		opt = opt || {};
		this.updateBackgroundColor(opt.color);
		if (opt.image) {
			opt = this._background = cloneDeep(opt);
			guid(opt);
			var img = document.createElement("img");
			img.onload = this.drawBackgroundImage.bind(this, img, opt);
			img.src = opt.image;
		} else {
			this.drawBackgroundImage(null);
			this._background = null;
		}
		return this;
	},
	setInteractivity: function(value) {
		this.options.interactive = value;
		invoke(this._views, "setInteractivity", value);
	},
	isDefined: function(defId) {
		return !!this.svg.getElementById(defId);
	},
	defineFilter: function(filter$1) {
		if (!isObject(filter$1)) throw new TypeError("dia.Paper: defineFilter() requires 1. argument to be an object.");
		var filterId = filter$1.id;
		var name = filter$1.name;
		if (!filterId) filterId = name + this.svg.id + hashCode(JSON.stringify(filter$1));
		if (!this.isDefined(filterId)) {
			var namespace = filter;
			var filterSVGString = namespace[name] && namespace[name](filter$1.args || {});
			if (!filterSVGString) throw new Error("Non-existing filter " + name);
			var filterAttrs = assign({ filterUnits: "userSpaceOnUse" }, filter$1.attrs, { id: filterId });
			V_default(filterSVGString, filterAttrs).appendTo(this.defs);
		}
		return filterId;
	},
	defineGradient: function(gradient) {
		if (!isObject(gradient)) throw new TypeError("dia.Paper: defineGradient() requires 1. argument to be an object.");
		const { svg: svg$1, defs } = this;
		const { type, id = type + svg$1.id + hashCode(JSON.stringify(gradient)), stops, attrs = {} } = gradient;
		if (this.isDefined(id)) return id;
		const stopVEls = toArray(stops).map(({ offset: offset$1, color, opacity: opacity$1 }) => {
			return V_default("stop").attr({
				"offset": offset$1,
				"stop-color": color,
				"stop-opacity": Number.isFinite(opacity$1) ? opacity$1 : 1
			});
		});
		const gradientVEl = V_default(type, attrs, stopVEls);
		gradientVEl.id = id;
		gradientVEl.appendTo(defs);
		return id;
	},
	definePattern: function(pattern) {
		if (!isObject(pattern)) throw new TypeError("dia.Paper: definePattern() requires 1. argument to be an object.");
		const { svg: svg$1, defs } = this;
		const { id = svg$1.id + hashCode(JSON.stringify(pattern)), markup, attrs = {} } = pattern;
		if (!markup) throw new TypeError("dia.Paper: definePattern() requires markup.");
		if (this.isDefined(id)) return id;
		const patternVEl = V_default("pattern", { patternUnits: "userSpaceOnUse" });
		patternVEl.id = id;
		patternVEl.attr(attrs);
		if (typeof markup === "string") patternVEl.append(V_default(markup));
		else {
			const { fragment } = parseDOMJSON(markup);
			patternVEl.append(fragment);
		}
		patternVEl.appendTo(defs);
		return id;
	},
	defineMarker: function(marker) {
		if (!isObject(marker)) throw new TypeError("dia.Paper: defineMarker() requires the first argument to be an object.");
		const { svg: svg$1, defs } = this;
		const { id = svg$1.id + hashCode(JSON.stringify(marker)), markup, attrs = {}, markerUnits = "userSpaceOnUse" } = marker;
		if (this.isDefined(id)) return id;
		const markerVEl = V_default("marker", {
			orient: "auto",
			overflow: "visible",
			markerUnits
		});
		markerVEl.id = id;
		markerVEl.attr(attrs);
		let markerContentVEl;
		if (markup) {
			let markupVEl;
			if (typeof markup === "string") {
				markupVEl = V_default(markup);
				markupVEl = Array.isArray(markupVEl) ? markupVEl : [markupVEl];
			} else {
				const { fragment } = parseDOMJSON(markup);
				markupVEl = V_default(fragment).children();
			}
			if (markupVEl.length > 1) markerContentVEl = V_default("g").append(markupVEl);
			else markerContentVEl = markupVEl[0];
		} else {
			const { type = "path" } = marker;
			markerContentVEl = V_default(type);
		}
		const markerAttrs = omit(marker, "type", "id", "markup", "attrs", "markerUnits");
		const markerAttrsKeys = Object.keys(markerAttrs);
		markerAttrsKeys.forEach((key) => {
			const value = markerAttrs[key];
			const markupValue = markerContentVEl.attr(key);
			if (markupValue == null) markerContentVEl.attr(key, value);
			else switch (key) {
				case "transform":
					markerContentVEl.attr(key, value + " " + markupValue);
					break;
			}
		});
		markerContentVEl.appendTo(markerVEl);
		markerVEl.appendTo(defs);
		return id;
	},
	customEventTrigger: function(evt, view, rootNode = view.el) {
		const eventNode = evt.target.closest("[event]");
		if (eventNode && rootNode !== eventNode && view.el.contains(eventNode)) {
			const eventEvt = normalizeEvent(new Dom_default.Event(evt.originalEvent, {
				data: evt.data,
				currentTarget: eventNode
			}));
			this.onevent(eventEvt);
			if (eventEvt.isDefaultPrevented()) evt.preventDefault();
			return eventEvt;
		}
		return null;
	}
}, {
	sorting: sortingTypes,
	Layers: LayersNames,
	backgroundPatterns: {
		flipXy: function(img) {
			var canvas = document.createElement("canvas");
			var imgWidth = img.width;
			var imgHeight = img.height;
			canvas.width = 2 * imgWidth;
			canvas.height = 2 * imgHeight;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
			ctx.setTransform(-1, 0, 0, -1, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
			ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
			ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
			ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
			ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
			return canvas;
		},
		flipX: function(img) {
			var canvas = document.createElement("canvas");
			var imgWidth = img.width;
			var imgHeight = img.height;
			canvas.width = imgWidth * 2;
			canvas.height = imgHeight;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
			ctx.translate(2 * imgWidth, 0);
			ctx.scale(-1, 1);
			ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
			return canvas;
		},
		flipY: function(img) {
			var canvas = document.createElement("canvas");
			var imgWidth = img.width;
			var imgHeight = img.height;
			canvas.width = imgWidth;
			canvas.height = imgHeight * 2;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
			ctx.translate(0, 2 * imgHeight);
			ctx.scale(1, -1);
			ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
			return canvas;
		},
		watermark: function(img, opt) {
			opt = opt || {};
			var imgWidth = img.width;
			var imgHeight = img.height;
			var canvas = document.createElement("canvas");
			canvas.width = imgWidth * 3;
			canvas.height = imgHeight * 3;
			var ctx = canvas.getContext("2d");
			var angle = isNumber(opt.watermarkAngle) ? -opt.watermarkAngle : -20;
			var radians$1 = toRad(angle);
			var stepX = canvas.width / 4;
			var stepY = canvas.height / 4;
			for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) if ((i + j) % 2 > 0) {
				ctx.setTransform(1, 0, 0, 1, (2 * i - 1) * stepX, (2 * j - 1) * stepY);
				ctx.rotate(radians$1);
				ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
			}
			return canvas;
		}
	},
	gridPatterns: {
		dot: [{
			color: "#AAAAAA",
			thickness: 1,
			markup: "rect",
			render: function(el, opt) {
				V_default(el).attr({
					width: opt.thickness,
					height: opt.thickness,
					fill: opt.color
				});
			}
		}],
		fixedDot: [{
			color: "#AAAAAA",
			thickness: 1,
			markup: "rect",
			render: function(el, opt) {
				V_default(el).attr({ fill: opt.color });
			},
			update: function(el, opt, paper) {
				const { sx, sy } = paper.scale();
				const width$1 = sx <= 1 ? opt.thickness : opt.thickness / sx;
				const height$1 = sy <= 1 ? opt.thickness : opt.thickness / sy;
				V_default(el).attr({
					width: width$1,
					height: height$1
				});
			}
		}],
		mesh: [{
			color: "#AAAAAA",
			thickness: 1,
			markup: "path",
			render: function(el, opt) {
				var d;
				var width$1 = opt.width;
				var height$1 = opt.height;
				var thickness = opt.thickness;
				if (width$1 - thickness >= 0 && height$1 - thickness >= 0) d = [
					"M",
					width$1,
					0,
					"H0 M0 0 V0",
					height$1
				].join(" ");
				else d = "M 0 0 0 0";
				V_default(el).attr({
					"d": d,
					stroke: opt.color,
					"stroke-width": opt.thickness
				});
			}
		}],
		doubleMesh: [{
			color: "#AAAAAA",
			thickness: 1,
			markup: "path",
			render: function(el, opt) {
				var d;
				var width$1 = opt.width;
				var height$1 = opt.height;
				var thickness = opt.thickness;
				if (width$1 - thickness >= 0 && height$1 - thickness >= 0) d = [
					"M",
					width$1,
					0,
					"H0 M0 0 V0",
					height$1
				].join(" ");
				else d = "M 0 0 0 0";
				V_default(el).attr({
					"d": d,
					stroke: opt.color,
					"stroke-width": opt.thickness
				});
			}
		}, {
			color: "#000000",
			thickness: 3,
			scaleFactor: 4,
			markup: "path",
			render: function(el, opt) {
				var d;
				var width$1 = opt.width;
				var height$1 = opt.height;
				var thickness = opt.thickness;
				if (width$1 - thickness >= 0 && height$1 - thickness >= 0) d = [
					"M",
					width$1,
					0,
					"H0 M0 0 V0",
					height$1
				].join(" ");
				else d = "M 0 0 0 0";
				V_default(el).attr({
					"d": d,
					stroke: opt.color,
					"stroke-width": opt.thickness
				});
			}
		}]
	}
});

//#endregion
export { Element$1 as Element, ElementView, Graph, Link$1 as Link, Link as Link$1, Listener, Paper, Rect, V_default, config, curve, defaultsDeep, left, mask, right, standard_exports, svg };