// not used atm
let start = 15;
const duration = 2000;
let targetStart = performance.now();
let target = 10;

function animate(ts) {
	const delta = (ts - targetStart) / duration;
	const value = start + ((target - start) * delta);

	run(suspension, {shockLen: value});

	if (delta >= 1) {
		const tmp = start;
		start = target;
		target = tmp;
		targetStart = ts;
	}
	requestAnimationFrame(animate);
}
//requestAnimationFrame(animate);