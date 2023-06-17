import { expect, test } from '@jest/globals'
import { parseFenceCodeParams } from './fencex'

test('test parseFenceCodeParams()', () => {
    // case 1
    let parsed = parseFenceCodeParams('{header="true"}')
    expect(parsed.get("header")).toBe(true)
    // case 2
    parsed = parseFenceCodeParams('{delimiter = "." header = "true"}')
    expect(parsed.get("delimiter")).toBe(".")
    expect(parsed.get("header")).toBe(true)
    // case 3
    parsed = parseFenceCodeParams('{delimiter = .. header = true}')
    expect(parsed.get("delimiter")).toBe("..")
    expect(parsed.get("header")).toBe(true)

    parsed = parseFenceCodeParams('{delimiter = = header = true}')
    expect(parsed.get("delimiter")).toBe("=")
    expect(parsed.get("header")).toBe(true)

    parsed = parseFenceCodeParams(`input {delimiter='.' header = true}`)
    expect(parsed.get("delimiter")).toBe(".")
    expect(parsed.get("header")).toBe(true)

    // case 4
    parsed = parseFenceCodeParams(`{delimiter='.' header = true}`)
    expect(parsed.get("delimiter")).toBe(".")
    expect(parsed.get("header")).toBe(true)

    // for fretboard
    parsed = parseFenceCodeParams(`{title="horizontal, 6 frets", type="h6"}`)
    expect(parsed.get("title")).toBe("horizontal, 6 frets")
    expect(parsed.get("type")).toBe("h6")
});