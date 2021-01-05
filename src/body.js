/**
 * @interface {Body}
 * @method distanceBetween
 * @method resolve
 */
export class ResolvedBody {
	constructor(body, points) {
		this.body = body;
		this.points = points;
	}

	createAnchors(ignoreBody) {
		const anchors = [];
		for (let i = 0; i < this.body.mounts.length; i += 1) {
			const m = this.body.mounts[i];
			const p = this.points[i];
			const a = m.divertToAnchor(p, ignoreBody);
			if (a) {
				anchors.push(a);
			}
		}
		return anchors;
	}
}