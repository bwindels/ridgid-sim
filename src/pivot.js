import {Point} from "./geom.js";
import {ResolvedBody} from "./body.js";
import {Mount} from "./link.js";

/**
 * A pivot, with arms of a given length and at a given angle
 * @implements {Body}
 */
export class Pivot {
	constructor(options) {
		this._centerMount = new Mount(this);
		this.mounts = [this._centerMount];
		this.options = options;
	}

	get center() {
		return this._centerMount;
	}

	addArm(len, angle) {
		const mount = new ArmMount(this, len, angle);
		this.mounts.push(mount);
		return mount;
	}

	distanceBetween(mountA, mountB) {
		if (mountA === this._centerMount) {
			return mountB.length;
		}
		if (mountB === this._centerMount) {
			return mountA.length;
		}
		// calculate two points and subtract?
		throw new Error("one anchor has to be center for now");
	}

	resolve(mountA, pointA, mountB, pointB) {
		// assume a or be is center for now
		// calculate angle between center and point
		// normalize point to unit vector
		// calculate rotated unit vector for other arms and multiply with their length

		const centerIsA = mountA === this._centerMount;
		const centerIsB = mountB === this._centerMount;
		if (!centerIsA && !centerIsB) {
			throw new Error("expected either of connected mount to be the center mount");
		}

		const centerPoint = centerIsA ? pointA : pointB;
		const armPoint = centerIsA ? pointB : pointA;
		const armMount = centerIsA ? mountB : mountA;
		const armRelVec = armPoint.sub(centerPoint);
		const originVec = new Point(1, 0);
		// angle of arm point relative to x-axis
		const armAngle = Math.acos(
			(armRelVec.x * originVec.x + armRelVec.y * originVec.y) / (
				Math.sqrt(Math.pow(armRelVec.x, 2) + Math.pow(armRelVec.y, 2)) * 
				Math.sqrt(Math.pow(originVec.x, 2) + Math.pow(originVec.y, 2))
			));
		const rotationAngle = armMount.angle + armAngle;

		const points = this.mounts.map(m => {
			if (m === mountA) {
				return pointA;
			} else if (m === mountB) {
				return pointB;
			} else {
				const adjustedAngle = m.angle + rotationAngle;
				return new Point(Math.cos(adjustedAngle), Math.sin(adjustedAngle)).mul(m.length).add(centerPoint);
			}
		});
		return new ResolvedPivot(this, points);
	}
}

class ResolvedPivot extends ResolvedBody {
	renderNode() {
		const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
		const armCount = this.points.length - 1;
		for (let i = 0; i < armCount; i += 1) {
			const arm = document.createElementNS("http://www.w3.org/2000/svg", "line");
			group.appendChild(arm);
		}
		this.updateNode(group);
		group.setAttribute("stroke-linecap", "round");
		return group;
	}

	updateNode(group) {
		const center = this.points[0];
		const armCount = this.points.length - 1;
		for (let i = 0; i < armCount; i += 1) {
			const armPoint = this.points[i + 1];
			const line = group.children[i];
			line.setAttribute("x1", center.x);
			line.setAttribute("y1", center.y);
			line.setAttribute("x2", armPoint.x);
			line.setAttribute("y2", armPoint.y);
		}
		group.setAttribute("stroke", this.body.options.color);
	}
}

class ArmMount extends Mount {
	constructor(body, length, angle) {
		super(body);
		this.length = length;
		this.angle = angle;
	}
}