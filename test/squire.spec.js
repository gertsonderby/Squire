/*global Squire, sinon, unexpected, unexpectedSinon, describe, afterEach, beforeEach, it */
(function () {
'use strict';

var expect = unexpected.clone()
    .installPlugin(unexpected.dom)
    .installPlugin(unexpectedSinon)
    .addType({
        name: 'SquireRTE',
        base: 'object',
        identify: function (value) {
            return value instanceof Squire;
        },
        inspect: function (value, depth, output) {
            return output.text('Squire RTE: ').code(value.getHTML(), 'html');
        }
    })
    .addAssertion('<DOMElement> with br tags stripped <assertion>', function (expect, subject) {
        Array.prototype.forEach.call(subject.querySelectorAll('br'), function (brElement) {
            brElement.parentNode.removeChild(brElement);
        });
        return expect.shift(subject, 0);
    })
    .addAssertion('<SquireRTE> [not] to contain HTML [with br tags stripped] <string|object>', function (expect, editor, expectedValue) {
        if (!Array.isArray(expectedValue)) {
            expectedValue = [expectedValue];
        }
        return expect(editor.getDocument().body,
            'with br tags stripped',
            '[not] to satisfy',
            {
                name: 'body',
                children: expectedValue
            });
        })
    .addAssertion('<SquireRTE> [not] to fire <string> <function>', function (expect, editor, event, activity) {
        this.errorMode = 'nested';
        return expect.promise(function (run) {
            var handlerSpy = sinon.spy();
            var resolution = run(function () {
                expect(handlerSpy, 'was [not] called');
            });
            var setup = function () {
                editor.addEventListener(event, handlerSpy);
                activity();
                setTimeout(resolution, 2);
            };
            setTimeout(setup, 2);
        });
    });

window.expect = expect;

function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
}

describe('Squire RTE', function () {
    var doc, editor, iframe;
    beforeEach(function (done) {
        iframe = document.createElement('iframe');
        iframe.id = 'testFrame';
        iframe.style.visibility = 'hidden';
        iframe.addEventListener('load', function () {
            doc = iframe.contentDocument;
            editor = new Squire(doc);
            done();
        });
        document.body.appendChild(iframe);
    });

    function selectAll(editor) {
        var range = doc.createRange();
        range.setStart(doc.body.childNodes[0], 0);
        range.setEnd(doc.body.childNodes[doc.body.childNodes.length - 1], doc.body.childNodes[doc.body.childNodes.length - 1].childNodes.length);
        editor.setSelection(range);
    }

    describe('addEventListener', function () {
        describe('focus', function () {});
        describe('blur', function () {});
        describe('keydown', function () {});
        describe('keyup', function () {});
        describe('keypress', function () {});

        describe('input', function () {
            it('invokes handler when editor content is changed', function () {
                var startHTML = '<div>aaa</div>';
                editor.setHTML(startHTML);
                expect(editor, 'to contain HTML', startHTML);
                // doc.body.childNodes.item(0).appendChild( doc.createTextNode('bbb'));
                var range = doc.createRange();
                var node = doc.body.childNodes.item(0);
                range.setStart(node, 0);
                range.setEnd(node, node.childNodes.length);
                editor.setSelection(range);
                return expect(editor, 'to fire', 'input', function () {
                    editor.bold();
                });
            });
        });

        describe('pathChange', function () {});
        describe('select', function () {});
        describe('undoStateChange', function () {});
        describe('willPaste', function () {});
    });

    describe('removeEventListener', function () {});
    describe('setKeyHandler', function () {});
    describe('focus', function () {});
    describe('blur', function () {});
    describe('getDocument', function () {});
    describe('getHTML', function () {});
    describe('setHTML', function () {});
    describe('getSelectedText', function () {});
    describe('insertImage', function () {});
    describe('insertHTML', function () {});
    describe('getPath', function () {});
    describe('getFontInfo', function () {});
    describe('getSelection', function () {});
    describe('setSelection', function () {});
    describe('moveCursorToStart', function () {});
    describe('moveCursorToEnd', function () {});
    describe('undo', function () {});
    describe('redo', function () {});

    describe('hasFormat', function () {
        var startHTML;
        beforeEach( function () {
            startHTML = '<div>one <b>two three</b> four <i>five</i></div>';
            editor.setHTML(startHTML);
        });

        it('returns false when range not touching format', function () {
            var range = doc.createRange();
            range.setStart(doc.body.childNodes.item(0), 0);
            range.setEnd(doc.body.childNodes.item(0), 1);
            editor.setSelection(range);
            expect(editor.hasFormat('b'), 'to be false');
        });

        it('returns false when range inside other format', function () {
            var range = doc.createRange();
            range.setStart(doc.querySelector('i').childNodes[0], 1);
            range.setEnd(doc.querySelector('i').childNodes[0], 2);
            editor.setSelection(range);
            expect(editor.hasFormat('b'), 'to be false');
        });

        it('returns false when range covers anything outside format', function () {
            var range = doc.createRange();
            range.setStart(doc.querySelector('b').previousSibling, 2);
            range.setEnd(doc.querySelector('b').childNodes[0], 8);
            editor.setSelection(range);
            expect(editor.hasFormat('b'), 'to be false');
        });

        it('returns true when range inside format', function () {
            var range = doc.createRange();
            range.setStart(doc.querySelector('b').childNodes[0], 2);
            range.setEnd(doc.querySelector('b').childNodes[0], 8);
            editor.setSelection(range);
            expect(editor.hasFormat('b'), 'to be true');
        });

        it('returns true when range covers start of format', function () {
            var range = doc.createRange();
            range.setStartBefore(doc.querySelector('b'));
            range.setEnd(doc.querySelector('b').childNodes[0], 8);
            editor.setSelection(range);
            expect(editor.hasFormat('b'), 'to be true');
        });

        it('returns true when range covers start of format, even in weird cases', function () {
            var range = doc.createRange();
            var prev = doc.querySelector('b').previousSibling;
            range.setStart(prev, prev.length);
            range.setEnd(doc.querySelector('b').childNodes[0], 8);
            editor.setSelection(range);
            expect(editor.hasFormat('b'), 'to be true');
        });

        it('returns true when range covers end of format', function () {
            var range = doc.createRange();
            range.setStart(doc.querySelector('b').childNodes[0], 2);
            range.setEndAfter(doc.querySelector('b'));
            editor.setSelection(range);
            expect(editor.hasFormat('b'), 'to be true');
        });

        it('returns true when range covers end of format, even in weird cases', function () {
            var range = doc.createRange();
            range.setStart(doc.querySelector('b').childNodes[0], 2);
            var next = doc.querySelector('b').nextSibling;
            range.setEnd(next, 0);
            editor.setSelection(range);
            expect(editor.hasFormat('b'), 'to be true');
        });

        it('returns true when range covers all of format', function () {
            var range = doc.createRange();
            range.setStartBefore(doc.querySelector('b'));
            range.setEndAfter(doc.querySelector('b'));
            editor.setSelection(range);
            expect(editor.hasFormat('b'), 'to be true');
        });
    });

    describe('bold', function () {});
    describe('italic', function () {});
    describe('underline', function () {});
    describe('removeBold', function () {});
    describe('removeItalic', function () {});
    describe('removeUnderline', function () {});
    describe('makeLink', function () {});
    describe('removeLink', function () {});
    describe('setFontFace', function () {});
    describe('setFontSize', function () {});
    describe('setTextColour', function () {});
    describe('setHighlightColour', function () {});
    describe('setTextAlignment', function () {});
    describe('setTextDirection', function () {});
    describe('forEachBlock', function () {});
    describe('modifyBlocks', function () {});
    describe('increaseQuoteLevel', function () {});
    describe('decreaseQuoteLevel', function () {});

    ['unordered', 'ordered'].forEach(function (listType) {
        var listTag = listType[0] + 'l';
        var makeFuncName = 'make' + capitalize(listType) + 'List';
        describe(makeFuncName, function () {
            it('turns elements into a list', function () {
                var startHTML = '<div>one</div><div>two</div>';
                editor.setHTML(startHTML);
                selectAll(editor);
                editor[makeFuncName]();
                expect(editor, 'to contain HTML', [{
                        name: listTag,
                        children: [
                            { name: 'li', textContent: 'one' },
                            { name: 'li', textContent: 'two' }
                        ]
                    },
                    { name: 'div', textContent: '' }
                ]);
            });
        });
    });

    describe('removeList', function () {});
    describe('increaseListLevel', function () {});
    describe('decreaseListLevel', function () {});

    describe('makePreformatted', function () {
        it('adds a PRE element around text on same line', function () {
            var startHTML = '<div>one two three four five</div>';
            editor.setHTML(startHTML);
            editor.moveCursorToStart();
            editor.makePreformatted();
            expect(editor, 'to contain HTML', [
                { name: 'pre', textContent: 'one two three four five\n' },
                { name: 'div', textContent: '' }
            ]);
        });

        it('adds an empty PRE element', function () {
            var startHTML = '<div></div><div>one two three four five</div>';
            editor.setHTML(startHTML);
            editor.moveCursorToStart();
            editor.makePreformatted();
            expect(editor, 'to contain HTML', [
                { name: 'pre', textContent: '\n' },
                { name: 'div', textContent: 'one two three four five' }
            ]);
        });

        it('wraps PRE tag around plain-text-ified contents of blocks', function () {
            var startHTML = '<div>one two</div><p>three four</p><blockquote>five</blockquote>';
            editor.setHTML(startHTML);
            selectAll(editor);
            editor.makePreformatted();
            expect(editor, 'to contain HTML', [
                { name: 'pre', textContent: 'one two\nthree four\nfive\n' },
                { name: 'div', textContent: '' }
            ]);
        });

        it('expands existing PRE tags to encompass selection', function () {
            var startHTML = '<div>abc</div><div></div><pre>one two three four five</pre><div></div>';
            editor.setHTML(startHTML);
            selectAll(editor);
            editor.makePreformatted();
            expect(editor, 'to contain HTML', [
                { name: 'pre', textContent: 'abc\n\none two three four five\n\n' },
                { name: 'div', textContent: '' }
            ]);
        });
    });

    describe('removePreformatted', function () {
        it('replaces selected PRE tags with their HTML-ified content', function () {
            var startHTML = '<pre>abc\n\none two three four five\n</pre>';
            editor.setHTML(startHTML);
            selectAll(editor);
            editor.removePreformatted();
            expect(editor, 'to contain HTML', [
                { name: 'div', textContent: 'abc' },
                { name: 'div', textContent: 'one two three four five' },
                { name: 'div', textContent: '' }
            ]);
        });

        it('cuts the beginning off PRE tags', function () {
            var startHTML = '<pre>abc\n\none two three four five\n</pre>';
            editor.setHTML(startHTML);
            var range = doc.createRange();
            range.setStart(doc.querySelector('pre').childNodes[0], 0);
            range.setEnd(doc.querySelector('pre').childNodes[0], 18);
            editor.setSelection(range);
            editor.removePreformatted();
            expect(editor, 'to contain HTML', [
                { name: 'div', textContent: 'abc' },
                { name: 'div', textContent: 'one two three' },
                { name: 'pre', textContent: ' four five\n' },
                { name: 'div', textContent: '' }
            ]);
        });

        it('cuts the end off PRE tags', function () {
            var startHTML = '<pre>abc\n\none two three four five\n</pre>';
            editor.setHTML(startHTML);
            var range = doc.createRange();
            range.setStart(doc.querySelector('pre').childNodes[0], 18);
            range.setEnd(doc.querySelector('pre').childNodes[0], 29);
            editor.setSelection(range);
            editor.removePreformatted();
            expect(editor, 'to contain HTML', [
                { name: 'pre', textContent: 'abc\n\none two three' },
                { name: 'div', textContent: ' four five' },
                { name: 'div', textContent: '' }
            ]);
        });

        describe('with collapsed selection', function () {
            beforeEach(function () {
                var startHTML = '<pre>abc\n\none two three four five\nxyz</pre>';
                editor.setHTML(startHTML);
            });

            it('expands selection to the whole line', function () {
                var range = doc.createRange();
                range.setStart(doc.querySelector('pre').childNodes[0], 24);
                range.setEnd(doc.querySelector('pre').childNodes[0], 24);
                editor.setSelection(range);
                editor.removePreformatted();
                expect(editor, 'to contain HTML', [
                    { name: 'pre', textContent: 'abc\n' },
                    { name: 'div', textContent: 'one two three four five' },
                    { name: 'pre', textContent: 'xyz' },
                    { name: 'div', textContent: '' }
                ]);
            });

            it('... even when on first line of tag', function () {
                var range = doc.createRange();
                range.setStart(doc.querySelector('pre').childNodes[0], 2);
                range.setEnd(doc.querySelector('pre').childNodes[0], 2);
                editor.setSelection(range);
                editor.removePreformatted();
                expect(editor, 'to contain HTML', [
                    { name: 'div', textContent: 'abc' },
                    { name: 'pre', textContent: '\none two three four five\nxyz' },
                    { name: 'div', textContent: '' }
                ]);
            });

            it('... or on last line of tag', function () {
                var range = doc.createRange();
                range.setStart(doc.querySelector('pre').childNodes[0], 31);
                range.setEnd(doc.querySelector('pre').childNodes[0], 31);
                editor.setSelection(range);
                editor.removePreformatted();
                expect(editor, 'to contain HTML', [
                    { name: 'pre', textContent: 'abc\n\none two three four five' },
                    { name: 'div', textContent: 'xyz' },
                    { name: 'div', textContent: '' }
                ]);
            });
        });
    });

    describe('removeAllFormatting', function () {
        // Trivial cases
        it('removes inline styles', function () {
            var startHTML = '<div><i>one</i> <b>two</b> <u>three</u> <sub>four</sub> <sup>five</sup></div>';
            editor.setHTML(startHTML);
            selectAll(editor);
            editor.removeAllFormatting();
            expect(editor, 'to contain HTML', {
                name: 'div',
                children: [
                    'one two three four five'
                ]});
        });
        it('removes block styles', function () {
            var startHTML = '<div><blockquote>one</blockquote><ul><li>two</li></ul>' +
                '<ol><li>three</li></ol><table><tbody><tr><th>four</th><td>five</td></tr></tbody></table></div>';
            editor.setHTML(startHTML);
            selectAll(editor);
            editor.removeAllFormatting();
            expect(editor, 'to contain HTML', [
                { name: 'div', textContent: 'one' },
                { name: 'div', textContent: 'two' },
                { name: 'div', textContent: 'three' },
                { name: 'div', textContent: 'four' },
                { name: 'div', textContent: 'five' }
            ]);
        });

        // Potential bugs
        it('removes styles that begin inside the range', function () {
            var startHTML = '<div>one <i>two three four five</i></div>';
            editor.setHTML(startHTML);
            var range = doc.createRange();
            range.setStart(doc.body.childNodes[0], 0);
            range.setEnd(doc.getElementsByTagName('i')[0].childNodes[0], 4);
            editor.removeAllFormatting(range);
            expect(editor, 'to contain HTML', {
                name: 'div',
                children: [
                    'one two ',
                    { name: 'i', textContent: 'three four five' }
                ]});
        });

        it('removes styles that end inside the range', function () {
            var startHTML = '<div><i>one two three four</i> five</div>';
            editor.setHTML(startHTML);
            var range = doc.createRange();
            range.setStart(doc.getElementsByTagName('i')[0].childNodes[0], 13);
            range.setEnd(doc.body.childNodes[0], doc.body.childNodes[0].childNodes.length);
            editor.removeAllFormatting(range);
            expect(editor, 'to contain HTML', {
                name: 'div',
                children: [
                    { name: 'i' , textContent: 'one two three' },
                    ' four five'
                ]});
        });

        it('removes styles enclosed by the range', function () {
            var startHTML = '<div>one <i>two three four</i> five</div>';
            editor.setHTML(startHTML);
            var range = doc.createRange();
            range.setStart(doc.body.childNodes[0], 0);
            range.setEnd(doc.body.childNodes[0], doc.body.childNodes[0].childNodes.length);
            editor.removeAllFormatting(range);
            expect(editor, 'to contain HTML', {
                name: 'div',
                children: [
                    'one two three four five'
                ]});
        });

        it('removes styles enclosing the range', function () {
            var startHTML = '<div><i>one two three four five</i></div>';
            editor.setHTML(startHTML);
            var range = doc.createRange();
            range.setStart(doc.getElementsByTagName('i')[0].childNodes[0], 4);
            range.setEnd(doc.getElementsByTagName('i')[0].childNodes[0], 18);
            editor.removeAllFormatting(range);
            expect(editor, 'to contain HTML', {
                name: 'div',
                children: [
                    { name: 'i', textContent: 'one ' },
                    'two three four',
                    { name: 'i', textContent: ' five' }
                ]});
        });

        it('removes nested styles and closes tags correctly', function () {
            var startHTML = '<table><tbody><tr><td>one</td></tr><tr><td>two</td><td>three</td></tr><tr><td>four</td><td>five</td></tr></tbody></table>';
            editor.setHTML(startHTML);
            var range = doc.createRange();
            range.setStart(doc.getElementsByTagName('td')[1], 0);
            range.setEnd(doc.getElementsByTagName('td')[2], doc.getElementsByTagName('td')[2].childNodes.length);
            editor.removeAllFormatting(range);
            expect(editor, 'to contain HTML', [
                    '<table><tbody><tr><td>one</td></tr></tbody></table>',
                    '<div>two</div>',
                    '<div>three</div>',
                    '<table><tbody><tr><td>four</td><td>five</td></tr></tbody></table>'
                ]);
        });
    });

    afterEach(function () {
        editor = null;
        document.body.removeChild( iframe );
        iframe = null;
    });
});

})();
