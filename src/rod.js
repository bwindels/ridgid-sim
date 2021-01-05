import {pointOnLine} from "./geom.js";
import {ResolvedBody} from "./body.js";
import {Mount} from "./link.js";

/**
 * A straight, ridgid rod, with 2 or more mount points along its length.
 * @implements {Body}
 */
export class Rod {
	constructor(len, options) {
		this.mounts = [new RodMount(this, 0), new RodMount(this, len)];
		this.options = options;
	}

	get start() {
		return this.mounts[0];
	}

	get end() {
		return this.mounts[this.mounts.length - 1];
	}

	addMount(len) {
		let idx = this.mounts.findIndex(m => m.distance > len);
		if (idx === -1) {
			idx = this.mounts.length;
		}
		const mount = new RodMount(this, len);
		this.mounts.splice(idx, 0, mount);
		return mount;
	}

	distanceBetween(mountA, mountB) {
		return Math.abs(mountB.distance - mountA.distance);
	}

	resolve(mountA, pointA, mountB, pointB) {
		const points = this.mounts.map(m => {
			if (m === mountA) {
				return pointA;
			} else if (m === mountB) {
				return pointB;
			} else {
				// important to take the signed distance, as mountA might not be the first mount
				const distance = m.distance - mountA.distance;
				// important pointA comes first, as that is what we measure the distance from
				return pointOnLine(pointA, pointB, distance);
			}
		});
		return new ResolvedRod(this, points);
	}
}

class ResolvedRod extends ResolvedBody {
	renderNode() {
		const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		this.updateNode(line);
		line.setAttribute("stroke-linecap", "round");
		return line;
	}

	updateNode(line) {
		const start = this.points[0];
		const end = this.points[this.points.length - 1];
		line.setAttribute("x1", start.x);
		line.setAttribute("y1", start.y);
		line.setAttribute("x2", end.x);
		line.setAttribute("y2", end.y);
		line.setAttribute("stroke", this.body.options.color);
	}
}

class RodMount extends Mount {
	constructor(body, distance) {
		super(body);
		this.distance = distance;
	}
}