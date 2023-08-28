import type { StreamInvoker, Streamlet } from "./types.ts";
import {HTTPResponse} from "puppeteer";
import { randomUUID } from "crypto";
// Simple

export const page: StreamInvoker = async (page, {}, tab) => {
	console.info('tab', tab)
	console.log(`  ${tab}• Page Created`)
	await page.browser().newPage()
}

export const goTo: StreamInvoker = async (page, { type, url = '' })=>
	await page.goto(url).catch((error: string) => console.error(type, error))

export const wait: StreamInvoker = async (page, { type, element = '', visible = true, timeout = 0 }) =>
	await page.waitForSelector(element, { visible, timeout }).catch((error: string) => console.error(type, error))

export const waitNetwork: StreamInvoker = async (page, { type, until = 'networkidle0' }) =>
	await page.waitForNavigation({ waitUntil: until }).catch((error: string) => console.error(type, error))

export const reload: StreamInvoker = async (page, { type }) =>
	await page.reload().catch((error: string) => console.error(type, error))

export const click: StreamInvoker = async (page, { type, element = '', wait = true }) => {
	if(wait) await page.waitForSelector(element).catch((error: string) => console.error(type, error))
	return await page.click(element).catch((error: string) => console.error(type, error))
}

export const keyboardPress: StreamInvoker = async (page, { type, keyCode = 13 }) => {
	await page.keyboard.press(<any>String.fromCharCode(keyCode)).catch((error: string) => console.error(type, error))
}

// Compound
export const login: StreamInvoker = async (page, { type, id = '', password = '', idElement = '', passwordElement = '', loginButton='' }) => {
	if(!id) console.warn(type, 'missing id')
	if(!password) console.warn(type, 'missing password')
	
	if(!(idElement && passwordElement))
		return console.error(type, `missing required idElement (${idElement}) or passwordElement (${passwordElement})`)
	
	await page.waitForSelector(idElement).catch((error: string) => console.error(type, error))
	await page.waitForSelector(passwordElement).catch((error: string) => console.error(type, error))
	await page.click(idElement).catch((error: string) => console.error(type, error))
	await page.keyboard.type(id).catch((error: string) => console.error(type, error))

	await page.click(passwordElement).catch((error: string) => console.error(type, error))
	await page.keyboard.type(password).catch((error: string) => console.error(type, error))

	await page.keyboard.press(<any>String.fromCharCode(13)).catch((error: string) => console.error(type, error))

	if(loginButton)	await page.click(loginButton).catch((error: string) => console.error(type, error))
}

export const evaluate: StreamInvoker = async (page, { type, element = '', onResponse, accumulate, grab = 'textContent', log }, accumulator, tab = '  ') => {
	let response = await page
		.$$eval(element, (els: any[], grab: Streamlet['grab']) => els.map(el => grab ? el[grab] : el), grab) // evaluation happens in browser context, not in node context so grab has to be passed
		.catch((error: any) => console.error(type, error))

	if(onResponse) response = await onResponse(response, accumulator, tab)

	if(log?.date) {
		const date = log.date
			? new Date(Date.now()) + ': '
			: ''

		console.log(`  ${tab}└ ${date}${response}`)
	}

	if(accumulate) accumulator.push(response)
}

export const endpoints: StreamInvoker = async (page, streamlet, accumulator, tab) => {
	const {endpoints, timeout = 10000} = streamlet as Streamlet & { endpoints: string | string[], timeout?: number }
	const endpointArray = Array.isArray(endpoints) ? endpoints : [endpoints]

	const responses: HTTPResponse[] = await Promise.all(endpointArray.map(endpoint =>
		page.waitForResponse(endpoint, {timeout}).catch((e) => e.message)))

	const responseReturn = responses.reduce((acc, response, i) => {
		if (!response.url) return {
			...acc,
			[endpointArray[i]]: {
				status: 'error',
				timing: 'N/A',
				response
			}
		}

		const timing = response?.timing()

		return {
			...acc,
			[response.url()]: {
				status: response?.status(),
				timing: timing !== null ? `${(timing.sendEnd - timing.sendStart).toFixed(3)}ms` : 'N/A',
			}
		}
	}, {})

	if(streamlet.accumulate) accumulator.push(responseReturn)
	else {
		console.log(`  ${tab}└ endpoints result`, responseReturn)
	}

	return responseReturn
}
	
export const screenshot: StreamInvoker = async (page, streamlet, accumulator, tab) => {
	const path = streamlet.path || `screenshots/${(new Date).toISOString().split(':').shift()}-${randomUUID()}.png`
	await page.screenshot({path})
	console.log(`  ${tab}└ screenshot saved as ${path}`)
}

/* Streamlet Utilities */
export const run: StreamInvoker = async (page, streamlet, accumulator) => {// Last resort you can use this to run your own custom thing
	const rtn = streamlet.handle
		? await streamlet.handle(page, streamlet, accumulator)
		: null
	
	if(!rtn) console.warn(`• streamlet ${streamlet.type} has no handle function`)
	
	return rtn
}

export const accumulation: StreamInvoker = async (page, streamlet, accumulator) => 
	streamlet.handle
	? await streamlet.handle(page, streamlet, accumulator)
	: null


export default {
	// Simple
	page,
	goTo,
	wait,
	reload,
	click,
	keyboardPress,
	waitNetwork,
	// Compound
	login,
	evaluate,
	endpoints,
	screenshot,
	// Streamlet Utilities
	run,
	accumulation
}