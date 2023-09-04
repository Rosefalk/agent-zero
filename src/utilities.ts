import axios from 'axios'
import {Page} from "puppeteer";
import {Streamlet} from "./types.ts";

/**
 * IFTTT plugin for sending webhooks
 * IFTTT Maker Webhook https://help.ifttt.com/hc/en-us/articles/115010230347-Webhooks-service-FAQ
 * @param {string} key 
 * @param {string} event 
 * @param {*} value1 
 * @param {*} value2 
 * @param {*} value3 
 */
export const ifttt = (key: string, event: string, value1: unknown, value2: unknown, value3: unknown) => {
	axios.post(`https://maker.ifttt.com/trigger/${event}/with/key/${key}`, {
		value1,
		value2,
		value3
	})
	.catch(console.error)
}

/**
 * @line Returns a string with the specified length and character
 * @header Returns a string with the specified length and character with the supplied string in the middle
 * if length is not supplied it will default to the terminal width
 * @returns {string}
 * @example
 * createText.line(10, '-') => '----------'
 * createText.header('Hello World', 10, '-') => '----------\n-Hello World-\n----------'
 */
export const createText = {
	line: (length = process.stdout.columns, lineChar = '-') => lineChar.repeat(length),
	header: (str = '', length = process.stdout.columns, lineChar = '-',) => {
		const headerLength = str.length < length
			? length
			: str.length

		const line = lineChar.repeat(headerLength)
		const headerSpace = ' '.repeat((headerLength - str.length) / 2)

		return `${line}\n${headerSpace}${str}${headerSpace}\n${line}`
	}
}

/**
 * Returns a promise that resolves after the specified time
 * @param {number} time
 * @returns {Promise<() => void>}
 */
export const mockPromise = (time: number) => new Promise((resolve) => {
	const interval: NodeJS.Timeout = setInterval(() => resolve( () => clearInterval(interval)), time)
})

/**
 * Returns the index of the page in the browser
 * @param {Page} page
 * @returns {Promise<number>}
 */
export const getPageIndex = async (page: Page) =>
	(await page.browser().pages()).findIndex(p => p === page)

/**
 * Builds a streamlet that navigates to each page in the list sequentially and returns a streamlet with the list of pages
 * @param {string[]} list
 * @returns {Streamlet}
 * @example
 * buildPages([
 * 	'https://minenergi2.dk/App/company/70/overview/dashboard',
 * 	'https://minenergi2.dk/App/company/70/meters',
 * 	'https://minenergi2.dk/App/company/70/overview/dashboard',
 * ]) => {
 * 		type: 'goTo',
 * 		url: 'https://minenergi2.dk/App/company/70/overview/dashboard',
 * 		stream: [{
 * 			type: 'goTo',
 * 			url: 'https://minenergi2.dk/App/company/70/meters',
 * 			stream: [{
 * 				type: 'goTo',
 * 				url: 'https://minenergi2.dk/App/company/70/overview/dashboard',
 * 				stream: []
 * 			}]
 * 		}]
 * 	}
 */
export const buildPages = (list: string[]) => {
	const goToPageLinked = (url: string, streamlet?: Streamlet | typeof this) => {
		const stream: Streamlet = {
			type: 'goTo',
			url,
			stream: [{type: 'waitNetwork'}]
		}

		if(streamlet) stream.stream!.push(streamlet)

		return stream
	}

	const buildLinkedPages = (list: string[], streams?: Streamlet, prev?: Streamlet): Streamlet | {} => {
		if(!list.length) return streams || {}

		const url = list.shift()
		const cur = goToPageLinked(url!)

		prev?.stream?.push(cur)

		return list.length ? buildLinkedPages(list, streams || cur, cur) : streams || {}
	}

	return buildLinkedPages(list)
}
