import type {Accumulator, Config, Stream} from "./types.ts";
import puppeteer, {Page} from 'puppeteer';
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
const init = async (config: Config[]) => {
	const userProcesses = config.map(async (userConfig: Config, i: number) => {
		console.info(createText.header(`Puppeteer ${i + 1} for ${userConfig.name || '[no name]'}`))

		const browserList = Array.from({length: userConfig.browsers}, () => puppeteer
			.launch(args.arm ? {...userConfig.puppeteer, executablePath: 'chromium-browser'} : userConfig.puppeteer)
			.catch((e: string) => console.error('If running on an ARM platform use --arm true', e))
		)

		const browsers = await Promise.all(browserList)

		const processes = browsers.map(async (browser, i) => {
			if (args.arm) console.info('Running in ARM mode using OS Browser (chromium-browser)')

			if (!browser) return console.error('No browser')

			console.info('• Browser Created')

			const pages = await browser.pages()
			const page = pages[0]

			if (!page) return console.error('No page')

			console.info('• Page Created')
			console.info('• Ready')
			console.info(createText.header('Starting Stream'))

			const result = await flow(page, userConfig.stream)

			console.info(createText.line())
			console.log('• accumulate result', result)
			console.info(createText.header('End of stream reached - closing'))

			await browser.close()
		})

		return await Promise.all(processes)
	})

	await Promise.all(userProcesses)
	
	process.exit()
}

const args = minimist(process.argv)

const configFile = './../' + (args.config || args.c || 'src/configs/config.ts')

console.log(`using config: ${configFile}`)

import(configFile)
	.then(({ default: config }: {default: Config[]}) => init(config))
	.catch(console.error)