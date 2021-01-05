import {Point} from "./geom.js";

export class LinkSource {
	constructor() {
		this.links = new Set();
	}

	link(source, firstOrSecondIntersection) {
		const link = new Link(this, source, firstOrSecondIntersection);
		// don't link to sources that don't have a body (like an Anchor)
		if (source.body) {
			this.links.add(link);
		}
		if (this.body) {
			source.links.add(link);
		}
	}
}

class Link {
	constructor(a, b, firstOrSecondIntersection = true) {
		this.a = a;
		this.b = b;
		this.firstOrSecondIntersection = firstOrSecondIntersection;
	}

	mountForBody(body) {
		if (this.a.body === body) {
			return this.a;
		}
		if (this.b.body === body) {
			return this.b;
		}
		return;
	}

	otherMount(aOrB) {
		if (this.a === aOrB) {
			return this.b;
		}
		if (this.b === aOrB) {
			return this.a;
		}
		return;
	}
}

export class Mount extends LinkSource {
	constructor(body) {
		super();
		this.body = body;
	}

	// will divert links to the anchor on other end of the link
	divertToAnchor(p, ignoreBody) {
		let a;
		for (const l of this.links) {
			const otherMount = l.otherMount(this);
			// we only need to filter out links between body a and b,
			// because other parts of the path where anchors, which are not
			// linked to from a body.
			if (otherMount.body === ignoreBody) {
				continue;
			}
			if (!a) {
				a = new Anchor(p);
			}
			a.link(otherMount, l.firstOrSecondIntersection);
			otherMount.links.delete(l);
		}
		return a;
	}
}

export class Anchor extends LinkSource {
	constructor(xorP, y) {
		super();
		if (typeof xorP === "number") {
			this.point = new Point(xorP, y);
		} else {
			this.point = xorP;
		}
	}
}