const Filter = ( {nameSearch, handleNameSearch} ) => {
  return (
    <div>
      filter shown with
      <input
        value={nameSearch}
        onChange={handleNameSearch}
      />
    </div>
  )
}

export default Filter