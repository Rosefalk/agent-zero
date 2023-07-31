import puppeteer from 'puppeteer';
import minimist from 'minimist'

import * as streams from './streams.ts'
import { createText } from './utilities.ts'
import {Page} from "puppeteer/lib/esm/puppeteer/common/Page.js";

const mockPromise = (time: number) => new Promise((resolve) => {
	const interval: NodeJS.Timeout = setInterval(() => resolve( () => clearInterval(interval)), time)
})

const flow = async (page: Page, stream, accumulator = [], tab = '') => {
	return await stream.reduce(async (previousPromise, streamlet) => {
		await previousPromise
		streamlet.type = streamlet.type.toLowerCase()

		const run = async () => {
			console.log(`${tab}> ${streamlet.type}${streamlet.url ? ': ' + streamlet.url : ''}`)

			streams[streamlet.type]
				? await streams[streamlet.type](page, streamlet, accumulator, tab)
				: console.warn(`• unsuported stream type ${streamlet.type}: skipping`)

			if(Array.isArray(streamlet.stream))
				await flow(page, streamlet.stream, accumulator, tab + '  ')
		}

		const loopy = () => new Promise((resolve) => {
			let loopCounter = 0
			const loop = async () => {
				await run()
				await mockPromise(streamlet.loop ? streamlet.loop.time : 0)

				streamlet.loop &&
					(streamlet.loop.loops === -1 || ++loopCounter < streamlet.loop.loops)
					? loop()
					: resolve()
			}

			loop()
		})

		await loopy()

		return accumulator
	}, Promise.resolve())
}

const init = async ({ default: config }) => {
	console.info(createText.header('Puppeteer'))

	if(args.arm)
		console.info('Running in ARM mode using OS Browser (chromium-browser)')

	const browser = await puppeteer
		.launch(args.arm ? { executablePath: 'chromium-browser' } : {})
		.catch(e => console.error('If running on an ARM platform use --arm true', e))

	console.info('• Browser Created')

	const page = await browser.newPage().catch(console.error)

	console.info('• Page Created')
	console.info('• Ready')
	console.info(createText.header('Starting Stream'))

	const result = await flow(page, config.stream)

	console.info(createText.line())
	console.log('• result', result)
	console.info(createText.header('End of stream reached - closing'))

	await browser.close()
}

const args = minimist(process.argv.slice(2))

import(args.config || args.c || './configs/config.js')
	.then(init)
	.catch(console.error)