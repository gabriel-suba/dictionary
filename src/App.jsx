import { useState } from 'react'
import './index.css'

function App() {
  const [query, setQuery] = useState("")
  const [wordObj, setWordObj] = useState(null)
  const [notFound, setNotFound] = useState(false)

  async function handleGoTo(word) {
    setQuery(word)
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    const data = await res.json()

    let phoneticText = ""
    let phoneticAudio = ""
    
    // organizing phonetics object because api returns inconsistent data structure
    for (let i = 0; i < data[0].phonetics.length; i++) {
      const curr = data[0].phonetics[i]

      if (phoneticText.length > 0 && phoneticAudio.length > 0) break

      if (curr.text) {
        phoneticText = curr.text
      }

      if (curr.audio) {
        phoneticAudio = curr.audio
      }
    }

    setWordObj({...data[0], phonetics: { audio: phoneticAudio, text: phoneticText }})
  }

  function handlePlayAudio() {
    const audioLink = wordObj.phonetics.audio

    if (audioLink === undefined) return

    const audio = new Audio(audioLink)
    audio.play()
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (query === "") return

    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`)
    const data = await res.json()

    if (data[0] === undefined) {
      setNotFound(true)
      return
    }

    let phoneticText = ""
    let phoneticAudio = ""
    
    // organizing phonetics object because api returns inconsistent data structure
    for (let i = 0; i < data[0].phonetics.length; i++) {
      const curr = data[0].phonetics[i]

      if (phoneticText.length > 0 && phoneticAudio.length > 0) break

      if (curr.text) {
        phoneticText = curr.text
      }

      if (curr.audio) {
        phoneticAudio = curr.audio
      }
    }

    if (notFound === true) setNotFound(false)
    setWordObj({...data[0], phonetics: { audio: phoneticAudio, text: phoneticText }})
  }

  return (
    <div className="App">
      <nav className="nav container">
        <img src="/book.svg" alt="an icon of book" height={35} width={35} />
        <h1>Dictionary</h1>
      </nav>

      <form onSubmit={handleSubmit} className="search container">
        <input type="text" onChange={(e) => setQuery(e.target.value)} value={query} placeholder="Search a word..." required />
        <button type="submit">
          <img src="/search.svg" alt="an icon of search button" height={25} width={25} />
        </button>
      </form>
      {notFound  && 
      <div className="error container">
        <span>The word you are looking for does not exists.</span>
      </div>
      }

      {wordObj &&
      <>
        <section className="word container">
          <div className="left">
            <h1>{wordObj.word}</h1>
            <h2>{wordObj.phonetics.text}</h2>
          </div>
          {wordObj.phonetics.audio !== "" &&
          <div onClick={handlePlayAudio} className="right">
            <img src="/play_arrow.svg" alt="an icon of play button" />
          </div>
          }
        </section>

        {wordObj.meanings.map((meaning, index) => (
        <section className="meaning container" key={index}>
          <div className="part-of-speech">
            <h3>{meaning.partOfSpeech}</h3>
            <div className="divider"></div>
          </div>

          <div className="definitions">
            <h4>Meaning</h4>
            <ul>
            {meaning.definitions.map((definitionItem, index) => (
              <li key={index}>
                <div className="definition">{definitionItem.definition}</div>
                {definitionItem.example && <div className="example">{definitionItem.example}</div>}
              </li>
            ))}
            </ul>
          </div>

          {meaning.synonyms.length > 0 && 
          <div className="nyms">
            <h4 className="header">Synonyms</h4>
            <div className="list">
              {meaning.synonyms.map((synonym, index) => <h4 onClick={() => handleGoTo(synonym)} key={index}>{synonym}</h4>)}
            </div>
          </div>
          }

          {meaning.antonyms.length > 0 && 
          <div className="nyms">
            <h4 className="header">Antonyms</h4>
            <div className="list">
              {meaning.antonyms.map((antonym, index) => <h4 onClick={() => handleGoTo(antonym)} key={index}>{antonym}</h4>)}
            </div>
          </div>
          }
        </section>
        ))}
      </>
      }
    </div>
  )
}

export default App
