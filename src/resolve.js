import {circleIntersection} from "./geom.js";

function findLink(entryMountA, entryMountB) {
	for (const mountA of entryMountA.body.mounts) {
		if (mountA === entryMountA) {
			continue;
		}
		
		for (const link of mountA.links) {
			if (link.otherMount(mountA).body === entryMountB.body) {
				return link;
			}
		}
	}
}

function resolveLink(entryMountA, pointA, entryMountB, pointB, link) {
	const bodyA = entryMountA.body;
	const bodyB = entryMountB.body;
	const mountA = link.mountForBody(entryMountA.body);
	const mountB = link.mountForBody(entryMountB.body);
	const rA = bodyA.distanceBetween(entryMountA, mountA);
	const rB = bodyB.distanceBetween(entryMountB, mountB);
	const p = circleIntersection(pointA, rA, pointB, rB, link.firstOrSecondIntersection);
	if (p) {
		return [
			bodyA.resolve(entryMountA, pointA, link.mountForBody(bodyA), p),
			bodyB.resolve(entryMountB, pointB, link.mountForBody(bodyB), p),
		];
	}
}

function applyResolution(anchors, resolvedBodies, resolution, a1, l1, m1, a2, l2, m2) {
	a1.links.delete(l1);
	if (a1.links.size === 0) {
		anchors.delete(a1);
	}
	a2.links.delete(l2);
	if (a2.links.size === 0) {
		anchors.delete(a2);
	}
	for (const a of resolution[0].createAnchors(m2.body)) {
		anchors.add(a);
	}
	for (const a of resolution[1].createAnchors(m1.body)) {
		anchors.add(a);
	}
	resolvedBodies.push(...resolution);
}

export function resolve(startAnchors) {
	const anchors = new Set(startAnchors);
	// instances of ResolvedBody
	const resolvedBodies = [];
outerLoop:
	while(anchors.size) {
		let resolved = false;
		for (const a1 of anchors) {
			for (const a2 of anchors) {
				if (a1 === a2) {
					continue;
				}
				for (const l1 of a1.links) {
					for (const l2 of a2.links) {
						const m1 = l1.otherMount(a1);
						const m2 = l2.otherMount(a2);
						const commonLink = findLink(m1, m2);
						if (commonLink) {
							const resolution = resolveLink(m1, a1.point, m2, a2.point, commonLink);
							if (resolution) {
								applyResolution(anchors, resolvedBodies, resolution, a1, l1, m1, a2, l2, m2);
								// restart going over all anchors after modifying the set
								continue outerLoop;
							}
						}
					}
				}
			}
			// if we get here, we ran through the whole while loop without finding a link,
			// which means we would loop forever, so bail out.
			const error = new Error("could not resolve all anchors, only resolved " + resolvedBodies.map(b => b.body.options.name).join(", "));
			error.resolvedBodies = resolvedBodies;
			throw error;
		}
	}
	return resolvedBodies;
}