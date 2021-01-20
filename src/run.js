import {resolve} from "./resolve.js";

export function run(sim, input, drawing) {
	const anchors = sim(input);
	const resolvedBodies = resolve(anchors);
	for (let i = 0; i < resolvedBodies.length; i += 1) {
		const rb = resolvedBodies[i];
		const node = drawing.childNodes[i];
		if (node) {
			rb.updateNode(node);
		} else {
			drawing.appendChild(rb.renderNode());
		}
	}
}

export function getInput(ranges) {
	return Object.entries(ranges).reduce((o, [name, range]) => {
		o[name] = parseFloat(range.value);
		return o;
	}, {});
}

export function runWithRanges(sim, ranges, drawing) {
	for (const range of Object.values(ranges)) {
		range.addEventListener("input", evt => {
			try {
				run(sim, getInput(ranges), drawing);
				range.setCustomValidity("");
			} catch (err) {
				range.setCustomValidity(err.message);
				range.reportValidity();
			}
		});
	}
	run(sim, getInput(ranges), drawing);
}


