import axios from 'axios'
import {Page} from "puppeteer";

/**
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

export const mockPromise = (time: number) => new Promise((resolve) => {
	const interval: NodeJS.Timeout = setInterval(() => resolve( () => clearInterval(interval)), time)
})

export const getPageIndex = async (page: Page) =>
	(await page.browser().pages()).findIndex(p => p === page)