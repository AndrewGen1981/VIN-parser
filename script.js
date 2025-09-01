const searchBtn = document.getElementById("submit-search")
if (searchBtn) searchBtn.disabled = true


const results = document.getElementById("results")
const writeResults = (text = "", isHTML = false) => {
    if (!results) return

    isHTML
    ? results.innerHTML = text
    : results.innerText = text

    results.classList.toggle("not-empty", text.length > 0)
}


let timer


const searchBar = document.getElementById("search")
if (searchBar) searchBar.addEventListener("input", () => {

    clearTimeout(timer)
    timer = setTimeout(() => {
        const len = searchBar.value?.length || 0
        
        if (!len) return writeResults()
        if (len !== 17) return writeResults(`VIN consists of 17 symbols, you entered ${ len }`)

        const testString = /^[a-zA-Z0-9]+$/.test(searchBar.value)
        if (!testString) return writeResults("VIN can contain only Latin letters, numbers, try again please")

        writeResults('You are good to go, click "Search" button to make a request')
        if (searchBtn) searchBtn.disabled = false
    }, 500)

})


if (searchBtn) searchBtn.addEventListener("click", async () => {
    searchBtn.disabled = true
    try {
        const VIN = searchBar?.value || null
        if (!VIN) throw new Error("VIN is required")

        const params = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${ VIN }?format=json`
        const result = await fetch(params)

        if (!result.ok) throw new Error(`HTTP error! status: ${ response.status }`)

        const { Message = "Unsuccessfully", SearchCriteria = VIN, Results = [] } = await result.json() || {}

        const applicable = []
        const notApplicable = []
        const nonApplReg = new RegExp(/notapplicable/i)

        for (const { Variable, Value } of Results) {
            if (Variable?.trim() && Value?.trim()) {
                const li = `<li><strong>${ Variable }</strong>${ Value }</li>`
                
                nonApplReg.test(Value.replace(/\s/g, ""))
                ? notApplicable.push(li)
                : applicable.push(li)
            }
        }

        const _header = Message.split("NOTE:")
        const header = _header[0] + (_header[1] ? `<p class="note"><strong>NOTE:</strong>${ _header[1] }` : "")

        let html = `<h3>${ header }</h3><h4><strong>Applicable to</strong>${ SearchCriteria } (${ applicable.length })</h4>`
        html += `<ol>${ applicable.join("") }</ol>`

        html += `<h4>not Applicable results (${ notApplicable.length }):</h4><ol class="not-applicable">${ notApplicable.join("") }</ol>`

        writeResults(html, true)

    } catch(error) {
        console.error(error)
        alert(error)
    } finally {
        searchBtn.disabled = false
    }
})