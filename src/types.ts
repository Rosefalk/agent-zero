import {Page} from "puppeteer";

export interface Config {
	stream: Stream
}

export type Accumulator = unknown[]

export type Streamlet = {
	type: 'page' | 'wait' | 'reload' | 'click' | 'keyboardPress' | 'login' | 'evaluate' | 'run' | 'accumulation',
	accumulate?: boolean,
	grab?: string,
	log?: { date: boolean },
	stream?: Stream,
	handle?: StreamInvoker,
	onResponse?: (response: unknown, accumulator: Accumulator, tab: string) => Promise<void>,
	[key: string]: any,
}

export interface StreamInvoker {
	(page: Page, streamlet: Streamlet, accumulator: Accumulator, tab?: string): Promise<void | unknown>
}

export type Stream = Streamlet[]
