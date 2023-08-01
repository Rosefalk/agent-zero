import type { Accumulator, Stream } from "./types.ts";
import puppeteer, {type Browser, Page, PuppeteerLaunchOptions} from 'puppeteer';
import minimist from 'minimist'
import {createText, mockPromise} from './utilities.ts'
import streams from "./streams.ts";

const flow = async (page: Page, stream: Stream, accumulator: Accumulator = [], tab = '') => {
	
	return stream.reduce(async (previousPromise: Promise<any>, streamlet) => {
		await previousPromise
		streamlet.type = <typeof streamlet['type']>streamlet.type.toLowerCase()

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
					: resolve(true)
			}

			loop()
		})

		await loopy()

		return accumulator
	}, Promise.resolve())
}

// support for raspberry pi
const init = async ({ default: config }: {default: Record<string, Stream>}) => {
	console.info(createText.header('Puppeteer'))

	if(args.arm)
		console.info('Running in ARM mode using OS Browser (chromium-browser)')

	const launchOptions: PuppeteerLaunchOptions = { headless: 'new' }
	const browser: Browser | void = await puppeteer
		.launch(args.arm ? { executablePath: 'chromium-browser', ...launchOptions } : launchOptions)
		.catch((e: string) => console.error('If running on an ARM platform use --arm true', e))

	if(!browser) return console.error('No browser')
	
	console.info('• Browser Created')

	const page = await browser.newPage().catch(console.error)
	
	if(!page) return console.error('No page')

	console.info('• Page Created')
	console.info('• Ready')
	console.info(createText.header('Starting Stream'))

	const result = await flow(page, config.stream)

	console.info(createText.line())
	console.log('• result', result)
	console.info(createText.header('End of stream reached - closing'))

	await browser.close()

	process.exit()
}

const args = minimist(process.argv.slice(2))

import(args.config || args.c || './configs/config.ts')
	.then(init)
	.catch(console.error)