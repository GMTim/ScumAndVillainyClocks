import drawSegmentedCircle from "./clock.js"

$(() => {
    const worker = new ElementWorker()
    const events = new EventSource("https://darkclockapi.glitch.me/events/e3647b84-d25f-4dee-a0cc-dcfcd3f1b5bb", {})
    events.onmessage = (event) => {
        worker.update(JSON.parse(event.data))
    }
    events.onerror = (error) => {
        console.log(error)
    }
    console.log(events.readyState)
})
/**
 * @typedef {Object} SiteClocks
 * @property {string} id - The unique identifier for the website.
 * @property {string} name - The name or URL of the website.
 * @property {ClockGroup[]} clockGroups - Groups of related Clocks.
 */
/**
 * @typedef {Object} ClockGroup
 * @property {string} id - The unique identifier for the group.
 * @property {string} title - The title or name of the group.
 * @property {Clock[]} clocks - Clocks that belong to the group.
 */
/**
 * @typedef {Object} Clock
 * @property {string} id - The unique identifier for the data.
 * @property {string} title - The title or name of the data.
 * @property {number} totalSegments - The total number of segments.
 * @property {number} filledSegments - The number of filled segments.
 */

const Helpers = {
    /**
    * @param {JQuery<HTMLElement>[]} arr
    * @param {string} id
    * @returns {JQuery<HTMLElement>}
    */
    findById: (arr, id) => {
        return arr.filter(e => e.attr("id") === id)[0]
    },
    /**
     * 
     * @param {JQuery<HTMLElement>[]} eleArr 
     * @param {string[]} ids 
     */
    findMissing: (eleArr, ids) => {
        const eleIds = eleArr.map(e => e.attr("id"))
        const missing = eleIds.filter(e => !ids.includes(e))
        return eleArr.filter(e => missing.includes(e.attr("id")))
    }
}

const Att = {
    groupId: "groupId",
    segments: "segments",
    filled: "filled"
}

const ElementBuilder = {
    /**
    * @param {string} id
    * @param {string} text
    * @returns {JQuery<HTMLElement>}
    */
    navbar: (id, text) => {
        let item = $("<li></li>")
        item.addClass("nav-item")
        item.attr("id", id)
        let a = $("<a></a>")
        a.addClass("nav-link")
        a.text(text)
        a.attr("href", "#")
        item.append(a)
        return item
    },
    /**
     * @param {string} id
     * @param {string} groupId
     * @param {number} segments
     * @param {number} segmentsFilled
     * @param {string} src
     * @param {string} title
     * @returns {JQuery<HTMLElement>}
     */
    clock: (id, groupId, segments, segmentsFilled, src, title) => {
        let col = $("<div></div>")
        col.addClass("col")
        col.attr("id", id)
        col.attr(Att.groupId, groupId)
        col.attr(Att.segments, segments)
        col.attr(Att.filled, segmentsFilled)
        let card = $("<div></div>")
        card.addClass("card")
        col.append(card)
        let img = $("<img></img>")
        img.addClass("card-img-top")
        img.attr("src", src)
        card.append(img)
        let body = $("<div></div>")
        body.addClass("card-body")
        card.append(body)
        let th5 = $("<h5></h5>")
        th5.addClass("card-title")
        th5.text(title)
        body.append(th5)
        let p = $("<p></p>")
        p.addClass("card-text")
        p.text(`${segmentsFilled}/${segments}`)
        body.append(p)
        return col
    }
}

