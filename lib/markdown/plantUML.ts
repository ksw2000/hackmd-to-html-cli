const deflate = require('deflate-js')

export class PlantUML {
    private encode6bit(b: number): string {
        if (b < 10) {
            return String.fromCharCode(48 + b);
        }
        b -= 10;
        if (b < 26) {
            return String.fromCharCode(65 + b);
        }
        b -= 26;
        if (b < 26) {
            return String.fromCharCode(97 + b);
        }
        b -= 26;
        if (b == 0) {
            return '-';
        }
        if (b == 1) {
            return '_';
        }
        return '?';
    }

    private append3bytes(b1: number, b2: number, b3: number) {
        const c1 = b1 >> 2;
        const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
        const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
        const c4 = b3 & 0x3F;
        let r = "";
        r += this.encode6bit(c1 & 0x3F);
        r += this.encode6bit(c2 & 0x3F);
        r += this.encode6bit(c3 & 0x3F);
        r += this.encode6bit(c4 & 0x3F);
        return r;
    }

    private encode64(data: string) {
        let r = '';
        for (let i = 0; i < data.length; i += 3) {
            if (i + 2 == data.length) {
                r += this.append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
            } else if (i + 1 == data.length) {
                r += this.append3bytes(data.charCodeAt(i), 0, 0);
            } else {
                r += this.append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1),
                    data.charCodeAt(i + 2));
            }
        }
        return r;
    }

    public generateURL(value: string) {
        const encoded = new TextEncoder().encode(value);
        const compressedCharArray = deflate.deflate(encoded, 9);
        const compressed = String.fromCharCode.apply(null, compressedCharArray)
        return this.encode64(compressed);
    }
}