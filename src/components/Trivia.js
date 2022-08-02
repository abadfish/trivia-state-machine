/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useMachine, triviaMachine, ACTIONS, levelStates } from '../state/triviaMachine'

export const Trivia = () => {

	const [questions, setQuestions] = useState([])
	const [questionCount, setQuestionCount] = useState(0)
	const [correctCount, setCorrectCount] = useState(0)
	const [wrongCount, setWrongCount] = useState(0)
	const [state, send] = useMachine(triviaMachine)

	console.log('state.context.totalQuestionCount', state.context.totalQuestionCount)

	const fetchQuestions = async () => {
		const url = `https://opentdb.com/api.php?amount=20&category=18&difficulty=${state.name}`
		const res = await fetch(url)
		const questions = await res.json()
		setQuestions(questions.results)
	};

	const resetCounts = () => {
		setCorrectCount(0)
		setWrongCount(0)
	}

	useEffect(() => {
		if (levelStates.includes(state.name)) {
			resetCounts()
			fetchQuestions()
		}
	}, [state.name])

	const decodeString = (string) => {
		const parser = new DOMParser();
		const decodedString = parser.parseFromString(`<!doctype html><body>${string}`, 'text/html').body.textContent;
		return decodedString
	}

	const [response, setResponse] = useState(null);
	const currentQuestion = questions[questionCount]

	const possibleResponses = currentQuestion && 
		[...currentQuestion?.incorrect_answers, currentQuestion?.correct_answer]
		.sort((a, b) => a < b)

	const judgeResponse = e => {
		e.preventDefault()
		if (response === currentQuestion?.correct_answer) {
			alert("Right!")
			setCorrectCount(correctCount => correctCount + 1)
		} else {
			alert("Wrong!")
			setWrongCount(wrongCount => wrongCount + 1)
		}
		setQuestionCount(questionCount => questionCount + 1)
	}

	useEffect(() => {
		if (correctCount === 3 || wrongCount === 3) {
			send(ACTIONS.levelChange({correct: correctCount, wrong: wrongCount, totalQuestionCount: questionCount}))
		}
	}, [correctCount, wrongCount])

	const onSelectValue = e => {
		setResponse(e.target.value)
	}
	return (
		<Game>	
			<Stats>
				<Stat fontColor="lightblue">Level: <span>{ state.name }</span></Stat>
				<div></div>
				<Stat fontColor="green">Won: <span> { correctCount}</span></Stat>
				<div></div>
				<Stat fontColor="red">Lost: <span> { wrongCount}</span></Stat>
			</Stats>
			<GameState>
				<div>
					<Question>{ currentQuestion && decodeString(currentQuestion?.question) }</Question>

					{ currentQuestion ? 
					<form onSubmit={ judgeResponse }>
						<Answers>
							{possibleResponses?.map((r, i) => (
								<label key={i}>
									<input 
										type='radio' 
										value={r} 
										onChange={ onSelectValue } 
										checked={response === r}
									/>
									{decodeString(r)}
								</label>
							))}		
						<button type='submit'>Submit</button>
						</Answers>		
					</form>
					:
					null
					}
				</div>
			</GameState>

		</Game>
	)
};

const Game = styled.div `
	margin: 5rem;
`
const GameState = styled.div `

`
const Stats = styled.section `
	width: 100%;
	display: inline-grid;
	grid-template-columns: 2fr 1fr 2fr 1fr 2fr;
	margin-bottom: 2rem;
`
const Stat = styled.div `
	display: flex;
	justify-content: space-around;
	color: ${props => props.fontColor};
`
const Question = styled.div `
	margin: 1rem;
	width: 100%;
	display: flex;
	justify-content: center;

`
const Answers = styled.div `
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	label {
		width: 100%;
		display: flex;
		justify-content: center;
	}
	button {
		margin-top: 1rem;
		width: 200px;
	} 
		
`
// {
// 	"category": "Science: Computers",
// 	"type": "multiple",
// 	"difficulty": "easy",
// 	"question": "What does CPU stand for?",
// 	"correct_answer": "Central Processing Unit",
// 	"incorrect_answers": [
// 		"Central Process Unit",
// 		"Computer Personal Unit",
// 		"Central Processor Unit"
// 	]
// },