class ElementWorker {
    /**
     * @private
     * @type {NavBarController}
     */
    navbar
    /** 
     * @private
     * @type {JQuery<HTMLElement>[]} */
    groups = []
    /** 
     * @private
     * @type {JQuery<HTMLElement>[]} */
    clocks = []
    /** @private */
    elements = {
        topnav: $("#topnav"),
        clocks: $("#clocks")
    }
    /**
     * @private
     * @type {string}
    */
    activeGroup
    constructor() {
        this.navbar = new NavBarController((id) => {
            this.activeGroup = id
            this.showClocks(id)
        })
    }
    /** @param {SiteClocks} data */
    update(data) {
        this.updateGroups(data.clockGroups)
        this.updateClocks(data.clockGroups)
    }
    /**
     * @private
     * @param {ClockGroup[]} data */
    updateGroups(data) {
        const missingEles = Helpers.findMissing(this.groups, data.map(g => g.id))
        for (const ele of missingEles) {
            ele.remove()
            this.groups.splice(this.groups.indexOf(ele), 1)
        }
        for (const group of data) {
            let groupEle = Helpers.findById(this.groups, group.id)
            if (groupEle) {
                if (groupEle.children().text() != group.title) {
                    groupEle.children().text(group.title)
                }
            } else {
                groupEle = ElementBuilder.navbar(group.id, group.title)
                this.elements.topnav.append(groupEle)
                this.groups.push(groupEle)
                this.navbar.add(groupEle)
            }
        }
    }
    /**
     * @private
     * @param {ClockGroup[]} data */
    updateClocks(data) {
        const clocksArrs = data.map(obj => obj.clocks.map(c => c.id))
        /** @type {string[]} */
        const allClocksIds = [].concat(...clocksArrs)
        const missingClocks = Helpers.findMissing(this.clocks, allClocksIds)
        for (const clock of missingClocks) {
            clock.remove()
            this.clocks.splice(this.clocks.indexOf(clock), 1)
        }
        for (const group of data) {
            for (const clock of group.clocks) {
                let clockEle = Helpers.findById(this.clocks, clock.id)
                if (clockEle) {
                    if (clockEle.attr(Att.groupId) != clock.totalSegments ||
                    clockEle.attr(Att.segments) != clock.filledSegments ||
                    clockEle.find("h5").text() != clock.title) {
                        let src = drawSegmentedCircle({segments: clock.totalSegments, filledSegments: clock.filledSegments})
                        clockEle.attr(Att.segments, clock.segments)
                        clockEle.attr(Att.filled, clock.filledSegments)
                        clockEle.find("h5").text(clock.title)
                        clockEle.find("img").attr("src", src)
                        clockEle.find("p").text(`${clock.filledSegments}/${clock.totalSegments}`)
                    }
                } else {
                    let src = drawSegmentedCircle({segments: clock.totalSegments, filledSegments: clock.filledSegments})
                    clockEle = ElementBuilder.clock(
                        clock.id,
                        group.id,
                        clock.totalSegments,
                        clock.filledSegments,
                        src,
                        clock.title)
                    this.clocks.push(clockEle)
                }
            }
        }
        this.showClocks(this.activeGroup)
    }
    /**
     * @private
     * @param {string} id
    */
    showClocks(id) {
        let eles = this.clocks.filter(c => c.attr(Att.groupId) == id)
        this.elements.clocks.children().remove()
        this.elements.clocks.append(eles)
        this.elements.clocks.append($("<div class=\"col\"></div>"))
    }
}

class NavBarController {
    /**
     * @private
     * @type {(id: string) => void}
     */
    callback
    /**
     * @param {(id: string) => void} callback 
     */
    constructor(callback) {
        this.callback = callback
    }
    /** @param {JQuery<HTMLElement>} ele */
    add(ele) {
        if (this.active.length == 0) {
            this.setActive(ele.children())
            this.callback(ele.attr("id"))
        }
        ele.children().on("click", (event) => {
            event.preventDefault()
            this.setActive(ele.children())
            this.callback(ele.attr("id"))
        })
    }
    /** @returns {JQuery<HTMLElement>} */
    get active() {
        return $(".nav-link.active").first()
    }
    /** @param {JQuery<HTMLElement>} ele */
    setActive(ele) {
        this.active.removeClass("active")
        ele.addClass("active")
    }
}