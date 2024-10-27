import { useState, useEffect } from 'react'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Filter from './components/Filter'
import phonebookService from './services/phonebook'
import Notification from './components/Notification'
import './index.css'

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [nameSearch, setNameSearch] = useState('')
  const [showNotification, setShowNotification] = useState(null)
  const [messageType, setMessageType] = useState(null)

  useEffect(() => {
    phonebookService
      .getAll()
      .then(initialPhonebook => {
        setPersons(initialPhonebook)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    if (persons.some(person => person.name === newName)) {
      if (confirm(`${newName} is already added to the phonebook, replace the old number with a new one?`)) {
        const oldPersonData = persons.find(p => p.name === newName)
        const newPersonData = {...oldPersonData, number: newNumber}
        phonebookService
          .updatePhonenumber(newPersonData)
          .then(returnedPersonData => {
            setPersons(persons.map(person => person.id !== returnedPersonData.id ? person : newPersonData))
            setNewName('')
            setNewNumber('')
            setShowNotification(`Updated ${newName}`)
            setMessageType('success')
            setTimeout(() => {
              setShowNotification(null)
            }, 5000);
          })
          .catch(error => {
            if (error.response.status === 400) {
              setShowNotification(error.response.data.error)
            } else {
              setShowNotification(`Information of ${newName} has already been removed from server`)
              setPersons(persons.filter(person => person.id !== oldPersonData.id))
              setNewName('')
              setNewNumber('')
            }
            setMessageType('error')
            setTimeout(() => {
              setShowNotification(null)
            }, 5000)
          })          
      }
    } else {
      const personObject = {
        name: newName,
        number: newNumber,
      }
      phonebookService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          setShowNotification(`Added ${newName}`)
          setMessageType('success')
          setTimeout(() => {
            setShowNotification(null)
          }, 5000);
        })
        .catch(error => {
          setShowNotification(error.response.data.error)
          setMessageType('error')
          setTimeout(() => {
            setShowNotification(null)
          }, 5000)
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const personsToShow = nameSearch === '' ? persons : persons.filter(person => person.name.toLowerCase().includes(nameSearch.toLowerCase()))

  const handleNameSearch = (event) => {
    setNameSearch(event.target.value)
  }

  const handleDeletePerson = (id) => {
    const personToDelete = persons.find(p => p.id === id)
    if (confirm(`Delete ${personToDelete.name} ?`)) {
      phonebookService.deletePerson(id)
      setPersons(persons.filter(person => person.id !== id))
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={showNotification} messageType={messageType} />
      <Filter nameSearch={nameSearch} handleNameSearch={handleNameSearch} />
      <h2>add a new</h2>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      {personsToShow.map(person => <Persons key={person.id} name={person.name} number={person.number} removePerson={() => handleDeletePerson(person.id)} />)}
    </div>
  )
}

export default App