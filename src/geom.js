export class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	distance(p) {
		return Math.sqrt(
			Math.pow(Math.abs(this.x - p.x), 2) + 
			Math.pow(Math.abs(this.y - p.y), 2)
		);
	}

	add(p) {
		return new Point(this.x + p.x, this.y + p.y);
	}

	sub(p) {
		return new Point(this.x - p.x, this.y - p.y);
	}

	mul(n) {
		return new Point(this.x * n, this.y * n);
	}
}

export function circleIntersection(p1, r1, p2, r2, firstOrSecondIntersection) {
	const d = p1.distance(p2);
	if (d === 0 || d < Math.abs(r1 - r2) || d > (r1 + r2)) {
		return;
	}
	const a = (r1*r1 - r2*r2 + d*d) / (2*d);
	const h = Math.sqrt(r1*r1 - a*a);
	const p3 = p2.sub(p1).mul(a/d).add(p1);
	const whichPoint = firstOrSecondIntersection ? 1 : -1;
	const x4 = p3.x + whichPoint * (h / d) * (p2.y - p1.y);
	const y4 = p3.y - whichPoint * (h / d) * (p2.x - p1.x);
	return new Point(x4, y4);
}

export function pointOnLine(a, b, distanceFromA) {
	const m = (b.y - a.y) / (b.x - a.x);
	const x = a.x + distanceFromA / (Math.sqrt(1 + m*m));
	const y = m * (x - a.x) + a.y;
	return new Point(x, y);
}