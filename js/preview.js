function Preview(dest) {
    this.container = dest

    this.screen = document.createElement("canvas")
    this.screen.width = Beatmap.WIDTH
    this.screen.height = Beatmap.HEIGHT
    this.ctx = this.screen.getContext("2d")
    this.container.appendChild(this.screen)

    var self = this
    this.background = new Image()
    // to avoid "Tainted canvases may not be exported." error
    // https://stackoverflow.com/a/45129760
    this.background.setAttribute("crossorigin", "anonymous")
    this.background.addEventListener("load", function () {
        // prevent loadsthis.src !== self.bgURL background infinity
        if (!/^(http)/i.test(this.src) && this.src !== self.bgURL) return

        var canvas = document.createElement("canvas")
        canvas.width = self.screen.width
        canvas.height = self.screen.height
        var ctx = canvas.getContext("2d")

        // background-size: cover height
        var sWidth = this.height * (self.screen.width / self.screen.height)
        ctx.drawImage(this, (this.width - sWidth) / 2, 0, sWidth, this.height,
            0, 0, self.screen.width, self.screen.height)
        // background dim
        ctx.fillStyle = "rgba(0, 0, 0, .4)"
        ctx.fillRect(0, 0, self.screen.width, self.screen.height)

        if (typeof self.beatmap.processBG != "undefined") {
            self.beatmap.processBG(ctx)
        }

        canvas.toBlob(function (blob) {
            var url = URL.createObjectURL(blob)
            self.background.src = url
            self.container.style.backgroundImage = `url("${url}")`
            // mandatory?
            // URL.revokeObjectURL(url);
        })
    })
    this.background.addEventListener("error", function () {
        self.container.style.backgroundImage = "none"
    })
}

Preview.prototype.load = async function (osu, bgURL, success, fail) {
    var self = this
    try {
        self.beatmap = Beatmap.parse(osu)
        self.bgURL = bgURL
        self.background.src = bgURL
        self.ctx.restore()
        self.ctx.save()
        self.beatmap.update(self.ctx)
        self.at(0)

        if (typeof success == "function") {
            success.call(self)
        }
    }
    catch (e) {
        if (typeof fail == "function") {
            fail.call(self, e)
        }
    }
}

Preview.prototype.at = function (time) {
    this.ctx.save()
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, Beatmap.WIDTH, Beatmap.HEIGHT)
    this.ctx.restore()
    this.beatmap.draw(time, this.ctx)
}