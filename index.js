/**
 * Simple script to make text elements on the page editable,
 * and to save and restore the page across page loads.
 * 
 * Note: if running on the file:// protocol, some browsers may
 * disable access to localStorage.
 */
(function() {
    var VERSION = 1.0;

    // Source https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
    function htmlToElement(html) {
        var documentFragment = document.createDocumentFragment();
        var template = document.createElement('template');
        template.innerHTML = html.trim();
        for (var i = 0, e = template.content.childNodes.length; i < e; i++) {
            documentFragment.appendChild(template.content.childNodes[i].cloneNode(true));
        }
        return documentFragment;
    }

    function supportsLocalStorage() {
        if (!('localStorage' in window)) return false;
        try {
            localStorage.setItem('test', 'true');
            localStorage.getItem('test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    var hasLocalStorage = supportsLocalStorage();

    function savePage() {
        localStorage.setItem('page', escape(document.getElementById('save').innerHTML));
    }

    function getSavedPage() {
        var pageStr = localStorage.getItem('page');
        if (!(pageStr && pageStr.length)) return null;
        return unescape(pageStr);
    }

    function restoreSavedPage() {
        var savedPage = getSavedPage();
        if (savedPage) {
            document.getElementById('save').innerHTML = savedPage;
        }
    }

    // Source https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
    function download(data, filename, type) {
        var file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) { // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        } else { // Others
            var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 0); 
        }
    }

    // Clone HTML node, but remove extraneous elements and make read-only
    function getPageContents() {
        var baseEl = document.documentElement.cloneNode(true);
        var elsToRemove = baseEl.querySelectorAll('script, iframe, #document-controls, #github-link');
        for (var i = 0, e = elsToRemove.length; i < e; i++) {
            elsToRemove[i].parentElement.removeChild(elsToRemove[i]);
        }

        var elsToReset = baseEl.querySelectorAll('[contenteditable]');
        for (var i = 0, e = elsToReset.length; i < e; i++) {
            elsToReset[i].removeAttribute('contenteditable');
        }

        return baseEl.innerHTML;
    }

    function getButtonActions() {
        return {
            'clear': function(e) {
                requestAnimationFrame(function() {
                    if (hasLocalStorage) {
                        localStorage.clear();
                        location.reload();
                    }
                });
            },
            'print': function(e) {
                requestAnimationFrame(function() {
                    window.print();
                });
            },
            'save': function(e) {
                var pageStr = getPageContents();
                download(pageStr, 'resume.html', 'text/html; charset=UTF-8');
            }
        };
    }

    function addDocumentControls() {
        var docControlsStr =
            `<!-- Document control buttons-->
            <div id="document-controls">
                <button data-action="clear" title="Remove saved draft">Clear draft</button>
                <button data-action="save" title="Download as HTML">Save HTML</button>
                <button data-action="print" title="Print">Print</button>
            </div>
            <div id="github-link">     
                <a class="github-button" href="https://github.com/Tombarr/html-resume-template" data-size="large" data-show-count="true" aria-label="Star Tombarr/html-resume-template on GitHub">Star</a>
            </div>`;
        var docControls = htmlToElement(docControlsStr);
        document.body.appendChild(docControls);
    }

    function bindDocumentControls() {
        var actions = getButtonActions();
        var docControls = document.getElementById('document-controls');
        var buttons = docControls.querySelectorAll('button[data-action]');
        for (var i = 0, e = buttons.length; i < e; i++) {
            if (buttons[i].dataset.action in actions) {
                buttons[i].addEventListener('click', actions[buttons[i].dataset.action]);
            }
        }
    }

    function makeEditable() {
        var editableNodes = document.querySelectorAll('p, span, ul.editable, ol.editable, ul:not(.editable) li, ol:not(.editable) li, time, h1, h2, h3, h4, h5, h6, address');
        for (var i = 0, e = editableNodes.length; i < e; i++) {
            var node = editableNodes[i];
            node.setAttribute('contenteditable', 'true');

            if (hasLocalStorage) {
                node.addEventListener('blur', savePage);
            }
        }
    }

    if (hasLocalStorage) {
        restoreSavedPage();
        addDocumentControls();
        bindDocumentControls();
    }

    makeEditable();
})();