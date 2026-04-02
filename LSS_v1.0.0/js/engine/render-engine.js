// render-engine.js

// Universal list renderer
// NEW: সব page এই function ব্যবহার করবে
export function renderList(containerId, list, template, limit = null){

const container = document.getElementById(containerId)

if(!container) return

if(!Array.isArray(list) || list.length === 0){
container.innerHTML = "<p>No records</p>"
return
}

let html = ""

// NEW: limit থাকলে infinite scroll support
const data = limit ? list.slice(0, limit) : list

data.forEach(item=>{
html += template(item)
})

container.innerHTML = html

}