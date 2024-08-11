import React, { useEffect, useState } from 'react';
import styles from './App.module.css';

export const App = () => {
	const [taskList, setTaskList] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [refreshTaskFlag, setRefreshTaskFlag] = useState(false);
	const [task, setTask] = useState('');
	const [searchPhrase, setSearchPhrase] = useState('');
	const [sortAlphabetically, setSortAlphabetically] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingTask, setEditingTask] = useState(null);

	useEffect(() => {
		setIsLoading(true);
		fetch('http://localhost:3005/task')
			.then((loadedData) => loadedData.json())
			.then((loadedTask) => {
				setTaskList(loadedTask);
			})
			.catch((error) => {
				console.error('Ошибка загрузки задач:', error);
			})
			.finally(() => setIsLoading(false));
	}, [refreshTaskFlag]);

	const handleInputChange = (e) => {
		setTask(e.target.value);
	};

	const handleSearchInputChange = (e) => {
		setSearchPhrase(e.target.value);
	};

	const requestAddTask = () => {
		fetch('http://localhost:3005/task', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json;charset=utf-8' },
			body: JSON.stringify({
				title: task,
			}),
		})
			.then((rawResponse) => rawResponse.json())
			.then((newTask) => {
				setTaskList((prevList) => [...prevList, newTask]);
				setTask('');
				setRefreshTaskFlag(!refreshTaskFlag); // Refresh flag as needed
			})
			.catch((error) => {
				console.error('Ошибка добавления задачи:', error);
			});
	};

	const requestChangeTask = (id) => {
		fetch(`http://localhost:3005/task/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json;charset=utf-8' },
			body: JSON.stringify({
				title: task,
			}),
		})
			.then((rawResponse) => rawResponse.json())
			.then((updatedTask) => {
				setTaskList((prevList) =>
					prevList.map((item) => (item.id === id ? updatedTask : item)),
				);
				setTask('');
				setIsEditing(false);
				setEditingTask(null);
			})
			.catch((error) => {
				console.error('Ошибка изменения задачи:', error);
			});
	};

	const requestDeleteTask = (id) => {
		fetch(`http://localhost:3005/task/${id}`, {
			method: 'DELETE',
		})
			.then(() => {
				setTaskList((prevList) => prevList.filter((item) => item.id !== id));
			})
			.catch((error) => {
				console.error('Ошибка удаления задачи:', error);
			});
	};

	const handleSortTasks = () => {
		setSortAlphabetically((prev) => !prev);
	};

	const filteredTasks = taskList.filter((task) =>
		task.title.toLowerCase().includes(searchPhrase.toLowerCase()),
	);

	const sortedTasks = sortAlphabetically
		? [...filteredTasks].sort((a, b) => a.title.localeCompare(b.title))
		: filteredTasks;

	const startEditing = (task) => {
		setIsEditing(true);
		setTask(task.title);
		setEditingTask(task);
	};

	const cancelEditing = () => {
		setIsEditing(false);
		setTask('');
		setEditingTask(null);
	};

	return (
		<div className={styles.app}>
			<form>
				<input
					name="task"
					type="text"
					placeholder="Введите новую задачу"
					value={task}
					onChange={handleInputChange}
				/>
				<button
					type="button"
					onClick={
						isEditing
							? () => requestChangeTask(editingTask.id)
							: requestAddTask
					}
				>
					{isEditing ? 'Сохранить' : 'Добавить новую задачу'}
				</button>
				{isEditing && (
					<button type="button" onClick={cancelEditing}>
						Отменить
					</button>
				)}
			</form>
			<button onClick={handleSortTasks}>
				{sortAlphabetically ? 'Сбросить сортировку' : 'Сортировать по алфавиту'}
			</button>
			<input
				type="text"
				placeholder="Поиск по задачам"
				value={searchPhrase}
				onChange={handleSearchInputChange}
			/>
			<ul className="taskList">
				{isLoading ? (
					<div className={styles.loader}></div>
				) : (
					sortedTasks.map(({ id, title }) => (
						<li key={id}>
							{title}{' '}
							<button onClick={() => startEditing({ id, title })}>
								Изменить
							</button>{' '}
							<button onClick={() => requestDeleteTask(id)}>Удалить</button>
						</li>
					))
				)}
			</ul>
		</div>
	);
};
