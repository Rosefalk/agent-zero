import type { StreamInvoker, Streamlet, Accumulator } from "./types.ts";

// Simple

export const page: StreamInvoker = async (page, { type, url = '' })=>
	await page.goto(url).catch((error: string) => console.error(type, error))

export const wait: StreamInvoker = async (page, { type, element = '', visible = true, timeout = 0 }) =>
	await page.waitForSelector(element, { visible, timeout }).catch((error: string) => console.error(type, error))

export const reload: StreamInvoker = async (page, { type }) =>
	await page.reload().catch((error: string) => console.error(type, error))

export const click: StreamInvoker = async (page, { type, element = '' }) =>
	await page.click(element).catch((error: string) => console.error(type, error))

export const keyboardPress: StreamInvoker = async (page, { type, keyCode = 13 }) => {
	await page.keyboard.press(<any>String.fromCharCode(keyCode)).catch((error: string) => console.error(type, error))
}

// Compound
export const login: StreamInvoker = async (page, { type, id = '', password = '', idElement = '', passwordElement = '' }) => {
	await page.click(idElement).catch((error: string) => console.error(type, error))
	await page.keyboard.type(id).catch((error: string) => console.error(type, error))

	await page.click(passwordElement).catch((error: string) => console.error(type, error))
	await page.keyboard.type(password).catch((error: string) => console.error(type, error))

	await page.keyboard.press(<any>String.fromCharCode(13)).catch((error: string) => console.error(type, error))
}

export const evaluate: StreamInvoker = async (page, { type, element = '', onResponse, accumulate, grab = 'textContent', log }, accumulator, tab = '  ') => {
	let response = await page
		.$$eval(element, (els: any[], grab: Streamlet['grab']) => els.map(el => grab ? el[grab] : el), grab) // evaluation happens in browser context, not in node context so grab has to be passed
		.catch((error: any) => console.error(type, error))

	if(onResponse) response = await onResponse(response, accumulator, tab)

	if(log) {
		const date = log.date
			? new Date(Date.now()) + ': '
			: ''

		console.log(`  ${tab}└ ${date}${response}`)
	}

	if(accumulate) accumulator.push(response)
}

/* Streamlet Utilities */
export const run: StreamInvoker = async (page, streamlet, accumulator: Accumulator) => {// Last resort you can use this to run your own custom thing
	const rtn = streamlet.handle
		? streamlet.handle(page, streamlet, accumulator)
		: null
	
	if(!rtn) console.warn(`• streamlet ${streamlet.type} has no handle function`)
	
	return rtn
}

export const accumulation: StreamInvoker = async (page, streamlet, accumulator) => 
	streamlet.handle
	? streamlet.handle(page, streamlet, accumulator)
	: null


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