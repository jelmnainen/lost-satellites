import { get }  from 'axios'

var { dataUrl, radius: radiusStr } = require('../config.json')
const radius = Number(radiusStr)

const { sin, cos, pow, sqrt, PI } = Math

get(dataUrl).then((response) => {
    const data: string = response.data.toString()

    let rows :string[] = data.split('\n')
    const seed = rows.shift().replace('#SEED: ', '')
    const [,latStart,longStart,latEnd, longEnd] = rows.pop().split(',')
    const route = {
        start: new Node(latStart, longStart, 0, 'START'),
        end: new Node(latEnd, longEnd, 0, 'END')
    }
    let satellites = rows.map(row => {
        const [name, lat, long, alt] = row.split(',')
        return new Node(lat, long, alt, name)
    })
    satellites.push(route.end)
    let stack = [route.start]
    while(!!stack.length) {
        const cur = stack.pop()
        if (cur.visited)continue
        cur.visited = true
        if (cur.name==='END'){
            console.log('SEED', seed)
            pr(cur)
            break
        }

        const neighbors = satellites.filter(s => connection(cur, s))
        neighbors.forEach(n => n.prev=cur)
        stack = stack.concat(neighbors)
        console.log(cur.name, 'got ', neighbors.length, 'neighbors', neighbors.map(n => n.name))
    }
}).catch(err => {
    console.log('There was an error loading response from server', err)
})
let printer = {}
function pr(node: Node) {
    if (!node || node===node.prev) return
    if (printer[node.name])return
    printer[node.name] = true
    console.log(node.name)
    pr(node.prev)

}


function connection(startPoint: Node, satellite: Node, reverse: boolean = false): boolean {
    if (startPoint === satellite) return false
    const start = getEcef(startPoint)
    const end = getEcef(satellite)

    const x = end.x - start.x
    const y = end.y - start.y
    const z = end.z - start.z

    const len = sqrt(pow(x,2)+pow(y,2)+pow(z,2))


    const unitVec = {
        x: x/len,
        y: y/len,
        z: z/len
    }

    // https://en.wikipedia.org/wiki/Line%E2%80%93sphere_intersection
    // (unitVec * start)^2 - start^2 + r^2
    const firs = unitVec.x * start.x + unitVec.y * start.y + unitVec.z * start.z
    const first = pow(firs, 2)

    const second = pow(start.x, 2) + pow(start.y,2) + pow(start.z,2)
    const third = pow(radius, 2)

    const val = first - second + third

    return val < 0 || firs > 0 || (!reverse && connection(satellite, startPoint, true))
}

// https://en.wikipedia.org/wiki/Geographic_coordinate_conversion
// assuming perfect sphere
function getEcef(node: Node) {
    function toRad(degrees: number): number {
        return degrees * PI / 180
    }
    const {alt, long: longDeg, lat: latDeg} = node
    const long = toRad(longDeg)
    const lat = toRad(latDeg)

    const x = (alt + radius) * cos(lat) * cos(long)
    const y = (alt + radius) * cos(lat) * sin(long)
    const z = (alt + radius) * sin(lat)
    return {x, y, z}
}



class Node {
    lat: number
    long: number
    alt: number
    name: string
    visited: boolean = false
    prev: Node

    constructor(lat, long, alt, name: string) {
        this.lat = Number(lat)
        this.long = Number(long)
        this.alt = Number(alt)
        this.name = name
    }
}