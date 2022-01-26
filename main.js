function parseRLE(rle) {
	if (rle.length == 0) {
		return [];
	}

	let i = 0;
	// skip comment lines
	while (rle[i] == '#') {
		while (rle[i] != '\n') {
			i++;
		}
		i++;
	}
	// skip header
	if (!('0123456789bo$!').includes(rle[0])) {
		while (rle[i] != '\n') {
			i++;
		}
		i++;
	}
	let x = 0, y = 0, runLength = 0;
	const rows = [[]];
	while (i < rle.length) {
		const char = rle[i];
		if ('0123456789'.includes(char)) {
			runLength *= 10;
			runLength += parseInt(char);
		} else if (char == '!') {
			// end
			break;
		} else {
			// if no run characters were given, just a single character
			if (runLength == 0) {
				runLength = 1;
			}

			if (char == 'b' || char == 'o') {
				for (let i = 0; i < runLength; i++) {
					rows[y][x + i] = (char == 'o');
				}
				x += runLength;
			} else if (char == '$') {
				for (let i = 0; i < runLength; i++) {
					rows.push([]);
					y++;
				}
				x = 0;
			}

			runLength = 0;
		}
		i++;
	}
	return rows;
}

const gliders = `x = 3, y = 6, rule = B3/S23
bob$2bo$3o4$bob$2bo$3o!`;
console.log(parseRLE(gliders));

function doConversion(rle, padding) {
	const grid = parseRLE(rle),
		rows = grid.length,
		cols = Math.max(...grid.map(r => r.length)),
		paddedRows = rows + 2 * padding,
		paddedCols = cols + 2 * padding;

	document.getElementById('output-section').style.display = 'block';
	const canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d');

	canvas.width = paddedCols * 4;
	canvas.height = paddedRows * 4;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let output = `${paddedRows} ${paddedCols}\n`;
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			if (grid[r][c]) {
				const pr = r + padding, pc = c + padding;
				ctx.fillRect(4 * pc, 4 * pr, 4, 4);
				output += `${pr} ${pc}\n`;
			}
		}
	}

	document.getElementById('output').textContent = output;
	document.getElementById('copy').onclick = () => navigator.clipboard.writeText(output);
	const permalink = `#${padding}.${encodeURIComponent(rle)}`,
		permalinkElement = document.getElementById('permalink');

	permalinkElement.href = permalink;
	permalinkElement.onclick = () => navigator.clipboard.writeText(permalinkElement.href);
}

document.getElementById('convert').onclick = () => {
	const rle = document.getElementById('rle').value;
	const padding = parseInt(document.getElementById('padding').value);
	doConversion(rle, padding);
};

if (location.hash?.length > 0) {
	const padding = location.hash.substring(1).split('.')[0];
	document.getElementById('padding').value = padding;
	const rle = decodeURIComponent(location.hash.substring(padding.length + 2));
	document.getElementById('rle').value = rle;
	doConversion(rle, parseInt(padding));
}
