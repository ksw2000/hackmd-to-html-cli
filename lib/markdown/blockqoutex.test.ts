import { test, expect } from '@jest/globals'
import { BlockquoteTokenProperty, parseBlockquoteParams } from './blockquotex'

test('test parseBlockquoteParams()', () => {
    const cases = [
        parseBlockquoteParams("[name=ChengHan Wu] [time=Sun, Jun 28, 2015 9:59 PM] [color=#907bf7]"),
        parseBlockquoteParams("[name= ChengHan Wu] [time= Sun, Jun 28, 2015 9:59 PM] [color= #907bf7]"),
        // The case below are not supported in the HackMD Online Editor, but it works fine in our package
        parseBlockquoteParams("[name = ChengHan Wu] [time = Sun, Jun 28, 2015 9:59 PM] [color = #907bf7]"),
        parseBlockquoteParams("[ name = ChengHan Wu] [ time = Sun, Jun 28, 2015 9:59 PM] [ color = #907bf7]"),
    ]
    for (let j = 0; j < cases.length; j++) {
        let checker = true
        for (let i = 0; i < cases[j].length; i++) {
            if (cases[j][i]?.property == BlockquoteTokenProperty.blockquoteXStart) {
                checker = checker && (cases[j][i + 1]?.property == BlockquoteTokenProperty.name && cases[j][i + 1]?.value == "ChengHan Wu")
                checker = checker && (cases[j][i + 2]?.property == BlockquoteTokenProperty.time && cases[j][i + 2]?.value == "Sun, Jun 28, 2015 9:59 PM")
                checker = checker && (cases[j][i + 3]?.property == BlockquoteTokenProperty.color && cases[j][i + 3]?.value == "#907bf7")
                checker = checker && (cases[j][i + 4]?.property == BlockquoteTokenProperty.blockquoteXEnd)
                break
            }
        }
        expect(checker).toBe(true)
    }

    const anotherCase = parseBlockquoteParams("[ name = ChengHan Wu ] [ time = Sun, Jun 28, 2015 9:59 PM ] [ color = #907bf7 ]")
    let checker = true
    for (let i = 0; i < anotherCase.length; i++) {
        if (anotherCase[i]?.property == BlockquoteTokenProperty.blockquoteXStart) {
            checker = checker && (anotherCase[i + 1]?.property == BlockquoteTokenProperty.name && anotherCase[i + 1]?.value == "ChengHan Wu ")
            checker = checker && (anotherCase[i + 2]?.property == BlockquoteTokenProperty.time && anotherCase[i + 2]?.value == "Sun, Jun 28, 2015 9:59 PM ")
            checker = checker && (anotherCase[i + 3]?.property == BlockquoteTokenProperty.color && anotherCase[i + 3]?.value == "#907bf7 ")
            checker = checker && (anotherCase[i + 4]?.property == BlockquoteTokenProperty.blockquoteXEnd)
            break
        }
    }

    expect(checker).toBe(true)
})