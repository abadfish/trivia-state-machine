/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import {
	createMachine,
	state,
	state as final,
	transition,
	guard,
	reduce
} from 'robot3'
import { createUseMachine } from 'robot-hooks'


export const STATE = {
	easy: 'easy',
	medium: 'medium',
	hard: 'hard',
	won: 'won',
	lost: 'lost'
}

export const levelStates = [
	STATE.easy,
	STATE.medium,
	STATE.hard
]

export const ACTION_TYPES = {
	levelChange: 'levelChange'
}

export const ACTIONS = {
	levelChange: (payload = {}) => {
	return ({
		payload,
		type: ACTION_TYPES.levelChange
	})
}
}

const createInitialContext = ({
	difficulty = 'easy',
	totalQuestionCount = 0
} = {}) => ({
	difficulty,
	totalQuestionCount
})

const lostThree = (ctx, {payload}) => {
	console.log('payload.wrong', payload.wrong)
	return payload.wrong === 3
}
const wonThree = (ctx, {payload}) => {
	console.log('payload.correct', payload.correct)
	return payload.correct === 3
}

export const useMachine = createUseMachine(useEffect, useState)

export const triviaMachine = createMachine(
	{
		[STATE.easy]: state(
			transition(
				ACTION_TYPES.levelChange,
				STATE.medium,
				guard(wonThree),
				reduce((ctx, {payload}) => ({
					...ctx,
					totalQuestionCount: payload.totalQuestionCount
				})),
			),
			transition(
				ACTION_TYPES.levelChange,
				STATE.lost,
				guard(lostThree),
				reduce((ctx) => ({
					...ctx
				})),
			),
		),
		[STATE.medium]: state(
			transition(
				ACTION_TYPES.levelChange,
				STATE.easy,
				guard(lostThree),
				reduce((ctx) => ({
					...ctx
				})),
			),
			transition(
				ACTION_TYPES.levelChange,
				STATE.hard,
				guard(wonThree),
				reduce((ctx) => ({
					...ctx
				})),
			),
		),
		[STATE.hard]: state(
			transition(
				ACTION_TYPES.levelChange,
				STATE.won,
				guard(wonThree),
				reduce((ctx) => ({
					...ctx
				})),
			),
			transition(
				ACTION_TYPES.levelChange,
				STATE.medium,
				guard(lostThree),
				reduce((ctx) => ({
					...ctx
				})),
			),
		),
		[STATE.won]: final(),
		[STATE.lost]: final()
	},
	createInitialContext
)