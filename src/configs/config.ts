import {Config} from "../app.ts";

export default <Config>{
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
		}, {
			type: 'evaluate',
			element: 'div > p',
			accumulate: true
		}]
	}]
}
