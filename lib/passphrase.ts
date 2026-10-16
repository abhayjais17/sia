const words = ["amber", "birch", "bloom", "breeze", "cedar", "cloud", "comet", "coral", "dawn", "delta", "dune", "echo", "ember", "fern", "fjord", "forest", "frost", "glade", "harbor", "haze", "indigo", "iris", "island", "jade", "lake", "lilac", "lotus", "lunar", "maple", "meadow", "mist", "moon", "moss", "nova", "ocean", "olive", "orbit", "pearl", "pine", "plum", "quartz", "rain", "reed", "river", "rose", "sage", "shore", "sky", "slate", "snow", "solar", "spark", "spruce", "star", "stone", "storm", "sun", "tide", "vale", "velvet", "violet", "wave", "willow", "zenith"]

export function generatePassphrase() {
  const random = crypto.getRandomValues(new Uint32Array(5))
  return [...Array.from(random.slice(0, 4), n => words[n % words.length]), random[4].toString(36).padStart(7, "0")].join("-")
}

export function isValidCode(code: string) {
  return code.trim().length >= 8 || /^\d{6,}$/.test(code)
}

export function getCodeStrength(code: string): 0 | 1 | 2 | 3 {
  if (!code) return 0
  const unique = new Set(code.toLowerCase()).size
  if (!isValidCode(code) || /^\d+$/.test(code) || unique < 4) return 1
  if (code.length < 16 || unique < 8) return 2
  return 3
}

export function createRoomLink(code: string) {
  return `${window.location.origin}/#code=${encodeURIComponent(code)}`
}
