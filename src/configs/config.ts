import {Config} from "../types.ts";

const config: Config[] = [{
	browsers: 1, // number of browsers to open for each user
	name: 'main',
	puppeteer: {
		headless: 'new', // 'new' is headless, false opens browsers
		args: ['--incognito'],
		timeout: 0
	},
	stream: [{
		type: 'page',
		url: 'https://example.com',
		stream: [{
			type: 'wait',
			element: 'div > h1',
		}, {
			type: 'evaluate',
			element: 'div > h1',
			accumulate: true,
			log: {
				date: true
			}
		}]
	}]
}]

export default config