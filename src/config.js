
const config = {
    taxonSuggestUrl : 'https://api.gbif.org/v1/species/suggest',
    phylonextWebservice: 'http://localhost:9000/phylonext',
    authWebservice: 'http://localhost:9000/auth'
}


const prod = {
    taxonSuggestUrl : 'https://api.gbif.org/v1/species/suggest',
    phylonextWebservice:  'http://phylonext-vh.gbif.org:9000/phylonext', 
    authWebservice: 'http://phylonext-vh.gbif.org:9000/auth'
}

export default prod;