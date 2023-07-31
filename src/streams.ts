/* Puppeteer */

// Simple
import {Page} from "puppeteer/lib/esm/puppeteer/common/Page.js";

export const page = async (page: Page, { type, url = '' }) =>
	await page.goto(url).catch(error => console.error(type, error))

export const wait = async (page: Page, { type, element = '', visible = true, timeout = 0 }) =>
	await page.waitForSelector(element, { visible, timeout }).catch(error => console.error(type, error))

export const reload = async (page: Page, { type }) =>
	await page.reload().catch(error => console.error(type, error))

export const click = async (page: Page, { type, element = '' }) =>
	await page.click(element).catch(error => console.error(type, error))

export const keyboardPress = async (page: Page, { type, keyCode = 13 }) => {
	await page.keyboard.press(String.fromCharCode(keyCode)).catch(error => console.error(type, error))
}

// Compound
export const login = async (page: Page, { type, id = '', password = '', idElement = '', passwordElement = '' }) => {
	await page.click(idElement).catch(error => console.error(type, error))
	await page.keyboard.type(id).catch(error => console.error(type, error))

	await page.click(passwordElement).catch(error => console.error(type, error))
	await page.keyboard.type(password).catch(error => console.error(type, error))

	await page.keyboard.press(String.fromCharCode(13)).catch(error => console.error(type, error))
}

export const evaluate = async (page: Page, { type, element = '', onResponse = (e) => e, accumulate, grab = 'textContent', log }, accumulator, tab) => {
	let response = await page
		.$$eval(element, (els, grab) => els.map(el => grab ? el[grab]: el), grab) // evaluation happens in browser context, not in node context so grab has to be passed
		.catch(error => console.error(type, error))

	response = onResponse(response, accumulator, tab)

	if(log) {
		const date = log.date
			? new Date(Date.now()) + ': '
			: ''

		console.log(`  ${tab}└ ${date}${response}`)
	}

	if(accumulate) accumulator.push(response)
}

/* Streamlet Utilities */
export const run = (page: Page, streamlet, accumulator) => // Last resort you can use this to run your own custom thing
	streamlet.handle
		? streamlet.handle(page, streamlet, accumulator)
		: console.error('no handle to execute')

export const accumulation = (_page: Page, {handle}, accumulator) =>
	handle(accumulator)


export default {
	// Simple
	page,
	wait,
	reload,
	click,
	keyboardPress,
	// Compound
	login,
	evaluate,
	// Streamlet Utilities
	run,
	accumulation
}